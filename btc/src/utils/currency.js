// ₹1,234 or ₹1,234.50 — paise only shown when present.
export const formatINR = (value) =>
  `₹${Number(value || 0).toLocaleString('en-IN', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`;
