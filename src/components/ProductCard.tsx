import React, { useState } from 'react';
import { ShoppingCart, Star, Eye, CheckCircle2, Flame, Share2, Check } from 'lucide-react';
import { Product } from '../types';

interface ProductCardProps {
  product: Product;
  onQuickView: (product: Product) => void;
  onAddToCart: (product: Product) => void;
  onDirectOrder: (product: Product) => void;
  onToast?: (msg: string) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  onQuickView,
  onAddToCart,
  onDirectOrder,
  onToast,
}) => {
  const [isCopied, setIsCopied] = useState(false);

  const handleShare = async (e: React.MouseEvent) => {
    e.stopPropagation();
    const shareUrl = `${window.location.origin}${window.location.pathname}?product=${product.id}`;

    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(shareUrl);
      } else {
        const textArea = document.createElement('textarea');
        textArea.value = shareUrl;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
      }
      setIsCopied(true);
      if (onToast) {
        onToast(`'${product.titleBn}' সার্ভিসটির লিংক কপি করা হয়েছে!`);
      }
      setTimeout(() => setIsCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy share link:', err);
    }
  };

  return (
    <div id={`product-${product.id}`} className="group relative bg-white rounded-2xl border border-slate-200/90 shadow-xs hover:shadow-xl transition-all duration-300 flex flex-col overflow-hidden hover:-translate-y-1">
      {/* Badges Overlay */}
      <div className="absolute top-2.5 left-2.5 z-10 flex flex-col gap-1.5 items-start">
        {product.discountPercent > 0 && (
          <span className="bg-red-500 text-white text-[11px] font-bold px-2 py-0.5 rounded-md shadow-xs">
            {product.discountPercent}% ছাড়
          </span>
        )}
        {product.isBestSeller && (
          <span className="bg-amber-500 text-slate-950 text-[10px] font-extrabold px-2 py-0.5 rounded-md shadow-xs flex items-center gap-1">
            <Flame className="w-3 h-3 fill-slate-950" /> বেস্ট সেলার
          </span>
        )}
      </div>

      {/* Top Right Share Icon Button */}
      <button
        onClick={handleShare}
        title="লিংক কপি করে শেয়ার করুন"
        className={`absolute top-2.5 right-2.5 z-20 w-8 h-8 rounded-full flex items-center justify-center shadow-md transition-all cursor-pointer ${
          isCopied
            ? 'bg-emerald-600 text-white scale-110'
            : 'bg-white/90 hover:bg-white text-slate-700 hover:text-rose-600 hover:scale-110'
        }`}
      >
        {isCopied ? <Check className="w-4 h-4" /> : <Share2 className="w-4 h-4" />}
      </button>

      {/* Image Thumbnail with Quick View Hover Button */}
      <div className="relative aspect-square w-full bg-slate-100 overflow-hidden cursor-pointer" onClick={() => onQuickView(product)}>
        <img
          src={product.images[0]}
          alt={product.titleBn}
          referrerPolicy="no-referrer"
          loading="lazy"
          className="w-full h-full object-cover group-hover:scale-108 transition-transform duration-500"
        />

        {/* Hover Quick View Trigger Overlay */}
        <div className="absolute inset-0 bg-slate-900/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onQuickView(product);
            }}
            className="px-3.5 py-1.5 rounded-full bg-white/90 hover:bg-white text-slate-800 font-semibold text-xs shadow-md transition-transform transform scale-90 group-hover:scale-100 flex items-center gap-1.5 cursor-pointer"
          >
            <Eye className="w-3.5 h-3.5 text-emerald-600" />
            <span>বিস্তারিত দেখুন</span>
          </button>
        </div>
      </div>

      {/* Product Content Body */}
      <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
        <div>
          {/* Category Tag & Stock Status */}
          <div className="flex items-center justify-between text-[11px] text-slate-500 font-medium mb-1">
            <span>{product.categoryBn}</span>
            {product.stockCount <= 0 ? (
              <span className="text-red-700 font-extrabold text-[10px] bg-red-100 px-2 py-0.5 rounded-md border border-red-200">
                স্টক শেষ
              </span>
            ) : product.stockCount <= 10 ? (
              <span className="text-amber-700 font-extrabold text-[10px] bg-amber-100 px-2 py-0.5 rounded-md border border-amber-200">
                সীমিত স্টক ({product.stockCount}টি)
              </span>
            ) : (
              <span className="text-emerald-700 font-bold text-[10px] bg-emerald-50 px-2 py-0.5 rounded-md">
                স্টকে আছে ({product.stockCount}টি)
              </span>
            )}
          </div>

          {/* Product Title in Bengali */}
          <h3
            onClick={() => onQuickView(product)}
            className="text-sm sm:text-base font-bold text-slate-900 line-clamp-2 hover:text-emerald-600 transition-colors cursor-pointer leading-snug"
            title={product.titleBn}
          >
            {product.titleBn}
          </h3>

          {/* Rating */}
          <div className="flex items-center gap-1.5 mt-1.5">
            <div className="flex items-center text-amber-400">
              <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
              <span className="text-xs font-bold text-slate-800 ml-1">{product.rating}</span>
            </div>
            <span className="text-[11px] text-slate-400">({product.reviewCount} রিভিউ)</span>
          </div>
        </div>

        {/* Pricing Block */}
        <div>
          <div className="flex items-baseline gap-2">
            <span className="text-lg sm:text-xl font-extrabold text-rose-700">
              ৳{product.price.toLocaleString('bn-BD')}
            </span>
            {product.originalPrice > product.price && (
              <span className="text-xs sm:text-sm text-slate-400 line-through">
                ৳{product.originalPrice.toLocaleString('bn-BD')}
              </span>
            )}
          </div>

          <div className="mt-1 flex items-center gap-1 text-[11px] text-rose-800 font-semibold">
            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
            <span>তনু বিউটি পার্লার (CSA লেজার শাখা)</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="pt-2 grid grid-cols-2 gap-2">
          <button
            onClick={() => onAddToCart(product)}
            className="w-full py-2 px-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold text-xs transition-colors flex items-center justify-center gap-1 cursor-pointer"
          >
            <ShoppingCart className="w-3.5 h-3.5 text-rose-600" />
            <span>কার্টে রাখুন</span>
          </button>

          <button
            onClick={() => onDirectOrder(product)}
            className="w-full py-2 px-2.5 rounded-xl bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-700 hover:to-pink-700 text-white font-bold text-xs shadow-xs transition-colors flex items-center justify-center gap-1 cursor-pointer"
          >
            <span>বুকিং করুন</span>
          </button>
        </div>
      </div>
    </div>
  );
};
