import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { X, Trash2 } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { QuantitySelector } from '../ui/QuantitySelector';
import { Button } from '../ui/Button';

export function CartDrawer({ isOpen, onClose }) {
  const { items, subtotal, total, discount, coupon, itemCount, dispatch } = useCart();

  useEffect(() => {
    if (isOpen) document.body.style.overflow = 'hidden';
    else document.body.style.overflow = '';
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  return (
    <>
      {isOpen && <div className="fixed inset-0 bg-black/30 z-[90] backdrop-blur-sm" onClick={onClose} />}
      <div className={`fixed top-0 right-0 h-full w-full max-w-md bg-white z-[100] flex flex-col shadow-2xl transition-transform duration-500 ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>
        <div className="flex items-center justify-between px-6 py-5 border-b border-[#E2DDD6]">
          <h2 className="font-serif text-xl text-[#111111]">Your Bag ({itemCount})</h2>
          <button onClick={onClose} className="text-[#8A8580] hover:text-[#111111] transition-colors">
            <X size={18} />
          </button>
        </div>

        {items.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center gap-4 px-6">
            <p className="font-serif text-2xl text-[#8A8580]">Your bag is empty.</p>
            <Button variant="outline" onClick={onClose} as={Link} to="/shop">Shop Now</Button>
          </div>
        ) : (
          <>
            <div className="flex-1 overflow-y-auto px-6 py-4 space-y-6">
              {items.map(item => (
                <div key={item.id} className="flex gap-4">
                  <Link to={`/product/${item.id}`} onClick={onClose} className="w-20 h-24 bg-[#F3EFE8] flex-shrink-0 overflow-hidden">
                    <img src={item.images[0]} alt={item.name} className="w-full h-full object-cover" />
                  </Link>
                  <div className="flex-1 flex flex-col justify-between">
                    <div>
                      <p className="text-[10px] tracking-widest uppercase text-[#8A8580]">{item.category}</p>
                      <Link to={`/product/${item.id}`} onClick={onClose}>
                        <p className="font-serif text-sm text-[#111111] leading-snug mt-0.5">{item.name}</p>
                      </Link>
                      <p className="text-xs text-[#8A8580] mt-0.5">{item.size}</p>
                    </div>
                    <div className="flex items-center justify-between">
                      <QuantitySelector
                        qty={item.qty}
                        onIncrease={() => dispatch({ type: 'UPDATE_QTY', id: item.id, qty: item.qty + 1 })}
                        onDecrease={() => dispatch({ type: 'UPDATE_QTY', id: item.id, qty: item.qty - 1 })}
                      />
                      <div className="flex items-center gap-3">
                        <span className="text-sm font-medium text-[#111111]">₹{(item.price * item.qty).toLocaleString()}</span>
                        <button onClick={() => dispatch({ type: 'REMOVE', id: item.id })} className="text-[#8A8580] hover:text-red-500 transition-colors">
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="border-t border-[#E2DDD6] px-6 py-5 space-y-3">
              {coupon && (
                <div className="flex justify-between text-xs text-green-700">
                  <span>Coupon: {coupon.code}</span>
                  <span>-₹{discount.toLocaleString()}</span>
                </div>
              )}
              <div className="flex justify-between text-sm">
                <span className="text-[#8A8580]">Subtotal</span>
                <span className="font-medium text-[#111111]">₹{subtotal.toLocaleString()}</span>
              </div>
              <div className="flex justify-between font-medium text-base border-t border-[#E2DDD6] pt-3">
                <span className="font-serif text-[#111111]">Total</span>
                <span className="text-[#111111]">₹{total.toLocaleString()}</span>
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
