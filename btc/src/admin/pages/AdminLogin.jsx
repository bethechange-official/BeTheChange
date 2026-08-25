import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Lock, Mail, ShieldAlert } from 'lucide-react';
import { adminAuth } from '../utils/adminAuth';

export default function AdminLogin() {
  const [email, setEmail] = useState('admin@btc.com');
  const [password, setPassword] = useState('admin123');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    setTimeout(() => {
      const res = adminAuth.login(email, password);
      setLoading(false);

      if (res.success) {
        navigate('/admin/dashboard');
      } else {
        setError(res.message);
      }
    }, 400);
  };

  return (
    <div className="min-h-screen bg-[#FAF9F6] text-[#111111] flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white border border-[#E2DDD6] rounded-2xl shadow-xl p-8 sm:p-10">
        
        {/* Brand Logo & Header */}
        <div className="text-center mb-8">
          <div className="w-14 h-14 rounded-full bg-[#111111] text-white flex items-center justify-center font-serif text-2xl font-bold mx-auto mb-3 shadow-md">
            B
          </div>
          <h1 className="font-serif text-3xl font-bold text-[#111111]">Be The Change</h1>
          <p className="text-xs tracking-[0.25em] uppercase text-[#8A8580] font-medium mt-1">Admin Portal Access</p>
        </div>

        {/* Demo Credentials Alert */}
        <div className="mb-6 bg-blue-50 border border-blue-200 text-blue-800 p-3 rounded-lg text-xs leading-relaxed">
          <p className="font-semibold mb-0.5">Demo Credentials:</p>
          <p>Email: <code className="bg-blue-100 px-1 py-0.5 rounded font-mono">admin@btc.com</code></p>
          <p>Password: <code className="bg-blue-100 px-1 py-0.5 rounded font-mono">admin123</code></p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 bg-rose-50 border border-rose-200 text-rose-700 p-3 rounded-lg text-xs flex items-center gap-2">
            <ShieldAlert size={16} className="flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-gray-700 mb-1.5">
              Email Address
            </label>
            <div className="relative">
              <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@btc.com"
                className="w-full bg-[#FAF9F6] border border-[#E2DDD6] focus:border-[#111111] rounded-xl pl-10 pr-4 py-3 text-sm text-[#111111] placeholder:text-gray-400 focus:outline-none transition-colors font-sans"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-gray-700 mb-1.5">
              Password
            </label>
            <div className="relative">
              <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-[#FAF9F6] border border-[#E2DDD6] focus:border-[#111111] rounded-xl pl-10 pr-10 py-3 text-sm text-[#111111] placeholder:text-gray-400 focus:outline-none transition-colors font-sans"
              />
              <button
                type="button"
                onClick={() => setShowPassword(s => !s)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700 p-0.5"
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#111111] hover:bg-[#2A2A2A] text-white py-3.5 rounded-xl font-semibold text-xs tracking-[0.2em] uppercase transition-all shadow-md active:scale-[0.99] disabled:opacity-50"
          >
            {loading ? 'Authenticating...' : 'Sign In to Dashboard'}
          </button>
        </form>

        <div className="mt-8 text-center border-t border-gray-100 pt-5">
          <p className="text-[11px] text-gray-400">
            Protected area for authorized Be The Change administrators only.
          </p>
        </div>
      </div>
    </div>
  );
}
