import React, { useState } from 'react';
import { X, Calendar, Clock, MapPin, PhoneCall, Sparkles, CheckCircle2, User, Phone, MessageSquare, ShieldCheck } from 'lucide-react';
import { saveOrderToFirestore } from '../lib/firebase';
import { Order, DeliveryZone } from '../types';

interface BeautyAppointmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  preSelectedService?: string;
  onSuccessToast?: (msg: string) => void;
}

export const BeautyAppointmentModal: React.FC<BeautyAppointmentModalProps> = ({
  isOpen,
  onClose,
  preSelectedService = '',
  onSuccessToast,
}) => {
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [selectedService, setSelectedService] = useState(
    preSelectedService || 'CSA লেজার স্থায়ী হেয়ার রিমুভাল'
  );
  const [preferredDate, setPreferredDate] = useState('');
  const [preferredTime, setPreferredTime] = useState('সকাল ১১:০০ টা');
  const [notes, setNotes] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [bookingId, setBookingId] = useState('');

  if (!isOpen) return null;

  const serviceOptions = [
    'CSA লেজার স্থায়ী হেয়ার রিমুভাল',
    'CSA লেজার মেছতা ও ব্রণের দাগ রিমুভাল',
    'অ্যাডভান্সড স্কিন ব্রাইটেনিং ও হাইড্রা ফেসিয়াল',
    'প্রিমিয়াম ব্রাইডাল এইচডি মেকআপ প্যাকেজ',
    'হেয়ার রিবন্ডিং ও ডিপ স্পা ট্রিটমেন্ট',
    'ফ্রি স্কিন কনসালটেশন ও বিউটি গাইড',
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim() || !phone.trim()) {
      alert('অনুগ্রহ করে আপনার নাম এবং মোবাইল নম্বর লিখুন।');
      return;
    }

    const randomId = 'TB-' + Math.floor(100000 + Math.random() * 900000);
    setBookingId(randomId);
    setIsSubmitted(true);

    // Save appointment record for Admin Panel & tracking
    try {
      const now = new Date();
      const newApptOrder: Order = {
        orderId: randomId,
        createdAt: now.toISOString(),
        customerName: fullName,
        phone: phone,
        address: `তারিখ: ${preferredDate || 'আসন্ন'} (${preferredTime}), নোট: ${notes || 'নেই'}`,
        district: 'টাঙ্গাইল',
        deliveryZone: 'inside_dhaka' as DeliveryZone,
        items: [
          {
            productId: 'appt-1',
            productTitle: selectedService,
            quantity: 1,
            price: 0,
            image: 'https://images.unsplash.com/photo-1560750588-73207b1ef5b8?auto=format&fit=crop&w=400&q=80',
          },
        ],
        subtotal: 0,
        deliveryFee: 0,
        totalAmount: 0,
        paymentMethod: 'cod',
        status: 'pending',
        trackingHistory: [
          {
            status: 'pending',
            titleBn: 'অ্যাপয়েন্টমেন্ট গ্রহণ সম্পন্ন',
            timestamp: now.toLocaleString('bn-BD'),
            descriptionBn: 'আপনার অনলাইন বিউটি পার্লার অ্যাপয়েন্টমেন্ট রিকুয়েস্ট সিস্টেমে জমা হয়েছে।',
            completed: true,
          },
        ],
      };

      // Save to Firestore & Local Storage
      await saveOrderToFirestore(newApptOrder);
      const saved = localStorage.getItem('tanu_orders');
      const existing = saved ? JSON.parse(saved) : [];
      localStorage.setItem('tanu_orders', JSON.stringify([newApptOrder, ...existing]));
    } catch (e) {
      console.error('Failed to save appointment to local storage', e);
    }

    if (onSuccessToast) {
      onSuccessToast(`অ্যাপয়েন্টমেন্ট সফলভাবে বুক করা হয়েছে! আইডি: ${randomId}`);
    }
  };

  const resetAndClose = () => {
    setIsSubmitted(false);
    setFullName('');
    setPhone('');
    setNotes('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl border border-slate-200 relative my-auto">
        
        {/* Header Bar */}
        <div className="bg-gradient-to-r from-rose-700 via-rose-800 to-indigo-900 text-white p-5 sm:p-6 relative">
          <button
            onClick={resetAndClose}
            className="absolute top-4 right-4 text-rose-200 hover:text-white bg-white/10 hover:bg-white/20 p-2 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-rose-500/30 text-rose-100 text-xs font-semibold mb-2 border border-rose-400/30">
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span>CSA লেজারের একটি শাখা</span>
          </div>

          <h3 className="text-xl sm:text-2xl font-extrabold text-white leading-tight">
            তনু বিউটি পার্লার এন্ড লেজার সেন্টার
          </h3>

          <p className="text-xs text-rose-100 mt-1 flex items-center gap-1">
            <MapPin className="w-3.5 h-3.5 text-amber-300 shrink-0" />
            <span>ডুবাইল, সেহড়াতৈল রোড, নাটিয়াপাড়া বাজার, দেলদুয়ার, টাঙ্গাইল</span>
          </p>
        </div>

        {/* Content Body */}
        <div className="p-5 sm:p-6 max-h-[80vh] overflow-y-auto no-scrollbar">
          {isSubmitted ? (
            <div className="text-center py-6 space-y-4">
              <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-inner">
                <CheckCircle2 className="w-10 h-10" />
              </div>

              <div>
                <span className="text-xs font-bold text-emerald-600 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-full">
                  অ্যাপয়েন্টমেন্ট সফল হয়েছে
                </span>
                <h4 className="text-xl font-extrabold text-slate-900 mt-2">
                  ধন্যবাদ, {fullName}!
                </h4>
                <p className="text-xs text-slate-600 mt-1 max-w-sm mx-auto">
                  আপনার অ্যাপয়েন্টমেন্ট রিকুয়েস্ট গ্রহণ করা হয়েছে। আমাদের প্রতিনিধি আপনাকে কিছুক্ষণের মধ্যেই নিশ্চিতকরণের জন্য কল করবেন।
                </p>
              </div>

              {/* Receipt Summary Card */}
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 text-left space-y-2 text-xs">
                <div className="flex justify-between border-b border-slate-200 pb-2">
                  <span className="text-slate-500">বুকিং ট্র্যাকিং আইডি:</span>
                  <span className="font-extrabold text-rose-700">{bookingId}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">নির্বাচিত সার্ভিস:</span>
                  <span className="font-bold text-slate-900">{selectedService}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">তারিখ ও সময়:</span>
                  <span className="font-semibold text-slate-800">
                    {preferredDate || 'শিগগিরই নির্ধারিত হবে'} ({preferredTime})
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">মোবাইল নম্বর:</span>
                  <span className="font-bold text-slate-900">{phone}</span>
                </div>
                <div className="pt-2 border-t border-slate-200 flex items-start gap-1.5 text-slate-600">
                  <MapPin className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                  <span>
                    <b>সেন্টার ঠিকানা:</b> ডুবাইল, সেহড়াতৈল রোড, নাটিয়াপাড়া বাজার, দেলদুয়ার, টাঙ্গাইল।
                  </span>
                </div>
              </div>

              {/* Direct Call Info */}
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl flex items-center justify-between text-xs">
                <div className="text-left">
                  <div className="font-bold text-rose-900">জরুরি তথ্যের জন্য হটলাইন</div>
                  <div className="text-slate-600">সরাসরি কথা বলুন পার্লার টিমের সাথে</div>
                </div>
                <a
                  href="tel:01302383795"
                  className="px-3 py-1.5 rounded-lg bg-emerald-600 text-white font-bold flex items-center gap-1 shadow hover:bg-emerald-700"
                >
                  <PhoneCall className="w-3.5 h-3.5" />
                  <span>01302383795</span>
                </a>
              </div>

              <button
                onClick={resetAndClose}
                className="w-full py-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-sm transition-all"
              >
                ঠিক আছে, বন্ধ করুন
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              
              <div className="flex items-center gap-2 p-2.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs">
                <ShieldCheck className="w-4 h-4 text-amber-600 shrink-0" />
                <span>
                  <b>CSA লেজার প্রযুক্তি:</b> টাঙ্গাইল দেলদুয়ার শাখায় আধুনিক অভিজ্ঞ স্পেশালিস্ট দ্বারা পরিচালিত।
                </span>
              </div>

              {/* Service Selection */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  কাঙ্ক্ষিত সার্ভিস বা ট্রিটমেন্ট নির্বাচন করুন <span className="text-rose-500">*</span>
                </label>
                <select
                  value={selectedService}
                  onChange={(e) => setSelectedService(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs font-semibold text-slate-800 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-rose-500"
                >
                  {serviceOptions.map((opt) => (
                    <option key={opt} value={opt}>
                      {opt}
                    </option>
                  ))}
                </select>
              </div>

              {/* Name & Phone */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    আপনার নাম <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type="text"
                      required
                      placeholder="আপনার নাম লিখুন"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    মোবাইল নম্বর <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type="tel"
                      required
                      placeholder="017XXXXXXXX"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-500"
                    />
                  </div>
                </div>
              </div>

              {/* Date & Time */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    পছন্দের তারিখ
                  </label>
                  <input
                    type="date"
                    value={preferredDate}
                    onChange={(e) => setPreferredDate(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-500 text-slate-800"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    পছন্দের সময়
                  </label>
                  <select
                    value={preferredTime}
                    onChange={(e) => setPreferredTime(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-500 text-slate-800"
                  >
                    <option value="সকাল ১০:০০ টা - দুপুর ১২:০০ টা">সকাল ১০:০০ - দুপুর ১২:০০</option>
                    <option value="দুপুর ১২:০০ টা - দুপুর ৩:০০ টা">দুপুর ১২:০০ - দুপুর ৩:০০</option>
                    <option value="বিকাল ৩:০০ টা - সন্ধ্যা ৬:০০ টা">বিকাল ৩:০০ - সন্ধ্যা ৬:০০</option>
                    <option value="সন্ধ্যা ৬:০০ টা - রাত ৮:০০ টা">সন্ধ্যা ৬:০০ - রাত ৮:০০</option>
                  </select>
                </div>
              </div>

              {/* Notes */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  অন্যান্য তথ্য বা সমস্যা (ঐচ্ছিক)
                </label>
                <textarea
                  rows={2}
                  placeholder="যেমন: অ্যাকনে সমস্যা বা হেয়ার রিমুভাল সম্পর্কিত প্রশ্ন..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-500"
                />
              </div>

              {/* Bottom Hotline Bar */}
              <div className="pt-2 border-t border-slate-200 flex items-center justify-between text-xs text-slate-600">
                <span>হটলাইন সাপোর্ট:</span>
                <a
                  href="tel:01302383795"
                  className="font-bold text-rose-700 hover:underline flex items-center gap-1"
                >
                  <PhoneCall className="w-3.5 h-3.5 text-emerald-600" />
                  <span>01302383795</span>
                </a>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-700 hover:to-pink-700 text-white font-extrabold text-sm shadow-lg shadow-rose-500/25 transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <Calendar className="w-4 h-4" />
                <span>অ্যাপয়েন্টমেন্ট সাবমিট করুন</span>
              </button>

            </form>
          )}
        </div>

      </div>
    </div>
  );
};
