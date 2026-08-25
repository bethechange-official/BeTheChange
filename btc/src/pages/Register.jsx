import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/ui/Button';
import { Eye, EyeOff, Lock, Mail, User, Phone, Sparkles, ArrowRight, ShieldCheck } from 'lucide-react';
import { motion } from 'framer-motion';

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  
  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '', confirm: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [authError, setAuthError] = useState('');
  const [loading, setLoading] = useState(false);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleSubmit = (e) => {
    e.preventDefault();
    setAuthError('');
    const errs = {};
    if (!form.name.trim()) errs.name = 'Full name is required';
    if (!form.email.includes('@')) errs.email = 'Valid email address required';
    if (form.phone.length < 10) errs.phone = 'Valid 10-digit phone number required';
    if (form.password.length < 6) errs.password = 'Password must be at least 6 characters';
    if (form.password !== form.confirm) errs.confirm = 'Passwords do not match';
    if (Object.keys(errs).length) { setErrors(errs); return; }

    setLoading(true);
    setTimeout(() => {
      const res = register(form);
      setLoading(false);
      if (res.success) {
        const searchParams = new URLSearchParams(window.location.search);
        const targetRedirect = searchParams.get('redirect') || '/account';
        navigate(targetRedirect);
      } else {
        setAuthError(res.message || 'Registration failed. Please try again.');
      }
    }, 600);
  };

  return (
    <main className="pt-18 md:pt-22 min-h-screen bg-[#FAF9F6] text-[#111111] flex items-center justify-center p-4 md:p-8">
      <div className="w-full max-w-[1100px] bg-white border border-[#E2DDD6] shadow-xl overflow-hidden grid lg:grid-cols-12 min-h-[680px]">
        
        {/* LEFT COLUMN — Editorial Brand Image */}
        <div className="lg:col-span-5 relative bg-[#111111] text-white p-8 md:p-12 flex flex-col justify-between overflow-hidden hidden md:flex">
          <div className="absolute inset-0 z-0">
            <img
              src="https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?w=1200&q=85"
              alt="Be The Change Rituals"
              className="w-full h-full object-cover opacity-40 object-center"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#111111] via-[#111111]/60 to-transparent" />
          </div>

          <div className="relative z-10">
            <p className="text-[10px] tracking-[0.35em] uppercase text-white/60 mb-2 font-light">BE THE CHANGE</p>
            <h2 className="font-serif text-3xl md:text-4xl text-white leading-tight font-normal">
              Join our mindful<br />community.
            </h2>
          </div>

          <div className="relative z-10 space-y-6 my-10">
            <div className="flex items-start gap-4">
              <div className="w-8 h-8 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center text-white flex-shrink-0 mt-0.5">
                <Sparkles size={14} />
              </div>
              <div>
                <h4 className="font-serif text-base text-white">Thoughtful Rewards</h4>
                <p className="text-xs text-white/70 font-light mt-0.5 leading-relaxed">
                  Enjoy early access to new small-batch releases.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="w-8 h-8 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center text-white flex-shrink-0 mt-0.5">
                <ShieldCheck size={14} />
              </div>
              <div>
                <h4 className="font-serif text-base text-white">Fast & Secure</h4>
                <p className="text-xs text-white/70 font-light mt-0.5 leading-relaxed">
                  Save your address and manage order tracking effortlessly.
                </p>
              </div>
            </div>
          </div>

          <div className="relative z-10 pt-6 border-t border-white/15">
            <p className="text-[11px] text-white/60 italic font-serif">
              "Crafted with care, designed for everyday well-being."
            </p>
          </div>
        </div>

        {/* RIGHT COLUMN — Form Area */}
        <div className="lg:col-span-7 bg-[#FAF9F6] p-8 md:p-12 flex flex-col justify-center">
          
          {/* Header Switcher */}
          <div className="flex items-center justify-between border-b border-[#E2DDD6] pb-6 mb-6">
            <div>
              <p className="text-[10px] tracking-[0.3em] uppercase text-[#8A8580] font-medium mb-1">JOIN US</p>
              <h1 className="font-serif text-3xl md:text-4xl text-[#111111]">Create Account</h1>
            </div>

            <div className="flex items-center gap-2 text-xs font-medium">
              <Link to="/login" className="px-3 py-1.5 text-[#8A8580] hover:text-[#111111] text-[10px] tracking-widest uppercase transition-colors">Sign In</Link>
              <span className="px-3 py-1.5 bg-[#111111] text-white text-[10px] tracking-widest uppercase">Register</span>
            </div>
          </div>

          {authError && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-5 p-4 bg-red-50 border border-red-200 text-red-700 text-xs font-light"
            >
              {authError}
            </motion.div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            
            {/* Full Name */}
            <div className="space-y-1">
              <label className="block text-[10px] tracking-[0.25em] uppercase font-semibold text-[#111111]">
                Full Name
              </label>
              <div className="relative flex items-center">
                <User size={15} className="absolute left-4 text-[#8A8580]" />
                <input
                  type="text"
                  value={form.name}
                  onChange={e => set('name', e.target.value)}
                  placeholder="Sarah Jenkins"
                  className="w-full bg-white border border-[#E2DDD6] focus:border-[#111111] pl-11 pr-4 py-3 text-sm text-[#111111] placeholder:text-[#C8C0B4] focus:outline-none transition-colors"
                />
              </div>
              {errors.name && <p className="text-[11px] text-red-600 font-light mt-0.5">{errors.name}</p>}
            </div>

            {/* Email Address */}
            <div className="space-y-1">
              <label className="block text-[10px] tracking-[0.25em] uppercase font-semibold text-[#111111]">
                Email Address
              </label>
              <div className="relative flex items-center">
                <Mail size={15} className="absolute left-4 text-[#8A8580]" />
                <input
                  type="email"
                  value={form.email}
                  onChange={e => set('email', e.target.value)}
                  placeholder="sarah@example.com"
                  className="w-full bg-white border border-[#E2DDD6] focus:border-[#111111] pl-11 pr-4 py-3 text-sm text-[#111111] placeholder:text-[#C8C0B4] focus:outline-none transition-colors"
                />
              </div>
              {errors.email && <p className="text-[11px] text-red-600 font-light mt-0.5">{errors.email}</p>}
            </div>

            {/* Phone Number */}
            <div className="space-y-1">
              <label className="block text-[10px] tracking-[0.25em] uppercase font-semibold text-[#111111]">
                Phone Number
              </label>
              <div className="relative flex items-center">
                <Phone size={15} className="absolute left-4 text-[#8A8580]" />
                <input
                  type="tel"
                  value={form.phone}
                  onChange={e => set('phone', e.target.value)}
                  placeholder="+91 98765 43210"
                  className="w-full bg-white border border-[#E2DDD6] focus:border-[#111111] pl-11 pr-4 py-3 text-sm text-[#111111] placeholder:text-[#C8C0B4] focus:outline-none transition-colors"
                />
              </div>
              {errors.phone && <p className="text-[11px] text-red-600 font-light mt-0.5">{errors.phone}</p>}
            </div>

            {/* Passwords (2 columns on tablet/desktop) */}
            <div className="grid sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="block text-[10px] tracking-[0.25em] uppercase font-semibold text-[#111111]">
                  Password
                </label>
                <div className="relative flex items-center">
                  <Lock size={15} className="absolute left-4 text-[#8A8580]" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={form.password}
                    onChange={e => set('password', e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-white border border-[#E2DDD6] focus:border-[#111111] pl-11 pr-10 py-3 text-sm text-[#111111] placeholder:text-[#C8C0B4] focus:outline-none transition-colors"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(s => !s)}
                    className="absolute right-3 text-[#8A8580] hover:text-[#111111] transition-colors"
                  >
                    {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
                {errors.password && <p className="text-[11px] text-red-600 font-light mt-0.5">{errors.password}</p>}
              </div>

              <div className="space-y-1">
                <label className="block text-[10px] tracking-[0.25em] uppercase font-semibold text-[#111111]">
                  Confirm Password
                </label>
                <div className="relative flex items-center">
                  <Lock size={15} className="absolute left-4 text-[#8A8580]" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={form.confirm}
                    onChange={e => set('confirm', e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-white border border-[#E2DDD6] focus:border-[#111111] pl-11 pr-4 py-3 text-sm text-[#111111] placeholder:text-[#C8C0B4] focus:outline-none transition-colors"
                  />
                </div>
                {errors.confirm && <p className="text-[11px] text-red-600 font-light mt-0.5">{errors.confirm}</p>}
              </div>
            </div>

            {/* Submit Button */}
            <div className="pt-3">
              <Button
                type="submit"
                loading={loading}
                className="w-full bg-[#111111] text-white hover:bg-[#2A2A2A] py-4 text-[11px] tracking-[0.25em] font-semibold"
              >
                CREATE MY ACCOUNT
              </Button>
            </div>
          </form>

          {/* Footer Link */}
          <div className="mt-6 pt-5 border-t border-[#E2DDD6] text-center">
            <p className="text-xs text-[#8A8580] font-light">
              Already have an account?{' '}
              <Link to="/login" className="text-[#111111] font-semibold tracking-wide uppercase text-[11px] underline hover:text-[#5C554E] ml-1 inline-flex items-center gap-1">
                SIGN IN HERE <ArrowRight size={11} />
              </Link>
            </p>
          </div>

        </div>
      </div>
    </main>
  );
}
