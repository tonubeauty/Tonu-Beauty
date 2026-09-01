import React, { useState, useMemo } from 'react';
import { Product, Category, FilterOptions } from '../types';
import { ProductCard } from './ProductCard';
import { ArrowUpDown, Filter, QrCode } from 'lucide-react';

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

  // Filter and sort products dynamically
  const filteredProducts = useMemo(() => {
    return products
      .filter((product) => {
        // Category Filter
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
  }, [products, selectedCategory, searchQuery, inStockOnly, sortBy]);

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

  return (
    <section id="catalog-section" className="py-10 bg-slate-50/60 min-h-[500px]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2 border-b border-slate-200/80 pb-4">
          <div>
            <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
              সকল সার্ভিস ও প্যাকেজ
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              পছন্দের সার্ভিস সিলেক্ট করে বিস্তারিত দেখুন অথবা সরাসরি বুকিং দিন
            </p>
          </div>

          <div className="text-xs text-slate-500 font-medium">
            মোট <span className="font-bold text-slate-900">{filteredProducts.length}টি</span> আইটেম
          </div>
        </div>

        {/* Category Filter Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
          {categories.map((cat) => {
            const isActive = selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => onSelectCategory(cat.id)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors flex items-center gap-1.5 cursor-pointer ${
                  isActive
                    ? 'bg-slate-900 text-white shadow-2xs'
                    : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
                }`}
              >
                <span>{cat.nameBn}</span>
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full ${
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
        <div className="flex items-center justify-between gap-3 text-xs">
          <label className="inline-flex items-center gap-1.5 text-slate-600 font-medium cursor-pointer">
            <input
              type="checkbox"
              checked={inStockOnly}
              onChange={(e) => setInStockOnly(e.target.checked)}
              className="w-3.5 h-3.5 rounded text-rose-600 focus:ring-rose-500"
            />
            <span>শুধুমাত্র স্টকে আছে</span>
          </label>

          <div className="flex items-center gap-1.5 bg-white px-2.5 py-1.5 rounded-xl border border-slate-200 shadow-2xs">
            <ArrowUpDown className="w-3 h-3 text-slate-400" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as FilterOptions['sortBy'])}
              className="bg-transparent text-xs font-medium text-slate-700 focus:outline-none cursor-pointer"
            >
              <option value="popular">জনপ্রিয়তা</option>
              <option value="price_low">কম দাম থেকে শুরু</option>
              <option value="price_high">বেশি দাম থেকে শুরু</option>
              <option value="rating">সর্বোচ্চ রেটিং</option>
            </select>
          </div>
        </div>

        {/* Product Cards Grid */}
        {filteredProducts.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
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
                <h3 className="text-base font-bold text-slate-900">কোনো সার্ভিস পাওয়া যায়নি</h3>
                <p className="text-xs text-slate-500">
                  অন্য কোনো কি-ওয়ার্ড বা ক্যাটেগরি নির্বাচন করে চেষ্টা করুন।
                </p>
                <button
                  onClick={() => onSelectCategory('all')}
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
