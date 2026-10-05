import { useCart } from '../../context/CartContext';
import { formatINR } from '../../utils/currency';
import { describeCoupon } from './CouponField';

// Subtotal → Coupon Discount → Final Amount. Display only: the backend recalculates every figure when the order is placed.
export function PriceBreakdown() {
  const { subtotal, discount, coupon, shippingFee, total } = useCart();

  return (
    <div className="space-y-3 border-t border-[#E2DDD6] pt-4">
      <div className="flex justify-between text-sm">
        <span className="text-[#8A8580]">Subtotal</span>
        <span className="text-[#111111]">{formatINR(subtotal)}</span>
      </div>
      {coupon && (
        <div className="flex justify-between gap-3 text-sm text-green-700">
          <span>
            Coupon Discount ({coupon.code})
            <span className="block text-[11px] text-green-600">{describeCoupon(coupon)}</span>
          </span>
          <span className="flex-shrink-0">−{formatINR(discount)}</span>
        </div>
      )}
      {coupon && (
        <div className="flex justify-between text-sm">
          <span className="text-[#8A8580]">Amount after discount</span>
          <span className="text-[#111111]">{formatINR(Math.max(0, subtotal - discount))}</span>
        </div>
      )}
      <div className="flex justify-between text-sm">
        <span className="text-[#8A8580]">Shipping</span>
        <span className="text-[#111111]">{shippingFee > 0 ? formatINR(shippingFee) : 'Free'}</span>
      </div>
      <div className="flex justify-between font-medium text-base border-t border-[#E2DDD6] pt-3">
        <span className="font-serif text-[#111111]">Final Amount</span>
        <span className="text-[#111111]">{formatINR(total)}</span>
      </div>
    </div>
  );
}
