import { useState } from 'react';
import { Tag, X } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { formatINR } from '../../utils/currency';

export const describeCoupon = (coupon) => {
  if (!coupon?.discountType) return '';
  const base = coupon.discountType === 'PERCENTAGE'
    ? `${coupon.discountValue}% off`
    : `${formatINR(coupon.discountValue)} off`;
  const cap = coupon.discountType === 'PERCENTAGE' && coupon.maximumDiscountAmount
    ? ` (up to ${formatINR(coupon.maximumDiscountAmount)})`
    : '';
  return base + cap;
};

export function CouponField() {
  const { coupon, discount, couponError, applyCoupon, removeCoupon } = useCart();
  const [input, setInput] = useState('');
  const [applying, setApplying] = useState(false);

  const handleApply = async () => {
    if (!input.trim() || applying) return;
    setApplying(true);
    const res = await applyCoupon(input);
    setApplying(false);
    if (res.success) setInput('');
  };

  const handleKeyDown = (e) => {
    // The field sits inside the checkout <form>; Enter should apply the coupon, not place the order.
    if (e.key === 'Enter') {
      e.preventDefault();
      handleApply();
    }
  };

  return (
    <div className="mb-6">
      <p className="text-[10px] tracking-widest uppercase text-[#8A8580] mb-3">Coupon Code</p>
      {coupon ? (
        <div className="flex items-center justify-between gap-3 bg-green-50 border border-green-200 px-4 py-3">
          <div className="flex items-start gap-2 min-w-0">
            <Tag size={14} className="text-green-700 mt-0.5 flex-shrink-0" />
            <div className="min-w-0">
              <p className="text-xs font-semibold text-green-800 tracking-wider">{coupon.code}</p>
              <p className="text-[11px] text-green-700">
                {describeCoupon(coupon)} · You save {formatINR(discount)}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={removeCoupon}
            className="flex items-center gap-1 text-xs text-red-600 hover:text-red-800 flex-shrink-0"
            aria-label={`Remove coupon ${coupon.code}`}
          >
            <X size={12} /> Remove
          </button>
        </div>
      ) : (
        <div className="flex gap-2">
          <input
            value={input}
            onChange={e => setInput(e.target.value.toUpperCase())}
            onKeyDown={handleKeyDown}
            placeholder="Enter code"
            aria-label="Coupon code"
            className="flex-1 min-w-0 border border-[#E2DDD6] px-3 py-2.5 text-sm uppercase focus:outline-none focus:border-[#111111] transition-colors"
          />
          <button
            type="button"
            onClick={handleApply}
            disabled={applying || !input.trim()}
            className="px-4 py-2.5 bg-[#111111] text-white text-[10px] tracking-widest uppercase hover:bg-[#2a2a2a] transition-colors disabled:opacity-50"
          >
            {applying ? 'Applying…' : 'Apply'}
          </button>
        </div>
      )}
      {couponError && <p className="text-xs text-red-600 mt-2" role="alert">{couponError}</p>}
    </div>
  );
}
