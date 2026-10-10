import { useState, useEffect, useRef } from 'react';
import { Link, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { Search, User, Heart, ShoppingBag, Menu, X, LogOut, Package } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { CartDrawer } from '../cart/CartDrawer';
import { productService } from '../../services/productService';

export function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [results, setResults] = useState([]);
  
  const { itemCount } = useCart();
  const { user, logout } = useAuth();
  
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
      if (!e.target.closest('[data-search]')) {
        setSearchOpen(false);
      }
      if (userMenuRef.current && !userMenuRef.current.contains(e.target)) {
        setUserMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  useEffect(() => {
    if (query.trim().length > 1) {
      const timer = setTimeout(async () => {
        try {
          const res = await productService.getProducts({ search: query.trim(), limit: 5 });
          if (res.success) {
            setResults(res.data.products);
          }
        } catch (err) {
          console.error(err);
        }
      }, 300);
      return () => clearTimeout(timer);
    } else {
      setResults([]);
    }
  }, [query]);

  const handleResultClick = (id) => {
    setQuery('');
    setSearchOpen(false);
    navigate(`/product/${id}`);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (query.trim()) {
      setSearchOpen(false);
      navigate(`/shop?q=${encodeURIComponent(query.trim())}`);
      setQuery('');
    }
  };

  const navLinks = [
    { to: '/shop', label: 'Shop All' },
    { to: '/category/skin-care-products', label: 'Skincare' },
    { to: '/category/lip-care', label: 'Lip Care' },
    { to: '/category/hair-care-products', label: 'Hair Care' },
    { to: '/category/household-products', label: 'Household' },
  ];

  const isLinkActive = (to) => location.pathname === to;

  const navLinkClass = (to) =>
    `relative text-[11px] tracking-[0.22em] uppercase font-medium whitespace-nowrap text-[#1F1A16] transition-colors hover:text-[#A2785A]
     after:absolute after:left-0 after:-bottom-1.5 after:h-px after:bg-[#A2785A] after:transition-all after:duration-500
     ${isLinkActive(to) ? 'after:w-full' : 'after:w-0 hover:after:w-full'}`;

  const iconBtn = 'text-[#1F1A16] hover:text-[#A2785A] transition-colors p-1.5';

  // Called as a function (not a component) so the input keeps focus between renders.
  const renderSearch = (className = '') => (
    <div data-search className={`relative ${className}`}>
      <form onSubmit={handleSubmit} className="flex items-center h-11 bg-white shadow-sm border border-transparent focus-within:border-[#1F1A16]/25 focus-within:shadow-md rounded-full pl-5 pr-1.5 transition-all">
        <Search size={16} strokeWidth={1.5} className="text-[#8C8178] shrink-0" />
        <input
          value={query}
          onChange={e => { setQuery(e.target.value); setSearchOpen(true); }}
          onFocus={() => setSearchOpen(true)}
          placeholder="Search serums, lip balms, hair oils…"
          aria-label="Search products"
          className="flex-1 min-w-0 bg-transparent text-sm text-[#1F1A16] placeholder:text-[#9A8F85] focus:outline-none px-3"
        />
        {query && (
          <button type="button" onClick={() => setQuery('')} className="text-[#8C8178] hover:text-[#1F1A16] p-1.5" aria-label="Clear search">
            <X size={15} strokeWidth={1.5} />
          </button>
        )}
        <button type="submit" className="h-8 px-4 rounded-full bg-[#1F1A16] text-[#F8F5F0] text-[10px] tracking-[0.2em] uppercase hover:bg-[#3A322B] transition-colors shrink-0">
          Search
        </button>
      </form>

      {searchOpen && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-[#E4DDD2] shadow-[0_30px_60px_-20px_rgba(31,26,22,0.25)] z-[90] max-h-96 overflow-y-auto">
          {query.trim().length <= 1 ? (
            <div className="p-5">
              <p className="text-[10px] tracking-[0.24em] uppercase text-[#8C8178] mb-3">Popular searches</p>
              <div className="flex flex-wrap gap-2">
                {['Serum', 'Lip balm', 'Hair oil', 'Face wash', 'Soap'].map(term => (
                  <button
                    key={term}
                    type="button"
                    onClick={() => setQuery(term)}
                    className="text-xs px-3.5 py-1.5 border border-[#E4DDD2] text-[#1F1A16] hover:border-[#1F1A16] transition-colors rounded-full"
                  >
                    {term}
                  </button>
                ))}
              </div>
            </div>
          ) : results.length === 0 ? (
            <p className="p-5 text-sm text-[#8C8178] font-light">No results for “{query}”</p>
          ) : (
            results.map(p => (
              <button
                key={p.id}
                type="button"
                onClick={() => handleResultClick(p.slug || p.id)}
                className="w-full flex items-center gap-4 px-5 py-3 border-b border-[#E4DDD2] last:border-0 text-left hover:bg-[#EFE9E0] transition-colors"
              >
                <div className="w-10 h-12 bg-[#EFE9E0] shrink-0 overflow-hidden">
                  {p.images?.[0] && <img src={p.images[0]} alt="" className="w-full h-full object-cover" />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[9px] tracking-[0.24em] uppercase text-[#A2785A]">{p.category}</p>
                  <p className="font-serif text-base text-[#1F1A16] truncate">{p.name}</p>
                </div>
                <span className="text-sm text-[#1F1A16] shrink-0">₹{p.price.toLocaleString('en-IN')}</span>
              </button>
            ))
          )}
        </div>
      )}
    </div>
  );

  return (
    <>
      <header className={`sticky top-0 z-[80] transition-colors duration-500 ${scrolled ? 'bg-[#F8F5F0]/92 backdrop-blur-xl' : 'bg-white'} shadow-[0_1px_0_#E4DDD2]`}>
        {/* Row 1 — logo · search · actions */}
        <div className="max-w-[1480px] mx-auto px-4 sm:px-6 md:px-10">
          <div className="flex items-center gap-4 lg:gap-10 h-16 md:h-[76px]">
            <Link to="/" className="flex items-center shrink-0" aria-label="Be The Change — home">
              <img src="/logo.png" alt="Be The Change" className="brand-logo-img" />
            </Link>

            {renderSearch('hidden md:block flex-1 max-w-2xl mx-auto')}

            <div className="flex items-center gap-1 sm:gap-2 md:gap-3 ml-auto md:ml-0 shrink-0">
              {/* Account Trigger */}
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
                    className="flex items-center p-1"
                    aria-label="Account Menu"
                  >
                    <div className="w-8 h-8 rounded-full bg-[#1F1A16] text-[#F8F5F0] text-[13px] font-serif flex items-center justify-center hover:bg-[#A2785A] transition-colors">
                      {user.name ? user.name[0].toUpperCase() : 'U'}
                    </div>
                  </Link>
                ) : (
                  <Link to="/login" className={`${iconBtn} flex items-center gap-2`} aria-label="Sign in">
                    <User size={19} strokeWidth={1.4} />
                    <span className="hidden lg:inline text-[11px] tracking-[0.22em] uppercase font-medium">Sign in</span>
                  </Link>
                )}

                {user && userMenuOpen && (
                  <div className="absolute right-0 top-full mt-4 w-60 bg-white border border-[#E4DDD2] shadow-[0_24px_48px_-12px_rgba(31,26,22,0.18)] py-2 z-[90]">
                    <div className="px-5 py-4 border-b border-[#E4DDD2]">
                      <p className="text-[9px] tracking-[0.28em] uppercase text-[#A2785A]">Signed in as</p>
                      <p className="font-serif text-lg text-[#1F1A16] truncate mt-1">{user.name}</p>
                      <p className="text-[11px] text-[#8C8178] truncate">{user.email}</p>
                    </div>
                    <Link to="/account" onClick={() => setUserMenuOpen(false)} className="w-full flex items-center gap-3 px-5 py-3 text-xs tracking-wide text-[#1F1A16] hover:bg-[#EFE9E0] transition-colors">
                      <User size={14} strokeWidth={1.5} />
                      My Profile
                    </Link>
                    <Link to="/account" onClick={() => setUserMenuOpen(false)} className="w-full flex items-center gap-3 px-5 py-3 text-xs tracking-wide text-[#1F1A16] hover:bg-[#EFE9E0] transition-colors border-b border-[#E4DDD2]">
                      <Package size={14} strokeWidth={1.5} />
                      Order History
                    </Link>
                    <button
                      onClick={() => { logout(); setUserMenuOpen(false); navigate('/'); }}
                      className="w-full flex items-center gap-3 px-5 py-3 text-xs tracking-wide text-[#9B3B2E] hover:bg-[#EFE9E0] transition-colors text-left"
                    >
                      <LogOut size={14} strokeWidth={1.5} />
                      Sign Out
                    </button>
                  </div>
                )}
              </div>

              <button className={`hidden sm:block ${iconBtn}`} aria-label="Wishlist">
                <Heart size={19} strokeWidth={1.4} />
              </button>

              <button onClick={() => setCartOpen(true)} className={`relative ${iconBtn}`} aria-label="Cart">
                <ShoppingBag size={19} strokeWidth={1.4} />
                {itemCount > 0 && (
                  <span className="absolute top-0 -right-0.5 min-w-4 h-4 px-1 bg-[#A2785A] text-white text-[9px] rounded-full flex items-center justify-center font-medium">
                    {itemCount}
                  </span>
                )}
              </button>

              <button className={`lg:hidden ${iconBtn}`} onClick={() => setMobileOpen(true)} aria-label="Menu">
                <Menu size={21} strokeWidth={1.4} />
              </button>
            </div>
          </div>

          {/* Mobile search, below the logo row */}
          {renderSearch('md:hidden pb-3')}
        </div>

        {/* Row 2 — navigation (desktop) */}
        <nav className="hidden lg:block border-t border-[#E4DDD2]">
          <div className="max-w-[1480px] mx-auto px-10 h-12 flex items-center justify-center gap-10 xl:gap-14">
            {[...navLinks, { to: '/about', label: 'Our Story' }, { to: '/contact', label: 'Contact' }].map(l => (
              <Link key={l.label} to={l.to} className={navLinkClass(l.to)}>
                {l.label}
              </Link>
            ))}
          </div>
        </nav>
      </header>

      {/* Mobile Navigation Drawer */}
      <div
        className={`fixed inset-0 z-[105] bg-[#1F1A16]/40 backdrop-blur-sm transition-opacity duration-500 lg:hidden ${mobileOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        onClick={() => setMobileOpen(false)}
      />
      <div className={`fixed inset-y-0 left-0 w-full max-w-sm z-[110] bg-white flex flex-col transition-transform duration-500 ease-[cubic-bezier(.22,1,.36,1)] ${mobileOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex items-center justify-between px-6 h-16 border-b border-[#E4DDD2]">
          <Link to="/" onClick={() => setMobileOpen(false)}>
            <img src="/logo.png" alt="Be The Change" className="h-11 w-auto object-contain" />
          </Link>
          <button onClick={() => setMobileOpen(false)} className="text-[#1F1A16] p-1" aria-label="Close menu">
            <X size={21} strokeWidth={1.4} />
          </button>
        </div>

        <div className="px-6 pt-6">
          <form onSubmit={(e) => { handleSubmit(e); setMobileOpen(false); }}>
            <div className="flex items-center border-b border-[#1F1A16] pb-2">
              <Search size={15} strokeWidth={1.4} className="text-[#8C8178] mr-3 flex-shrink-0" />
              <input
                value={query}
                onChange={e => setQuery(e.target.value)}
                placeholder="Search products"
                className="flex-1 bg-transparent font-serif text-lg text-[#1F1A16] placeholder:text-[#B5AA9D] placeholder:italic focus:outline-none"
              />
            </div>
          </form>
        </div>

        <nav className="flex flex-col px-6 py-6 overflow-y-auto">
          {[...navLinks, { to: '/about', label: 'Our Story' }, { to: '/contact', label: 'Contact' }].map((l, i) => (
            <NavLink
              key={l.label}
              to={l.to}
              onClick={() => setMobileOpen(false)}
              className="group flex items-baseline gap-4 border-b border-[#E4DDD2] py-4"
            >
              <span className="text-[10px] text-[#A2785A] tabular-nums">{String(i + 1).padStart(2, '0')}</span>
              <span className="font-serif text-[26px] font-light text-[#1F1A16] group-hover:italic transition-all">{l.label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="mt-auto p-6 border-t border-[#E4DDD2] bg-[#EFE9E0]">
          {user ? (
            <div className="flex items-center justify-between">
              <Link to="/account" onClick={() => setMobileOpen(false)} className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-[#1F1A16] text-[#F8F5F0] font-serif text-sm flex items-center justify-center">
                  {user.name ? user.name[0].toUpperCase() : 'U'}
                </div>
                <div>
                  <p className="text-[9px] tracking-[0.24em] uppercase text-[#8C8178]">My account</p>
                  <p className="font-serif text-base text-[#1F1A16]">{user.name}</p>
                </div>
              </Link>
              <button
                onClick={() => { logout(); setMobileOpen(false); navigate('/'); }}
                className="text-[10px] tracking-[0.22em] uppercase text-[#9B3B2E] flex items-center gap-1.5"
              >
                <LogOut size={13} strokeWidth={1.5} />
                Sign out
              </button>
            </div>
          ) : (
            <Link
              to="/login"
              onClick={() => setMobileOpen(false)}
              className="w-full py-3.5 bg-[#1F1A16] text-[#F8F5F0] text-[11px] tracking-[0.24em] uppercase font-medium flex items-center justify-center gap-2"
            >
              <User size={14} strokeWidth={1.5} />
              Sign in / Register
            </Link>
          )}
        </div>
      </div>

      <CartDrawer isOpen={cartOpen} onClose={() => setCartOpen(false)} />
    </>
  );
}
