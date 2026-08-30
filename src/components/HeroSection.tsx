import React from 'react';
import { Sparkles, PhoneCall, Calendar, ArrowRight, ShieldCheck, Heart, Star } from 'lucide-react';

interface HeroSectionProps {
  onExploreClick: () => void;
  onOpenAppointmentModal?: () => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({ onExploreClick, onOpenAppointmentModal }) => {
  return (
    <section className="bg-white border-b border-slate-200/70 py-10 sm:py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          
          {/* Hero Left Column */}
          <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
            
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-50 border border-rose-200/80 text-rose-700 text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5 text-rose-600" />
              <span>CSA লেজার শাখা — দেলদুয়ার, টাঙ্গাইল</span>
            </div>

            <div className="space-y-3">
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900 tracking-tight leading-tight">
                সৌন্দর্য ও আধুনিক স্কিন কেয়ারের <span className="text-rose-600">নির্ভরযোগ্য ঠিকানা</span>
              </h1>
              <p className="text-slate-600 text-sm sm:text-base leading-relaxed max-w-xl mx-auto lg:mx-0 font-normal">
                জার্মান প্রযুক্তির ব্যথামুক্ত CSA লেজারের মাধ্যমে স্থায়ী হেয়ার রিমুভাল, মেছতা ও ব্রণের দাগ অপসারণ, হাইড্রা ফেসিয়াল ও প্রিমিয়াম ব্রাইডাল মেকআপ সার্ভিস।
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3 pt-2">
              {onOpenAppointmentModal && (
                <button
                  onClick={onOpenAppointmentModal}
                  className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-sm transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-xs"
                >
                  <Calendar className="w-4 h-4" />
                  <span>অনলাইন বুকিং নিন</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              )}

              <button
                onClick={onExploreClick}
                className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold text-sm transition-colors cursor-pointer"
              >
                প্যাকেজ ও সার্ভিস দেখুন
              </button>

              <a
                href="tel:01302383795"
                className="w-full sm:w-auto px-5 py-3.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 font-semibold text-sm flex items-center justify-center gap-2 transition-colors"
              >
                <PhoneCall className="w-4 h-4 text-emerald-600" />
                <span>01302383795</span>
              </a>
            </div>

            {/* 3 Value Points */}
            <div className="pt-6 border-t border-slate-100 grid grid-cols-3 gap-4 text-left">
              <div>
                <div className="flex items-center gap-1.5 text-xs font-bold text-slate-900">
                  <ShieldCheck className="w-4 h-4 text-rose-600 shrink-0" />
                  <span>ব্যথামুক্ত লেজার</span>
                </div>
                <p className="text-[11px] text-slate-500 mt-0.5">নিরাপদ সিএসএ প্রযুক্তি</p>
              </div>

              <div>
                <div className="flex items-center gap-1.5 text-xs font-bold text-slate-900">
                  <Heart className="w-4 h-4 text-rose-600 shrink-0" />
                  <span>নারী টিম</span>
                </div>
                <p className="text-[11px] text-slate-500 mt-0.5">সম্পূর্ণ গোপনীয়তা বজায়</p>
              </div>

              <div>
                <div className="flex items-center gap-1.5 text-xs font-bold text-slate-900">
                  <Star className="w-4 h-4 text-amber-500 fill-amber-500 shrink-0" />
                  <span>৪.৯ রেটিং</span>
                </div>
                <p className="text-[11px] text-slate-500 mt-0.5">৩০০+ সন্তুষ্ট সেবাগ্রহীতা</p>
              </div>
            </div>

          </div>

          {/* Hero Right Visual Card */}
          <div className="lg:col-span-5">
            <div className="relative rounded-2xl overflow-hidden border border-slate-200 shadow-sm bg-slate-50">
              <div className="aspect-[4/3] w-full overflow-hidden">
                <img
                  src="https://images.unsplash.com/photo-1560750588-73207b1ef5b8?auto=format&fit=crop&w=800&q=80"
                  alt="Tanu Beauty Parlour & Laser Center"
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover"
                  loading="eager"
                />
              </div>
              <div className="p-4 bg-white flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-slate-900 text-sm">সিএসএ লেজার ট্রিটমেন্ট ও ব্রাইডাল কেয়ার</h4>
                  <p className="text-xs text-slate-500 mt-0.5">নাটিয়াপাড়া বাজার, দেলদুয়ার, টাঙ্গাইল</p>
                </div>
                <span className="text-xs font-bold text-rose-700 bg-rose-50 px-2.5 py-1 rounded-lg border border-rose-200/60 shrink-0">
                  প্রতিদিন খোলা
                </span>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};
