import { Response } from "express";
import { prisma } from "../config/db";
import { AuthenticatedRequest } from "../middleware/auth.middleware";
import { AppError } from "../middleware/error.middleware";
import { errorResponse, successResponse } from "../utils/apiResponse";

export const listStorefrontCategories = async (_req: AuthenticatedRequest, res: Response): Promise<void> => {
  const categories = await prisma.category.findMany({
    where: { isActive: true },
    orderBy: { name: "asc" },
    include: { _count: { select: { products: { where: { isActive: true } } } } },
  });
  successResponse(res, "Categories retrieved", categories.map(({ _count, ...category }) => ({
    ...category,
    productsCount: _count.products,
  })));
};

export const getStorefrontCategory = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const category = await prisma.category.findFirst({ where: { slug: String(req.params.slug), isActive: true } });
    if (!category) throw new AppError("Category not found", 404);
    successResponse(res, "Category retrieved", { category });
  } catch (error) {
    if (error instanceof AppError) return void errorResponse(res, error.message, error.statusCode);
    throw error;
  }
};
