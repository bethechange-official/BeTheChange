import { z } from "zod";

const imageUrlSchema = z.string().url().or(z.string().regex(/^\/uploads\/products\/[a-f0-9-]+\.(jpg|png|webp|gif)$/i));

export const adminLoginSchema = z.object({
  body: z.object({
    email: z.string().email("Invalid email address"),
    password: z.string().min(1, "Password is required"),
  }),
});

export const adminCreateSchema = z.object({
  body: z.object({
    name: z.string().min(2, "Name must be at least 2 characters"),
    email: z.string().email("Invalid email address"),
    password: z.string().min(8, "Password must be at least 8 characters"),
    role: z.enum(["ADMIN", "SUPER_ADMIN"]).default("ADMIN"),
  }),
});

export const productCreateSchema = z.object({
  body: z.object({
    name: z.string().min(2, "Name must be at least 2 characters"),
    slug: z.string().min(2, "Slug is required"),
    category: z.string().min(1, "Category is required"),
    collection: z.string().trim().optional().nullable(),
    skinConcern: z.string().optional(),
    price: z.number().positive("Price must be positive"),
    originalPrice: z.number().positive().optional().nullable(),
    stock: z.number().int().min(0, "Stock cannot be negative"),
    size: z.string().optional(),
    shortDescription: z.string().optional(),
    description: z.string().optional(),
    ingredients: z.string().optional(),
    benefits: z.string().optional(),
    usageInstructions: z.string().optional(),
    isFeatured: z.boolean().default(false),
    isActive: z.boolean().default(true),
    images: z.array(imageUrlSchema).max(8).optional(),
  }),
});

export const productUpdateSchema = z.object({
  body: z.object({
    name: z.string().min(2).optional(),
    slug: z.string().min(2).optional(),
    category: z.string().min(1).optional(),
    collection: z.string().trim().optional().nullable(),
    skinConcern: z.string().optional(),
    price: z.number().positive().optional(),
    originalPrice: z.number().positive().optional().nullable(),
    stock: z.number().int().min(0).optional(),
    size: z.string().optional(),
    shortDescription: z.string().optional(),
    description: z.string().optional(),
    ingredients: z.string().optional(),
    benefits: z.string().optional(),
    usageInstructions: z.string().optional(),
    isFeatured: z.boolean().optional(),
    isActive: z.boolean().optional(),
    images: z.array(imageUrlSchema).max(8).optional(),
  }),
  params: z.object({
    id: z.string().uuid("Invalid product ID"),
  }),
});

export const categoryCreateSchema = z.object({
  body: z.object({
    name: z.string().min(2, "Name must be at least 2 characters"),
    slug: z.string().min(2, "Slug is required"),
    description: z.string().optional(),
    imageUrl: imageUrlSchema.optional().nullable(),
    isActive: z.boolean().default(true),
  }),
});

export const categoryUpdateSchema = z.object({
  body: z.object({
    name: z.string().min(2).optional(),
    slug: z.string().min(2).optional(),
    description: z.string().optional(),
    imageUrl: imageUrlSchema.optional().nullable(),
    isActive: z.boolean().optional(),
  }),
  params: z.object({
    id: z.string().uuid("Invalid category ID"),
  }),
});

export const collectionCreateSchema = z.object({
  body: z.object({
    name: z.string().min(2, "Name must be at least 2 characters"),
    slug: z.string().min(2, "Slug is required"),
    description: z.string().optional(),
    imageUrl: imageUrlSchema.optional().nullable(),
    isActive: z.boolean().default(true),
  }),
});

export const collectionUpdateSchema = z.object({
  body: z.object({
    name: z.string().min(2).optional(),
    slug: z.string().min(2).optional(),
    description: z.string().optional(),
    imageUrl: imageUrlSchema.optional().nullable(),
    isActive: z.boolean().optional(),
  }),
  params: z.object({
    id: z.string().uuid("Invalid collection ID"),
  }),
});

