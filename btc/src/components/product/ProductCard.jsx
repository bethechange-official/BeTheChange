import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Heart, Plus } from 'lucide-react';
import { useCart } from '../../context/CartContext';

export function ProductCard({ product, onAddToCart }) {
  const [wishlisted, setWishlisted] = useState(false);
  const [hovered, setHovered] = useState(false);
  const [adding, setAdding] = useState(false);
  const [imgFailed, setImgFailed] = useState(false);
  const { addToCart } = useCart();

  const soldOut = product.stock <= 0;
  const href = `/product/${product.slug || product.id}`;

  const handleAdd = async (e) => {
    e.preventDefault();
    if (soldOut || adding) return;
    setAdding(true);
    const result = await addToCart(product, 1);
    setAdding(false);
    onAddToCart?.(result);
  };

  const discount = product.originalPrice
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0;

  // benefits arrives from the API as a newline-separated string
  const firstBenefit = typeof product.benefits === 'string'
    ? product.benefits.split('\n')[0]
    : product.benefits?.[0];
  const subtext = product.shortDescription || firstBenefit || product.category;

  const badge = soldOut ? 'Sold out' : product.isFeatured || product.featured ? 'Bestseller' : discount > 0 ? `${discount}% off` : null;

  return (
    <div
      className="group relative flex flex-col h-full"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* IMAGE */}
      <Link to={href} className="block overflow-hidden relative bg-[#EFE9E0] aspect-[4/5]">
        {product.images?.[0] && !imgFailed ? (
          <img
            onError={() => setImgFailed(true)}
            src={hovered && product.images[1] ? product.images[1] : product.images[0]}
            alt={product.name}
            loading="lazy"
            className={`w-full h-full object-cover transition-transform duration-[1.2s] ease-out group-hover:scale-[1.04] ${soldOut ? 'opacity-60 grayscale-[30%]' : ''}`}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center p-6 text-center font-serif italic text-xl text-[#8C8178]">{product.name}</div>
        )}

        {badge && (
          <span className={`absolute top-3 left-3 text-[9px] font-medium tracking-[0.2em] uppercase px-2.5 py-1 ${soldOut ? 'bg-white text-[#8C8178]' : 'bg-[#F8F5F0]/90 backdrop-blur-sm text-[#1F1A16]'}`}>
            {badge}
          </span>
        )}

        <button
          onClick={(e) => { e.preventDefault(); setWishlisted(w => !w); }}
          className="absolute top-3 right-3 w-8 h-8 rounded-full flex items-center justify-center bg-[#F8F5F0]/80 backdrop-blur-sm text-[#1F1A16] transition-all duration-300 hover:bg-white sm:opacity-0 sm:group-hover:opacity-100"
          aria-label={wishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
        >
          <Heart size={13} strokeWidth={1.5} fill={wishlisted ? '#1F1A16' : 'none'} />
        </button>

        {/* Quick add: slides up on hover (desktop) */}
        {!soldOut && (
          <button
            onClick={handleAdd}
            className="hidden sm:flex absolute inset-x-3 bottom-3 items-center justify-center gap-2 bg-[#1F1A16]/95 backdrop-blur-sm text-[#F8F5F0] text-[10px] tracking-[0.24em] uppercase font-medium py-3.5 translate-y-[calc(100%+12px)] group-hover:translate-y-0 transition-transform duration-500 ease-[cubic-bezier(.22,1,.36,1)] hover:bg-[#3A322B]"
          >
            {adding ? 'Adding…' : 'Add to bag'}
          </button>
        )}
      </Link>

      {/* DETAILS */}
      <div className="flex flex-col flex-1 pt-4">
        <div className="flex items-center justify-between gap-2 mb-1.5">
          <p className="text-[9px] sm:text-[10px] tracking-[0.24em] uppercase text-[#A2785A] font-medium truncate">{product.category}</p>
          {product.size && <p className="text-[10px] text-[#8C8178] font-light shrink-0">{product.size}</p>}
        </div>

        <Link to={href} className="block">
          <h3 className="font-serif text-[17px] sm:text-xl text-[#1F1A16] leading-snug line-clamp-2 transition-colors group-hover:text-[#A2785A]">
            {product.name}
          </h3>
        </Link>

        <p className="text-[11px] sm:text-xs text-[#8C8178] font-light line-clamp-1 mt-1">{subtext}</p>

        <div className="flex items-end justify-between mt-auto pt-3">
          <div className="flex items-baseline gap-2">
            <span className="text-sm sm:text-[15px] font-medium text-[#1F1A16]">₹{product.price.toLocaleString('en-IN')}</span>
            {product.originalPrice > product.price && (
              <span className="text-[11px] sm:text-xs text-[#8C8178] line-through font-light">₹{product.originalPrice.toLocaleString('en-IN')}</span>
            )}
          </div>

          {/* Mobile add button */}
          <button
            onClick={handleAdd}
            disabled={soldOut}
            className="sm:hidden w-8 h-8 rounded-full border border-[#1F1A16] text-[#1F1A16] flex items-center justify-center disabled:opacity-30 active:bg-[#1F1A16] active:text-[#F8F5F0] transition-colors"
            aria-label={soldOut ? 'Sold out' : 'Add to bag'}
          >
            <Plus size={14} strokeWidth={1.5} />
          </button>
        </div>
      </div>
    </div>
  );
}
