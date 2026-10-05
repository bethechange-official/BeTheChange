import { Prisma } from "@prisma/client";
import { Response } from "express";
import { prisma } from "../config/db";
import { AuthenticatedRequest } from "../middleware/auth.middleware";
import { successResponse, errorResponse } from "../utils/apiResponse";

// Month boundaries follow the store's timezone (IST, UTC+05:30, no DST), not the server's,
// so "this month" means the same thing whether the API runs locally or in a UTC container.
const STORE_UTC_OFFSET_MS = 330 * 60 * 1000;

/** UTC instant at which the given store-local month starts. Month may be out of range (e.g. -1). */
const storeMonthStart = (year: number, month: number): Date => new Date(Date.UTC(year, month, 1) - STORE_UTC_OFFSET_MS);

const storeNowParts = (now: Date) => {
  const local = new Date(now.getTime() + STORE_UTC_OFFSET_MS);
  return { year: local.getUTCFullYear(), month: local.getUTCMonth() };
};

type Period = { gte: Date; lt: Date };

/**
 * This month so far vs the same elapsed span of last month (e.g. 1–15 Oct vs 1–15 Sep).
 * Comparing a partial month against a full one would show a large fake drop early in every month.
 */
const monthToDatePeriods = (now: Date): { current: Period; previous: Period } => {
  const { year, month } = storeNowParts(now);
  const currentStart = storeMonthStart(year, month);
  const previousStart = storeMonthStart(year, month - 1);
  const elapsed = now.getTime() - currentStart.getTime();
  // Clamp so e.g. 31 Mar compares against all of Feb, never spilling into March.
  const previousEnd = new Date(Math.min(previousStart.getTime() + elapsed, currentStart.getTime()));
  return {
    current: { gte: currentStart, lt: now },
    previous: { gte: previousStart, lt: previousEnd },
  };
};

/** Percentage change rounded to 1 dp; null when there is no baseline to compare against. */
const percentChange = (current: number, previous: number): number | null => {
  if (previous === 0) return current === 0 ? 0 : null;
  return Math.round(((current - previous) / previous) * 1000) / 10;
};

const comparison = (current: number, previous: number) => ({
  current,
  previous,
  changePercent: percentChange(current, previous),
});

// Revenue counts only money actually received (refunded orders move to REFUNDED and drop out).
const paidOrders = (createdAt?: Period): Prisma.OrderWhereInput => ({ paymentStatus: "PAID", ...(createdAt && { createdAt }) });

const sumRevenue = async (where: Prisma.OrderWhereInput): Promise<number> => {
  const result = await prisma.order.aggregate({ where, _sum: { totalAmount: true } });
  return Number(result._sum.totalAmount || 0);
};

export const getDashboardStats = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const now = new Date();
    const { current, previous } = monthToDatePeriods(now);

    const [
      totalRevenue,
      totalOrders,
      totalCustomers,
      totalProducts,
      lowStockProducts,
      activeCoupons,
      ordersByStatus,
      recentOrders,
      revenueThisPeriod,
      revenuePreviousPeriod,
      ordersThisPeriod,
      ordersPreviousPeriod,
      customersThisPeriod,
      customersPreviousPeriod,
      sales,
    ] = await Promise.all([
      sumRevenue(paidOrders()),
      prisma.order.count(),
      prisma.user.count({ where: { role: "CUSTOMER" } }),
      prisma.product.count({ where: { isActive: true } }),
      prisma.product.count({ where: { stock: { lte: 5 }, isActive: true } }),
      // Usable right now: active, within its date window, and not used up.
      prisma.coupon.count({
        where: {
          isActive: true,
          startDate: { lte: now },
          expiryDate: { gte: now },
          usedCount: { lt: prisma.coupon.fields.usageLimit },
        },
      }),
      prisma.order.groupBy({ by: ["orderStatus"], _count: { _all: true } }),
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
      sumRevenue(paidOrders(current)),
      sumRevenue(paidOrders(previous)),
      prisma.order.count({ where: { createdAt: current } }),
      prisma.order.count({ where: { createdAt: previous } }),
      prisma.user.count({ where: { role: "CUSTOMER", createdAt: current } }),
      prisma.user.count({ where: { role: "CUSTOMER", createdAt: previous } }),
      getSalesByPeriod(now),
    ]);

    const statusCounts = Object.fromEntries(ordersByStatus.map((row) => [row.orderStatus, row._count._all]));
    const countFor = (...statuses: string[]) => statuses.reduce((sum, status) => sum + (statusCounts[status] || 0), 0);

    const stats = {
      totalRevenue,
      totalOrders,
      totalCustomers,
      totalProducts,
      pendingOrders: countFor("PENDING", "CONFIRMED", "PROCESSING"),
      deliveredOrders: countFor("DELIVERED"),
      lowStockProducts,
      activeCoupons,
      ordersByStatus: statusCounts,
      comparisons: {
        period: { currentStart: current.gte, currentEnd: current.lt, previousStart: previous.gte, previousEnd: previous.lt },
        revenue: comparison(revenueThisPeriod, revenuePreviousPeriod),
        orders: comparison(ordersThisPeriod, ordersPreviousPeriod),
        customers: comparison(customersThisPeriod, customersPreviousPeriod),
      },
      recentOrders: recentOrders.map((order) => ({
        ...order,
        totalAmount: Number(order.totalAmount),
      })),
      salesByPeriod: sales.months,
      salesComparison: comparison(sales.windowTotal, sales.previousWindowTotal),
    };

    successResponse(res, "Dashboard stats retrieved", stats);
  } catch (error) {
    console.error("Get dashboard stats error:", error);
    errorResponse(res, "Failed to get dashboard stats", 500);
  }
};

const MONTH_NAMES = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

/** Paid sales for the last 6 store-local months (current month included), plus the 6 months before for comparison. */
async function getSalesByPeriod(now: Date) {
  const { year, month } = storeNowParts(now);
  const windowStart = storeMonthStart(year, month - 5);
  const previousWindowStart = storeMonthStart(year, month - 11);

  const orders = await prisma.order.findMany({
    where: { createdAt: { gte: previousWindowStart, lt: now }, paymentStatus: "PAID" },
    select: { totalAmount: true, createdAt: true },
  });

  const months = Array.from({ length: 6 }, (_, i) => {
    const start = storeMonthStart(year, month - 5 + i);
    const end = storeMonthStart(year, month - 4 + i);
    const label = new Date(start.getTime() + STORE_UTC_OFFSET_MS);
    return { month: MONTH_NAMES[label.getUTCMonth()], year: label.getUTCFullYear(), start, end, sales: 0, orders: 0 };
  });

  let windowTotal = 0;
  let previousWindowTotal = 0;
  for (const order of orders) {
    const amount = Number(order.totalAmount);
    if (order.createdAt < windowStart) {
      previousWindowTotal += amount;
      continue;
    }
    windowTotal += amount;
    const bucket = months.find((m) => order.createdAt >= m.start && order.createdAt < m.end);
    if (bucket) {
      bucket.sales += amount;
      bucket.orders += 1;
    }
  }

  const round = (n: number) => Math.round(n * 100) / 100;
  return {
    months: months.map(({ month, year, sales, orders }) => ({ month, year, sales: round(sales), orders })),
    windowTotal: round(windowTotal),
    previousWindowTotal: round(previousWindowTotal),
  };
}
