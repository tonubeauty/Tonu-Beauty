import React, { useState, useMemo } from 'react';
import { Product, Category, FilterOptions } from '../types';
import { ProductCard } from './ProductCard';
import { SlidersHorizontal, ArrowUpDown, Filter, Sparkles, Check } from 'lucide-react';

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
}) => {
  const [sortBy, setSortBy] = useState<FilterOptions['sortBy']>('popular');
  const [inStockOnly, setInStockOnly] = useState(false);

  // Filter and sort products dynamically
  const filteredProducts = useMemo(() => {
    return products
      .filter((product) => {
        // Category Filter
        if (selectedCategory !== 'all' && product.category !== selectedCategory) {
          return false;
        }
        // Search Filter (checks title, Bengali title, category, description)
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
        // Default popular
        return (b.reviewCount || 0) - (a.reviewCount || 0);
      });
  }, [products, selectedCategory, searchQuery, inStockOnly, sortBy]);

  return (
    <section id="catalog-section" className="py-10 bg-slate-50 min-h-[600px]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        
        {/* Section Title */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-rose-200 pb-5">
          <div>
            <div className="flex items-center gap-2 text-rose-700 text-xs font-bold uppercase tracking-wider mb-1">
              <Sparkles className="w-4 h-4 text-rose-600" />
              <span>তনু বিউটি পার্লার এন্ড লেজার সেন্টার (CSA শাখা)</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              আমাদের সকল সার্ভিস ও লেজার প্যাকেজ
            </h2>
          </div>

          <p className="text-xs sm:text-sm text-slate-600 max-w-md">
            ডুবাইল, সেহড়াতৈল রোড, নাটিয়াপাড়া বাজার, দেলদুয়ার, টাঙ্গাইল। যেকোনো সার্ভিস নির্বাচন করে সরাসরি অ্যাপয়েন্টমেন্ট বুকিং দিন।
          </p>
        </div>

        {/* Category Filter Pills Bar */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 no-scrollbar">
          {categories.map((cat) => {
            const isActive = selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => onSelectCategory(cat.id)}
                className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold whitespace-nowrap transition-all flex items-center gap-2 cursor-pointer ${
                  isActive
                    ? 'bg-slate-900 text-white shadow-md'
                    : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200/80'
                }`}
              >
                <span>{cat.nameBn}</span>
                <span
                  className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold ${
                    isActive ? 'bg-slate-700 text-emerald-300' : 'bg-slate-100 text-slate-500'
                  }`}
                >
                  {cat.count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Search Result Counter & Sort Controls */}
        <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-3.5 rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="text-xs sm:text-sm font-medium text-slate-700 flex items-center gap-2">
            <span className="font-bold text-slate-900">{filteredProducts.length}টি</span> প্রোডাক্ট পাওয়া গেছে
            {searchQuery && (
              <span className="text-slate-500">
                (সার্চ: "<b className="text-emerald-700">{searchQuery}</b>")
              </span>
            )}
          </div>

          <div className="flex items-center gap-3 text-xs">
            {/* In Stock Only Checkbox */}
            <label className="hidden sm:inline-flex items-center gap-1.5 text-slate-600 font-medium cursor-pointer">
              <input
                type="checkbox"
                checked={inStockOnly}
                onChange={(e) => setInStockOnly(e.target.checked)}
                className="w-3.5 h-3.5 rounded text-emerald-600 focus:ring-emerald-500"
              />
              <span>স্টকে আছে শুধুমাত্র</span>
            </label>

            {/* Sort Dropdown */}
            <div className="flex items-center gap-1.5 bg-slate-50 px-2.5 py-1.5 rounded-lg border border-slate-200">
              <ArrowUpDown className="w-3.5 h-3.5 text-slate-500" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as FilterOptions['sortBy'])}
                className="bg-transparent font-medium text-slate-700 focus:outline-none cursor-pointer"
              >
                <option value="popular">জনপ্রিয়তা অনুযায়ী</option>
                <option value="price_low">কম থেকে বেশি দাম</option>
                <option value="price_high">বেশি থেকে কম দাম</option>
                <option value="rating">সর্বোচ্চ কাস্টমার রেটিং</option>
              </select>
            </div>
          </div>
        </div>

        {/* Product Cards Grid */}
        {filteredProducts.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5 sm:gap-6">
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
          /* Empty Search / Filter State */
          <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center max-w-md mx-auto space-y-4">
            <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto text-slate-400">
              <Filter className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-bold text-slate-900">কোনো প্রোডাক্ট পাওয়া যায়নি!</h3>
            <p className="text-xs text-slate-500">
              আপনার সার্চ বা ক্যাটেগরি ফিল্টারে কোনো প্রোডাক্ট মেলেনি। অন্য কি-ওয়ার্ড বা ক্যাটেগরি চেষ্টা করুন।
            </p>
            <button
              onClick={() => {
                onSelectCategory('all');
              }}
              className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs transition-colors cursor-pointer"
            >
              সব প্রোডাক্ট দেখুন
            </button>
          </div>
        )}

      </div>
    </section>
  );
};
