import { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { ProductGrid } from '../components/product/ProductGrid';
import { ProductFilter } from '../components/filters/ProductFilter';
import { Toast } from '../components/ui/Toast';
import { productService } from '../services/productService';
import { collectionService } from '../services/collectionService';

export default function Shop() {
  const [searchParams] = useSearchParams();
  const searchQuery = searchParams.get('q') || '';
  const collectionSlug = searchParams.get('collection') || '';
  const [collectionInfo, setCollectionInfo] = useState(null);
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
        collection: collectionSlug || undefined,
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
  }, [filters, searchQuery, collectionSlug]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  useEffect(() => {
    if (!collectionSlug) return setCollectionInfo(null);
    collectionService.getCollection(collectionSlug)
      .then(res => setCollectionInfo(res.success ? res.data : null))
      .catch(() => setCollectionInfo(null));
  }, [collectionSlug]);

  const handleFilterChange = (newFilters) => {
    setFilters(prev => ({ ...prev, ...newFilters, page: 1 }));
  };

  return (
    <main className="min-h-screen bg-[#F8F5F0]">
      <header className="border-b border-[#E4DDD2] bg-[#EFE9E0]">
        <div className="max-w-[1480px] mx-auto px-5 md:px-10 pt-14 pb-12 md:pt-20 md:pb-16 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <p className="flex items-center gap-3 text-[10px] tracking-[0.32em] uppercase text-[#A2785A] font-medium mb-5">
              <span className="h-px w-8 bg-[#A2785A]/60" />
              {searchQuery ? 'Search' : collectionSlug ? 'Collection' : 'The collection'}
            </p>
            <h1 className="font-serif font-light text-5xl md:text-7xl leading-none tracking-[-0.015em] text-[#1F1A16]">
              {searchQuery ? <>Results for <em>“{searchQuery}”</em></> : collectionSlug ? (collectionInfo?.name || '…') : <>Shop <em>all</em></>}
            </h1>
          </div>
          <p className="text-sm text-[#8C8178] font-light md:pb-2">{totalProducts} {totalProducts === 1 ? 'product' : 'products'}</p>
        </div>
      </header>

      <div className="max-w-[1480px] mx-auto px-5 md:px-10 py-10 md:py-14">
        <div className="mb-10 pb-6 border-b border-[#E4DDD2]">
          <ProductFilter filters={filters} onChange={handleFilterChange} />
        </div>

        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-4 gap-y-12 sm:gap-x-8 md:gap-x-10">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="aspect-[4/5] bg-[#EFE9E0]" />
                <div className="h-2.5 bg-[#EFE9E0] w-1/3 mt-5" />
                <div className="h-4 bg-[#EFE9E0] w-3/4 mt-3" />
                <div className="h-3 bg-[#EFE9E0] w-1/4 mt-4" />
              </div>
            ))}
          </div>
        ) : (
          <>
            <ProductGrid products={products} onAddToCart={(result) => setToast(result.success ? 'Added to bag' : result.message)} />

            {totalPages > 1 && (
              <div className="mt-20 flex items-center justify-center gap-3">
                <button
                  onClick={() => setFilters(prev => ({ ...prev, page: prev.page - 1 }))}
                  disabled={currentPage === 1}
                  className="px-6 py-3 border border-[#1F1A16]/20 text-[11px] tracking-[0.2em] uppercase text-[#1F1A16] hover:border-[#1F1A16] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Previous
                </button>
                <span className="px-4 font-serif italic text-lg text-[#1F1A16]">Page {currentPage} of {totalPages}</span>
                <button
                  onClick={() => setFilters(prev => ({ ...prev, page: prev.page + 1 }))}
                  disabled={currentPage === totalPages}
                  className="px-6 py-3 border border-[#1F1A16]/20 text-[11px] tracking-[0.2em] uppercase text-[#1F1A16] hover:border-[#1F1A16] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
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
