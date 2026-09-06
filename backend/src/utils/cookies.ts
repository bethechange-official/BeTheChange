import { CookieOptions } from "express";
import { env } from "../config/env";

export const refreshCookieOptions: CookieOptions = {
  httpOnly: true,
  secure: env.NODE_ENV === "production",
  sameSite: "lax",
  domain: env.COOKIE_DOMAIN || undefined,
  path: "/api",
  maxAge: 7 * 24 * 60 * 60 * 1000,
};

export const guestCartCookieOptions: CookieOptions = {
  httpOnly: true,
  secure: env.NODE_ENV === "production",
  sameSite: "lax",
  domain: env.COOKIE_DOMAIN || undefined,
  path: "/api",
  maxAge: 30 * 24 * 60 * 60 * 1000,
};
