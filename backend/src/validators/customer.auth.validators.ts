import { z } from "zod";

export const customerRegisterSchema = z.object({
  body: z.object({
    name: z.string().min(2, "Name must be at least 2 characters long"),
    email: z.string().email("Invalid email address"),
    phone: z.string().min(10, "Phone number must be at least 10 digits").optional(),
    password: z.string().min(8, "Password must be at least 8 characters long").max(128),
  }),
});

export const customerLoginSchema = z.object({
  body: z.object({
    email: z.string().email("Invalid email address"),
    password: z.string().min(1, "Password is required"),
  }),
});

export const customerUpdateProfileSchema = z.object({
  body: z.object({
    name: z.string().min(2, "Name must be at least 2 characters long").optional(),
    phone: z.string().min(10, "Phone number must be at least 10 digits").optional(),
  }),
});
