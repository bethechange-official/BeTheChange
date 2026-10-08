import { Minus, Plus } from 'lucide-react';

export function QuantitySelector({ qty, onIncrease, onDecrease, min = 1, max = 99 }) {
  return (
    <div className="flex items-center border border-[#E4DDD2]">
      <button
        onClick={onDecrease}
        disabled={qty <= min}
        className="w-9 h-9 flex items-center justify-center text-[#1F1A16] hover:bg-[#EFE9E0] disabled:opacity-30 transition-colors"
      >
        <Minus size={12} />
      </button>
      <span className="w-10 text-center text-sm font-medium text-[#1F1A16]">{qty}</span>
      <button
        onClick={onIncrease}
        disabled={qty >= max}
        className="w-9 h-9 flex items-center justify-center text-[#1F1A16] hover:bg-[#EFE9E0] disabled:opacity-30 transition-colors"
      >
        <Plus size={12} />
      </button>
    </div>
  );
}
