import { useCart } from '../../context/CartContext';
import { formatINR } from '../../utils/currency';
import { describeCoupon, couponRate } from './CouponField';

// Subtotal → Coupon Discount → Final Amount. Display only: the backend recalculates every figure when the order is placed.
export function PriceBreakdown() {
  const { subtotal, discount, coupon, shippingFee, total } = useCart();

  return (
    <div className="space-y-3 border-t border-[#E4DDD2] pt-4">
      <div className="flex justify-between text-sm">
        <span className="text-[#8C8178]">Subtotal</span>
        <span className="text-[#1F1A16]">{formatINR(subtotal)}</span>
      </div>
      {coupon && (
        <div className="flex justify-between gap-3 text-sm text-green-700">
          <span>
            Coupon discount{' '}
            <span className="font-medium">({coupon.code}{couponRate(coupon) ? ` · ${couponRate(coupon)}` : ''})</span>
            {coupon.discountType === 'PERCENTAGE' && coupon.maximumDiscountAmount && (
              <span className="block text-[11px] text-green-600">{describeCoupon(coupon)}</span>
            )}
          </span>
          <span className="flex-shrink-0 font-medium">−{formatINR(discount)}</span>
        </div>
      )}
      {coupon && (
        <div className="flex justify-between text-sm">
          <span className="text-[#8C8178]">Amount after discount</span>
          <span className="text-[#1F1A16]">{formatINR(Math.max(0, subtotal - discount))}</span>
        </div>
      )}
      <div className="flex justify-between text-sm">
        <span className="text-[#8C8178]">Shipping</span>
        <span className="text-[#1F1A16]">{shippingFee > 0 ? formatINR(shippingFee) : 'Free'}</span>
      </div>
      <div className="flex justify-between font-medium text-base border-t border-[#E4DDD2] pt-3">
        <span className="font-serif text-[#1F1A16]">Final Amount</span>
        <span className="text-[#1F1A16]">{formatINR(total)}</span>
      </div>
    </div>
  );
}
