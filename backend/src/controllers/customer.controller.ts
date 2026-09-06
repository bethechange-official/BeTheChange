import { Response } from "express";
import { prisma } from "../config/db";
import { AuthenticatedRequest } from "../middleware/auth.middleware";
import { AppError } from "../middleware/error.middleware";
import { errorResponse, successResponse } from "../utils/apiResponse";
import { getQueryInt, getQueryString } from "../utils/query";

export const getCustomers = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const page = getQueryInt(req.query.page, 1);
  const limit = Math.min(100, Math.max(1, getQueryInt(req.query.limit, 20)));
  const search = getQueryString(req.query.search);
  const status = getQueryString(req.query.status);
  const requestedSort = getQueryString(req.query.sort) || "createdAt";
  const sort = ["createdAt", "updatedAt", "name", "email"].includes(requestedSort) ? requestedSort : "createdAt";
  const direction = getQueryString(req.query.order) === "asc" ? "asc" : "desc";
  const where = {
    ...(search ? { OR: [
      { name: { contains: search, mode: "insensitive" as const } },
      { email: { contains: search, mode: "insensitive" as const } },
      { phone: { contains: search, mode: "insensitive" as const } },
    ] } : {}),
    ...(status ? { isActive: status === "Active" } : {}),
  };
  const [users, total] = await Promise.all([
    prisma.user.findMany({
      where,
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { [sort]: direction },
      include: { orders: { select: { totalAmount: true, paymentStatus: true } }, _count: { select: { orders: true } } },
    }),
    prisma.user.count({ where }),
  ]);
  successResponse(res, "Customers retrieved", users.map((user) => ({
    id: user.id,
    name: user.name,
    email: user.email,
    phone: user.phone,
    status: user.isActive ? "Active" : "Inactive",
    totalOrders: user._count.orders,
    totalSpent: user.orders.filter((order) => order.paymentStatus === "PAID").reduce((sum, order) => sum + Number(order.totalAmount), 0),
    joinedDate: user.createdAt,
  })), 200, { page, limit, total, totalPages: Math.ceil(total / limit) });
};

export const getCustomerById = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: String(req.params.id) },
      include: { addresses: true, orders: { orderBy: { createdAt: "desc" } } },
    });
    if (!user) throw new AppError("Customer not found", 404);
    successResponse(res, "Customer retrieved", {
      id: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      status: user.isActive ? "Active" : "Inactive",
      totalOrders: user.orders.length,
      totalSpent: user.orders.filter((order) => order.paymentStatus === "PAID").reduce((sum, order) => sum + Number(order.totalAmount), 0),
      joinedDate: user.createdAt,
      addresses: user.addresses,
      orders: user.orders.map((order) => ({
        id: order.id,
        orderNumber: order.orderNumber,
        totalAmount: Number(order.totalAmount),
        orderStatus: order.orderStatus,
        paymentStatus: order.paymentStatus,
        createdAt: order.createdAt,
      })),
    });
  } catch (error) {
    if (error instanceof AppError) return void errorResponse(res, error.message, error.statusCode);
    throw error;
  }
};

export const updateCustomerStatus = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const id = String(req.params.id);
    if (!(await prisma.user.findUnique({ where: { id } }))) throw new AppError("Customer not found", 404);
    const user = await prisma.user.update({ where: { id }, data: { isActive: req.body.isActive } });
    successResponse(res, "Customer status updated", { id: user.id, status: user.isActive ? "Active" : "Inactive" });
  } catch (error) {
    if (error instanceof AppError) return void errorResponse(res, error.message, error.statusCode);
    throw error;
  }
};
