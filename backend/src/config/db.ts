import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma = globalForPrisma.prisma ?? new PrismaClient({
  log: process.env.NODE_ENV === "development" ? ["query", "error", "warn"] : ["error"],
});

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

// Settings cache
let settingsCache: Record<string, string> | null = null;
let settingsCacheTime = 0;
const SETTINGS_TTL = 60_000;

export const getCachedSettings = async (keys: string[]): Promise<Record<string, string>> => {
  const now = Date.now();
  if (settingsCache && now - settingsCacheTime < SETTINGS_TTL) {
    const cache = settingsCache;
    return Object.fromEntries(keys.map((k) => [k, cache[k] ?? "0"]));
  }
  const rows = await prisma.setting.findMany();
  settingsCache = Object.fromEntries(rows.map((r) => [r.key, r.value]));
  settingsCacheTime = now;
  const cache = settingsCache;
  return Object.fromEntries(keys.map((k) => [k, cache[k] ?? "0"]));
};

export const invalidateSettingsCache = () => {
  settingsCache = null;
};

// Auth identity cache (short TTL — 30s)
type CachedIdentity = { id: string; email: string; name: string; role: string; isActive: boolean; type: "admin" | "user" };
const identityCache = new Map<string, { data: CachedIdentity; expiresAt: number }>();
const IDENTITY_TTL = 30_000;

export const getCachedIdentity = async (id: string, type: "admin" | "user"): Promise<CachedIdentity | null> => {
  const key = `${type}:${id}`;
  const cached = identityCache.get(key);
  if (cached && Date.now() < cached.expiresAt) return cached.data;

  let identity: CachedIdentity | null = null;
  if (type === "admin") {
    const admin = await prisma.admin.findUnique({ where: { id }, select: { id: true, email: true, name: true, role: true, isActive: true } });
    if (admin) identity = { ...admin, type: "admin" };
  } else {
    const user = await prisma.user.findUnique({ where: { id }, select: { id: true, email: true, name: true, role: true, isActive: true } });
    if (user) identity = { ...user, type: "user" };
  }

  if (identity) identityCache.set(key, { data: identity, expiresAt: Date.now() + IDENTITY_TTL });
  return identity;
};

export const invalidateIdentityCache = (id: string, type: "admin" | "user") => {
  identityCache.delete(`${type}:${id}`);
};

// Failed login attempt tracking (in-memory, per IP)
const failedAttempts = new Map<string, { count: number; lockedUntil: number }>();
const MAX_FAILED = 5;
const LOCKOUT_MS = 15 * 60 * 1000; // 15 minutes

export const checkLoginAttempts = (ip: string): void => {
  const entry = failedAttempts.get(ip);
  if (entry && Date.now() < entry.lockedUntil) {
    const mins = Math.ceil((entry.lockedUntil - Date.now()) / 60000);
    throw new Error(`Too many failed attempts. Try again in ${mins} minute(s).`);
  }
};

export const recordFailedLogin = (ip: string): void => {
  const entry = failedAttempts.get(ip) ?? { count: 0, lockedUntil: 0 };
  entry.count += 1;
  if (entry.count >= MAX_FAILED) entry.lockedUntil = Date.now() + LOCKOUT_MS;
  failedAttempts.set(ip, entry);
};

export const clearFailedLogin = (ip: string): void => {
  failedAttempts.delete(ip);
};