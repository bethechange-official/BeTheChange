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
    <main className="pt-18 md:pt-22 min-h-screen bg-[#FAF9F6]">
      {cat && (
        <div className="relative h-48 md:h-64 overflow-hidden bg-[#F3EFE8]">
          <img src={cat.imageUrl || 'https://images.unsplash.com/photo-1556228578-8c89e6adf883?w=600&q=80'} alt={cat.name} className="w-full h-full object-cover opacity-60" />
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
        {loading ? (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-white border border-[#E2DDD6] p-4 animate-pulse">
                <div className="aspect-square bg-[#E8E3DC] mb-4" />
                <div className="h-4 bg-[#E8E3DC] w-3/4 mb-2" />
                <div className="h-3 bg-[#E8E3DC] w-1/2" />
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
