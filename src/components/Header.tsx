import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { 
  ShoppingBag, 
  Search, 
  PhoneCall, 
  MapPin, 
  Menu, 
  X, 
  Calendar, 
  Lock, 
  QrCode, 
  Sparkles, 
  Heart, 
  Star, 
  Scissors, 
  Grid, 
  ChevronRight, 
  Clock, 
  MessageCircle 
} from 'lucide-react';
import { Category } from '../types';
import { scrollToTarget } from '../lib/smoothScroll';

interface HeaderProps {
  cartCount: number;
  cartTotal: number;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onOpenCart: () => void;
  onOpenTrackModal: () => void;
  categories: Category[];
  selectedCategory: string;
  onSelectCategory: (id: string) => void;
  onOpenAppointmentModal?: () => void;
  onOpenAdminModal?: () => void;
  onGoHome?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  cartCount,
  cartTotal,
  searchQuery,
  onSearchChange,
  onOpenCart,
  onOpenTrackModal,
  categories,
  selectedCategory,
  onSelectCategory,
  onOpenAppointmentModal,
  onOpenAdminModal,
  onGoHome,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Prevent background scrolling when mobile menu drawer is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [mobileMenuOpen]);

  const getCategoryIcon = (id: string) => {
    switch (id) {
      case 'csa_laser':
        return <Sparkles className="w-4 h-4 text-rose-500 shrink-0" />;
      case 'facial_skin':
        return <Heart className="w-4 h-4 text-pink-500 shrink-0" />;
      case 'bridal_makeup':
        return <Star className="w-4 h-4 text-amber-500 shrink-0" />;
      case 'hair_spa':
        return <Scissors className="w-4 h-4 text-purple-500 shrink-0" />;
      case 'all':
      default:
        return <Grid className="w-4 h-4 text-slate-500 shrink-0" />;
    }
  };

  const handleBrandClick = (e: React.MouseEvent) => {
    e.preventDefault();
    setMobileMenuOpen(false);
    if (onGoHome) {
      onGoHome();
    } else {
      scrollToTarget('body', 0);
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-slate-200/80 shadow-2xs">
      {/* Top Subtle Info & Quick Access Strip */}
      <div className="bg-slate-900 text-slate-300 text-xs py-1.5 px-3 sm:px-4 overflow-hidden">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-2">
          <div className="flex items-center gap-1.5 text-xs truncate min-w-0">
            <span className="text-rose-400 font-semibold shrink-0">CSA লেজার শাখা</span>
            <span className="text-slate-600 shrink-0">•</span>
            <span className="flex items-center gap-1 text-slate-300 truncate text-[11px] sm:text-xs">
              <MapPin className="w-3 h-3 text-rose-400 shrink-0" />
              <span className="truncate">নাটিয়াপাড়া বাজার, দেলদুয়ার</span>
            </span>
          </div>

          <div className="flex items-center gap-2 sm:gap-3 text-xs shrink-0">
            <a
              href="tel:01302383795"
              className="inline-flex items-center gap-1 text-rose-200 hover:text-white transition-colors text-[11px] sm:text-xs font-semibold"
            >
              <PhoneCall className="w-3 h-3 text-emerald-400" />
              <span>01302383795</span>
            </a>

            {onOpenAdminModal && (
              <button
                id="header-admin-login-top"
                onClick={onOpenAdminModal}
                className="inline-flex items-center gap-1 text-slate-400 hover:text-white transition-colors cursor-pointer text-[11px] px-1.5 sm:px-2 py-0.5 rounded hover:bg-slate-800"
                title="এডমিন প্যানেল"
              >
                <Lock className="w-3 h-3 text-amber-400" />
                <span className="hidden sm:inline">এডমিন</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Main Navigation Bar */}
      <div className="max-w-7xl mx-auto px-2.5 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between min-h-[3.5rem] sm:h-16 py-1 sm:py-0 gap-1.5 sm:gap-4">
          
          {/* Brand Logo */}
          <div className="flex items-center gap-1.5 sm:gap-3 min-w-0">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-1.5 -ml-1 rounded-xl text-slate-700 hover:bg-slate-100 focus:outline-none shrink-0"
              aria-label="Toggle Menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>

            <a
              id="header-institution-brand"
              href="#"
              onClick={handleBrandClick}
              className="flex items-center gap-1.5 sm:gap-2 group cursor-pointer min-w-0"
              title="হোম পেজে যান"
            >
              <div className="w-7 h-7 xs:w-8 xs:h-8 sm:w-9 sm:h-9 rounded-xl bg-gradient-to-br from-rose-600 to-rose-700 flex items-center justify-center text-white font-bold text-xs sm:text-base shadow-xs group-hover:bg-rose-700 transition-colors shrink-0">
                তনু
              </div>
              <div className="min-w-0">
                <span className="text-[11px] xs:text-xs sm:text-base md:text-lg font-bold text-slate-900 block leading-tight tracking-tight">
                  <span>তনু বিউটি পার্লার</span>{' '}
                  <span className="text-rose-600 font-semibold inline whitespace-nowrap">& লেজার সেন্টার</span>
                </span>
                <span className="text-[9px] sm:text-[11px] text-slate-500 font-normal block leading-none mt-0.5 truncate">
                  দেলদুয়ার, টাঙ্গাইল
                </span>
              </div>
            </a>
          </div>

          {/* Search Bar (Desktop) */}
          <div className="hidden lg:flex flex-1 max-w-xs xl:max-w-sm mx-2">
            <div className="relative w-full">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="সার্ভিস বা পণ্য খুঁজুন..."
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                className="w-full pl-9 pr-8 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-rose-500 focus:bg-white focus:border-rose-500 transition-all text-slate-800 placeholder:text-slate-400"
              />
              {searchQuery && (
                <button
                  onClick={() => onSearchChange('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600 w-4 h-4 flex items-center justify-center cursor-pointer"
                >
                  ✕
                </button>
              )}
            </div>
          </div>

          {/* Right Action Buttons */}
          <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
            
            {/* Live Tracking Button */}
            <button
              id="header-booking-track-btn"
              onClick={onOpenTrackModal}
              className="inline-flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3.5 py-1.5 sm:py-2 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-900 font-bold text-xs border border-amber-300/80 shadow-xs transition-colors cursor-pointer"
              title="আপনার বুকিং ও অর্ডার লাইভ চেক করুন"
            >
              <QrCode className="w-3.5 h-3.5 text-amber-700" />
              <span className="hidden sm:inline">বুকিং ট্র্যাকিং</span>
              <span className="sm:hidden text-[11px]">ট্র্যাক</span>
            </button>

            {onOpenAppointmentModal && (
              <button
                id="header-online-booking-btn"
                onClick={onOpenAppointmentModal}
                className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 font-semibold text-xs border border-rose-200 transition-colors cursor-pointer"
              >
                <Calendar className="w-3.5 h-3.5 text-rose-600" />
                <span>অনলাইন বুকিং</span>
              </button>
            )}

            <button
              id="header-cart-btn"
              onClick={onOpenCart}
              className="relative inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-medium text-xs transition-colors cursor-pointer shadow-xs"
              title="বুকিং কার্ট"
            >
              <div className="relative">
                <ShoppingBag className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-slate-200" />
                {cartCount > 0 && (
                  <span className="absolute -top-1.5 -right-2 bg-rose-600 text-white text-[9px] sm:text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                    {cartCount}
                  </span>
                )}
              </div>
              <span className="hidden sm:inline-block font-semibold">
                {cartTotal > 0 ? `৳${cartTotal.toLocaleString('bn-BD')}` : 'কার্ট'}
              </span>
            </button>
          </div>

        </div>

        {/* Mobile Search Bar */}
        <div className="lg:hidden pb-2.5 pt-0.5">
          <div className="relative w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
            <input
              type="text"
              placeholder="সার্ভিস বা প্যাকেজ খুঁজুন..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="w-full pl-8 pr-7 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-rose-500 focus:bg-white text-slate-800"
            />
            {searchQuery && (
              <button
                onClick={() => onSearchChange('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600 w-4 h-4 flex items-center justify-center cursor-pointer"
              >
                ✕
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Full-Screen Enhanced Mobile Menu Drawer rendered via Portal */}
      {mobileMenuOpen && typeof document !== 'undefined' && createPortal(
        <div className="fixed inset-0 z-[99999] bg-slate-950/75 backdrop-blur-xs flex flex-col justify-end sm:justify-center items-center p-0 sm:p-4 animate-fadeIn">
          {/* Backdrop click to close */}
          <div 
            className="absolute inset-0 w-full h-full cursor-pointer -z-10" 
            onClick={() => setMobileMenuOpen(false)}
          />

          <div className="w-full max-w-lg bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl flex flex-col max-h-[88vh] overflow-hidden border-t sm:border border-slate-200 animate-slideUp">
            
            {/* Drawer Header */}
            <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/90 shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-rose-600 to-rose-700 text-white font-bold flex items-center justify-center text-sm shadow-xs">
                  তনু
                </div>
                <div>
                  <h3 className="font-bold text-sm text-slate-900 leading-tight">
                    তনু বিউটি পার্লার & লেজার সেন্টার
                  </h3>
                  <span className="text-[10px] text-slate-500 block">
                    নাটিয়াপাড়া বাজার, দেলদুয়ার, টাঙ্গাইল
                  </span>
                </div>
              </div>

              <button
                onClick={() => setMobileMenuOpen(false)}
                className="w-8 h-8 rounded-full bg-slate-200 hover:bg-slate-300 text-slate-700 flex items-center justify-center transition-colors cursor-pointer"
                aria-label="Close Menu"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Drawer Scrollable Content */}
            <div className="flex-1 p-4 overflow-y-auto space-y-4 divide-y divide-slate-100 overscroll-contain">
              
              {/* Quick Action Navigation Grid */}
              <div className="grid grid-cols-2 gap-2.5">
                {onOpenAppointmentModal && (
                  <button
                    onClick={() => {
                      onOpenAppointmentModal();
                      setMobileMenuOpen(false);
                    }}
                    className="p-3 rounded-2xl bg-rose-50 hover:bg-rose-100 border border-rose-200/80 text-left flex items-start gap-2.5 transition-all cursor-pointer group shadow-2xs"
                  >
                    <div className="w-8 h-8 rounded-xl bg-rose-600 text-white flex items-center justify-center shrink-0 shadow-xs group-hover:scale-105 transition-transform">
                      <Calendar className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="font-bold text-xs text-rose-950 block">অনলাইন বুকিং</span>
                      <span className="text-[10px] text-rose-600 font-medium">সিরিয়াল নিন</span>
                    </div>
                  </button>
                )}

                <button
                  onClick={() => {
                    onOpenTrackModal();
                    setMobileMenuOpen(false);
                  }}
                  className="p-3 rounded-2xl bg-amber-50 hover:bg-amber-100 border border-amber-200/80 text-left flex items-start gap-2.5 transition-all cursor-pointer group shadow-2xs"
                >
                  <div className="w-8 h-8 rounded-xl bg-amber-500 text-white flex items-center justify-center shrink-0 shadow-xs group-hover:scale-105 transition-transform">
                    <QrCode className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="font-bold text-xs text-amber-950 block">লাইভ ট্র্যাকিং</span>
                    <span className="text-[10px] text-amber-700 font-medium">QR কোড ও স্ট্যাটাস</span>
                  </div>
                </button>

                <button
                  onClick={() => {
                    onOpenCart();
                    setMobileMenuOpen(false);
                  }}
                  className="p-3 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white text-left flex items-start gap-2.5 transition-all cursor-pointer group shadow-2xs"
                >
                  <div className="w-8 h-8 rounded-xl bg-slate-800 text-rose-400 flex items-center justify-center shrink-0 shadow-xs group-hover:scale-105 transition-transform">
                    <ShoppingBag className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="font-bold text-xs text-white">বুকিং ব্যাগ</span>
                      {cartCount > 0 && (
                        <span className="bg-rose-600 text-white text-[9px] font-extrabold px-1.5 py-0.2 rounded-full">
                          {cartCount}
                        </span>
                      )}
                    </div>
                    <span className="text-[10px] text-slate-300">৳{cartTotal.toLocaleString('bn-BD')}</span>
                  </div>
                </button>

                <a
                  href="tel:01302383795"
                  className="p-3 rounded-2xl bg-emerald-50 hover:bg-emerald-100 border border-emerald-200/80 text-left flex items-start gap-2.5 transition-all cursor-pointer group shadow-2xs"
                >
                  <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-xs group-hover:scale-105 transition-transform">
                    <PhoneCall className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="font-bold text-xs text-emerald-950 block">সরাসরি কল</span>
                    <span className="text-[10px] text-emerald-700 font-mono font-bold">01302383795</span>
                  </div>
                </a>
              </div>

              {/* Service Categories Section */}
              <div className="space-y-2.5 pt-3">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                    সার্ভিস ক্যাটাগরি তালিকা
                  </span>
                  <span className="text-[10px] text-rose-600 font-semibold bg-rose-50 px-2 py-0.5 rounded-full border border-rose-100">
                    {categories.length} টি বিভাগ
                  </span>
                </div>

                <div className="space-y-1.5">
                  {categories.map((cat) => {
                    const isSelected = selectedCategory === cat.id;
                    return (
                      <button
                        key={cat.id}
                        onClick={() => {
                          onSelectCategory(cat.id);
                          setMobileMenuOpen(false);
                        }}
                        className={`w-full px-3.5 py-2.5 rounded-xl text-xs font-semibold flex items-center justify-between transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-rose-50 text-rose-700 border border-rose-200 shadow-2xs'
                            : 'bg-slate-50/90 hover:bg-slate-100 text-slate-700 border border-slate-100'
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${
                            isSelected ? 'bg-rose-100 text-rose-700' : 'bg-white text-slate-600 shadow-2xs'
                          }`}>
                            {getCategoryIcon(cat.id)}
                          </div>
                          <span>{cat.nameBn}</span>
                        </div>
                        
                        <div className="flex items-center gap-1.5">
                          <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                            isSelected ? 'bg-rose-200/80 text-rose-800' : 'bg-slate-200/80 text-slate-600'
                          }`}>
                            {cat.count} টি
                          </span>
                          <ChevronRight className={`w-3.5 h-3.5 ${isSelected ? 'text-rose-500' : 'text-slate-300'}`} />
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Clinic Info Highlights */}
              <div className="pt-3 space-y-2">
                <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200 space-y-2 text-xs">
                  <div className="flex items-center gap-2 text-slate-700">
                    <Sparkles className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                    <span className="text-[11px] font-bold text-slate-800">জার্মান CSA লেজার প্রযুক্তি ও স্কিন কেয়ার</span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-600">
                    <Clock className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                    <span className="text-[11px]">প্রতিদিন খোলা: সকাল ৯:০০ - রাত ৮:০০</span>
                  </div>
                  <div className="flex items-start gap-2 text-slate-600">
                    <MapPin className="w-3.5 h-3.5 text-rose-500 shrink-0 mt-0.5" />
                    <span className="text-[11px] leading-tight">ডুবাইল, সেহড়াতৈল রোড, নাটিয়াপাড়া বাজার, দেলদুয়ার, টাঙ্গাইল</span>
                  </div>
                </div>
              </div>

              {/* Quick WhatsApp & Admin Footer */}
              <div className="pt-3 flex items-center justify-between gap-2 pb-2">
                <a
                  href="https://wa.me/8801302383795"
                  target="_blank"
                  rel="noreferrer"
                  className="flex-1 py-2.5 px-3 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-[11px] font-bold flex items-center justify-center gap-1.5 border border-emerald-200 transition-colors"
                >
                  <MessageCircle className="w-4 h-4 text-emerald-600" />
                  <span>WhatsApp মেসেজ</span>
                </a>

                {onOpenAdminModal && (
                  <button
                    onClick={() => {
                      onOpenAdminModal();
                      setMobileMenuOpen(false);
                    }}
                    className="py-2.5 px-3.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px] font-bold flex items-center justify-center gap-1.5 border border-slate-200 transition-colors cursor-pointer shrink-0"
                  >
                    <Lock className="w-3.5 h-3.5 text-slate-600" />
                    <span>এডমিন প্যানেল</span>
                  </button>
                )}
              </div>

            </div>
          </div>
        </div>,
        document.body
      )}
    </header>
  );
};
