import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

// Homepage category tile. Name, description and image all come from Admin → Categories;
// without an image (or if it fails to load) it falls back to a typographic panel.
export function CategoryCard({ category }) {
  const [imgFailed, setImgFailed] = useState(false);
  const hasImage = Boolean(category.imageUrl) && !imgFailed;
  const count = category.productsCount;

  return (
    <Link
      to={`/category/${category.slug || category.id}`}
      className={`group relative block aspect-[4/5] overflow-hidden ${hasImage ? 'bg-[#1F1A16]' : 'bg-[#EFE9E0]'}`}
    >
      {hasImage ? (
        <>
          <img
            src={category.imageUrl}
            alt={category.name}
            loading="lazy"
            onError={() => setImgFailed(true)}
            className="absolute inset-0 w-full h-full object-cover transition-transform duration-[1.4s] ease-out group-hover:scale-[1.05]"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#1F1A16]/85 via-[#1F1A16]/20 to-transparent" />
        </>
      ) : (
        <span
          aria-hidden
          className="absolute -right-4 -top-10 font-serif italic font-light text-[13rem] sm:text-[16rem] leading-none text-[#E4DCCF] select-none transition-transform duration-700 group-hover:-translate-y-2"
        >
          {category.name.charAt(0)}
        </span>
      )}

      <div className={`absolute inset-x-0 bottom-0 p-4 sm:p-6 ${hasImage ? 'text-[#F8F5F0]' : 'text-[#1F1A16]'}`}>
        {count > 0 && (
          <p className={`text-[9px] sm:text-[10px] tracking-[0.24em] uppercase mb-2 ${hasImage ? 'text-[#F8F5F0]/70' : 'text-[#A2785A]'}`}>
            {count} {count === 1 ? 'product' : 'products'}
          </p>
        )}
        <h3 className="font-serif font-light text-2xl sm:text-[2rem] leading-[1.05]">{category.name}</h3>
        {category.description && (
          <p className={`hidden sm:block text-xs font-light leading-relaxed mt-2 line-clamp-2 ${hasImage ? 'text-[#F8F5F0]/75' : 'text-[#8C8178]'}`}>
            {category.description}
          </p>
        )}
        <span className={`inline-flex items-center gap-2 mt-3 sm:mt-4 text-[10px] tracking-[0.24em] uppercase font-medium border-b pb-1 transition-colors ${hasImage ? 'border-[#F8F5F0]/40 group-hover:border-[#F8F5F0]' : 'border-[#1F1A16]/30 group-hover:border-[#1F1A16]'}`}>
          Shop now <ArrowRight size={12} strokeWidth={1.5} className="group-hover:translate-x-1 transition-transform" />
        </span>
      </div>
    </Link>
  );
}
