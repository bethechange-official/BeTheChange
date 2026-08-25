import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { CheckoutAuthModal } from '../components/cart/CheckoutAuthModal';
import { User } from 'lucide-react';

function generateOrderId() {
  return 'BTC' + Date.now().toString().slice(-8).toUpperCase();
}

export default function Checkout() {
  const { items, subtotal, total, discount, coupon, dispatch } = useCart();
  const { user, saveOrder } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [authModalOpen, setAuthModalOpen] = useState(false);

  const [form, setForm] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    address: user?.address || '',
    city: '',
    state: '',
    pincode: ''
  });

  useEffect(() => {
    if (user) {
      setForm(f => ({
        ...f,
        name: f.name || user.name || '',
        email: f.email || user.email || '',
        phone: f.phone || user.phone || '',
        address: f.address || user.address || ''
      }));
    }
  }, [user]);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = 'Required';
    if (!form.email.includes('@')) e.email = 'Valid email required';
    if (form.phone.length < 10) e.phone = 'Valid phone required';
    if (!form.address.trim()) e.address = 'Required';
    if (!form.city.trim()) e.city = 'Required';
    if (!form.state.trim()) e.state = 'Required';
    if (form.pincode.length < 6) e.pincode = 'Valid pincode required';
    return e;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setLoading(true);
    const orderId = generateOrderId();
    const orderData = { orderId, items, subtotal, discount, total, customer: form, coupon };
    setTimeout(() => {
      saveOrder(orderData);
      dispatch({ type: 'CLEAR' });
      navigate('/order-success', { state: orderData });
    }, 1200);
  };

  if (items.length === 0) {
    navigate('/cart');
    return null;
  }

  return (
    <main className="pt-18 md:pt-22 pb-24 min-h-screen bg-[#FAF9F6] text-[#111111]">
      <div className="max-w-[1200px] mx-auto px-6 md:px-10">
        <h1 className="font-serif text-4xl md:text-5xl text-[#111111] mb-8">Checkout</h1>

        {/* Guest checkout warning banner if not logged in */}
        {!user && (
          <div className="mb-8 p-5 bg-white border border-[#E2DDD6] flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-2xs">
            <div className="flex items-center gap-4">
              <div className="w-9 h-9 rounded-full bg-[#111111] text-white flex items-center justify-center font-serif text-sm flex-shrink-0">
                <User size={16} />
              </div>
              <div>
                <p className="text-xs font-semibold text-[#111111] uppercase tracking-wider">Checking out as Guest</p>
                <p className="text-xs text-[#666666] font-light mt-0.5">Sign in to save order history, track shipping, and use prefilled details.</p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setAuthModalOpen(true)}
              className="px-5 py-2.5 bg-[#111111] text-white hover:bg-[#2A2A2A] text-[10px] tracking-[0.2em] uppercase font-semibold transition-all self-start sm:self-auto"
            >
              Sign In / Register
            </button>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="grid lg:grid-cols-3 gap-10 lg:gap-16">
            {/* Form */}
            <div className="lg:col-span-2 space-y-10">
              <div>
                <h2 className="font-serif text-2xl text-[#111111] mb-6">Customer Information</h2>
                <div className="grid md:grid-cols-2 gap-4">
                  <Input label="Full Name" value={form.name} onChange={e => set('name', e.target.value)} error={errors.name} placeholder="Your full name" />
                  <Input label="Email" type="email" value={form.email} onChange={e => set('email', e.target.value)} error={errors.email} placeholder="your@email.com" />
                  <Input label="Phone Number" type="tel" value={form.phone} onChange={e => set('phone', e.target.value)} error={errors.phone} placeholder="+91 00000 00000" />
                </div>
              </div>

              <div>
                <h2 className="font-serif text-2xl text-[#111111] mb-6">Delivery Address</h2>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <Input label="Address" value={form.address} onChange={e => set('address', e.target.value)} error={errors.address} placeholder="Street address, apartment, etc." />
                  </div>
                  <Input label="City" value={form.city} onChange={e => set('city', e.target.value)} error={errors.city} placeholder="City" />
                  <Input label="State" value={form.state} onChange={e => set('state', e.target.value)} error={errors.state} placeholder="State" />
                  <Input label="Pincode" value={form.pincode} onChange={e => set('pincode', e.target.value)} error={errors.pincode} placeholder="000000" maxLength={6} />
                </div>
              </div>
            </div>

            {/* Summary */}
            <div className="bg-white p-6 md:p-8 border border-[#E2DDD6] h-fit">
              <h2 className="font-serif text-2xl text-[#111111] mb-6">Order Summary</h2>
              <div className="space-y-4 mb-6">
                {items.map(item => (
                  <div key={item.id} className="flex gap-3 items-center">
                    <div className="w-12 h-14 bg-[#F3EFE8] flex-shrink-0 overflow-hidden">
                      <img src={item.images[0]} alt={item.name} className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-serif text-sm text-[#111111] truncate">{item.name}</p>
                      <p className="text-xs text-[#8A8580]">Qty: {item.qty}</p>
                    </div>
                    <span className="text-sm text-[#111111] flex-shrink-0">₹{(item.price * item.qty).toLocaleString()}</span>
                  </div>
                ))}
              </div>
              <div className="space-y-2 border-t border-[#E2DDD6] pt-4">
                <div className="flex justify-between text-sm">
                  <span className="text-[#8A8580]">Subtotal</span>
                  <span>₹{subtotal.toLocaleString()}</span>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between text-sm text-green-700">
                    <span>Discount ({coupon?.code})</span>
                    <span>-₹{discount.toLocaleString()}</span>
                  </div>
                )}
                <div className="flex justify-between text-sm">
                  <span className="text-[#8A8580]">Shipping</span>
                  <span>Free</span>
                </div>
                <div className="flex justify-between font-medium text-base border-t border-[#E2DDD6] pt-3">
                  <span className="font-serif">Total</span>
                  <span>₹{total.toLocaleString()}</span>
                </div>
              </div>
              <Button type="submit" loading={loading} className="w-full mt-6">
                Place Order
              </Button>
              <p className="text-[10px] text-[#8A8580] text-center mt-3 leading-relaxed">
                By placing your order, you agree to our Terms & Privacy Policy.
              </p>
            </div>
          </div>
        </form>
      </div>

      <CheckoutAuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
      />
    </main>
  );
}
