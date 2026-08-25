import { useState, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { ProductGrid } from '../components/product/ProductGrid';
import { ProductFilter } from '../components/filters/ProductFilter';
import { Toast } from '../components/ui/Toast';
import { products } from '../data/products';

export default function Shop() {
  const [searchParams] = useSearchParams();
  const [toast, setToast] = useState(null);
  const [filters, setFilters] = useState({
    category: searchParams.get('category') || 'All',
    concern: 'All',
    sort: 'featured',
  });

  const filtered = useMemo(() => {
    let list = [...products];
    if (filters.category !== 'All') list = list.filter(p => p.category === filters.category);
    if (filters.concern !== 'All') list = list.filter(p => p.skinConcerns.includes(filters.concern));
    switch (filters.sort) {
      case 'price-asc': list.sort((a, b) => a.price - b.price); break;
      case 'price-desc': list.sort((a, b) => b.price - a.price); break;
      case 'newest': list.sort((a, b) => b.id - a.id); break;
      default: list.sort((a, b) => (b.featured ? 1 : 0) - (a.featured ? 1 : 0));
    }
    return list;
  }, [filters]);

  return (
    <main className="pt-18 md:pt-22 min-h-screen bg-[#FAF9F6]">
      <div className="max-w-[1400px] mx-auto px-6 md:px-10 py-12 md:py-16">
        <div className="mb-10">
          <p className="text-[10px] tracking-widest uppercase text-[#8A8580] mb-2">
            Home / Shop
          </p>
          <h1 className="font-serif text-4xl md:text-5xl text-[#111111] mb-3">Shop All</h1>
          <p className="text-sm text-[#8A8580] font-light">{filtered.length} products</p>
        </div>

        <div className="mb-10 pb-6 border-b border-[#E2DDD6]">
          <ProductFilter filters={filters} onChange={setFilters} />
        </div>

        <ProductGrid products={filtered} onAddToCart={() => setToast('Added to bag')} />
      </div>
      {toast && <Toast message={toast} onClose={() => setToast(null)} />}
    </main>
  );
}
