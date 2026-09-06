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

export const getCollections = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const collections = await prisma.collection.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        _count: { select: { products: true } },
      },
    });

    successResponse(res, "Collections retrieved", collections.map((c) => ({
      ...c,
      productsCount: c._count.products,
    })));
  } catch (error) {
    console.error("Get collections error:", error);
    errorResponse(res, "Failed to get collections", 500);
  }
};

export const createCollection = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
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

    const existing = await prisma.collection.findUnique({ where: { slug } });
    if (existing) {
      throw new AppError("Collection with this slug already exists", 409);
    }

    const collection = await prisma.collection.create({
      data: { name, slug, description, imageUrl, isActive },
    });

    successResponse(res, "Collection created successfully", collection, 201);
  } catch (error) {
    if (error instanceof AppError) {
      errorResponse(res, error.message, error.statusCode);
      return;
    }
    console.error("Create collection error:", error);
    errorResponse(res, "Failed to create collection", 500);
  }
};

export const updateCollection = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const id = String(req.params.id);
    const body = req.body as Record<string, unknown>;
    const name = body.name as string | undefined;
    const slug = body.slug as string | undefined;
    const description = body.description as string | undefined;
    const imageUrl = body.imageUrl as string | undefined;
    const isActive = body.isActive as boolean | undefined;

    const existing = await prisma.collection.findUnique({ where: { id } });
    if (!existing) {
      throw new AppError("Collection not found", 404);
    }

    if (slug && slug !== existing.slug) {
      const slugExists = await prisma.collection.findUnique({ where: { slug } });
      if (slugExists) {
        throw new AppError("Collection with this slug already exists", 409);
      }
    }

    const collection = await prisma.collection.update({
      where: { id },
      data: { name, slug, description, imageUrl, isActive },
    });

    if (existing.imageUrl && imageUrl !== undefined && imageUrl !== existing.imageUrl) {
      await removeManagedImagesIfUnused([existing.imageUrl]);
    }

    successResponse(res, "Collection updated successfully", collection);
  } catch (error) {
    if (error instanceof AppError) {
      errorResponse(res, error.message, error.statusCode);
      return;
    }
    console.error("Update collection error:", error);
    errorResponse(res, "Failed to update collection", 500);
  }
};

export const deleteCollection = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const id = String(req.params.id);

    const collection = await prisma.collection.findUnique({
      where: { id },
      include: { _count: { select: { products: true } } },
    });

    if (!collection) {
      throw new AppError("Collection not found", 404);
    }

    await prisma.$transaction(async (tx) => {
      await tx.product.updateMany({
        where: { collection: collection.name },
        data: { collection: null },
      });
      await tx.collection.delete({ where: { id } });
    });
    if (collection.imageUrl) await removeManagedImagesIfUnused([collection.imageUrl]);

    successResponse(res, "Collection deleted successfully");
  } catch (error) {
    if (error instanceof AppError) {
      errorResponse(res, error.message, error.statusCode);
      return;
    }
    console.error("Delete collection error:", error);
    errorResponse(res, "Failed to delete collection", 500);
  }
};
