import React, { useState } from 'react';
import { ShoppingCart, Star, Eye, Share2, Check } from 'lucide-react';
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
      className="group bg-white rounded-2xl border border-slate-200/90 shadow-2xs hover:shadow-md transition-all duration-200 flex flex-col overflow-hidden"
    >
      {/* Top Image Container */}
      <div
        className="relative aspect-square w-full bg-slate-100 overflow-hidden cursor-pointer"
        onClick={() => onQuickView(product)}
      >
        <img
          src={product.images[0]}
          alt={product.titleBn}
          referrerPolicy="no-referrer"
          loading="lazy"
          className="w-full h-full object-cover group-hover:scale-103 transition-transform duration-300"
        />

        {/* Discount Badge */}
        {product.discountPercent > 0 && (
          <span className="absolute top-2.5 left-2.5 bg-rose-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-md shadow-xs">
            {product.discountPercent}% ছাড়
          </span>
        )}

        {/* Share Button */}
        <button
          onClick={handleShare}
          title="লিংক কপি করুন"
          className={`absolute top-2.5 right-2.5 w-7 h-7 rounded-full flex items-center justify-center transition-all cursor-pointer ${
            isCopied
              ? 'bg-emerald-600 text-white'
              : 'bg-white/80 hover:bg-white text-slate-600 hover:text-slate-900 shadow-xs'
          }`}
        >
          {isCopied ? <Check className="w-3.5 h-3.5" /> : <Share2 className="w-3.5 h-3.5" />}
        </button>

        {/* Quick View Button on Hover */}
        <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onQuickView(product);
            }}
            className="px-3.5 py-1.5 rounded-full bg-white text-slate-900 font-semibold text-xs shadow-md flex items-center gap-1.5 cursor-pointer"
          >
            <Eye className="w-3.5 h-3.5 text-rose-600" />
            <span>বিস্তারিত দেখুন</span>
          </button>
        </div>
      </div>

      {/* Content Area */}
      <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
        <div>
          <div className="flex items-center justify-between text-[11px] text-slate-500 mb-1">
            <span>{product.categoryBn}</span>
            <div className="flex items-center text-amber-500 font-semibold">
              <Star className="w-3 h-3 fill-amber-400 text-amber-400 mr-0.5" />
              <span>{product.rating}</span>
            </div>
          </div>

          <h3
            onClick={() => onQuickView(product)}
            className="text-sm font-bold text-slate-900 line-clamp-2 hover:text-rose-600 transition-colors cursor-pointer leading-snug"
            title={product.titleBn}
          >
            {product.titleBn}
          </h3>
        </div>

        {/* Price & Actions */}
        <div className="space-y-3 pt-1">
          <div className="flex items-baseline gap-2">
            <span className="text-base sm:text-lg font-extrabold text-slate-900">
              ৳{product.price.toLocaleString('bn-BD')}
            </span>
            {product.originalPrice > product.price && (
              <span className="text-xs text-slate-400 line-through">
                ৳{product.originalPrice.toLocaleString('bn-BD')}
              </span>
            )}
          </div>

          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => onAddToCart(product)}
              className="py-2 px-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-medium text-xs transition-colors flex items-center justify-center gap-1 cursor-pointer"
            >
              <ShoppingCart className="w-3.5 h-3.5 text-rose-600" />
              <span>কার্টে রাখুন</span>
            </button>

            <button
              onClick={() => onDirectOrder(product)}
              className="py-2 px-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs transition-colors flex items-center justify-center cursor-pointer shadow-2xs"
            >
              বুকিং করুন
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
