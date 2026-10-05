import { Response } from "express";
import { prisma } from "../config/db";
import { AuthenticatedRequest } from "../middleware/auth.middleware";
import { AppError } from "../middleware/error.middleware";
import { assertCouponApplicable, calculateCartSubtotal, calculateCouponDiscount, getExistingCart } from "../utils/storefront";
import { errorResponse, successResponse } from "../utils/apiResponse";

// Previews a coupon against the caller's server-side cart. The client never supplies the subtotal,
// and order creation re-runs the same checks, so this response is informational only.
export const validateCoupon = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const code = String(req.body.code).trim().toUpperCase();
    const cart = await getExistingCart(req);
    const items = cart?.items.filter((item) => item.product.isActive) || [];
    if (!items.length) throw new AppError("Your cart is empty", 400);
    const subtotal = calculateCartSubtotal(items);

    const coupon = assertCouponApplicable(await prisma.coupon.findUnique({ where: { code } }), subtotal);
    const discountAmount = calculateCouponDiscount(coupon, subtotal);

    successResponse(res, "Coupon applied", {
      couponCode: coupon.code,
      description: coupon.description,
      discountType: coupon.discountType,
      discountValue: Number(coupon.discountValue),
      maximumDiscountAmount: coupon.maximumDiscountAmount === null ? null : Number(coupon.maximumDiscountAmount),
      minimumOrderAmount: Number(coupon.minimumOrderAmount),
      subtotal,
      discountAmount,
      discountedSubtotal: Math.round((subtotal - discountAmount) * 100) / 100,
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
