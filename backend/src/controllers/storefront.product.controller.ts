import { Response } from "express";
import { Prisma } from "@prisma/client";
import { prisma } from "../config/db";
import { AuthenticatedRequest } from "../middleware/auth.middleware";
import { AppError } from "../middleware/error.middleware";
import { errorResponse, successResponse } from "../utils/apiResponse";
import { getQueryInt, getQueryString } from "../utils/query";
import { formatProduct, productInclude } from "../utils/storefront";

export const listStorefrontProducts = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  res.set("Cache-Control", "public, max-age=60, stale-while-revalidate=30");
  const page = Math.max(1, getQueryInt(req.query.page, 1));
  const limit = Math.min(48, Math.max(1, getQueryInt(req.query.limit, 12)));
  const search = getQueryString(req.query.search)?.trim();
  const category = getQueryString(req.query.category);
  const collection = getQueryString(req.query.collection);
  const skinConcern = getQueryString(req.query.skinConcern);
  const sort = getQueryString(req.query.sort);
  const minPrice = Number(getQueryString(req.query.minPrice));
  const maxPrice = Number(getQueryString(req.query.maxPrice));

  const filters: Prisma.ProductWhereInput[] = [];
  if (search) filters.push({ OR: [
    { name: { contains: search, mode: "insensitive" } },
    { shortDescription: { contains: search, mode: "insensitive" } },
    { category: { contains: search, mode: "insensitive" } },
  ] });
  if (category) filters.push({ OR: [{ category }, { categoryRel: { slug: category } }] });
  if (collection) filters.push({ OR: [{ collection }, { collectionRel: { slug: collection } }] });
  if (skinConcern) filters.push({ skinConcern });
  if (Number.isFinite(minPrice) || Number.isFinite(maxPrice)) {
    filters.push({ price: {
      ...(Number.isFinite(minPrice) ? { gte: Math.max(0, minPrice) } : {}),
      ...(Number.isFinite(maxPrice) ? { lte: Math.max(0, maxPrice) } : {}),
    } });
  }
  const where: Prisma.ProductWhereInput = { isActive: true, ...(filters.length ? { AND: filters } : {}) };

  const orderBy: Prisma.ProductOrderByWithRelationInput = sort === "price-asc"
    ? { price: "asc" }
    : sort === "price-desc"
      ? { price: "desc" }
      : sort === "name"
        ? { name: "asc" }
        : sort === "featured"
          ? { isFeatured: "desc" }
          : { createdAt: "desc" };

  const [products, totalProducts] = await Promise.all([
    prisma.product.findMany({ where, skip: (page - 1) * limit, take: limit, orderBy, include: productInclude }),
    prisma.product.count({ where }),
  ]);
  successResponse(res, "Products retrieved", {
    products: products.map(formatProduct),
    currentPage: page,
    totalPages: Math.ceil(totalProducts / limit),
    totalProducts,
  });
};

export const listFeaturedProducts = async (_req: AuthenticatedRequest, res: Response): Promise<void> => {
  res.set("Cache-Control", "public, max-age=60, stale-while-revalidate=30");
  const products = await prisma.product.findMany({
    where: { isActive: true, isFeatured: true },
    take: 12,
    orderBy: { createdAt: "desc" },
    include: productInclude,
  });
  successResponse(res, "Featured products retrieved", { products: products.map(formatProduct) });
};

export const getStorefrontProduct = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  res.set("Cache-Control", "public, max-age=120, stale-while-revalidate=60");
  try {
    const identifier = String(req.params.slug);
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(identifier);

    const product = await prisma.product.findFirst({
      where: {
        OR: [
          ...(isUuid ? [{ id: identifier }] : []),
          { slug: identifier },
        ],
        isActive: true,
      },
      include: productInclude,
    });
    if (!product) throw new AppError("Product not found", 404);
    successResponse(res, "Product retrieved", { product: formatProduct(product) });
  } catch (error) {
    if (error instanceof AppError) return void errorResponse(res, error.message, error.statusCode);
    throw error;
  }
};
