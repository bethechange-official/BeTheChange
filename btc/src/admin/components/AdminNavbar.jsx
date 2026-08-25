import { Menu, LogOut, ExternalLink, Shield } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import { adminAuth } from '../utils/adminAuth';

export function AdminNavbar({ title, onToggleSidebar }) {
  const navigate = useNavigate();
  const currentAdmin = adminAuth.getCurrentAdmin();

  const handleLogout = () => {
    adminAuth.logout();
    navigate('/admin/login');
  };

  return (
    <header className="h-16 bg-white border-b border-gray-200/80 px-4 sm:px-8 flex items-center justify-between sticky top-0 z-30 shadow-2xs">
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleSidebar}
          className="lg:hidden text-gray-600 hover:text-gray-900 p-1.5 rounded-lg border border-gray-200"
          aria-label="Toggle Navigation"
        >
          <Menu size={20} />
        </button>

        <h1 className="text-lg sm:text-xl font-bold text-gray-900 tracking-tight font-serif">{title}</h1>
      </div>

      <div className="flex items-center gap-4">
        {/* View Storefront Link */}
        <Link
          to="/"
          target="_blank"
          className="hidden sm:inline-flex items-center gap-1.5 text-xs text-gray-600 hover:text-gray-900 font-medium tracking-wide uppercase px-3 py-1.5 rounded-md border border-gray-200 hover:bg-gray-50 transition-colors"
        >
          <span>View Storefront</span>
          <ExternalLink size={13} />
        </Link>

        {/* Admin Profile */}
        <div className="flex items-center gap-3 pl-3 border-l border-gray-200">
          <div className="w-8 h-8 rounded-full bg-gray-900 text-white flex items-center justify-center font-bold text-xs">
            <Shield size={15} />
          </div>
          <div className="hidden sm:block text-left">
            <p className="text-xs font-semibold text-gray-900 leading-tight">
              {currentAdmin ? currentAdmin.name : 'BTC Administrator'}
            </p>
            <p className="text-[10px] text-gray-500">{currentAdmin ? currentAdmin.email : 'admin@btc.com'}</p>
          </div>

          <button
            onClick={handleLogout}
            title="Logout"
            className="text-gray-400 hover:text-rose-600 p-1.5 rounded-lg hover:bg-rose-50 transition-colors ml-1"
          >
            <LogOut size={17} />
          </button>
        </div>
      </div>
    </header>
  );
}
