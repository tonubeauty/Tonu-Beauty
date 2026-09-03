import React, { useState } from 'react';
import {
  X,
  ShieldCheck,
  Truck,
  Lock,
  CheckCircle2,
  Phone,
  MapPin,
  User,
  FileText,
  AlertCircle,
  Loader2,
  Building2,
  Calendar,
  AlertTriangle
} from 'lucide-react';
import { CartItem, OrderFormData, DeliveryZone, Order } from '../types';
import { saveOrderToFirestore } from '../lib/firebase';
import { isProductItem } from '../data/products';

interface OrderFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  cartItems: CartItem[];
  deliveryZone: DeliveryZone;
  onDeliveryZoneChange: (zone: DeliveryZone) => void;
  onOrderComplete: (order: Order) => void;
}

export const OrderFormModal: React.FC<OrderFormModalProps> = ({
  isOpen,
  onClose,
  cartItems,
  deliveryZone,
  onDeliveryZoneChange,
  onOrderComplete,
}) => {
  const [formData, setFormData] = useState<OrderFormData>({
    fullName: '',
    phone: '',
    altPhone: '',
    address: '',
    district: deliveryZone === 'inside_dhaka' ? 'ঢাকা' : 'টাঙ্গাইল',
    area: '',
    deliveryNote: '',
    deliveryZone: deliveryZone,
    paymentMethod: 'cod',
    agreeTerms: true,
  });

  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const subtotal = cartItems.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  const hasPhysicalProducts = cartItems.some((item) => isProductItem(item.product));
  const hasServices = cartItems.some((item) => !isProductItem(item.product));
  
  // Delivery fee applies only when physical goods are being ordered
  const deliveryFee = hasPhysicalProducts ? (deliveryZone === 'inside_dhaka' ? 60 : 120) : 0;
  const totalAmount = subtotal + deliveryFee;

  // Phone Validation
  const validatePhone = (phone: string): boolean => {
    const cleanPhone = phone.replace(/[\s-]/g, '');
    const bdPhoneRegex = /^(?:\+88|88)?(01[3-9]\d{8})$/;
    return bdPhoneRegex.test(cleanPhone);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    // Client-side validations
    if (formData.fullName.trim().length < 2) {
      setErrorMessage('অনুগ্রহ করে আপনার সঠিক পূর্ণ নাম লিখুন (নূন্যতম ২ অক্ষর)।');
      return;
    }

    if (!validatePhone(formData.phone)) {
      setErrorMessage('অনুগ্রহ করে ১১ ডিজিটের সঠিক বাংলাদেশী মোবাইল নম্বর দিন (যেমন: 01712345678)।');
      return;
    }

    if (formData.address.trim().length < 4) {
      setErrorMessage('অনুগ্রহ করে আপনার বিস্তারিত যোগাযোগের ঠিকানা লিখুন।');
      return;
    }

    if (!formData.agreeTerms) {
      setErrorMessage('সম্পন্ন করতে শর্তাবলীতে সম্মতি দিন।');
      return;
    }

    setIsSubmitting(true);

    try {
      // API call to server
      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customer: { ...formData, deliveryZone },
          items: cartItems.map((item) => ({
            productId: item.product.id,
            quantity: item.quantity,
            color: item.selectedColor,
            size: item.selectedSize,
          })),
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.messageBn || 'অর্ডার সাবমিট করতে সমস্যা হয়েছে।');
      }

      // Success - Save to Firestore & Local Storage
      await saveOrderToFirestore(data.order);
      try {
        const saved = localStorage.getItem('tanu_orders');
        const existing = saved ? JSON.parse(saved) : [];
        localStorage.setItem('tanu_orders', JSON.stringify([data.order, ...existing]));
      } catch (e) {
        console.error('Failed to save order to local storage', e);
      }

      onOrderComplete(data.order);
    } catch (err: any) {
      setErrorMessage(err.message || 'নেটওয়ার্ক বা সার্ভারে সমস্যা হয়েছে। অনুগ্রহ করে আবার চেষ্টা করুন।');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200">
      <div className="relative bg-white rounded-3xl shadow-2xl max-w-2xl w-full overflow-hidden border border-slate-200 my-auto max-h-[92vh] flex flex-col">
        
        {/* Form Header */}
        <div className="sticky top-0 z-10 bg-slate-900 text-white px-5 py-4 flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-2.5">
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold ${
              hasPhysicalProducts ? 'bg-emerald-500 text-slate-950' : 'bg-rose-500 text-white'
            }`}>
              {hasPhysicalProducts ? <Truck className="w-4 h-4" /> : <Building2 className="w-4 h-4" />}
            </div>
            <div>
              <h3 className="font-bold text-base text-white leading-tight">
                {hasPhysicalProducts ? 'ক্যাশ অন ডেলিভারি অর্ডার ও বুকিং ফর্ম' : 'পার্লার ও লেজার সার্ভিস সিরিয়াল বুকিং'}
              </h3>
              <p className="text-[11px] text-emerald-300 font-medium">
                {hasPhysicalProducts
                  ? 'পণ্য হাতে পাওয়ার পর মূল্য পরিশোধ করার সুবিধা'
                  : 'প্রতিষ্ঠানে উপস্থিত হয়ে সেবা গ্রহণের সিরিয়াল'}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center justify-center transition-colors cursor-pointer"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Policy Notice Box */}
        {hasServices && (
          <div className="bg-amber-50 border-b border-amber-200 p-3.5 sm:px-6 text-xs text-amber-900 flex items-start gap-2.5">
            <AlertTriangle className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
            <div className="leading-relaxed">
              <span className="font-bold text-amber-950">গুরুত্বপূর্ণ সেবা নীতি: </span>
              প্রোডাক্ট ছাড়া বাকি পার্লার ও লেজার সার্ভিসগুলো কোনো হোম ডেলিভারি হবে না। এই সার্ভিসগুলো গ্রহণ করতে আমাদের প্রতিষ্ঠানে (তনু বিউটি পার্লার & লেজার সেন্টার, নাটিয়াপাড়া বাজার, দেলদুয়ার, টাঙ্গাইল) আসতে হবে।
            </div>
          </div>
        )}

        {/* Scrollable Form Body */}
        <form onSubmit={handleSubmit} data-lenis-prevent className="overflow-y-auto p-5 sm:p-6 space-y-5 flex-1 no-scrollbar">
          
          {/* Error Banner */}
          {errorMessage && (
            <div className="p-3.5 bg-red-50 border border-red-200 rounded-2xl flex items-start gap-2.5 text-xs text-red-800 animate-in fade-in">
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold">ভুল সংশোধন করুন: </span>
                <span>{errorMessage}</span>
              </div>
            </div>
          )}

          {/* Step 1: Customer Details */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5 border-b border-slate-200 pb-1.5">
              <User className="w-4 h-4 text-emerald-600" /> ১. আপনার নাম ও যোগাযোগের তথ্য
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              {/* Name */}
              <div className="space-y-1">
                <label className="font-bold text-slate-800">
                  আপনার পূর্ণ নাম <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    placeholder="যেমন: শামীমা আক্তার"
                    value={formData.fullName}
                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                    className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none text-slate-900 font-medium"
                  />
                </div>
              </div>

              {/* Mobile Phone */}
              <div className="space-y-1">
                <label className="font-bold text-slate-800">
                  মোবাইল নম্বর <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="tel"
                    required
                    placeholder="যেমন: 01302383795"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none text-slate-900 font-medium"
                  />
                </div>
                <span className="text-[10px] text-slate-500">
                  {hasPhysicalProducts ? 'ডেলিভারি কনফার্মেশনে কল করা হবে' : 'সিরিয়াল কনফার্মেশনের জন্য যোগাযোগ করা হবে'}
                </span>
              </div>

              {/* Address */}
              <div className="sm:col-span-2 space-y-1">
                <label className="font-bold text-slate-800">
                  {hasPhysicalProducts ? 'সম্পূর্ণ ডেলিভারি ঠিকানা' : 'আপনার বর্তমান ঠিকানা/এলাকা'}{' '}
                  <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <MapPin className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <textarea
                    required
                    rows={2}
                    placeholder={
                      hasPhysicalProducts
                        ? 'যেমন: বাসা নং ১২, রোড নং ৫, নাটিয়াপাড়া / দেলদুয়ার / টাঙ্গাইল'
                        : 'যেমন: নাটিয়াপাড়া, দেলদুয়ার, টাঙ্গাইল'
                    }
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none text-slate-900 font-medium resize-none"
                  />
                </div>
              </div>

              {/* Delivery Area (Only if physical products exist) */}
              {hasPhysicalProducts && (
                <div className="space-y-1">
                  <label className="font-bold text-slate-800">পণ্যের ডেলিভারি জোন</label>
                  <select
                    value={deliveryZone}
                    onChange={(e) => {
                      const zone = e.target.value as DeliveryZone;
                      onDeliveryZoneChange(zone);
                      setFormData({
                        ...formData,
                        deliveryZone: zone,
                        district: zone === 'inside_dhaka' ? 'ঢাকা' : 'টাঙ্গাইল',
                      });
                    }}
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none text-slate-900 font-medium cursor-pointer"
                  >
                    <option value="inside_dhaka">ঢাকা সিটি (ডেলিভারি চার্জ ৳৬০)</option>
                    <option value="outside_dhaka">ঢাকার বাইরে / সারা বাংলাদেশ (ডেলিভারি চার্জ ৳১২০)</option>
                  </select>
                </div>
              )}

              {/* Delivery or Booking Note */}
              <div className={hasPhysicalProducts ? 'space-y-1' : 'sm:col-span-2 space-y-1'}>
                <label className="font-bold text-slate-800">
                  {hasServices ? 'পছন্দের তারিখ/সময় বা বিশেষ নোট (ঐচ্ছিক)' : 'ডেলিভারি নোট (ঐচ্ছিক)'}
                </label>
                <div className="relative">
                  <FileText className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder={hasServices ? 'যেমন: শুক্রবার সকালে আসতে চাই' : 'যেমন: বিকালে কল দিলে ভালো হয়'}
                    value={formData.deliveryNote}
                    onChange={(e) => setFormData({ ...formData, deliveryNote: e.target.value })}
                    className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none text-slate-900 font-medium"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Step 2: Payment Policy */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5 border-b border-slate-200 pb-1.5">
              <Lock className="w-4 h-4 text-emerald-600" /> ২. পেমেন্ট ব্যবস্থা
            </h4>

            <div className="p-3.5 bg-emerald-50/80 border-2 border-emerald-600 rounded-2xl flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center shrink-0">
                  <CheckCircle2 className="w-4 h-4" />
                </div>
                <div>
                  <div className="font-bold text-slate-900 text-xs sm:text-sm">
                    {hasPhysicalProducts ? 'ক্যাশ অন ডেলিভারি / সেবা পরবর্তী পেমেন্ট' : 'প্রতিষ্ঠানে সেবা গ্রহণ পরবর্তী পেমেন্ট'}
                  </div>
                  <div className="text-[11px] text-slate-600 font-medium">
                    {hasPhysicalProducts
                      ? 'পণ্য হাতে পেয়ে চেক করে ডেলিভারিম্যানকে টাকা প্রদান করবেন।'
                      : 'প্রতিষ্ঠানে উপস্থিত হয়ে সেবা গ্রহণের পর পার্লারে সরাসরি বিল পরিশোধ করুন।'}
                  </div>
                </div>
              </div>

              <span className="text-xs font-bold text-emerald-800 bg-emerald-200/80 px-2.5 py-1 rounded-lg shrink-0">
                ১০০% নিরাপদ
              </span>
            </div>
          </div>

          {/* Step 3: Order Items Summary & Total */}
          <div className="space-y-2 bg-slate-50 p-4 rounded-2xl border border-slate-200">
            <h4 className="text-xs font-bold text-slate-800 border-b border-slate-200 pb-2 flex items-center justify-between">
              <span>অর্ডার বিবরণী ({cartItems.length}টি আইটেম):</span>
              <span className="text-[11px] text-slate-500 font-normal">
                {hasPhysicalProducts && hasServices
                  ? 'পণ্য ও সার্ভিস উভয়ই রয়েছে'
                  : hasPhysicalProducts
                  ? 'প্রসাধন পণ্য'
                  : 'পার্লার সেবা'}
              </span>
            </h4>

            <div className="space-y-2 max-h-36 overflow-y-auto text-xs pr-1">
              {cartItems.map(({ product, quantity, selectedColor }) => {
                const isProduct = isProductItem(product);
                return (
                  <div key={product.id} className="flex items-center justify-between text-slate-700">
                    <span className="truncate max-w-[240px]" title={product.titleBn}>
                      <span className={isProduct ? 'text-emerald-700' : 'text-rose-700'}>
                        {isProduct ? '🛍️ ' : '🏢 '}
                      </span>
                      {product.titleBn} {selectedColor ? `(${selectedColor})` : ''} x {quantity}
                    </span>
                    <span className="font-bold text-slate-900 shrink-0">
                      ৳{(product.price * quantity).toLocaleString('bn-BD')}
                    </span>
                  </div>
                );
              })}
            </div>

            <div className="pt-2 border-t border-slate-200 space-y-1 text-xs">
              <div className="flex justify-between text-slate-600">
                <span>আইটেম সাব-টোটাল:</span>
                <span className="font-semibold text-slate-900">৳{subtotal.toLocaleString('bn-BD')}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>ডেলিভারি চার্জ:</span>
                {hasPhysicalProducts ? (
                  <span className="font-semibold text-slate-900">৳{deliveryFee.toLocaleString('bn-BD')}</span>
                ) : (
                  <span className="font-bold text-emerald-700">৳০ (সার্ভিস প্রতিষ্ঠানে গ্রহণ)</span>
                )}
              </div>
              <div className="flex justify-between text-sm sm:text-base font-extrabold text-slate-900 pt-1.5 border-t border-slate-300">
                <span>সর্বমোট প্রদেয়:</span>
                <span className="text-emerald-700">৳{totalAmount.toLocaleString('bn-BD')}</span>
              </div>
            </div>
          </div>

          {/* Terms Checkbox */}
          <div className="space-y-2 pt-1">
            <label className="flex items-start gap-2 text-xs text-slate-600 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.agreeTerms}
                onChange={(e) => setFormData({ ...formData, agreeTerms: e.target.checked })}
                className="w-4 h-4 mt-0.5 rounded text-emerald-600 focus:ring-emerald-500"
              />
              <span>
                আমি নিশ্চিত করছি যে প্রদত্ত তথ্য সঠিক এবং আমি পণ্য বুঝে পাওয়ার পর অথবা সেবা গ্রহণের পর <b>৳{totalAmount.toLocaleString('bn-BD')}</b> পরিশোধ করব।
              </span>
            </label>

            {/* Security Assurance Box */}
            <div className="p-3 bg-slate-100/80 rounded-xl flex items-center gap-2.5 text-[11px] text-slate-600">
              <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0" />
              <span>
                <b>তনু বিউটি পার্লার & লেজার সেন্টার:</b> আপনার মোবাইল নম্বর ও ব্যক্তিগত তথ্য আমাদের কাছে শতভাগ নিরাপদ।
              </span>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting}
            className={`w-full py-4 px-6 rounded-2xl text-white font-extrabold text-base shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed ${
              hasPhysicalProducts
                ? 'bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800'
                : 'bg-rose-600 hover:bg-rose-700 active:bg-rose-800'
            }`}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>প্রসেসিং হচ্ছে...</span>
              </>
            ) : (
              <>
                <CheckCircle2 className="w-5 h-5" />
                <span>
                  {hasPhysicalProducts
                    ? `অর্ডার সম্পন্ন করুন (৳${totalAmount.toLocaleString('bn-BD')})`
                    : `বুকিং নিশ্চিত করুন (৳${totalAmount.toLocaleString('bn-BD')})`}
                </span>
              </>
            )}
          </button>

        </form>

      </div>
    </div>
  );
};
