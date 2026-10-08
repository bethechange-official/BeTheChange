import { Link } from 'react-router-dom';
import { ArrowRight, ArrowUpRight, Sparkles, Droplets, Feather, ShieldCheck } from 'lucide-react';
import { motion } from 'framer-motion';
import { Button } from '../components/ui/Button';
import { SectionHeading } from '../components/ui/SectionHeading';
import { ProductCard } from '../components/product/ProductCard';
import { CategoryCard } from '../components/product/CategoryCard';
import { HeroSlider } from '../components/home/HeroSlider';
import { bannerService } from '../services/bannerService';
import { Toast } from '../components/ui/Toast';
import { useState, useEffect } from 'react';
import { collectionService } from '../services/collectionService';
import { categoryService } from '../services/categoryService';
import { sortCategories } from '../utils/categories';

const ease = [0.22, 1, 0.36, 1];

const fadeUp = {
  hidden: { opacity: 0, y: 28 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.9, ease } }
};

const stagger = { visible: { transition: { staggerChildren: 0.12 } } };

const inView = {
  initial: 'hidden',
  whileInView: 'visible',
  viewport: { once: true, margin: '-80px' },
};

const marqueeItems = ['Fragrance free', 'Plant powered', 'Small batch', 'Cruelty free', 'Dermatologically tested', 'Plastic conscious'];

const ritualSteps = [
  { n: '01', title: 'Cleanse', body: 'Gentle, low-foam cleansers and cold-process bars that lift the day away without stripping your skin.', to: '/category/skin-care-products' },
  { n: '02', title: 'Treat', body: 'Concentrated serums and botanical oils that work quietly on tone, texture and the scalp.', to: '/shop' },
  { n: '03', title: 'Nourish', body: 'Rich balms and barrier creams that seal in moisture, from lips to fingertips.', to: '/category/lip-care' },
];

const trustPillars = [
  { icon: Feather, title: 'Fragrance free', desc: 'No synthetic scents or essential-oil irritants. Just the ingredients that do the work.' },
  { icon: ShieldCheck, title: 'Dermatologically tested', desc: 'Every formula is tested for safety and gentle compatibility with sensitive skin.' },
  { icon: Droplets, title: 'Proven actives', desc: 'High-purity botanical actives, used at percentages that make a visible difference.' },
  { icon: Sparkles, title: 'Ethical & cruelty free', desc: 'Never tested on animals, packed in recyclable and refillable materials.' },
];

function ProductSkeletons({ count = 4 }) {
  return [...Array(count)].map((_, i) => (
    <div key={i} className="animate-pulse">
      <div className="aspect-[4/5] bg-[#EFE9E0]" />
      <div className="h-2.5 bg-[#EFE9E0] w-1/3 mt-5" />
      <div className="h-4 bg-[#EFE9E0] w-3/4 mt-3" />
      <div className="h-3 bg-[#EFE9E0] w-1/4 mt-4" />
    </div>
  ));
}

