import React from 'react';
import { ShoppingBag, PhoneCall, Calendar, ArrowRight } from 'lucide-react';

interface FloatingMobileBarProps {
  cartCount: number;
  cartTotal: number;
  onOpenCart: () => void;
  onOpenTrackModal: () => void;
  onOpenAppointmentModal?: () => void;
}

export const FloatingMobileBar: React.FC<FloatingMobileBarProps> = ({
  cartCount,
  cartTotal,
  onOpenCart,
  onOpenAppointmentModal,
}) => {
  return (
    <div
      id="floating-mobile-nav-bar"
      className="md:hidden fixed bottom-0 left-0 right-0 z-30 bg-white/95 backdrop-blur-md border-t border-rose-200 px-3 pt-2.5 pb-[max(0.75rem,env(safe-area-inset-bottom))] shadow-2xl flex items-center justify-between gap-2"
    >
      <a
        id="mobile-nav-phone-call"
        href="tel:01302383795"
        className="px-3 py-2.5 rounded-xl bg-slate-900 text-white font-bold text-xs flex items-center gap-1.5 shrink-0 hover:bg-slate-800 active:scale-95 transition-all shadow-xs"
      >
        <PhoneCall className="w-4 h-4 text-emerald-400 animate-bounce" />
        <span>কল করুন</span>
      </a>

      {onOpenAppointmentModal && (
        <button
          id="mobile-nav-appointment-btn"
          onClick={onOpenAppointmentModal}
          className="px-3 py-2.5 rounded-xl bg-rose-100 hover:bg-rose-200 text-rose-900 font-bold text-xs flex items-center gap-1.5 shrink-0 border border-rose-200 active:scale-95 transition-all cursor-pointer shadow-xs"
        >
          <Calendar className="w-4 h-4 text-rose-600" />
          <span>অনলাইন বুকিং</span>
        </button>
      )}

      <button
        id="mobile-nav-cart-btn"
        onClick={onOpenCart}
        className="flex-1 py-2.5 px-3 rounded-xl bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-700 hover:to-pink-700 active:scale-95 text-white font-bold text-xs shadow-md flex items-center justify-between transition-all cursor-pointer"
      >
        <div className="flex items-center gap-1.5">
          <div className="relative">
            <ShoppingBag className="w-4 h-4" />
            {cartCount > 0 && (
              <span className="absolute -top-1.5 -right-2 bg-amber-400 text-slate-950 font-extrabold text-[10px] w-4 h-4 rounded-full flex items-center justify-center">
                {cartCount}
              </span>
            )}
          </div>
          <span>{cartCount > 0 ? `৳${cartTotal.toLocaleString('bn-BD')}` : 'বুকিং লিস্ট'}</span>
        </div>

        <div className="flex items-center gap-1">
          <span>কনফার্ম</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </div>
      </button>
    </div>
  );
};

