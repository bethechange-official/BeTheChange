import { Link, useNavigate } from 'react-router-dom';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { User, UserPlus, ArrowRight, ShieldCheck, Lock } from 'lucide-react';

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
        <div className="w-14 h-14 rounded-full bg-[#FAF9F6] border border-[#E2DDD6] flex items-center justify-center mx-auto mb-5 text-[#111111] shadow-2xs">
          <Lock size={22} strokeWidth={1.5} />
        </div>

        <p className="text-[10px] tracking-[0.3em] uppercase text-[#8A8580] font-medium mb-1">
          CHECKOUT AUTHENTICATION
        </p>
        <h3 className="font-serif text-2xl md:text-3xl text-[#111111] mb-3">
          Sign In to Proceed
        </h3>
        <p className="text-xs text-[#666666] font-light leading-relaxed mb-8 max-w-sm mx-auto">
          Please sign in to your account or create a new account to save your order details and track delivery.
        </p>

        <div className="space-y-3">
          <Link
            to="/login?redirect=/checkout"
            onClick={onClose}
            className="w-full flex items-center justify-center gap-2 bg-[#111111] text-white hover:bg-[#2A2A2A] py-4 text-[11px] tracking-[0.25em] font-semibold uppercase transition-all shadow-sm"
          >
            <User size={14} />
            <span>SIGN IN TO CONTINUE</span>
          </Link>

          <Link
            to="/register?redirect=/checkout"
            onClick={onClose}
            className="w-full flex items-center justify-center gap-2 border border-[#111111] text-[#111111] hover:bg-[#FAF9F6] py-3.5 text-[11px] tracking-[0.25em] font-semibold uppercase transition-all"
          >
            <UserPlus size={14} />
            <span>CREATE NEW ACCOUNT</span>
          </Link>
        </div>

        <div className="mt-6 pt-5 border-t border-[#F3EFE8]">
          <button
            onClick={handleGuestCheckout}
            className="text-xs text-[#8A8580] hover:text-[#111111] font-light underline transition-colors"
          >
            Continue as Guest Checkout &rarr;
          </button>
        </div>
      </div>
    </Modal>
  );
}
