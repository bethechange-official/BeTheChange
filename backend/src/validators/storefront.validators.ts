import { z } from "zod";

const uuidParam = z.string().uuid();
const phone = z.string().trim().min(10).max(30);
const addressFields = {
  name: z.string().trim().min(2).max(120),
  phone,
  addressLine1: z.string().trim().min(5).max(250),
  addressLine2: z.string().trim().max(250).optional().nullable(),
  city: z.string().trim().min(2).max(100),
  state: z.string().trim().min(2).max(100),
  pincode: z.string().trim().regex(/^\d{6}$/, "Pincode must contain 6 digits"),
  isDefault: z.boolean().optional(),
};

export const cartAddSchema = z.object({ body: z.object({ productId: uuidParam, quantity: z.number().int().min(1).max(99).default(1) }) });
export const cartUpdateSchema = z.object({
  body: z.object({ quantity: z.number().int().min(0).max(99) }),
  params: z.object({ productId: uuidParam }),
});
export const cartItemParamSchema = z.object({ params: z.object({ productId: uuidParam }) });

export const addressCreateSchema = z.object({ body: z.object(addressFields) });
export const addressUpdateSchema = z.object({
  body: z.object(addressFields).partial().refine((body) => Object.keys(body).length > 0, "At least one field is required"),
  params: z.object({ id: uuidParam }),
});
export const idParamSchema = z.object({ params: z.object({ id: uuidParam }) });

export const couponValidationSchema = z.object({
  body: z.object({ code: z.string().trim().min(2).max(50), subtotal: z.number().nonnegative().optional() }),
});

export const contactSchema = z.object({
  body: z.object({
    name: z.string().trim().min(2).max(120),
    email: z.string().trim().email().max(320),
    phone: phone.optional().nullable(),
    subject: z.string().trim().max(200).optional().nullable(),
    message: z.string().trim().min(10).max(5000),
  }),
});

export const createOrderSchema = z.object({
  body: z.object({
    addressId: uuidParam.optional().nullable(),
    name: z.string().trim().min(2).max(120).optional().nullable(),
    email: z.string().trim().email().max(320).optional().nullable(),
    phone: phone.optional().nullable(),
    addressLine1: z.string().trim().min(5).max(250).optional().nullable(),
    addressLine2: z.string().trim().max(250).optional().nullable(),
    city: z.string().trim().min(2).max(100).optional().nullable(),
    state: z.string().trim().min(2).max(100).optional().nullable(),
    pincode: z.string().trim().regex(/^\d{6}$/).optional().nullable(),
    couponCode: z.string().trim().max(50).optional().nullable(),
    paymentMethod: z.enum(["COD"]).default("COD"),
    saveAddress: z.boolean().default(false),
  }),
});

export const customerStatusSchema = z.object({
  body: z.object({ isActive: z.boolean() }),
  params: z.object({ id: uuidParam }),
});
