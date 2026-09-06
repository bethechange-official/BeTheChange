import { Response } from "express";
import { prisma } from "../config/db";
import { AuthenticatedRequest } from "../middleware/auth.middleware";
import { successResponse, errorResponse } from "../utils/apiResponse";

export const getDashboardStats = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const [
      totalRevenue,
      totalOrders,
      totalCustomers,
      totalProducts,
      pendingOrders,
      lowStockProducts,
      recentOrders,
      salesByPeriod,
    ] = await Promise.all([
      prisma.order.aggregate({
        where: { paymentStatus: "PAID" },
        _sum: { totalAmount: true },
      }),
      prisma.order.count(),
      prisma.user.count({ where: { role: "CUSTOMER" } }),
      prisma.product.count({ where: { isActive: true } }),
      prisma.order.count({
        where: { orderStatus: { in: ["PENDING", "CONFIRMED", "PROCESSING"] } },
      }),
      prisma.product.count({ where: { stock: { lte: 5 }, isActive: true } }),
      prisma.order.findMany({
        take: 5,
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          orderNumber: true,
          customerName: true,
          customerEmail: true,
          totalAmount: true,
          orderStatus: true,
          paymentStatus: true,
          createdAt: true,
        },
      }),
      getSalesByPeriod(),
    ]);

    const stats = {
      totalRevenue: Number(totalRevenue._sum.totalAmount || 0),
      totalOrders,
      totalCustomers,
      totalProducts,
      pendingOrders,
      lowStockProducts,
      recentOrders: recentOrders.map((order) => ({
        ...order,
        totalAmount: Number(order.totalAmount),
      })),
      salesByPeriod,
    };

    successResponse(res, "Dashboard stats retrieved", stats);
  } catch (error) {
    console.error("Get dashboard stats error:", error);
    errorResponse(res, "Failed to get dashboard stats", 500);
  }
};

async function getSalesByPeriod() {
  const now = new Date();
  const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 5, 1);

  const orders = await prisma.order.findMany({
    where: {
      createdAt: { gte: sixMonthsAgo },
      paymentStatus: "PAID",
    },
    select: {
      totalAmount: true,
      createdAt: true,
    },
  });

  const monthlyData: Record<string, { sales: number; orders: number }> = {};

  for (let i = 0; i < 6; i++) {
    const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const key = date.toLocaleString("default", { month: "short" });
    monthlyData[key] = { sales: 0, orders: 0 };
  }

  orders.forEach((order) => {
    const key = order.createdAt.toLocaleString("default", { month: "short" });
    if (monthlyData[key]) {
      monthlyData[key].sales += Number(order.totalAmount);
      monthlyData[key].orders += 1;
    }
  });

  return Object.entries(monthlyData)
    .reverse()
    .map(([month, data]) => ({ month, ...data }));
}
