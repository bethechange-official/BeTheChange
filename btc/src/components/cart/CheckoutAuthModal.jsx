import { Link, useNavigate } from 'react-router-dom';
import { Modal } from '../ui/Modal';
import { User, UserPlus, Lock } from 'lucide-react';

export function CheckoutAuthModal({ isOpen, onClose }) {
  const navigate = useNavigate();

  if (!isOpen) return null;

  const handleGuestCheckout = () => {
    onClose();
    navigate('/checkout');
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className="text-center pt-2">
        <div className="w-14 h-14 rounded-full bg-[#F8F5F0] border border-[#E4DDD2] flex items-center justify-center mx-auto mb-5 text-[#1F1A16] shadow-2xs">
          <Lock size={22} strokeWidth={1.5} />
        </div>

        <p className="text-[10px] tracking-[0.3em] uppercase text-[#8C8178] font-medium mb-1">
          CHECKOUT AUTHENTICATION
        </p>
        <h3 className="font-serif text-2xl md:text-3xl text-[#1F1A16] mb-3">
          Sign In to Proceed
        </h3>
        <p className="text-xs text-[#666666] font-light leading-relaxed mb-8 max-w-sm mx-auto">
          Sign in or create an account to save your order history and contact details.
        </p>

        <div className="space-y-3">
          <Link
            to="/login?redirect=/checkout"
            onClick={onClose}
            className="w-full flex items-center justify-center gap-2 bg-[#1F1A16] text-white hover:bg-[#3A322B] py-4 text-[11px] tracking-[0.25em] font-semibold uppercase transition-all shadow-sm"
          >
            <User size={14} />
            <span>SIGN IN TO CONTINUE</span>
          </Link>

          <Link
            to="/register?redirect=/checkout"
            onClick={onClose}
            className="w-full flex items-center justify-center gap-2 border border-[#1F1A16] text-[#1F1A16] hover:bg-[#F8F5F0] py-3.5 text-[11px] tracking-[0.25em] font-semibold uppercase transition-all"
          >
            <UserPlus size={14} />
            <span>CREATE NEW ACCOUNT</span>
          </Link>
        </div>

        <div className="mt-6 pt-5 border-t border-[#EFE9E0]">
          <button
            onClick={handleGuestCheckout}
            className="text-xs text-[#8C8178] hover:text-[#1F1A16] font-light underline transition-colors"
          >
            Continue as Guest Checkout &rarr;
          </button>
        </div>
      </div>
    </Modal>
  );
}
