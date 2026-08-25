import { ProductCard } from './ProductCard';

export function ProductGrid({ products, onAddToCart, cols = 4 }) {
  const colClass = {
    2: 'grid-cols-2',
    3: 'grid-cols-2 md:grid-cols-3',
    4: 'grid-cols-2 md:grid-cols-3 lg:grid-cols-4',
  }[cols] || 'grid-cols-2 md:grid-cols-3 lg:grid-cols-4';

  if (!products.length) {
    return (
      <div className="py-24 text-center">
        <p className="font-serif text-2xl text-[#8A8580]">No products found.</p>
        <p className="text-sm text-[#8A8580] mt-2">Try adjusting your filters.</p>
      </div>
    );
  }

  return (
    <div className={`grid ${colClass} gap-x-8 gap-y-14 md:gap-x-10 md:gap-y-16`}>
      {products.map(p => (
        <ProductCard key={p.id} product={p} onAddToCart={onAddToCart} />
      ))}
    </div>
  );
}
