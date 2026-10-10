import { useCallback, useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, ArrowRight } from 'lucide-react';

const AUTOPLAY_MS = 5000;

// Internal paths use the router; anything else opens in a new tab.
function SlideLink({ href, className, children, label }) {
  if (!href) return <div className={className}>{children}</div>;
  if (href.startsWith('/')) return <Link to={href} className={className} aria-label={label}>{children}</Link>;
  return <a href={href} target="_blank" rel="noopener noreferrer" className={className} aria-label={label}>{children}</a>;
}

// Two banners side by side from the large breakpoint up, one on smaller screens.
function useSlidesPerView() {
  const query = '(min-width: 1024px)';
  const [wide, setWide] = useState(() => typeof window !== 'undefined' && window.matchMedia(query).matches);
  useEffect(() => {
    const mql = window.matchMedia(query);
    const onChange = () => setWide(mql.matches);
    mql.addEventListener('change', onChange);
    return () => mql.removeEventListener('change', onChange);
  }, []);
  return wide ? 2 : 1;
}

/**
 * Homepage ad-banner slider. Slides come from Admin → Home Page Sliders.
 * Every banner keeps a fixed 2:1 frame so text designed into the image is never cropped differently.
 */
export function HeroSlider({ slides }) {
  const count = slides.length;
  const perViewWanted = useSlidesPerView();
  const perView = Math.min(perViewWanted, count || 1);
  const positions = Math.max(1, count - perView + 1);

  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const touchX = useRef(null);

  const go = useCallback((next) => setIndex(((next % positions) + positions) % positions), [positions]);

  useEffect(() => {
    if (index >= positions) setIndex(0);
  }, [positions, index]);

  useEffect(() => {
    if (positions < 2 || paused) return;
    if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return;
    const timer = setTimeout(() => go(index + 1), AUTOPLAY_MS);
    return () => clearTimeout(timer);
  }, [index, paused, positions, go]);

  if (!count) return null;

  const onTouchStart = (e) => { touchX.current = e.touches[0].clientX; setPaused(true); };
  const onTouchEnd = (e) => {
    if (touchX.current !== null) {
      const dx = e.changedTouches[0].clientX - touchX.current;
      if (Math.abs(dx) > 40) go(index + (dx < 0 ? 1 : -1));
    }
    touchX.current = null;
    setPaused(false);
  };

  // A single banner on a wide screen is shown at half width, centred, rather than stretched.
  const single = count === 1 && perViewWanted === 2;

  return (
    <section
      aria-roledescription="carousel"
      aria-label="Offers"
      className="max-w-[1920px] mx-auto px-4 sm:px-8 lg:px-16 pb-12 sm:pb-16"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocusCapture={() => setPaused(true)}
      onBlurCapture={() => setPaused(false)}
      onKeyDown={(e) => {
        if (e.key === 'ArrowLeft') go(index - 1);
        if (e.key === 'ArrowRight') go(index + 1);
      }}
    >
      <div className={`relative ${single ? 'max-w-[calc(50%+0.5rem)] mx-auto' : ''}`}>
        <div className="overflow-hidden -mx-2 lg:-mx-3" onTouchStart={onTouchStart} onTouchEnd={onTouchEnd}>
          <div
            className="flex transition-transform duration-700 ease-[cubic-bezier(.22,1,.36,1)]"
            style={{ transform: `translateX(-${(index * 100) / perView}%)` }}
          >
            {slides.map((slide, i) => {
              const visible = i >= index && i < index + perView;
              const hasText = slide.title || slide.subtitle || slide.ctaLabel;
              return (
                <div
                  key={slide.id}
                  role="group"
                  aria-roledescription="slide"
                  aria-label={`${i + 1} of ${count}`}
                  aria-hidden={!visible}
                  className="shrink-0 px-2 lg:px-3"
                  style={{ width: `${100 / perView}%` }}
                >
                  <SlideLink
                    href={slide.linkUrl}
                    label={slide.title || `Offer ${i + 1}`}
                    className="group/slide relative block aspect-[2/1] overflow-hidden rounded-2xl bg-[#EFE9E0]"
                  >
                    <img
                      src={slide.imageUrl}
                      alt={slide.title || ''}
                      loading={i < 2 ? 'eager' : 'lazy'}
                      tabIndex={-1}
                      className="w-full h-full object-cover transition-transform duration-[1.2s] ease-out group-hover/slide:scale-[1.02]"
                    />
                    {hasText && (
                      <>
                        <div className="absolute inset-0 bg-gradient-to-r from-[#1F1A16]/70 via-[#1F1A16]/25 to-transparent" />
                        <div className="absolute inset-y-0 left-0 flex flex-col justify-center px-5 sm:px-9 max-w-[75%] text-[#F8F5F0]">
                          {slide.title && (
                            <h2 className="font-serif font-light text-xl sm:text-3xl xl:text-4xl leading-[1.05] tracking-[-0.01em]">{slide.title}</h2>
                          )}
                          {slide.subtitle && (
                            <p className="hidden sm:block text-xs xl:text-sm font-light text-[#F8F5F0]/80 mt-2 leading-relaxed">{slide.subtitle}</p>
                          )}
                          {slide.ctaLabel && (
                            <span className="inline-flex items-center gap-2 self-start mt-3 sm:mt-5 bg-white text-[#1F1A16] px-4 py-2 sm:px-5 sm:py-2.5 text-[9px] sm:text-[10px] tracking-[0.22em] uppercase font-medium rounded-full">
                              {slide.ctaLabel} <ArrowRight size={12} strokeWidth={1.5} />
                            </span>
                          )}
                        </div>
                      </>
                    )}
                  </SlideLink>
                </div>
              );
            })}
          </div>
        </div>

        {positions > 1 && (
          <>
            <button
              type="button"
              onClick={() => go(index - 1)}
              aria-label="Previous banners"
              className="hidden sm:flex absolute -left-6 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white text-[#1F1A16] items-center justify-center shadow-[0_6px_20px_-6px_rgba(31,26,22,0.35)] hover:bg-[#1F1A16] hover:text-[#F8F5F0] transition-colors z-10"
            >
              <ArrowLeft size={18} strokeWidth={1.6} />
            </button>
            <button
              type="button"
              onClick={() => go(index + 1)}
              aria-label="Next banners"
              className="hidden sm:flex absolute -right-6 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white text-[#1F1A16] items-center justify-center shadow-[0_6px_20px_-6px_rgba(31,26,22,0.35)] hover:bg-[#1F1A16] hover:text-[#F8F5F0] transition-colors z-10"
            >
              <ArrowRight size={18} strokeWidth={1.6} />
            </button>
          </>
        )}
      </div>

      {positions > 1 && (
        <div className="flex justify-center items-center gap-2 mt-4 sm:mt-6">
          {Array.from({ length: positions }, (_, i) => (
            <button
              key={i}
              type="button"
              onClick={() => go(i)}
              aria-label={`Go to banner ${i + 1}`}
              aria-current={i === index}
              className="p-1"
            >
              <span className={`block h-1.5 rounded-full transition-all duration-500 ${i === index ? 'w-7 bg-[#1F1A16]' : 'w-1.5 bg-[#C9BFB3] hover:bg-[#8C8178]'}`} />
            </button>
          ))}
        </div>
      )}
    </section>
  );
}
