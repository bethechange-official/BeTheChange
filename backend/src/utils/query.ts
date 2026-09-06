export const getQueryString = (val: unknown): string | undefined => {
  if (!val) return undefined;
  if (Array.isArray(val)) return val[0] as string;
  if (typeof val === 'object') return undefined;
  return val as string;
};

export const getQueryInt = (val: unknown, defaultVal: number): number => {
  const str = getQueryString(val);
  if (!str) return defaultVal;
  const parsed = parseInt(str, 10);
  return isNaN(parsed) ? defaultVal : parsed;
};