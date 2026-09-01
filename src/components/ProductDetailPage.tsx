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
  ChevronRight,
  Sparkles
} from 'lucide-react';
import { Product } from '../types';
import { scrollToTarget, resizeScroll, resumeScroll } from '../lib/smoothScroll';

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
    resumeScroll();
    resizeScroll();
    scrollToTarget('body', 0);
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
    <div id="product-full-page-view" className="w-full bg-slate-50/50 min-h-screen py-6 sm:py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        
        {/* Navigation Breadcrumbs */}
        <div className="flex items-center justify-between gap-3 text-xs text-slate-500">
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
            <button
              onClick={onBack}
              className="flex items-center gap-1 text-slate-700 hover:text-slate-900 font-semibold cursor-pointer shrink-0"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>ফিরে যান</span>
            </button>
            <ChevronRight className="w-3.5 h-3.5 text-slate-300 shrink-0" />
            <button onClick={onBack} className="hover:text-slate-900 shrink-0">
              হোম
            </button>
            <ChevronRight className="w-3.5 h-3.5 text-slate-300 shrink-0" />
            <span className="text-slate-700 shrink-0">{product.categoryBn}</span>
            <ChevronRight className="w-3.5 h-3.5 text-slate-300 shrink-0" />
            <span className="text-slate-900 font-medium truncate max-w-[140px] sm:max-w-xs">{product.titleBn}</span>
          </div>

          <button
            onClick={handleShare}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer border shrink-0 ${
              isCopied
                ? 'bg-emerald-600 text-white border-emerald-600'
                : 'bg-white hover:bg-slate-50 text-slate-700 border-slate-200'
            }`}
          >
            {isCopied ? <Check className="w-3.5 h-3.5" /> : <Share2 className="w-3.5 h-3.5 text-slate-500" />}
            <span>{isCopied ? 'কপি হয়েছে' : 'শেয়ার করুন'}</span>
          </button>
        </div>

        {/* Main Product Card */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
            
            {/* Left: Product Images */}
            <div className="lg:col-span-6 space-y-4">
              <div className="aspect-square rounded-2xl bg-slate-100 border border-slate-200 overflow-hidden relative">
                <img
                  src={product.images[selectedImageIndex] || product.images[0]}
                  alt={product.titleBn}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover"
                />
                {product.discountPercent > 0 && (
                  <span className="absolute top-3 left-3 bg-rose-600 text-white font-bold text-xs px-2.5 py-1 rounded-md">
                    {product.discountPercent}% ছাড়
                  </span>
                )}
              </div>

              {/* Gallery Thumbnails */}
              {product.images.length > 1 && (
                <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
                  {product.images.map((img, idx) => (
                    <button
                      key={idx}
                      onClick={() => setSelectedImageIndex(idx)}
                      className={`w-16 h-16 rounded-xl border overflow-hidden transition-all flex-shrink-0 cursor-pointer ${
                        selectedImageIndex === idx
                          ? 'border-rose-600 ring-2 ring-rose-100'
                          : 'border-slate-200 opacity-60 hover:opacity-100'
                      }`}
                    >
                      <img src={img} alt="Thumbnail" referrerPolicy="no-referrer" className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}

              {/* Trust Indicators */}
              <div className="grid grid-cols-2 gap-3 pt-2">
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex items-center gap-2.5 text-xs text-slate-700">
                  <Truck className="w-4 h-4 text-slate-500 shrink-0" />
                  <span>ক্যাশ অন ডেলিভারি</span>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex items-center gap-2.5 text-xs text-slate-700">
                  <ShieldCheck className="w-4 h-4 text-rose-600 shrink-0" />
                  <span>১০০% অরিজিনাল সেবা</span>
                </div>
              </div>
            </div>

            {/* Right: Product Details & Actions */}
            <div className="lg:col-span-6 space-y-5">
              
              <div>
                <span className="text-xs font-semibold text-rose-600 bg-rose-50 px-2.5 py-1 rounded-md">
                  {product.categoryBn}
                </span>

                <h1 className="text-xl sm:text-2xl font-bold text-slate-900 mt-2 leading-snug">
                  {product.titleBn}
                </h1>

                <div className="flex items-center gap-2 mt-2 text-xs">
                  <div className="flex items-center text-amber-500 font-semibold">
                    <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400 mr-1" />
                    <span>{product.rating}</span>
                  </div>
                  <span className="text-slate-400">({product.reviewCount} রিভিউ)</span>
                  <span className="text-slate-300">•</span>
                  <span className="text-emerald-700 font-medium">স্টকে উপলব্ধ</span>
                </div>
              </div>

              {/* Pricing */}
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80 flex items-baseline justify-between">
                <div>
                  <span className="text-xs text-slate-500 block">মূল্য:</span>
                  <div className="flex items-baseline gap-2 mt-0.5">
                    <span className="text-2xl sm:text-3xl font-extrabold text-slate-900">
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
                  <span className="text-xs font-bold text-rose-700 bg-rose-50 px-2.5 py-1 rounded-md border border-rose-100">
                    ৳{(product.originalPrice - product.price).toLocaleString('bn-BD')} সাশ্রয়
                  </span>
                )}
              </div>

              {/* Color Selection */}
              {product.colors && product.colors.length > 0 && (
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-700">অপশন নির্বাচন করুন:</label>
                  <div className="flex flex-wrap gap-2">
                    {product.colors.map((clr) => (
                      <button
                        key={clr}
                        onClick={() => setSelectedColor(clr)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-colors cursor-pointer ${
                          selectedColor === clr
                            ? 'bg-slate-900 text-white border-slate-900'
                            : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                        }`}
                      >
                        {clr}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Quantity */}
              <div className="flex items-center gap-3">
                <span className="text-xs font-semibold text-slate-700">পরিমাণ:</span>
                <div className="flex items-center border border-slate-200 rounded-xl bg-white">
                  <button
                    onClick={handleDecreaseQty}
                    className="p-2 text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
                    aria-label="Decrease quantity"
                  >
                    <Minus className="w-3.5 h-3.5" />
                  </button>
                  <span className="px-4 text-sm font-bold text-slate-900">
                    {quantity}
                  </span>
                  <button
                    onClick={handleIncreaseQty}
                    className="p-2 text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
                    aria-label="Increase quantity"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>

                <span className="text-xs text-slate-500">
                  মোট: <b>৳{(product.price * quantity).toLocaleString('bn-BD')}</b>
                </span>
              </div>

              {/* Action Buttons */}
              <div className="pt-2 flex flex-col sm:flex-row gap-3">
                <button
                  id="direct-order-btn-fullpage"
                  disabled={product.stockCount <= 0}
                  onClick={() => onDirectOrder(product, quantity, selectedColor, selectedSize)}
                  className="flex-1 py-3 px-5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-sm transition-colors cursor-pointer shadow-xs"
                >
                  এখনই বুকিং / অর্ডার করুন
                </button>

                <button
                  id="add-to-cart-btn-fullpage"
                  disabled={product.stockCount <= 0}
                  onClick={() => onAddToCart(product, quantity, selectedColor, selectedSize)}
                  className="py-3 px-5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-900 font-semibold text-sm transition-colors flex items-center justify-center gap-2 cursor-pointer"
                >
                  <ShoppingCart className="w-4 h-4 text-rose-600" />
                  <span>কার্টে রাখুন</span>
                </button>
              </div>

              {/* Help & Helpline */}
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between text-xs text-slate-600">
                <span>পরামর্শ বা সিরিয়ালের জন্য:</span>
                <a href="tel:01302383795" className="font-bold text-rose-600 hover:underline flex items-center gap-1">
                  <PhoneCall className="w-3.5 h-3.5" />
                  <span>01302383795</span>
                </a>
              </div>

            </div>
          </div>

          {/* Tabs */}
          <div className="mt-10 pt-6 border-t border-slate-200">
            <div className="flex border-b border-slate-200 text-xs sm:text-sm font-semibold text-slate-500 gap-4 sm:gap-6">
              <button
                onClick={() => setActiveTab('desc')}
                className={`py-2.5 border-b-2 transition-colors cursor-pointer ${
                  activeTab === 'desc' ? 'border-rose-600 text-rose-600 font-bold' : 'border-transparent hover:text-slate-900'
                }`}
              >
                বিস্তারিত বিবরণ
              </button>
              <button
                onClick={() => setActiveTab('specs')}
                className={`py-2.5 border-b-2 transition-colors cursor-pointer ${
                  activeTab === 'specs' ? 'border-rose-600 text-rose-600 font-bold' : 'border-transparent hover:text-slate-900'
                }`}
              >
                স্পেসিফিকেশন
              </button>
              <button
                onClick={() => setActiveTab('delivery')}
                className={`py-2.5 border-b-2 transition-colors cursor-pointer ${
                  activeTab === 'delivery' ? 'border-rose-600 text-rose-600 font-bold' : 'border-transparent hover:text-slate-900'
                }`}
              >
                ডেলিভারি ও গ্যারান্টি
              </button>
            </div>

            <div className="py-5 text-sm text-slate-700 leading-relaxed">
              {activeTab === 'desc' && (
                <div className="space-y-4 max-w-3xl">
                  <p>{product.descriptionBn}</p>
                  <div className="space-y-2 pt-2">
                    <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider">সুবিধাসমূহ:</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {product.keyFeaturesBn.map((feat, i) => (
                        <div key={i} className="flex items-center gap-2 text-xs text-slate-700 bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                          <span className="text-emerald-600 font-bold">✓</span>
                          <span>{feat}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'specs' && (
                <div className="max-w-2xl border border-slate-200 rounded-xl overflow-hidden text-xs">
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

              {activeTab === 'delivery' && (
                <div className="space-y-3 max-w-2xl text-xs text-slate-600">
                  <p><b>ডেলিভারি সময়সূচি:</b> {product.deliveryDaysBn}</p>
                  <p><b>রিটার্ন ও রিপ্লেসমেন্ট:</b> {product.warrantyBn || '৭ দিনের সহজ রিপ্লেসমেন্ট গ্যারান্টি'}</p>
                  <p className="text-slate-500">পণ্য হাতে পেয়ে পুরোপুরি যাচাই করে মূল্য পরিশোধ করুন।</p>
                </div>
              )}
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};
