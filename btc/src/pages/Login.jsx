import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { Eye, EyeOff, Lock, Mail, Sparkles, ArrowRight, ShieldCheck } from 'lucide-react';
import { motion } from 'framer-motion';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [authError, setAuthError] = useState('');
  const [loading, setLoading] = useState(false);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleSubmit = (e) => {
    e.preventDefault();
    setAuthError('');
    const errs = {};
    if (!form.email.includes('@')) errs.email = 'Valid email address required';
    if (!form.password) errs.password = 'Password is required';
    if (Object.keys(errs).length) { setErrors(errs); return; }

    setLoading(true);
    setTimeout(() => {
      const res = login(form.email, form.password);
      setLoading(false);
      if (res.success) {
        const searchParams = new URLSearchParams(window.location.search);
        const targetRedirect = searchParams.get('redirect') || '/account';
        navigate(targetRedirect);
      } else {
        setAuthError(res.message || 'Invalid email or password.');
      }
    }, 600);
  };

  const handleDemoLogin = () => {
    setForm({ email: 'sarah@example.com', password: 'password123' });
    setAuthError('');
    setErrors({});
  };

  return (
    <main className="pt-18 md:pt-22 min-h-screen bg-[#FAF9F6] text-[#111111] flex items-center justify-center p-4 md:p-8">
      <div className="w-full max-w-[1100px] bg-white border border-[#E2DDD6] shadow-xl overflow-hidden grid lg:grid-cols-12 min-h-[640px]">
        
        {/* LEFT COLUMN — Editorial Brand Image & Features */}
        <div className="lg:col-span-5 relative bg-[#111111] text-white p-8 md:p-12 flex flex-col justify-between overflow-hidden hidden md:flex">
          <div className="absolute inset-0 z-0">
            <img
              src="https://images.unsplash.com/photo-1556228578-8c89e6adf883?w=1200&q=85"
              alt="Be The Change Skincare"
              className="w-full h-full object-cover opacity-40 object-center"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#111111] via-[#111111]/60 to-transparent" />
          </div>

          <div className="relative z-10">
            <p className="text-[10px] tracking-[0.35em] uppercase text-white/60 mb-2 font-light">BE THE CHANGE</p>
            <h2 className="font-serif text-3xl md:text-4xl text-white leading-tight font-normal">
              Everyday rituals<br />begin here.
            </h2>
          </div>

          <div className="relative z-10 space-y-6 my-12">
            <div className="flex items-start gap-4">
              <div className="w-8 h-8 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center text-white flex-shrink-0 mt-0.5">
                <Sparkles size={14} />
              </div>
              <div>
                <h4 className="font-serif text-base text-white">Curated Collections</h4>
                <p className="text-xs text-white/70 font-light mt-0.5 leading-relaxed">
                  Thoughtful products for skin, body, hair, and home.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="w-8 h-8 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center text-white flex-shrink-0 mt-0.5">
                <ShieldCheck size={14} />
              </div>
              <div>
                <h4 className="font-serif text-base text-white">Seamless Account</h4>
                <p className="text-xs text-white/70 font-light mt-0.5 leading-relaxed">
                  Track orders, save default addresses, and view purchase history.
                </p>
              </div>
            </div>
          </div>

          <div className="relative z-10 pt-6 border-t border-white/15">
            <p className="text-[11px] text-white/60 italic font-serif">
              "Simple, honest formulations designed for your daily routine."
            </p>
          </div>
        </div>

        {/* RIGHT COLUMN — Form Area */}
        <div className="lg:col-span-7 bg-[#FAF9F6] p-8 md:p-14 flex flex-col justify-center">
          
          {/* Header Switcher */}
          <div className="flex items-center justify-between border-b border-[#E2DDD6] pb-6 mb-8">
            <div>
              <p className="text-[10px] tracking-[0.3em] uppercase text-[#8A8580] font-medium mb-1">WELCOME BACK</p>
              <h1 className="font-serif text-3xl md:text-4xl text-[#111111]">Sign In</h1>
            </div>

            <div className="flex items-center gap-2 text-xs font-medium">
              <span className="px-3 py-1.5 bg-[#111111] text-white text-[10px] tracking-widest uppercase">Sign In</span>
              <Link to="/register" className="px-3 py-1.5 text-[#8A8580] hover:text-[#111111] text-[10px] tracking-widest uppercase transition-colors">Register</Link>
            </div>
          </div>

          {authError && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 text-xs font-light"
            >
              {authError}
            </motion.div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            
            {/* Email Field */}
            <div className="space-y-1.5">
              <label className="block text-[10px] tracking-[0.25em] uppercase font-semibold text-[#111111]">
                Email Address
              </label>
              <div className="relative flex items-center">
                <Mail size={16} className="absolute left-4 text-[#8A8580]" />
                <input
                  type="email"
                  value={form.email}
                  onChange={e => set('email', e.target.value)}
                  placeholder="your.email@example.com"
                  className="w-full bg-white border border-[#E2DDD6] focus:border-[#111111] pl-11 pr-4 py-3.5 text-sm text-[#111111] placeholder:text-[#C8C0B4] focus:outline-none transition-colors"
                />
              </div>
              {errors.email && <p className="text-[11px] text-red-600 font-light mt-1">{errors.email}</p>}
            </div>

            {/* Password Field */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="block text-[10px] tracking-[0.25em] uppercase font-semibold text-[#111111]">
                  Password
                </label>
                <button type="button" className="text-[11px] text-[#8A8580] hover:text-[#111111] transition-colors font-light">
                  Forgot password?
                </button>
              </div>
              <div className="relative flex items-center">
                <Lock size={16} className="absolute left-4 text-[#8A8580]" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={form.password}
                  onChange={e => set('password', e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-white border border-[#E2DDD6] focus:border-[#111111] pl-11 pr-11 py-3.5 text-sm text-[#111111] placeholder:text-[#C8C0B4] focus:outline-none transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(s => !s)}
                  className="absolute right-4 text-[#8A8580] hover:text-[#111111] transition-colors"
                  aria-label="Toggle password visibility"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {errors.password && <p className="text-[11px] text-red-600 font-light mt-1">{errors.password}</p>}
            </div>

            {/* Action Buttons */}
            <div className="pt-2 space-y-4">
              <Button
                type="submit"
                loading={loading}
                className="w-full bg-[#111111] text-white hover:bg-[#2A2A2A] py-4 text-[11px] tracking-[0.25em] font-semibold"
              >
                SIGN IN TO ACCOUNT
              </Button>

              {/* Demo Helper Button */}
              <button
                type="button"
                onClick={handleDemoLogin}
                className="w-full py-3.5 border border-[#E2DDD6] bg-white hover:bg-[#F3EFE8] text-[#111111] text-[10px] tracking-[0.2em] uppercase font-semibold flex items-center justify-center gap-2 transition-all"
              >
                <Sparkles size={13} className="text-[#8A8580]" />
                ONE-CLICK DEMO LOGIN (SARAH JENKINS)
              </button>
            </div>
          </form>

          {/* Footer Link */}
          <div className="mt-8 pt-6 border-t border-[#E2DDD6] text-center">
            <p className="text-xs text-[#8A8580] font-light">
              Don't have an account yet?{' '}
              <Link to="/register" className="text-[#111111] font-semibold tracking-wide uppercase text-[11px] underline hover:text-[#5C554E] ml-1 inline-flex items-center gap-1">
                CREATE ACCOUNT <ArrowRight size={11} />
              </Link>
            </p>
          </div>

        </div>
      </div>
    </main>
  );
}
