import path from "path";
import dotenv from "dotenv";
import { z } from "zod";

dotenv.config();

const postgresUrl = z.string().refine((value) => /^postgres(ql)?:\/\//.test(value), "must be a PostgreSQL connection URL");

const schema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  PORT: z.coerce.number().int().min(1).max(65535).default(5000),
  DATABASE_URL: postgresUrl,
  DIRECT_URL: postgresUrl,
  JWT_SECRET: z.string().min(32, "JWT_SECRET must be at least 32 characters"),
  JWT_EXPIRES_IN: z.string().default("15m"),
  REFRESH_TOKEN_SECRET: z.string().min(32, "REFRESH_TOKEN_SECRET must be at least 32 characters"),
  REFRESH_TOKEN_EXPIRES_IN: z.string().default("7d"),
  FRONTEND_URL: z.string().default("http://localhost:5173"),
  STORAGE_PATH: z.string().optional(),
  PUBLIC_STORAGE_URL: z.string().url().optional(),
  COOKIE_DOMAIN: z.string().optional(),
  TRUST_PROXY: z.coerce.number().int().min(0).default(1),
  SEED_ADMIN_EMAIL: z.string().email().optional(),
  SEED_ADMIN_PASSWORD: z.string().min(12).optional(),
});

const parsed = schema.safeParse(process.env);
if (!parsed.success) {
  const details = parsed.error.issues.map((issue) => `${issue.path.join(".")}: ${issue.message}`).join("; ");
  throw new Error(`Invalid environment configuration: ${details}`);
}

const values = parsed.data;
const frontendOrigins = values.FRONTEND_URL.split(",")
  .map((origin) => origin.trim().replace(/\/$/, ""))
  .filter(Boolean);

export const env = {
  ...values,
  FRONTEND_ORIGINS: frontendOrigins,
  STORAGE_PATH: path.resolve(values.STORAGE_PATH || path.join(process.cwd(), "..", "uploads")),
};
