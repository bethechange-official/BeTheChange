import { useState } from 'react';
import { ChevronDown } from 'lucide-react';

export function Accordion({ title, children }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-b border-[#E4DDD2]">
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between py-4 text-left"
      >
        <span className="text-[11px] tracking-widest uppercase font-medium text-[#1F1A16]">{title}</span>
        <ChevronDown size={14} className={`text-[#8C8178] transition-transform duration-300 ${open ? 'rotate-180' : ''}`} />
      </button>
      <div className={`overflow-hidden transition-all duration-300 ${open ? 'max-h-96 pb-4' : 'max-h-0'}`}>
        <div className="text-sm text-[#8C8178] leading-relaxed font-light">{children}</div>
      </div>
    </div>
  );
}
