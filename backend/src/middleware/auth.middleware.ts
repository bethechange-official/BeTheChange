import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { getCachedIdentity } from "../config/db";
import { env } from "../config/env";
import { errorResponse } from "../utils/apiResponse";
import { AppError } from "./error.middleware";

type TokenPayload = { id: string; type: "admin" | "user" };

export interface AuthenticatedRequest extends Request {
  admin?: { id: string; email: string; name: string; role: string };
  user?: { id: string; email: string; name: string; role: string };
}

const readBearerToken = (req: Request): string | undefined => {
  const authorization = req.headers.authorization;
  return authorization?.startsWith("Bearer ") ? authorization.slice(7) : undefined;
};

const attachIdentity = async (req: AuthenticatedRequest, token: string): Promise<void> => {
  const decoded = jwt.verify(token, env.JWT_SECRET) as TokenPayload;
  if (!decoded.id || !["admin", "user"].includes(decoded.type)) throw new AppError("Invalid token", 401);

  const identity = await getCachedIdentity(decoded.id, decoded.type);
  if (!identity?.isActive) throw new AppError("Account not found or inactive", 401);

  if (decoded.type === "admin") {
    req.admin = { id: identity.id, email: identity.email, name: identity.name, role: identity.role };
  } else {
    req.user = { id: identity.id, email: identity.email, name: identity.name, role: identity.role };
  }
};

const sendAuthError = (res: Response, error: unknown): void => {
  if (error instanceof jwt.TokenExpiredError) {
    errorResponse(res, "Token expired", 401);
  } else if (error instanceof AppError) {
    errorResponse(res, error.message, error.statusCode);
  } else {
    errorResponse(res, "Invalid token", 401);
  }
};

export const authMiddleware = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  const token = readBearerToken(req);
  if (!token) {
    errorResponse(res, "No token provided", 401);
    return;
  }
  try {
    await attachIdentity(req, token);
    next();
  } catch (error) {
    sendAuthError(res, error);
  }
};

export const optionalAuthMiddleware = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  const token = readBearerToken(req);
  if (!token) {
    next();
    return;
  }
  try {
    await attachIdentity(req, token);
    next();
  } catch (error) {
    sendAuthError(res, error);
  }
};

export const adminOnlyMiddleware = (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
  if (!req.admin) {
    errorResponse(res, "Admin access required", 403);
    return;
  }
  next();
};

export const superAdminMiddleware = (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
  if (req.admin?.role !== "SUPER_ADMIN") {
    errorResponse(res, "Super admin access required", 403);
    return;
  }
  next();
};

export const generateTokens = (id: string, type: "admin" | "user") => ({
  accessToken: jwt.sign({ id, type }, env.JWT_SECRET, {
    expiresIn: env.JWT_EXPIRES_IN as jwt.SignOptions["expiresIn"],
  }),
  refreshToken: jwt.sign({ id, type }, env.REFRESH_TOKEN_SECRET, {
    expiresIn: env.REFRESH_TOKEN_EXPIRES_IN as jwt.SignOptions["expiresIn"],
  }),
});
