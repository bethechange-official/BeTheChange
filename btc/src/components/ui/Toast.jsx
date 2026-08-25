import { useEffect } from 'react';
import { X } from 'lucide-react';

export function Toast({ message, type = 'success', onClose }) {
  useEffect(() => {
    const t = setTimeout(onClose, 3000);
    return () => clearTimeout(t);
  }, [onClose]);

  return (
    <div className={`fixed bottom-6 right-6 z-[200] flex items-center gap-3 px-5 py-4 shadow-lg text-sm font-sans
      ${type === 'success' ? 'bg-[#111111] text-white' : 'bg-red-50 text-red-700 border border-red-200'}`}>
      <span>{message}</span>
      <button onClick={onClose} className="opacity-60 hover:opacity-100 transition-opacity">
        <X size={14} />
      </button>
    </div>
  );
}
