import React, { useState, useMemo, useEffect } from 'react';
import { Product, Category, FilterOptions } from '../types';
import { ProductCard } from './ProductCard';
import { isProductItem } from '../data/products';
import {
  ArrowUpDown,
  Filter,
  QrCode,
  ShoppingBag,
  Building2,
  Layers,
  Truck,
  AlertTriangle,
  CheckCircle2
} from 'lucide-react';

interface ProductCatalogProps {
  products: Product[];
  categories: Category[];
  selectedCategory: string;
  onSelectCategory: (catId: string) => void;
  searchQuery: string;
  onQuickView: (product: Product) => void;
  onAddToCart: (product: Product) => void;
  onDirectOrder: (product: Product) => void;
  onToast?: (msg: string) => void;
  onOpenTrackModal?: (initialId?: string) => void;
}

export const ProductCatalog: React.FC<ProductCatalogProps> = ({
  products,
  categories,
  selectedCategory,
  onSelectCategory,
  searchQuery,
  onQuickView,
  onAddToCart,
  onDirectOrder,
  onToast,
  onOpenTrackModal,
}) => {
  const [sortBy, setSortBy] = useState<FilterOptions['sortBy']>('popular');
  const [inStockOnly, setInStockOnly] = useState(false);
  
  // Top Division Filter: 'all' | 'products' (পণ্য) | 'services' (সার্ভিস)
  const [divisionFilter, setDivisionFilter] = useState<'all' | 'products' | 'services'>('all');

  // Synchronize division filter if a specific category was clicked from Header/Footer
  useEffect(() => {
    if (selectedCategory === 'beauty_products') {
      setDivisionFilter('products');
    } else if (selectedCategory !== 'all') {
      setDivisionFilter('services');
    }
  }, [selectedCategory]);

  const handleDivisionChange = (div: 'all' | 'products' | 'services') => {
    setDivisionFilter(div);
    if (div === 'products') {
      if (selectedCategory !== 'all' && selectedCategory !== 'beauty_products') {
        onSelectCategory('beauty_products');
      }
    } else if (div === 'services') {
      if (selectedCategory === 'beauty_products') {
        onSelectCategory('all');
      }
    }
  };

  // Filter and sort products dynamically
  const filteredProducts = useMemo(() => {
    return products
      .filter((product) => {
        const isProduct = isProductItem(product);

        // Division Filter
        if (divisionFilter === 'products' && !isProduct) return false;
        if (divisionFilter === 'services' && isProduct) return false;

        // Specific Category Filter
        if (selectedCategory !== 'all' && product.category !== selectedCategory) {
          return false;
        }

        // Search Filter
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const matchTitle = product.title.toLowerCase().includes(q);
          const matchTitleBn = product.titleBn.toLowerCase().includes(q);
          const matchCategoryBn = product.categoryBn.toLowerCase().includes(q);
          const matchDescBn = product.descriptionBn.toLowerCase().includes(q);
          if (!matchTitle && !matchTitleBn && !matchCategoryBn && !matchDescBn) {
            return false;
          }
        }

        // In stock check
        if (inStockOnly && product.stockCount <= 0) {
          return false;
        }

        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'price_low') return a.price - b.price;
        if (sortBy === 'price_high') return b.price - a.price;
        if (sortBy === 'rating') return b.rating - a.rating;
        return (b.reviewCount || 0) - (a.reviewCount || 0);
      });
  }, [products, divisionFilter, selectedCategory, searchQuery, inStockOnly, sortBy]);

  const looksLikeBookingIdOrPhone = useMemo(() => {
    const q = searchQuery.trim();
    if (!q) return false;
    const clean = q.replace(/[\s\-_#,:;./\\]/g, '').toLowerCase();
    return (
      clean.startsWith('tb') ||
      clean.startsWith('bd') ||
      clean.startsWith('01') ||
      clean.startsWith('০১') ||
      clean.replace(/\D/g, '').length >= 5
    );
  }, [searchQuery]);

  const productCount = products.filter((p) => isProductItem(p)).length;
  const serviceCount = products.filter((p) => !isProductItem(p)).length;

  return (
    <section id="catalog-section" className="py-8 sm:py-10 bg-slate-50/70 min-h-[500px] pb-28 sm:pb-16">
      <div className="max-w-7xl mx-auto px-3.5 sm:px-6 lg:px-8 space-y-4 sm:space-y-6">
        
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2.5 sm:gap-3 border-b border-slate-200/80 pb-3 sm:pb-4">
          <div>
            <h2 className="text-xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              সকল সার্ভিস ও কসমেটিক পণ্য
            </h2>
            <p className="text-[11px] sm:text-sm text-slate-500 mt-0.5 sm:mt-1">
              পণ্য অনলাইনে বা পার্লারে ক্রয় করুন এবং বিউটি ও লেজার সার্ভিসের জন্য প্রতিষ্ঠানে সিরিয়াল বুকিং দিন
            </p>
          </div>

          <div className="text-[11px] sm:text-xs text-slate-500 font-medium bg-white px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-xl border border-slate-200 shadow-2xs self-start sm:self-auto">
            প্রদর্শিত: <span className="font-extrabold text-slate-900">{filteredProducts.length}টি</span> আইটেম
          </div>
        </div>

        {/* ========================================================================= */}
        {/* PRIMARY DIVISION SEGMENTED CONTROL (ক্যাটগরি ভাগ) */}
        {/* 1. সব (All) */}
        {/* 2. 🛍️ পণ্য (অনলাইন ও অফলাইনে বিক্রি ও হোম ডেলিভারি) */}
        {/* 3. 💆 পার্লার ও লেজার সার্ভিস (ডেলিভারি হবে না, প্রতিষ্ঠানে আসতে হবে) */}
        {/* ========================================================================= */}
        <div className="grid grid-cols-3 gap-1 sm:gap-2 p-1 sm:p-1.5 bg-slate-200/70 rounded-2xl">
          <button
            onClick={() => handleDivisionChange('all')}
            className={`py-2 sm:py-2.5 px-2 sm:px-4 rounded-xl text-[11px] sm:text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1 sm:gap-1.5 ${
              divisionFilter === 'all'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'text-slate-700 hover:text-slate-900 hover:bg-slate-200/80'
            }`}
          >
            <Layers className="w-3 h-3 sm:w-3.5 sm:h-3.5 shrink-0" />
            <span className="sm:hidden">সব ({products.length})</span>
            <span className="hidden sm:inline">সবকিছু ({products.length})</span>
          </button>

          <button
            onClick={() => handleDivisionChange('products')}
            className={`py-2 sm:py-2.5 px-2 sm:px-4 rounded-xl text-[11px] sm:text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1 sm:gap-1.5 ${
              divisionFilter === 'products'
                ? 'bg-emerald-600 text-white shadow-xs ring-1 ring-emerald-500'
                : 'text-slate-700 hover:text-slate-900 hover:bg-slate-200/80'
            }`}
          >
            <ShoppingBag className="w-3 h-3 sm:w-3.5 sm:h-3.5 shrink-0" />
            <span className="sm:hidden">🛍️ পণ্য ({productCount})</span>
            <span className="hidden sm:inline">🛍️ পণ্য (ডেলিভারিযোগ্য) ({productCount})</span>
          </button>

          <button
            onClick={() => handleDivisionChange('services')}
            className={`py-2 sm:py-2.5 px-2 sm:px-4 rounded-xl text-[11px] sm:text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1 sm:gap-1.5 ${
              divisionFilter === 'services'
                ? 'bg-rose-600 text-white shadow-xs ring-1 ring-rose-500'
                : 'text-slate-700 hover:text-slate-900 hover:bg-slate-200/80'
            }`}
          >
            <Building2 className="w-3 h-3 sm:w-3.5 sm:h-3.5 shrink-0" />
            <span className="sm:hidden">💆 সার্ভিস ({serviceCount})</span>
            <span className="hidden sm:inline">💆 পার্লার ও লেজার সার্ভিস ({serviceCount})</span>
          </button>
        </div>

        {/* Division Guidance Notice Box */}
        {divisionFilter === 'services' && (
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-2.5 sm:p-3 text-[11px] sm:text-xs text-amber-900 flex items-start sm:items-center gap-2 shadow-2xs">
            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5 sm:mt-0" />
            <span>
              <b>বিজ্ঞপ্তি:</b> প্রোডাক্ট ছাড়া বাকি কোনো সার্ভিস হোম ডেলিভারি হবে না। জার্মানি প্রযুক্তির লেজার ও বিউটি সেবা নিতে আমাদের প্রতিষ্ঠানে (নাটিয়াপাড়া বাজার, দেলদুয়ার, টাঙ্গাইল) আসতে হবে।
            </span>
          </div>
        )}

        {divisionFilter === 'products' && (
          <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-2.5 sm:p-3 text-[11px] sm:text-xs text-emerald-900 flex items-start sm:items-center gap-2 shadow-2xs">
            <Truck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5 sm:mt-0" />
            <span>
              <b>ডেলিভারি সুবিধা:</b> এই পণ্যগুলো অনলাইন ও অফলাইন উভয় মাধ্যমে বিক্রি করা যায়। ঘরে বসে ক্যাশ অন ডেলিভারিতে অর্ডার করুন অথবা পার্লার শপ থেকে সরাসরি সংগ্রহ করুন।
            </span>
          </div>
        )}

        {/* Subcategory Filter Pills */}
        <div className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto pb-1 no-scrollbar">
          {categories.map((cat) => {
            const isActive = selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => onSelectCategory(cat.id)}
                className={`px-3 py-1.5 sm:px-3.5 sm:py-1.5 rounded-xl text-[11px] sm:text-xs font-semibold whitespace-nowrap transition-colors flex items-center gap-1.5 cursor-pointer shrink-0 ${
                  isActive
                    ? 'bg-slate-900 text-white shadow-2xs'
                    : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
                }`}
              >
                <span>{cat.nameBn}</span>
                <span
                  className={`text-[9px] sm:text-[10px] px-1.5 py-0.2 rounded-full ${
                    isActive ? 'bg-slate-700 text-slate-200' : 'bg-slate-100 text-slate-500'
                  }`}
                >
                  {cat.count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Sort & Filter Bar */}
        <div className="flex items-center justify-between gap-2 text-xs">
          <label className="inline-flex items-center gap-1.5 text-slate-600 font-medium cursor-pointer text-[11px] sm:text-xs">
            <input
              type="checkbox"
              checked={inStockOnly}
              onChange={(e) => setInStockOnly(e.target.checked)}
              className="w-3.5 h-3.5 rounded text-rose-600 focus:ring-rose-500 cursor-pointer"
            />
            <span>স্টকে / বুকিংযোগ্য</span>
          </label>

          <div className="flex items-center gap-1 bg-white px-2 py-1 sm:px-2.5 sm:py-1.5 rounded-xl border border-slate-200 shadow-2xs">
            <ArrowUpDown className="w-3 h-3 text-slate-400" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as FilterOptions['sortBy'])}
              className="bg-transparent text-[11px] sm:text-xs font-medium text-slate-700 focus:outline-none cursor-pointer"
            >
              <option value="popular">জনপ্রিয়তা</option>
              <option value="price_low">কম দাম</option>
              <option value="price_high">বেশি দাম</option>
              <option value="rating">সর্বোচ্চ রেটিং</option>
            </select>
          </div>
        </div>

        {/* Product Cards Grid - 2 columns on mobile, clean spacing, no clutter */}
        {filteredProducts.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2.5 sm:gap-4 lg:gap-5">
            {filteredProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onQuickView={onQuickView}
                onAddToCart={onAddToCart}
                onDirectOrder={onDirectOrder}
                onToast={onToast}
              />
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-slate-200 p-8 sm:p-10 text-center max-w-md mx-auto space-y-4 shadow-xs">
            {looksLikeBookingIdOrPhone && onOpenTrackModal ? (
              <div className="space-y-3">
                <div className="w-14 h-14 bg-amber-50 border border-amber-200 text-amber-600 rounded-2xl flex items-center justify-center mx-auto shadow-xs">
                  <QrCode className="w-7 h-7" />
                </div>
                <h3 className="text-base font-bold text-slate-900">
                  এটি একটি বুকিং আইডি বা মোবাইল নম্বর!
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  আপনি কি <span className="font-bold text-rose-600 font-mono">"{searchQuery}"</span> দিয়ে আপনার বুকিং বা অর্ডারের লাইভ ট্র্যাকিং তথ্য দেখতে চান?
                </p>
                <button
                  onClick={() => onOpenTrackModal(searchQuery)}
                  className="w-full py-2.5 px-4 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-xs"
                >
                  <QrCode className="w-4 h-4" />
                  <span>লাইভ বুকিং ট্র্যাকিং দেখুন</span>
                </button>
              </div>
            ) : (
              <>
                <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center mx-auto text-slate-400">
                  <Filter className="w-6 h-6" />
                </div>
                <h3 className="text-base font-bold text-slate-900">কোনো আইটেম পাওয়া যায়নি</h3>
                <p className="text-xs text-slate-500">
                  অন্য কোনো কি-ওয়ার্ড বা ক্যাটেগরি নির্বাচন করে চেষ্টা করুন।
                </p>
                <button
                  onClick={() => {
                    setDivisionFilter('all');
                    onSelectCategory('all');
                  }}
                  className="px-4 py-2 rounded-xl bg-slate-900 text-white font-semibold text-xs transition-colors cursor-pointer"
                >
                  সবগুলো দেখুন
                </button>
              </>
            )}
          </div>
        )}

      </div>
    </section>
  );
};
