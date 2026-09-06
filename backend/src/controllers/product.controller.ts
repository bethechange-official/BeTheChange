import { Response } from "express";
import { prisma } from "../config/db";
import { AuthenticatedRequest } from "../middleware/auth.middleware";
import { successResponse, errorResponse } from "../utils/apiResponse";
import { AppError } from "../middleware/error.middleware";
import { removeManagedImagesIfUnused } from "../middleware/upload";

const getQueryString = (val: unknown): string | undefined => {
  if (!val) return undefined;
  if (Array.isArray(val)) return val[0] as string;
  if (typeof val === 'object') return undefined;
  return val as string;
};

const getQueryInt = (val: unknown, defaultVal: number): number => {
  const str = getQueryString(val);
  if (!str) return defaultVal;
  const parsed = parseInt(str, 10);
  return isNaN(parsed) ? defaultVal : parsed;
};

export const getProducts = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const page = getQueryInt(req.query.page, 1);
    const limit = Math.min(100, Math.max(1, getQueryInt(req.query.limit, 20)));
    const skip = (page - 1) * limit;

    const search = getQueryString(req.query.search);
    const category = getQueryString(req.query.category);
    const collection = getQueryString(req.query.collection);
    const isActive = getQueryString(req.query.isActive);
    const stockStatus = getQueryString(req.query.stockStatus);
    const requestedSort = getQueryString(req.query.sort) || "createdAt";
    const sort = ["createdAt", "updatedAt", "name", "price", "stock"].includes(requestedSort) ? requestedSort : "createdAt";
    const order = getQueryString(req.query.order) === "asc" ? "asc" : "desc";

    const where: Record<string, unknown> = {};

    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { slug: { contains: search, mode: "insensitive" } },
        { category: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
      ];
    }

    if (category) where.category = category;
    if (collection) where.collection = collection;
    if (isActive !== undefined) where.isActive = isActive === "true";

    if (stockStatus) {
      switch (stockStatus) {
        case "LOW":
          where.stock = { lte: 5, gt: 0 };
          break;
        case "OUT":
          where.stock = 0;
          break;
        case "IN":
          where.stock = { gt: 5 };
          break;
      }
    }

    const orderBy: Record<string, "asc" | "desc"> = {
      [sort]: order,
    };

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        skip,
        take: limit,
        orderBy,
        include: {
          images: { orderBy: { sortOrder: "asc" } },
        },
      }),
      prisma.product.count({ where }),
    ]);

    const formattedProducts = products.map((p) => ({
      ...p,
      price: Number(p.price),
      originalPrice: p.originalPrice ? Number(p.originalPrice) : null,
      images: p.images.map((img) => img.url),
    }));

    successResponse(res, "Products retrieved", formattedProducts, 200, {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    console.error("Get products error:", error);
    errorResponse(res, "Failed to get products", 500);
  }
};

export const getProductById = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const id = String(req.params.id);

    const product = await prisma.product.findUnique({
      where: { id },
      include: {
        images: { orderBy: { sortOrder: "asc" } },
      },
    });

    if (!product) {
      throw new AppError("Product not found", 404);
    }

    successResponse(res, "Product retrieved", {
      ...product,
      price: Number(product.price),
      originalPrice: product.originalPrice ? Number(product.originalPrice) : null,
      images: product.images.map((img) => img.url),
    });
  } catch (error) {
    if (error instanceof AppError) {
      errorResponse(res, error.message, error.statusCode);
      return;
    }
    console.error("Get product by ID error:", error);
    errorResponse(res, "Failed to get product", 500);
  }
};

export const createProduct = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const body = req.body as Record<string, unknown>;
    const name = body.name as string;
    const slug = body.slug as string;
    const category = body.category as string;
    const collection = body.collection ? String(body.collection) : null;
    const skinConcern = body.skinConcern as string | undefined;
    const price = body.price as number;
    const originalPrice = body.originalPrice as number | undefined;
    const stock = body.stock as number;
    const size = body.size as string;
    const shortDescription = body.shortDescription as string | undefined;
    const description = body.description as string | undefined;
    const ingredients = body.ingredients as string | undefined;
    const benefits = body.benefits as string | undefined;
    const usageInstructions = body.usageInstructions as string | undefined;
    const isFeatured = body.isFeatured === true || body.isFeatured === "true";
    const isActive = body.isActive === true || body.isActive === "true";
    const images = body.images as string[] | undefined ?? [];

    if (!name || !slug || !category || price === undefined || stock === undefined) {
      throw new AppError("Missing required fields", 400);
    }

    const [categoryExists, collectionExists] = await Promise.all([
      prisma.category.findUnique({ where: { name: category } }),
      collection ? prisma.collection.findUnique({ where: { name: collection } }) : Promise.resolve(null),
    ]);
    if (!categoryExists) throw new AppError("Selected category does not exist", 400);
    if (collection && !collectionExists) throw new AppError("Selected collection does not exist", 400);

    const existingSlug = await prisma.product.findUnique({ where: { slug } });
    if (existingSlug) {
      throw new AppError("Product with this slug already exists", 409);
    }

    const product = await prisma.$transaction(async (tx) => {
      const newProduct = await tx.product.create({
        data: {
          name,
          slug,
          category,
          collection,
          skinConcern,
          price: price ?? 0,
          originalPrice,
          stock: stock ?? 0,
          size,
          shortDescription,
          description,
          ingredients,
          benefits,
          usageInstructions,
          isFeatured,
          isActive,
        },
      });

      if (images.length > 0) {
        await tx.productImage.createMany({
          data: images.map((url: string, index: number) => ({
            productId: newProduct.id,
            url,
            sortOrder: index,
          })),
        });
      }

      return tx.product.findUnique({
        where: { id: newProduct.id },
        include: { images: { orderBy: { sortOrder: "asc" } } },
      });
    });

    successResponse(res, "Product created successfully", {
      ...product!,
      price: Number(product!.price),
      originalPrice: product!.originalPrice ? Number(product!.originalPrice) : null,
      images: product!.images.map((img) => img.url),
    }, 201);
  } catch (error) {
    if (error instanceof AppError) {
      errorResponse(res, error.message, error.statusCode);
      return;
    }
    console.error("Create product error:", error);
    errorResponse(res, "Failed to create product", 500);
  }
};

