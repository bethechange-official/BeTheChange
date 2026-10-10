import { Link } from 'react-router-dom';

const footerLinks = {
  Shop: [
    { label: 'All Products', to: '/shop' },
    { label: 'Skincare', to: '/category/skin-care-products' },
    { label: 'Lip Care', to: '/category/lip-care' },
    { label: 'Hair Care', to: '/category/hair-care-products' },
    { label: 'Household', to: '/category/household-products' },
  ],
  Discover: [
    { label: 'About Us', to: '/about' },
    { label: 'Everyday Rituals', to: '/shop' },
    { label: 'Our Philosophy', to: '/about' },
  ],
  'Customer Care': [
    { label: 'Contact Us', to: '/contact' },
    { label: 'FAQs', to: '/contact' },
    { label: 'Shipping', to: '/contact' },
    { label: 'Returns', to: '/contact' },
    { label: 'Terms & Conditions', to: '/contact' },
    { label: 'Privacy Policy', to: '/contact' },
  ],
};

export function Footer() {
  return (
    <footer id="contact" className="relative bg-[#1F1A16] text-[#F8F5F0] overflow-hidden">
      {/* Brand statement */}
      <div className="max-w-[1480px] mx-auto px-6 md:px-10 pt-20 md:pt-28 pb-14 md:pb-20 border-b border-white/10">
        <div className="grid lg:grid-cols-12 gap-10 items-end">
          <div className="lg:col-span-8">
            <p className="text-[10px] tracking-[0.32em] uppercase text-[#C9B8A3] mb-6 flex items-center gap-3">
              <span className="h-px w-8 bg-[#C9B8A3]/60" /> Be the change
            </p>
            <h2 className="font-serif font-light text-4xl sm:text-6xl lg:text-7xl leading-[1.02] tracking-[-0.015em]">
              Honest botanicals,<br />
              <em className="text-[#C9B8A3]">made slowly</em> for everyday rituals.
            </h2>
          </div>
          <div className="lg:col-span-4 lg:text-right">
            <p className="text-sm text-white/55 font-light leading-relaxed mb-6 lg:ml-auto max-w-sm">
              Questions about a product or your order? Our team replies personally, usually within a day.
            </p>
            <Link
              to="/contact"
              className="inline-flex items-center gap-3 border border-white/30 hover:border-[#F8F5F0] hover:bg-white hover:text-[#1F1A16] px-8 py-4 text-[11px] tracking-[0.24em] uppercase transition-all duration-500"
            >
              Write to us <span aria-hidden>→</span>
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-[1480px] mx-auto px-6 md:px-10 py-14 md:py-16">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-10 md:gap-8">
          {Object.entries(footerLinks).map(([section, links]) => (
            <div key={section}>
              <p className="text-[10px] tracking-[0.28em] uppercase text-[#C9B8A3] mb-6">{section}</p>
              <ul className="space-y-3.5">
                {links.map(l => (
                  <li key={l.label}>
                    <Link to={l.to} className="text-sm text-white/60 hover:text-[#F8F5F0] transition-colors font-light">
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          <div>
            <p className="text-[10px] tracking-[0.28em] uppercase text-[#C9B8A3] mb-6">Follow Us</p>
            <div className="flex gap-3">
              <a href="#" aria-label="Instagram" className="w-10 h-10 rounded-full border border-white/15 flex items-center justify-center text-white/70 hover:text-[#1F1A16] hover:bg-white transition-all duration-300">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="2" y="2" width="20" height="20" rx="5"/>
                  <circle cx="12" cy="12" r="4"/>
                  <circle cx="17.5" cy="6.5" r="0.5" fill="currentColor"/>
                </svg>
              </a>
              <a href="#" aria-label="Facebook" className="w-10 h-10 rounded-full border border-white/15 flex items-center justify-center text-white/70 hover:text-[#1F1A16] hover:bg-white transition-all duration-300">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/>
                </svg>
              </a>
              <a href="#" aria-label="Pinterest" className="w-10 h-10 rounded-full border border-white/15 flex items-center justify-center text-white/70 hover:text-[#1F1A16] hover:bg-white transition-all duration-300">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 2C6.48 2 2 6.48 2 12c0 4.24 2.65 7.86 6.39 9.29-.09-.78-.17-1.98.04-2.83.18-.77 1.22-5.17 1.22-5.17s-.31-.62-.31-1.54c0-1.45.84-2.53 1.88-2.53.89 0 1.32.67 1.32 1.47 0 .9-.57 2.24-.87 3.48-.25 1.04.52 1.88 1.54 1.88 1.85 0 3.09-2.37 3.09-5.17 0-2.14-1.44-3.64-3.5-3.64-2.38 0-3.78 1.79-3.78 3.63 0 .72.28 1.49.62 1.91.07.08.08.15.06.23-.06.26-.2.82-.23.94-.04.15-.13.18-.3.11-1.12-.52-1.82-2.17-1.82-3.49 0-2.84 2.06-5.44 5.94-5.44 3.12 0 5.55 2.22 5.55 5.19 0 3.1-1.95 5.59-4.66 5.59-.91 0-1.77-.47-2.06-1.03l-.56 2.09c-.2.78-.75 1.76-1.12 2.35.85.26 1.75.4 2.68.4 5.52 0 10-4.48 10-10S17.52 2 12 2z"/>
                </svg>
              </a>
            </div>
          </div>
        </div>

        <div className="mt-16 pt-8 border-t border-white/10 flex flex-col md:flex-row items-center justify-between gap-5">
          <Link to="/">
            <img src="/logo.png" alt="Be The Change" className="h-12 w-auto object-contain brightness-0 invert opacity-90" />
          </Link>
          <p className="text-[11px] tracking-wide text-white/35">© {new Date().getFullYear()} Be The Change. Crafted in Hyderabad.</p>
          <div className="flex gap-6">
            <Link to="/contact" className="text-[11px] tracking-wide text-white/35 hover:text-white/70 transition-colors">Privacy Policy</Link>
            <Link to="/contact" className="text-[11px] tracking-wide text-white/35 hover:text-white/70 transition-colors">Terms</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
