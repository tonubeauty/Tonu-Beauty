import React, { useState } from 'react';
import {
  X,
  Star,
  ShoppingCart,
  ShieldCheck,
  Truck,
  RotateCcw,
  Check,
  Plus,
  Minus,
  PhoneCall,
  Share2,
  Building2,
  Calendar,
  AlertTriangle,
  ShoppingBag
} from 'lucide-react';
import { Product } from '../types';
import { isProductItem } from '../data/products';

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
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [selectedColor, setSelectedColor] = useState<string | undefined>(
    product?.colors && product.colors.length > 0 ? product.colors[0] : undefined
  );
  const [selectedSize, setSelectedSize] = useState<string | undefined>(
    product?.sizes && product.sizes.length > 0 ? product.sizes[0] : undefined
  );
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState<'desc' | 'specs' | 'delivery'>('desc');
  const [isCopied, setIsCopied] = useState(false);

  if (!product) return null;

  const isPhysicalProduct = isProductItem(product);

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
        onToast(`'${product.titleBn}' এর শেয়ার লিংক কপি করা হয়েছে!`);
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
          <div className="flex items-center gap-2 text-xs font-semibold">
            {isPhysicalProduct ? (
              <span className="flex items-center gap-1.5 text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                <Truck className="w-3.5 h-3.5 text-emerald-600" />
                <span>🛍️ পণ্য • অনলাইন/অফলাইনে ডেলিভারিযোগ্য</span>
              </span>
            ) : (
              <span className="flex items-center gap-1.5 text-rose-700 bg-rose-50 px-2.5 py-1 rounded-full border border-rose-200">
                <Building2 className="w-3.5 h-3.5 text-rose-600" />
                <span>🏢 সার্ভিস • প্রতিষ্ঠানে এসে সেবা নিতে হবে</span>
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleShareModal}
              title="লিংক কপি করে শেয়ার করুন"
              className={`px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer border ${
                isCopied
                  ? 'bg-emerald-600 text-white border-emerald-600'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-200'
              }`}
            >
              {isCopied ? <Check className="w-3.5 h-3.5" /> : <Share2 className="w-3.5 h-3.5 text-slate-600" />}
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
                  <span className="absolute top-3 left-3 bg-rose-600 text-white font-bold text-xs px-2.5 py-1 rounded-lg shadow-sm">
                    {product.discountPercent}% ছাড়
                  </span>
                )}

                {/* Bottom Overlay Label */}
                <div
                  className={`absolute bottom-2 left-2 right-2 backdrop-blur-xs text-[10px] font-bold px-2 py-1 rounded-lg text-center truncate ${
                    isPhysicalProduct
                      ? 'bg-emerald-950/85 text-emerald-200'
                      : 'bg-rose-950/85 text-rose-200'
                  }`}
                >
                  {isPhysicalProduct ? 'ক্যাশ অন হোম ডেলিভারি প্রযোজ্য' : '🚫 হোম ডেলিভারি নেই • প্রতিষ্ঠানে সেবা গ্রহণ'}
                </div>
              </div>

              {/* Thumbnails */}
              {product.images.length > 1 && (
                <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
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
                  {isPhysicalProduct ? (
                    <>
                      <Truck className="w-4 h-4 text-emerald-600" />
                      <span>ক্যাশ অন ডেলিভারি সার্ভিস</span>
                    </>
                  ) : (
                    <>
                      <Building2 className="w-4 h-4 text-rose-600" />
                      <span>ইন-পার্লার লেজার ও বিউটি সেবা</span>
                    </>
                  )}
                </div>
                <p className="text-[11px] text-slate-500">
                  {isPhysicalProduct
                    ? 'পণ্য হাতে পেয়ে পুরোপুরি চেক করে ডেলিভারি ম্যানকে টাকা দিন। অগ্রিম পেমেন্ট নেই।'
                    : 'জার্মান প্রযুক্তির সেবা নিতে সরাসরি প্রতিষ্ঠানে (নাটিয়াপাড়া বাজার, টাঙ্গাইল) আসতে হবে।'}
                </p>
              </div>
            </div>

            {/* Right Details Column */}
            <div className="md:col-span-7 space-y-4">
              <div>
                <span className={`text-xs font-semibold px-2 py-0.5 rounded ${
                  isPhysicalProduct ? 'text-emerald-700 bg-emerald-50 border border-emerald-200' : 'text-rose-700 bg-rose-50 border border-rose-200'
                }`}>
                  {product.categoryBn}
                </span>
                <h2 className="text-xl sm:text-2xl font-bold text-slate-900 mt-1 leading-snug">
                  {product.titleBn}
                </h2>

                <div className="flex items-center gap-2 mt-2">
                  <div className="flex items-center text-amber-500 text-xs font-bold bg-amber-50 px-2 py-0.5 rounded">
                    <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400 mr-1" />
                    <span>{product.rating}</span>
                  </div>
                  <span className="text-xs text-slate-500">({product.reviewCount} কাস্টমার রিভিউ)</span>
                  <span className="text-slate-300">•</span>
                  <span className="text-xs text-emerald-600 font-semibold bg-emerald-50 px-2.5 py-0.5 rounded">
                    {isPhysicalProduct ? `স্টক: ${product.stockCount}টি` : 'সিরিয়াল বুকিং সক্রিয়'}
                  </span>
                </div>
              </div>

              {/* Pricing */}
              <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 flex items-center justify-between">
                <div>
                  <div className="text-[11px] text-slate-500 font-medium">
                    {isPhysicalProduct ? 'অফার মূল্য (ক্যাশ অন ডেলিভারি)' : 'সার্ভিস ফি (প্রতিষ্ঠানে প্রদেয়)'}
                  </div>
                  <div className="flex items-baseline gap-2">
                    <span className={`text-2xl font-extrabold ${isPhysicalProduct ? 'text-emerald-700' : 'text-slate-900'}`}>
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
                    <span className="text-xs font-bold text-rose-600 bg-rose-50 px-2.5 py-1 rounded-lg border border-rose-100">
                      ৳{(product.originalPrice - product.price).toLocaleString('bn-BD')} ছাড়
                    </span>
                  </div>
                )}
              </div>

              {/* Options selection if present */}
              {product.colors && product.colors.length > 0 && (
                <div className="space-y-1.5">
                  <span className="text-xs font-semibold text-slate-700">অপশন নির্বাচন করুন:</span>
                  <div className="flex flex-wrap gap-2">
                    {product.colors.map((color) => (
                      <button
                        key={color}
                        onClick={() => setSelectedColor(color)}
                        className={`px-3 py-1 text-xs rounded-xl border transition-all cursor-pointer ${
                          selectedColor === color
                            ? 'bg-slate-900 text-white border-slate-900 shadow-2xs'
                            : 'bg-white text-slate-700 border-slate-200 hover:border-slate-400'
                        }`}
                      >
                        {color}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Quantity */}
              <div className="flex items-center gap-3">
                <span className="text-xs font-semibold text-slate-700">
                  {isPhysicalProduct ? 'পরিমাণ:' : 'সংখ্যা:'}
                </span>
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
                    isPhysicalProduct
                      ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                      : 'bg-rose-600 hover:bg-rose-700 text-white'
                  }`}
                >
                  {isPhysicalProduct ? (
                    <>
                      <ShoppingBag className="w-4 h-4" />
                      <span>এখনই অর্ডার করুন</span>
                    </>
                  ) : (
                    <>
                      <Calendar className="w-4 h-4" />
                      <span>সিরিয়াল বুকিং দিন</span>
                    </>
                  )}
                </button>

                <button
                  disabled={product.stockCount <= 0}
                  onClick={() => onAddToCart(product, quantity, selectedColor, selectedSize)}
                  className="py-3 px-4 rounded-xl font-bold text-sm transition-colors flex items-center justify-center gap-2 cursor-pointer bg-slate-100 hover:bg-slate-200 text-slate-900"
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
                  activeTab === 'desc'
                    ? isPhysicalProduct
                      ? 'border-emerald-600 text-emerald-700 font-bold'
                      : 'border-rose-600 text-rose-700 font-bold'
                    : 'border-transparent hover:text-slate-900'
                }`}
              >
                বিবরণ ও সুবিধা
              </button>
              <button
                onClick={() => setActiveTab('specs')}
                className={`py-2 px-4 border-b-2 transition-colors cursor-pointer ${
                  activeTab === 'specs'
                    ? isPhysicalProduct
                      ? 'border-emerald-600 text-emerald-700 font-bold'
                      : 'border-rose-600 text-rose-700 font-bold'
                    : 'border-transparent hover:text-slate-900'
                }`}
              >
                স্পেসিফিকেশন
              </button>
              <button
                onClick={() => setActiveTab('delivery')}
                className={`py-2 px-4 border-b-2 transition-colors cursor-pointer ${
                  activeTab === 'delivery'
                    ? isPhysicalProduct
                      ? 'border-emerald-600 text-emerald-700 font-bold'
                      : 'border-rose-600 text-rose-700 font-bold'
                    : 'border-transparent hover:text-slate-900'
                }`}
              >
                {isPhysicalProduct ? 'ডেলিভারি সুবিধা' : 'সার্ভিস স্থান ও নীতি'}
              </button>
            </div>

            {/* Tab 1: Description */}
            {activeTab === 'desc' && (
              <div className="space-y-3 text-xs sm:text-sm text-slate-700 leading-relaxed">
                <p>{product.descriptionBn}</p>
                <div className="space-y-1.5 pt-2">
                  <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider">
                    {isPhysicalProduct ? 'পণ্যের গুণাগুণ:' : 'সার্ভিসের বৈশিষ্ট্য:'}
                  </h4>
                  <ul className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 text-xs">
                    {product.keyFeaturesBn.map((feat, i) => (
                      <li key={i} className="flex items-center gap-2 bg-slate-50 p-2 rounded-lg border border-slate-100">
                        <span className="text-emerald-600 font-bold">✓</span>
                        <span>{feat}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}

            {/* Tab 2: Specs */}
            {activeTab === 'specs' && (
              <div className="border border-slate-200 rounded-xl overflow-hidden text-xs">
                <table className="w-full text-left">
                  <tbody>
                    {Object.entries(product.specs).map(([key, val], idx) => (
                      <tr key={key} className={idx % 2 === 0 ? 'bg-slate-50' : 'bg-white'}>
                        <td className="py-2.5 px-4 font-semibold text-slate-600 w-1/3 border-r border-slate-200">
                          {key}
                        </td>
                        <td className="py-2.5 px-4 text-slate-900">{val}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Tab 3: Delivery */}
            {activeTab === 'delivery' && (
              <div className="space-y-2.5 text-xs text-slate-700">
                {isPhysicalProduct ? (
                  <>
                    <p><b>অনলাইন/অফলাইন বিক্রয়:</b> সারাদেশে ২-৩ দিনের মধ্যে ক্যাশ অন হোম ডেলিভারি অথবা পার্লারের শপ থেকে সরাসরি সংগ্রহ।</p>
                    <p><b>কোয়ালিটি:</b> {product.warrantyBn || '১০০% অরিজিনাল অথেনটিক প্রোডাক্ট গ্যারান্টি'}</p>
                    <p className="text-emerald-800 bg-emerald-50 p-2.5 rounded-lg border border-emerald-100">
                      {product.deliveryNoticeBn || 'পণ্য হাতে পেয়ে পুরোপুরি যাচাই করে মূল্য পরিশোধ করতে পারবেন।'}
                    </p>
                  </>
                ) : (
                  <>
                    <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-amber-900">
                      <b>🚫 হোম ডেলিভারি হবে না:</b> প্রোডাক্ট ছাড়া বাকি কোনো সার্ভিস হোম ডেলিভারি হবে না। প্রতিষ্ঠানে এসে সেবা নিতে হবে।
                    </div>
                    <p><b>প্রতিষ্ঠানের ঠিকানা:</b> ডুবাইল, সেহড়াতৈল রোড, নাটিয়াপাড়া বাজার, দেলদুয়ার, টাঙ্গাইল</p>
                    <p><b>সিরিয়াল ও হেল্পলাইন:</b> 01302383795</p>
                  </>
                )}
              </div>
            )}
          </div>

        </div>

      </div>
    </div>
  );
};
