import React from 'react';
import { PhoneCall, MapPin, Sparkles, Clock, ShieldCheck, Heart } from 'lucide-react';

interface FooterProps {
  onOpenTrackModal: () => void;
  onSelectCategory: (catId: string) => void;
  onOpenAppointmentModal?: () => void;
  onOpenAdminDashboard?: () => void;
}

export const Footer: React.FC<FooterProps> = ({ onOpenTrackModal, onSelectCategory, onOpenAppointmentModal, onOpenAdminDashboard }) => {
  return (
    <footer className="bg-slate-950 text-slate-300 text-xs sm:text-sm pt-12 pb-8 border-t border-rose-900/40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          
          {/* Col 1: Brand Info */}
          <div className="space-y-3">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-rose-600 to-pink-600 flex items-center justify-center text-white font-extrabold text-lg shadow-md">
                তনু
              </div>
              <div>
                <span className="text-base font-extrabold text-white block leading-tight">
                  তনু বিউটি পার্লার <span className="text-rose-400">& লেজার সেন্টার</span>
                </span>
                <span className="text-[10px] text-amber-300 font-bold">
                  ⭐ CSA লেজারের একটি শাখা
                </span>
              </div>
            </div>

            <p className="text-slate-400 text-xs leading-relaxed">
              টাঙ্গাইল দেলদুয়ার অঞ্চলের আধুনিকতম বিউটি ও সিএসএ লেজার ট্রিটমেন্ট সেন্টার। অভিজ্ঞ নারী টিম দ্বারা সম্পূর্ণ নিরাপদ ও হাইজিনিক পরিবেশে সেবা দেওয়া হয়।
            </p>

            <div className="pt-1 flex items-center gap-2 text-rose-300 font-semibold text-xs">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>১০০% ব্যথামুক্ত ও আধুনিক CSA প্রযুক্তি</span>
            </div>
          </div>

          {/* Col 2: Popular Services */}
          <div className="space-y-3">
            <h4 className="text-white font-bold text-sm uppercase tracking-wider border-b border-rose-900/40 pb-2">
              জনপ্রিয় সার্ভিসসমূহ
            </h4>
            <ul className="space-y-2 text-xs text-slate-400">
              <li>
                <button onClick={() => onSelectCategory('csa_laser')} className="hover:text-rose-300 transition-colors cursor-pointer text-left">
                  • CSA লেজার স্থায়ী হেয়ার রিমুভাল
                </button>
              </li>
              <li>
                <button onClick={() => onSelectCategory('csa_laser')} className="hover:text-rose-300 transition-colors cursor-pointer text-left">
                  • মেছতা ও ব্রণের দাগ রিমুভাল
                </button>
              </li>
              <li>
                <button onClick={() => onSelectCategory('facial_skin')} className="hover:text-rose-300 transition-colors cursor-pointer text-left">
                  • ৭-স্টেপ ডিপ হাইড্রা ফেসিয়াল
                </button>
              </li>
              <li>
                <button onClick={() => onSelectCategory('bridal_makeup')} className="hover:text-rose-300 transition-colors cursor-pointer text-left">
                  • প্রিমিয়াম এইচডি ব্রাইডাল মেকআপ
                </button>
              </li>
              <li>
                <button onClick={() => onSelectCategory('hair_spa')} className="hover:text-rose-300 transition-colors cursor-pointer text-left">
                  • সিল্কি হেয়ার রিবন্ডিং ও কেরাটিন স্পা
                </button>
              </li>
            </ul>
          </div>

          {/* Col 3: Timing & Serial Booking */}
          <div className="space-y-3">
            <h4 className="text-white font-bold text-sm uppercase tracking-wider border-b border-rose-900/40 pb-2">
              সিরিয়াল ও অ্যাপয়েন্টমেন্ট
            </h4>
            <div className="space-y-2.5 text-xs text-slate-400">
              {onOpenAppointmentModal && (
                <button
                  onClick={onOpenAppointmentModal}
                  className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-gradient-to-r from-rose-600 to-pink-600 text-white font-bold transition-all shadow cursor-pointer hover:from-rose-700 hover:to-pink-700"
                >
                  <Sparkles className="w-4 h-4 text-amber-300" />
                  <span>অনলাইন বুকিং ফরম ওপেন করুন</span>
                </button>
              )}

              <div className="flex items-start gap-2 pt-1">
                <Clock className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <span>পার্লার সময়সূচি: সকাল ১০:০০ টা - রাত ৮:০০ টা (প্রতিদিন খোলা)</span>
              </div>

              <div className="flex items-start gap-2">
                <Heart className="w-4 h-4 text-pink-400 shrink-0 mt-0.5" />
                <span>অভিজ্ঞ নারী স্পেশালিস্ট দ্বারা ১০০% প্রাইভেসি রক্ষা নিশ্চিত</span>
              </div>
            </div>
          </div>

          {/* Col 4: Official Contact Info */}
          <div className="space-y-3">
            <h4 className="text-white font-bold text-sm uppercase tracking-wider border-b border-rose-900/40 pb-2">
              ঠিকানা ও যোগাযোগ
            </h4>
            <div className="space-y-2.5 text-xs text-slate-400">
              <a href="tel:01302383795" className="flex items-center gap-2 text-amber-300 font-extrabold text-sm hover:text-amber-200 transition-colors">
                <PhoneCall className="w-4 h-4 text-emerald-400 animate-bounce" />
                <span>হটলাইন: 01302383795</span>
              </a>

              <div className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                <span className="text-slate-300 font-medium leading-relaxed">
                  <b>ঠিকানা:</b> ডুবাইল, সেহড়াতৈল রোড, নাটিয়াপাড়া বাজার, দেলদুয়ার, টাঙ্গাইল।
                </span>
              </div>

              <div className="p-2.5 rounded-xl bg-white/5 border border-white/10 text-[11px] text-rose-200 font-semibold">
                ⭐ CSA লেজারের একটি শাখা
              </div>
            </div>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="pt-6 border-t border-rose-900/30 flex flex-col sm:flex-row items-center justify-between gap-4 text-slate-500 text-xs">
          <p>© {new Date().getFullYear()} তনু বিউটি পার্লার এন্ড লেজার সেন্টার। সর্বস্বত্ব সংরক্ষিত।</p>

          <div className="flex items-center gap-3 text-[11px] text-slate-400">
            <span>ডুবাইল, দেলদুয়ার, টাঙ্গাইল</span>
            <span>•</span>
            <span>ফোন: 01302383795</span>
            {onOpenAdminDashboard && (
              <>
                <span>•</span>
                <button
                  onClick={onOpenAdminDashboard}
                  className="text-amber-300 hover:text-amber-200 font-bold hover:underline cursor-pointer"
                >
                  🔒 এডমিন ড্যাশবোর্ড
                </button>
              </>
            )}
          </div>
        </div>

      </div>
    </footer>
  );
};

