import { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export function ProductImageGallery({ images, name }) {
  const [active, setActive] = useState(0);

  return (
    <div className="flex flex-col gap-4">
      <div className="relative overflow-hidden bg-[#F3EFE8] aspect-square">
        <img
          src={images[active]}
          alt={name}
          className="w-full h-full object-cover transition-opacity duration-500"
        />
        {images.length > 1 && (
          <>
            <button
              onClick={() => setActive(a => (a - 1 + images.length) % images.length)}
              className="absolute left-3 top-1/2 -translate-y-1/2 w-8 h-8 bg-white/80 flex items-center justify-center hover:bg-white transition-colors"
            >
              <ChevronLeft size={16} />
            </button>
            <button
              onClick={() => setActive(a => (a + 1) % images.length)}
              className="absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 bg-white/80 flex items-center justify-center hover:bg-white transition-colors"
            >
              <ChevronRight size={16} />
            </button>
          </>
        )}
      </div>
      {images.length > 1 && (
        <div className="flex gap-2">
          {images.map((img, i) => (
            <button
              key={i}
              onClick={() => setActive(i)}
              className={`w-16 h-16 overflow-hidden border-2 transition-colors ${active === i ? 'border-[#111111]' : 'border-transparent'}`}
            >
              <img src={img} alt="" className="w-full h-full object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
