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

export const getCategories = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const categories = await prisma.category.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        _count: { select: { products: true } },
      },
    });

    successResponse(res, "Categories retrieved", categories.map((c) => ({
      ...c,
      productsCount: c._count.products,
    })));
  } catch (error) {
    console.error("Get categories error:", error);
    errorResponse(res, "Failed to get categories", 500);
  }
};

export const createCategory = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const body = req.body as Record<string, unknown>;
    const name = (body.name as string) || "";
    const slug = (body.slug as string) || "";
    const description = body.description as string | undefined;
    const imageUrl = body.imageUrl as string | undefined;
    const isActive = body.isActive as boolean | undefined;

    if (!name || !slug) {
      throw new AppError("Name and slug are required", 400);
    }

    const existing = await prisma.category.findUnique({ where: { slug } });
    if (existing) {
      throw new AppError("Category with this slug already exists", 409);
    }

    const category = await prisma.category.create({
      data: { name, slug, description, imageUrl, isActive },
    });

    successResponse(res, "Category created successfully", category, 201);
  } catch (error) {
    if (error instanceof AppError) {
      errorResponse(res, error.message, error.statusCode);
      return;
    }
    console.error("Create category error:", error);
    errorResponse(res, "Failed to create category", 500);
  }
};

export const updateCategory = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const id = String(req.params.id);
    const body = req.body as Record<string, unknown>;
    const name = body.name as string | undefined;
    const slug = body.slug as string | undefined;
    const description = body.description as string | undefined;
    const imageUrl = body.imageUrl as string | undefined;
    const isActive = body.isActive as boolean | undefined;

    const existing = await prisma.category.findUnique({ where: { id } });
    if (!existing) {
      throw new AppError("Category not found", 404);
    }

    if (slug && slug !== existing.slug) {
      const slugExists = await prisma.category.findUnique({ where: { slug } });
      if (slugExists) {
        throw new AppError("Category with this slug already exists", 409);
      }
    }

    const category = await prisma.category.update({
      where: { id },
      data: { name, slug, description, imageUrl, isActive },
    });

    if (existing.imageUrl && imageUrl !== undefined && imageUrl !== existing.imageUrl) {
      await removeManagedImagesIfUnused([existing.imageUrl]);
    }

    successResponse(res, "Category updated successfully", category);
  } catch (error) {
    if (error instanceof AppError) {
      errorResponse(res, error.message, error.statusCode);
      return;
    }
    console.error("Update category error:", error);
    errorResponse(res, "Failed to update category", 500);
  }
};

/**
 * Sets which products belong to a category. Every product needs a category, so listed products are
 * moved here from wherever they are, and products taken out of this category fall back to "Uncategorized"
 * (the same fallback deleteCategory uses).
 */
export const setCategoryProducts = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const id = String(req.params.id);
    const productIds = [...new Set((req.body.productIds as string[]) || [])];

    const category = await prisma.category.findUnique({ where: { id } });
    if (!category) throw new AppError("Category not found", 404);

    const found = await prisma.product.count({ where: { id: { in: productIds } } });
    if (found !== productIds.length) throw new AppError("One or more products were not found", 400);

    const result = await prisma.$transaction(async (tx) => {
      const leaving = await tx.product.count({ where: { category: category.name, id: { notIn: productIds } } });
      let removed = 0;
      if (leaving > 0) {
        if (category.slug === "uncategorized") {
          throw new AppError("Products can't be removed from Uncategorized — assign them to another category instead", 400);
        }
        await tx.category.upsert({
          where: { name: "Uncategorized" },
          update: {},
          create: { name: "Uncategorized", slug: "uncategorized", isActive: false },
        });
        removed = (await tx.product.updateMany({
          where: { category: category.name, id: { notIn: productIds } },
          data: { category: "Uncategorized" },
        })).count;
      }
      const added = await tx.product.updateMany({
        where: { id: { in: productIds }, category: { not: category.name } },
        data: { category: category.name },
      });
      return { added: added.count, removed };
    });

    successResponse(res, "Category products updated", { ...result, productsCount: productIds.length });
  } catch (error) {
    if (error instanceof AppError) {
      errorResponse(res, error.message, error.statusCode);
      return;
    }
    console.error("Set category products error:", error);
    errorResponse(res, "Failed to update category products", 500);
  }
};

export const deleteCategory = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const id = String(req.params.id);

    const category = await prisma.category.findUnique({
      where: { id },
      include: { _count: { select: { products: true } } },
    });

    if (!category) {
      throw new AppError("Category not found", 404);
    }

    if (category.slug === "uncategorized") {
      throw new AppError("The fallback category cannot be deleted", 400);
    }

    await prisma.$transaction(async (tx) => {
      await tx.category.upsert({
        where: { name: "Uncategorized" },
        update: {},
        create: { name: "Uncategorized", slug: "uncategorized", isActive: false },
      });
      await tx.product.updateMany({
        where: { category: category.name },
        data: { category: "Uncategorized" },
      });
      await tx.category.delete({ where: { id } });
    });
    if (category.imageUrl) await removeManagedImagesIfUnused([category.imageUrl]);

    successResponse(res, "Category deleted successfully");
  } catch (error) {
    if (error instanceof AppError) {
      errorResponse(res, error.message, error.statusCode);
      return;
    }
    console.error("Delete category error:", error);
    errorResponse(res, "Failed to delete category", 500);
  }
};
