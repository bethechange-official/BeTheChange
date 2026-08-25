export const coupons = [
  {
    code: "WELCOME10",
    type: "percentage",
    value: 10,
    description: "10% off your first order",
    minOrder: 0
  },
  {
    code: "SAVE500",
    type: "flat",
    value: 500,
    description: "₹500 off on orders above ₹1500",
    minOrder: 1500
  },
  {
    code: "RITUAL15",
    type: "percentage",
    value: 15,
    description: "15% off on orders above ₹2000",
    minOrder: 2000
  }
];

export function applyCoupon(code, subtotal) {
  const coupon = coupons.find(c => c.code === code.toUpperCase());
  if (!coupon) return { valid: false, message: "Invalid coupon code." };
  if (subtotal < coupon.minOrder) {
    return { valid: false, message: `Minimum order of ₹${coupon.minOrder} required.` };
  }
  const discount = coupon.type === "percentage"
    ? Math.round((subtotal * coupon.value) / 100)
    : coupon.value;
  return { valid: true, discount, coupon, message: coupon.description };
}
