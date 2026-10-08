import { Request, Response } from "express";
import { prisma } from "../config/db";
import { errorResponse, successResponse } from "../utils/apiResponse";
import { getQueryInt } from "../utils/query";
import { formatProduct, productInclude } from "../utils/storefront";

// Homepage collection sections: every active collection that has at least one active product,
// oldest first (so newly created collections appear further down), each with a preview of its products.
export const listStorefrontCollections = async (req: Request, res: Response): Promise<void> => {
  try {
    const perCollection = Math.min(12, Math.max(1, getQueryInt(req.query.products, 4)));
    const activeProducts = { isActive: true };
    const collections = await prisma.collection.findMany({
      // Only collections with at least one active product appear on the homepage.
      where: { isActive: true, products: { some: activeProducts } },
      orderBy: { createdAt: "asc" },
      select: {
        id: true,
        name: true,
        slug: true,
        description: true,
        imageUrl: true,
        _count: { select: { products: { where: activeProducts } } },
        products: {
          where: activeProducts,
          orderBy: [{ isFeatured: "desc" }, { createdAt: "desc" }],
          take: perCollection,
          include: productInclude,
        },
      },
    });
    res.set("Cache-Control", "public, max-age=60, stale-while-revalidate=60");
    successResponse(res, "Collections retrieved", collections.map(({ _count, products, ...collection }) => ({
      ...collection,
      productsCount: _count.products,
      products: products.map(formatProduct),
    })));
  } catch (error) {
    console.error("List storefront collections error:", error);
    errorResponse(res, "Failed to get collections", 500);
  }
};

// Single collection header for the Shop page filter.
export const getStorefrontCollection = async (req: Request, res: Response): Promise<void> => {
  const collection = await prisma.collection.findFirst({
    where: { slug: String(req.params.slug), isActive: true },
    select: { id: true, name: true, slug: true, description: true, imageUrl: true },
  });
  if (!collection) return void errorResponse(res, "Collection not found", 404);
  res.set("Cache-Control", "public, max-age=60, stale-while-revalidate=60");
  successResponse(res, "Collection retrieved", collection);
};
