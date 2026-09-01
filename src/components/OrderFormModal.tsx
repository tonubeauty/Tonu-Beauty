import React, { useState } from 'react';
import { X, ShieldCheck, Truck, Lock, CheckCircle2, Phone, MapPin, User, FileText, AlertCircle, Loader2 } from 'lucide-react';
import { CartItem, OrderFormData, DeliveryZone, Order } from '../types';
import { saveOrderToFirestore } from '../lib/firebase';

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
    district: deliveryZone === 'inside_dhaka' ? 'ঢাকা' : 'চট্টগ্রাম',
    area: '',
    deliveryNote: '',
    deliveryZone: deliveryZone,
    paymentMethod: 'cod',
    agreeTerms: true,
  });

  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const subtotal = cartItems.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  const deliveryFee = deliveryZone === 'inside_dhaka' ? 60 : 120;
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

    if (formData.address.trim().length < 5) {
      setErrorMessage('অনুগ্রহ করে আপনার বিস্তারিত বাসা/রোড/এলাকার ঠিকানা লিখুন।');
      return;
    }

    if (!formData.agreeTerms) {
      setErrorMessage('অর্ডার সম্পন্ন করতে শর্তাবলীতে সম্মতি দিন।');
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
            <div className="w-8 h-8 rounded-lg bg-emerald-500 text-slate-950 flex items-center justify-center font-bold">
              <Truck className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-base text-white leading-tight">ক্যাশ অন ডেলিভারি অর্ডার ফর্ম</h3>
              <p className="text-[11px] text-emerald-300 font-medium">
                পণ্য হাতে পাওয়ার পর মূল্য পরিশোধ করার সুবিধা
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
              <User className="w-4 h-4 text-emerald-600" /> ১. আপনার ডেলিভারি তথ্য
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
                    placeholder="যেমন: মোঃ সাকিব হাসান"
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
                    placeholder="যেমন: 01712345678"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none text-slate-900 font-medium"
                  />
                </div>
                <span className="text-[10px] text-slate-500">ডেলিভারি ম্যান এই নম্বরে কল করবেন</span>
              </div>

              {/* Address */}
              <div className="sm:col-span-2 space-y-1">
                <label className="font-bold text-slate-800">
                  সম্পূর্ণ ডেলিভারি ঠিকানা <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <MapPin className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <textarea
                    required
                    rows={2}
                    placeholder="যেমন: বাসা নং ১২, রোড নং ৫, ব্লক-বি, মিরপুর-১০, ঢাকা"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none text-slate-900 font-medium resize-none"
                  />
                </div>
              </div>

              {/* District & Delivery Area */}
              <div className="space-y-1">
                <label className="font-bold text-slate-800">ডেলিভারি জোন</label>
                <select
                  value={deliveryZone}
                  onChange={(e) => {
                    const zone = e.target.value as DeliveryZone;
                    onDeliveryZoneChange(zone);
                    setFormData({ ...formData, deliveryZone: zone, district: zone === 'inside_dhaka' ? 'ঢাকা' : 'ঢাকার বাইরে' });
                  }}
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none text-slate-900 font-medium cursor-pointer"
                >
                  <option value="inside_dhaka">ঢাকা সিটি (ডেলিভারি চার্জ ৳৬০)</option>
                  <option value="outside_dhaka">ঢাকার বাইরে (ডেলিভারি চার্জ ৳১২০)</option>
                </select>
              </div>

              {/* Delivery Note */}
              <div className="space-y-1">
                <label className="font-bold text-slate-800">ডেলিভারি নোট (ঐচ্ছিক)</label>
                <div className="relative">
                  <FileText className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="যেমন: বিকালে ডেলিভারি দিলে ভালো হয়"
                    value={formData.deliveryNote}
                    onChange={(e) => setFormData({ ...formData, deliveryNote: e.target.value })}
                    className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none text-slate-900 font-medium"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Step 2: Fixed Payment Method (Cash on Delivery) */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5 border-b border-slate-200 pb-1.5">
              <Lock className="w-4 h-4 text-emerald-600" /> ২. পেমেন্ট মেথড
            </h4>

            <div className="p-3.5 bg-emerald-50/80 border-2 border-emerald-600 rounded-2xl flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center shrink-0">
                  <CheckCircle2 className="w-4 h-4" />
                </div>
                <div>
                  <div className="font-bold text-slate-900 text-xs sm:text-sm">
                    ক্যাশ অন ডেলিভারি (Cash on Delivery)
                  </div>
                  <div className="text-[11px] text-slate-600 font-medium">
                    পণ্য হাতে পেয়ে পুরোপুরি দেখে ডেলিভারি রাইডারকে টাকা প্রদান করবেন।
                  </div>
                </div>
              </div>

              <span className="text-xs font-bold text-emerald-800 bg-emerald-200/80 px-2.5 py-1 rounded-lg shrink-0">
                নিরাপদ
              </span>
            </div>
          </div>

          {/* Step 3: Order Items Summary & Total */}
          <div className="space-y-2 bg-slate-50 p-4 rounded-2xl border border-slate-200">
            <h4 className="text-xs font-bold text-slate-800 border-b border-slate-200 pb-2">
              অর্ডার বিবরণী ({cartItems.length}টি প্রোডাক্ট):
            </h4>

            <div className="space-y-2 max-h-36 overflow-y-auto text-xs pr-1">
              {cartItems.map(({ product, quantity, selectedColor }) => (
                <div key={product.id} className="flex items-center justify-between text-slate-700">
                  <span className="truncate max-w-[240px]" title={product.titleBn}>
                    • {product.titleBn} {selectedColor ? `(${selectedColor})` : ''} x {quantity}
                  </span>
                  <span className="font-bold text-slate-900 shrink-0">
                    ৳{(product.price * quantity).toLocaleString('bn-BD')}
                  </span>
                </div>
              ))}
            </div>

            <div className="pt-2 border-t border-slate-200 space-y-1 text-xs">
              <div className="flex justify-between text-slate-600">
                <span>পণ্যের সাব-টোটাল:</span>
                <span className="font-semibold text-slate-900">৳{subtotal.toLocaleString('bn-BD')}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>ডেলিভারি চার্জ:</span>
                <span className="font-semibold text-slate-900">৳{deliveryFee.toLocaleString('bn-BD')}</span>
              </div>
              <div className="flex justify-between text-sm sm:text-base font-extrabold text-slate-900 pt-1.5 border-t border-slate-300">
                <span>সর্বমোট প্রদেয় মূল্য (COD):</span>
                <span className="text-emerald-700">৳{totalAmount.toLocaleString('bn-BD')}</span>
              </div>
            </div>
          </div>

          {/* Terms & Data Safety Checkbox */}
          <div className="space-y-2 pt-1">
            <label className="flex items-start gap-2 text-xs text-slate-600 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.agreeTerms}
                onChange={(e) => setFormData({ ...formData, agreeTerms: e.target.checked })}
                className="w-4 h-4 mt-0.5 rounded text-emerald-600 focus:ring-emerald-500"
              />
              <span>
                আমি নিশ্চিত করছি যে প্রদত্ত ডেলিভারি তথ্য সঠিক এবং আমি পণ্য বুঝে পাওয়ার পর <b>৳{totalAmount.toLocaleString('bn-BD')}</b> ক্যাশ পরিশোধ করব।
              </span>
            </label>

            {/* Security Assurance Box */}
            <div className="p-3 bg-slate-100/80 rounded-xl flex items-center gap-2.5 text-[11px] text-slate-600">
              <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0" />
              <span>
                <b>সিকিউরিটি প্রটেকশন:</b> আপনার মোবাইল নম্বর ও ব্যক্তিগত ডেটা আমাদের নিরাপদ সার্ভারে সম্পূর্ণ সংরক্ষিত থাকে।
              </span>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-4 px-6 rounded-2xl bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-extrabold text-base shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>অর্ডার প্রসেসিং হচ্ছে...</span>
              </>
            ) : (
              <>
                <CheckCircle2 className="w-5 h-5" />
                <span>অর্ডার কনফার্ম করুন (৳{totalAmount.toLocaleString('bn-BD')})</span>
              </>
            )}
          </button>

        </form>

      </div>
    </div>
  );
};
