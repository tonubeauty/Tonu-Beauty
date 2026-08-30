import React, { useState } from 'react';
import { Sparkles, MapPin, PhoneCall, Star, CheckCircle2, Calendar, ShieldCheck, Clock, ArrowRight, HeartHandshake } from 'lucide-react';

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
      tag: '১০০% ব্যথামুক্ত',
    },
    {
      id: 'acne-spot',
      titleBn: 'মেছতা ও ব্রণের দাগ রিমুভাল',
      descriptionBn: 'পুরাতন ব্রণের দাগ, মেছতার কালচে ছোপ ও পিগমেন্টেশন লেজার থেরাপির সাহায্যে ত্বক নিখুঁত ফর্সা ও মসৃণ করুন।',
      icon: ShieldCheck,
      tag: 'CSA লেজার প্রযুক্তি',
    },
    {
      id: 'hydra-facial',
      titleBn: 'স্কিন ব্রাইটেনিং ও হাইড্রা ফেসিয়াল',
      descriptionBn: 'ডিপ ক্লিনজিং, ব্ল্যাকহেডস রিমুভাল ও ভিটামিন সি ইনফিউশন ফেসিয়াল যা ত্বক করে তোলে কোমল, ফর্সা ও সতেজ।',
      icon: HeartHandshake,
      tag: 'ইনস্ট্যান্ট গ্লো',
    },
    {
      id: 'bridal-makeup',
      titleBn: 'এইচডি ব্রাইডাল মেকআপ ও হেয়ার স্পা',
      descriptionBn: 'কনের জন্য ওয়াটারপ্রুফ এইচডি মেকআপ, আই স্টাইলিং, হেয়ার রিবন্ডিং এবং রিল্যাক্সিং স্পা ট্রিটমেন্ট প্যাকেজ।',
      icon: Star,
      tag: 'বিশেষ ছাড়',
    },
  ];

  return (
    <section className="my-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="relative rounded-3xl bg-gradient-to-br from-rose-900 via-slate-900 to-indigo-950 text-white p-6 sm:p-10 shadow-2xl overflow-hidden border border-rose-500/30">
        
        {/* Background Glowing Ambient Orbs */}
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-rose-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          
          {/* Left Hero Details */}
          <div className="lg:col-span-7 space-y-5">
            
            {/* Top Badges */}
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-500/20 border border-rose-400/40 text-rose-200 text-xs font-bold">
                <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                <span>CSA লেজারের একটি বিশেষ শাখা</span>
              </span>

              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-400/20 border border-amber-400/40 text-amber-300 text-xs font-semibold">
                ⭐ CSA লেজার প্রযুক্তি ব্যবহৃত
              </span>
            </div>

            {/* Title */}
            <div>
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-white tracking-tight leading-snug">
                তনু বিউটি পার্লার এন্ড লেজার সেন্টার
              </h2>
              <p className="text-rose-200 text-sm font-semibold mt-1">
                (CSA লেজারের একটি শাখা) — টাঙ্গাইলের নির্ভরযোগ্য বিউটি ও স্কিন কেয়ার সেন্টার
              </p>
            </div>

            {/* Location & Contact Info Box */}
            <div className="p-4 rounded-2xl bg-white/10 backdrop-blur-md border border-white/15 space-y-3">
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-xl bg-rose-500/30 text-rose-300 shrink-0 mt-0.5">
                  <MapPin className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-xs text-rose-200 font-semibold uppercase tracking-wider">পার্লার ও লেজার সেন্টারের ঠিকানা</div>
                  <div className="text-sm font-bold text-white mt-0.5">
                    ডুবাইল, সেহড়াতৈল রোড, নাটিয়াপাড়া বাজার, দেলদুয়ার, টাঙ্গাইল।
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-white/10 flex-wrap gap-2">
                <div className="flex items-center gap-2">
                  <PhoneCall className="w-4 h-4 text-emerald-400 animate-bounce" />
                  <span className="text-xs text-slate-300">বিস্তারিত জানতে কল করুন:</span>
                  <a
                    href="tel:01302383795"
                    className="text-base font-extrabold text-amber-300 hover:text-amber-200 underline decoration-amber-400 decoration-2"
                  >
                    01302383795
                  </a>
                </div>

                <a
                  href="tel:01302383795"
                  className="px-3.5 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold text-xs flex items-center gap-1.5 shadow transition-all"
                >
                  <PhoneCall className="w-3.5 h-3.5" />
                  <span>সরাসরি কল করুন</span>
                </a>
              </div>
            </div>

            {/* Quick Action CTAs */}
            <div className="flex flex-wrap items-center gap-3 pt-1">
              <button
                onClick={() => onBookAppointment()}
                className="px-6 py-3 rounded-xl bg-gradient-to-r from-rose-500 to-pink-600 hover:from-rose-600 hover:to-pink-700 active:scale-95 text-white font-bold text-sm shadow-lg shadow-rose-500/30 flex items-center gap-2 cursor-pointer transition-all"
              >
                <Calendar className="w-4 h-4" />
                <span>অনলাইন অ্যাপয়েন্টমেন্ট নিন</span>
              </button>

              <button
                onClick={onExploreBeautyProducts}
                className="px-5 py-3 rounded-xl bg-white/15 hover:bg-white/25 active:bg-white/30 text-white font-bold text-sm border border-white/20 flex items-center gap-2 cursor-pointer transition-all"
              >
                <span>বিউটি ও লেজার সার্ভিসসমূহ দেখুন</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

          </div>

          {/* Right Services Grid */}
          <div className="lg:col-span-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              {services.map((item) => {
                const IconComponent = item.icon;
                return (
                  <div
                    key={item.id}
                    onClick={() => onBookAppointment(item.titleBn)}
                    className="p-4 rounded-2xl bg-slate-900/80 backdrop-blur-md border border-rose-500/20 hover:border-rose-400/50 hover:bg-slate-900 transition-all cursor-pointer group relative overflow-hidden"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="p-2 rounded-xl bg-rose-500/20 text-rose-300 group-hover:scale-110 transition-transform">
                        <IconComponent className="w-4 h-4" />
                      </div>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-400/20 text-amber-300 border border-amber-400/30">
                        {item.tag}
                      </span>
                    </div>

                    <h3 className="text-sm font-bold text-white group-hover:text-rose-300 transition-colors">
                      {item.titleBn}
                    </h3>

                    <p className="text-[11px] text-slate-300 mt-1 line-clamp-2 font-normal leading-relaxed">
                      {item.descriptionBn}
                    </p>

                    <div className="mt-2.5 pt-2 border-t border-slate-800 flex items-center justify-between text-[11px] text-rose-400 font-semibold">
                      <span>অ্যাপয়েন্টমেন্ট বুকিং</span>
                      <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

        </div>

        {/* Bottom Guarantee Banner */}
        <div className="mt-8 pt-4 border-t border-white/10 flex flex-wrap items-center justify-between text-xs text-rose-200 gap-3">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>আধুনিক CSA লেজার মেশিনে ১০০% নিরাপদ ট্রিটমেন্ট</span>
          </div>

          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-amber-400 shrink-0" />
            <span>সকাল ১০:০০ টা - রাত ৮:০০ টা পর্যন্ত খোলা</span>
          </div>

          <div className="flex items-center gap-1.5 font-bold text-white">
            <PhoneCall className="w-3.5 h-3.5 text-emerald-400" />
            <span>টাঙ্গাইল মোবাইল: 01302383795</span>
          </div>
        </div>

      </div>
    </section>
  );
};
