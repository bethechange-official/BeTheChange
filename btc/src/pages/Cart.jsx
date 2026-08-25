import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Trash2 } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { QuantitySelector } from '../components/ui/QuantitySelector';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { CheckoutAuthModal } from '../components/cart/CheckoutAuthModal';

export default function Cart() {
  const { items, subtotal, total, discount, coupon, couponError, dispatch } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [couponInput, setCouponInput] = useState('');
  const [authModalOpen, setAuthModalOpen] = useState(false);

  const handleApplyCoupon = () => {
    dispatch({ type: 'APPLY_COUPON', code: couponInput, subtotal });
  };

  const handleProceedCheckout = (e) => {
    e.preventDefault();
    if (user) {
      navigate('/checkout');
    } else {
      setAuthModalOpen(true);
    }
  };

  if (items.length === 0) {
    return (
      <main className="pt-18 md:pt-22 min-h-screen bg-[#FAF9F6] flex items-center justify-center">
        <div className="text-center py-20">
          <h1 className="font-serif text-4xl text-[#8A8580] mb-4">Your bag is empty.</h1>
          <p className="text-sm text-[#8A8580] mb-8 font-light">Discover our skincare rituals.</p>
          <Button as={Link} to="/shop">Shop Now</Button>
        </div>
      </main>
    );
  }

  return (
    <main className="pt-18 md:pt-22 min-h-screen bg-[#FAF9F6]">
      <div className="max-w-[1400px] mx-auto px-6 md:px-10 py-12 md:py-16">
        <h1 className="font-serif text-4xl md:text-5xl text-[#111111] mb-10">Your Bag</h1>

        <div className="grid lg:grid-cols-3 gap-10 lg:gap-16">
          {/* Items */}
          <div className="lg:col-span-2 space-y-6">
            {/* Header */}
            <div className="hidden md:grid grid-cols-12 gap-4 text-[10px] tracking-widest uppercase text-[#8A8580] pb-3 border-b border-[#E2DDD6]">
              <span className="col-span-6">Product</span>
              <span className="col-span-2 text-center">Price</span>
              <span className="col-span-2 text-center">Qty</span>
              <span className="col-span-2 text-right">Total</span>
            </div>

            {items.map(item => (
              <div key={item.id} className="grid grid-cols-12 gap-4 items-center py-4 border-b border-[#E2DDD6]">
                <div className="col-span-12 md:col-span-6 flex gap-4 items-center">
                  <Link to={`/product/${item.id}`} className="w-16 h-20 bg-[#F3EFE8] flex-shrink-0 overflow-hidden">
                    <img src={item.images[0]} alt={item.name} className="w-full h-full object-cover" />
                  </Link>
                  <div>
                    <p className="text-[10px] tracking-widest uppercase text-[#8A8580]">{item.category}</p>
                    <Link to={`/product/${item.id}`}>
                      <p className="font-serif text-base text-[#111111] hover:opacity-70 transition-opacity">{item.name}</p>
                    </Link>
                    <p className="text-xs text-[#8A8580]">{item.size}</p>
                  </div>
                </div>
                <div className="col-span-4 md:col-span-2 text-sm text-[#111111] md:text-center">
                  ₹{item.price.toLocaleString()}
                </div>
                <div className="col-span-5 md:col-span-2 flex md:justify-center">
                  <QuantitySelector
                    qty={item.qty}
                    onIncrease={() => dispatch({ type: 'UPDATE_QTY', id: item.id, qty: item.qty + 1 })}
                    onDecrease={() => dispatch({ type: 'UPDATE_QTY', id: item.id, qty: item.qty - 1 })}
                  />
                </div>
                <div className="col-span-3 md:col-span-2 flex items-center justify-end gap-3">
                  <span className="text-sm font-medium text-[#111111]">₹{(item.price * item.qty).toLocaleString()}</span>
                  <button onClick={() => dispatch({ type: 'REMOVE', id: item.id })} className="text-[#8A8580] hover:text-red-500 transition-colors">
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Summary */}
          <div className="bg-white p-6 md:p-8 border border-[#E2DDD6] h-fit">
            <h2 className="font-serif text-2xl text-[#111111] mb-6">Order Summary</h2>

            {/* Coupon */}
            <div className="mb-6">
              <p className="text-[10px] tracking-widest uppercase text-[#8A8580] mb-3">Coupon Code</p>
              {coupon ? (
                <div className="flex items-center justify-between bg-green-50 border border-green-200 px-4 py-3">
                  <div>
                    <p className="text-xs font-medium text-green-700">{coupon.code}</p>
                    <p className="text-[10px] text-green-600">{coupon.description}</p>
                  </div>
                  <button
                    onClick={() => dispatch({ type: 'REMOVE_COUPON' })}
                    className="text-xs text-red-500 hover:text-red-700 underline"
                  >
                    Remove
                  </button>
                </div>
              ) : (
                <div className="flex gap-2">
                  <input
                    value={couponInput}
                    onChange={e => setCouponInput(e.target.value.toUpperCase())}
                    placeholder="Enter code"
                    className="flex-1 border border-[#E2DDD6] px-3 py-2.5 text-sm focus:outline-none focus:border-[#111111] transition-colors"
                  />
                  <button
                    onClick={handleApplyCoupon}
                    className="px-4 py-2.5 bg-[#111111] text-white text-[10px] tracking-widest uppercase hover:bg-[#2a2a2a] transition-colors"
                  >
                    Apply
                  </button>
                </div>
              )}
              {couponError && <p className="text-xs text-red-500 mt-2">{couponError}</p>}
            </div>

            <div className="space-y-3 border-t border-[#E2DDD6] pt-4">
              <div className="flex justify-between text-sm">
                <span className="text-[#8A8580]">Subtotal</span>
                <span className="text-[#111111]">₹{subtotal.toLocaleString()}</span>
              </div>
              {discount > 0 && (
                <div className="flex justify-between text-sm text-green-700">
                  <span>Discount</span>
                  <span>-₹{discount.toLocaleString()}</span>
                </div>
              )}
              <div className="flex justify-between text-sm">
                <span className="text-[#8A8580]">Shipping</span>
                <span className="text-[#111111]">Free</span>
              </div>
              <div className="flex justify-between font-medium text-base border-t border-[#E2DDD6] pt-3">
                <span className="font-serif text-[#111111]">Total</span>
                <span className="text-[#111111]">₹{total.toLocaleString()}</span>
              </div>
            </div>

            <Button onClick={handleProceedCheckout} className="w-full mt-6 py-4 text-[11px] tracking-[0.25em]">
              Proceed to Checkout
            </Button>
            
            <Link to="/shop" className="block text-center text-[11px] tracking-widest uppercase text-[#8A8580] hover:text-[#111111] mt-4 transition-colors">
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>

      <CheckoutAuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
      />
    </main>
  );
}
