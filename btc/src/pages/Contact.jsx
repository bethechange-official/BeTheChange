import { useState } from 'react';
import { Mail, Phone, MapPin, Clock, Send, MessageSquare, CheckCircle2 } from 'lucide-react';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { Toast } from '../components/ui/Toast';

export default function Contact() {
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    topic: 'Order Inquiry',
    message: ''
  });

  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [toast, setToast] = useState(null);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.message) {
      setToast('Please complete all required fields.');
      return;
    }

    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setSubmitted(true);
      setToast('Thank you! Your message has been sent successfully.');
      setForm({ name: '', email: '', phone: '', topic: 'Order Inquiry', message: '' });
    }, 800);
  };

  const contactDetails = [
    {
      icon: Mail,
      title: 'Customer Care Email',
      value: 'care@bethechange.com',
      sub: 'We reply within 24 business hours'
    },
    {
      icon: Phone,
      title: 'Phone & WhatsApp',
      value: '+91 98765 43210',
      sub: 'Monday to Saturday, 9am – 6pm IST'
    },
    {
      icon: MapPin,
      title: 'Studio Address',
      value: '12-A Botanical Enclave, Green Park',
      sub: 'New Delhi, India - 110016'
    },
    {
      icon: Clock,
      title: 'Support Hours',
      value: 'Mon – Sat: 9:00 AM – 6:00 PM',
      sub: 'Closed on Sundays & National Holidays'
    }
  ];

  return (
    <main className="pt-18 md:pt-22 bg-[#FAF9F6] text-[#111111] min-h-screen">
      {/* 1. HERO SECTION */}
      <section className="py-16 md:py-24 bg-[#FAF9F6] border-b border-[#E8E3DC]">
        <div className="max-w-[1400px] mx-auto px-6 md:px-10 text-center max-w-3xl">
          <p className="text-[10px] tracking-[0.35em] uppercase text-[#8A8580] font-medium mb-3">GET IN TOUCH</p>
          <h1 className="font-serif text-4xl md:text-6xl text-[#111111] mb-6">Contact Us</h1>
          <p className="text-sm md:text-base text-[#555555] font-light leading-relaxed">
            Have a question about our products, an order inquiry, or need personalized product recommendations? We are here to help.
          </p>
        </div>
      </section>

      {/* 2. MAIN CONTENT GRID */}
      <section className="py-16 md:py-24 max-w-[1400px] mx-auto px-6 md:px-10">
        <div className="grid lg:grid-cols-12 gap-12 lg:gap-16">
          
          {/* LEFT COLUMN — Contact Information Cards */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-white border border-[#E2DDD6] p-8">
              <p className="text-[10px] tracking-[0.25em] uppercase text-[#8A8580] font-medium mb-2">REACH OUT DIRECTLY</p>
              <h2 className="font-serif text-2xl text-[#111111] mb-6">Customer Support</h2>

              <div className="space-y-6">
                {contactDetails.map((detail) => {
                  const IconComp = detail.icon;
                  return (
                    <div key={detail.title} className="flex items-start gap-4 pb-5 border-b border-[#F3EFE8] last:border-0 last:pb-0">
                      <div className="w-10 h-10 rounded-full bg-[#FAF9F6] border border-[#E2DDD6] flex items-center justify-center text-[#111111] flex-shrink-0 mt-0.5">
                        <IconComp size={16} strokeWidth={1.5} />
                      </div>
                      <div>
                        <p className="text-[10px] tracking-[0.2em] uppercase text-[#8A8580] font-medium">{detail.title}</p>
                        <p className="font-serif text-base text-[#111111] mt-0.5">{detail.value}</p>
                        <p className="text-xs text-[#777777] font-light mt-0.5">{detail.sub}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN — Contact Form */}
          <div className="lg:col-span-7 bg-white border border-[#E2DDD6] p-8 md:p-12 shadow-2xs">
            <div className="mb-8">
              <p className="text-[10px] tracking-[0.25em] uppercase text-[#8A8580] font-medium mb-1">SEND A MESSAGE</p>
              <h2 className="font-serif text-3xl text-[#111111]">How Can We Help You?</h2>
            </div>

            {submitted ? (
              <div className="py-12 text-center space-y-4">
                <div className="w-14 h-14 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 flex items-center justify-center mx-auto mb-4">
                  <CheckCircle2 size={26} />
                </div>
                <h3 className="font-serif text-2xl text-[#111111]">Message Received!</h3>
                <p className="text-xs text-[#666666] font-light max-w-md mx-auto leading-relaxed">
                  Thank you for reaching out to Be The Change. Our customer care team will review your inquiry and get back to you shortly.
                </p>
                <button
                  type="button"
                  onClick={() => setSubmitted(false)}
                  className="mt-6 inline-block text-[11px] tracking-[0.2em] uppercase font-semibold text-[#111111] underline"
                >
                  Send Another Message
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid sm:grid-cols-2 gap-5">
                  <Input
                    label="Full Name *"
                    value={form.name}
                    onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                    placeholder="Sarah Jenkins"
                  />
                  <Input
                    label="Email Address *"
                    type="email"
                    value={form.email}
                    onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                    placeholder="sarah@example.com"
                  />
                </div>

                <div className="grid sm:grid-cols-2 gap-5">
                  <Input
                    label="Phone Number (Optional)"
                    type="tel"
                    value={form.phone}
                    onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
                    placeholder="+91 98765 43210"
                  />

                  <div className="space-y-1.5">
                    <label className="block text-[10px] tracking-[0.25em] uppercase font-semibold text-[#111111]">
                      Inquiry Topic
                    </label>
                    <select
                      value={form.topic}
                      onChange={e => setForm(f => ({ ...f, topic: e.target.value }))}
                      className="w-full bg-white border border-[#E2DDD6] focus:border-[#111111] px-4 py-3 text-sm text-[#111111] focus:outline-none"
                    >
                      <option value="Order Inquiry">Order & Delivery Inquiry</option>
                      <option value="Product Advice">Product Recommendations</option>
                      <option value="Wholesale">Wholesale & Corporate Orders</option>
                      <option value="General Feedback">General Inquiry</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-[10px] tracking-[0.25em] uppercase font-semibold text-[#111111]">
                    Message *
                  </label>
                  <textarea
                    rows={5}
                    value={form.message}
                    onChange={e => setForm(f => ({ ...f, message: e.target.value }))}
                    placeholder="Write your message or inquiry here..."
                    className="w-full bg-white border border-[#E2DDD6] focus:border-[#111111] p-4 text-sm text-[#111111] placeholder:text-[#C8C0B4] focus:outline-none transition-colors"
                  />
                </div>

                <Button
                  type="submit"
                  loading={loading}
                  className="w-full bg-[#111111] text-white hover:bg-[#2A2A2A] py-4 text-[11px] tracking-[0.25em] font-semibold"
                >
                  SEND MESSAGE
                </Button>
              </form>
            )}

          </div>

        </div>
      </section>

      {toast && <Toast message={toast} onClose={() => setToast(null)} />}
    </main>
  );
}
