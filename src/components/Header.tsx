import React, { useState } from 'react';
import { ShoppingBag, Search, PhoneCall, MapPin, Menu, X, Calendar, Lock } from 'lucide-react';
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
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/80 shadow-2xs">
      {/* Top Subtle Info Strip */}
      <div className="bg-slate-900 text-slate-300 text-xs py-1.5 px-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs truncate">
            <span className="text-rose-400 font-semibold">CSA লেজার শাখা</span>
            <span className="text-slate-600">•</span>
            <span className="flex items-center gap-1 text-slate-300 truncate">
              <MapPin className="w-3.5 h-3.5 text-rose-400 shrink-0" />
              <span className="truncate">নাটিয়াপাড়া বাজার, দেলদুয়ার, টাঙ্গাইল</span>
            </span>
          </div>

          <div className="flex items-center gap-4 text-xs shrink-0">
            <a
              href="tel:01302383795"
              className="inline-flex items-center gap-1.5 text-rose-200 hover:text-white transition-colors"
            >
              <PhoneCall className="w-3.5 h-3.5 text-emerald-400" />
              <span className="font-semibold">01302383795</span>
            </a>

            {onOpenAdminModal && (
              <button
                onClick={onOpenAdminModal}
                className="hidden sm:inline-flex items-center gap-1 text-slate-400 hover:text-white transition-colors cursor-pointer text-[11px]"
                title="এডমিন লগইন"
              >
                <Lock className="w-3 h-3" />
                <span>এডমিন</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Main Navigation Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          
          {/* Brand Logo */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-1.5 rounded-lg text-slate-700 hover:bg-slate-100 focus:outline-none"
              aria-label="Toggle Menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>

            <a
              id="header-institution-brand"
              href="#"
              onClick={handleBrandClick}
              className="flex items-center gap-2.5 group cursor-pointer"
              title="হোম পেজে যান"
            >
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-rose-600 to-rose-700 flex items-center justify-center text-white font-bold text-base shadow-xs group-hover:bg-rose-700 transition-colors shrink-0">
                তনু
              </div>
              <div>
                <span className="text-base sm:text-lg font-bold text-slate-900 block leading-tight tracking-tight">
                  তনু বিউটি পার্লার <span className="text-rose-600 font-medium">& লেজার সেন্টার</span>
                </span>
                <span className="text-[11px] text-slate-500 font-normal block">
                  দেলদুয়ার, টাঙ্গাইল
                </span>
              </div>
            </a>
          </div>

          {/* Search Bar (Desktop) */}
          <div className="hidden lg:flex flex-1 max-w-sm mx-4">
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
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600 w-4 h-4 flex items-center justify-center"
                >
                  ✕
                </button>
              )}
            </div>
          </div>

          {/* Right Action Buttons */}
          <div className="flex items-center gap-2 sm:gap-3">
            {onOpenAppointmentModal && (
              <button
                onClick={onOpenAppointmentModal}
                className="hidden sm:inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 font-semibold text-xs border border-rose-200 transition-colors cursor-pointer"
              >
                <Calendar className="w-3.5 h-3.5 text-rose-600" />
                <span>অনলাইন বুকিং</span>
              </button>
            )}

            <button
              onClick={onOpenCart}
              className="relative inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-medium text-xs transition-colors cursor-pointer shadow-xs"
              title="বুকিং কার্ট"
            >
              <div className="relative">
                <ShoppingBag className="w-4 h-4 text-slate-200" />
                {cartCount > 0 && (
                  <span className="absolute -top-1.5 -right-2 bg-rose-600 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
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
        <div className="lg:hidden pb-3">
          <div className="relative w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="সার্ভিস বা প্যাকেজ খুঁজুন..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-rose-500 focus:bg-white text-slate-800"
            />
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-200 bg-white px-4 py-3 space-y-3">
          <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
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
                className={`px-3 py-2 rounded-xl text-xs font-medium text-left transition-colors flex items-center justify-between ${
                  selectedCategory === cat.id
                    ? 'bg-rose-50 text-rose-700 font-semibold border border-rose-200'
                    : 'bg-slate-50 text-slate-700 hover:bg-slate-100'
                }`}
              >
                <span>{cat.nameBn}</span>
                <span className="text-[10px] text-slate-400">
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
              className="text-slate-600 hover:text-slate-900 font-medium"
            >
              বুকিং ট্র্যাকিং
            </button>
            <a href="tel:01302383795" className="text-rose-600 font-semibold flex items-center gap-1">
              <PhoneCall className="w-3.5 h-3.5" />
              <span>01302383795</span>
            </a>
          </div>
        </div>
      )}
    </header>
  );
};

