import fs from "fs";
import path from "path";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import cookieParser from "cookie-parser";
import rateLimit from "express-rate-limit";
import { prisma } from "./config/db";
import { env } from "./config/env";
import { AppError, errorHandler, notFoundHandler } from "./middleware/error.middleware";
import { getPublicImageUrl, productImageDirectory, upload, verifyUploadedImages } from "./middleware/upload";
import { adminOnlyMiddleware, authMiddleware } from "./middleware/auth.middleware";

import authRoutes from "./routes/auth.routes";
import dashboardRoutes from "./routes/dashboard.routes";
import productRoutes from "./routes/product.routes";
import categoryRoutes from "./routes/category.routes";
import collectionRoutes from "./routes/collection.routes";
import couponRoutes from "./routes/coupon.routes";
import orderRoutes from "./routes/order.routes";
import settingsRoutes from "./routes/settings.routes";
import customerRoutes from "./routes/customer.routes";
import customerAuthRoutes from "./routes/customer.auth.routes";
import storefrontProductRoutes from "./routes/storefront.product.routes";
import storefrontCategoryRoutes from "./routes/storefront.category.routes";
import cartRoutes from "./routes/cart.routes";
import addressRoutes from "./routes/address.routes";
import storefrontMiscRoutes from "./routes/storefront.misc.routes";
import storefrontOrderRoutes from "./routes/storefront.order.routes";
import publicSettingsRoutes from "./routes/public.settings.routes";

const app = express();
app.disable("x-powered-by");
app.set("trust proxy", env.TRUST_PROXY);
app.use(helmet({ crossOriginResourcePolicy: { policy: "cross-origin" } }));
app.use(cors({
  credentials: true,
  origin(origin, callback) {
    if (!origin) return callback(null, true);
    const cleanOrigin = origin.replace(/\/$/, "");
    if (env.FRONTEND_ORIGINS.includes(cleanOrigin)) return callback(null, true);
    if (env.NODE_ENV !== "production" && /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(cleanOrigin)) {
      return callback(null, true);
    }
    callback(new AppError("Origin is not allowed", 403));
  },
}));
app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: false, limit: "1mb" }));
app.use(cookieParser());

app.use("/uploads", express.static(env.STORAGE_PATH, {
  fallthrough: false,
  immutable: true,
  maxAge: "1y",
  setHeaders: (res) => res.setHeader("X-Content-Type-Options", "nosniff"),
}));

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 300,
  standardHeaders: "draft-7",
  legacyHeaders: false,
  message: { success: false, message: "Too many requests, please try again later" },
});
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: env.NODE_ENV === "production" ? 10 : 500,
  standardHeaders: "draft-7",
  legacyHeaders: false,
  message: { success: false, message: "Too many authentication attempts, please try again later" },
});

app.use("/api", apiLimiter);
app.use(["/api/admin/auth/login", "/api/auth/login", "/api/auth/register"], authLimiter);

app.get("/api/health", (_req, res) => res.json({ success: true, status: "ok" }));
app.get("/api/ready", async (_req, res, next) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    res.json({ success: true, status: "ready" });
  } catch (error) {
    next(error);
  }
});

app.use("/api/admin/auth", authRoutes);
app.use("/api/admin/dashboard", dashboardRoutes);
app.use("/api/admin/products", productRoutes);
app.use("/api/admin/categories", categoryRoutes);
app.use("/api/admin/collections", collectionRoutes);
app.use("/api/admin/coupons", couponRoutes);
app.use("/api/admin/orders", orderRoutes);
app.use("/api/admin/settings", settingsRoutes);
app.use("/api/admin/customers", customerRoutes);

app.use("/api/auth", customerAuthRoutes);
app.use("/api/products", storefrontProductRoutes);
app.use("/api/categories", storefrontCategoryRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/addresses", addressRoutes);
app.use("/api/orders", storefrontOrderRoutes);
app.use("/api/settings", publicSettingsRoutes);
app.use("/api", storefrontMiscRoutes);

app.post(
  "/api/admin/upload",
  authMiddleware,
  adminOnlyMiddleware,
  upload.array("images", 8),
  verifyUploadedImages,
  (req, res) => {
    const files = (req.files as Express.Multer.File[] | undefined) || [];
    if (!files.length) throw new AppError("No images uploaded", 400);
    res.status(201).json({
      success: true,
      message: "Images uploaded successfully",
      data: { images: files.map((file) => ({ filename: file.filename, url: getPublicImageUrl(file.filename) })) },
    });
  },
);

app.delete("/api/admin/upload/:filename", authMiddleware, adminOnlyMiddleware, async (req, res, next) => {
  try {
    const filename = path.basename(String(req.params.filename));
    if (filename !== String(req.params.filename)) throw new AppError("Invalid filename", 400);
    const [productImage, categoryImage, collectionImage] = await Promise.all([
      prisma.productImage.findFirst({ where: { url: { contains: filename } }, select: { id: true } }),
      prisma.category.findFirst({ where: { imageUrl: { contains: filename } }, select: { id: true } }),
      prisma.collection.findFirst({ where: { imageUrl: { contains: filename } }, select: { id: true } }),
    ]);
    if (productImage || categoryImage || collectionImage) throw new AppError("Image is still referenced by catalog data", 409);
    await fs.promises.unlink(path.join(productImageDirectory, filename)).catch((error: NodeJS.ErrnoException) => {
      if (error.code !== "ENOENT") throw error;
    });
    res.json({ success: true, message: "Image deleted" });
  } catch (error) {
    next(error);
  }
});

app.use(notFoundHandler);
app.use(errorHandler);

export default app;
