import { Request, Response } from "express";
import { prisma } from "../config/db";
import { AuthenticatedRequest } from "../middleware/auth.middleware";
import { successResponse, errorResponse } from "../utils/apiResponse";
import { AppError } from "../middleware/error.middleware";
import { removeManagedImagesIfUnused } from "../middleware/upload";

const order = [{ sortOrder: "asc" as const }, { createdAt: "asc" as const }];

// ---- Storefront ----

export const getActiveBanners = async (_req: Request, res: Response): Promise<void> => {
  try {
    const now = new Date();
    const banners = await prisma.banner.findMany({
      where: {
        isActive: true,
        AND: [
          { OR: [{ startsAt: null }, { startsAt: { lte: now } }] },
          { OR: [{ endsAt: null }, { endsAt: { gt: now } }] },
        ],
      },
      orderBy: order,
      select: { id: true, title: true, subtitle: true, imageUrl: true, linkUrl: true, ctaLabel: true },
    });
    res.set("Cache-Control", "public, max-age=60, stale-while-revalidate=60");
    successResponse(res, "Banners retrieved", banners);
  } catch (error) {
    console.error("Get active banners error:", error);
    errorResponse(res, "Failed to get banners", 500);
  }
};

// ---- Admin ----

export const getBanners = async (_req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const banners = await prisma.banner.findMany({ orderBy: order });
    successResponse(res, "Banners retrieved", banners);
  } catch (error) {
    console.error("Get banners error:", error);
    errorResponse(res, "Failed to get banners", 500);
  }
};

export const createBanner = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    // New slides go to the end unless an explicit position is given.
    const sortOrder = req.body.sortOrder ?? ((await prisma.banner.aggregate({ _max: { sortOrder: true } }))._max.sortOrder ?? -1) + 1;
    const banner = await prisma.banner.create({ data: { ...req.body, sortOrder } });
    successResponse(res, "Banner created", banner, 201);
  } catch (error) {
    console.error("Create banner error:", error);
    errorResponse(res, "Failed to create banner", 500);
  }
};

export const updateBanner = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const id = String(req.params.id);
    const existing = await prisma.banner.findUnique({ where: { id } });
    if (!existing) throw new AppError("Banner not found", 404);

    const banner = await prisma.banner.update({ where: { id }, data: req.body });
    if (existing.imageUrl !== banner.imageUrl) await removeManagedImagesIfUnused([existing.imageUrl]);
    successResponse(res, "Banner updated", banner);
  } catch (error) {
    if (error instanceof AppError) {
      errorResponse(res, error.message, error.statusCode);
      return;
    }
    console.error("Update banner error:", error);
    errorResponse(res, "Failed to update banner", 500);
  }
};

export const reorderBanners = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const ids: string[] = req.body.ids;
    await prisma.$transaction(ids.map((id, index) => prisma.banner.updateMany({ where: { id }, data: { sortOrder: index } })));
    const banners = await prisma.banner.findMany({ orderBy: order });
    successResponse(res, "Banner order updated", banners);
  } catch (error) {
    console.error("Reorder banners error:", error);
    errorResponse(res, "Failed to reorder banners", 500);
  }
};

export const deleteBanner = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const id = String(req.params.id);
    const existing = await prisma.banner.findUnique({ where: { id } });
    if (!existing) throw new AppError("Banner not found", 404);

    await prisma.banner.delete({ where: { id } });
    await removeManagedImagesIfUnused([existing.imageUrl]);
    successResponse(res, "Banner deleted");
  } catch (error) {
    if (error instanceof AppError) {
      errorResponse(res, error.message, error.statusCode);
      return;
    }
    console.error("Delete banner error:", error);
    errorResponse(res, "Failed to delete banner", 500);
  }
};
