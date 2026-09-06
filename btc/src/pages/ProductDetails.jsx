import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Heart, Star, ShieldCheck, Truck, Sparkles, Check, ArrowRight, Leaf, Clock, RefreshCw, ShoppingBag } from 'lucide-react';
import { ProductImageGallery } from '../components/product/ProductImageGallery';
import { Accordion } from '../components/product/Accordion';
import { QuantitySelector } from '../components/ui/QuantitySelector';
import { Button } from '../components/ui/Button';
import { ProductGrid } from '../components/product/ProductGrid';
import { Toast } from '../components/ui/Toast';
import { useCart } from '../context/CartContext';
import { productService } from '../services/productService';

export default function ProductDetails() {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [related, setRelated] = useState([]);
  const [loading, setLoading] = useState(true);
  const [qty, setQty] = useState(1);
  const [toast, setToast] = useState(null);
  const [wishlisted, setWishlisted] = useState(false);
  const [adding, setAdding] = useState(false);
  const { addToCart } = useCart();

  useEffect(() => {
    const fetchProduct = async () => {
      setLoading(true);
      try {
        const response = await productService.getProductBySlug(id);
        if (response.success && response.data?.product) {
          const prod = response.data.product;
          setProduct(prod);
          const relatedResponse = await productService.getProducts({
            category: prod.category,
            limit: 4,
          });
          if (relatedResponse.success && relatedResponse.data?.products) {
            setRelated(
              relatedResponse.data.products.filter(
                (p) => p.id !== prod.id && p.slug !== prod.slug
              )
            );
          }
        } else {
          setProduct(null);
        }
      } catch (error) {
        console.error('Failed to fetch product:', error);
        setProduct(null);
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [id]);

  const discount = product?.originalPrice && Number(product.originalPrice) > Number(product.price)
    ? Math.round(((Number(product.originalPrice) - Number(product.price)) / Number(product.originalPrice)) * 100)
    : 0;

  const handleAddToCart = async () => {
    if (!product || product.stock <= 0) return;
    setAdding(true);
    try {
      const result = await addToCart(product, qty);
      if (result.success) {
        setToast(`Added ${qty} × ${product.name} to your bag`);
      } else {
        setToast(result.message || 'Failed to add to cart');
      }
    } catch {
      setToast('Unable to update bag. Please try again.');
    } finally {
      setAdding(false);
    }
  };

  const parseList = (val) => {
    if (Array.isArray(val)) return val;
    if (typeof val === 'string' && val.trim()) {
      return val.split(',').map((s) => s.trim()).filter(Boolean);
    }
    return [];
  };

  if (loading) {
    return (
      <main className="pt-24 min-h-screen bg-[#FAF9F6] flex flex-col items-center justify-center">
        <div className="w-10 h-10 border-2 border-[#111111] border-t-transparent rounded-full animate-spin mb-4" />
        <p className="font-serif text-sm tracking-widest uppercase text-[#8A8580] animate-pulse">
          Crafting Product Experience…
        </p>
      </main>
    );
  }

  if (!product) {
    return (
      <main className="pt-28 pb-20 min-h-screen bg-[#FAF9F6] flex items-center justify-center px-6">
        <div className="text-center max-w-md bg-white border border-[#E2DDD6] p-10 shadow-xs">
          <div className="w-12 h-12 rounded-full bg-[#F4F2EE] text-[#111111] flex items-center justify-center mx-auto mb-4">
            <Sparkles size={20} />
          </div>
          <h1 className="font-serif text-2xl md:text-3xl text-[#111111] mb-2 font-normal">
            Product Not Found
          </h1>
          <p className="text-xs text-[#8A8580] leading-relaxed mb-6 font-light">
            The botanical ritual you are looking for might have been archived or moved.
          </p>
          <Link
            to="/shop"
            className="inline-flex items-center justify-center px-6 py-3 bg-[#111111] hover:bg-[#2A2A2A] text-white text-[11px] tracking-[0.2em] uppercase font-semibold transition-all"
          >
            Explore Catalog
          </Link>
        </div>
      </main>
    );
  }

  const ingredientsList = parseList(product.ingredients);
  const benefitsList = parseList(product.benefits);

  return (
    <main className="pt-20 md:pt-24 pb-20 bg-[#FAF9F6] min-h-screen text-[#111111]">
      <div className="max-w-[1360px] mx-auto px-5 sm:px-8 md:px-12">
        {/* Editorial Breadcrumbs */}
        <nav className="text-[10px] tracking-[0.25em] uppercase text-[#8A8580] mb-8 font-medium flex items-center gap-2 flex-wrap">
          <Link to="/" className="hover:text-[#111111] transition-colors">Home</Link>
          <span>/</span>
          <Link to="/shop" className="hover:text-[#111111] transition-colors">Shop</Link>
          <span>/</span>
          {product.category && (
            <>
              <Link
                to={`/category/${product.category.toLowerCase().replace(/\s+/g, '-')}`}
                className="hover:text-[#111111] transition-colors"
              >
                {product.category}
              </Link>
              <span>/</span>
            </>
          )}
          <span className="text-[#111111] font-semibold truncate max-w-[240px] sm:max-w-none">{product.name}</span>
        </nav>

        {/* Product Hero Section */}
        <div className="grid lg:grid-cols-12 gap-10 md:gap-14 lg:gap-16 items-start">
          
          {/* LEFT: Image Gallery & Brand Promises (Col 7) */}
          <div className="lg:col-span-7 space-y-8">
            <ProductImageGallery images={product.images} name={product.name} />

            {/* Botanical Trust Pillars */}
            <div className="grid grid-cols-3 gap-3 pt-4 border-t border-[#EAE6DE]">
              <div className="bg-white/80 border border-[#E8E4DC] p-3 text-center rounded-xs shadow-2xs">
                <Leaf size={16} className="mx-auto mb-1.5 text-[#5C554E]" />
                <p className="text-[10px] tracking-wider uppercase font-semibold text-[#111111]">100% Plant-Based</p>
                <p className="text-[9px] text-[#8A8580] mt-0.5 font-light">Zero harmful sulfates or parabens</p>
              </div>
              <div className="bg-white/80 border border-[#E8E4DC] p-3 text-center rounded-xs shadow-2xs">
                <Truck size={16} className="mx-auto mb-1.5 text-[#5C554E]" />
                <p className="text-[10px] tracking-wider uppercase font-semibold text-[#111111]">Cash on Delivery</p>
                <p className="text-[9px] text-[#8A8580] mt-0.5 font-light">Pay conveniently at your doorstep</p>
              </div>
              <div className="bg-white/80 border border-[#E8E4DC] p-3 text-center rounded-xs shadow-2xs">
                <ShieldCheck size={16} className="mx-auto mb-1.5 text-[#5C554E]" />
                <p className="text-[10px] tracking-wider uppercase font-semibold text-[#111111]">Small Batch Purity</p>
                <p className="text-[9px] text-[#8A8580] mt-0.5 font-light">Crafted for maximum potency</p>
              </div>
            </div>
          </div>

          {/* RIGHT: Product Details & Action Panel (Col 5) */}
          <div className="lg:col-span-5 flex flex-col lg:sticky lg:top-24 space-y-6">
            
            {/* Header / Titles */}
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-[10px] tracking-[0.25em] uppercase font-semibold text-[#8A8580]">
                  {product.category || 'Apothecary Ritual'}
                </span>
                {product.collection && (
                  <>
                    <span className="text-[#8A8580]">•</span>
                    <span className="text-[10px] tracking-[0.25em] uppercase font-semibold text-[#8A8580]">
                      {product.collection}
                    </span>
                  </>
                )}
              </div>

              <h1 className="font-serif text-3xl sm:text-4xl text-[#111111] font-normal leading-snug mb-3">
                {product.name}
              </h1>

              {/* Rating + Social Proof */}
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} size={13} fill="#111111" className="text-[#111111]" />
                  ))}
                </div>
                <span className="text-xs text-[#5C554E] font-medium">
                  4.9 <span className="text-[#8A8580] font-light">(84 ritual reviews)</span>
                </span>
              </div>
            </div>

            {/* Price & Savings */}
            <div className="p-4 bg-white border border-[#E8E4DC] rounded-xs shadow-2xs">
              <div className="flex items-baseline gap-3 mb-1">
                <span className="font-serif text-3xl font-normal text-[#111111]">
                  ₹{Number(product.price).toLocaleString()}
                </span>
                {product.originalPrice && Number(product.originalPrice) > Number(product.price) && (
                  <>
                    <span className="text-sm text-[#8A8580] line-through font-light">
                      ₹{Number(product.originalPrice).toLocaleString()}
                    </span>
                    <span className="text-[9px] tracking-wider uppercase font-bold bg-[#111111] text-white px-2 py-0.5 rounded-2xs">
                      {discount}% OFF
                    </span>
                  </>
                )}
              </div>
              <p className="text-[11px] text-[#8A8580] font-light flex items-center gap-1.5">
                <Check size={13} className="text-emerald-700" />
                <span>Inclusive of all taxes • <strong>Cash on Delivery (COD) Available</strong></span>
              </p>
            </div>

            {/* Short Description */}
            {product.shortDescription ? (
              <p className="text-xs sm:text-sm text-[#5C554E] font-light leading-relaxed">
                {product.shortDescription}
              </p>
            ) : product.description ? (
              <p className="text-xs sm:text-sm text-[#5C554E] font-light leading-relaxed line-clamp-3">
                {product.description}
              </p>
            ) : null}

            {/* Quick Specs Grid */}
            <div className="grid grid-cols-2 gap-3 text-xs">
              {product.size && (
                <div className="bg-white p-3 border border-[#E8E4DC]">
                  <p className="text-[10px] tracking-wider uppercase text-[#8A8580] mb-0.5">Net Volume / Size</p>
                  <p className="text-[#111111] font-semibold">{product.size}</p>
                </div>
              )}
              <div className="bg-white p-3 border border-[#E8E4DC]">
                <p className="text-[10px] tracking-wider uppercase text-[#8A8580] mb-0.5">Focus Concern</p>
                <p className="text-[#111111] font-semibold">{product.skinConcern || 'Everyday Radiance'}</p>
              </div>
            </div>

            {/* Quantity Selector & Add to Bag CTA */}
            <div className="space-y-3 pt-2">
              <div className="flex items-center gap-3">
                <QuantitySelector
                  qty={qty}
                  onIncrease={() => setQty((q) => Math.min(q + 1, product.stock || 10))}
                  onDecrease={() => setQty((q) => Math.max(q - 1, 1))}
                  max={product.stock || 10}
                />

                <Button
                  onClick={handleAddToCart}
                  disabled={product.stock <= 0 || adding}
                  className="flex-1 py-4 bg-[#111111] hover:bg-[#2A2A2A] text-white text-[11px] tracking-[0.2em] font-semibold flex items-center justify-center gap-2"
                >
                  <ShoppingBag size={15} />
                  <span>{product.stock <= 0 ? 'OUT OF STOCK' : adding ? 'ADDING…' : 'ADD TO BAG'}</span>
                </Button>

                <button
                  type="button"
                  onClick={() => {
                    setWishlisted((w) => !w);
                    setToast(wishlisted ? 'Removed from wishlist' : 'Saved to wishlist');
                  }}
                  className="w-12 h-12 border border-[#E8E4DC] bg-white flex items-center justify-center hover:border-[#111111] transition-colors shadow-2xs"
                  aria-label="Wishlist"
                >
                  <Heart size={18} fill={wishlisted ? '#111111' : 'none'} className="text-[#111111]" />
                </button>
              </div>

              {/* Stock Warning Notice */}
              {product.stock > 0 && product.stock <= 8 && (
                <p className="text-[11px] text-amber-700 font-medium flex items-center gap-1.5">
                  <Clock size={13} />
                  <span>Only {product.stock} units remaining in this harvest batch.</span>
                </p>
              )}
            </div>

            {/* Accordions with Rich Content */}
            <div className="pt-4 border-t border-[#EAE6DE]">
              {product.description && (
                <Accordion title="Formula & Philosophy">
                  <div className="text-xs sm:text-sm text-[#5C554E] font-light leading-relaxed whitespace-pre-line py-1">
                    {product.description}
                  </div>
                </Accordion>
              )}

              {ingredientsList.length > 0 ? (
                <Accordion title="Active Botanicals & Ingredients">
                  <div className="py-2">
                    <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {ingredientsList.map((ing, idx) => (
                        <li key={idx} className="flex items-center gap-2 text-xs text-[#5C554E]">
                          <span className="w-1.5 h-1.5 rounded-full bg-[#8A8580]" />
                          <span>{ing}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </Accordion>
              ) : product.ingredients ? (
                <Accordion title="Active Botanicals & Ingredients">
                  <p className="text-xs sm:text-sm text-[#5C554E] font-light leading-relaxed py-1">
                    {product.ingredients}
                  </p>
                </Accordion>
              ) : null}

              {benefitsList.length > 0 ? (
                <Accordion title="Key Ritual Benefits">
                  <div className="py-2">
                    <ul className="space-y-2">
                      {benefitsList.map((ben, idx) => (
                        <li key={idx} className="flex items-start gap-2.5 text-xs text-[#5C554E]">
                          <Check size={14} className="text-emerald-800 flex-shrink-0 mt-0.5" />
                          <span>{ben}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </Accordion>
              ) : product.benefits ? (
                <Accordion title="Key Ritual Benefits">
                  <p className="text-xs sm:text-sm text-[#5C554E] font-light leading-relaxed py-1">
                    {product.benefits}
                  </p>
                </Accordion>
              ) : null}

              {(product.usageInstructions || product.usage) && (
                <Accordion title="Application Ritual (How to Use)">
                  <p className="text-xs sm:text-sm text-[#5C554E] font-light leading-relaxed py-1">
                    {product.usageInstructions || product.usage}
                  </p>
                </Accordion>
              )}

              <Accordion title="Shipping & COD Fulfillment">
                <div className="text-xs text-[#5C554E] font-light space-y-2 py-1 leading-relaxed">
                  <p>• <strong>Payment</strong>: Cash on Delivery (COD) only. Pay cash when your parcel arrives.</p>
                  <p>• <strong>Dispatch</strong>: Hand-packed and dispatched within 24 to 48 hours.</p>
                  <p>• <strong>Free Shipping</strong>: Complimentary delivery on orders above ₹999 across all pin codes.</p>
                </div>
              </Accordion>
            </div>
          </div>
        </div>

        {/* Related Products Section */}
        {related.length > 0 && (
          <div className="mt-24 pt-16 border-t border-[#EAE6DE]">
            <div className="flex items-center justify-between mb-8">
              <div>
                <p className="text-[10px] tracking-[0.3em] uppercase text-[#8A8580] font-semibold mb-1">
                  CURATED RECOMMENDATIONS
                </p>
                <h2 className="font-serif text-2xl sm:text-3xl text-[#111111] font-normal">
                  Complete Your Daily Ritual
                </h2>
              </div>
              <Link
                to="/shop"
                className="text-[11px] tracking-widest uppercase font-semibold text-[#111111] hover:underline flex items-center gap-1.5"
              >
                View All <ArrowRight size={13} />
              </Link>
            </div>

            <ProductGrid
              products={related}
              onAddToCart={(result) => setToast(result.success ? 'Added to bag' : result.message)}
            />
          </div>
        )}
      </div>

      {/* Floating Notification Toast */}
      {toast && <Toast message={toast} onClose={() => setToast(null)} />}
    </main>
  );
}

