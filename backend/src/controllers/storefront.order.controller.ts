import crypto from "crypto";
import { Prisma, PaymentMethod } from "@prisma/client";
import { Response } from "express";
import { prisma } from "../config/db";
import { AuthenticatedRequest } from "../middleware/auth.middleware";
import { AppError } from "../middleware/error.middleware";
import { errorResponse, successResponse } from "../utils/apiResponse";
import { calculateCouponDiscount, getExistingCart } from "../utils/storefront";

const formatOrder = (order: any) => ({
  ...order,
  subtotal: Number(order.subtotal),
  discountAmount: Number(order.discountAmount),
  shippingFee: Number(order.shippingFee),
  totalAmount: Number(order.totalAmount),
  items: order.items?.map((item: any) => ({ ...item, price: Number(item.price) })),
});

const orderNumber = () => `BTC-${Date.now().toString(36).toUpperCase()}-${crypto.randomBytes(4).toString("hex").toUpperCase()}`;

export const createStorefrontOrder = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const existingCart = await getExistingCart(req);
    if (!existingCart?.items.length) throw new AppError("Your cart is empty", 400);

    const order = await prisma.$transaction(async (tx) => {
      const cart = await tx.cart.findUnique({
        where: { id: existingCart.id },
        include: { items: { include: { product: { include: { images: { orderBy: { sortOrder: "asc" } } } } } } },
      });
      if (!cart?.items.length) throw new AppError("Your cart is empty", 400);
      if (cart.items.some((item) => !item.product.isActive)) throw new AppError("One or more products are no longer available", 409);

      let savedAddress = null;
      if (req.user && req.body.addressId) {
        savedAddress = await tx.address.findFirst({ where: { id: req.body.addressId, userId: req.user.id } });
        if (!savedAddress) throw new AppError("Address not found", 404);
      }

      const customerName = String(req.body.name || savedAddress?.name || req.user?.name || "").trim();
      const customerEmail = String(req.body.email || req.user?.email || "").trim().toLowerCase();
      const customerPhone = String(req.body.phone || savedAddress?.phone || "").trim();
      const addressLine1 = String(req.body.addressLine1 || savedAddress?.addressLine1 || "").trim();
      const addressLine2 = String(req.body.addressLine2 || savedAddress?.addressLine2 || "").trim() || null;
      const city = String(req.body.city || savedAddress?.city || "").trim();
      const state = String(req.body.state || savedAddress?.state || "").trim();
      const pincode = String(req.body.pincode || savedAddress?.pincode || "").trim();
      if (!customerName || !customerEmail || !customerPhone || !addressLine1 || !city || !state || !/^\d{6}$/.test(pincode)) {
        throw new AppError("Complete customer and delivery address details are required", 400);
      }

      const subtotal = Math.round(cart.items.reduce((sum, item) => sum + Number(item.product.price) * item.quantity, 0) * 100) / 100;
      let coupon = null;
      let discountAmount = 0;
      const couponCode = req.body.couponCode ? String(req.body.couponCode).trim().toUpperCase() : undefined;
      if (couponCode) {
        const now = new Date();
        coupon = await tx.coupon.findFirst({ where: { code: couponCode, isActive: true, startDate: { lte: now }, expiryDate: { gte: now } } });
        if (!coupon || coupon.usedCount >= coupon.usageLimit || subtotal < Number(coupon.minimumOrderAmount)) {
          throw new AppError("Coupon is no longer valid for this order", 409);
        }
        discountAmount = calculateCouponDiscount(coupon, subtotal);
      }

      const settingRows = await tx.setting.findMany({ where: { key: { in: ["shippingFee", "freeShippingThreshold"] } } });
      const settings = Object.fromEntries(settingRows.map((setting) => [setting.key, Number(setting.value)]));
      const configuredFee = Number.isFinite(settings.shippingFee) ? Math.max(0, settings.shippingFee) : 0;
      const freeThreshold = Number.isFinite(settings.freeShippingThreshold) ? Math.max(0, settings.freeShippingThreshold) : 0;
      const discountedSubtotal = Math.max(0, subtotal - discountAmount);
      const shippingFee = freeThreshold > 0 && discountedSubtotal >= freeThreshold ? 0 : configuredFee;

      for (const item of cart.items) {
        const stockUpdate = await tx.product.updateMany({
          where: { id: item.productId, isActive: true, stock: { gte: item.quantity } },
          data: { stock: { decrement: item.quantity } },
        });
        if (stockUpdate.count !== 1) throw new AppError(`${item.product.name} does not have enough stock`, 409);
      }

      if (coupon) {
        const couponUpdate = await tx.coupon.updateMany({
          where: { id: coupon.id, usedCount: { lt: coupon.usageLimit } },
          data: { usedCount: { increment: 1 } },
        });
        if (couponUpdate.count !== 1) throw new AppError("Coupon usage limit has been reached", 409);
      }

      if (req.user && req.body.saveAddress && !savedAddress) {
        await tx.address.updateMany({ where: { userId: req.user.id }, data: { isDefault: false } });
        await tx.address.create({
          data: { userId: req.user.id, name: customerName, phone: customerPhone, addressLine1, addressLine2, city, state, pincode, isDefault: true },
        });
      }

      const created = await tx.order.create({
        data: {
          orderNumber: orderNumber(),
          userId: req.user?.id,
          customerName,
          customerEmail,
          customerPhone,
          addressName: customerName,
          addressPhone: customerPhone,
          addressLine1,
          addressLine2,
          city,
          state,
          pincode,
          subtotal,
          discountAmount,
          shippingFee,
          totalAmount: Math.round((discountedSubtotal + shippingFee) * 100) / 100,
          couponId: coupon?.id,
          couponCode: coupon?.code,
          paymentMethod: "COD" as PaymentMethod,
          items: {
            create: cart.items.map((item) => ({
              productId: item.productId,
              productName: item.product.name,
              price: item.product.price,
              quantity: item.quantity,
              image: item.product.images[0]?.url || null,
            })),
          },
        },
        include: { items: true },
      });
      await tx.cartItem.deleteMany({ where: { cartId: cart.id } });
      return created;
    }, { isolationLevel: Prisma.TransactionIsolationLevel.Serializable });

    successResponse(res, "Order placed successfully", { order: formatOrder(order) }, 201);
  } catch (error) {
    if (error instanceof AppError) return void errorResponse(res, error.message, error.statusCode);
    throw error;
  }
};

export const getMyOrders = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const orders = await prisma.order.findMany({
    where: { userId: req.user!.id },
    orderBy: { createdAt: "desc" },
    include: { items: true },
  });
  successResponse(res, "Orders retrieved", { orders: orders.map(formatOrder) });
};

export const getMyOrderByNumber = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const order = await prisma.order.findFirst({
      where: { orderNumber: String(req.params.orderNumber), userId: req.user!.id },
      include: { items: true },
    });
    if (!order) throw new AppError("Order not found", 404);
    successResponse(res, "Order retrieved", { order: formatOrder(order) });
  } catch (error) {
    if (error instanceof AppError) return void errorResponse(res, error.message, error.statusCode);
    throw error;
  }
};
