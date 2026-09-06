import { Response } from "express";
import { prisma } from "../config/db";
import { AuthenticatedRequest } from "../middleware/auth.middleware";
import { successResponse, errorResponse } from "../utils/apiResponse";
import { AppError } from "../middleware/error.middleware";

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

export const getCoupons = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const page = getQueryInt(req.query.page, 1);
    const limit = Math.min(100, Math.max(1, getQueryInt(req.query.limit, 20)));
    const skip = (page - 1) * limit;

    const search = getQueryString(req.query.search);
    const status = getQueryString(req.query.status);
    const requestedSort = getQueryString(req.query.sort) || "createdAt";
    const sort = ["createdAt", "updatedAt", "code", "startDate", "expiryDate", "usedCount"].includes(requestedSort) ? requestedSort : "createdAt";
    const order = getQueryString(req.query.order) === "asc" ? "asc" : "desc";

    const where: Record<string, unknown> = {};

    if (search) {
      where.code = { contains: search, mode: "insensitive" };
    }

    if (status) where.isActive = status === "Active";

    const orderBy: Record<string, "asc" | "desc"> = {
      [sort]: order,
    };

    const [coupons, total] = await Promise.all([
      prisma.coupon.findMany({
        where,
        skip,
        take: limit,
        orderBy,
      }),
      prisma.coupon.count({ where }),
    ]);

    const formattedCoupons = coupons.map((c) => ({
      ...c,
      discountValue: Number(c.discountValue),
      minimumOrderAmount: Number(c.minimumOrderAmount),
      maximumDiscountAmount: c.maximumDiscountAmount ? Number(c.maximumDiscountAmount) : null,
      discountType: c.discountType,
    }));

    successResponse(res, "Coupons retrieved", formattedCoupons, 200, {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    console.error("Get coupons error:", error);
    errorResponse(res, "Failed to get coupons", 500);
  }
};

export const getCouponById = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const id = String(req.params.id);

    const coupon = await prisma.coupon.findUnique({ where: { id } });

    if (!coupon) {
      throw new AppError("Coupon not found", 404);
    }

    successResponse(res, "Coupon retrieved", {
      ...coupon,
      discountValue: Number(coupon.discountValue),
      minimumOrderAmount: Number(coupon.minimumOrderAmount),
      maximumDiscountAmount: coupon.maximumDiscountAmount ? Number(coupon.maximumDiscountAmount) : null,
      discountType: coupon.discountType,
    });
  } catch (error) {
    if (error instanceof AppError) {
      errorResponse(res, error.message, error.statusCode);
      return;
    }
    console.error("Get coupon by ID error:", error);
    errorResponse(res, "Failed to get coupon", 500);
  }
};

export const createCoupon = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const body = req.body as Record<string, unknown>;
    const code = body.code as string;
    const description = body.description as string | undefined;
    const discountType = body.discountType as string;
    const discountValue = body.discountValue as number;
    const minimumOrderAmount = body.minimumOrderAmount as number | undefined;
    const maximumDiscountAmount = body.maximumDiscountAmount as number | undefined;
    const startDate = body.startDate as string;
    const expiryDate = body.expiryDate as string;
    const usageLimit = body.usageLimit as number;
    const isActive = body.isActive as boolean | undefined;

    if (!code || !discountType || !discountValue || !startDate || !expiryDate || !usageLimit) {
      throw new AppError("Missing required fields", 400);
    }

    const existing = await prisma.coupon.findUnique({ where: { code: code.toUpperCase() } });
    if (existing) {
      throw new AppError("Coupon code already exists", 409);
    }

    const coupon = await prisma.coupon.create({
      data: {
        code: code.toUpperCase(),
        description,
        discountType: discountType as "PERCENTAGE" | "FLAT",
        discountValue: discountValue ?? 0,
        minimumOrderAmount: minimumOrderAmount ?? 0,
        maximumDiscountAmount,
        startDate: new Date(startDate),
        expiryDate: new Date(expiryDate),
        usageLimit: usageLimit ?? 0,
        isActive,
      },
    });

    successResponse(res, "Coupon created successfully", {
      ...coupon,
      discountValue: Number(coupon.discountValue),
      minimumOrderAmount: Number(coupon.minimumOrderAmount),
      maximumDiscountAmount: coupon.maximumDiscountAmount ? Number(coupon.maximumDiscountAmount) : null,
      discountType: coupon.discountType,
    }, 201);
  } catch (error) {
    if (error instanceof AppError) {
      errorResponse(res, error.message, error.statusCode);
      return;
    }
    console.error("Create coupon error:", error);
    errorResponse(res, "Failed to create coupon", 500);
  }
};

