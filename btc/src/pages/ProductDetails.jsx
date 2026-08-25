import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Heart, Star } from 'lucide-react';
import { ProductImageGallery } from '../components/product/ProductImageGallery';
import { Accordion } from '../components/product/Accordion';
import { QuantitySelector } from '../components/ui/QuantitySelector';
import { Button } from '../components/ui/Button';
import { ProductGrid } from '../components/product/ProductGrid';
import { Toast } from '../components/ui/Toast';
import { useCart } from '../context/CartContext';
import { products } from '../data/products';

export default function ProductDetails() {
  const { id } = useParams();
  const product = products.find(p => p.id === Number(id));
  const [qty, setQty] = useState(1);
  const [toast, setToast] = useState(null);
  const [wishlisted, setWishlisted] = useState(false);
  const { dispatch } = useCart();

  if (!product) {
    return (
      <main className="pt-24 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="font-serif text-3xl text-[#8A8580]">Product not found.</p>
          <Link to="/shop" className="text-sm text-[#111111] underline mt-4 block">Back to Shop</Link>
        </div>
      </main>
    );
  }

  const related = products.filter(p => p.category === product.category && p.id !== product.id).slice(0, 4);
  const discount = product.originalPrice
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0;

  const handleAddToCart = () => {
    for (let i = 0; i < qty; i++) dispatch({ type: 'ADD', product });
    setToast(`${product.name} added to bag`);
  };

  return (
    <main className="pt-18 md:pt-22 bg-[#FAF9F6] min-h-screen">
      <div className="max-w-[1400px] mx-auto px-6 md:px-10 py-10 md:py-16">
        {/* Breadcrumb */}
        <p className="text-[10px] tracking-widest uppercase text-[#8A8580] mb-8">
          <Link to="/" className="hover:text-[#111111]">Home</Link> /{' '}
          <Link to="/shop" className="hover:text-[#111111]">Shop</Link> /{' '}
          <Link to={`/category/${product.category.toLowerCase()}`} className="hover:text-[#111111]">{product.category}</Link> /{' '}
          {product.name}
        </p>

        <div className="grid md:grid-cols-2 gap-10 md:gap-16 lg:gap-24">
          {/* Gallery */}
          <ProductImageGallery images={product.images} name={product.name} />

          {/* Info */}
          <div className="flex flex-col">
            <p className="text-[10px] tracking-widest uppercase text-[#8A8580] mb-2">{product.category}</p>
            <h1 className="font-serif text-3xl md:text-4xl text-[#111111] mb-3">{product.name}</h1>

            {/* Rating */}
            <div className="flex items-center gap-2 mb-4">
              <div className="flex">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} size={12} fill={i < Math.floor(product.rating) ? '#111111' : 'none'} className="text-[#111111]" />
                ))}
              </div>
              <span className="text-xs text-[#8A8580]">{product.rating} ({product.reviews} reviews)</span>
            </div>

            {/* Price */}
            <div className="flex items-center gap-3 mb-6">
              <span className="font-serif text-2xl text-[#111111]">₹{product.price.toLocaleString()}</span>
              {product.originalPrice && (
                <>
                  <span className="text-sm text-[#8A8580] line-through">₹{product.originalPrice.toLocaleString()}</span>
                  <span className="text-[10px] tracking-widest uppercase bg-[#111111] text-white px-2 py-0.5">{discount}% off</span>
                </>
              )}
            </div>

            <p className="text-sm text-[#8A8580] leading-relaxed font-light mb-6">{product.description}</p>

            {/* Meta */}
            <div className="grid grid-cols-2 gap-3 mb-6 text-xs">
              <div className="bg-white p-3 border border-[#E2DDD6]">
                <p className="text-[#8A8580] mb-1">Size</p>
                <p className="text-[#111111] font-medium">{product.size}</p>
              </div>
              <div className="bg-white p-3 border border-[#E2DDD6]">
                <p className="text-[#8A8580] mb-1">Skin Type</p>
                <p className="text-[#111111] font-medium">{product.skinType.slice(0, 2).join(', ')}</p>
              </div>
            </div>

            {/* Qty + Add */}
            <div className="flex items-center gap-4 mb-4">
              <QuantitySelector
                qty={qty}
                onIncrease={() => setQty(q => Math.min(q + 1, product.stock))}
                onDecrease={() => setQty(q => Math.max(q - 1, 1))}
                max={product.stock}
              />
              <Button onClick={handleAddToCart} className="flex-1">Add to Bag</Button>
              <button
                onClick={() => setWishlisted(w => !w)}
                className="w-11 h-11 border border-[#E2DDD6] flex items-center justify-center hover:border-[#111111] transition-colors"
              >
                <Heart size={16} fill={wishlisted ? '#111111' : 'none'} className="text-[#111111]" />
              </button>
            </div>

            {product.stock < 10 && (
              <p className="text-xs text-amber-600 mb-4">Only {product.stock} left in stock.</p>
            )}

            {/* Accordions */}
            <div className="mt-4 border-t border-[#E2DDD6]">
              <Accordion title="Ingredients">
                <ul className="space-y-1">
                  {product.ingredients.map(ing => <li key={ing}>• {ing}</li>)}
                </ul>
              </Accordion>
              <Accordion title="Benefits">
                <ul className="space-y-1">
                  {product.benefits.map(b => <li key={b}>• {b}</li>)}
                </ul>
              </Accordion>
              <Accordion title="How to Use">
                <p>{product.usage}</p>
              </Accordion>
              <Accordion title="Product Details">
                <div className="space-y-1">
                  <p>Size: {product.size}</p>
                  <p>Suitable for: {product.skinType.join(', ')}</p>
                  <p>Skin concerns: {product.skinConcerns.join(', ')}</p>
                </div>
              </Accordion>
            </div>
          </div>
        </div>

        {/* Related Products */}
        {related.length > 0 && (
          <div className="mt-20 md:mt-28">
            <h2 className="font-serif text-3xl text-[#111111] mb-10">You May Also Like</h2>
            <ProductGrid products={related} onAddToCart={() => setToast('Added to bag')} />
          </div>
        )}
      </div>

      {toast && <Toast message={toast} onClose={() => setToast(null)} />}
    </main>
  );
}
