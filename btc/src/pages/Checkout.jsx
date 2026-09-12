import { useState, useEffect } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { CheckoutAuthModal } from '../components/cart/CheckoutAuthModal';
import { User } from 'lucide-react';
import { addressService } from '../services/addressService';
import { orderService } from '../services/orderService';

export default function Checkout() {
  const { items, subtotal, total, discount, shippingFee, coupon, clearCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [savedAddresses, setSavedAddresses] = useState([]);
  const [selectedAddressId, setSelectedAddressId] = useState('');

  const [form, setForm] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    addressLine1: '',
    addressLine2: '',
    city: '',
    state: '',
    pincode: '',
    isDefault: false,
  });

  useEffect(() => {
    if (user) {
      setForm(f => ({
        ...f,
        name: f.name || user.name || '',
        email: f.email || user.email || '',
        phone: f.phone || user.phone || '',
      }));
      // Load saved addresses
      addressService.getAddresses().then(response => {
        if (response.success) {
          setSavedAddresses(response.data.addresses);
          if (response.data.addresses.length > 0) {
            const defaultAddr = response.data.addresses.find(a => a.isDefault) || response.data.addresses[0];
            setSelectedAddressId(defaultAddr.id);
            setForm(f => ({
              ...f,
              addressLine1: defaultAddr.addressLine1,
              addressLine2: defaultAddr.addressLine2 || '',
              city: defaultAddr.city,
              state: defaultAddr.state,
              pincode: defaultAddr.pincode,
            }));
          }
        }
      });
    }
  }, [user]);

  const set = (k, v) => {
    setForm(f => ({ ...f, [k]: v }));
    // If user manually edits address fields, deselect the saved address
    const addressFields = ['addressLine1', 'addressLine2', 'city', 'state', 'pincode'];
    if (addressFields.includes(k)) {
      setSelectedAddressId('');
    }
  };

  const handleAddressSelect = (address) => {
    setSelectedAddressId(address.id);
    setForm(f => ({
      ...f,
      addressLine1: address.addressLine1,
      addressLine2: address.addressLine2 || '',
      city: address.city,
      state: address.state,
      pincode: address.pincode,
    }));
  };

  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = 'Required';
    if (!form.email.includes('@')) e.email = 'Valid email required';
    if (form.phone.length < 10) e.phone = 'Valid phone required';
    if (!form.addressLine1.trim()) e.addressLine1 = 'Required';
    if (!form.city.trim()) e.city = 'Required';
    if (!form.state.trim()) e.state = 'Required';
    if (form.pincode.length < 6) e.pincode = 'Valid pincode required';
    return e;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setLoading(true);

    try {
      const orderData = {
        addressId: selectedAddressId || undefined,
        name: form.name,
        email: form.email,
        phone: form.phone,
        addressLine1: form.addressLine1,
        addressLine2: form.addressLine2,
        city: form.city,
        state: form.state,
        pincode: form.pincode,
        couponCode: coupon?.code,
        paymentMethod: 'COD',
        saveAddress: Boolean(user && !selectedAddressId && form.isDefault),
      };

      const response = await orderService.createOrder(orderData);

      if (response.success) {
        await clearCart();
        navigate('/order-success', { state: response.data.order });
      } else {
        setErrors({ submit: response.message });
      }
    } catch (error) {
      setErrors({ submit: error.message });
    } finally {
      setLoading(false);
    }
  };

  if (items.length === 0) {
    return <Navigate to="/cart" replace />;
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
                <p className="text-xs text-[#666666] font-light mt-0.5">Sign in to save order history and use prefilled details.</p>
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
          {errors.submit && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 text-sm font-light">
              {errors.submit}
            </div>
          )}
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

                {savedAddresses.length > 0 && (
                  <div className="mb-6">
                    <p className="text-sm text-[#8A8580] mb-3">Select saved address</p>
                    <div className="space-y-2">
                      {savedAddresses.map(addr => (
                        <button
                          key={addr.id}
                          type="button"
                          onClick={() => handleAddressSelect(addr)}
                          className={`w-full p-4 border rounded text-left transition-all ${
                            selectedAddressId === addr.id
                              ? 'border-[#111111] bg-[#FAF9F6]'
                              : 'border-[#E2DDD6] hover:border-[#8A8580]'
                          }`}
                        >
                          <p className="font-medium text-[#111111]">{addr.name}</p>
                          <p className="text-sm text-[#8A8580]">{addr.addressLine1}, {addr.city} - {addr.pincode}</p>
                          <p className="text-sm text-[#8A8580]">{addr.phone}</p>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                <div className="grid md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <Input label="Address Line 1" value={form.addressLine1} onChange={e => set('addressLine1', e.target.value)} error={errors.addressLine1} placeholder="Street address, apartment, etc." />
                  </div>
                  <Input label="Address Line 2 (Optional)" value={form.addressLine2} onChange={e => set('addressLine2', e.target.value)} placeholder="Apartment, suite, etc." />
                  <Input label="City" value={form.city} onChange={e => set('city', e.target.value)} error={errors.city} placeholder="City" />
                  <Input label="State" value={form.state} onChange={e => set('state', e.target.value)} error={errors.state} placeholder="State" />
                  <Input label="Pincode" value={form.pincode} onChange={e => set('pincode', e.target.value)} error={errors.pincode} placeholder="000000" maxLength={6} />
                </div>

                {user && (
                  <div className="flex items-center gap-2 mt-2">
                    <input
                      type="checkbox"
                      id="saveAddress"
                      checked={form.isDefault}
                      onChange={e => set('isDefault', e.target.checked)}
                      className="w-4 h-4 text-[#111111] border-[#E2DDD6] rounded focus:ring-[#111111]"
                    />
                    <label htmlFor="saveAddress" className="text-sm text-[#8A8580]">Save as default address</label>
                  </div>
                )}
              </div>
            </div>

            {/* Summary */}
            <div className="bg-white p-6 md:p-8 border border-[#E2DDD6] h-fit">
              <h2 className="font-serif text-2xl text-[#111111] mb-6">Order Summary</h2>
              <div className="space-y-4 mb-6">
                {items.map(item => (
                  <div key={item.id} className="flex gap-3 items-center">
                    <div className="w-12 h-14 bg-[#F3EFE8] flex-shrink-0 overflow-hidden">
                      <img src={item.images?.[0] || item.image} alt={item.name} className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-serif text-sm text-[#111111] truncate">{item.name}</p>
                      <p className="text-xs text-[#8A8580]">Qty: {item.qty}</p>
                    </div>
                    <span className="text-sm text-[#111111] flex-shrink-0">₹{(Number(item.price) * item.qty).toLocaleString()}</span>
                  </div>
                ))}
              </div>
              <div className="space-y-2 border-t border-[#E2DDD6] pt-4">
                <div className="flex justify-between text-sm">
                  <span className="text-[#8A8580]">Subtotal</span>
                  <span>₹{Number(subtotal).toLocaleString()}</span>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between text-sm text-green-700">
                    <span>Discount ({coupon?.code})</span>
                    <span>-₹{Number(discount).toLocaleString()}</span>
                  </div>
                )}
                <div className="flex justify-between text-sm">
                  <span className="text-[#8A8580]">Shipping</span>
                  <span>{shippingFee > 0 ? `₹${Number(shippingFee).toLocaleString()}` : 'Free'}</span>
                </div>
                <div className="flex justify-between font-medium text-base border-t border-[#E2DDD6] pt-3">
                  <span className="font-serif">Total</span>
                  <span>₹{Number(total).toLocaleString()}</span>
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
