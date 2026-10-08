import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/ui/Button';
import { Eye, EyeOff, Lock, Mail, User, Phone, ArrowLeft } from 'lucide-react';
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setAuthError('');
    const errs = {};
    if (!form.name.trim()) errs.name = 'Full name is required';
    if (!form.email.includes('@')) errs.email = 'Valid email address required';
    if (form.phone.length < 10) errs.phone = 'Valid phone number required';
    if (form.password.length < 8) errs.password = 'Password must be at least 8 characters';
    if (form.password !== form.confirm) errs.confirm = 'Passwords do not match';
    if (Object.keys(errs).length) { setErrors(errs); return; }

    setLoading(true);
    const res = await register(form);
    setLoading(false);
    if (res.success) {
      const searchParams = new URLSearchParams(window.location.search);
      navigate(searchParams.get('redirect') || '/account');
    } else {
      setAuthError(res.message || 'Registration failed. Please try again.');
    }
  };

  return (
    <main className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative">
      <div className="absolute top-8 left-8">
        <Link to="/" className="text-gray-500 hover:text-gray-900 flex items-center gap-2 text-sm font-medium transition-colors">
          <ArrowLeft size={16} />
          Back to Home
        </Link>
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <div className="h-12 w-12 bg-black text-white flex items-center justify-center rounded-xl mx-auto shadow-lg text-xl font-serif font-bold tracking-wider mb-6">
            B
          </div>
          <h2 className="text-3xl font-bold tracking-tight text-gray-900">
            Create an account
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Join us and begin your journey.
          </p>
        </motion.div>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white py-8 px-4 shadow-xl sm:rounded-2xl sm:px-10 border border-gray-100"
        >
          {authError && (
            <div className="mb-6 p-4 bg-red-50/50 border border-red-200/50 rounded-lg text-red-600 text-sm flex items-start">
              <div className="mt-0.5 mr-2">
                <svg className="w-4 h-4 text-red-500" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" /></svg>
              </div>
              {authError}
            </div>
          )}

          <form className="space-y-4" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                Full name
              </label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="name"
                  name="name"
                  type="text"
                  required
                  value={form.name}
                  onChange={e => set('name', e.target.value)}
                  className={`block w-full pl-10 py-3 sm:text-sm border-gray-300 border rounded-lg focus:ring-black focus:border-black outline-none transition-colors ${errors.name ? 'border-red-300' : 'border-gray-200'}`}
                  placeholder="John Doe"
                />
              </div>
              {errors.name && <p className="mt-1 text-xs text-red-600">{errors.name}</p>}
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email address
              </label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  value={form.email}
                  onChange={e => set('email', e.target.value)}
                  className={`block w-full pl-10 py-3 sm:text-sm border-gray-300 border rounded-lg focus:ring-black focus:border-black outline-none transition-colors ${errors.email ? 'border-red-300' : 'border-gray-200'}`}
                  placeholder="you@example.com"
                />
              </div>
              {errors.email && <p className="mt-1 text-xs text-red-600">{errors.email}</p>}
            </div>

            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
                Phone number
              </label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Phone className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="phone"
                  name="phone"
                  type="tel"
                  required
                  value={form.phone}
                  onChange={e => set('phone', e.target.value)}
                  className={`block w-full pl-10 py-3 sm:text-sm border-gray-300 border rounded-lg focus:ring-black focus:border-black outline-none transition-colors ${errors.phone ? 'border-red-300' : 'border-gray-200'}`}
                  placeholder="+1 (555) 000-0000"
                />
              </div>
              {errors.phone && <p className="mt-1 text-xs text-red-600">{errors.phone}</p>}
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                  Password
                </label>
                <div className="mt-1 relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    required
                    value={form.password}
                    onChange={e => set('password', e.target.value)}
                    className={`block w-full pl-10 pr-10 py-3 sm:text-sm border-gray-300 border rounded-lg focus:ring-black focus:border-black outline-none transition-colors ${errors.password ? 'border-red-300' : 'border-gray-200'}`}
                    placeholder="••••••••"
                  />
                </div>
                {errors.password && <p className="mt-1 text-xs text-red-600">{errors.password}</p>}
              </div>

              <div>
                <label htmlFor="confirm" className="block text-sm font-medium text-gray-700">
                  Confirm
                </label>
                <div className="mt-1 relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="confirm"
                    name="confirm"
                    type={showPassword ? "text" : "password"}
                    required
                    value={form.confirm}
                    onChange={e => set('confirm', e.target.value)}
                    className={`block w-full pl-10 py-3 sm:text-sm border-gray-300 border rounded-lg focus:ring-black focus:border-black outline-none transition-colors ${errors.confirm ? 'border-red-300' : 'border-gray-200'}`}
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
                {errors.confirm && <p className="mt-1 text-xs text-red-600">{errors.confirm}</p>}
              </div>
            </div>

            <div className="pt-2">
              <Button
                type="submit"
                loading={loading}
                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-black hover:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black transition-all"
              >
                Create Account
              </Button>
            </div>
          </form>

          <div className="mt-8">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">
                  Already have an account?
                </span>
              </div>
            </div>

            <div className="mt-6">
              <Link
                to="/login"
                className="w-full flex justify-center py-3 px-4 border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black transition-all"
              >
                Sign in instead
              </Link>
            </div>
          </div>
        </motion.div>
      </div>
    </main>
  );
}
