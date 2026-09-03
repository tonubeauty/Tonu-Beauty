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
  Sparkles,
  Building2,
  AlertTriangle,
  Calendar,
  CheckCircle2,
  Package,
  MapPin,
  ShoppingBag
} from 'lucide-react';
import { Product } from '../types';
import { isProductItem } from '../data/products';
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

  const isPhysicalProduct = isProductItem(product);

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

  const handlePrimaryAction = () => {
    if (!isPhysicalProduct && onOpenAppointment) {
      onOpenAppointment(product.titleBn);
    } else {
      onDirectOrder(product, quantity, selectedColor, selectedSize);
    }
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

        {/* Main Product / Service Detail Card */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xs">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
            
            {/* Left: Product / Service Images & Badges */}
            <div className="lg:col-span-6 space-y-4">
              <div className="aspect-square rounded-2xl bg-slate-100 border border-slate-200 overflow-hidden relative">
                <img
                  src={product.images[selectedImageIndex] || product.images[0]}
                  alt={product.titleBn}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover"
                />
                {product.discountPercent > 0 && (
                  <span className="absolute top-3 left-3 bg-rose-600 text-white font-bold text-xs px-2.5 py-1 rounded-md shadow-xs">
                    {product.discountPercent}% ছাড়
                  </span>
                )}

                {/* Bottom Overlay Label */}
                <div
                  className={`absolute bottom-3 left-3 right-3 backdrop-blur-xs text-xs font-bold px-3 py-1.5 rounded-xl text-center truncate shadow-xs ${
                    isPhysicalProduct
                      ? 'bg-emerald-950/85 text-emerald-200'
                      : 'bg-rose-950/85 text-rose-200'
                  }`}
                >
                  {isPhysicalProduct ? (
                    <span className="flex items-center justify-center gap-1.5">
                      <Truck className="w-3.5 h-3.5 text-emerald-400" />
                      <span>🛍️ পণ্য • ক্যাশ অন হোম ডেলিভারি প্রযোজ্য</span>
                    </span>
                  ) : (
                    <span className="flex items-center justify-center gap-1.5">
                      <Building2 className="w-3.5 h-3.5 text-rose-400" />
                      <span>🏢 পার্লার সার্ভিস • প্রতিষ্ঠানে এসে সেবা নিতে হবে</span>
                    </span>
                  )}
                </div>
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
                {isPhysicalProduct ? (
                  <>
                    <div className="p-3 rounded-xl bg-emerald-50/70 border border-emerald-100 flex items-center gap-2.5 text-xs text-emerald-900">
                      <Truck className="w-4 h-4 text-emerald-600 shrink-0" />
                      <div>
                        <div className="font-bold">হোম ডেলিভারি</div>
                        <div className="text-[11px] text-emerald-700">সারাদেশে ক্যাশ অন ডেলিভারি</div>
                      </div>
                    </div>
                    <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex items-center gap-2.5 text-xs text-slate-700">
                      <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                      <div>
                        <div className="font-bold">১০০% অরিজিনাল</div>
                        <div className="text-[11px] text-slate-500">অথেনটিক বিউটি প্রোডাক্ট</div>
                      </div>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="p-3 rounded-xl bg-rose-50/70 border border-rose-100 flex items-center gap-2.5 text-xs text-rose-900">
                      <Building2 className="w-4 h-4 text-rose-600 shrink-0" />
                      <div>
                        <div className="font-bold">ইন-পার্লার সেবা</div>
                        <div className="text-[11px] text-rose-700">প্রতিষ্ঠানে এসে সেবা নিতে হবে</div>
                      </div>
                    </div>
                    <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex items-center gap-2.5 text-xs text-slate-700">
                      <Sparkles className="w-4 h-4 text-rose-600 shrink-0" />
                      <div>
                        <div className="font-bold">জার্মান সিএসএ টেকনোলজি</div>
                        <div className="text-[11px] text-slate-500">১০০% নিরাপদ ও ব্যথাহীন</div>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Right: Details & Order / Booking Controls */}
            <div className="lg:col-span-6 space-y-5">
              
              <div>
                <div className="flex items-center gap-2">
                  <span className={`text-xs font-bold px-2.5 py-1 rounded-md ${
                    isPhysicalProduct ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-rose-50 text-rose-700 border border-rose-200'
                  }`}>
                    {product.categoryBn}
                  </span>
                  <span className="text-[11px] font-semibold text-slate-500">
                    {isPhysicalProduct ? 'পণ্য (অনলাইন/অফলাইন)' : 'সার্ভিস (ইন-পার্লার)'}
                  </span>
                </div>

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
                  <span className="text-emerald-700 font-medium">
                    {isPhysicalProduct ? `স্টক: ${product.stockCount}টি` : 'সিরিয়াল বুকিং সক্রিয়'}
                  </span>
                </div>
              </div>

              {/* Delivery / In-person Location Notice Banner */}
              {isPhysicalProduct ? (
                <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-900 flex items-start gap-2.5 leading-relaxed">
                  <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold">অনলাইন ও অফলাইনে বিক্রয়যোগ্য পণ্য:</span> এই পণ্যটি আপনি ঘরে বসে ক্যাশ অন হোম ডেলিভারিতে নিতে পারবেন অথবা তনু বিউটি পার্লারের আউটলেটে এসে সরাসরি দেখে কিনতে পারবেন।
                  </div>
                </div>
              ) : (
                <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-900 flex items-start gap-2.5 leading-relaxed">
                  <AlertTriangle className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold">সার্ভিস ডেলিভারি পলিসি:</span> প্রোডাক্ট ছাড়া বাকি সার্ভিসগুলো কোনো হোম ডেলিভারি হবে না। উন্নত জার্মান যন্ত্রপাতির সাহায্যে এই সার্ভিসটি গ্রহণ করতে সরাসরি আমাদের প্রতিষ্ঠানে (নাটিয়াপাড়া বাজার, দেলদুয়ার, টাঙ্গাইল) আসতে হবে।
                  </div>
                </div>
              )}

              {/* Pricing */}
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80 flex items-baseline justify-between">
                <div>
                  <span className="text-xs text-slate-500 block">
                    {isPhysicalProduct ? 'পণ্যের মূল্য:' : 'সার্ভিস ফি:'}
                  </span>
                  <div className="flex items-baseline gap-2 mt-0.5">
                    <span className={`text-2xl sm:text-3xl font-extrabold ${isPhysicalProduct ? 'text-emerald-700' : 'text-slate-900'}`}>
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

              {/* Options Selection if present */}
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
                <span className="text-xs font-semibold text-slate-700">
                  {isPhysicalProduct ? 'পরিমাণ:' : 'সেশন সংখ্যা:'}
                </span>
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

              {/* Primary Action Buttons */}
              <div className="pt-2 flex flex-col sm:flex-row gap-3">
                <button
                  id="direct-order-btn-fullpage"
                  disabled={product.stockCount <= 0}
                  onClick={handlePrimaryAction}
                  className={`flex-1 py-3 px-5 rounded-xl text-white font-bold text-sm transition-all cursor-pointer shadow-xs flex items-center justify-center gap-2 ${
                    isPhysicalProduct
                      ? 'bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800'
                      : 'bg-rose-600 hover:bg-rose-700 active:bg-rose-800'
                  }`}
                >
                  {isPhysicalProduct ? (
                    <>
                      <ShoppingBag className="w-4 h-4" />
                      <span>ক্যাশ অন ডেলিভারিতে অর্ডার করুন</span>
                    </>
                  ) : (
                    <>
                      <Calendar className="w-4 h-4" />
                      <span>সিরিয়াল বুকিং দিন (প্রতিষ্ঠানে)</span>
                    </>
                  )}
                </button>

                <button
                  id="add-to-cart-btn-fullpage"
                  disabled={product.stockCount <= 0}
                  onClick={() => onAddToCart(product, quantity, selectedColor, selectedSize)}
                  className="py-3 px-5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-900 font-semibold text-sm transition-colors flex items-center justify-center gap-2 cursor-pointer"
                >
                  <ShoppingCart className={`w-4 h-4 ${isPhysicalProduct ? 'text-emerald-700' : 'text-rose-600'}`} />
                  <span>কার্টে রাখুন</span>
                </button>
              </div>

              {/* Direct Parlour Contact */}
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between text-xs text-slate-600">
                <div className="flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-rose-600 shrink-0" />
                  <span>নাটিয়াপাড়া বাজার, দেলদুয়ার, টাঙ্গাইল</span>
                </div>
                <a href="tel:01302383795" className="font-bold text-rose-600 hover:underline flex items-center gap-1">
                  <PhoneCall className="w-3.5 h-3.5" />
                  <span>01302383795</span>
                </a>
              </div>

            </div>
          </div>

          {/* Tabbed Detailed Information */}
          <div className="mt-10 pt-6 border-t border-slate-200">
            <div className="flex border-b border-slate-200 text-xs sm:text-sm font-semibold text-slate-500 gap-4 sm:gap-6">
              <button
                onClick={() => setActiveTab('desc')}
                className={`py-2.5 border-b-2 transition-colors cursor-pointer ${
                  activeTab === 'desc'
                    ? isPhysicalProduct
                      ? 'border-emerald-600 text-emerald-700 font-bold'
                      : 'border-rose-600 text-rose-600 font-bold'
                    : 'border-transparent hover:text-slate-900'
                }`}
              >
                বিস্তারিত বিবরণ
              </button>
              <button
                onClick={() => setActiveTab('specs')}
                className={`py-2.5 border-b-2 transition-colors cursor-pointer ${
                  activeTab === 'specs'
                    ? isPhysicalProduct
                      ? 'border-emerald-600 text-emerald-700 font-bold'
                      : 'border-rose-600 text-rose-600 font-bold'
                    : 'border-transparent hover:text-slate-900'
                }`}
              >
                স্পেসিফিকেশন ও তথ্য
              </button>
              <button
                onClick={() => setActiveTab('delivery')}
                className={`py-2.5 border-b-2 transition-colors cursor-pointer ${
                  activeTab === 'delivery'
                    ? isPhysicalProduct
                      ? 'border-emerald-600 text-emerald-700 font-bold'
                      : 'border-rose-600 text-rose-600 font-bold'
                    : 'border-transparent hover:text-slate-900'
                }`}
              >
                {isPhysicalProduct ? 'ডেলিভারি ও নিশ্চয়তা' : 'সার্ভিস স্থান ও নিয়মাবলী'}
              </button>
            </div>

            <div className="py-5 text-sm text-slate-700 leading-relaxed">
              {activeTab === 'desc' && (
                <div className="space-y-4 max-w-3xl">
                  <p>{product.descriptionBn}</p>
                  <div className="space-y-2 pt-2">
                    <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider">
                      {isPhysicalProduct ? 'পণ্যের প্রধান সুবিধাসমূহ:' : 'সার্ভিসের প্রধান বৈশিষ্ট্যসমূহ:'}
                    </h4>
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
                <div className="space-y-3 max-w-2xl text-xs text-slate-700">
                  {isPhysicalProduct ? (
                    <>
                      <p><b>ডেলিভারি মাধ্যম:</b> {product.deliveryDaysBn || 'সারাদেশে ২-৩ দিনে ক্যাশ অন হোম ডেলিভারি'}</p>
                      <p><b>পিকআপ সুবিধা:</b> পার্লারের শোরুম থেকে সরাসরি এসে নেওয়ার সুবিধাও রয়েছে।</p>
                      <p><b>কোয়ালিটি গ্যারান্টি:</b> {product.warrantyBn || '১০০% অরিজিনাল অথেনটিক প্রোডাক্ট গ্যারান্টি'}</p>
                      <p className="text-emerald-800 bg-emerald-50 p-2.5 rounded-lg border border-emerald-100">
                        {product.deliveryNoticeBn || 'পণ্য হাতে পেয়ে পুরোপুরি যাচাই করে মূল্য পরিশোধ করতে পারবেন।'}
                      </p>
                    </>
                  ) : (
                    <>
                      <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-amber-900 space-y-1">
                        <p className="font-bold flex items-center gap-1.5 text-amber-950">
                          <Building2 className="w-4 h-4 text-amber-700" />
                          <span>হোম ডেলিভারি প্রযোজ্য নয়:</span>
                        </p>
                        <p>
                          প্রোডাক্ট ছাড়া বাকি কোনো সার্ভিস হোম ডেলিভারি করা হয় না। জার্মানি প্রযুক্তির লেজার ইকুইপমেন্ট ও প্রফেশনাল স্পেশালিস্ট দ্বারা পরিচালিত সেবা নিতে প্রতিষ্ঠানে উপস্থিত হতে হবে।
                        </p>
                      </div>
                      <p><b>শাখার ঠিকানা:</b> ডুবাইল, সেহড়াতৈল রোড, নাটিয়াপাড়া বাজার, দেলদুয়ার, টাঙ্গাইল</p>
                      <p><b>অ্যাপয়েন্টমেন্ট বা সিরিয়াল:</b> অনলাইনে সিরিয়াল দিন অথবা সরাসরি কল করুন <b>01302383795</b> নম্বরে।</p>
                    </>
                  )}
                </div>
              )}
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};
