import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { Toast } from '../components/ui/Toast';
import { 
  User, Package, LogOut, Shield, Check, ShoppingBag, MapPin, 
  Sparkles, Clock, Truck, ChevronRight, Edit3, Lock, Heart, Award
} from 'lucide-react';
import { motion } from 'framer-motion';

export default function Account() {
  const { user, logout, updateProfile, getUserOrders } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('orders');
  const [toast, setToast] = useState(null);

  // Redirect if not logged in
  if (!user) {
    navigate('/login');
    return null;
  }

  const realOrders = getUserOrders();

  // Mock demo order for empty state richness
  const demoOrder = {
    orderId: 'BTC89201452',
    createdAt: '22 Aug 2026, 04:30 PM',
    total: 1098,
    status: 'Delivered',
    items: [
      {
        id: 13,
        name: 'Pigmentation Serum',
        quantity: 1,
        price: 599,
        images: ['https://images.unsplash.com/photo-1608248543803-ba4f8c70ae0b?w=400&q=80']
      },
      {
        id: 2,
        name: 'Dish Liquid',
        quantity: 1,
        price: 499,
        images: ['https://images.unsplash.com/photo-1563453392212-326f5e854473?w=400&q=80']
      }
    ]
  };

  const displayOrders = realOrders.length > 0 ? realOrders : [demoOrder];

  const [profileForm, setProfileForm] = useState({
    name: user.name || '',
    phone: user.phone || '+91 98765 43210',
    email: user.email || '',
    address: user.address || '12-A Botanical Enclave, Green Park, New Delhi - 110016'
  });

  const [saved, setSaved] = useState(false);

  const handleProfileSave = (e) => {
    e.preventDefault();
    updateProfile(profileForm);
    setSaved(true);
    setToast('Profile updated successfully');
    setTimeout(() => setSaved(false), 3000);
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const initials = user.name
    ? user.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()
    : 'U';

  return (
    <main className="pt-18 md:pt-22 pb-24 min-h-screen bg-[#FAF9F6] text-[#111111]">
      <div className="max-w-[1300px] mx-auto px-6 md:px-10">
        
        {/* TOP HERO MEMBER CARD */}
        <div className="relative bg-[#111111] text-white p-8 md:p-12 mb-10 overflow-hidden shadow-lg">
          <div className="absolute inset-0 z-0 opacity-25">
            <img
              src="https://images.unsplash.com/photo-1556228578-8c89e6adf883?w=1600&q=80"
              alt="Member Header"
              className="w-full h-full object-cover object-center"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-[#111111] via-[#111111]/90 to-transparent" />
          </div>

          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex items-center gap-6">
              <div className="w-20 h-20 rounded-full bg-white text-[#111111] font-serif text-3xl flex items-center justify-center font-bold flex-shrink-0 shadow-md">
                {initials}
              </div>
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <span className="px-3 py-1 bg-white/15 backdrop-blur-sm text-white/90 text-[9px] tracking-[0.25em] uppercase font-medium">
                    MEMBER ACCOUNT
                  </span>
                  <span className="text-emerald-400 text-xs flex items-center gap-1 font-medium">
                    <Check size={12} /> Active Account
                  </span>
                </div>
                <h1 className="font-serif text-3xl md:text-5xl text-white font-normal leading-tight">{user.name}</h1>
                <p className="text-xs text-white/70 font-light mt-1">{user.email} &bull; Member since {user.createdAt || '2026'}</p>
              </div>
            </div>

            <button
              onClick={handleLogout}
              className="inline-flex items-center gap-2 border border-white/20 hover:border-white px-5 py-2.5 text-[10px] tracking-[0.2em] uppercase font-semibold text-white transition-all bg-white/10 hover:bg-white hover:text-[#111111] self-start md:self-auto"
            >
              <LogOut size={13} />
              Sign Out
            </button>
          </div>
        </div>

        {/* MAIN DASHBOARD CONTENT GRID */}
        <div className="grid lg:grid-cols-12 gap-8">
          
          {/* LEFT SIDEBAR NAVIGATION */}
          <div className="lg:col-span-3">
            <div className="bg-white border border-[#E2DDD6] p-3 space-y-1.5 shadow-2xs sticky top-32">
              <p className="text-[9px] tracking-[0.25em] uppercase text-[#8A8580] font-semibold px-4 pt-3 pb-2">
                ACCOUNT MANAGEMENT
              </p>

              <button
                onClick={() => setActiveTab('orders')}
                className={`w-full flex items-center gap-3 px-4 py-3.5 text-[11px] tracking-[0.2em] uppercase font-semibold transition-all text-left ${activeTab === 'orders' ? 'bg-[#111111] text-white shadow-sm' : 'text-[#111111] hover:bg-[#FAF9F6]'}`}
              >
                <Package size={15} />
                <span>My Orders</span>
                <span className="ml-auto text-[10px] opacity-75">({displayOrders.length})</span>
              </button>

              <button
                onClick={() => setActiveTab('profile')}
                className={`w-full flex items-center gap-3 px-4 py-3.5 text-[11px] tracking-[0.2em] uppercase font-semibold transition-all text-left ${activeTab === 'profile' ? 'bg-[#111111] text-white shadow-sm' : 'text-[#111111] hover:bg-[#FAF9F6]'}`}
              >
                <User size={15} />
                <span>Profile Details</span>
              </button>

              <button
                onClick={() => setActiveTab('addresses')}
                className={`w-full flex items-center gap-3 px-4 py-3.5 text-[11px] tracking-[0.2em] uppercase font-semibold transition-all text-left ${activeTab === 'addresses' ? 'bg-[#111111] text-white shadow-sm' : 'text-[#111111] hover:bg-[#FAF9F6]'}`}
              >
                <MapPin size={15} />
                <span>Addresses</span>
              </button>

              <button
                onClick={() => setActiveTab('perks')}
                className={`w-full flex items-center gap-3 px-4 py-3.5 text-[11px] tracking-[0.2em] uppercase font-semibold transition-all text-left ${activeTab === 'perks' ? 'bg-[#111111] text-white shadow-sm' : 'text-[#111111] hover:bg-[#FAF9F6]'}`}
              >
                <Award size={15} />
                <span>Member Rewards</span>
              </button>

              <button
                onClick={() => setActiveTab('security')}
                className={`w-full flex items-center gap-3 px-4 py-3.5 text-[11px] tracking-[0.2em] uppercase font-semibold transition-all text-left ${activeTab === 'security' ? 'bg-[#111111] text-white shadow-sm' : 'text-[#111111] hover:bg-[#FAF9F6]'}`}
              >
                <Shield size={15} />
                <span>Security</span>
              </button>

              <div className="pt-3 border-t border-[#F3EFE8] mt-2">
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 px-4 py-3 text-[11px] tracking-[0.2em] uppercase font-semibold text-red-600 hover:bg-red-50 transition-colors text-left"
                >
                  <LogOut size={15} />
                  <span>Sign Out</span>
                </button>
              </div>
            </div>
          </div>

          {/* RIGHT PANEL CONTENT */}
          <div className="lg:col-span-9">
            
            {/* 1. ORDERS TAB */}
            {activeTab === 'orders' && (
              <div className="space-y-6">
                <div className="bg-white border border-[#E2DDD6] p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h2 className="font-serif text-2xl md:text-3xl text-[#111111]">Order History</h2>
                    <p className="text-xs text-[#8A8580] mt-1 font-light">View and track all your recent purchases and delivery updates.</p>
                  </div>
                  <Link
                    to="/shop"
                    className="inline-flex items-center gap-2 px-5 py-2.5 border border-[#111111] text-[#111111] hover:bg-[#111111] hover:text-white text-[10px] tracking-[0.2em] uppercase font-semibold transition-all"
                  >
                    <ShoppingBag size={13} />
                    <span>BROWSE SHOP</span>
                  </Link>
                </div>

                <div className="space-y-5">
                  {displayOrders.map((order, idx) => (
                    <motion.div
                      key={order.orderId || idx}
                      initial={{ opacity: 0, y: 15 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.4, delay: idx * 0.08 }}
                      className="bg-white border border-[#E2DDD6] p-6 space-y-5 shadow-2xs hover:border-[#111111] transition-colors"
                    >
                      {/* Order Header */}
                      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-[#F3EFE8]">
                        <div className="flex items-center gap-6">
                          <div>
                            <span className="text-[9px] tracking-[0.2em] uppercase text-[#8A8580]">Order Reference</span>
                            <p className="font-serif text-lg font-medium text-[#111111]">{order.orderId}</p>
                          </div>
                          <div>
                            <span className="text-[9px] tracking-[0.2em] uppercase text-[#8A8580]">Date Placed</span>
                            <p className="text-xs text-[#111111] font-medium">{order.createdAt}</p>
                          </div>
                        </div>

                        <div className="flex items-center gap-4">
                          <div>
                            <span className="text-[9px] tracking-[0.2em] uppercase text-[#8A8580]">Total Amount</span>
                            <p className="text-base font-semibold text-[#111111]">₹{order.total?.toLocaleString()}</p>
                          </div>
                          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#FAF9F6] border border-[#E2DDD6] text-[10px] tracking-widest uppercase font-semibold text-[#111111]">
                            <Truck size={12} className="text-emerald-700" />
                            {order.status || 'Confirmed'}
                          </span>
                        </div>
                      </div>

                      {/* Items List */}
                      <div className="space-y-3 pt-1">
                        {order.items?.map(item => (
                          <div key={item.id} className="flex items-center gap-4 py-2 border-b border-[#FAF9F6] last:border-0">
                            <div className="w-14 h-14 bg-[#FAF9F6] border border-[#E2DDD6] overflow-hidden flex-shrink-0">
                              <img src={item.images?.[0]} alt={item.name} className="w-full h-full object-cover" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="font-serif text-base text-[#111111] truncate">{item.name}</p>
                              <p className="text-[#8A8580] text-xs font-light">Quantity: {item.quantity} &bull; ₹{item.price.toLocaleString()} each</p>
                            </div>
                            <span className="font-semibold text-sm text-[#111111]">₹{(item.price * item.quantity).toLocaleString()}</span>
                          </div>
                        ))}
                      </div>

                      {/* Action Bar */}
                      <div className="pt-3 flex items-center justify-between border-t border-[#F3EFE8]">
                        <p className="text-xs text-[#8A8580] font-light flex items-center gap-1">
                          <Clock size={13} /> Estimated Delivery: 2-4 Business Days
                        </p>
                        <button
                          onClick={() => setToast(`Tracking info sent for order ${order.orderId}`)}
                          className="text-[10px] tracking-[0.2em] uppercase font-semibold text-[#111111] hover:underline"
                        >
                          Track Package &rarr;
                        </button>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            )}

            {/* 2. PROFILE DETAILS TAB */}
            {activeTab === 'profile' && (
              <div className="bg-white border border-[#E2DDD6] p-8 md:p-10 space-y-6 shadow-2xs">
                <div>
                  <p className="text-[10px] tracking-[0.25em] uppercase text-[#8A8580] font-medium mb-1">PERSONAL DETAILS</p>
                  <h2 className="font-serif text-2xl md:text-3xl text-[#111111]">Edit Profile Information</h2>
                  <p className="text-xs text-[#666666] mt-1 font-light">Update your account name, contact number, and default contact details.</p>
                </div>

                <form onSubmit={handleProfileSave} className="space-y-5 max-w-xl pt-2">
                  <Input
                    label="Full Name"
                    value={profileForm.name}
                    onChange={e => setProfileForm(f => ({ ...f, name: e.target.value }))}
                  />
                  
                  <Input
                    label="Email Address"
                    type="email"
                    value={profileForm.email}
                    onChange={e => setProfileForm(f => ({ ...f, email: e.target.value }))}
                  />
                  
                  <Input
                    label="Phone Number"
                    type="tel"
                    value={profileForm.phone}
                    onChange={e => setProfileForm(f => ({ ...f, phone: e.target.value }))}
                  />

                  <Input
                    label="Primary Delivery Address"
                    value={profileForm.address}
                    onChange={e => setProfileForm(f => ({ ...f, address: e.target.value }))}
                    placeholder="Enter default shipping address"
                  />

                  <div className="pt-4">
                    <Button type="submit" size="md" className="bg-[#111111] text-white hover:bg-[#2A2A2A] px-8 py-3.5 text-[11px] tracking-[0.2em]">
                      {saved ? 'Saved Successfully ✓' : 'Save Changes'}
                    </Button>
                  </div>
                </form>
              </div>
            )}

            {/* 3. ADDRESSES TAB */}
            {activeTab === 'addresses' && (
              <div className="space-y-6">
                <div className="bg-white border border-[#E2DDD6] p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h2 className="font-serif text-2xl text-[#111111]">Saved Delivery Addresses</h2>
                    <p className="text-xs text-[#8A8580] mt-1 font-light">Manage your default shipping destinations for fast checkout.</p>
                  </div>
                  <button
                    onClick={() => setToast('Address manager opened')}
                    className="inline-flex items-center gap-1.5 px-4 py-2 border border-[#111111] text-[#111111] hover:bg-[#111111] hover:text-white text-[10px] tracking-[0.2em] uppercase font-semibold transition-all"
                  >
                    + Add New Address
                  </button>
                </div>

                <div className="grid sm:grid-cols-2 gap-6">
                  <div className="bg-white border border-[#111111] p-6 space-y-3 relative">
                    <span className="absolute top-4 right-4 text-[9px] tracking-widest uppercase font-semibold px-2 py-0.5 bg-[#111111] text-white">
                      DEFAULT
                    </span>
                    <p className="font-serif text-lg text-[#111111]">{user.name}</p>
                    <p className="text-xs text-[#555555] font-light leading-relaxed">
                      {profileForm.address}
                    </p>
                    <p className="text-xs text-[#8A8580] font-light">Phone: {profileForm.phone}</p>
                    <div className="pt-3 border-t border-[#F3EFE8] flex items-center gap-4">
                      <button onClick={() => setActiveTab('profile')} className="text-[10px] tracking-widest uppercase font-semibold text-[#111111] underline">
                        Edit
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* 4. MEMBER PERKS TAB */}
            {activeTab === 'perks' && (
              <div className="bg-white border border-[#E2DDD6] p-8 md:p-10 space-y-6 shadow-2xs">
                <div>
                  <p className="text-[10px] tracking-[0.25em] uppercase text-[#8A8580] font-medium mb-1">BOTANICAL CIRCLE</p>
                  <h2 className="font-serif text-2xl md:text-3xl text-[#111111]">Your Member Privileges</h2>
                  <p className="text-xs text-[#666666] mt-1 font-light">Exclusive benefits and rewards curated for our community.</p>
                </div>

                <div className="grid sm:grid-cols-3 gap-5 pt-2">
                  <div className="bg-[#FAF9F6] border border-[#E2DDD6] p-6 text-center space-y-2">
                    <div className="w-10 h-10 rounded-full bg-white border border-[#E2DDD6] flex items-center justify-center mx-auto text-[#111111]">
                      <Truck size={18} />
                    </div>
                    <h4 className="font-serif text-base text-[#111111]">Free Standard Shipping</h4>
                    <p className="text-xs text-[#8A8580] font-light">Applied automatically on all orders above ₹499.</p>
                  </div>

                  <div className="bg-[#FAF9F6] border border-[#E2DDD6] p-6 text-center space-y-2">
                    <div className="w-10 h-10 rounded-full bg-white border border-[#E2DDD6] flex items-center justify-center mx-auto text-[#111111]">
                      <Sparkles size={18} />
                    </div>
                    <h4 className="font-serif text-base text-[#111111]">Early Access</h4>
                    <p className="text-xs text-[#8A8580] font-light">Preview new artisan batches 48 hours before public launch.</p>
                  </div>

                  <div className="bg-[#FAF9F6] border border-[#E2DDD6] p-6 text-center space-y-2">
                    <div className="w-10 h-10 rounded-full bg-white border border-[#E2DDD6] flex items-center justify-center mx-auto text-[#111111]">
                      <Award size={18} />
                    </div>
                    <h4 className="font-serif text-base text-[#111111]">Birthday Gift</h4>
                    <p className="text-xs text-[#8A8580] font-light">Exclusive 15% discount voucher on your birthday month.</p>
                  </div>
                </div>
              </div>
            )}

            {/* 5. SECURITY TAB */}
            {activeTab === 'security' && (
              <div className="bg-white border border-[#E2DDD6] p-8 md:p-10 space-y-6 shadow-2xs">
                <div>
                  <h2 className="font-serif text-2xl md:text-3xl text-[#111111]">Security & Account Controls</h2>
                  <p className="text-xs text-[#8A8580] mt-1 font-light">Update password and manage session permissions.</p>
                </div>

                <div className="border-t border-[#F3EFE8] pt-6 space-y-5 max-w-lg">
                  <Input label="Current Password" type="password" placeholder="••••••••" />
                  <Input label="New Password" type="password" placeholder="••••••••" />
                  <Input label="Confirm New Password" type="password" placeholder="••••••••" />

                  <Button type="button" onClick={() => setToast('Password updated successfully')} size="md">
                    Update Password
                  </Button>
                </div>

                <div className="border-t border-[#F3EFE8] pt-8 mt-8">
                  <h3 className="font-serif text-lg text-red-600 mb-2">Sign Out of Account</h3>
                  <p className="text-xs text-[#8A8580] mb-4 font-light">
                    Terminates your current session on this browser.
                  </p>
                  <Button variant="outline" onClick={handleLogout} size="sm" className="border-red-600 text-red-600 hover:bg-red-600 hover:text-white">
                    Sign Out Now
                  </Button>
                </div>
              </div>
            )}

          </div>
        </div>
      </div>

      {toast && <Toast message={toast} onClose={() => setToast(null)} />}
    </main>
  );
}
