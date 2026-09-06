import { Response } from "express";
import { prisma } from "../config/db";
import { AuthenticatedRequest } from "../middleware/auth.middleware";
import { AppError } from "../middleware/error.middleware";
import { calculateCouponDiscount } from "../utils/storefront";
import { errorResponse, successResponse } from "../utils/apiResponse";

export const validateCoupon = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const code = String(req.body.code).trim().toUpperCase();
    const subtotal = Number(req.body.subtotal);
    const now = new Date();
    const coupon = await prisma.coupon.findFirst({ where: { code, isActive: true, startDate: { lte: now }, expiryDate: { gte: now } } });
    if (!coupon) throw new AppError("Coupon is invalid or expired", 400);
    if (coupon.usedCount >= coupon.usageLimit) throw new AppError("Coupon usage limit has been reached", 400);
    if (subtotal < Number(coupon.minimumOrderAmount)) {
      throw new AppError(`Minimum order amount is ₹${Number(coupon.minimumOrderAmount)}`, 400);
    }
    successResponse(res, "Coupon applied", {
      couponCode: coupon.code,
      discountAmount: calculateCouponDiscount(coupon, subtotal),
    });
  } catch (error) {
    if (error instanceof AppError) return void errorResponse(res, error.message, error.statusCode);
    throw error;
  }
};

export const submitContact = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const contact = await prisma.contact.create({ data: req.body });
  successResponse(res, "Your message has been received", { id: contact.id }, 201);
};
