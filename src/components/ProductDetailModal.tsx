import React, { useState } from 'react';
import { X, Star, ShoppingCart, ShieldCheck, Truck, RotateCcw, Check, Plus, Minus, PhoneCall, Share2 } from 'lucide-react';
import { Product } from '../types';

interface ProductDetailModalProps {
  product: Product | null;
  onClose: () => void;
  onAddToCart: (product: Product, quantity: number, color?: string, size?: string) => void;
  onDirectOrder: (product: Product, quantity: number, color?: string, size?: string) => void;
  onToast?: (msg: string) => void;
}

export const ProductDetailModal: React.FC<ProductDetailModalProps> = ({
  product,
  onClose,
  onAddToCart,
  onDirectOrder,
  onToast,
}) => {
  if (!product) return null;

  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [selectedColor, setSelectedColor] = useState<string | undefined>(
    product.colors && product.colors.length > 0 ? product.colors[0] : undefined
  );
  const [selectedSize, setSelectedSize] = useState<string | undefined>(
    product.sizes && product.sizes.length > 0 ? product.sizes[0] : undefined
  );
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState<'desc' | 'specs' | 'delivery'>('desc');
  const [isCopied, setIsCopied] = useState(false);

  const handleShareModal = async () => {
    if (!product) return;
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
        onToast(`'${product.titleBn}' সার্ভিসটির শেয়ার লিংক কপি করা হয়েছে!`);
      }
      setTimeout(() => setIsCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy share link:', err);
    }
  };

  const handleDecreaseQty = () => {
    if (quantity > 1) setQuantity(quantity - 1);
  };

  const handleIncreaseQty = () => {
    if (quantity < product.stockCount) setQuantity(quantity + 1);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200">
      <div className="relative bg-white rounded-3xl shadow-2xl max-w-3xl w-full overflow-hidden border border-slate-200 my-auto max-h-[92vh] flex flex-col">
        
        {/* Top Header & Close Button */}
        <div className="sticky top-0 z-20 bg-white/95 backdrop-blur-md px-5 py-3 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>১০০% প্রিমিয়াম ও অরিজিনাল পণ্য</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleShareModal}
              title="লিংক কপি করে শেয়ার করুন"
              className={`px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer border ${
                isCopied
                  ? 'bg-emerald-600 text-white border-emerald-600'
                  : 'bg-rose-50 hover:bg-rose-100 text-rose-700 border-rose-200'
              }`}
            >
              {isCopied ? <Check className="w-3.5 h-3.5" /> : <Share2 className="w-3.5 h-3.5 text-rose-600" />}
              <span>{isCopied ? 'কপি হয়েছে' : 'শেয়ার লিংক'}</span>
            </button>

            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center transition-colors cursor-pointer"
              aria-label="Close modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Scrollable Main Content */}
        <div className="overflow-y-auto p-5 sm:p-6 space-y-6 flex-1 no-scrollbar">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
            
            {/* Left Image Gallery Column */}
            <div className="md:col-span-5 space-y-3">
              <div className="aspect-square rounded-2xl bg-slate-100 border border-slate-200 overflow-hidden relative">
                <img
                  src={product.images[selectedImageIndex] || product.images[0]}
                  alt={product.titleBn}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover"
                />
                {product.discountPercent > 0 && (
                  <span className="absolute top-3 left-3 bg-red-500 text-white font-bold text-xs px-2.5 py-1 rounded-lg shadow-sm">
                    {product.discountPercent}% ছাড়
                  </span>
                )}
              </div>

              {/* Thumbnails */}
              {product.images.length > 1 && (
                <div className="flex items-center gap-2 overflow-x-auto pb-1">
                  {product.images.map((img, idx) => (
                    <button
                      key={idx}
                      onClick={() => setSelectedImageIndex(idx)}
                      className={`w-16 h-16 rounded-xl border-2 overflow-hidden transition-all flex-shrink-0 cursor-pointer ${
                        selectedImageIndex === idx ? 'border-emerald-600 scale-95 shadow-sm' : 'border-slate-200 opacity-70 hover:opacity-100'
                      }`}
                    >
                      <img src={img} alt="Thumbnail" referrerPolicy="no-referrer" className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}

              {/* Trust Callout */}
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200/80 text-xs space-y-1.5 text-slate-600">
                <div className="flex items-center gap-2 text-slate-800 font-semibold">
                  <Truck className="w-4 h-4 text-emerald-600" />
                  <span>ক্যাশ অন ডেলিভারি সার্ভিস</span>
                </div>
                <p className="text-[11px] text-slate-500">
                  পণ্য হাতে পেয়ে পুরোপুরি চেক করে ডেলিভারি ম্যানকে টাকা দিন। অগ্রিম ১ টাকাও দিতে হবে না।
                </p>
              </div>
            </div>

            {/* Right Details Column */}
            <div className="md:col-span-7 space-y-4">
              <div>
                <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                  {product.categoryBn}
                </span>
                <h2 className="text-xl sm:text-2xl font-bold text-slate-900 mt-1 leading-snug">
                  {product.titleBn}
                </h2>

                <div className="flex items-center gap-2 mt-2">
                  <div className="flex items-center text-amber-400 text-xs font-bold bg-amber-50 px-2 py-0.5 rounded">
                    <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400 mr-1" />
                    <span>{product.rating}</span>
                  </div>
                  <span className="text-xs text-slate-500">({product.reviewCount} কাস্টমার রিভিউ)</span>
                  <span className="text-slate-300">•</span>
                  {product.stockCount <= 0 ? (
                    <span className="text-xs text-red-700 font-extrabold bg-red-100 px-2.5 py-0.5 rounded border border-red-200">
                      স্টক শেষ (Out of Stock)
                    </span>
                  ) : product.stockCount <= 10 ? (
                    <span className="text-xs text-amber-700 font-extrabold bg-amber-100 px-2.5 py-0.5 rounded border border-amber-200">
                      সীমিত স্টক ({product.stockCount}টি)
                    </span>
                  ) : (
                    <span className="text-xs text-emerald-600 font-semibold bg-emerald-50 px-2.5 py-0.5 rounded">
                      স্টকে আছে ({product.stockCount}টি)
                    </span>
                  )}
                </div>
              </div>

              {/* Pricing */}
              <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 flex items-center justify-between">
                <div>
                  <div className="text-[11px] text-slate-500 font-medium">অফার মূল্য (ক্যাশ অন ডেলিভারি)</div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-2xl font-extrabold text-slate-900">
                      ৳{product.price.toLocaleString('bn-BD')}
                    </span>
                    {product.originalPrice > product.price && (
                      <span className="text-sm text-slate-400 line-through">
                        ৳{product.originalPrice.toLocaleString('bn-BD')}
                      </span>
                    )}
                  </div>
                </div>

                {product.discountPercent > 0 && (
                  <div className="text-right">
                    <span className="text-xs font-bold text-red-600 bg-red-50 px-2.5 py-1 rounded-lg border border-red-100">
                      আপনার সঞ্চয় ৳{(product.originalPrice - product.price).toLocaleString('bn-BD')}
                    </span>
                  </div>
                )}
              </div>

              {/* Color Selector */}
              {product.colors && product.colors.length > 0 && (
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-800">কালার সিলেক্ট করুন:</label>
                  <div className="flex flex-wrap gap-2">
                    {product.colors.map((clr) => (
                      <button
                        key={clr}
                        onClick={() => setSelectedColor(clr)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                          selectedColor === clr
                            ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                            : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                        }`}
                      >
                        {clr}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Quantity Selector */}
              <div className="flex items-center gap-4 pt-1">
                <span className="text-xs font-bold text-slate-800">পরিমাণ:</span>
                <div className="flex items-center border border-slate-300 rounded-xl bg-slate-50 overflow-hidden">
                  <button
                    onClick={handleDecreaseQty}
                    className="p-2 text-slate-600 hover:bg-slate-200 transition-colors cursor-pointer"
                    aria-label="Decrease quantity"
                  >
                    <Minus className="w-3.5 h-3.5" />
                  </button>
                  <span className="px-4 text-sm font-bold text-slate-900 min-w-[2rem] text-center">
                    {quantity}
                  </span>
                  <button
                    onClick={handleIncreaseQty}
                    className="p-2 text-slate-600 hover:bg-slate-200 transition-colors cursor-pointer"
                    aria-label="Increase quantity"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>

                <span className="text-xs text-slate-500 font-medium">
                  মোট: <b className="text-slate-900">৳{(product.price * quantity).toLocaleString('bn-BD')}</b>
                </span>
              </div>

              {/* Action Buttons */}
              <div className="pt-2 grid grid-cols-1 sm:grid-cols-2 gap-3">
                <button
                  disabled={product.stockCount <= 0}
                  onClick={() => onDirectOrder(product, quantity, selectedColor, selectedSize)}
                  className={`py-3 px-4 rounded-xl font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer ${
                    product.stockCount <= 0
                      ? 'bg-slate-300 text-slate-500 cursor-not-allowed shadow-none'
                      : 'bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white'
                  }`}
                >
                  <span>{product.stockCount <= 0 ? 'স্টক শেষ' : 'এখনই বুকিং করুন'}</span>
                </button>

                <button
                  disabled={product.stockCount <= 0}
                  onClick={() => onAddToCart(product, quantity, selectedColor, selectedSize)}
                  className={`py-3 px-4 rounded-xl font-bold text-sm transition-colors flex items-center justify-center gap-2 cursor-pointer ${
                    product.stockCount <= 0
                      ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                      : 'bg-slate-100 hover:bg-slate-200 text-slate-900'
                  }`}
                >
                  <ShoppingCart className="w-4 h-4 text-slate-700" />
                  <span>কার্টে যোগ করুন</span>
                </button>
              </div>

            </div>

          </div>

          {/* Specification / Description Tabs */}
          <div className="pt-4 border-t border-slate-200 space-y-3">
            <div className="flex border-b border-slate-200 text-xs sm:text-sm font-semibold text-slate-600">
              <button
                onClick={() => setActiveTab('desc')}
                className={`py-2 px-4 border-b-2 transition-colors cursor-pointer ${
                  activeTab === 'desc' ? 'border-emerald-600 text-emerald-700 font-bold' : 'border-transparent hover:text-slate-900'
                }`}
              >
                পণ্য বৈশিষ্ট্য
              </button>
              <button
                onClick={() => setActiveTab('specs')}
                className={`py-2 px-4 border-b-2 transition-colors cursor-pointer ${
                  activeTab === 'specs' ? 'border-emerald-600 text-emerald-700 font-bold' : 'border-transparent hover:text-slate-900'
                }`}
              >
                স্পেসিফিকেশন
              </button>
              <button
                onClick={() => setActiveTab('delivery')}
                className={`py-2 px-4 border-b-2 transition-colors cursor-pointer ${
                  activeTab === 'delivery' ? 'border-emerald-600 text-emerald-700 font-bold' : 'border-transparent hover:text-slate-900'
                }`}
              >
                ডেলিভারি ও ওয়ারেন্টি
              </button>
            </div>

            {/* Tab 1: Key Features & Description */}
            {activeTab === 'desc' && (
              <div className="space-y-3 text-xs sm:text-sm text-slate-700 leading-relaxed">
                <p>{product.descriptionBn}</p>
                <div className="space-y-1.5 pt-2">
                  <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider">প্রধান সুবিধাসমূহ:</h4>
                  <ul className="space-y-1.5">
                    {product.keyFeaturesBn.map((feat, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                        <span>{feat}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}

            {/* Tab 2: Specs Table */}
            {activeTab === 'specs' && (
              <div className="border border-slate-200 rounded-xl overflow-hidden">
                <table className="w-full text-xs sm:text-sm text-left">
                  <tbody>
                    {Object.entries(product.specs).map(([key, val], idx) => (
                      <tr key={key} className={idx % 2 === 0 ? 'bg-slate-50' : 'bg-white'}>
                        <td className="py-2.5 px-4 font-bold text-slate-700 w-1/3 border-r border-slate-200">
                          {key}
                        </td>
                        <td className="py-2.5 px-4 text-slate-800">{val}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Tab 3: Delivery Info */}
            {activeTab === 'delivery' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs sm:text-sm">
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                  <h5 className="font-bold text-slate-900 flex items-center gap-1.5">
                    <Truck className="w-4 h-4 text-emerald-600" /> ডেলিভারি সময়সূচি
                  </h5>
                  <p className="text-slate-600">{product.deliveryDaysBn}</p>
                  <p className="text-[11px] text-slate-500">চার্জ: ঢাকা সিটি ৳৬০, ঢাকার বাইরে ৳১২০</p>
                </div>

                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                  <h5 className="font-bold text-slate-900 flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-teal-600" /> ওয়ারেন্টি ও গ্যারান্টি
                  </h5>
                  <p className="text-slate-600">{product.warrantyBn || '৭ দিনের হ্যাসল-ফ্রি রিপ্লেসমেন্ট গ্যারান্টি'}</p>
                  <p className="text-[11px] text-slate-500">ডিফেক্টিভ পণ্য পেলে সাথে সাথে পরিবর্তন সুবিধা</p>
                </div>
              </div>
            )}
          </div>

        </div>

      </div>
    </div>
  );
};
