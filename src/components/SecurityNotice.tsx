import React from 'react';
import { ShieldCheck, Lock, UserCheck, PhoneCall, RefreshCw } from 'lucide-react';

export const SecurityNotice: React.FC = () => {
  return (
    <section className="py-10 bg-white border-t border-slate-200/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        
        {/* Section Header */}
        <div className="text-center max-w-xl mx-auto space-y-1">
          <h3 className="text-lg sm:text-xl font-bold text-slate-900">
            নিরাপদ সেবা ও কাস্টমার সন্তুষ্টি
          </h3>
          <p className="text-xs text-slate-500">
            প্রতিটি সেবা ও পণ্যে আমরা শতভাগ নিরাপত্তা এবং গোপনীয়তা নিশ্চিত করি
          </p>
        </div>

        {/* 4 Clean Pillars */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/70 space-y-2">
            <div className="w-8 h-8 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center">
              <Lock className="w-4 h-4" />
            </div>
            <h4 className="font-bold text-slate-900 text-xs">ক্যাশ অন ডেলিভারি</h4>
            <p className="text-xs text-slate-500 leading-relaxed">
              অগ্রিম পেমেন্ট ছাড়াই অর্ডার করুন, হাতে পেয়ে নিশ্চিত হয়ে মূল্য দিন।
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/70 space-y-2">
            <div className="w-8 h-8 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center">
              <UserCheck className="w-4 h-4" />
            </div>
            <h4 className="font-bold text-slate-900 text-xs">সম্পূর্ণ গোপনীয়তা</h4>
            <p className="text-xs text-slate-500 leading-relaxed">
              লেজার ট্রিটমেন্ট ও পার্লারে সম্পূর্ণ ব্যক্তিগত নারী নিরাপত্তা বজায় থাকে।
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/70 space-y-2">
            <div className="w-8 h-8 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center">
              <PhoneCall className="w-4 h-4" />
            </div>
            <h4 className="font-bold text-slate-900 text-xs">অর্ডার ভেরিফিকেশন</h4>
            <p className="text-xs text-slate-500 leading-relaxed">
              বুকিং বা অর্ডারের পর আমাদের টিম ফোন করে শিওর করে নেবে।
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/70 space-y-2">
            <div className="w-8 h-8 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center">
              <RefreshCw className="w-4 h-4" />
            </div>
            <h4 className="font-bold text-slate-900 text-xs">সহজ সাপোর্ট ও রিপ্লেসমেন্ট</h4>
            <p className="text-xs text-slate-500 leading-relaxed">
              যেকোনো সমস্যায় তাত্ক্ষণিক পরামর্শ ও সহযোগিতার নির্ভরযোগ্য ব্যবস্থা।
            </p>
          </div>

        </div>

      </div>
    </section>
  );
};
