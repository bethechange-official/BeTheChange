import { Link } from 'react-router-dom';
import { ArrowRight, Sparkles, Droplets, Feather, ShieldCheck, Star, CheckCircle, Gift } from 'lucide-react';
import { motion } from 'framer-motion';
import { Button } from '../components/ui/Button';
import { SectionHeading } from '../components/ui/SectionHeading';
import { ProductCard } from '../components/product/ProductCard';
import { Toast } from '../components/ui/Toast';
import { useState } from 'react';
import { products } from '../data/products';
import { categories } from '../data/categories';

const fadeUp = {
  hidden: { opacity: 0, y: 25 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] } }
};

const stagger = { visible: { transition: { staggerChildren: 0.12 } } };

export default function Home() {
  const [toast, setToast] = useState(null);

  // Filter products for homepage sections
  const bestsellers = products.filter(p => p.featured).slice(0, 4);
  const newLaunches = products.slice(6, 10);

  const reviews = [
    {
      id: 1,
      rating: 5,
      title: "Visible difference in 2 weeks!",
      text: "The Pigmentation Serum completely transformed my skin tone. Spots have visibly faded and my skin feels deeply hydrated.",
      name: "Ananya Sharma",
      verified: true,
      product: "Pigmentation Serum"
    },
    {
      id: 2,
      rating: 5,
      title: "Best natural cold process soap!",
      text: "The Carrot Puree soap is so nourishing! No dryness after washing and it smells wonderful.",
      name: "Rohan Mehta",
      verified: true,
      product: "Carrot Puree Soap"
    },
    {
      id: 3,
      rating: 5,
      title: "Mild & effective sunscreen",
      text: "SPF 50 doesn't leave any white cast at all! Fits perfectly under makeup.",
      name: "Priya V.",
      verified: true,
      product: "Sunscreen SPF 50"
    }
  ];

  const trustPillars = [
    {
      icon: Feather,
      title: '100% Fragrance Free',
      desc: 'Formulated without synthetic scents or essential oil irritants.'
    },
    {
      icon: ShieldCheck,
      title: 'Dermatologically Tested',
      desc: 'Rigorously tested for safety and gentle skin compatibility.'
    },
    {
      icon: Droplets,
      title: 'Proven Actives',
      desc: 'Powered by clinically proven, high-purity botanical actives.'
    },
    {
      icon: Sparkles,
      title: 'Ethical & Cruelty Free',
      desc: 'Never tested on animals and packaged in sustainable materials.'
    }
  ];

  return (
    <main className="bg-[#FAF9F6] text-[#111111] overflow-hidden">
      
      {/* 1. HERO SECTION */}
      <section className="relative min-h-[85vh] md:min-h-screen flex items-center bg-[#FAF9F6] overflow-hidden pt-20 md:pt-24 pb-16">
        <div className="absolute inset-0 z-0">
          <img
            src="https://images.unsplash.com/photo-1556228578-8c89e6adf883?w=1800&q=85"
            alt="Hero background"
            className="w-full h-full object-cover opacity-40 object-center"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#FAF9F6] via-[#FAF9F6]/90 to-transparent md:w-3/4" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#FAF9F6] via-transparent to-transparent h-32 bottom-0" />
        </div>

        <div className="relative z-10 max-w-[1400px] mx-auto px-5 md:px-10 w-full">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={stagger}
            className="max-w-2xl"
          >
            <motion.p variants={fadeUp} className="text-[10px] sm:text-[11px] tracking-[0.3em] uppercase text-[#5C554E] font-medium mb-4 sm:mb-6">
              BE THE CHANGE — EVERYDAY RITUALS
            </motion.p>
            <motion.h1 variants={fadeUp} className="font-serif text-4xl sm:text-6xl lg:text-8xl text-[#111111] leading-[1.06] mb-6 sm:mb-8 font-normal tracking-tight">
              Thoughtful Care,<br />
              <em className="not-italic text-[#4A4540]">Everyday Rituals.</em>
            </motion.h1>
            <motion.p variants={fadeUp} className="text-sm sm:text-lg text-[#333333] leading-relaxed mb-8 sm:mb-10 max-w-lg font-sans font-light">
              Elevated essentials inspired by nature, crafted with simplicity, and designed to enrich your daily routine.
            </motion.p>
            <motion.div variants={fadeUp} className="flex flex-wrap items-center gap-4">
              <Button as={Link} to="/shop" size="lg" className="bg-[#111111] text-white hover:bg-[#2A2A2A] px-7 py-3.5 sm:px-9 sm:py-4 tracking-widest text-[10px] sm:text-[11px] font-semibold shadow-xs">
                SHOP COLLECTION
              </Button>
              <Link to="/#categories" className="inline-flex items-center gap-2 text-[10px] sm:text-xs tracking-[0.2em] uppercase font-semibold text-[#111111] hover:text-[#5C554E] transition-colors py-3 px-2">
                EXPLORE RITUALS <ArrowRight size={14} />
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* 2. OUR BEST SELLERS SECTION */}
      <section className="py-12 sm:py-20 bg-white border-t border-[#E8E3DC]">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-8 md:px-10">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 sm:mb-12 gap-4">
            <SectionHeading label="MOST POPULAR" title="Our Best Sellers" subtitle="Formulated for visible, lasting skin results." />
            <Link to="/shop" className="hidden sm:flex text-[11px] tracking-[0.25em] uppercase font-semibold text-[#111111] hover:text-[#5C554E] items-center gap-2 hover:gap-3 transition-all">
              VIEW ALL BESTSELLERS <ArrowRight size={14} />
            </Link>
          </div>
          
          {/* 2-column mobile grid / 4-column desktop grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
            {bestsellers.map(p => (
              <ProductCard key={p.id} product={p} onAddToCart={() => setToast(`${p.name} added to bag`)} />
            ))}
          </div>

          <div className="mt-8 text-center sm:hidden">
            <Link
              to="/shop"
              className="inline-flex items-center justify-center w-full border border-[#111111] text-[#111111] py-3 text-[10px] tracking-[0.2em] uppercase font-semibold hover:bg-[#111111] hover:text-white transition-all"
            >
              VIEW ALL BESTSELLERS &rarr;
            </Link>
          </div>
        </div>
      </section>

      {/* 3. BUILD YOUR OWN BUNDLE SECTION */}
      <section className="py-12 sm:py-20 bg-[#FAF9F6] border-t border-[#E8E3DC]">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-8 md:px-10">
          <div className="bg-white border border-[#E2DDD6] p-6 sm:p-12 text-center max-w-4xl mx-auto shadow-xs">
            <span className="text-[9px] sm:text-[10px] tracking-[0.3em] uppercase text-[#8A8580] font-semibold mb-2 block">CUSTOM ROUTINES</span>
            <h2 className="font-serif text-3xl sm:text-5xl text-[#111111] mb-4">Build Your Own Bundle!</h2>
            <p className="text-xs sm:text-base text-[#666666] max-w-xl mx-auto mb-6 font-light leading-relaxed">
              Curate your personalized 3-step skincare ritual and enjoy 20% savings on the complete set.
            </p>
            
            <div className="my-6 max-w-lg mx-auto overflow-hidden bg-[#F4F2EE] aspect-[16/9] border border-[#EBE7E0]">
              <img
                src="https://images.unsplash.com/photo-1608248543803-ba4f8c70ae0b?w=1000&q=80"
                alt="Build your bundle"
                className="w-full h-full object-cover"
              />
            </div>

            <Button as={Link} to="/shop" className="bg-[#111111] text-white hover:bg-[#2A2A2A] px-8 py-3.5 text-[10px] sm:text-[11px] tracking-[0.2em] font-semibold uppercase shadow-xs">
              SHOP BUNDLES NOW
            </Button>
          </div>
        </div>
      </section>

      {/* 5. SHOP BY CATEGORY SECTION */}
      <section id="categories" className="py-12 sm:py-20 bg-[#FAF9F6] border-t border-[#E8E3DC]">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-8 md:px-10">
          <SectionHeading label="COLLECTIONS" title="Shop by Category" subtitle="Explore our curated ranges for skin, hair, body, and home." />

          {/* 2-column mobile swipe cards */}
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-3.5 sm:gap-6 mt-8">
            {categories.map((cat) => (
              <Link
                key={cat.id}
                to={`/category/${cat.id}`}
                className="group block relative overflow-hidden aspect-[3/4] bg-[#EFECE6] border border-[#E2DDD6] shadow-2xs"
              >
                <img
                  src={cat.image}
                  alt={cat.name}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-3 sm:p-5 flex flex-col justify-end">
                  <p className="text-[8px] tracking-[0.2em] uppercase text-white/70 font-light mb-0.5">Category</p>
                  <h3 className="font-serif text-sm sm:text-lg text-white mb-1 leading-tight">{cat.name}</h3>
                  <span className="text-white/90 text-[9px] tracking-[0.18em] uppercase font-medium flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                    Shop <ArrowRight size={10} />
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* 7. NEW LAUNCHES SECTION */}
      <section className="py-12 sm:py-20 bg-[#FAF9F6] border-t border-[#E8E3DC]">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-8 md:px-10">
          <SectionHeading label="JUST ARRIVED" title="New Launches" subtitle="Discover our latest botanical & minimalist formulations." />

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6 mt-8">
            {newLaunches.map(p => (
              <ProductCard key={p.id} product={p} onAddToCart={() => setToast(`${p.name} added to bag`)} />
            ))}
          </div>
        </div>
      </section>

      {/* 8. BRAND PHILOSOPHY / TRUST PILLARS */}
      <section className="py-14 sm:py-24 bg-white border-t border-[#E8E3DC]">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-8 md:px-10 text-center">
          <SectionHeading label="OUR PROMISE" title="The Skincare You Can Trust" subtitle="Crafted with clean, honest ingredients for real skin health." center />

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-8 mt-10">
            {trustPillars.map((pillar) => {
              const IconComp = pillar.icon;
              return (
                <div key={pillar.title} className="bg-[#FAF9F6] border border-[#E8E3DC] p-5 sm:p-8 flex flex-col items-center text-center">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-white border border-[#E2DDD6] flex items-center justify-center text-[#111111] mb-4 shadow-2xs">
                    <IconComp size={18} strokeWidth={1.5} />
                  </div>
                  <h4 className="font-serif text-sm sm:text-lg text-[#111111] mb-2 font-semibold">{pillar.title}</h4>
                  <p className="text-[11px] sm:text-xs text-[#666666] leading-relaxed font-light">{pillar.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 9. REVIEWS SECTION */}
      <section className="py-14 sm:py-24 bg-[#FAF9F6] border-t border-[#E8E3DC]">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-8 md:px-10">
          <SectionHeading label="TESTIMONIALS" title="What Our Customers Say" subtitle="Real feedback from people who transformed their daily rituals." center />

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-10">
            {reviews.map((rev) => (
              <div key={rev.id} className="bg-white border border-[#E2DDD6] p-6 flex flex-col justify-between shadow-2xs">
                <div>
                  <div className="flex items-center gap-1 text-[#111111] mb-3">
                    {[...Array(rev.rating)].map((_, i) => (
                      <Star key={i} size={14} fill="#111111" />
                    ))}
                  </div>
                  <h4 className="font-serif text-base text-[#111111] font-semibold mb-2">"{rev.title}"</h4>
                  <p className="text-xs text-[#555555] font-light leading-relaxed mb-4">"{rev.text}"</p>
                </div>
                <div className="pt-4 border-t border-[#F3EFE8] flex items-center justify-between text-[11px]">
                  <div>
                    <span className="font-semibold text-[#111111] block">{rev.name}</span>
                    <span className="text-[#8A8580] text-[10px]">{rev.product}</span>
                  </div>
                  <span className="inline-flex items-center gap-1 text-[9px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded font-medium">
                    <CheckCircle size={10} /> Verified
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 10. REWARD CLUB PROMO BANNER */}
      <section className="py-14 sm:py-24 bg-white border-t border-[#E8E3DC]">
        <div className="max-w-[1200px] mx-auto px-4 sm:px-8">
          <div className="bg-[#FAF9F6] border border-[#E2DDD6] p-8 sm:p-14 text-center relative overflow-hidden">
            <div className="w-14 h-14 rounded-full bg-[#111111] text-white flex items-center justify-center mx-auto mb-4">
              <Gift size={24} />
            </div>
            <h2 className="font-serif text-3xl sm:text-5xl text-[#111111] mb-3">Join The BTC Club</h2>
            <p className="text-xs sm:text-base text-[#666666] font-light max-w-lg mx-auto mb-6">
              Earn rewards on every purchase, enjoy birthday treats, and unlock early access to new releases.
            </p>
            <Button as={Link} to="/register" className="bg-[#111111] text-white px-8 py-3.5 text-[10px] sm:text-[11px] tracking-[0.2em] font-semibold uppercase">
              JOIN NOW & SAVE 10%
            </Button>
          </div>
        </div>
      </section>

      {toast && <Toast message={toast} onClose={() => setToast(null)} />}
    </main>
  );
}