export const couponCreateSchema = z.object({
  body: z.object({
    code: z.string().min(2, "Code must be at least 2 characters").toUpperCase(),
    description: z.string().optional(),
    discountType: z.enum(["PERCENTAGE", "FLAT"]),
    discountValue: z.number().positive("Discount value must be positive"),
    minimumOrderAmount: z.number().min(0).default(0),
    maximumDiscountAmount: z.number().positive().optional().nullable(),
    startDate: z.string().datetime("Invalid start date"),
    expiryDate: z.string().datetime("Invalid expiry date"),
    usageLimit: z.number().int().positive("Usage limit must be positive"),
    isActive: z.boolean().default(true),
  }),
}).refine((data) => new Date(data.body.expiryDate) > new Date(data.body.startDate), {
  message: "Expiry date must be after start date",
  path: ["body", "expiryDate"],
}).refine((data) => {
  if (data.body.discountType === "PERCENTAGE") {
    return data.body.discountValue <= 100;
  }
  return true;
}, {
  message: "Percentage discount cannot exceed 100%",
  path: ["body", "discountValue"],
});

export const couponUpdateSchema = z.object({
  body: z.object({
    code: z.string().min(2).toUpperCase().optional(),
    description: z.string().optional(),
    discountType: z.enum(["PERCENTAGE", "FLAT"]).optional(),
    discountValue: z.number().positive().optional(),
    minimumOrderAmount: z.number().min(0).optional(),
    maximumDiscountAmount: z.number().positive().optional().nullable(),
    startDate: z.string().datetime().optional(),
    expiryDate: z.string().datetime().optional(),
    usageLimit: z.number().int().positive().optional(),
    isActive: z.boolean().optional(),
  }),
  params: z.object({
    id: z.string().uuid("Invalid coupon ID"),
  }),
}).refine((data) => {
  if (data.body.discountType === "PERCENTAGE" && data.body.discountValue !== undefined) {
    return data.body.discountValue <= 100;
  }
  return true;
}, {
  message: "Percentage discount cannot exceed 100%",
  path: ["body", "discountValue"],
});

export const orderStatusUpdateSchema = z.object({
  body: z.object({
    orderStatus: z.enum(["PENDING", "CONFIRMED", "PROCESSING", "SHIPPED", "DELIVERED", "CANCELLED", "REFUNDED"]).optional(),
    paymentStatus: z.enum(["PENDING", "PAID", "FAILED", "REFUNDED"]).optional(),
  }).refine((body) => body.orderStatus || body.paymentStatus, "At least one status is required"),
  params: z.object({
    id: z.string().uuid("Invalid order ID"),
  }),
});

export const paginationSchema = z.object({
  query: z.object({
    page: z.coerce.number().int().positive().default(1),
    limit: z.coerce.number().int().positive().max(100).default(20),
    search: z.string().optional(),
    sort: z.string().optional(),
    order: z.enum(["asc", "desc"]).default("desc"),
  }),
});

export const productFilterSchema = z.object({
  query: z.object({
    page: z.coerce.number().int().positive().default(1),
    limit: z.coerce.number().int().positive().max(100).default(20),
    search: z.string().optional(),
    category: z.string().optional(),
    collection: z.string().optional(),
    isActive: z.coerce.boolean().optional(),
    stockStatus: z.enum(["IN", "LOW", "OUT"]).optional(),
    sort: z.string().optional(),
    order: z.enum(["asc", "desc"]).default("desc"),
  }),
});

export const orderFilterSchema = z.object({
  query: z.object({
    page: z.coerce.number().int().positive().default(1),
    limit: z.coerce.number().int().positive().max(100).default(20),
    search: z.string().optional(),
    orderStatus: z.enum(["PENDING", "CONFIRMED", "PROCESSING", "SHIPPED", "DELIVERED", "CANCELLED", "REFUNDED"]).optional(),
    paymentStatus: z.enum(["PENDING", "PAID", "FAILED", "REFUNDED"]).optional(),
    sort: z.string().optional(),
    order: z.enum(["asc", "desc"]).default("desc"),
  }),
});

export const customerFilterSchema = z.object({
  query: z.object({
    page: z.coerce.number().int().positive().default(1),
    limit: z.coerce.number().int().positive().max(100).default(20),
    search: z.string().optional(),
    status: z.enum(["Active", "Inactive"]).optional(),
    sort: z.string().optional(),
    order: z.enum(["asc", "desc"]).default("desc"),
  }),
});

export const settingsUpdateSchema = z.object({
  body: z.object({
    storeName: z.string().optional(),
    storeEmail: z.string().email().optional(),
    storePhone: z.string().optional(),
    storeAddress: z.string().optional(),
    shippingFee: z.number().min(0).optional(),
    freeShippingThreshold: z.number().min(0).optional(),
    lowStockAlertThreshold: z.number().int().positive().optional(),
    currency: z.string().optional(),
  }),
});
