import { Request, Response, NextFunction } from "express";
import { Prisma } from "@prisma/client";
import multer from "multer";
import { errorResponse } from "../utils/apiResponse";

export class AppError extends Error {
  constructor(
    public message: string,
    public statusCode: number = 400,
    public errors?: Array<{ field: string; message: string }>
  ) {
    super(message);
    this.name = "AppError";
  }
}

export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  console.error("Error:", err);

  if (err instanceof AppError) {
    errorResponse(res, err.message, err.statusCode, err.errors);
    return;
  }

  if (err instanceof multer.MulterError) {
    errorResponse(res, err.code === "LIMIT_FILE_SIZE" ? "Image must be 5 MB or smaller" : err.message, 400);
    return;
  }

  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    if (err.code === "P2002") {
      const target = err.meta?.target as string[] | undefined;
      const field = target?.[0] || "field";
      errorResponse(res, `${field} already exists`, 409, [{ field, message: `${field} already exists` }]);
      return;
    }
    if (err.code === "P2025") {
      errorResponse(res, "Record not found", 404);
      return;
    }
    if (err.code === "P2003") {
      errorResponse(res, "Foreign key constraint failed", 400);
      return;
    }
    if (err.code === "P2034") {
      errorResponse(res, "The request conflicted with another update. Please try again", 409);
      return;
    }
  }

  if (err instanceof Prisma.PrismaClientValidationError) {
    errorResponse(res, "Invalid data provided", 400);
    return;
  }

  if (err.name === "JsonWebTokenError") {
    errorResponse(res, "Invalid token", 401);
    return;
  }

  if (err.name === "TokenExpiredError") {
    errorResponse(res, "Token expired", 401);
    return;
  }

  const httpError = err as Error & { status?: number; statusCode?: number };
  const status = httpError.statusCode || httpError.status;
  if (status && status >= 400 && status < 500) {
    errorResponse(res, status === 404 ? "Resource not found" : err.message, status);
    return;
  }

  errorResponse(res, "Internal server error", 500);
};

export const notFoundHandler = (req: Request, res: Response): void => {
  errorResponse(res, `Route ${req.originalUrl} not found`, 404);
};
