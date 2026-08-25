import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Heart } from 'lucide-react';
import { useCart } from '../../context/CartContext';

export function ProductCard({ product, onAddToCart }) {
  const [wishlisted, setWishlisted] = useState(false);
  const [hovered, setHovered] = useState(false);
  const { dispatch } = useCart();

  const handleAdd = (e) => {
    e.preventDefault();
    dispatch({ type: 'ADD', product });
    onAddToCart?.();
  };

  const discount = product.originalPrice
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0;

  const subtext = product.skinConcerns && product.skinConcerns.length > 0
    ? `For ${product.skinConcerns[0]}`
    : product.benefits?.[0] || product.category;

  return (
    <div
      className="group relative flex flex-col h-full bg-white border border-[#EBE7E0] p-2 sm:p-3 transition-all duration-300 hover:shadow-md rounded-xs"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* IMAGE CONTAINER */}
      <Link to={`/product/${product.id}`} className="block overflow-hidden relative bg-[#F4F2EE] aspect-[3/4] mb-2.5">
        <img
          src={hovered && product.images[1] ? product.images[1] : product.images[0]}
          alt={product.name}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
        />
        
        {/* BADGE (Top Left) */}
        {product.featured ? (
          <span className="absolute top-2 left-2 bg-[#111111] text-white text-[8px] sm:text-[9px] font-semibold tracking-widest uppercase px-2 py-0.5 shadow-2xs">
            BESTSELLER
          </span>
        ) : discount > 0 ? (
          <span className="absolute top-2 left-2 bg-[#111111] text-white text-[8px] sm:text-[9px] font-semibold tracking-widest uppercase px-2 py-0.5 shadow-2xs">
            -{discount}%
          </span>
        ) : null}

        {/* WISHLIST BUTTON (Top Right - always visible) */}
        <button
          onClick={(e) => { e.preventDefault(); setWishlisted(w => !w); }}
          className="absolute top-2 right-2 w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center bg-white/90 backdrop-blur-sm shadow-2xs transition-all duration-300 hover:bg-white text-[#111111]"
          aria-label="Wishlist"
        >
          <Heart size={13} fill={wishlisted ? '#111111' : 'none'} />
        </button>
      </Link>

      {/* DETAILS */}
      <div className="flex flex-col flex-1">
        {/* Title */}
        <Link to={`/product/${product.id}`} className="block mb-0.5">
          <h3 className="font-serif text-xs sm:text-base text-[#111111] font-semibold leading-snug line-clamp-2 hover:text-[#5C554E] transition-colors">
            {product.name}
          </h3>
        </Link>

        {/* Subtitle / Key benefit */}
        <p className="text-[10px] sm:text-[11px] text-[#8A8580] font-light line-clamp-1 mb-2">
          {subtext}
        </p>

        {/* Price & Size Badge */}
        <div className="flex items-center justify-between mt-auto mb-2.5 pt-1">
          <div className="flex items-baseline gap-1.5">
            <span className="text-xs sm:text-base font-bold text-[#111111]">₹{product.price.toLocaleString()}</span>
            {product.originalPrice && (
              <span className="text-[10px] sm:text-xs text-[#8A8580] line-through font-light">₹{product.originalPrice.toLocaleString()}</span>
            )}
          </div>
          {product.size && (
            <span className="text-[8px] sm:text-[9px] text-[#5C554E] bg-[#F4F2EE] px-1.5 py-0.5 rounded font-medium">
              {product.size}
            </span>
          )}
        </div>

        {/* SOLID BLACK ADD TO CART BUTTON (Always visible at bottom of card) */}
        <button
          onClick={handleAdd}
          className="w-full bg-[#111111] text-white text-[9px] sm:text-[11px] tracking-[0.16em] uppercase font-semibold py-2.5 sm:py-3 flex items-center justify-center gap-1 hover:bg-[#2A2A2A] active:scale-[0.99] transition-all shadow-2xs"
        >
          ADD TO CART
        </button>
      </div>
    </div>
  );
}

