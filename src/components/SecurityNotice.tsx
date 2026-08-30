import React from 'react';
import { ShieldCheck, Lock, UserCheck, CheckCircle2, PhoneCall, RefreshCw } from 'lucide-react';

export const SecurityNotice: React.FC = () => {
  return (
    <section className="py-12 bg-white border-t border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        
        {/* Title */}
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>ডেটা সুরক্ষা ও সিকিউরিটি গ্যারান্টি</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            আপনার সুরক্ষায় আমাদের সর্বোচ্চ অগ্রাধিকার
          </h2>
          <p className="text-xs sm:text-sm text-slate-600">
            দেশী বাজারে আপনার কেনাকাটা সম্পূর্ণ ঝুঁকিমুক্ত এবং নিরাপদ রাখতে আমরা আধুনিক প্রোটোকল অনুসরণ করি।
          </p>
        </div>

        {/* 4 Pillar Security Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          
          {/* Card 1: 100% COD */}
          <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-3 transition-all hover:border-emerald-300 hover:shadow-sm">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
              <Lock className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-slate-900 text-base">১০০% ক্যাশ অন ডেলিভারি</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              কোনো অগ্রিম পেমেন্ট বা কার্ডের তথ্য দেওয়ার প্রয়োজন নেই। পণ্য হাতে পেয়ে পুরোপুরি যাচাই করে টাকা দিন।
            </p>
          </div>

          {/* Card 2: Encrypted Data */}
          <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-3 transition-all hover:border-emerald-300 hover:shadow-sm">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
              <UserCheck className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-slate-900 text-base">ব্যক্তিগত তথ্য সুরক্ষা</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              আপনার নাম, ফোন নম্বর ও ঠিকানা শুধুমাত্র কুরিয়ার ডেলিভারির কাজে ব্যবহৃত হয়। তথ্য গোপন রাখা আমাদের ওয়াদা।
            </p>
          </div>

          {/* Card 3: Anti-Fraud Order Verification */}
          <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-3 transition-all hover:border-emerald-300 hover:shadow-sm">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
              <PhoneCall className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-slate-900 text-base">ফোন ভেরিফিকেশন কল</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              ভুয়া অর্ডার রোধ করতে প্রতিটি অর্ডারের পর আমাদের প্রতিনিধি আপনাকে কল করে নিশ্চিত করবেন।
            </p>
          </div>

          {/* Card 4: Hassle-Free Replacement */}
          <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-3 transition-all hover:border-emerald-300 hover:shadow-sm">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
              <RefreshCw className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-slate-900 text-base">সহজ পরিবর্তন গ্যারান্টি</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              পণ্য ক্ষতিগ্রস্ত বা ত্রুটিপূর্ণ হলে ৭ দিনের মধ্যে বিনামূল্যে পরিবর্তন অথবা রিফান্ড সুবিধা।
            </p>
          </div>

        </div>

        {/* Security Trust Badges Strip */}
        <div className="p-4 bg-emerald-900 text-emerald-100 rounded-2xl flex flex-wrap items-center justify-around gap-4 text-xs font-semibold">
          <span className="flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" /> SSL 256-Bit এনক্রিপশন
          </span>
          <span className="flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" /> বিএসটিআই ও কোয়ালিটি সার্টিফাইড
          </span>
          <span className="flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" /> ২৪/৭ ডেডিকেটেড কাস্টমার কেয়ার
          </span>
        </div>

      </div>
    </section>
  );
};
