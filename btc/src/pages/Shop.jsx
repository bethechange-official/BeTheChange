import { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { ProductGrid } from '../components/product/ProductGrid';
import { ProductFilter } from '../components/filters/ProductFilter';
import { Toast } from '../components/ui/Toast';
import { productService } from '../services/productService';

export default function Shop() {
  const [searchParams] = useSearchParams();
  const searchQuery = searchParams.get('q') || '';
  const [toast, setToast] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalProducts, setTotalProducts] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [filters, setFilters] = useState({
    category: searchParams.get('category') || 'All',
    concern: 'All',
    sort: 'featured',
    search: '',
    minPrice: '',
    maxPrice: '',
    page: 1,
    limit: 12,
  });

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const params = {
        category: filters.category !== 'All' ? filters.category : undefined,
        skinConcern: filters.concern !== 'All' ? filters.concern : undefined,
        sort: filters.sort,
        search: searchQuery || filters.search || undefined,
        minPrice: filters.minPrice || undefined,
        maxPrice: filters.maxPrice || undefined,
        page: filters.page,
        limit: filters.limit,
      };
      const response = await productService.getProducts(params);
      if (response.success) {
        setProducts(response.data.products);
        setTotalProducts(response.data.totalProducts);
        setCurrentPage(response.data.currentPage);
        setTotalPages(response.data.totalPages);
      }
    } catch (error) {
      console.error('Failed to fetch products:', error);
    } finally {
      setLoading(false);
    }
  }, [filters, searchQuery]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const handleFilterChange = (newFilters) => {
    setFilters(prev => ({ ...prev, ...newFilters, page: 1 }));
  };

  return (
    <main className="pt-18 md:pt-22 min-h-screen bg-[#FAF9F6]">
      <div className="max-w-[1400px] mx-auto px-6 md:px-10 py-12 md:py-16">
        <div className="mb-10">
          <p className="text-[10px] tracking-widest uppercase text-[#8A8580] mb-2">
            Home / Shop
          </p>
          <h1 className="font-serif text-4xl md:text-5xl text-[#111111] mb-3">Shop All</h1>
          <p className="text-sm text-[#8A8580] font-light">{totalProducts} products</p>
        </div>

        <div className="mb-10 pb-6 border-b border-[#E2DDD6]">
          <ProductFilter filters={filters} onChange={handleFilterChange} />
        </div>

        {loading ? (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="bg-white border border-[#E2DDD6] p-4 animate-pulse">
                <div className="aspect-square bg-[#E8E3DC] mb-4" />
                <div className="h-4 bg-[#E8E3DC] w-3/4 mb-2" />
                <div className="h-3 bg-[#E8E3DC] w-1/2" />
              </div>
            ))}
          </div>
        ) : (
          <>
            <ProductGrid products={products} onAddToCart={(result) => setToast(result.success ? 'Added to bag' : result.message)} />

            {totalPages > 1 && (
              <div className="mt-10 flex items-center justify-center gap-2">
                <button
                  onClick={() => setFilters(prev => ({ ...prev, page: prev.page - 1 }))}
                  disabled={currentPage === 1}
                  className="px-4 py-2 border border-[#E2DDD6] text-sm text-[#111111] hover:bg-[#F4F2EE] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Previous
                </button>
                <span className="px-4 text-sm text-[#111111]">Page {currentPage} of {totalPages}</span>
                <button
                  onClick={() => setFilters(prev => ({ ...prev, page: prev.page + 1 }))}
                  disabled={currentPage === totalPages}
                  className="px-4 py-2 border border-[#E2DDD6] text-sm text-[#111111] hover:bg-[#F4F2EE] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </div>
      {toast && <Toast message={toast} onClose={() => setToast(null)} />}
    </main>
  );
}
