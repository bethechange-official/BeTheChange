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
  // WhatsApp Business Cloud API (Meta) — admin notification for every new order. Off until token + phone ID are set.
  // Empty values (e.g. copied blank from .env.example) mean "not configured", not an invalid config.
  WHATSAPP_ACCESS_TOKEN: z.preprocess((v) => (v === "" ? undefined : v), z.string().min(1).optional()),
  WHATSAPP_PHONE_NUMBER_ID: z.preprocess((v) => (v === "" ? undefined : v), z.string().min(1).optional()),
  ADMIN_WHATSAPP_NUMBER: z.string().regex(/^\d{10,15}$/, "ADMIN_WHATSAPP_NUMBER must be digits with country code, e.g. 916300836017").default("916300836017"),
  // "template" works any time (needs an approved template); "text" only within 24h of the admin messaging the business number.
  WHATSAPP_MESSAGE_MODE: z.enum(["template", "text"]).default("template"),
  WHATSAPP_ORDER_TEMPLATE: z.string().default("new_order_alert"),
  WHATSAPP_TEMPLATE_LANGUAGE: z.string().default("en"),
  WHATSAPP_API_URL: z.string().url().default("https://graph.facebook.com/v21.0"),
  SEED_ADMIN_EMAIL: z.string().email().optional(),
  SEED_ADMIN_PASSWORD: z.string().min(12, "SEED_ADMIN_PASSWORD must be at least 12 characters").optional(),
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
