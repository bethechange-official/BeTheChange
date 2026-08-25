import { useLocation, Link } from 'react-router-dom';
import { CheckCircle } from 'lucide-react';
import { Button } from '../components/ui/Button';

export default function OrderSuccess() {
  const { state } = useLocation();

  if (!state) {
    return (
      <main className="pt-24 min-h-screen flex items-center justify-center bg-[#FAF9F6]">
        <div className="text-center">
          <p className="font-serif text-3xl text-[#8A8580]">No order found.</p>
          <Link to="/" className="text-sm text-[#111111] underline mt-4 block">Go Home</Link>
        </div>
      </main>
    );
  }

  const { orderId, items, subtotal, discount, total, customer } = state;

  return (
    <main className="pt-18 md:pt-22 min-h-screen bg-[#FAF9F6]">
      <div className="max-w-[700px] mx-auto px-6 md:px-10 py-16 md:py-24">
        <div className="text-center mb-12">
          <div className="w-16 h-16 rounded-full bg-[#111111] flex items-center justify-center mx-auto mb-6">
            <CheckCircle size={28} className="text-white" />
          </div>
          <p className="text-[10px] tracking-[0.3em] uppercase text-[#8A8580] mb-3">Order Confirmed</p>
          <h1 className="font-serif text-4xl md:text-5xl text-[#111111] mb-4">Thank you.</h1>
          <p className="text-sm text-[#8A8580] font-light leading-relaxed max-w-sm mx-auto">
            Thank you for choosing us. Your order has been successfully placed and will be processed shortly.
          </p>
          <p className="text-[11px] tracking-widest uppercase text-[#111111] mt-4 font-medium">
            Order ID: {orderId}
          </p>
        </div>

        <div className="bg-white border border-[#E2DDD6] p-6 md:p-8 mb-6">
          <h2 className="font-serif text-xl text-[#111111] mb-5">Order Summary</h2>
          <div className="space-y-4 mb-5">
            {items.map(item => (
              <div key={item.id} className="flex gap-4 items-center">
                <div className="w-14 h-16 bg-[#F3EFE8] flex-shrink-0 overflow-hidden">
                  <img src={item.images[0]} alt={item.name} className="w-full h-full object-cover" />
                </div>
                <div className="flex-1">
                  <p className="font-serif text-sm text-[#111111]">{item.name}</p>
                  <p className="text-xs text-[#8A8580]">{item.size} · Qty: {item.qty}</p>
                </div>
                <span className="text-sm text-[#111111]">₹{(item.price * item.qty).toLocaleString()}</span>
              </div>
            ))}
          </div>
          <div className="border-t border-[#E2DDD6] pt-4 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-[#8A8580]">Subtotal</span>
              <span>₹{subtotal.toLocaleString()}</span>
            </div>
            {discount > 0 && (
              <div className="flex justify-between text-sm text-green-700">
                <span>Discount</span>
                <span>-₹{discount.toLocaleString()}</span>
              </div>
            )}
            <div className="flex justify-between font-medium text-base border-t border-[#E2DDD6] pt-3">
              <span className="font-serif">Total Paid</span>
              <span>₹{total.toLocaleString()}</span>
            </div>
          </div>
        </div>

        <div className="bg-white border border-[#E2DDD6] p-6 md:p-8 mb-8">
          <h2 className="font-serif text-xl text-[#111111] mb-4">Delivery To</h2>
          <div className="text-sm text-[#8A8580] space-y-1 font-light">
            <p className="text-[#111111] font-medium">{customer.name}</p>
            <p>{customer.email}</p>
            <p>{customer.phone}</p>
            <p className="mt-2">{customer.address}, {customer.city}, {customer.state} — {customer.pincode}</p>
          </div>
        </div>

        <div className="text-center">
          <Button as={Link} to="/shop" size="lg">Continue Shopping</Button>
        </div>
      </div>
    </main>
  );
}
