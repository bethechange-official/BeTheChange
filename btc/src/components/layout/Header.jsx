import { useState, useEffect, useRef } from 'react';
import { Link, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { Search, User, Heart, ShoppingBag, Menu, X, LogOut, Package } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { CartDrawer } from '../cart/CartDrawer';
import { products } from '../../data/products';

export function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [searchFocused, setSearchFocused] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  
  const { itemCount } = useCart();
  const { user, logout } = useAuth();
  
  const searchRef = useRef(null);
  const userMenuRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handler);
    return () => window.removeEventListener('scroll', handler);
  }, []);

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e) => {
      if (searchRef.current && !searchRef.current.contains(e.target)) {
        setSearchFocused(false);
      }
      if (userMenuRef.current && !userMenuRef.current.contains(e.target)) {
        setUserMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const results = query.trim().length > 1
    ? products.filter(p =>
        p.name.toLowerCase().includes(query.toLowerCase()) ||
        p.category.toLowerCase().includes(query.toLowerCase()) ||
        p.skinConcerns.some(s => s.toLowerCase().includes(query.toLowerCase())) ||
        p.ingredients.some(i => i.toLowerCase().includes(query.toLowerCase()))
      ).slice(0, 5)
    : [];

  const handleResultClick = (id) => {
    setQuery('');
    setSearchFocused(false);
    navigate(`/product/${id}`);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (query.trim()) {
      setSearchFocused(false);
      navigate(`/shop?q=${encodeURIComponent(query.trim())}`);
      setQuery('');
    }
  };

  const navLinks = [
    { to: '/shop', label: 'SHOP' },
    { to: '/about', label: 'ABOUT' },
    { to: '/contact', label: 'CONTACT' },
  ];

  const isLinkActive = (to) => {
    return location.pathname === to;
  };

  const showDropdown = searchFocused && (results.length > 0 || query.trim().length > 1);

  return (
    <>
      <header className={`fixed top-0 left-0 right-0 z-[80] transition-all duration-300 ${scrolled ? 'bg-white/95 backdrop-blur-md shadow-sm' : 'bg-[#FAF9F6]'}`}>
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 md:px-10">
          <div className="flex items-center gap-3 sm:gap-6 md:gap-8 h-16 md:h-18">

            {/* LEFT — Logo */}
            <Link to="/" className="flex items-center flex-shrink-0">
              <img
                src="/logo.png"
                alt="Be The Change"
                className="brand-logo-img"
              />
            </Link>

            {/* CENTER — Nav links (desktop) */}
            <nav className="hidden md:flex items-center gap-8 flex-shrink-0">
              {navLinks.map(l => (
                <Link
                  key={l.label}
                  to={l.to}
                  className={`text-[11px] tracking-[0.22em] uppercase font-medium transition-all duration-200 whitespace-nowrap text-[#111111] hover:text-[#5C554E] ${isLinkActive(l.to) ? 'border-b border-[#111111] pb-0.5' : ''}`}
                >
                  {l.label}
                </Link>
              ))}
            </nav>

            {/* SEARCH BAR — desktop */}
            <div ref={searchRef} className="hidden md:flex flex-1 relative">
              <form onSubmit={handleSubmit} className="w-full">
                <div className={`flex items-center border transition-colors duration-200 ${searchFocused ? 'border-[#111111]' : 'border-[#E2DDD6]'} bg-white px-4 py-1.5 rounded-full`}>
                  <Search size={14} className="text-[#8A8580] flex-shrink-0 mr-3" />
                  <input
                    value={query}
                    onChange={e => setQuery(e.target.value)}
                    onFocus={() => setSearchFocused(true)}
                    placeholder="Search products, ingredients..."
                    className="flex-1 bg-transparent text-sm text-[#111111] placeholder:text-[#C8C0B4] focus:outline-none font-sans"
                  />
                  {query && (
                    <button
                      type="button"
                      onClick={() => { setQuery(''); setSearchFocused(false); }}
                      className="text-[#8A8580] hover:text-[#111111] transition-colors ml-2"
                    >
                      <X size={13} />
                    </button>
                  )}
                </div>
              </form>

              {/* Dropdown results */}
              {showDropdown && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-[#E2DDD6] shadow-lg z-[90] max-h-80 overflow-y-auto">
                  {results.length === 0 && query.trim().length > 1 ? (
                    <p className="px-4 py-4 text-sm text-[#8A8580]">No results for "{query}"</p>
                  ) : (
                    results.map(p => (
                      <button
                        key={p.id}
                        onClick={() => handleResultClick(p.id)}
                        className="w-full flex items-center gap-3 px-4 py-3 hover:bg-[#FAF9F6] transition-colors border-b border-[#F3EFE8] last:border-0 text-left"
                      >
                        <div className="w-10 h-10 bg-[#F3EFE8] flex-shrink-0 overflow-hidden">
                          <img src={p.images[0]} alt={p.name} className="w-full h-full object-cover" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-[10px] tracking-widest uppercase text-[#8A8580]">{p.category}</p>
                          <p className="font-serif text-sm text-[#111111] truncate">{p.name}</p>
                        </div>
                        <span className="text-sm text-[#111111] flex-shrink-0">₹{p.price.toLocaleString()}</span>
                      </button>
                    ))
                  )}
                </div>
              )}
            </div>

            {/* RIGHT — Icons & User Dropdown */}
            <div className="flex items-center gap-2.5 sm:gap-4 md:gap-5 flex-shrink-0 ml-auto md:ml-0">
              
              {/* Account Trigger (LOGIN / REGISTER button when logged out, Profile Icon when logged in — visible on mobile & desktop) */}
              <div ref={userMenuRef} className="relative block">
                {user ? (
                  <Link
                    to="/account"
                    onClick={(e) => {
                      if (window.innerWidth >= 768) {
                        e.preventDefault();
                        setUserMenuOpen(o => !o);
                      }
                    }}
                    className="flex items-center gap-2 text-[#111111] hover:opacity-80 transition-opacity"
                    aria-label="Account Menu"
                  >
                    <div className="w-8 h-8 rounded-full bg-[#111111] text-white text-[11px] font-serif flex items-center justify-center font-semibold shadow-2xs">
                      {user.name ? user.name[0].toUpperCase() : 'U'}
                    </div>
                  </Link>
                ) : (
                  <Link
                    to="/login"
                    className="inline-flex items-center gap-1 px-2.5 py-1 sm:px-4 sm:py-2 rounded-full border border-[#111111] text-[#111111] hover:bg-[#111111] hover:text-white text-[9px] sm:text-[10px] tracking-[0.1em] sm:tracking-[0.18em] uppercase font-semibold transition-all duration-200 shadow-2xs whitespace-nowrap"
                  >
                    <User size={12} className="flex-shrink-0" />
                    <span className="hidden sm:inline">LOGIN / REGISTER</span>
                    <span className="sm:hidden">LOGIN</span>
                  </Link>
                )}

                {/* User Dropdown Menu */}
                {user && userMenuOpen && (
                  <div className="absolute right-0 top-full mt-3 w-56 bg-white border border-[#E2DDD6] shadow-lg py-2 z-[90]">
                    <div className="px-4 py-3 border-b border-[#F3EFE8]">
                      <p className="text-[10px] tracking-[0.2em] uppercase text-[#8A8580]">Signed in as</p>
                      <p className="font-serif text-sm font-medium text-[#111111] truncate">{user.name}</p>
                      <p className="text-[11px] text-[#8A8580] truncate">{user.email}</p>
                    </div>
                    
                    <Link
                      to="/account"
                      onClick={() => setUserMenuOpen(false)}
                      className="w-full flex items-center gap-2.5 px-4 py-2.5 text-xs text-[#111111] hover:bg-[#FAF9F6] transition-colors"
                    >
                      <User size={14} />
                      My Profile
                    </Link>

                    <Link
                      to="/account"
                      onClick={() => setUserMenuOpen(false)}
                      className="w-full flex items-center gap-2.5 px-4 py-2.5 text-xs text-[#111111] hover:bg-[#FAF9F6] transition-colors border-b border-[#F3EFE8]"
                    >
                      <Package size={14} />
                      Order History
                    </Link>

                    <button
                      onClick={() => { logout(); setUserMenuOpen(false); navigate('/'); }}
                      className="w-full flex items-center gap-2.5 px-4 py-2.5 text-xs text-red-600 hover:bg-red-50 transition-colors text-left font-medium"
                    >
                      <LogOut size={14} />
                      Sign Out
                    </button>
                  </div>
                )}
              </div>

              <button
                className="hidden md:block text-[#111111] hover:opacity-40 transition-opacity"
                aria-label="Wishlist"
              >
                <Heart size={19} />
              </button>
              
              <button
                onClick={() => setCartOpen(true)}
                className="relative text-[#111111] hover:opacity-40 transition-opacity"
                aria-label="Cart"
              >
                <ShoppingBag size={19} />
                {itemCount > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-[#111111] text-white text-[9px] rounded-full flex items-center justify-center font-medium">
                    {itemCount}
                  </span>
                )}
              </button>

              {/* Mobile hamburger */}
              <button
                className="md:hidden text-[#111111] hover:opacity-40 transition-opacity"
                onClick={() => setMobileOpen(true)}
                aria-label="Menu"
              >
                <Menu size={22} />
              </button>
            </div>

          </div>
        </div>

        {/* Bottom border */}
        <div className="h-px bg-[#E2DDD6]" />
      </header>

      {/* Mobile Menu */}
      <div className={`fixed inset-0 z-[110] bg-white flex flex-col transition-transform duration-500 ${mobileOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#E2DDD6]">
          <Link to="/" onClick={() => setMobileOpen(false)}>
            <img src="/logo.png" alt="Be The Change" className="h-18 w-auto object-contain" />
          </Link>
          <button onClick={() => setMobileOpen(false)} className="text-[#111111]">
            <X size={22} />
          </button>
        </div>

        {/* Mobile search */}
        <div className="px-6 pt-6 pb-2">
          <div className="flex items-center border border-[#E2DDD6] bg-[#FAF9F6] px-4 py-3 rounded-full">
            <Search size={14} className="text-[#8A8580] mr-3 flex-shrink-0" />
            <input
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="Search products..."
              className="flex-1 bg-transparent text-sm text-[#111111] placeholder:text-[#C8C0B4] focus:outline-none"
            />
          </div>
        </div>

        {/* Mobile user greeting if logged in */}
        {user && (
          <div className="mx-6 mt-4 p-4 bg-[#FAF9F6] border border-[#E2DDD6] flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-[#111111] text-white font-serif text-xs flex items-center justify-center">
                {user.name ? user.name[0].toUpperCase() : 'U'}
              </div>
              <div>
                <p className="text-[9px] tracking-widest uppercase text-[#8A8580]">Welcome</p>
                <p className="font-serif text-sm font-medium text-[#111111]">{user.name}</p>
              </div>
            </div>
            <Link
              to="/account"
              onClick={() => setMobileOpen(false)}
              className="text-[10px] tracking-widest uppercase font-semibold text-[#111111] underline"
            >
              Account
            </Link>
          </div>
        )}

        <nav className="flex flex-col px-6 py-6 gap-0">
          {[...navLinks, { to: user ? '/account' : '/login', label: user ? 'MY ACCOUNT' : 'ACCOUNT' }].map(l => (
            <NavLink
              key={l.label}
              to={l.to}
              onClick={() => setMobileOpen(false)}
              className="font-serif text-3xl text-[#111111] border-b border-[#F3EFE8] py-5 hover:opacity-50 transition-opacity"
            >
              {l.label}
            </NavLink>
          ))}
        </nav>

        {user && (
          <div className="mt-auto p-6 border-t border-[#E2DDD6]">
            <button
              onClick={() => { logout(); setMobileOpen(false); navigate('/'); }}
              className="w-full py-3.5 border border-red-600 text-red-600 text-[11px] tracking-[0.2em] uppercase font-semibold flex items-center justify-center gap-2"
            >
              <LogOut size={14} />
              Sign Out
            </button>
          </div>
        )}
      </div>

      <CartDrawer isOpen={cartOpen} onClose={() => setCartOpen(false)} />
    </>
  );
}

