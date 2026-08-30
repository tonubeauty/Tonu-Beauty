import React, { useState } from 'react';
import { ShoppingBag, Search, PhoneCall, Sparkles, MapPin, Menu, X, Calendar, ShieldCheck, Lock } from 'lucide-react';
import { Category } from '../types';

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

  const handleBrandClick = (e: React.MouseEvent) => {
    e.preventDefault();
    setMobileMenuOpen(false);
    if (onGoHome) {
      onGoHome();
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-rose-100 shadow-xs">
      {/* Top Announcement Bar */}
      <div className="bg-gradient-to-r from-rose-900 via-rose-800 to-indigo-950 text-rose-50 text-xs sm:text-sm py-1.5 px-4 font-medium">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2 sm:gap-3 overflow-x-auto no-scrollbar whitespace-nowrap">
            <span className="inline-flex items-center gap-1 bg-rose-700/80 px-2 py-0.5 rounded text-amber-300 text-[11px] font-bold border border-rose-500/40">
              <Sparkles className="w-3.5 h-3.5" /> CSA লেজারের একটি শাখা
            </span>
            <span className="hidden sm:inline-block text-rose-300">•</span>
            <span className="inline-flex items-center gap-1 text-rose-100">
              <MapPin className="w-3.5 h-3.5 text-rose-300 shrink-0" />
              <span>ডুবাইল, সেহড়াতৈল রোড, নাটিয়াপাড়া বাজার, দেলদুয়ার, টাঙ্গাইল</span>
            </span>
          </div>

          <div className="flex items-center gap-3 text-xs">
            {onOpenAdminModal && (
              <button
                onClick={onOpenAdminModal}
                className="inline-flex items-center gap-1 bg-white/10 hover:bg-white/20 text-rose-100 px-2.5 py-0.5 rounded text-[11px] font-bold transition-all cursor-pointer"
                title="পার্লার এডমিন প্যানেল"
              >
                <Lock className="w-3 h-3 text-amber-300" />
                <span>এডমিন প্যানেল</span>
              </button>
            )}

            <a
              href="tel:01302383795"
              className="hidden lg:inline-flex items-center gap-1.5 text-amber-300 hover:text-amber-200 transition-colors font-bold"
            >
              <PhoneCall className="w-3.5 h-3.5 text-emerald-400" />
              <span>সরাসরি কল: <b>01302383795</b></span>
            </a>
          </div>
        </div>
      </div>

      {/* Main Navigation */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-3 sm:gap-6">
          
          {/* Brand Logo & Mobile Toggle */}
          <div className="flex items-center gap-2 sm:gap-3">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-lg text-slate-700 hover:bg-slate-100 focus:outline-none"
              aria-label="Toggle Menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>

            <a
              id="header-institution-brand"
              href="#"
              onClick={handleBrandClick}
              className="flex items-center gap-2.5 group cursor-pointer"
              title="হোম পেজে যান"
            >
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-rose-600 via-pink-600 to-indigo-800 flex items-center justify-center text-white font-extrabold text-xl shadow-md group-hover:scale-105 transition-transform shrink-0">
                তনু
              </div>
              <div>
                <span className="text-lg sm:text-xl font-extrabold tracking-tight text-slate-900 block leading-tight group-hover:text-rose-700 transition-colors">
                  তনু বিউটি পার্লার <span className="text-rose-600 font-bold">& লেজার সেন্টার</span>
                </span>
                <span className="text-[10px] text-rose-800 font-semibold tracking-wide block -mt-0.5">
                  ⭐ CSA লেজারের একটি শাখা (দেলদুয়ার, টাঙ্গাইল)
                </span>
              </div>
            </a>
          </div>

          {/* Search Bar (Desktop) */}
          <div className="hidden lg:flex flex-1 max-w-md mx-4">
            <div className="relative w-full">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="সার্ভিস খুঁজুন (যেমন: হেয়ার রিমুভাল, মেছতা, ফেসিয়াল)..."
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                className="w-full pl-10 pr-4 py-2 text-xs bg-slate-100/90 border border-slate-200 rounded-full focus:outline-none focus:ring-2 focus:ring-rose-500/50 focus:bg-white focus:border-rose-500 transition-all text-slate-800 placeholder:text-slate-400"
              />
              {searchQuery && (
                <button
                  onClick={() => onSearchChange('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600 bg-slate-200 rounded-full w-4 h-4 flex items-center justify-center"
                >
                  ✕
                </button>
              )}
            </div>
          </div>

          {/* Right Action Buttons */}
          <div className="flex items-center gap-2 sm:gap-3">
            
            {/* Direct Phone Call Button */}
            <a
              href="tel:01302383795"
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-rose-900 bg-rose-50 border border-rose-200 hover:bg-rose-100 transition-all"
            >
              <PhoneCall className="w-3.5 h-3.5 text-emerald-600" />
              <span>01302383795</span>
            </a>

            {/* Instant Booking Button */}
            {onOpenAppointmentModal && (
              <button
                onClick={onOpenAppointmentModal}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-700 hover:to-pink-700 text-white font-bold text-xs sm:text-sm shadow-md transition-all cursor-pointer"
              >
                <Calendar className="w-4 h-4" />
                <span className="hidden sm:inline">অনলাইন বুকিং</span>
                <span className="sm:hidden">বুকিং</span>
              </button>
            )}

            {/* Service Cart Drawer Trigger */}
            <button
              onClick={onOpenCart}
              className="relative inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-medium text-xs transition-all shadow-sm cursor-pointer"
              title="বুকিং কার্ট"
            >
              <div className="relative">
                <ShoppingBag className="w-4 h-4 text-rose-300" />
                {cartCount > 0 && (
                  <span className="absolute -top-2 -right-2 bg-rose-500 text-white text-[10px] font-extrabold w-4 h-4 rounded-full flex items-center justify-center ring-2 ring-white animate-pulse">
                    {cartCount}
                  </span>
                )}
              </div>
              <span className="hidden md:inline-block font-bold">
                {cartTotal > 0 ? `৳${cartTotal.toLocaleString('bn-BD')}` : 'সার্ভিস কার্ট'}
              </span>
            </button>
          </div>

        </div>

        {/* Mobile Search Bar */}
        <div className="lg:hidden pb-3">
          <div className="relative w-full">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="সার্ভিস বা ফেসিয়াল খুঁজুন..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="w-full pl-10 pr-4 py-2 text-xs bg-slate-100 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-500 focus:bg-white"
            />
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-200 bg-white px-4 py-3 space-y-3">
          <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">
            সার্ভিস ক্যাটেগরি
          </div>
          <div className="grid grid-cols-2 gap-2">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => {
                  onSelectCategory(cat.id);
                  setMobileMenuOpen(false);
                }}
                className={`px-3 py-2 rounded-xl text-xs font-semibold text-left transition-colors flex items-center justify-between ${
                  selectedCategory === cat.id
                    ? 'bg-rose-50 text-rose-700 font-bold border border-rose-200'
                    : 'bg-slate-50 text-slate-700 hover:bg-slate-100'
                }`}
              >
                <span>{cat.nameBn}</span>
                <span className="text-[10px] text-slate-500 bg-white px-1.5 py-0.5 rounded-full border border-slate-200">
                  {cat.count}
                </span>
              </button>
            ))}
          </div>

          <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
            <button
              onClick={() => {
                onOpenTrackModal();
                setMobileMenuOpen(false);
              }}
              className="inline-flex items-center gap-1.5 text-rose-700 font-bold"
            >
              <span>বুকিং ট্র্যাকিং</span>
            </button>
            <a href="tel:01302383795" className="text-emerald-700 font-extrabold flex items-center gap-1">
              <PhoneCall className="w-3.5 h-3.5" />
              <span>01302383795</span>
            </a>
          </div>
        </div>
      )}
    </header>
  );
};

