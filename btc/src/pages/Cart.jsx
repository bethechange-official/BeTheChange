import { Link, useNavigate } from 'react-router-dom';
import { Trash2 } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { QuantitySelector } from '../components/ui/QuantitySelector';
import { Button } from '../components/ui/Button';
import { CouponField } from '../components/cart/CouponField';
import { PriceBreakdown } from '../components/cart/PriceBreakdown';

export default function Cart() {
  const { items, updateQuantity, removeFromCart } = useCart();
  const navigate = useNavigate();

  const handleProceedCheckout = (e) => {
    e.preventDefault();
    navigate('/checkout');
  };

  if (items.length === 0) {
    return (
      <main className="min-h-screen bg-[#F8F5F0] flex items-center justify-center">
        <div className="text-center py-20">
          <h1 className="font-serif text-4xl text-[#8C8178] mb-4">Your bag is empty.</h1>
          <p className="text-sm text-[#8C8178] mb-8 font-light">Discover our skincare rituals.</p>
          <Button as={Link} to="/shop">Shop Now</Button>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#F8F5F0]">
      <div className="max-w-[1400px] mx-auto px-6 md:px-10 py-12 md:py-16">
        <h1 className="font-serif text-4xl md:text-5xl text-[#1F1A16] mb-10">Your Bag</h1>

        <div className="grid lg:grid-cols-3 gap-10 lg:gap-16">
          {/* Items */}
          <div className="lg:col-span-2 space-y-6">
            {/* Header */}
            <div className="hidden md:grid grid-cols-12 gap-4 text-[10px] tracking-widest uppercase text-[#8C8178] pb-3 border-b border-[#E4DDD2]">
              <span className="col-span-6">Product</span>
              <span className="col-span-2 text-center">Price</span>
              <span className="col-span-2 text-center">Qty</span>
              <span className="col-span-2 text-right">Total</span>
            </div>

            {items.map(item => (
              <div key={item.id} className="grid grid-cols-12 gap-4 items-center py-4 border-b border-[#E4DDD2]">
                <div className="col-span-12 md:col-span-6 flex gap-4 items-center">
                  <Link to={`/product/${item.slug || item.id}`} className="w-16 h-20 bg-[#EFE9E0] flex-shrink-0 overflow-hidden">
                    {(item.images?.[0] || item.image) && <img src={item.images?.[0] || item.image} alt={item.name} className="w-full h-full object-cover" />}
                  </Link>
                  <div>
                    <p className="text-[10px] tracking-widest uppercase text-[#8C8178]">{item.category}</p>
                    <Link to={`/product/${item.slug || item.id}`}>
                      <p className="font-serif text-base text-[#1F1A16] hover:opacity-70 transition-opacity">{item.name}</p>
                    </Link>
                    <p className="text-xs text-[#8C8178]">{item.size}</p>
                  </div>
                </div>
                <div className="col-span-4 md:col-span-2 text-sm text-[#1F1A16] md:text-center">
                  ₹{Number(item.price).toLocaleString()}
                </div>
                <div className="col-span-5 md:col-span-2 flex md:justify-center">
                  <QuantitySelector
                    qty={item.qty}
                    onIncrease={() => updateQuantity(item.id, item.qty + 1)}
                    onDecrease={() => updateQuantity(item.id, item.qty - 1)}
                    max={item.stock}
                  />
                </div>
                <div className="col-span-3 md:col-span-2 flex items-center justify-end gap-3">
                  <span className="text-sm font-medium text-[#1F1A16]">₹{(Number(item.price) * item.qty).toLocaleString()}</span>
                  <button onClick={() => removeFromCart(item.id)} className="text-[#8C8178] hover:text-red-500 transition-colors">
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Summary */}
          <div className="bg-white p-6 md:p-8 border border-[#E4DDD2] h-fit">
            <h2 className="font-serif text-2xl text-[#1F1A16] mb-6">Order Summary</h2>

            <CouponField />
            <PriceBreakdown />

            <Button onClick={handleProceedCheckout} className="w-full mt-6 py-4 text-[11px] tracking-[0.25em]">
              Proceed to Checkout
            </Button>
            
            <Link to="/shop" className="block text-center text-[11px] tracking-widest uppercase text-[#8C8178] hover:text-[#1F1A16] mt-4 transition-colors">
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
