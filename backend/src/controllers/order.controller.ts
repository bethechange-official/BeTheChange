import { OrderStatus, PaymentStatus } from "@prisma/client";
import { Response } from "express";
import { prisma } from "../config/db";
import { AuthenticatedRequest } from "../middleware/auth.middleware";
import { AppError } from "../middleware/error.middleware";
import { errorResponse, successResponse } from "../utils/apiResponse";
import { getQueryInt, getQueryString } from "../utils/query";

const validOrderTransitions: Record<OrderStatus, OrderStatus[]> = {
  PENDING: ["CONFIRMED", "CANCELLED"],
  CONFIRMED: ["PROCESSING", "CANCELLED"],
  PROCESSING: ["SHIPPED", "CANCELLED"],
  SHIPPED: ["DELIVERED", "CANCELLED"],
  DELIVERED: ["REFUNDED"],
  CANCELLED: [],
  REFUNDED: [],
};

const validPaymentTransitions: Record<PaymentStatus, PaymentStatus[]> = {
  PENDING: ["PAID", "FAILED"],
  PAID: ["REFUNDED"],
  FAILED: ["PENDING"],
  REFUNDED: [],
};

const formatOrder = <T extends Record<string, any>>(order: T) => ({
  ...order,
  subtotal: Number(order.subtotal),
  discountAmount: Number(order.discountAmount),
  shippingFee: Number(order.shippingFee),
  totalAmount: Number(order.totalAmount),
  coupon: order.coupon ? { ...order.coupon, discountValue: Number(order.coupon.discountValue) } : order.coupon,
  items: order.items?.map((item: Record<string, any>) => ({ ...item, price: Number(item.price) })),
});

export const getOrders = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const page = getQueryInt(req.query.page, 1);
    const limit = Math.min(100, Math.max(1, getQueryInt(req.query.limit, 20)));
    const search = getQueryString(req.query.search);
    const orderStatus = getQueryString(req.query.orderStatus) as OrderStatus | undefined;
    const paymentStatus = getQueryString(req.query.paymentStatus) as PaymentStatus | undefined;
    const requestedSort = getQueryString(req.query.sort) || "createdAt";
    const sort = ["createdAt", "updatedAt", "orderNumber", "totalAmount"].includes(requestedSort) ? requestedSort : "createdAt";
    const direction = getQueryString(req.query.order) === "asc" ? "asc" : "desc";

    const where = {
      ...(search ? { OR: [
        { orderNumber: { contains: search, mode: "insensitive" as const } },
        { customerName: { contains: search, mode: "insensitive" as const } },
        { customerEmail: { contains: search, mode: "insensitive" as const } },
      ] } : {}),
      ...(orderStatus ? { orderStatus } : {}),
      ...(paymentStatus ? { paymentStatus } : {}),
    };

    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { [sort]: direction },
        include: { items: { select: { id: true, productName: true, price: true, quantity: true, image: true } } },
      }),
      prisma.order.count({ where }),
    ]);

    successResponse(res, "Orders retrieved", orders.map(formatOrder), 200, {
      page, limit, total, totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    console.error("Get orders error:", error);
    errorResponse(res, "Failed to get orders", 500);
  }
};

export const getOrderById = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const order = await prisma.order.findUnique({
      where: { id: String(req.params.id) },
      include: {
        items: { select: { id: true, productId: true, productName: true, price: true, quantity: true, image: true } },
        coupon: { select: { code: true, discountType: true, discountValue: true } },
      },
    });
    if (!order) throw new AppError("Order not found", 404);
    successResponse(res, "Order retrieved", formatOrder(order));
  } catch (error) {
    if (error instanceof AppError) return void errorResponse(res, error.message, error.statusCode);
    console.error("Get order by ID error:", error);
    errorResponse(res, "Failed to get order", 500);
  }
};

export const updateOrderStatus = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const id = String(req.params.id);
    const orderStatus = req.body.orderStatus as OrderStatus | undefined;
    const paymentStatus = req.body.paymentStatus as PaymentStatus | undefined;
    const order = await prisma.order.findUnique({ where: { id }, include: { items: true } });
    if (!order) throw new AppError("Order not found", 404);

    if (orderStatus && orderStatus !== order.orderStatus && !validOrderTransitions[order.orderStatus].includes(orderStatus)) {
      throw new AppError(`Cannot transition from ${order.orderStatus} to ${orderStatus}`, 400);
    }
    if (paymentStatus && paymentStatus !== order.paymentStatus && !validPaymentTransitions[order.paymentStatus].includes(paymentStatus)) {
      throw new AppError(`Cannot transition payment from ${order.paymentStatus} to ${paymentStatus}`, 400);
    }

    const updated = await prisma.$transaction(async (tx) => {
      if (orderStatus === "CANCELLED" && order.orderStatus !== "CANCELLED") {
        for (const item of order.items) {
          if (item.productId) {
            await tx.product.updateMany({ where: { id: item.productId }, data: { stock: { increment: item.quantity } } });
          }
        }
      }
      return tx.order.update({
        where: { id },
        data: { orderStatus, paymentStatus },
        include: { items: { select: { id: true, productName: true, price: true, quantity: true, image: true } } },
      });
    });

    successResponse(res, "Order updated successfully", formatOrder(updated));
  } catch (error) {
    if (error instanceof AppError) return void errorResponse(res, error.message, error.statusCode);
    console.error("Update order status error:", error);
    errorResponse(res, "Failed to update order", 500);
  }
};