export default function Home() {
  const [toast, setToast] = useState(null);
  const [collections, setCollections] = useState([]);
  const [categories, setCategories] = useState([]);
  const [slides, setSlides] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [collectionsRes, categoriesRes] = await Promise.all([
          collectionService.getCollections(4),
          categoryService.getCategories()
        ]);
        if (collectionsRes.success) {
          setCollections(collectionsRes.data || []);
        }
        if (categoriesRes.success) {
          setCategories(sortCategories(categoriesRes.data.filter(c => c.slug !== 'uncategorized')));
        }
      } catch (error) {
        console.error('Failed to fetch data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();

    // Ad sliders are optional: a failure here must not affect the rest of the page.
    bannerService.getBanners()
      .then(res => { if (res.success) setSlides(res.data || []); })
      .catch(() => {});
  }, []);

  const onAdd = (p) => (result) => setToast(result.success ? `${p.name} added to bag` : result.message);
  // Hero spotlight: first product with an image from the first collection shown on the page.
  const hero = collections.flatMap(c => c.products).find(p => p.images?.[0]);
  const heroLabel = collections.find(c => c.products.includes(hero))?.name || 'Most loved';

  return (
    <main className="bg-[#F8F5F0] text-[#1F1A16] overflow-hidden">

      {/* 1. HERO */}
      <section className="relative">
        <div className="max-w-[1480px] mx-auto px-5 md:px-10 grid lg:grid-cols-12 gap-12 lg:gap-8 items-center py-12 sm:py-16 lg:py-20">
          <motion.div initial="hidden" animate="visible" variants={stagger} className="lg:col-span-7 relative z-10">
            <motion.p variants={fadeUp} className="flex items-center gap-3 text-[10px] sm:text-[11px] tracking-[0.34em] uppercase text-[#A2785A] font-medium mb-5 sm:mb-7">
              <span className="h-px w-10 bg-[#A2785A]/60" />
              Botanical skincare · Est. Hyderabad
            </motion.p>
            <motion.h1 variants={fadeUp} className="font-serif font-light text-[2.75rem] leading-[1] sm:text-6xl lg:text-[4.75rem] xl:text-[5.25rem] tracking-[-0.02em] mb-6 sm:mb-8">
              Thoughtful care,<br />
              <em className="font-light text-[#A2785A]">everyday</em> rituals.
            </motion.h1>
            <motion.p variants={fadeUp} className="text-[15px] sm:text-base text-[#5E554D] leading-relaxed mb-8 sm:mb-10 max-w-md font-light">
              Elevated essentials inspired by nature, crafted in small batches, and designed to make your daily routine feel like a ritual.
            </motion.p>
            <motion.div variants={fadeUp} className="flex flex-wrap items-center gap-x-8 gap-y-4">
              <Button as={Link} to="/shop" size="lg">
                Shop the collection <ArrowRight size={14} strokeWidth={1.5} />
              </Button>
              <Link to="/about" className="group inline-flex items-center gap-2 text-[11px] tracking-[0.24em] uppercase font-medium text-[#1F1A16] py-3">
                <span className="border-b border-[#1F1A16]/30 group-hover:border-[#1F1A16] pb-1 transition-colors">Our story</span>
              </Link>
            </motion.div>

            <motion.dl variants={fadeUp} className="grid grid-cols-3 gap-6 max-w-lg mt-10 sm:mt-14 pt-6 border-t border-[#E4DDD2]">
              {[['Free', 'Of fragrance'], ['Cruelty', 'Free, always'], ['Small', 'Batch formulas']].map(([k, v]) => (
                <div key={v}>
                  <dt className="font-serif text-2xl sm:text-3xl font-light text-[#1F1A16]">{k}</dt>
                  <dd className="text-[10px] sm:text-[11px] tracking-[0.12em] uppercase text-[#8C8178] mt-1.5 leading-snug">{v}</dd>
                </div>
              ))}
            </motion.dl>
          </motion.div>

          {/* Product stage */}
          <motion.div
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1.4, ease, delay: 0.2 }}
            className="lg:col-span-5 relative"
          >
            <div className="relative mx-auto w-full max-w-[300px] sm:max-w-[360px]">
              <div className="absolute -inset-5 sm:-inset-7 rounded-t-full bg-[#EFE9E0]" aria-hidden />
              <div className="grain relative aspect-[4/5] rounded-t-full overflow-hidden bg-[#E4DCCF]">
                {hero ? (
                  <img src={hero.images[0]} alt={hero.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <img src="/logo.png" alt="" className="w-1/2 opacity-30" />
                  </div>
                )}
              </div>

              {hero && (
                <Link
                  to={`/product/${hero.slug || hero.id}`}
                  className="group absolute -bottom-6 left-0 sm:-left-12 right-6 sm:right-auto sm:w-[290px] bg-[#F8F5F0]/95 backdrop-blur-md p-5 shadow-[0_30px_60px_-24px_rgba(31,26,22,0.35)] flex items-center gap-4"
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-[9px] tracking-[0.28em] uppercase text-[#A2785A]">{heroLabel}</p>
                    <p className="font-serif text-xl leading-tight mt-1 truncate">{hero.name}</p>
                    <p className="text-sm text-[#5E554D] mt-1">₹{hero.price.toLocaleString('en-IN')}</p>
                  </div>
                  <span className="w-11 h-11 rounded-full border border-[#1F1A16]/20 flex items-center justify-center group-hover:bg-[#1F1A16] group-hover:text-[#F8F5F0] transition-colors duration-500 shrink-0">
                    <ArrowUpRight size={16} strokeWidth={1.4} />
                  </span>
                </Link>
              )}

              <div className="hidden sm:flex absolute -top-4 -right-4 w-24 h-24 rounded-full bg-[#1F1A16] text-[#F8F5F0] items-center justify-center text-center p-4 rotate-[-8deg]">
                <span className="font-serif italic text-[13px] leading-tight">Made<br />by hand,<br />in batches</span>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* 1b. AD SLIDER — managed in Admin → Home Page Sliders; hidden when there are no live slides */}
      <HeroSlider slides={slides} />

      {/* 2. MARQUEE */}
      <section className="bg-[#1F1A16] text-[#F8F5F0] py-5 sm:py-6 overflow-hidden" aria-label="Our standards">
        <div className="flex w-max animate-marquee">
          {[0, 1].map(dup => (
            <ul key={dup} className="flex shrink-0 items-center" aria-hidden={dup === 1}>
              {[...marqueeItems, ...marqueeItems].map((item, i) => (
                <li key={i} className="flex items-center font-serif italic text-xl sm:text-2xl font-light whitespace-nowrap">
                  <span className="px-7 sm:px-10">{item}</span>
                  <span className="text-[#A2785A] text-sm not-italic">✦</span>
                </li>
              ))}
            </ul>
          ))}
        </div>
      </section>

      {/* 3. COLLECTIONS — one section per active collection with products (Admin → Categories → Collections) */}
      {loading ? (
        <section className="py-20 sm:py-28">
          <div className="max-w-[1480px] mx-auto px-5 md:px-10 grid grid-cols-2 lg:grid-cols-4 gap-x-4 gap-y-12 sm:gap-x-8 lg:gap-x-10">
            <ProductSkeletons />
          </div>
        </section>
      ) : (
        collections.map((collection, i) => (
          <section key={collection.id} className={`py-20 sm:py-24 lg:py-28 ${i % 2 === 1 ? 'bg-[#EFE9E0]' : ''}`}>
            <div className="max-w-[1480px] mx-auto px-5 md:px-10">
              <motion.div {...inView} variants={fadeUp} className="flex flex-col sm:flex-row sm:items-end justify-between mb-12 sm:mb-16 gap-6">
                <SectionHeading
                  label={`${collection.productsCount} ${collection.productsCount === 1 ? 'product' : 'products'}`}
                  title={collection.name}
                  subtitle={collection.description || undefined}
                />
                <Link to={`/shop?collection=${encodeURIComponent(collection.slug)}`} className="group inline-flex items-center gap-3 text-[11px] tracking-[0.24em] uppercase font-medium shrink-0">
                  <span className="border-b border-[#1F1A16]/30 group-hover:border-[#1F1A16] pb-1 transition-colors">View all</span>
                  <ArrowRight size={14} strokeWidth={1.5} className="group-hover:translate-x-1 transition-transform" />
                </Link>
              </motion.div>

              <div className="grid grid-cols-2 lg:grid-cols-4 gap-x-4 gap-y-12 sm:gap-x-8 lg:gap-x-10">
                {collection.products.map(p => <ProductCard key={p.id} product={p} onAddToCart={onAdd(p)} />)}
              </div>
            </div>
          </section>
        ))
      )}

      {/* 5. SHOP BY CATEGORY — cards (name, description, image) come from Admin → Categories */}
      {categories.length > 0 && (
        <section id="categories" className="py-16 sm:py-24 border-t border-[#E4DDD2]">
          <div className="max-w-[1480px] mx-auto px-5 md:px-10">
            <motion.div {...inView} variants={fadeUp} className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10 sm:mb-12">
              <SectionHeading label="Categories" title={<>Shop by <em>category</em></>} subtitle="Explore our ranges for skin, lips, hair and home." />
              <Link to="/shop" className="group inline-flex items-center gap-3 text-[11px] tracking-[0.24em] uppercase font-medium shrink-0">
                <span className="border-b border-[#1F1A16]/30 group-hover:border-[#1F1A16] pb-1 transition-colors">Shop all</span>
                <ArrowRight size={14} strokeWidth={1.5} className="group-hover:translate-x-1 transition-transform" />
              </Link>
            </motion.div>

            <motion.ul {...inView} variants={stagger} className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
              {categories.map(cat => (
                <motion.li key={cat.id} variants={fadeUp}>
                  <CategoryCard category={cat} />
                </motion.li>
              ))}
            </motion.ul>
          </div>
        </section>
      )}

      {/* 6. THE RITUAL */}
      <section className="relative bg-[#1F1A16] text-[#F8F5F0] py-24 sm:py-32 lg:py-36">
        <div className="max-w-[1480px] mx-auto px-5 md:px-10">
          <motion.div {...inView} variants={fadeUp} className="max-w-2xl mb-16 sm:mb-24">
            <SectionHeading light label="The ritual" title={<>Three steps. <em className="text-[#C9B8A3]">Nothing more.</em></>} subtitle="A routine you'll actually keep. Fewer, better products used with intention." />
          </motion.div>

          <motion.div {...inView} variants={stagger} className="grid md:grid-cols-3 border-t border-white/15">
            {ritualSteps.map(step => (
              <motion.div key={step.n} variants={fadeUp} className="group relative pt-10 pb-4 md:pr-10 md:[&:not(:first-child)]:pl-10 md:[&:not(:last-child)]:border-r border-white/15 border-b md:border-b-0 last:border-b-0 mb-10 md:mb-0">
                <span className="block font-serif text-outline text-[#C9B8A3] text-[5.5rem] sm:text-[7rem] leading-none font-light">{step.n}</span>
                <h3 className="font-serif text-3xl sm:text-4xl font-light mt-6">{step.title}</h3>
                <p className="text-sm text-white/55 font-light leading-relaxed mt-4 max-w-xs">{step.body}</p>
                <Link to={step.to} className="inline-flex items-center gap-2 mt-8 text-[10px] tracking-[0.26em] uppercase text-[#C9B8A3] hover:text-[#F8F5F0] transition-colors">
                  Explore <ArrowRight size={12} strokeWidth={1.5} className="group-hover:translate-x-1 transition-transform" />
                </Link>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* 7. PROMISE */}
      <section className="border-t border-[#E4DDD2] bg-[#F8F5F0]">
        <div className="max-w-[1480px] mx-auto px-5 md:px-10 py-20 sm:py-24">
          <motion.div {...inView} variants={fadeUp} className="text-center mb-14 sm:mb-20">
            <SectionHeading center label="Our promise" title={<>Skincare you can <em>trust</em></>} />
          </motion.div>
          <motion.div {...inView} variants={stagger} className="grid grid-cols-2 lg:grid-cols-4">
            {trustPillars.map((pillar, i) => {
              const Icon = pillar.icon;
              return (
                <motion.div
                  key={pillar.title}
                  variants={fadeUp}
                  className={`px-4 sm:px-8 py-8 lg:py-4 text-center border-[#E4DDD2] ${i % 2 === 0 ? 'border-r' : ''} ${i < 2 ? 'border-b lg:border-b-0' : ''} ${i === 1 ? 'lg:border-r' : ''}`}
                >
                  <span className="w-14 h-14 rounded-full border border-[#E4DDD2] flex items-center justify-center mx-auto text-[#A2785A] mb-6">
                    <Icon size={20} strokeWidth={1.2} />
                  </span>
                  <h4 className="font-serif text-xl sm:text-2xl font-light mb-3">{pillar.title}</h4>
                  <p className="text-xs sm:text-[13px] text-[#8C8178] leading-relaxed font-light max-w-[240px] mx-auto">{pillar.desc}</p>
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </section>

      {toast && <Toast message={toast} onClose={() => setToast(null)} />}
    </main>
  );
}
