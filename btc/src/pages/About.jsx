import { Link } from 'react-router-dom';
import { ArrowRight, Sparkles, Feather, ShieldCheck, Heart, Leaf, Sun, Droplets } from 'lucide-react';
import { motion } from 'framer-motion';
import { Button } from '../components/ui/Button';

export default function About() {
  const values = [
    {
      icon: Leaf,
      title: 'Botanical Integrity',
      desc: 'We select pure plant oils, natural extracts, and essential botanicals that honor your skin and nature.'
    },
    {
      icon: Feather,
      title: 'Artisan Craftsmanship',
      desc: 'Our soaps and skincare are formulated in small, controlled batches to preserve potency and fresh quality.'
    },
    {
      icon: Droplets,
      title: 'Conscious Simplicity',
      desc: 'Free from unnecessary fillers or harsh additives. Every ingredient serves a clear, gentle purpose.'
    },
    {
      icon: ShieldCheck,
      title: 'Honest Standards',
      desc: 'Transparency in everything we make — from ingredient sourcing to sustainable packaging practices.'
    }
  ];

  return (
    <main className="pt-18 md:pt-22 bg-[#FAF9F6] text-[#111111] overflow-hidden">
      {/* 1. HERO SECTION */}
      <section className="relative py-20 md:py-32 bg-[#FAF9F6] border-b border-[#E8E3DC]">
        <div className="max-w-[1400px] mx-auto px-6 md:px-10">
          <div className="grid lg:grid-cols-12 gap-12 lg:gap-16 items-center">
            
            <div className="lg:col-span-7">
              <p className="text-[11px] tracking-[0.35em] uppercase text-[#8A8580] font-medium mb-4">
                OUR STORY & PHILOSOPHY
              </p>
              <h1 className="font-serif text-4xl md:text-6xl lg:text-7xl text-[#111111] leading-[1.08] font-normal mb-8">
                Thoughtful Care,<br />
                <em className="not-italic text-[#4A4540]">Rooted in Simplicity.</em>
              </h1>
              <p className="text-base md:text-lg text-[#444444] font-light leading-relaxed mb-6 max-w-2xl">
                Be The Change was born from a desire to redefine daily self-care and home rituals. We believe that true well-being comes from intentional, honest products crafted with natural ingredients.
              </p>
              <p className="text-sm text-[#666666] font-light leading-relaxed mb-10 max-w-xl">
                From artisan cold-process soaps to gentle household liquids, every creation is formulated in small batches with uncompromised quality and quiet elegance.
              </p>

              <div className="flex flex-wrap items-center gap-5">
                <Button as={Link} to="/shop" size="lg" className="bg-[#111111] text-white hover:bg-[#2A2A2A] px-9 py-4 tracking-widest text-[11px] font-semibold">
                  EXPLORE OUR COLLECTION
                </Button>
                <Link to="/contact" className="inline-flex items-center gap-2 text-xs tracking-[0.2em] uppercase font-semibold text-[#111111] hover:text-[#5C554E] transition-colors py-3 px-2">
                  GET IN TOUCH <ArrowRight size={14} />
                </Link>
              </div>
            </div>

            <div className="lg:col-span-5 relative">
              <div className="aspect-[4/5] bg-[#EFECE6] border border-[#E2DDD6] overflow-hidden shadow-lg relative">
                <img
                  src="https://images.unsplash.com/photo-1556228578-8c89e6adf883?w=1200&q=85"
                  alt="Be The Change Brand Story"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
                <div className="absolute bottom-6 left-6 right-6 p-6 bg-white/90 backdrop-blur-md border border-white/50 text-[#111111]">
                  <p className="font-serif text-lg leading-snug">"Simple ingredients, elevated rituals."</p>
                  <p className="text-[10px] tracking-[0.2em] uppercase text-[#8A8580] font-medium mt-2">Crafted in Small Batches</p>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* 2. CORE VALUES SECTION */}
      <section className="py-24 md:py-32 bg-white border-b border-[#E8E3DC]">
        <div className="max-w-[1400px] mx-auto px-6 md:px-10">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <p className="text-[10px] tracking-[0.3em] uppercase text-[#8A8580] font-medium mb-3">WHAT GUIDES US</p>
            <h2 className="font-serif text-3xl md:text-5xl text-[#111111]">Our Core Values</h2>
            <p className="text-xs md:text-sm text-[#666666] font-light mt-3 leading-relaxed">
              Every formula we create is guided by four fundamental commitments to quality, health, and nature.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((item, i) => {
              const IconComp = item.icon;
              return (
                <div key={item.title} className="bg-[#FAF9F6] border border-[#E8E3DC] p-8 flex flex-col items-start transition-all hover:shadow-sm">
                  <div className="w-12 h-12 rounded-full bg-white border border-[#E2DDD6] flex items-center justify-center text-[#111111] mb-6 shadow-2xs">
                    <IconComp size={20} strokeWidth={1.5} />
                  </div>
                  <h3 className="font-serif text-xl text-[#111111] mb-3">{item.title}</h3>
                  <p className="text-xs text-[#555555] font-light leading-relaxed">{item.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 3. CRAFTSMANSHIP BANNER */}
      <section className="py-24 md:py-32 bg-[#111111] text-white relative overflow-hidden">
        <div className="absolute inset-0 z-0 opacity-20">
          <img
            src="https://images.unsplash.com/photo-1607006344380-b6775a0824a7?w=1600&q=80"
            alt="Craftsmanship"
            className="w-full h-full object-cover"
          />
        </div>
        <div className="relative z-10 max-w-[1200px] mx-auto px-6 md:px-10 text-center">
          <p className="text-[10px] tracking-[0.35em] uppercase text-white/50 mb-4 font-light">ARTISAN CARE</p>
          <h2 className="font-serif text-3xl md:text-5xl lg:text-6xl text-white mb-8 leading-tight font-normal">
            Made with intention.<br />Designed for your daily life.
          </h2>
          <p className="text-sm md:text-base text-white/80 font-light max-w-2xl mx-auto leading-relaxed mb-10">
            We take pride in formulating products that respect your home and skin barrier. Experience the difference of mindful craftsmanship.
          </p>
          <Button as={Link} to="/shop" variant="white" size="lg" className="px-10 py-4 tracking-widest text-[11px] font-semibold text-[#111111]">
            DISCOVER PRODUCTS
          </Button>
        </div>
      </section>
    </main>
  );
}
