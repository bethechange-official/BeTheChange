import { Response } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { prisma, invalidateIdentityCache } from "../config/db";
import { env } from "../config/env";
import { AuthenticatedRequest, generateTokens } from "../middleware/auth.middleware";
import { successResponse, errorResponse } from "../utils/apiResponse";
import { AppError } from "../middleware/error.middleware";
import { refreshCookieOptions } from "../utils/cookies";

export const adminLogin = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    const admin = await prisma.admin.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (!admin || !(await bcrypt.compare(password, admin.passwordHash))) {
      throw new AppError("Invalid email or password", 401);
    }

    if (!admin.isActive) {
      throw new AppError("Account is deactivated", 403);
    }

    clearFailedLogin(ip);
    const { accessToken, refreshToken } = generateTokens(admin.id, "admin");

    await prisma.admin.update({
      where: { id: admin.id },
      data: { lastLoginAt: new Date() },
    });

    res.cookie("adminRefreshToken", refreshToken, refreshCookieOptions);

    successResponse(res, "Login successful", {
      admin: {
        id: admin.id,
        name: admin.name,
        email: admin.email,
        role: admin.role,
      },
      accessToken,
    });
  } catch (error) {
    if (error instanceof AppError) {
      errorResponse(res, error.message, error.statusCode);
      return;
    }
    console.error("Admin login error:", error);
    errorResponse(res, "Login failed", 500);
  }
};

export const adminLogout = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    res.clearCookie("adminRefreshToken", refreshCookieOptions);
    successResponse(res, "Logged out successfully");
  } catch (error) {
    console.error("Admin logout error:", error);
    errorResponse(res, "Logout failed", 500);
  }
};

export const refreshAccessToken = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const refreshToken = req.cookies?.adminRefreshToken;
    if (!refreshToken) {
      throw new AppError("Refresh token not provided", 401);
    }

    const decoded = jwt.verify(refreshToken, env.REFRESH_TOKEN_SECRET) as { id: string; type: string };
    
    if (decoded.type !== "admin") {
      throw new AppError("Invalid token type", 401);
    }

    const admin = await prisma.admin.findUnique({
      where: { id: decoded.id },
      select: { id: true, isActive: true },
    });

    if (!admin || !admin.isActive) {
      throw new AppError("Admin not found or inactive", 401);
    }

    const { accessToken: newAccessToken, refreshToken: newRefreshToken } = generateTokens(admin.id, "admin");

    res.cookie("adminRefreshToken", newRefreshToken, refreshCookieOptions);

    successResponse(res, "Token refreshed", { accessToken: newAccessToken });
  } catch (error) {
    if (error instanceof AppError) {
      errorResponse(res, error.message, error.statusCode);
      return;
    }
    if (error instanceof jwt.JsonWebTokenError || error instanceof jwt.TokenExpiredError) {
      res.clearCookie("adminRefreshToken", refreshCookieOptions);
      errorResponse(res, "Invalid or expired refresh token", 401);
      return;
    }
    console.error("Token refresh error:", error);
    errorResponse(res, "Token refresh failed", 500);
  }
};

export const getAdminProfile = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    if (!req.admin) {
      throw new AppError("Not authenticated", 401);
    }

    const admin = await prisma.admin.findUnique({
      where: { id: req.admin.id },
    });

    if (!admin) {
      throw new AppError("Admin not found", 404);
    }

    successResponse(res, "Admin profile retrieved", {
      id: admin.id,
      name: admin.name,
      email: admin.email,
      role: admin.role,
      isActive: admin.isActive,
      lastLoginAt: admin.lastLoginAt,
      createdAt: admin.createdAt,
    });
  } catch (error) {
    if (error instanceof AppError) {
      errorResponse(res, error.message, error.statusCode);
      return;
    }
    console.error("Get admin profile error:", error);
    errorResponse(res, "Failed to get profile", 500);
  }
};
