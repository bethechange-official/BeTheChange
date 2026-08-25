import { useMemo, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ProductGrid } from '../components/product/ProductGrid';
import { Toast } from '../components/ui/Toast';
import { products } from '../data/products';
import { categories } from '../data/categories';

export default function CategoryPage() {
  const { category } = useParams();
  const [toast, setToast] = useState(null);

  const cat = categories.find(c => c.id === category);
  const catName = cat?.name || category;

  const filtered = useMemo(
    () => products.filter(p => p.category.toLowerCase() === catName.toLowerCase()),
    [catName]
  );

  return (
    <main className="pt-18 md:pt-22 min-h-screen bg-[#FAF9F6]">
      {cat && (
        <div className="relative h-48 md:h-64 overflow-hidden bg-[#F3EFE8]">
          <img src={cat.image} alt={cat.name} className="w-full h-full object-cover opacity-60" />
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
            <p className="text-[10px] tracking-[0.25em] uppercase text-[#8A8580] mb-2">Collection</p>
            <h1 className="font-serif text-4xl md:text-5xl text-[#111111]">{cat.name}</h1>
            <p className="text-sm text-[#8A8580] mt-2 font-light">{cat.description}</p>
          </div>
        </div>
      )}
      <div className="max-w-[1400px] mx-auto px-6 md:px-10 py-12 md:py-16">
        <p className="text-[10px] tracking-widest uppercase text-[#8A8580] mb-8">
          <Link to="/" className="hover:text-[#111111]">Home</Link> /{' '}
          <Link to="/shop" className="hover:text-[#111111]">Shop</Link> / {catName}
        </p>
        <ProductGrid products={filtered} onAddToCart={() => setToast('Added to bag')} />
      </div>
      {toast && <Toast message={toast} onClose={() => setToast(null)} />}
    </main>
  );
}
