import { useState } from 'react';
import { Search, X } from 'lucide-react';
import { Link } from 'react-router-dom';
import { products } from '../../data/products';

export function SearchOverlay({ isOpen, onClose }) {
  const [query, setQuery] = useState('');

  const results = query.trim().length > 1
    ? products.filter(p =>
        p.name.toLowerCase().includes(query.toLowerCase()) ||
        p.category.toLowerCase().includes(query.toLowerCase()) ||
        p.skinConcerns.some(s => s.toLowerCase().includes(query.toLowerCase())) ||
        p.ingredients.some(i => i.toLowerCase().includes(query.toLowerCase()))
      ).slice(0, 6)
    : [];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[120] bg-white/95 backdrop-blur-sm flex flex-col">
      <div className="flex items-center justify-between px-6 md:px-12 py-5 border-b border-[#E2DDD6]">
        <div className="flex items-center gap-3 flex-1 max-w-2xl mx-auto">
          <Search size={18} className="text-[#8A8580] flex-shrink-0" />
          <input
            autoFocus
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Search products, ingredients, concerns..."
            className="flex-1 bg-transparent text-lg text-[#111111] placeholder:text-[#C8C0B4] focus:outline-none font-sans"
          />
          {query && (
            <button onClick={() => setQuery('')} className="text-[#8A8580] hover:text-[#111111]">
              <X size={16} />
            </button>
          )}
        </div>
        <button onClick={onClose} className="ml-6 text-[#8A8580] hover:text-[#111111] transition-colors">
          <X size={20} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-6 md:px-12 py-8 max-w-2xl mx-auto w-full">
        {query.trim().length > 1 && results.length === 0 && (
          <p className="text-[#8A8580] text-sm">No results for "{query}"</p>
        )}
        {results.length > 0 && (
          <div className="space-y-1">
            <p className="text-[10px] tracking-widest uppercase text-[#8A8580] mb-4">{results.length} results</p>
            {results.map(p => (
              <Link
                key={p.id}
                to={`/product/${p.id}`}
                onClick={onClose}
                className="flex items-center gap-4 py-3 border-b border-[#F3EFE8] hover:bg-[#FAF9F6] -mx-2 px-2 transition-colors"
              >
                <div className="w-12 h-12 bg-[#F3EFE8] flex-shrink-0 overflow-hidden">
                  <img src={p.images[0]} alt={p.name} className="w-full h-full object-cover" />
                </div>
                <div>
                  <p className="text-[10px] tracking-widest uppercase text-[#8A8580]">{p.category}</p>
                  <p className="font-serif text-base text-[#111111]">{p.name}</p>
                </div>
                <span className="ml-auto text-sm text-[#111111]">₹{p.price.toLocaleString()}</span>
              </Link>
            ))}
          </div>
        )}
        {!query && (
          <div>
            <p className="text-[10px] tracking-widest uppercase text-[#8A8580] mb-4">Popular Searches</p>
            <div className="flex flex-wrap gap-2">
              {['Serum', 'Moisturiser', 'Sunscreen', 'Niacinamide', 'Vitamin C', 'Hydration'].map(t => (
                <button
                  key={t}
                  onClick={() => setQuery(t)}
                  className="text-xs border border-[#E2DDD6] px-4 py-2 text-[#111111] hover:bg-[#F3EFE8] transition-colors"
                >
                  {t}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
