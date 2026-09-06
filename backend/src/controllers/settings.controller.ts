import { Response } from "express";
import { prisma } from "../config/db";
import { AuthenticatedRequest } from "../middleware/auth.middleware";
import { successResponse, errorResponse } from "../utils/apiResponse";
import { AppError } from "../middleware/error.middleware";

const defaultSettings = {
  storeName: "Be The Change (BTC)",
  storeEmail: "contact@bethechange.com",
  storePhone: "+91 98765 43210",
  storeAddress: "12 Botanical Avenue, Jubilee Hills, Hyderabad, Telangana 500033",
  shippingFee: 50,
  freeShippingThreshold: 999,
  lowStockAlertThreshold: 5,
  currency: "INR",
};

const buildSettings = (settings: Array<{ key: string; value: string }>) => {
  const settingsMap = Object.fromEntries(settings.map((setting) => [setting.key, setting.value]));
  return {
    ...defaultSettings,
    ...settingsMap,
    shippingFee: Number(settingsMap.shippingFee ?? defaultSettings.shippingFee),
    freeShippingThreshold: Number(settingsMap.freeShippingThreshold ?? defaultSettings.freeShippingThreshold),
    lowStockAlertThreshold: Number(settingsMap.lowStockAlertThreshold ?? defaultSettings.lowStockAlertThreshold),
  };
};

export const getSettings = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const settings = await prisma.setting.findMany();
    successResponse(res, "Settings retrieved", buildSettings(settings));
  } catch (error) {
    console.error("Get settings error:", error);
    errorResponse(res, "Failed to get settings", 500);
  }
};

export const getPublicSettings = async (_req: AuthenticatedRequest, res: Response): Promise<void> => {
  const settings = await prisma.setting.findMany({
    where: { key: { in: ["shippingFee", "freeShippingThreshold", "currency"] } },
  });
  const values = buildSettings(settings);
  successResponse(res, "Store settings retrieved", {
    shippingFee: values.shippingFee,
    freeShippingThreshold: values.freeShippingThreshold,
    currency: values.currency,
  });
};

export const updateSettings = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const updates = req.body;

    await prisma.$transaction(
      Object.entries(updates).map(([key, value]) =>
        prisma.setting.upsert({
          where: { key },
          update: { value: String(value) },
          create: { key, value: String(value) },
        })
      )
    );

    const settings = await prisma.setting.findMany();
    successResponse(res, "Settings updated successfully", buildSettings(settings));
  } catch (error) {
    console.error("Update settings error:", error);
    errorResponse(res, "Failed to update settings", 500);
  }
};
