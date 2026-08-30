import React from 'react';
import { ShoppingBag, PhoneCall, Calendar, QrCode } from 'lucide-react';

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
  onOpenTrackModal,
  onOpenAppointmentModal,
}) => {
  return (
    <div
      id="floating-mobile-nav-bar"
      className="md:hidden fixed bottom-0 left-0 right-0 z-30 bg-white/95 backdrop-blur-md border-t border-slate-200 px-2.5 py-2 shadow-lg flex items-center justify-between gap-1.5"
    >
      <a
        id="mobile-nav-phone-call"
        href="tel:01302383795"
        className="px-2.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold text-xs flex items-center gap-1 shrink-0 transition-colors"
      >
        <PhoneCall className="w-3.5 h-3.5 text-emerald-600" />
        <span className="text-[11px]">কল</span>
      </a>

      {/* Prominent Track button on Mobile Bar */}
      <button
        id="mobile-nav-track-btn"
        onClick={onOpenTrackModal}
        className="px-2.5 py-2 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-900 font-bold text-xs flex items-center gap-1 shrink-0 border border-amber-300 transition-colors cursor-pointer"
        title="বুকিং ট্র্যাকিং"
      >
        <QrCode className="w-3.5 h-3.5 text-amber-700" />
        <span className="text-[11px]">ট্র্যাক</span>
      </button>

      {onOpenAppointmentModal && (
        <button
          id="mobile-nav-appointment-btn"
          onClick={onOpenAppointmentModal}
          className="px-2.5 py-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 font-semibold text-xs flex items-center gap-1 shrink-0 border border-rose-200 transition-colors cursor-pointer"
        >
          <Calendar className="w-3.5 h-3.5 text-rose-600" />
          <span className="text-[11px]">বুকিং</span>
        </button>
      )}

      <button
        id="mobile-nav-cart-btn"
        onClick={onOpenCart}
        className="flex-1 py-2 px-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs flex items-center justify-between transition-colors cursor-pointer shadow-xs min-w-0"
      >
        <div className="flex items-center gap-1.5 truncate">
          <div className="relative shrink-0">
            <ShoppingBag className="w-3.5 h-3.5 text-slate-300" />
            {cartCount > 0 && (
              <span className="absolute -top-1.5 -right-2 bg-rose-600 text-white font-bold text-[9px] w-3.5 h-3.5 rounded-full flex items-center justify-center">
                {cartCount}
              </span>
            )}
          </div>
          <span className="text-[11px] truncate">{cartCount > 0 ? `৳${cartTotal.toLocaleString('bn-BD')}` : 'কার্ট'}</span>
        </div>
        <span className="text-[10px] text-slate-300 shrink-0">অর্ডার →</span>
      </button>
    </div>
  );
};
