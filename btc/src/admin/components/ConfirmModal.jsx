import { AlertTriangle, X } from 'lucide-react';

export function ConfirmModal({ isOpen, title, message, confirmText = 'Delete', cancelText = 'Cancel', onConfirm, onClose, isDanger = true }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
      <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-2xl border border-gray-100 relative animate-in fade-in zoom-in duration-200">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors p-1"
        >
          <X size={18} />
        </button>

        <div className="flex items-start gap-4 mb-5">
          <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${isDanger ? 'bg-red-100 text-red-600' : 'bg-amber-100 text-amber-600'}`}>
            <AlertTriangle size={20} />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
            <p className="text-sm text-gray-500 font-light mt-1 leading-relaxed">{message}</p>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 pt-3 border-t border-gray-100">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold uppercase tracking-wider text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
          >
            {cancelText}
          </button>
          <button
            onClick={() => { onConfirm(); onClose(); }}
            className={`px-5 py-2 text-xs font-semibold uppercase tracking-wider text-white rounded-lg transition-all shadow-xs ${isDanger ? 'bg-red-600 hover:bg-red-700' : 'bg-gray-900 hover:bg-black'}`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
