import { Response } from "express";
import { prisma } from "../config/db";
import { AuthenticatedRequest } from "../middleware/auth.middleware";
import { AppError } from "../middleware/error.middleware";
import { errorResponse, successResponse } from "../utils/apiResponse";

export const getAddresses = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const addresses = await prisma.address.findMany({
    where: { userId: req.user!.id },
    orderBy: [{ isDefault: "desc" }, { createdAt: "desc" }],
  });
  successResponse(res, "Addresses retrieved", { addresses });
};

export const createAddress = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const userId = req.user!.id;
  const count = await prisma.address.count({ where: { userId } });
  const makeDefault = req.body.isDefault === true || count === 0;
  const address = await prisma.$transaction(async (tx) => {
    if (makeDefault) await tx.address.updateMany({ where: { userId }, data: { isDefault: false } });
    return tx.address.create({ data: { ...req.body, userId, isDefault: makeDefault } });
  });
  successResponse(res, "Address created", { address }, 201);
};

export const updateAddress = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const id = String(req.params.id);
    const userId = req.user!.id;
    const existing = await prisma.address.findFirst({ where: { id, userId } });
    if (!existing) throw new AppError("Address not found", 404);
    const address = await prisma.$transaction(async (tx) => {
      if (req.body.isDefault === true) await tx.address.updateMany({ where: { userId, id: { not: id } }, data: { isDefault: false } });
      return tx.address.update({ where: { id }, data: req.body });
    });
    successResponse(res, "Address updated", { address });
  } catch (error) {
    if (error instanceof AppError) return void errorResponse(res, error.message, error.statusCode);
    throw error;
  }
};

export const deleteAddress = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const id = String(req.params.id);
    const userId = req.user!.id;
    const existing = await prisma.address.findFirst({ where: { id, userId } });
    if (!existing) throw new AppError("Address not found", 404);
    await prisma.$transaction(async (tx) => {
      await tx.address.delete({ where: { id } });
      if (existing.isDefault) {
        const replacement = await tx.address.findFirst({ where: { userId }, orderBy: { createdAt: "desc" } });
        if (replacement) await tx.address.update({ where: { id: replacement.id }, data: { isDefault: true } });
      }
    });
    successResponse(res, "Address deleted");
  } catch (error) {
    if (error instanceof AppError) return void errorResponse(res, error.message, error.statusCode);
    throw error;
  }
};
