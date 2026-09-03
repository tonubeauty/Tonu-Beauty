import React, { useState } from 'react';
import { X, Printer, Check, PhoneCall, MapPin, QrCode, Sparkles, Lock, FileText } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { Order } from '../types';
import { generateOfflineReceiptText, getSecureReceiptUrl } from '../lib/receiptHelper';

interface A4PrintInvoiceProps {
  order: Order;
  onClose: () => void;
  parlourInfo?: {
    branchName: string;
    hotline: string;
    address: string;
    hours: string;
  };
}

export const A4PrintInvoice: React.FC<A4PrintInvoiceProps> = ({
  order,
  onClose,
  parlourInfo = {
    branchName: 'তনু বিউটি পার্লার এন্ড লেজার সেন্টার',
    hotline: '01302383795',
    address: 'ডুবাইল, সেহড়াতৈল রোড, নাটিয়াপাড়া বাজার, দেলদুয়ার, টাঙ্গাইল',
    hours: 'সকাল ১০:০০ টা - রাত ৮:০০ টা',
  },
}) => {
  const [qrMode, setQrMode] = useState<'secure_link' | 'offline_text'>('secure_link');

  const handlePrint = () => {
    window.print();
  };

  const secureReceiptUrl = getSecureReceiptUrl(order.orderId);
  const offlineReceiptText = generateOfflineReceiptText(order, parlourInfo);
  const activeQrValue = qrMode === 'offline_text' ? offlineReceiptText : secureReceiptUrl;

  const subtotal = order.subtotal || order.items.reduce((sum, it) => sum + (it.price * it.quantity), 0);
  const discount = order.discount || 0;
  const deliveryFee = order.deliveryFee || 0;
  const totalAmount = order.totalAmount || (subtotal - discount + deliveryFee);
  const paidAmount = order.paidAmount !== undefined ? order.paidAmount : totalAmount;
  const dueAmount = order.dueAmount !== undefined ? order.dueAmount : Math.max(0, totalAmount - paidAmount);

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 print:p-0 print:bg-white print:static print:overflow-visible">
      
      {/* Container */}
      <div className="relative bg-white rounded-2xl shadow-2xl max-w-4xl w-full border border-slate-200 overflow-hidden flex flex-col my-auto max-h-[96vh] print:max-h-none print:h-auto print:border-none print:shadow-none print:rounded-none">
        
        {/* Top Floating Action Bar (Hidden during print) */}
        <div className="bg-slate-900 text-white px-5 py-3 flex flex-wrap items-center justify-between gap-3 print:hidden shrink-0">
          <div className="flex items-center gap-2">
            <span className="font-bold text-sm">A4 প্রিন্ট ইনভয়েস প্রিভিউ</span>
            <span className="text-xs text-slate-400">({order.orderId})</span>
          </div>

          {/* QR Code Mode Selector */}
          <div className="flex items-center gap-1.5 bg-slate-800 p-1 rounded-xl border border-slate-700 text-xs">
            <span className="text-[11px] text-slate-400 pl-2 pr-1 font-medium hidden sm:inline">QR মোড:</span>
            <button
              type="button"
              onClick={() => setQrMode('secure_link')}
              className={`px-2.5 py-1 rounded-lg font-bold transition-all flex items-center gap-1.5 cursor-pointer text-xs ${
                qrMode === 'secure_link'
                  ? 'bg-rose-600 text-white shadow-xs'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
              title="স্ক্যান করলে শুধুমাত্র এই ডিজিটাল রিসিটটি সুরক্ষিতভাবে দেখাবে (ওয়েবসাইট লক থাকবে)"
            >
              <Lock className="w-3.5 h-3.5" />
              <span>সিকিউর রিসিট লিংক</span>
            </button>
            <button
              type="button"
              onClick={() => setQrMode('offline_text')}
              className={`px-2.5 py-1 rounded-lg font-bold transition-all flex items-center gap-1.5 cursor-pointer text-xs ${
                qrMode === 'offline_text'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
              title="স্ক্যান করলে কোনো ওয়েবসাইট ছাড়াই সরাসরি ক্যামেরা স্ক্রিনে মেমো টেক্সট ভেসে উঠবে"
            >
              <FileText className="w-3.5 h-3.5" />
              <span>সরাসরি টেক্সট মেমো</span>
            </button>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handlePrint}
              className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
            >
              <Printer className="w-4 h-4" />
              <span>A4 প্রিন্ট করুন</span>
            </button>

            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center justify-center transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Scrollable Preview Area for Screen / Fixed A4 sheet for Print */}
        <div className="p-4 sm:p-8 overflow-y-auto flex-1 bg-slate-100 print:bg-white print:p-0 flex justify-center">
          
          {/* A4 Sheet Dimensions on Paper: 210mm x 297mm */}
          <div 
            id="printable-a4-invoice"
            className="w-full max-w-[210mm] bg-white p-8 sm:p-10 border border-slate-300 shadow-sm print:border-none print:shadow-none print:p-6 print:w-full space-y-6 text-slate-900 text-xs"
            style={{ minHeight: '280mm' }}
          >
            
            {/* 1. Header Section */}
            <div className="flex items-start justify-between border-b-2 border-slate-900 pb-5">
              <div className="space-y-1.5 max-w-md">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-rose-700 text-white font-bold flex items-center justify-center text-sm">
                    তনু
                  </div>
                  <div>
                    <h1 className="text-xl font-extrabold text-slate-900 tracking-tight leading-none">
                      {parlourInfo.branchName}
                    </h1>
                    <span className="text-[11px] font-semibold text-rose-700">
                      CSA লেজার ট্রিটমেন্ট ও বিউটি কেয়ার শাখা
                    </span>
                  </div>
                </div>

                <div className="text-[11px] text-slate-600 space-y-0.5 pt-1">
                  <p className="flex items-center gap-1">
                    <MapPin className="w-3 h-3 text-slate-500 shrink-0" />
                    <span>{parlourInfo.address}</span>
                  </p>
                  <p className="flex items-center gap-1">
                    <PhoneCall className="w-3 h-3 text-slate-500 shrink-0" />
                    <span className="font-semibold">হটলাইন: {parlourInfo.hotline}</span>
                    <span className="text-slate-400">|</span>
                    <span>সময়: {parlourInfo.hours}</span>
                  </p>
                </div>
              </div>

              {/* Invoice Title & Meta */}
              <div className="text-right space-y-1">
                <span className="inline-block bg-slate-900 text-white font-black text-xs px-3 py-1 rounded-md uppercase tracking-wider">
                  মানি রিসিট / ইনভয়েস
                </span>
                <div className="text-xs space-y-0.5 pt-1">
                  <p><b>ইনভয়েস নং:</b> <span className="font-mono">{order.orderId}</span></p>
                  <p><b>তারিখ:</b> {new Date(order.createdAt).toLocaleDateString('bn-BD', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                  <p><b>টাইপ:</b> {order.orderType === 'manual_bill' ? 'ম্যানুয়াল বিল' : order.orderType === 'appointment' ? 'অনলাইন বুকিং' : 'অর্ডার'}</p>
                </div>
              </div>
            </div>

            {/* 2. Customer & Bill Info Grid */}
            <div className="grid grid-cols-2 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-200">
              <div className="space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">
                  গ্রাহকের তথ্য (Bill To):
                </span>
                <p className="text-sm font-bold text-slate-900">{order.customerName}</p>
                <p className="text-xs font-semibold text-slate-800">মোবাইল: {order.phone}</p>
                {order.address && <p className="text-xs text-slate-600 leading-tight">ঠিকানা: {order.address}</p>}
                {order.district && <p className="text-xs text-slate-500">জেলা/থানা: {order.district}</p>}
              </div>

              <div className="space-y-1 text-right">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">
                  পেমেন্ট বিবরণ (Payment Details):
                </span>
                <p className="text-xs">
                  পেমেন্ট মেথড: <b>{order.paymentMethod === 'cod' ? 'ক্যাশ অন ডেলিভারি' : order.paymentMethod === 'bkash' ? 'বিকাশ (bKash)' : order.paymentMethod === 'nagad' ? 'নগদ (Nagad)' : 'ক্যাশ পেমেন্ট'}</b>
                </p>
                <p className="text-xs">
                  স্ট্যাটাস: <b className="text-emerald-700">{order.status === 'delivered' ? 'সম্পন্ন' : order.status === 'confirmed' ? 'নিশ্চিতকৃত' : 'পেন্ডিং'}</b>
                </p>
                {order.notes && (
                  <p className="text-xs text-slate-600 italic">নোট: {order.notes}</p>
                )}
              </div>
            </div>

            {/* 3. Items & Services Table */}
            <div className="border border-slate-300 rounded-xl overflow-hidden">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-900 text-white font-bold">
                  <tr>
                    <th className="py-2.5 px-3 w-10 text-center">নং</th>
                    <th className="py-2.5 px-3">সার্ভিস / পণ্যের বিবরণ</th>
                    <th className="py-2.5 px-3 text-right">একক রেট (৳)</th>
                    <th className="py-2.5 px-3 text-center">পরিমাণ</th>
                    <th className="py-2.5 px-3 text-right">মোট টাকা (৳)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {order.items.map((it, idx) => (
                    <tr key={idx} className={idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/70'}>
                      <td className="py-2.5 px-3 text-center font-medium text-slate-500">{idx + 1}</td>
                      <td className="py-2.5 px-3 font-semibold text-slate-900">
                        {it.productTitle}
                        {it.color && <span className="text-slate-500 font-normal text-[11px] ml-1">({it.color})</span>}
                      </td>
                      <td className="py-2.5 px-3 text-right text-slate-700">
                        ৳{it.price.toLocaleString('bn-BD')}
                      </td>
                      <td className="py-2.5 px-3 text-center font-bold text-slate-800">
                        {it.quantity}
                      </td>
                      <td className="py-2.5 px-3 text-right font-bold text-slate-900">
                        ৳{(it.price * it.quantity).toLocaleString('bn-BD')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* 4. Calculation Totals & QR Code Verification */}
            <div className="grid grid-cols-12 gap-4 items-start pt-2">
              
              {/* Left Column: QR Code & Verification Note */}
              <div className="col-span-7 flex items-center gap-4 bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                <div className="bg-white p-1.5 rounded-lg border border-slate-200 shrink-0">
                  <QRCodeSVG 
                    value={activeQrValue} 
                    size={qrMode === 'offline_text' ? 88 : 84} 
                    level={qrMode === 'offline_text' ? 'L' : 'M'} 
                  />
                </div>
                <div className="space-y-1">
                  <span className="text-[11px] font-bold text-slate-900 flex items-center gap-1">
                    {qrMode === 'offline_text' ? (
                      <>
                        <FileText className="w-3.5 h-3.5 text-emerald-600" />
                        <span>অফলাইন ডিজিটাল মেমো QR</span>
                      </>
                    ) : (
                      <>
                        <Lock className="w-3.5 h-3.5 text-rose-600" />
                        <span>সুরক্ষিত ডিজিটাল রিসিট QR</span>
                      </>
                    )}
                  </span>
                  <p className="text-[10px] text-slate-600 leading-tight">
                    {qrMode === 'offline_text'
                      ? 'যেকোনো ক্যামেরা দিয়ে স্ক্যান করলে ওয়েবসাইট ওপেন না হয়ে সরাসরি মেমোর পূর্ণ টেক্সট ভেসে উঠবে।'
                      : 'স্ক্যান করলে শুধুমাত্র এই মেমোর অফিসিয়াল ভাউচারটি দেখতে পাবেন। মূল ওয়েবসাইট সম্পূর্ণ গোপন ও সুরক্ষিত।'}
                  </p>
                  <p className="text-[10px] font-mono text-slate-500 truncate max-w-[200px]">
                    ID: {order.orderId}
                  </p>
                </div>
              </div>

              {/* Right Column: Amount Summary */}
              <div className="col-span-5 space-y-1.5 text-xs">
                <div className="flex justify-between text-slate-600">
                  <span>সাবটোটাল:</span>
                  <span className="font-semibold">৳{subtotal.toLocaleString('bn-BD')}</span>
                </div>

                {discount > 0 && (
                  <div className="flex justify-between text-rose-700 font-medium">
                    <span>বিশেষ ছাড়:</span>
                    <span>- ৳{discount.toLocaleString('bn-BD')}</span>
                  </div>
                )}

                {deliveryFee > 0 && (
                  <div className="flex justify-between text-slate-600">
                    <span>ডেলিভারি চার্জ:</span>
                    <span>৳{deliveryFee.toLocaleString('bn-BD')}</span>
                  </div>
                )}

                <div className="flex justify-between border-t-2 border-slate-900 pt-1.5 text-sm font-extrabold text-slate-900">
                  <span>সর্বমোট বিল:</span>
                  <span>৳{totalAmount.toLocaleString('bn-BD')}</span>
                </div>

                <div className="flex justify-between text-xs text-emerald-800 font-semibold pt-1">
                  <span>পরিশোধিত (Paid):</span>
                  <span>৳{paidAmount.toLocaleString('bn-BD')}</span>
                </div>

                {dueAmount > 0 ? (
                  <div className="flex justify-between text-xs text-rose-700 font-bold">
                    <span>বকেয়া (Due):</span>
                    <span>৳{dueAmount.toLocaleString('bn-BD')}</span>
                  </div>
                ) : (
                  <div className="flex justify-between text-[11px] text-emerald-700 font-bold">
                    <span>পেমেন্ট স্ট্যাটাস:</span>
                    <span>সম্পূর্ণ পরিশোধিত (Paid)</span>
                  </div>
                )}
              </div>

            </div>

            {/* 5. Terms & Signature */}
            <div className="pt-12 grid grid-cols-2 gap-8 items-end">
              <div className="text-[10px] text-slate-500 space-y-1">
                <p className="font-bold text-slate-700">বিশেষ জ্ঞাতব্য:</p>
                <p>১. CSA লেজার ও স্কিন কেয়ারে বিশেষজ্ঞ পরামর্শ অনুযায়ী সেবা গ্রহণ করুন।</p>
                <p>২. কম্পিউটার জেনারেটেড ইনভয়েস। কোনো ওভাররাইটিং গ্রহণযোগ্য নয়।</p>
                <p className="font-semibold text-rose-700">তনু বিউটি পার্লারে আসার জন্য আপনাকে আন্তরিক ধন্যবাদ!</p>
              </div>

              <div className="text-center space-y-1">
                <div className="border-t border-slate-400 w-48 ml-auto" />
                <p className="text-xs font-bold text-slate-800 text-right pr-4">
                  অনুমোদিত স্বাক্ষর ও সিল
                </p>
                <p className="text-[10px] text-slate-500 text-right pr-4">
                  তনু বিউটি পার্লার & লেজার সেন্টার
                </p>
              </div>
            </div>

          </div>

        </div>

      </div>

    </div>
  );
};
