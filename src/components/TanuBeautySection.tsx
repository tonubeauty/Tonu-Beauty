import React, { useState } from 'react';
import {
  Sparkles,
  MapPin,
  PhoneCall,
  Calendar,
  ArrowRight,
  ShieldCheck,
  HeartHandshake,
  Star,
  ShoppingBag,
  Truck,
  Building2,
  AlertTriangle,
  CheckCircle2,
  Package,
  Layers
} from 'lucide-react';
import { Product } from '../types';
import { PRODUCTS, isProductItem } from '../data/products';

interface TanuBeautySectionProps {
  products?: Product[];
  onBookAppointment: (serviceName?: string) => void;
  onExploreBeautyProducts: (category?: string) => void;
  onAddToCart?: (product: Product) => void;
  onDirectOrder?: (product: Product) => void;
  onQuickView?: (product: Product) => void;
}

export const TanuBeautySection: React.FC<TanuBeautySectionProps> = ({
  products = PRODUCTS,
  onBookAppointment,
  onExploreBeautyProducts,
  onAddToCart,
  onDirectOrder,
  onQuickView,
}) => {
  // Two explicit divisions requested by user:
  // 1. 'services': পার্লার ও লেজার সার্ভিসসমূহ (ডেলিভারি হবে না, প্রতিষ্ঠানে এসে নিতে হবে)
  // 2. 'products': পণ্য (শুধুমাত্র অনলাইন/অফলাইনে বিক্রি করা যাবে, সারাদেশে হোম ডেলিভারি প্রযোজ্য)
  const [activeTab, setActiveTab] = useState<'services' | 'products'>('services');

  const parlourServices = products.filter((p) => !isProductItem(p));
  const cosmeticProducts = products.filter((p) => isProductItem(p));

  return (
    <section className="py-10 sm:py-14 bg-slate-50 border-b border-slate-200/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6 sm:space-y-8">
        
        {/* Section Title & Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold tracking-wide uppercase">
              <Sparkles className="w-3.5 h-3.5 text-rose-600" />
              <span>তনু বিউটি পার্লার & লেজার সেন্টার</span>
            </div>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-slate-900 tracking-tight mt-2">
              প্রধান বিউটি ও লেজার সার্ভিসসমূহ
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 mt-1.5 max-w-2xl">
              জার্মানি প্রযুক্তির সিএসএ লেজার ট্রিটমেন্ট, বিশেষজ্ঞ রূপচর্চা সেবা এবং শতভাগ অথেনটিক প্রসাধন পণ্য।
            </p>
          </div>

          <div className="flex items-center gap-2.5 shrink-0">
            <button
              onClick={() => onBookAppointment()}
              className="px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 active:bg-rose-800 text-white font-bold text-xs sm:text-sm transition-all flex items-center gap-2 cursor-pointer shadow-sm hover:shadow"
            >
              <Calendar className="w-4 h-4" />
              <span>সিরিয়াল বুকিং দিন</span>
            </button>

            <button
              onClick={() => onExploreBeautyProducts(activeTab === 'products' ? 'beauty_products' : 'csa_laser')}
              className="px-4 py-2.5 rounded-xl bg-white hover:bg-slate-100 text-slate-800 font-bold text-xs sm:text-sm border border-slate-300 transition-colors cursor-pointer"
            >
              সবগুলো দেখুন
            </button>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* TWO PRIMARY CATEGORY TABS (দুইটি ক্যাটগরি ভাগ) */}
        {/* 1. পার্লার ও লেজার সার্ভিসসমূহ (প্রতিষ্ঠানে এসে নিতে হবে) */}
        {/* 2. পণ্য (অনলাইন ও অফলাইনে বিক্রি এবং ডেলিভারিযোগ্য) */}
        {/* ========================================================================= */}
        <div className="bg-white p-2 sm:p-2.5 rounded-2xl border border-slate-200/90 shadow-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {/* Tab 1: Services */}
            <button
              onClick={() => setActiveTab('services')}
              className={`p-3.5 sm:p-4 rounded-xl text-left transition-all cursor-pointer flex items-start gap-3.5 border ${
                activeTab === 'services'
                  ? 'bg-rose-50/80 border-rose-300 shadow-xs ring-1 ring-rose-400'
                  : 'bg-white border-transparent hover:bg-slate-50 text-slate-600'
              }`}
            >
              <div
                className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                  activeTab === 'services'
                    ? 'bg-rose-600 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600'
                }`}
              >
                <Building2 className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-extrabold text-sm sm:text-base text-slate-900">
                    💆 পার্লার ও লেজার সার্ভিসসমূহ
                  </span>
                  <span className="text-[10px] sm:text-xs font-bold px-2 py-0.5 rounded-full bg-rose-100 text-rose-700">
                    {parlourServices.length}টি সেবা
                  </span>
                </div>
                <p className="text-[11px] sm:text-xs text-rose-700 font-semibold mt-0.5 flex items-center gap-1">
                  <span>🏢 প্রতিষ্ঠানে এসে সার্ভিস নিতে হবে (হোম ডেলিভারি হবে না)</span>
                </p>
              </div>
            </button>

            {/* Tab 2: Products */}
            <button
              onClick={() => setActiveTab('products')}
              className={`p-3.5 sm:p-4 rounded-xl text-left transition-all cursor-pointer flex items-start gap-3.5 border ${
                activeTab === 'products'
                  ? 'bg-emerald-50/90 border-emerald-300 shadow-xs ring-1 ring-emerald-500'
                  : 'bg-white border-transparent hover:bg-slate-50 text-slate-600'
              }`}
            >
              <div
                className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                  activeTab === 'products'
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600'
                }`}
              >
                <ShoppingBag className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-extrabold text-sm sm:text-base text-slate-900">
                    🛍️ প্রসাধন ও স্কিনকেয়ার পণ্য
                  </span>
                  <span className="text-[10px] sm:text-xs font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                    {cosmeticProducts.length}টি পণ্য
                  </span>
                </div>
                <p className="text-[11px] sm:text-xs text-emerald-700 font-semibold mt-0.5 flex items-center gap-1">
                  <Truck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>অনলাইন ও অফলাইনে বিক্রয় • সারাদেশে হোম ডেলিভারি</span>
                </p>
              </div>
            </button>
          </div>
        </div>

        {/* Category Notification Banner based on activeTab */}
        {activeTab === 'services' ? (
          <div className="bg-amber-50/90 border border-amber-200/90 rounded-2xl p-4 sm:p-4.5 flex items-start sm:items-center gap-3.5 text-amber-900 shadow-xs">
            <div className="w-8 h-8 rounded-xl bg-amber-200/80 text-amber-800 flex items-center justify-center shrink-0 mt-0.5 sm:mt-0">
              <AlertTriangle className="w-4 h-4" />
            </div>
            <div className="flex-1 text-xs sm:text-sm leading-relaxed">
              <span className="font-extrabold text-amber-950">
                🚫 সার্ভিস হোম ডেলিভারি সংক্রান্ত নীতিমালা:
              </span>{' '}
              প্রোডাক্ট ছাড়া বাকি লেজার ও পার্লার সার্ভিসগুলো হোম ডেলিভারি হবে না। বিশেষায়িত জার্মান ইকুইপমেন্ট ও প্রফেশনাল স্পেশালিস্ট দ্বারা পরিচালিত এসব সার্ভিস গ্রহণ করতে গ্রাহককে আমাদের প্রতিষ্ঠানে (নাটিয়াপাড়া বাজার, দেলদুয়ার, টাঙ্গাইল) সরাসরি উপস্থিত হতে হবে।
            </div>
            <button
              onClick={() => onBookAppointment()}
              className="hidden lg:flex px-3.5 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs shrink-0 cursor-pointer transition-colors"
            >
              সিরিয়াল বুকিং
            </button>
          </div>
        ) : (
          <div className="bg-emerald-50/90 border border-emerald-200/90 rounded-2xl p-4 sm:p-4.5 flex items-start sm:items-center gap-3.5 text-emerald-900 shadow-xs">
            <div className="w-8 h-8 rounded-xl bg-emerald-200/80 text-emerald-800 flex items-center justify-center shrink-0 mt-0.5 sm:mt-0">
              <CheckCircle2 className="w-4 h-4" />
            </div>
            <div className="flex-1 text-xs sm:text-sm leading-relaxed">
              <span className="font-extrabold text-emerald-950">
                📦 পণ্য বিক্রয় ও ডেলিভারি সুবিধা:
              </span>{' '}
              এই পণ্যগুলো শুধুমাত্র অনলাইন এবং অফলাইনে বিক্রি করা যাবে। ঘরে বসে ক্যাশ অন ডেলিভারিতে পেতে অনলাইনে অর্ডার করুন অথবা আমাদের পার্লারের শোরুম থেকে সরাসরি এসে সংগ্রহ করতে পারবেন।
            </div>
            <button
              onClick={() => onExploreBeautyProducts('beauty_products')}
              className="hidden lg:flex px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shrink-0 cursor-pointer transition-colors"
            >
              সব পণ্য দেখুন
            </button>
          </div>
        )}

        {/* Content Display for TAB 1: SERVICES */}
        {activeTab === 'services' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
            {parlourServices.slice(0, 4).map((srv) => (
              <div
                key={srv.id}
                className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/90 shadow-xs hover:shadow-md transition-all flex flex-col justify-between space-y-4 group"
              >
                <div className="space-y-3">
                  {/* Image & Tag */}
                  <div className="relative h-44 rounded-xl overflow-hidden bg-slate-100 border border-slate-100">
                    <img
                      src={srv.images[0]}
                      alt={srv.titleBn}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute top-2.5 left-2.5 bg-slate-900/85 backdrop-blur-xs text-white text-[10px] font-bold px-2.5 py-1 rounded-lg">
                      {srv.categoryBn}
                    </div>
                    <div className="absolute bottom-2.5 left-2.5 right-2.5 bg-rose-950/85 backdrop-blur-xs text-rose-100 text-[10px] font-semibold px-2.5 py-1 rounded-lg text-center truncate">
                      🏢 প্রতিষ্ঠানে এসে সার্ভিস নিতে হবে
                    </div>
                  </div>

                  <h3 className="font-bold text-slate-900 text-sm sm:text-base leading-snug line-clamp-2">
                    {srv.titleBn}
                  </h3>

                  <p className="text-xs text-slate-600 leading-relaxed line-clamp-2">
                    {srv.descriptionBn}
                  </p>

                  <div className="flex items-baseline justify-between pt-1">
                    <div>
                      <span className="text-xs text-slate-400">ফি: </span>
                      <span className="text-base font-extrabold text-rose-600">
                        ৳{srv.price.toLocaleString('bn-BD')}
                      </span>
                      {srv.originalPrice > srv.price && (
                        <span className="text-xs text-slate-400 line-through ml-1.5">
                          ৳{srv.originalPrice.toLocaleString('bn-BD')}
                        </span>
                      )}
                    </div>
                    <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md">
                      ★ {srv.rating} ({srv.reviewCount}+)
                    </span>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-2">
                  <button
                    onClick={() => onBookAppointment(srv.titleBn)}
                    className="flex-1 py-2 px-3 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <Calendar className="w-3.5 h-3.5" />
                    <span>সিরিয়াল বুকিং দিন</span>
                  </button>

                  {onQuickView && (
                    <button
                      onClick={() => onQuickView(srv)}
                      className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold cursor-pointer transition-colors"
                      title="বিস্তারিত দেখুন"
                    >
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Content Display for TAB 2: PRODUCTS */}
        {activeTab === 'products' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {cosmeticProducts.map((prod) => (
              <div
                key={prod.id}
                className="bg-white rounded-2xl p-4 sm:p-5 border border-emerald-100/90 shadow-xs hover:shadow-md transition-all flex flex-col justify-between space-y-4 group"
              >
                <div className="space-y-3">
                  {/* Product Image */}
                  <div className="relative h-44 rounded-xl overflow-hidden bg-slate-50 border border-slate-100">
                    <img
                      src={prod.images[0]}
                      alt={prod.titleBn}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute top-2.5 left-2.5 bg-emerald-700 text-white text-[10px] font-bold px-2 py-0.5 rounded-lg shadow-xs">
                      পণ্য (অনলাইন/অফলাইন)
                    </div>
                    {prod.discountPercent > 0 && (
                      <div className="absolute top-2.5 right-2.5 bg-rose-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-lg">
                        -{prod.discountPercent}% ছাড়
                      </div>
                    )}
                    <div className="absolute bottom-2.5 left-2.5 right-2.5 bg-emerald-950/85 backdrop-blur-xs text-emerald-100 text-[10px] font-medium px-2 py-0.5 rounded-lg text-center flex items-center justify-center gap-1">
                      <Truck className="w-3 h-3 text-emerald-300" />
                      <span>ক্যাশ অন হোম ডেলিভারি প্রযোজ্য</span>
                    </div>
                  </div>

                  <h3 className="font-bold text-slate-900 text-sm sm:text-base leading-snug line-clamp-2">
                    {prod.titleBn}
                  </h3>

                  <p className="text-xs text-slate-600 leading-relaxed line-clamp-2">
                    {prod.descriptionBn}
                  </p>

                  <div className="flex items-baseline justify-between pt-1">
                    <div>
                      <span className="text-xs text-slate-400">মূল্য: </span>
                      <span className="text-base font-extrabold text-emerald-700">
                        ৳{prod.price.toLocaleString('bn-BD')}
                      </span>
                      {prod.originalPrice > prod.price && (
                        <span className="text-xs text-slate-400 line-through ml-1.5">
                          ৳{prod.originalPrice.toLocaleString('bn-BD')}
                        </span>
                      )}
                    </div>
                    <span className="text-[11px] font-semibold text-slate-600">
                      স্টক: {prod.stockCount}টি
                    </span>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-100 flex items-center gap-2">
                  {onDirectOrder && (
                    <button
                      onClick={() => onDirectOrder(prod)}
                      className="flex-1 py-2 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow-xs"
                    >
                      <ShoppingBag className="w-3.5 h-3.5" />
                      <span>অর্ডার করুন</span>
                    </button>
                  )}

                  {onAddToCart && (
                    <button
                      onClick={() => onAddToCart(prod)}
                      className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold cursor-pointer transition-colors"
                      title="কার্টে রাখুন"
                    >
                      <Package className="w-4 h-4" />
                    </button>
                  )}

                  {onQuickView && (
                    <button
                      onClick={() => onQuickView(prod)}
                      className="p-2 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-600 text-xs font-semibold border border-slate-200 cursor-pointer transition-colors"
                      title="বিস্তারিত"
                    >
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Parlour Location & Hotline Bar */}
        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-2xs">
          <div className="flex items-center gap-3 text-xs sm:text-sm text-slate-700">
            <div className="w-9 h-9 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center shrink-0">
              <MapPin className="w-5 h-5" />
            </div>
            <div>
              <div className="font-bold text-slate-900">
                তনু বিউটি পার্লার & লেজার সেন্টার (সিএসএ লেজার শাখা)
              </div>
              <div className="text-slate-500 text-xs mt-0.5">
                ডুবাইল, সেহড়াতৈল রোড, নাটিয়াপাড়া বাজার, দেলদুয়ার, টাঙ্গাইল
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <span className="text-xs text-slate-500 hidden md:inline">যেকোনো তথ্যে কল করুন:</span>
            <a
              href="tel:01302383795"
              className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs sm:text-sm flex items-center gap-2 transition-colors shadow-xs"
            >
              <PhoneCall className="w-3.5 h-3.5 text-emerald-400" />
              <span>01302383795</span>
            </a>
          </div>
        </div>

      </div>
    </section>
  );
};
