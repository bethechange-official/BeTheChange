import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { Response } from "express";
import { prisma, checkLoginAttempts, recordFailedLogin, clearFailedLogin } from "../config/db";
import { env } from "../config/env";
import { AuthenticatedRequest, generateTokens } from "../middleware/auth.middleware";
import { AppError } from "../middleware/error.middleware";
import { errorResponse, successResponse } from "../utils/apiResponse";
import { refreshCookieOptions } from "../utils/cookies";
import { mergeGuestCart } from "../utils/storefront";

const publicUser = (user: { id: string; name: string; email: string; phone: string | null; role: string }) => ({
  id: user.id,
  name: user.name,
  email: user.email,
  phone: user.phone,
  role: user.role,
});

const authenticate = async (req: AuthenticatedRequest, res: Response, user: { id: string; name: string; email: string; phone: string | null; role: string }, statusCode = 200) => {
  const { accessToken, refreshToken } = generateTokens(user.id, "user");
  res.cookie("userRefreshToken", refreshToken, refreshCookieOptions);
  await mergeGuestCart(req, res, user.id);
  successResponse(res, "Authentication successful", { user: publicUser(user), token: accessToken }, statusCode);
};

export const registerCustomer = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const email = String(req.body.email).trim().toLowerCase();
    const passwordHash = await bcrypt.hash(String(req.body.password), 12);
    try {
      const user = await prisma.user.create({
        data: {
          name: String(req.body.name).trim(),
          email,
          phone: req.body.phone ? String(req.body.phone).trim() : null,
          passwordHash,
        },
      });
      await authenticate(req, res, user, 201);
    } catch (e: any) {
      if (e?.code === "P2002") throw new AppError("An account with this email already exists", 409);
      throw e;
    }
  } catch (error) {
    if (error instanceof AppError) return void errorResponse(res, error.message, error.statusCode);
    throw error;
  }
};

export const loginCustomer = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const ip = req.ip ?? "unknown";
    checkLoginAttempts(ip);
    const user = await prisma.user.findUnique({ where: { email: String(req.body.email).trim().toLowerCase() } });
    if (!user || !(await bcrypt.compare(String(req.body.password), user.passwordHash))) {
      recordFailedLogin(ip);
      throw new AppError("Invalid email or password", 401);
    }
    if (!user.isActive) throw new AppError("Account is deactivated", 403);
    clearFailedLogin(ip);
    await authenticate(req, res, user);
  } catch (error) {
    if (error instanceof AppError) return void errorResponse(res, error.message, error.statusCode);
    if (error instanceof Error && error.message.includes("Too many failed")) {
      return void errorResponse(res, error.message, 429);
    }
    throw error;
  }
};

export const refreshCustomerToken = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const token = req.cookies?.userRefreshToken;
    if (!token) throw new AppError("Refresh token not provided", 401);
    const decoded = jwt.verify(token, env.REFRESH_TOKEN_SECRET) as { id?: string; type?: string };
    if (!decoded.id || decoded.type !== "user") throw new AppError("Invalid refresh token", 401);
    const user = await prisma.user.findUnique({ where: { id: decoded.id } });
    if (!user?.isActive) throw new AppError("User not found or inactive", 401);
    const tokens = generateTokens(user.id, "user");
    res.cookie("userRefreshToken", tokens.refreshToken, refreshCookieOptions);
    successResponse(res, "Token refreshed", { token: tokens.accessToken });
  } catch (error) {
    res.clearCookie("userRefreshToken", refreshCookieOptions);
    if (error instanceof AppError) return void errorResponse(res, error.message, error.statusCode);
    if (error instanceof jwt.JsonWebTokenError || error instanceof jwt.TokenExpiredError) {
      return void errorResponse(res, "Invalid or expired refresh token", 401);
    }
    throw error;
  }
};

export const getCustomerProfile = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const user = await prisma.user.findUnique({ where: { id: req.user!.id } });
  if (!user) return void errorResponse(res, "User not found", 404);
  successResponse(res, "Profile retrieved", { user: publicUser(user) });
};

export const updateCustomerProfile = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const user = await prisma.user.update({
    where: { id: req.user!.id },
    data: {
      name: req.body.name === undefined ? undefined : String(req.body.name).trim(),
      phone: req.body.phone === undefined ? undefined : String(req.body.phone).trim(),
    },
  });
  successResponse(res, "Profile updated", { user: publicUser(user) });
};

export const logoutCustomer = async (_req: AuthenticatedRequest, res: Response): Promise<void> => {
  res.clearCookie("userRefreshToken", refreshCookieOptions);
  successResponse(res, "Logged out successfully");
};
