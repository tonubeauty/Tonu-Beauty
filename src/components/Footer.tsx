import React from 'react';
import { PhoneCall, MapPin, Calendar, Clock, Lock } from 'lucide-react';

interface FooterProps {
  onOpenTrackModal: () => void;
  onSelectCategory: (catId: string) => void;
  onOpenAppointmentModal?: () => void;
  onOpenAdminDashboard?: () => void;
}

export const Footer: React.FC<FooterProps> = ({ 
  onOpenTrackModal, 
  onSelectCategory, 
  onOpenAppointmentModal, 
  onOpenAdminDashboard 
}) => {
  return (
    <footer className="bg-slate-900 text-slate-400 text-xs py-12 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          
          {/* Col 1: Brand */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-rose-600 flex items-center justify-center text-white font-bold text-sm">
                তনু
              </div>
              <span className="text-base font-bold text-white">
                তনু বিউটি পার্লার <span className="text-rose-400 font-normal">& লেজার</span>
              </span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              টাঙ্গাইল দেলদুয়ার অঞ্চলের নির্ভরযোগ্য বিউটি পার্লার ও সিএসএ লেজার ট্রিটমেন্ট সেন্টার।
            </p>
            <span className="inline-block text-[11px] text-rose-400 font-medium">
              CSA লেজারের একটি বিশেষ শাখা
            </span>
          </div>

          {/* Col 2: Services */}
          <div className="space-y-2.5">
            <h4 className="text-white font-bold text-xs uppercase tracking-wider">
              সার্ভিসসমূহ
            </h4>
            <ul className="space-y-1.5 text-xs text-slate-400">
              <li>
                <button onClick={() => onSelectCategory('csa_laser')} className="hover:text-white transition-colors cursor-pointer text-left">
                  সিএসএ লেজার হেয়ার রিমুভাল
                </button>
              </li>
              <li>
                <button onClick={() => onSelectCategory('csa_laser')} className="hover:text-white transition-colors cursor-pointer text-left">
                  মেছতা ও ব্রণের দাগ অপসারণ
                </button>
              </li>
              <li>
                <button onClick={() => onSelectCategory('facial_skin')} className="hover:text-white transition-colors cursor-pointer text-left">
                  ডিপ হাইড্রা ফেসিয়াল ও গ্লো
                </button>
              </li>
              <li>
                <button onClick={() => onSelectCategory('bridal_makeup')} className="hover:text-white transition-colors cursor-pointer text-left">
                  এইচডি ব্রাইডাল মেকআপ
                </button>
              </li>
            </ul>
          </div>

          {/* Col 3: Timing & Serial Booking */}
          <div className="space-y-3">
            <h4 className="text-white font-bold text-xs uppercase tracking-wider">
              সময়সূচি ও বুকিং
            </h4>
            <div className="space-y-2 text-xs text-slate-400">
              <div className="flex items-start gap-2">
                <Clock className="w-3.5 h-3.5 text-slate-300 shrink-0 mt-0.5" />
                <span>প্রতিদিন: সকাল ১০:০০ টা - রাত ৮:০০ টা</span>
              </div>

              {onOpenAppointmentModal && (
                <button
                  onClick={onOpenAppointmentModal}
                  className="mt-1 inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-white font-semibold transition-colors cursor-pointer text-xs"
                >
                  <Calendar className="w-3.5 h-3.5" />
                  <span>অনলাইন সিরিয়াল নিন</span>
                </button>
              )}
            </div>
          </div>

          {/* Col 4: Contact */}
          <div className="space-y-3">
            <h4 className="text-white font-bold text-xs uppercase tracking-wider">
              যোগাযোগ
            </h4>
            <div className="space-y-2 text-xs text-slate-400">
              <a href="tel:01302383795" className="flex items-center gap-1.5 text-white font-bold hover:text-rose-400 transition-colors">
                <PhoneCall className="w-3.5 h-3.5 text-emerald-400" />
                <span>01302383795</span>
              </a>

              <div className="flex items-start gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-rose-400 shrink-0 mt-0.5" />
                <span className="leading-relaxed">
                  ডুবাইল, সেহড়াতৈল রোড, নাটিয়াপাড়া বাজার, দেলদুয়ার, টাঙ্গাইল
                </span>
              </div>
            </div>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="pt-6 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3 text-slate-500 text-xs">
          <p>© {new Date().getFullYear()} তনু বিউটি পার্লার এন্ড লেজার সেন্টার। সর্বস্বত্ব সংরক্ষিত।</p>

          <div className="flex items-center gap-4 text-xs">
            <button
              onClick={onOpenTrackModal}
              className="hover:text-slate-300 transition-colors cursor-pointer"
            >
              বুকিং ট্র্যাকিং
            </button>
            {onOpenAdminDashboard && (
              <button
                onClick={onOpenAdminDashboard}
                className="hover:text-white transition-colors cursor-pointer flex items-center gap-1"
              >
                <Lock className="w-3 h-3" />
                <span>এডমিন</span>
              </button>
            )}
          </div>
        </div>

      </div>
    </footer>
  );
};
