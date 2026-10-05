import crypto from "crypto";
import { Request, Response } from "express";
import { Prisma } from "@prisma/client";
import { prisma } from "../config/db";
import { AuthenticatedRequest } from "../middleware/auth.middleware";
import { AppError } from "../middleware/error.middleware";
import { guestCartCookieOptions } from "./cookies";

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export const productInclude = {
  images: { orderBy: { sortOrder: "asc" as const } },
};

export const formatProduct = <T extends { price: Prisma.Decimal; originalPrice: Prisma.Decimal | null; images: Array<{ url: string }> }>(product: T) => ({
  ...product,
  price: Number(product.price),
  originalPrice: product.originalPrice === null ? null : Number(product.originalPrice),
  images: product.images.map((image) => image.url),
});

export const cartInclude = {
  items: {
    orderBy: { createdAt: "asc" as const },
    include: { product: { include: productInclude } },
  },
};

export const formatCart = (cart: any) => ({
  id: cart.id,
  items: cart.items
    .filter((item: any) => item.product?.isActive)
    .map((item: any) => ({
      id: item.id,
      quantity: item.quantity,
      price: Number(item.price),
      product: formatProduct(item.product),
    })),
});

const readGuestSessionId = (req: Request): string | undefined => {
  const value = req.cookies?.guestCartId;
  return typeof value === "string" && UUID_PATTERN.test(value) ? value : undefined;
};

export const getOrCreateCart = async (req: AuthenticatedRequest, res: Response) => {
  if (req.user) {
    return prisma.cart.upsert({
      where: { userId: req.user.id },
      update: {},
      create: { userId: req.user.id },
      include: cartInclude,
    });
  }

  const sessionId = readGuestSessionId(req) || crypto.randomUUID();
  res.cookie("guestCartId", sessionId, guestCartCookieOptions);
  return prisma.cart.upsert({
    where: { sessionId },
    update: {},
    create: { sessionId },
    include: cartInclude,
  });
};

export const getExistingCart = async (req: AuthenticatedRequest) => {
  if (req.user) return prisma.cart.findUnique({ where: { userId: req.user.id }, include: cartInclude });
  const sessionId = readGuestSessionId(req);
  return sessionId ? prisma.cart.findUnique({ where: { sessionId }, include: cartInclude }) : null;
};

export const mergeGuestCart = async (req: Request, res: Response, userId: string): Promise<void> => {
  const sessionId = readGuestSessionId(req);
  if (!sessionId) return;

  await prisma.$transaction(async (tx) => {
    const guestCart = await tx.cart.findUnique({ where: { sessionId }, include: { items: true } });
    if (!guestCart) return;
    const userCart = await tx.cart.upsert({ where: { userId }, update: {}, create: { userId } });
    for (const item of guestCart.items) {
      const existing = await tx.cartItem.findUnique({
        where: { cartId_productId: { cartId: userCart.id, productId: item.productId } },
      });
      await tx.cartItem.upsert({
        where: { cartId_productId: { cartId: userCart.id, productId: item.productId } },
        update: { quantity: Math.min(99, (existing?.quantity || 0) + item.quantity), price: item.price },
        create: { cartId: userCart.id, productId: item.productId, quantity: item.quantity, price: item.price },
      });
    }
    await tx.cart.delete({ where: { id: guestCart.id } });
  });
  res.clearCookie("guestCartId", guestCartCookieOptions);
};

type CouponRules = {
  isActive: boolean;
  startDate: Date;
  expiryDate: Date;
  usageLimit: number;
  usedCount: number;
  minimumOrderAmount: Prisma.Decimal;
};

// Single source of truth for whether a coupon applies to a subtotal; throws a specific reason when it doesn't.
export const assertCouponApplicable = <T extends CouponRules>(coupon: T | null, subtotal: number, now = new Date()): T => {
  if (!coupon) throw new AppError("Invalid coupon code", 400);
  if (!coupon.isActive) throw new AppError("This coupon is not active", 400);
  if (coupon.startDate > now) throw new AppError("This coupon is not valid yet", 400);
  if (coupon.expiryDate < now) throw new AppError("This coupon has expired", 400);
  if (coupon.usedCount >= coupon.usageLimit) throw new AppError("This coupon has reached its usage limit", 400);
  const minimum = Number(coupon.minimumOrderAmount);
  if (subtotal < minimum) {
    throw new AppError(`Add ₹${Math.ceil((minimum - subtotal) * 100) / 100} more to use this coupon (minimum order ₹${minimum})`, 400);
  }
  return coupon;
};

export const calculateCartSubtotal = (items: Array<{ quantity: number; product: { price: Prisma.Decimal | number } }>): number =>
  Math.round(items.reduce((sum, item) => sum + Number(item.product.price) * item.quantity, 0) * 100) / 100;

export const calculateCouponDiscount = (coupon: {
  discountType: "PERCENTAGE" | "FLAT";
  discountValue: Prisma.Decimal;
  maximumDiscountAmount: Prisma.Decimal | null;
}, subtotal: number): number => {
  const raw = coupon.discountType === "PERCENTAGE"
    ? subtotal * Number(coupon.discountValue) / 100
    : Number(coupon.discountValue);
  const capped = coupon.maximumDiscountAmount === null ? raw : Math.min(raw, Number(coupon.maximumDiscountAmount));
  return Math.max(0, Math.min(subtotal, Math.round(capped * 100) / 100));
};