export const updateProduct = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const id = String(req.params.id);
    const body = req.body as Record<string, unknown>;
    const name = body.name as string | undefined;
    const slug = body.slug as string | undefined;
    const category = body.category as string | undefined;
    const collection = body.collection === undefined ? undefined : body.collection ? String(body.collection) : null;
    const skinConcern = body.skinConcern as string | undefined;
    const price = body.price as number | undefined;
    const originalPrice = body.originalPrice as number | undefined;
    const stock = body.stock as number | undefined;
    const size = body.size as string | undefined;
    const shortDescription = body.shortDescription as string | undefined;
    const description = body.description as string | undefined;
    const ingredients = body.ingredients as string | undefined;
    const benefits = body.benefits as string | undefined;
    const usageInstructions = body.usageInstructions as string | undefined;
    const isFeatured = body.isFeatured as boolean | undefined;
    const isActive = body.isActive as boolean | undefined;
    const images = body.images as string[] | undefined;

    const existingProduct = await prisma.product.findUnique({ where: { id }, include: { images: true } });
    if (!existingProduct) {
      throw new AppError("Product not found", 404);
    }

    if (category && !(await prisma.category.findUnique({ where: { name: category } }))) {
      throw new AppError("Selected category does not exist", 400);
    }
    if (collection && !(await prisma.collection.findUnique({ where: { name: collection } }))) {
      throw new AppError("Selected collection does not exist", 400);
    }

    if (slug && slug !== existingProduct.slug) {
      const existingSlug = await prisma.product.findUnique({ where: { slug } });
      if (existingSlug) {
        throw new AppError("Product with this slug already exists", 409);
      }
    }

    const product = await prisma.$transaction(async (tx) => {
      const updated = await tx.product.update({
        where: { id },
        data: {
          name,
          slug,
          category,
          collection,
          skinConcern,
          price,
          originalPrice,
          stock,
          size,
          shortDescription,
          description,
          ingredients,
          benefits,
          usageInstructions,
          isFeatured,
          isActive,
        },
      });

      if (images !== undefined) {
        await tx.productImage.deleteMany({ where: { productId: id } });
        if (images.length > 0) {
          await tx.productImage.createMany({
            data: images.map((url: string, index: number) => ({
              productId: id,
              url,
              sortOrder: index,
            })),
          });
        }
      }

      return tx.product.findUnique({
        where: { id },
        include: { images: { orderBy: { sortOrder: "asc" } } },
      });
    });

    if (images !== undefined) {
      await removeManagedImagesIfUnused(existingProduct.images.map((image) => image.url).filter((url) => !images.includes(url)));
    }

    successResponse(res, "Product updated successfully", {
      ...product!,
      price: Number(product!.price),
      originalPrice: product!.originalPrice ? Number(product!.originalPrice) : null,
      images: product!.images.map((img) => img.url),
    });
  } catch (error) {
    if (error instanceof AppError) {
      errorResponse(res, error.message, error.statusCode);
      return;
    }
    console.error("Update product error:", error);
    errorResponse(res, "Failed to update product", 500);
  }
};

export const deleteProduct = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const id = String(req.params.id);

    const product = await prisma.product.findUnique({ where: { id }, include: { images: true } });
    if (!product) {
      throw new AppError("Product not found", 404);
    }

    await prisma.$transaction(async (tx) => {
      await tx.productImage.deleteMany({ where: { productId: id } });
      await tx.cartItem.deleteMany({ where: { productId: id } });
      await tx.product.delete({ where: { id } });
    });
    await removeManagedImagesIfUnused(product.images.map((image) => image.url));

    successResponse(res, "Product deleted successfully");
  } catch (error) {
    if (error instanceof AppError) {
      errorResponse(res, error.message, error.statusCode);
      return;
    }
    console.error("Delete product error:", error);
    errorResponse(res, "Failed to delete product", 500);
  }
};
