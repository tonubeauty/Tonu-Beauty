import React from 'react';
import { Sparkles, MapPin, PhoneCall, Calendar, ArrowRight, ShieldCheck, HeartHandshake, Star } from 'lucide-react';

interface TanuBeautySectionProps {
  onBookAppointment: (serviceName?: string) => void;
  onExploreBeautyProducts: () => void;
}

export const TanuBeautySection: React.FC<TanuBeautySectionProps> = ({
  onBookAppointment,
  onExploreBeautyProducts,
}) => {
  const services = [
    {
      id: 'laser-hair',
      titleBn: 'স্থায়ী লেজার হেয়ার রিমুভাল',
      descriptionBn: 'জার্মানি প্রযুক্তির ব্যথামুক্ত সিএসএ লেজারের মাধ্যমে শরীরের যেকোনো অংশের অনাকাঙ্ক্ষিত চুল স্থায়ীভাবে অপসারণ।',
      icon: Sparkles,
      tag: 'ব্যথামুক্ত লেজার',
    },
    {
      id: 'acne-spot',
      titleBn: 'মেছতা ও ব্রণের দাগ রিমুভাল',
      descriptionBn: 'পুরাতন ব্রণের দাগ, মেছতার কালচে ছোপ ও পিগমেন্টেশন লেজার থেরাপির সাহায্যে ত্বক নিখুঁত ও মসৃণ করুন।',
      icon: ShieldCheck,
      tag: 'CSA প্রযুক্তি',
    },
    {
      id: 'hydra-facial',
      titleBn: 'স্কিন ব্রাইটেনিং ও হাইড্রা ফেসিয়াল',
      descriptionBn: 'ডিপ ক্লিনজিং, ব্ল্যাকহেডস রিমুভাল ও ভিটামিন সি ইনফিউশন ফেসিয়াল যা ত্বক করে তোলে কোমল ও সতেজ।',
      icon: HeartHandshake,
      tag: 'ন্যাচারাল গ্লো',
    },
    {
      id: 'bridal-makeup',
      titleBn: 'এইচডি ব্রাইডাল মেকআপ ও হেয়ার স্পা',
      descriptionBn: 'কনের জন্য ওয়াটারপ্রুফ এইচডি মেকআপ, আই স্টাইলিং, হেয়ার রিবন্ডিং এবং রিল্যাক্সিং স্পা ট্রিটমেন্ট প্যাকেজ।',
      icon: Star,
      tag: 'ব্রাইডাল স্পেশাল',
    },
  ];

  return (
    <section className="py-12 bg-slate-50 border-b border-slate-200/70">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <span className="text-rose-600 font-semibold text-xs tracking-wider uppercase">
              আমাদের বিশেষত্ব
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mt-1">
              প্রধান বিউটি ও লেজার সার্ভিসসমূহ
            </h2>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => onBookAppointment()}
              className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-semibold text-xs transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
            >
              <Calendar className="w-3.5 h-3.5" />
              <span>সিরিয়াল বুকিং দিন</span>
            </button>

            <button
              onClick={onExploreBeautyProducts}
              className="px-4 py-2 rounded-xl bg-white hover:bg-slate-100 text-slate-700 font-medium text-xs border border-slate-200 transition-colors cursor-pointer"
            >
              সব প্যাকেজ দেখুন
            </button>
          </div>
        </div>

        {/* 4 Feature Service Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          {services.map((srv) => {
            const Icon = srv.icon;
            return (
              <div
                key={srv.id}
                className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-2xs hover:shadow-md transition-shadow flex flex-col justify-between space-y-4"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
                      <Icon className="w-5 h-5" />
                    </div>
                    <span className="text-[11px] font-medium text-rose-700 bg-rose-50/80 px-2.5 py-0.5 rounded-full border border-rose-100">
                      {srv.tag}
                    </span>
                  </div>

                  <h3 className="font-bold text-slate-900 text-base leading-snug">
                    {srv.titleBn}
                  </h3>

                  <p className="text-xs text-slate-600 leading-relaxed">
                    {srv.descriptionBn}
                  </p>
                </div>

                <button
                  onClick={() => onBookAppointment(srv.titleBn)}
                  className="pt-2 text-xs font-semibold text-rose-600 hover:text-rose-700 flex items-center gap-1 cursor-pointer transition-colors"
                >
                  <span>বুকিং বা পরামর্শ নিন</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            );
          })}
        </div>

        {/* Location & Quick Contact Bar */}
        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3 text-xs sm:text-sm text-slate-700">
            <div className="w-8 h-8 rounded-lg bg-slate-100 text-slate-600 flex items-center justify-center shrink-0">
              <MapPin className="w-4 h-4 text-rose-600" />
            </div>
            <span><b>ঠিকানা:</b> ডুবাইল, সেহড়াতৈল রোড, নাটিয়াপাড়া বাজার, দেলদুয়ার, টাঙ্গাইল।</span>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <span className="text-xs text-slate-500 hidden sm:inline">সরাসরি কথা বলুন:</span>
            <a
              href="tel:01302383795"
              className="px-3.5 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs flex items-center gap-1.5 transition-colors"
            >
              <PhoneCall className="w-3.5 h-3.5 text-emerald-400" />
              <span>01302383795</span>
            </a>
          </div>
        </div>

      </div>
    </section>
  );
};
