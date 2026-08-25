import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Package,
  Layers,
  Tag,
  Users,
  ShoppingBag,
  Settings,
  LogOut,
  X
} from 'lucide-react';
import { adminAuth } from '../utils/adminAuth';

export function AdminSidebar({ isOpen, onClose }) {
  const navigate = useNavigate();

  const handleLogout = () => {
    adminAuth.logout();
    navigate('/admin/login');
  };

  const navItems = [
    { to: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/admin/products', label: 'Products', icon: Package },
    { to: '/admin/categories', label: 'Categories', icon: Layers },
    { to: '/admin/coupons', label: 'Coupons', icon: Tag },
    { to: '/admin/customers', label: 'Customers', icon: Users },
    { to: '/admin/orders', label: 'Orders', icon: ShoppingBag },
    { to: '/admin/settings', label: 'Settings', icon: Settings },
  ];

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 bg-black/50 z-40 lg:hidden backdrop-blur-xs"
        />
      )}

      {/* Sidebar container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-64 bg-gray-900 text-white flex flex-col transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand Header */}
        <div className="h-16 px-6 flex items-center justify-between border-b border-gray-800">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-white text-gray-900 flex items-center justify-center font-serif font-bold text-lg">
              B
            </div>
            <div>
              <h1 className="font-serif font-bold text-lg text-white leading-none">BTC Admin</h1>
              <span className="text-[9px] tracking-widest uppercase text-gray-400 font-sans">Be The Change</span>
            </div>
          </div>

          <button
            onClick={onClose}
            className="lg:hidden text-gray-400 hover:text-white p-1"
          >
            <X size={20} />
          </button>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                onClick={onClose}
                className={({ isActive }) =>
                  `flex items-center gap-3.5 px-4 py-3 rounded-lg text-xs font-semibold uppercase tracking-wider transition-all duration-200 ${
                    isActive
                      ? 'bg-white text-gray-900 shadow-sm font-bold'
                      : 'text-gray-400 hover:bg-gray-800 hover:text-white'
                  }`
                }
              >
                <Icon size={18} />
                <span>{item.label}</span>
              </NavLink>
            );
          })}
        </nav>

        {/* Logout Button */}
        <div className="p-4 border-t border-gray-800">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3.5 px-4 py-3 rounded-lg text-xs font-semibold uppercase tracking-wider text-rose-400 hover:bg-rose-500/10 hover:text-rose-300 transition-colors"
          >
            <LogOut size={18} />
            <span>Logout</span>
          </button>
        </div>
      </aside>
    </>
  );
}
