import React from 'react';
import { Sparkles, PhoneCall, MapPin, Calendar, Star, ShieldCheck, ArrowRight, Heart } from 'lucide-react';

interface HeroSectionProps {
  onExploreClick: () => void;
  onOpenAppointmentModal?: () => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({ onExploreClick, onOpenAppointmentModal }) => {
  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-slate-950 via-slate-900 to-rose-950 text-white py-10 sm:py-16">
      {/* Background Decorative Pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-[size:3rem_3rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-20" />

      {/* Decorative Glow Spotlights */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-96 bg-rose-500/20 blur-3xl rounded-full pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-purple-500/15 blur-3xl rounded-full pointer-events-none" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          
          {/* Hero Left Column */}
          <div className="lg:col-span-7 space-y-5 text-center lg:text-left">
            
            {/* Branch Badge */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-rose-500/20 border border-rose-400/40 text-rose-200 text-xs sm:text-sm font-bold shadow-sm">
              <Sparkles className="w-4 h-4 text-amber-300" />
              <span>(CSA লেজারের একটি শাখা) — টাঙ্গাইল দেলদুয়ার</span>
            </div>

            {/* Main Headline */}
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight leading-tight sm:leading-tight text-white">
              তনু বিউটি পার্লার <br className="hidden sm:inline" />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-rose-300 via-pink-400 to-amber-200">
                এন্ড লেজার সেন্টার
              </span>
            </h1>

            {/* Location & Tagline */}
            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-2 text-rose-200 text-xs sm:text-sm font-semibold">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-white/10 backdrop-blur-xs border border-white/10">
                <MapPin className="w-4 h-4 text-rose-400 shrink-0" />
                <span>ডুবাইল, সেহড়াতৈল রোড, নাটিয়াপাড়া বাজার, দেলদুয়ার, টাঙ্গাইল।</span>
              </span>
            </div>

            {/* Subtitle */}
            <p className="text-slate-300 text-sm sm:text-base leading-relaxed max-w-2xl mx-auto lg:mx-0 font-normal">
              আধুনিক <b>CSA লেজার প্রযুক্তির</b> সাহায্যে স্থায়ী হেয়ার রিমুভাল, মেছতা ও ব্রণের দাগ অপসারণ, হাইড্রা ফেসিয়াল এবং ব্রাইডাল এইচডি মেকআপের নির্ভরযোগ্য প্রতিষ্ঠান। অভিজ্ঞ নারী লেজার স্পেশালিস্ট দ্বারা পরিচালিত।
            </p>

            {/* CTA Action Buttons */}
            <div className="pt-2 flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3.5">
              {onOpenAppointmentModal && (
                <button
                  onClick={onOpenAppointmentModal}
                  className="w-full sm:w-auto px-7 py-3.5 rounded-2xl bg-gradient-to-r from-rose-600 via-pink-600 to-rose-700 hover:from-rose-700 hover:to-pink-800 text-white font-extrabold text-sm sm:text-base transition-all shadow-xl shadow-rose-600/30 flex items-center justify-center gap-2 cursor-pointer group"
                >
                  <Calendar className="w-5 h-5 transition-transform group-hover:scale-110" />
                  <span>অনলাইন বুকিং নিন</span>
                  <ArrowRight className="w-4 h-4 text-white group-hover:translate-x-1 transition-transform" />
                </button>
              )}

              <a
                href="tel:01302383795"
                className="w-full sm:w-auto px-6 py-3.5 rounded-2xl bg-white/10 hover:bg-white/20 active:bg-white/30 text-white font-bold text-sm sm:text-base border border-white/20 flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                <PhoneCall className="w-4 h-4 text-emerald-400 animate-bounce" />
                <span>হটলাইন: 01302383795</span>
              </a>
            </div>

            {/* Trust Badges */}
            <div className="pt-6 border-t border-slate-800/80 grid grid-cols-3 gap-3 max-w-lg mx-auto lg:mx-0 text-left">
              <div className="flex flex-col items-center lg:items-start text-center lg:text-left">
                <ShieldCheck className="w-5 h-5 text-rose-400 mb-1" />
                <span className="text-xs font-bold text-white">CSA লেজার টেক</span>
                <span className="text-[11px] text-slate-400">১০০% ব্যথামুক্ত</span>
              </div>

              <div className="flex flex-col items-center lg:items-start text-center lg:text-left">
                <Star className="w-5 h-5 text-amber-400 mb-1 fill-amber-400" />
                <span className="text-xs font-bold text-white">অভিজ্ঞ স্পেশালিস্ট</span>
                <span className="text-[11px] text-slate-400">নারী টিম দ্বারা সেবা</span>
              </div>

              <div className="flex flex-col items-center lg:items-start text-center lg:text-left">
                <Heart className="w-5 h-5 text-pink-400 mb-1" />
                <span className="text-xs font-bold text-white">স্যানিটাইজড সেন্টার</span>
                <span className="text-[11px] text-slate-400">ব্যক্তিগত গোপনীয়তা</span>
              </div>
            </div>

          </div>

          {/* Hero Right Visual Card */}
          <div className="lg:col-span-5 flex justify-center">
            <div className="relative w-full max-w-md">
              <div className="relative rounded-3xl bg-gradient-to-b from-slate-900 to-rose-950/90 border border-rose-500/30 p-5 shadow-2xl overflow-hidden group">
                
                <div className="absolute top-3 right-3 bg-rose-600 text-white font-bold text-xs px-3 py-1 rounded-full shadow-md z-10 flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                  <span>CSA লেজার শাখা</span>
                </div>

                <div className="aspect-4/3 rounded-2xl overflow-hidden bg-slate-950 mb-4 relative">
                  <img
                    src="https://images.unsplash.com/photo-1560750588-73207b1ef5b8?auto=format&fit=crop&w=800&q=80"
                    alt="Tanu Beauty Parlour & Laser Center"
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    loading="eager"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent" />
                  <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-xs text-white">
                    <span className="font-bold bg-rose-600/90 backdrop-blur-xs px-2.5 py-1 rounded-lg">
                      প্রাইভেট ও স্যানিটাইজড
                    </span>
                    <span className="text-amber-300 font-bold">★ ৪.৯৫ (৩১০+ রিভিউ)</span>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <h3 className="text-base font-extrabold text-white line-clamp-1">
                    স্থায়ী সিএসএ লেজার হেয়ার রিমুভাল ও স্কিন গ্লো
                  </h3>
                  <div className="flex items-baseline gap-2">
                    <span className="text-xl font-extrabold text-rose-400">৳৪৯০</span>
                    <span className="text-sm text-slate-500 line-through">৳১,৫০০</span>
                    <span className="text-xs font-bold text-amber-400">(-৬৭% ছাড়)</span>
                  </div>
                  <p className="text-xs text-slate-300 line-clamp-2">
                    ডুবাইল, সেহড়াতৈল রোড, নাটিয়াপাড়া বাজার, দেলদুয়ার, টাঙ্গাইল। কল করুন: 01302383795
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-rose-900/50 flex items-center justify-between text-xs text-slate-300">
                  <span>সিরিয়াল বুকিং: <b className="text-emerald-400">সকাল ১০টা - রাত ৮টা</b></span>
                  <button
                    onClick={onExploreClick}
                    className="text-rose-400 font-bold hover:underline"
                  >
                    সব সার্ভিস দেখুন →
                  </button>
                </div>

              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};

