import React, { useState } from 'react';
import { ShoppingCart, Star, Eye, Share2, Check, Truck, Building2, ShoppingBag, Calendar } from 'lucide-react';
import { Product } from '../types';
import { isProductItem } from '../data/products';

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
  const isPhysicalProduct = isProductItem(product);

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
        onToast(`'${product.titleBn}' এর লিংক কপি করা হয়েছে!`);
      }
      setTimeout(() => setIsCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy share link:', err);
    }
  };

  return (
    <div
      id={`product-${product.id}`}
      className={`group bg-white rounded-2xl border transition-all duration-200 flex flex-col justify-between overflow-hidden shadow-2xs hover:shadow-md relative ${
        isPhysicalProduct
          ? 'border-slate-200/90 hover:border-emerald-300'
          : 'border-slate-200/90 hover:border-rose-300'
      }`}
    >
      {/* Top Image Container - Clean, uncluttered presentation without heavy dark bottom bars */}
      <div
        className="relative aspect-square w-full bg-slate-50 overflow-hidden cursor-pointer"
        onClick={() => onQuickView(product)}
      >
        <img
          src={product.images[0]}
          alt={product.titleBn}
          referrerPolicy="no-referrer"
          loading="lazy"
          className="w-full h-full object-cover group-hover:scale-104 transition-transform duration-300"
        />

        {/* Top-left Clean Category / Type Badge */}
        <div className="absolute top-2 left-2 z-10 flex flex-col gap-1 items-start">
          {isPhysicalProduct ? (
            <span className="inline-flex items-center gap-1 bg-emerald-600/95 text-white text-[10px] sm:text-[11px] font-bold px-2 py-0.5 rounded-full shadow-xs backdrop-blur-xs">
              <Truck className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
              <span>পণ্য</span>
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 bg-rose-600/95 text-white text-[10px] sm:text-[11px] font-bold px-2 py-0.5 rounded-full shadow-xs backdrop-blur-xs">
              <Building2 className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
              <span>সার্ভিস</span>
            </span>
          )}
        </div>

        {/* Top-right Discount / Share Badges */}
        <div className="absolute top-2 right-2 z-10 flex items-center gap-1">
          {product.discountPercent > 0 && (
            <span className="bg-rose-500 text-white text-[10px] sm:text-[11px] font-bold px-1.5 py-0.5 rounded-md shadow-xs">
              -{product.discountPercent}%
            </span>
          )}
          <button
            onClick={handleShare}
            title="লিংক কপি করুন"
            className={`w-6 h-6 sm:w-7 sm:h-7 rounded-full flex items-center justify-center transition-all cursor-pointer shadow-xs ${
              isCopied
                ? 'bg-emerald-600 text-white'
                : 'bg-white/90 hover:bg-white text-slate-700 hover:text-slate-900'
            }`}
          >
            {isCopied ? <Check className="w-3 h-3 text-white" /> : <Share2 className="w-3 h-3" />}
          </button>
        </div>

        {/* Hover Quick View Overlay (Desktop only) */}
        <div className="hidden sm:flex absolute inset-0 bg-slate-900/20 opacity-0 group-hover:opacity-100 transition-opacity items-center justify-center pointer-events-none">
          <span className="px-3 py-1.5 rounded-full bg-white/95 text-slate-900 font-bold text-xs shadow-md flex items-center gap-1.5">
            <Eye className="w-3.5 h-3.5 text-rose-600" />
            <span>বিস্তারিত দেখুন</span>
          </span>
        </div>
      </div>

      {/* Card Content - Clean, responsive typography & proper spacing */}
      <div className="p-2.5 sm:p-3.5 flex-1 flex flex-col justify-between space-y-2">
        <div>
          {/* Category & Rating Row */}
          <div className="flex items-center justify-between text-[10px] sm:text-xs text-slate-500 mb-1">
            <span className="font-medium truncate max-w-[85px] sm:max-w-[130px]">
              {product.categoryBn}
            </span>
            <div className="flex items-center text-amber-500 font-bold shrink-0">
              <Star className="w-3 h-3 fill-amber-400 text-amber-400 mr-0.5" />
              <span>{product.rating}</span>
            </div>
          </div>

          {/* Product / Service Title */}
          <h3
            onClick={() => onQuickView(product)}
            className="text-xs sm:text-sm font-bold text-slate-900 line-clamp-2 hover:text-rose-600 transition-colors cursor-pointer leading-snug min-h-[32px] sm:min-h-[40px]"
            title={product.titleBn}
          >
            {product.titleBn}
          </h3>

          {/* Clean 1-line Delivery / Location status indicator */}
          <div className="mt-1 flex items-center">
            {isPhysicalProduct ? (
              <span className="inline-flex items-center gap-1 text-[9px] sm:text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded">
                <Truck className="w-2.5 h-2.5 shrink-0" />
                <span>হোম ডেলিভারি প্রযোজ্য</span>
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 text-[9px] sm:text-[10px] font-semibold text-rose-700 bg-rose-50 px-1.5 py-0.5 rounded">
                <Building2 className="w-2.5 h-2.5 shrink-0" />
                <span>প্রতিষ্ঠানে সেবা</span>
              </span>
            )}
          </div>
        </div>

        {/* Pricing and Actions Row */}
        <div className="pt-1.5 border-t border-slate-100 space-y-2">
          {/* Price line */}
          <div className="flex items-baseline justify-between">
            <div className="flex items-baseline gap-1.5">
              <span className={`text-sm sm:text-base font-extrabold ${isPhysicalProduct ? 'text-emerald-800' : 'text-slate-900'}`}>
                ৳{product.price.toLocaleString('bn-BD')}
              </span>
              {product.originalPrice > product.price && (
                <span className="text-[10px] sm:text-xs text-slate-400 line-through">
                  ৳{product.originalPrice.toLocaleString('bn-BD')}
                </span>
              )}
            </div>
            {product.stockCount !== undefined && isPhysicalProduct && (
              <span className="text-[9px] sm:text-[10px] text-slate-400">
                স্টক: {product.stockCount}
              </span>
            )}
          </div>

          {/* Action Buttons - Single row layout without awkward wrapping */}
          {isPhysicalProduct ? (
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => onDirectOrder(product)}
                className="flex-1 py-1.5 sm:py-2 px-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-bold text-[11px] sm:text-xs transition-colors flex items-center justify-center gap-1 cursor-pointer shadow-2xs"
                title="সরাসরি অর্ডার করুন"
              >
                <ShoppingBag className="w-3 h-3 sm:w-3.5 sm:h-3.5 shrink-0" />
                <span className="truncate">অর্ডার করুন</span>
              </button>

              <button
                onClick={() => onAddToCart(product)}
                className="p-1.5 sm:p-2 rounded-xl bg-slate-100 hover:bg-slate-200 active:bg-slate-300 text-slate-700 text-xs transition-colors cursor-pointer shrink-0"
                title="কার্টে রাখুন"
                aria-label="Add to cart"
              >
                <ShoppingCart className="w-3.5 h-3.5 text-slate-600" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => onDirectOrder(product)}
                className="flex-1 py-1.5 sm:py-2 px-2 rounded-xl bg-rose-600 hover:bg-rose-700 active:bg-rose-800 text-white font-bold text-[11px] sm:text-xs transition-colors flex items-center justify-center gap-1 cursor-pointer shadow-2xs"
                title="সিরিয়াল বুকিং দিন"
              >
                <Calendar className="w-3 h-3 sm:w-3.5 sm:h-3.5 shrink-0" />
                <span className="truncate">সিরিয়াল বুকিং</span>
              </button>

              <button
                onClick={() => onQuickView(product)}
                className="p-1.5 sm:p-2 rounded-xl bg-slate-100 hover:bg-slate-200 active:bg-slate-300 text-slate-700 text-xs transition-colors cursor-pointer shrink-0"
                title="বিস্তারিত বিবরণ দেখুন"
                aria-label="View service details"
              >
                <Eye className="w-3.5 h-3.5 text-slate-600" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
