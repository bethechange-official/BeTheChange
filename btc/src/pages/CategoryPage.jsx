import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ProductGrid } from '../components/product/ProductGrid';
import { Toast } from '../components/ui/Toast';
import { productService } from '../services/productService';
import { categoryService } from '../services/categoryService';

export default function CategoryPage() {
  const { category } = useParams();
  const [toast, setToast] = useState(null);

  const [cat, setCat] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const catRes = await categoryService.getCategories();
        let foundCat = null;
        if (catRes.success) {
          foundCat = catRes.data.find(c => c.id === category || c.slug === category);
          setCat(foundCat);
        }
        const catName = foundCat ? foundCat.name : category;
        const prodRes = await productService.getProducts({ category: catName, limit: 100 });
        if (prodRes.success) {
          setProducts(prodRes.data.products || []);
        }
      } catch (error) {
        console.error('Failed to load category data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [category]);

  const catName = cat?.name || category;

  return (
    <main className="min-h-screen bg-[#F8F5F0]">
      <header className="border-b border-[#E4DDD2] bg-[#EFE9E0]">
        <div className="max-w-[1480px] mx-auto px-5 md:px-10 pt-10 pb-12 md:pt-14 md:pb-16">
          <p className="text-[10px] tracking-[0.24em] uppercase text-[#8C8178] mb-12 md:mb-16">
            <Link to="/" className="hover:text-[#1F1A16] transition-colors">Home</Link>
            <span className="mx-2 text-[#B5AA9D]">/</span>
            <Link to="/shop" className="hover:text-[#1F1A16] transition-colors">Shop</Link>
            <span className="mx-2 text-[#B5AA9D]">/</span>
            <span className="text-[#1F1A16]">{catName}</span>
          </p>
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div>
              <p className="flex items-center gap-3 text-[10px] tracking-[0.32em] uppercase text-[#A2785A] font-medium mb-5">
                <span className="h-px w-8 bg-[#A2785A]/60" /> Collection
              </p>
              <h1 className="font-serif font-light text-5xl md:text-7xl leading-none tracking-[-0.015em] text-[#1F1A16]">{catName}</h1>
            </div>
            {cat?.description && <p className="text-sm text-[#8C8178] font-light max-w-sm md:text-right md:pb-2 leading-relaxed">{cat.description}</p>}
          </div>
        </div>
      </header>

      <div className="max-w-[1480px] mx-auto px-5 md:px-10 py-12 md:py-16">
        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-4 gap-y-12 sm:gap-x-8 md:gap-x-10">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="aspect-[4/5] bg-[#EFE9E0]" />
                <div className="h-2.5 bg-[#EFE9E0] w-1/3 mt-5" />
                <div className="h-4 bg-[#EFE9E0] w-3/4 mt-3" />
                <div className="h-3 bg-[#EFE9E0] w-1/4 mt-4" />
              </div>
            ))}
          </div>
        ) : (
          <ProductGrid products={products} onAddToCart={(result) => setToast(result.success ? 'Added to bag' : result.message)} />
        )}
      </div>
      {toast && <Toast message={toast} onClose={() => setToast(null)} />}
    </main>
  );
}