export const updateCoupon = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const id = String(req.params.id);
    const body = req.body as Record<string, unknown>;
    const code = body.code as string | undefined;
    const description = body.description as string | undefined;
    const discountType = body.discountType as string | undefined;
    const discountValue = body.discountValue as number | undefined;
    const minimumOrderAmount = body.minimumOrderAmount as number | undefined;
    const maximumDiscountAmount = body.maximumDiscountAmount as number | undefined;
    const startDate = body.startDate as string | undefined;
    const expiryDate = body.expiryDate as string | undefined;
    const usageLimit = body.usageLimit as number | undefined;
    const isActive = body.isActive as boolean | undefined;

    const existing = await prisma.coupon.findUnique({ where: { id } });
    if (!existing) {
      throw new AppError("Coupon not found", 404);
    }

    if (code && code.toUpperCase() !== existing.code) {
      const codeExists = await prisma.coupon.findUnique({ where: { code: code.toUpperCase() } });
      if (codeExists) {
        throw new AppError("Coupon code already exists", 409);
      }
    }

    const coupon = await prisma.coupon.update({
      where: { id },
      data: {
        code: code?.toUpperCase(),
        description,
        discountType: discountType as "PERCENTAGE" | "FLAT" | undefined,
        discountValue,
        minimumOrderAmount,
        maximumDiscountAmount,
        startDate: startDate ? new Date(startDate) : undefined,
        expiryDate: expiryDate ? new Date(expiryDate) : undefined,
        usageLimit,
        isActive,
      },
    });

    successResponse(res, "Coupon updated successfully", {
      ...coupon,
      discountValue: Number(coupon.discountValue),
      minimumOrderAmount: Number(coupon.minimumOrderAmount),
      maximumDiscountAmount: coupon.maximumDiscountAmount ? Number(coupon.maximumDiscountAmount) : null,
      discountType: coupon.discountType,
    });
  } catch (error) {
    if (error instanceof AppError) {
      errorResponse(res, error.message, error.statusCode);
      return;
    }
    console.error("Update coupon error:", error);
    errorResponse(res, "Failed to update coupon", 500);
  }
};

export const toggleCouponStatus = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const id = String(req.params.id);

    const coupon = await prisma.coupon.findUnique({ where: { id } });
    if (!coupon) {
      throw new AppError("Coupon not found", 404);
    }

    const updated = await prisma.coupon.update({
      where: { id },
      data: { isActive: !coupon.isActive },
    });

    successResponse(res, `Coupon ${updated.isActive ? "activated" : "deactivated"}`, {
      ...updated,
      discountValue: Number(updated.discountValue),
      minimumOrderAmount: Number(updated.minimumOrderAmount),
      maximumDiscountAmount: updated.maximumDiscountAmount ? Number(updated.maximumDiscountAmount) : null,
      discountType: updated.discountType,
    });
  } catch (error) {
    if (error instanceof AppError) {
      errorResponse(res, error.message, error.statusCode);
      return;
    }
    console.error("Toggle coupon status error:", error);
    errorResponse(res, "Failed to toggle coupon status", 500);
  }
};

export const deleteCoupon = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const id = String(req.params.id);

    const coupon = await prisma.coupon.findUnique({ where: { id } });
    if (!coupon) {
      throw new AppError("Coupon not found", 404);
    }

    await prisma.coupon.delete({ where: { id } });

    successResponse(res, "Coupon deleted successfully");
  } catch (error) {
    if (error instanceof AppError) {
      errorResponse(res, error.message, error.statusCode);
      return;
    }
    console.error("Delete coupon error:", error);
    errorResponse(res, "Failed to delete coupon", 500);
  }
};
