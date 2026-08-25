import { ChevronDown } from 'lucide-react';

const CATEGORIES = ['All', 'Household Products', 'Glycerin Soaps', 'Cold Process Soaps', 'Skin Care Products', 'Hair Care Products'];
const CONCERNS = ['All', 'Hydration', 'Acne & Blemishes', 'Brightening', 'Sensitive Skin'];
const SORT_OPTIONS = [
  { value: 'featured', label: 'Featured' },
  { value: 'price-asc', label: 'Price: Low to High' },
  { value: 'price-desc', label: 'Price: High to Low' },
  { value: 'newest', label: 'Newest' },
];

export function ProductFilter({ filters, onChange }) {
  return (
    <div className="flex flex-wrap items-center gap-4">
      <FilterSelect
        label="Category"
        value={filters.category}
        options={CATEGORIES}
        onChange={v => onChange({ ...filters, category: v })}
      />
      <FilterSelect
        label="Skin Concern"
        value={filters.concern}
        options={CONCERNS}
        onChange={v => onChange({ ...filters, concern: v })}
      />
      <div className="ml-auto">
        <FilterSelect
          label="Sort"
          value={filters.sort}
          options={SORT_OPTIONS.map(o => o.label)}
          values={SORT_OPTIONS.map(o => o.value)}
          onChange={v => onChange({ ...filters, sort: v })}
        />
      </div>
    </div>
  );
}

function FilterSelect({ label, value, options, values, onChange }) {
  const displayValue = values
    ? options[values.indexOf(value)] || label
    : value === 'All' ? label : value;

  return (
    <div className="relative">
      <select
        value={value}
        onChange={e => onChange(e.target.value)}
        className="appearance-none bg-transparent border border-[#E2DDD6] text-[11px] tracking-widest uppercase text-[#111111] pl-4 pr-8 py-2.5 focus:outline-none focus:border-[#111111] cursor-pointer hover:border-[#111111] transition-colors"
      >
        {options.map((opt, i) => (
          <option key={opt} value={values ? values[i] : opt}>{opt}</option>
        ))}
      </select>
      <ChevronDown size={12} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#8A8580] pointer-events-none" />
    </div>
  );
}
