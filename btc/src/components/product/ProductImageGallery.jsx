import { useState } from 'react';
import { ChevronLeft, ChevronRight, ZoomIn } from 'lucide-react';

export function ProductImageGallery({ images = [], name = 'Product' }) {
  const [active, setActive] = useState(0);
  const [isZoomed, setIsZoomed] = useState(false);
  const [mousePos, setMousePos] = useState({ x: 50, y: 50 });

  const validImages = Array.isArray(images) ? images.filter(Boolean) : [];
  const currentImage = validImages[Math.min(active, validImages.length - 1)] || validImages[0];

  // No photo uploaded yet: show a neutral panel rather than a stock photo of some other product.
  if (validImages.length === 0) {
    return (
      <div className="aspect-[4/5] sm:aspect-square bg-[#F4F2EE] border border-[#EBE7E0] rounded-xs flex flex-col items-center justify-center text-center p-6">
        <p className="font-serif text-2xl text-[#111111]">{name}</p>
        <p className="text-[10px] tracking-[0.2em] uppercase text-[#8A8580] mt-2">Image coming soon</p>
      </div>
    );
  }

  const handleMouseMove = (e) => {
    const { left, top, width, height } = e.currentTarget.getBoundingClientRect();
    const x = Math.max(0, Math.min(100, ((e.clientX - left) / width) * 100));
    const y = Math.max(0, Math.min(100, ((e.clientY - top) / height) * 100));
    setMousePos({ x, y });
  };

  return (
    <div className="flex flex-col gap-4 select-none">
      {/* Main Image Viewport */}
      <div
        className="relative overflow-hidden bg-[#F4F2EE] border border-[#EBE7E0] aspect-[4/5] sm:aspect-square rounded-xs cursor-crosshair group shadow-2xs"
        onMouseEnter={() => setIsZoomed(true)}
        onMouseLeave={() => setIsZoomed(false)}
        onMouseMove={handleMouseMove}
      >
        <img
          src={currentImage}
          alt={name}
          className={`w-full h-full object-cover transition-transform duration-300 ease-out ${
            isZoomed ? 'scale-140' : 'scale-100'
          }`}
          style={isZoomed ? { transformOrigin: `${mousePos.x}% ${mousePos.y}%` } : undefined}
        />

        {/* Zoom Hint Indicator */}
        <div className="absolute bottom-3 right-3 bg-white/80 backdrop-blur-xs text-[#111111] p-2 rounded-full shadow-xs opacity-60 group-hover:opacity-100 transition-opacity pointer-events-none">
          <ZoomIn size={14} />
        </div>

        {/* Carousel Navigation Arrows */}
        {validImages.length > 1 && (
          <>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setActive((prev) => (prev - 1 + validImages.length) % validImages.length);
              }}
              className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/90 backdrop-blur-xs text-[#111111] flex items-center justify-center shadow-xs hover:bg-white transition-all opacity-0 group-hover:opacity-100"
              aria-label="Previous image"
            >
              <ChevronLeft size={18} />
            </button>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setActive((prev) => (prev + 1) % validImages.length);
              }}
              className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/90 backdrop-blur-xs text-[#111111] flex items-center justify-center shadow-xs hover:bg-white transition-all opacity-0 group-hover:opacity-100"
              aria-label="Next image"
            >
              <ChevronRight size={18} />
            </button>
          </>
        )}
      </div>

      {/* Thumbnails Row */}
      {validImages.length > 1 && (
        <div className="flex gap-2.5 overflow-x-auto pb-1 scrollbar-none">
          {validImages.map((img, i) => (
            <button
              key={i}
              type="button"
              onClick={() => setActive(i)}
              className={`relative flex-shrink-0 w-16 h-16 sm:w-20 sm:h-20 bg-[#F4F2EE] border-2 rounded-xs overflow-hidden transition-all ${
                active === i
                  ? 'border-[#111111] shadow-xs scale-102'
                  : 'border-transparent opacity-65 hover:opacity-100'
              }`}
            >
              <img src={img} alt={`${name} view ${i + 1}`} className="w-full h-full object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
