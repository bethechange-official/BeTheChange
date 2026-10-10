import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { X, Trash2 } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { QuantitySelector } from '../ui/QuantitySelector';
import { Button } from '../ui/Button';
import { formatINR } from '../../utils/currency';
import { couponRate } from './CouponField';

export function CartDrawer({ isOpen, onClose }) {
  const { items, subtotal, total, discount, coupon, itemCount, shippingFee, freeShippingThreshold, updateQuantity, removeFromCart } = useCart();
  const [busyId, setBusyId] = useState(null);
  const [itemError, setItemError] = useState(null); // { id, message }

  // Every change goes to the server; the cart then reloads from it, so the bag, cart page and checkout agree.
  const change = async (item, action) => {
    setBusyId(item.id);
    setItemError(null);
    const result = await action();
    if (!result?.success) setItemError({ id: item.id, message: result?.message || 'Could not update your bag. Please try again.' });
    setBusyId(null);
  };
  const amountForFreeShipping = freeShippingThreshold > 0 ? freeShippingThreshold - Math.max(0, subtotal - discount) : 0;

  useEffect(() => {
    if (isOpen) document.body.style.overflow = 'hidden';
    else document.body.style.overflow = '';
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  return (
    <>
      {isOpen && <div className="fixed inset-0 bg-black/30 z-[90] backdrop-blur-sm" onClick={onClose} />}
      <div className={`fixed top-0 right-0 h-full w-full max-w-md bg-white z-[100] flex flex-col shadow-2xl transition-transform duration-500 ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>
        <div className="flex items-center justify-between px-6 py-5 border-b border-[#E4DDD2]">
          <h2 className="font-serif text-xl text-[#1F1A16]">Your Bag ({itemCount})</h2>
          <button onClick={onClose} className="text-[#8C8178] hover:text-[#1F1A16] transition-colors">
            <X size={18} />
          </button>
        </div>

        {items.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center gap-4 px-6">
            <p className="font-serif text-2xl text-[#8C8178]">Your bag is empty.</p>
            <Button variant="outline" onClick={onClose} as={Link} to="/shop">Shop Now</Button>
          </div>
        ) : (
          <>
            <div className="flex-1 overflow-y-auto px-6 py-4 space-y-6">
              {items.map(item => (
                <div key={item.id} className={`flex gap-4 transition-opacity ${busyId === item.id ? 'opacity-60 pointer-events-none' : ''}`}>
                  <Link to={`/product/${item.id}`} onClick={onClose} className="w-20 h-24 bg-[#EFE9E0] flex-shrink-0 overflow-hidden">
                    <img src={item.images[0]} alt={item.name} className="w-full h-full object-cover" />
                  </Link>
                  <div className="flex-1 flex flex-col justify-between">
                    <div>
                      <p className="text-[10px] tracking-widest uppercase text-[#8C8178]">{item.category}</p>
                      <Link to={`/product/${item.id}`} onClick={onClose}>
                        <p className="font-serif text-sm text-[#1F1A16] leading-snug mt-0.5">{item.name}</p>
                      </Link>
                      <p className="text-xs text-[#8C8178] mt-0.5">{item.size}</p>
                    </div>
                    <div className="flex items-center justify-between">
                      <QuantitySelector
                        qty={item.qty}
                        max={item.stock}
                        onIncrease={() => change(item, () => updateQuantity(item.id, item.qty + 1))}
                        onDecrease={() => change(item, () => updateQuantity(item.id, item.qty - 1))}
                      />
                      <div className="flex items-center gap-3">
                        <span className="text-sm font-medium text-[#1F1A16]">{formatINR(item.price * item.qty)}</span>
                        <button
                          onClick={() => change(item, () => removeFromCart(item.id))}
                          className="text-[#8C8178] hover:text-red-500 transition-colors"
                          aria-label={`Remove ${item.name} from bag`}
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </div>
                    {itemError?.id === item.id && <p className="text-[11px] text-red-600 mt-1">{itemError.message}</p>}
                  </div>
                </div>
              ))}
            </div>

            <div className="border-t border-[#E4DDD2] px-6 py-5 space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-[#8C8178]">Subtotal</span>
                <span className="font-medium text-[#1F1A16]">{formatINR(subtotal)}</span>
              </div>
              {coupon && (
                <div className="flex justify-between text-sm text-green-700">
                  <span>Coupon discount <span className="font-medium">({coupon.code}{couponRate(coupon) ? ` · ${couponRate(coupon)}` : ''})</span></span>
                  <span className="font-medium">−{formatINR(discount)}</span>
                </div>
              )}
              <div className="flex justify-between text-sm">
                <span className="text-[#8C8178]">Shipping</span>
                <span className="text-[#1F1A16]">{shippingFee > 0 ? formatINR(shippingFee) : 'Free'}</span>
              </div>
              {shippingFee > 0 && amountForFreeShipping > 0 && (
                <p className="text-[11px] text-[#A2785A]">Add {formatINR(amountForFreeShipping)} more for free shipping.</p>
              )}
              <div className="flex justify-between font-medium text-base border-t border-[#E4DDD2] pt-3">
                <span className="font-serif text-[#1F1A16]">Total</span>
                <span className="text-[#1F1A16]">{formatINR(total)}</span>
              </div>
              <Link to="/cart" onClick={onClose}>
                <Button className="w-full mt-2">View Bag & Checkout</Button>
              </Link>
            </div>
          </>
        )}
      </div>
    </>
  );
}
