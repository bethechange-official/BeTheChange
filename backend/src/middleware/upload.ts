import crypto from "crypto";
import fs from "fs";
import path from "path";
import { NextFunction, Request, Response } from "express";
import multer from "multer";
import { env } from "../config/env";
import { prisma } from "../config/db";
import { AppError } from "./error.middleware";

export const productImageDirectory = path.join(env.STORAGE_PATH, "products");
fs.mkdirSync(productImageDirectory, { recursive: true });

const mimeToExtension: Record<string, string> = {
  "image/jpeg": ".jpg",
  "image/png": ".png",
  "image/webp": ".webp",
  "image/gif": ".gif",
};

const storage = multer.diskStorage({
  destination: (_req, _file, callback) => callback(null, productImageDirectory),
  filename: (_req, file, callback) => {
    callback(null, `${crypto.randomUUID()}${mimeToExtension[file.mimetype] || ""}`);
  },
});

export const upload = multer({
  storage,
  fileFilter: (_req, file, callback) => {
    callback(null, Boolean(mimeToExtension[file.mimetype]));
  },
  limits: {
    files: 8,
    fileSize: 5 * 1024 * 1024,
    fields: 10,
  },
});

const hasValidSignature = (buffer: Buffer, mimeType: string): boolean => {
  if (mimeType === "image/jpeg") return buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff;
  if (mimeType === "image/png") return buffer.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]));
  if (mimeType === "image/webp") return buffer.subarray(0, 4).toString() === "RIFF" && buffer.subarray(8, 12).toString() === "WEBP";
  if (mimeType === "image/gif") return ["GIF87a", "GIF89a"].includes(buffer.subarray(0, 6).toString());
  return false;
};

const removeFiles = async (files: Express.Multer.File[]): Promise<void> => {
  await Promise.all(files.map((file) => fs.promises.unlink(file.path).catch(() => undefined)));
};

export const verifyUploadedImages = async (req: Request, _res: Response, next: NextFunction): Promise<void> => {
  const files = (req.files as Express.Multer.File[] | undefined) || (req.file ? [req.file] : []);
  try {
    for (const file of files) {
      const handle = await fs.promises.open(file.path, "r");
      const signature = Buffer.alloc(12);
      await handle.read(signature, 0, signature.length, 0);
      await handle.close();
      if (!hasValidSignature(signature, file.mimetype)) {
        await removeFiles(files);
        throw new AppError("One or more files are not valid images", 400);
      }
    }
    next();
  } catch (error) {
    await removeFiles(files);
    next(error);
  }
};

export const getPublicImageUrl = (filename: string): string => {
  if (env.PUBLIC_STORAGE_URL) {
    return new URL(`products/${filename}`, env.PUBLIC_STORAGE_URL.endsWith("/") ? env.PUBLIC_STORAGE_URL : `${env.PUBLIC_STORAGE_URL}/`).toString();
  }
  return `/uploads/products/${filename}`;
};

const managedFilename = (url: string): string | null => {
  if (!url.startsWith("/uploads/products/")) return null;
  const filename = path.basename(url);
  return /^[a-f0-9-]+\.(jpg|png|webp|gif)$/i.test(filename) ? filename : null;
};

export const removeManagedImagesIfUnused = async (urls: string[]): Promise<void> => {
  for (const url of [...new Set(urls)]) {
    const filename = managedFilename(url);
    if (!filename) continue;
    const [productImage, categoryImage, collectionImage] = await Promise.all([
      prisma.productImage.findFirst({ where: { url }, select: { id: true } }),
      prisma.category.findFirst({ where: { imageUrl: url }, select: { id: true } }),
      prisma.collection.findFirst({ where: { imageUrl: url }, select: { id: true } }),
    ]);
    if (productImage || categoryImage || collectionImage) continue;
    await fs.promises.unlink(path.join(productImageDirectory, filename)).catch((error: NodeJS.ErrnoException) => {
      if (error.code !== "ENOENT") console.error(`Failed to remove unused upload ${filename}:`, error);
    });
  }
};
