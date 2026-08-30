import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft, 
  Star, 
  ShoppingCart, 
  ShieldCheck, 
  Truck, 
  Check, 
  Plus, 
  Minus, 
  PhoneCall, 
  Share2, 
  Home, 
  Tag, 
  Sparkles,
  Calendar,
  Clock,
  Heart,
  ChevronRight
} from 'lucide-react';
import { Product } from '../types';

interface ProductDetailPageProps {
  product: Product;
  onBack: () => void;
  onAddToCart: (product: Product, quantity: number, color?: string, size?: string) => void;
  onDirectOrder: (product: Product, quantity: number, color?: string, size?: string) => void;
  onOpenAppointment?: (serviceName?: string) => void;
  onToast?: (msg: string) => void;
}

export const ProductDetailPage: React.FC<ProductDetailPageProps> = ({
  product,
  onBack,
  onAddToCart,
  onDirectOrder,
  onOpenAppointment,
  onToast,
}) => {
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

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [product.id]);

  const handleShare = async () => {
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
        onToast(`'${product.titleBn}' এর শেয়ার লিংক কপি হয়েছে!`);
      }
      setTimeout(() => setIsCopied(false), 2500);
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
    <div id="product-full-page-view" className="w-full bg-slate-50 min-h-screen py-4 sm:py-8 animate-in fade-in duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        
        {/* Navigation Breadcrumbs & Back Button Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-3.5 sm:p-4 rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center gap-2 text-xs sm:text-sm text-slate-500 overflow-x-auto no-scrollbar py-0.5">
            <button
              onClick={onBack}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold transition-colors cursor-pointer shrink-0"
              title="পূর্বের পেজে ফিরে যান"
            >
              <ArrowLeft className="w-4 h-4 text-rose-600" />
              <span>পেছনে যান (Back)</span>
            </button>
            <ChevronRight className="w-4 h-4 text-slate-300 shrink-0" />
            <button
              onClick={onBack}
              className="hover:text-rose-600 transition-colors shrink-0 flex items-center gap-1"
            >
              <Home className="w-3.5 h-3.5" />
              <span>হোম</span>
            </button>
            <ChevronRight className="w-4 h-4 text-slate-300 shrink-0" />
            <span className="text-slate-700 font-medium shrink-0">{product.categoryBn}</span>
            <ChevronRight className="w-4 h-4 text-slate-300 shrink-0" />
            <span className="text-slate-900 font-bold truncate max-w-[150px] sm:max-w-xs">{product.titleBn}</span>
          </div>

          <button
            onClick={handleShare}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer border shrink-0 ${
              isCopied
                ? 'bg-emerald-600 text-white border-emerald-600'
                : 'bg-rose-50 hover:bg-rose-100 text-rose-700 border-rose-200 shadow-xs'
            }`}
          >
            {isCopied ? <Check className="w-4 h-4" /> : <Share2 className="w-4 h-4 text-rose-600" />}
            <span>{isCopied ? 'লিংক কপি হয়েছে' : 'লিংক শেয়ার করুন'}</span>
          </button>
        </div>

        {/* Main Product Presentation Card */}
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-md p-5 sm:p-8 lg:p-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
            
            {/* Left: Product Images Column */}
            <div className="lg:col-span-6 space-y-4">
              <div className="aspect-square sm:aspect-[4/3] lg:aspect-square rounded-3xl bg-slate-100 border border-slate-200 overflow-hidden relative group">
                <img
                  src={product.images[selectedImageIndex] || product.images[0]}
                  alt={product.titleBn}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                {product.discountPercent > 0 && (
                  <span className="absolute top-4 left-4 bg-gradient-to-r from-red-600 to-rose-600 text-white font-extrabold text-xs sm:text-sm px-3.5 py-1.5 rounded-xl shadow-lg flex items-center gap-1">
                    <Tag className="w-3.5 h-3.5" />
                    <span>{product.discountPercent}% বিশেষ ছাড়</span>
                  </span>
                )}
                <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-md px-3 py-1 rounded-full text-xs font-bold text-slate-800 shadow-sm border border-slate-200">
                  {selectedImageIndex + 1} / {product.images.length}
                </div>
              </div>

              {/* Gallery Thumbnails */}
              {product.images.length > 1 && (
                <div className="flex items-center gap-3 overflow-x-auto pb-2 no-scrollbar">
                  {product.images.map((img, idx) => (
                    <button
                      key={idx}
                      onClick={() => setSelectedImageIndex(idx)}
                      className={`w-20 h-20 rounded-2xl border-2 overflow-hidden transition-all flex-shrink-0 cursor-pointer ${
                        selectedImageIndex === idx
                          ? 'border-rose-600 ring-2 ring-rose-200 scale-95 shadow-md'
                          : 'border-slate-200 opacity-70 hover:opacity-100 hover:border-slate-300'
                      }`}
                    >
                      <img src={img} alt="Thumbnail" referrerPolicy="no-referrer" className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}

              {/* Features & Delivery Banner */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <div className="p-3.5 rounded-2xl bg-emerald-50/70 border border-emerald-100 flex items-start gap-3">
                  <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                    <Truck className="w-5 h-5" />
                  </div>
                  <div>
                    <h5 className="font-bold text-xs text-emerald-950">ক্যাশ অন ডেলিভারি</h5>
                    <p className="text-[11px] text-emerald-800 leading-snug">হাতে পেয়ে পুরোপুরি চেক করে মূল্য পরিশোধ করুন</p>
                  </div>
                </div>

                <div className="p-3.5 rounded-2xl bg-rose-50/70 border border-rose-100 flex items-start gap-3">
                  <div className="w-9 h-9 rounded-xl bg-rose-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                    <ShieldCheck className="w-5 h-5" />
                  </div>
                  <div>
                    <h5 className="font-bold text-xs text-rose-950">১০০% অরিজিনাল গ্যারান্টি</h5>
                    <p className="text-[11px] text-rose-800 leading-snug">তনু বিউটি পার্লারের অনুমোদিত ও পরীক্ষিত সেবা</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Right: Product Details & Purchase Actions Column */}
            <div className="lg:col-span-6 space-y-6">
              
              <div>
                <div className="flex flex-wrap items-center gap-2 mb-2">
                  <span className="text-xs font-bold text-rose-700 bg-rose-50 border border-rose-200 px-3 py-1 rounded-full">
                    {product.categoryBn}
                  </span>
                  {product.category === 'csa_laser' && (
                    <span className="text-xs font-bold text-indigo-700 bg-indigo-50 border border-indigo-200 px-3 py-1 rounded-full flex items-center gap-1">
                      <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                      <span>লেজার সেন্টার স্পেশাল</span>
                    </span>
                  )}
                </div>

                <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 leading-tight">
                  {product.titleBn}
                </h1>

                {/* Rating & Stock status */}
                <div className="flex flex-wrap items-center gap-3 mt-3">
                  <div className="flex items-center text-amber-500 text-sm font-bold bg-amber-50 px-2.5 py-1 rounded-xl border border-amber-100">
                    <Star className="w-4 h-4 fill-amber-400 text-amber-400 mr-1.5" />
                    <span>{product.rating}</span>
                    <span className="text-slate-400 font-normal ml-1">({product.reviewCount} রিভিউ)</span>
                  </div>

                  <span className="text-slate-300">•</span>

                  {product.stockCount <= 0 ? (
                    <span className="text-xs text-red-700 font-extrabold bg-red-100 px-3 py-1 rounded-xl border border-red-200">
                      স্টক শেষ (Out of Stock)
                    </span>
                  ) : product.stockCount <= 10 ? (
                    <span className="text-xs text-amber-800 font-extrabold bg-amber-100 px-3 py-1 rounded-xl border border-amber-200">
                      সীমিত স্লট/স্টক ({product.stockCount}টি)
                    </span>
                  ) : (
                    <span className="text-xs text-emerald-700 font-bold bg-emerald-50 px-3 py-1 rounded-xl border border-emerald-200 flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                      <span>স্টকে আছে ({product.stockCount}টি)</span>
                    </span>
                  )}
                </div>
              </div>

              {/* Pricing Box */}
              <div className="p-5 bg-gradient-to-br from-slate-900 to-slate-950 rounded-3xl text-white shadow-xl flex flex-wrap items-center justify-between gap-4">
                <div>
                  <span className="text-xs text-slate-400 block font-medium">অফার মূল্য (Cash On Delivery):</span>
                  <div className="flex items-baseline gap-3 mt-1">
                    <span className="text-3xl sm:text-4xl font-extrabold text-white">
                      ৳{product.price.toLocaleString('bn-BD')}
                    </span>
                    {product.originalPrice > product.price && (
                      <span className="text-lg text-slate-400 line-through">
                        ৳{product.originalPrice.toLocaleString('bn-BD')}
                      </span>
                    )}
                  </div>
                </div>

                {product.discountPercent > 0 && (
                  <div className="text-right">
                    <span className="text-xs font-bold text-emerald-400 bg-emerald-950/80 px-3.5 py-1.5 rounded-xl border border-emerald-500/30 block">
                      সঞ্চয় ৳{(product.originalPrice - product.price).toLocaleString('bn-BD')}
                    </span>
                  </div>
                )}
              </div>

              {/* Color Options */}
              {product.colors && product.colors.length > 0 && (
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-800">অপশন / কালার সিলেক্ট করুন:</label>
                  <div className="flex flex-wrap gap-2">
                    {product.colors.map((clr) => (
                      <button
                        key={clr}
                        onClick={() => setSelectedColor(clr)}
                        className={`px-4 py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                          selectedColor === clr
                            ? 'bg-rose-600 text-white border-rose-600 shadow-md shadow-rose-200'
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
              <div className="flex items-center gap-4 py-1">
                <span className="text-xs font-bold text-slate-800">পরিমাণ:</span>
                <div className="flex items-center border border-slate-300 rounded-2xl bg-white overflow-hidden shadow-xs">
                  <button
                    onClick={handleDecreaseQty}
                    className="p-3 text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
                    aria-label="Decrease quantity"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="px-5 text-base font-bold text-slate-900 min-w-[2.5rem] text-center">
                    {quantity}
                  </span>
                  <button
                    onClick={handleIncreaseQty}
                    className="p-3 text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
                    aria-label="Increase quantity"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>

                <div className="text-xs text-slate-500 font-medium">
                  মোট হিসাব: <b className="text-slate-900 text-base font-extrabold ml-1">৳{(product.price * quantity).toLocaleString('bn-BD')}</b>
                </div>
              </div>

              {/* Direct Booking & Cart Buttons */}
              <div className="pt-2 flex flex-col sm:flex-row gap-3.5">
                <button
                  id="direct-order-btn-fullpage"
                  disabled={product.stockCount <= 0}
                  onClick={() => onDirectOrder(product, quantity, selectedColor, selectedSize)}
                  className={`flex-1 py-4 px-6 rounded-2xl font-extrabold text-sm sm:text-base shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer ${
                    product.stockCount <= 0
                      ? 'bg-slate-300 text-slate-500 cursor-not-allowed shadow-none'
                      : 'bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-700 hover:to-pink-700 text-white shadow-rose-200 active:scale-98'
                  }`}
                >
                  <span>{product.stockCount <= 0 ? 'স্টক শেষ' : 'এখনই অর্ডার / বুকিং করুন'}</span>
                </button>

                <button
                  id="add-to-cart-btn-fullpage"
                  disabled={product.stockCount <= 0}
                  onClick={() => onAddToCart(product, quantity, selectedColor, selectedSize)}
                  className={`py-4 px-6 rounded-2xl font-bold text-sm sm:text-base transition-all flex items-center justify-center gap-2 border cursor-pointer ${
                    product.stockCount <= 0
                      ? 'bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed'
                      : 'bg-white hover:bg-slate-50 text-slate-900 border-slate-300 hover:border-slate-400 active:scale-98'
                  }`}
                >
                  <ShoppingCart className="w-5 h-5 text-rose-600" />
                  <span>কার্টে যোগ করুন</span>
                </button>
              </div>

              {/* Laser & Beauty Center Direct Support Callout */}
              <div className="p-4 rounded-2xl bg-gradient-to-r from-rose-50 via-pink-50 to-indigo-50 border border-rose-200/80 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-2.5 text-slate-800">
                  <PhoneCall className="w-4 h-4 text-rose-600 shrink-0" />
                  <span className="font-semibold">যেকোনো তথ্যের জন্য সরাসরি কথা বলুন:</span>
                </div>
                <a
                  href="tel:01302383795"
                  className="px-3.5 py-1.5 rounded-xl bg-slate-900 text-white font-bold hover:bg-slate-800 transition-colors shrink-0"
                >
                  ০১৩০২৩৮৩৭৯৫
                </a>
              </div>

            </div>
          </div>

          {/* Full Tabs Navigation */}
          <div className="mt-12 pt-8 border-t border-slate-200">
            <div className="flex border-b border-slate-200 text-sm sm:text-base font-bold text-slate-600 gap-2 sm:gap-6 overflow-x-auto no-scrollbar">
              <button
                onClick={() => setActiveTab('desc')}
                className={`py-3 px-4 border-b-2 transition-all cursor-pointer whitespace-nowrap ${
                  activeTab === 'desc' ? 'border-rose-600 text-rose-700 font-extrabold' : 'border-transparent hover:text-slate-900'
                }`}
              >
                বিস্তারিত বর্ণনা ও সুবিধা
              </button>
              <button
                onClick={() => setActiveTab('specs')}
                className={`py-3 px-4 border-b-2 transition-all cursor-pointer whitespace-nowrap ${
                  activeTab === 'specs' ? 'border-rose-600 text-rose-700 font-extrabold' : 'border-transparent hover:text-slate-900'
                }`}
              >
                স্পেসিফিকেশন ও বিবরণ
              </button>
              <button
                onClick={() => setActiveTab('delivery')}
                className={`py-3 px-4 border-b-2 transition-all cursor-pointer whitespace-nowrap ${
                  activeTab === 'delivery' ? 'border-rose-600 text-rose-700 font-extrabold' : 'border-transparent hover:text-slate-900'
                }`}
              >
                ডেলিভারি ও গ্যারান্টি পলিসি
              </button>
            </div>

            {/* Tab Contents */}
            <div className="py-6">
              {activeTab === 'desc' && (
                <div className="space-y-6 text-sm sm:text-base text-slate-700 leading-relaxed max-w-4xl">
                  <p className="text-base sm:text-lg text-slate-800 font-medium bg-slate-50 p-5 rounded-2xl border border-slate-100">
                    {product.descriptionBn}
                  </p>

                  <div className="space-y-3 pt-2">
                    <h3 className="font-extrabold text-slate-900 text-base sm:text-lg flex items-center gap-2">
                      <Sparkles className="w-5 h-5 text-rose-600" />
                      <span>প্রধান সুবিধাসমূহ ও বিশেষত্ব:</span>
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                      {product.keyFeaturesBn.map((feat, i) => (
                        <div key={i} className="flex items-start gap-2.5 p-3.5 rounded-xl bg-white border border-slate-200/80 shadow-2xs">
                          <div className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0 mt-0.5 font-bold text-xs">
                            ✓
                          </div>
                          <span className="font-medium text-slate-800 text-sm">{feat}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'specs' && (
                <div className="max-w-3xl border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
                  <table className="w-full text-sm text-left">
                    <tbody>
                      {Object.entries(product.specs).map(([key, val], idx) => (
                        <tr key={key} className={idx % 2 === 0 ? 'bg-slate-50' : 'bg-white'}>
                          <td className="py-3.5 px-5 font-bold text-slate-700 w-1/3 border-r border-slate-200">
                            {key}
                          </td>
                          <td className="py-3.5 px-5 text-slate-900 font-medium">{val}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {activeTab === 'delivery' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl">
                  <div className="p-6 bg-slate-50 rounded-3xl border border-slate-200 space-y-3">
                    <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
                      <Truck className="w-6 h-6" />
                    </div>
                    <h4 className="font-extrabold text-slate-900 text-base">ডেলিভারি চার্জ ও সময়সূচি</h4>
                    <p className="text-slate-700 text-sm">{product.deliveryDaysBn}</p>
                    <div className="p-3 bg-white rounded-xl border border-slate-200 text-xs text-slate-600 space-y-1">
                      <p className="font-bold text-slate-900">• ঢাকা সিটির মধ্যে: ৬০ টাকা (১-২ দিন)</p>
                      <p className="font-bold text-slate-900">• ঢাকার বাইরে সারা বাংলাদেশ: ১২০ টাকা (২-৩ দিন)</p>
                    </div>
                  </div>

                  <div className="p-6 bg-slate-50 rounded-3xl border border-slate-200 space-y-3">
                    <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-700 flex items-center justify-center">
                      <ShieldCheck className="w-6 h-6" />
                    </div>
                    <h4 className="font-extrabold text-slate-900 text-base">রিটার্ন ও রিপ্লেসমেন্ট পলিসি</h4>
                    <p className="text-slate-700 text-sm">{product.warrantyBn || '৭ দিনের সহজ রিপ্লেসমেন্ট গ্যারান্টি'}</p>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      ডেলিভারি ম্যানের সামনে পণ্য চেক করে গ্রহণ করবেন। কোনো ধরনের সমস্যা থাকলে সরাসরি পরিবর্তন করে দেওয়া হবে।
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};
