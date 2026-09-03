import React, { useEffect, useState } from 'react';
import { Order } from '../types';
import { getSingleOrderFromFirestore } from '../lib/firebase';
import { printElementViaAboutBlank } from '../lib/printHelper';
import {
  ShieldCheck,
  Printer,
  Calendar,
  User,
  Phone,
  CheckCircle2,
  AlertCircle,
  FileText,
  Clock,
  Lock,
  Loader2
} from 'lucide-react';

interface IsolatedReceiptViewProps {
  orderId: string;
}

export const IsolatedReceiptView: React.FC<IsolatedReceiptViewProps> = ({ orderId }) => {
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Update document title for the receipt
    document.title = `ডিজিটাল রিসিট #${orderId} - তনু বিউটি পার্লার`;

    const fetchOrder = async () => {
      setLoading(true);
      setError(null);

      try {
        const cleanTargetId = (orderId || '').toLowerCase().trim();

        // 1. Try checking local storage first
        const localSaved = localStorage.getItem('tanu_orders');
        if (localSaved) {
          try {
            const parsed: Order[] = JSON.parse(localSaved);
            const found = parsed.find(
              (o) =>
                (o.orderId || '').toLowerCase().trim() === cleanTargetId ||
                (o.orderId || '').toLowerCase().replace(/\D/g, '') === cleanTargetId.replace(/\D/g, '')
            );
            if (found) {
              setOrder(found);
              setLoading(false);
              return;
            }
          } catch (e) {
            console.error('Error parsing local orders:', e);
          }
        }

        // 2. Fetch from Firebase Firestore
        const fsOrder = await getSingleOrderFromFirestore(orderId);
        if (fsOrder) {
          setOrder(fsOrder);
          setLoading(false);
          return;
        }

        // 3. Fallback: check other format or error
        setError('উক্ত মেমো বা বুকিং নম্বরের কোনো রেকর্ড সার্ভারে পাওয়া যায়নি।');
      } catch (err) {
        console.error('Error loading receipt:', err);
        setError('মেমোর তথ্য লোড করতে সমস্যা হয়েছে। ইন্টারনেট সংযোগ চেক করুন।');
      } finally {
        setLoading(false);
      }
    };

    if (orderId) {
      fetchOrder();
    } else {
      setError('কোনো মেমো নম্বর প্রদান করা হয়নি।');
      setLoading(false);
    }
  }, [orderId]);

  const handlePrint = () => {
    printElementViaAboutBlank('isolated-digital-receipt', {
      title: `ডিজিটাল_রিসিট_${order?.orderId || ''}`,
      pageFormat: 'receipt',
    });
  };

  const parlourInfo = {
    branchName: 'তনু বিউটি পার্লার এন্ড লেজার সেন্টার',
    hotline: '01302383795',
    address: 'ডুবাইল, সেহড়াতৈল রোড, নাটিয়াপাড়া বাজার, দেলদুয়ার, টাঙ্গাইল',
    hours: 'সকাল ১০:০০ টা - রাত ৮:০০ টা',
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-100 flex flex-col items-center justify-center p-4">
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200 text-center space-y-3 max-w-sm w-full">
          <Loader2 className="w-8 h-8 text-rose-600 animate-spin mx-auto" />
          <p className="text-sm font-bold text-slate-800">ডিজিটাল রিসিট লোড হচ্ছে...</p>
          <p className="text-xs text-slate-500">অনুগ্রহ করে কয়েক সেকেন্ড অপেক্ষা করুন</p>
        </div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="min-h-screen bg-slate-100 flex flex-col items-center justify-center p-4 font-['Anek_Bangla','Plus_Jakarta_Sans',sans-serif]">
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200 text-center space-y-4 max-w-md w-full">
          <div className="w-12 h-12 bg-rose-100 text-rose-600 rounded-full flex items-center justify-center mx-auto">
            <AlertCircle className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <h2 className="text-base font-bold text-slate-900">মেমো পাওয়া যায়নি</h2>
            <p className="text-xs text-slate-600 leading-relaxed">
              {error || 'মেমো আইডি সঠিক নয় অথবা এটি সার্ভার থেকে মুছে ফেলা হয়েছে।'}
            </p>
          </div>
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-600 space-y-1">
            <p className="font-semibold text-slate-800">সহায়তার জন্য পার্লারের হটলাইনে যোগাযোগ করুন:</p>
            <p className="font-bold text-rose-700">{parlourInfo.hotline}</p>
          </div>
        </div>
      </div>
    );
  }

  const subtotal = order.subtotal || order.items.reduce((s, it) => s + it.price * it.quantity, 0);
  const discount = order.discount || 0;
  const deliveryFee = order.deliveryFee || 0;
  const total = order.totalAmount || subtotal - discount + deliveryFee;
  const paid = order.paidAmount !== undefined ? order.paidAmount : total;
  const due = order.dueAmount !== undefined ? order.dueAmount : Math.max(0, total - paid);
  const isPaidFull = due === 0;

  return (
    <div className="min-h-screen bg-slate-100 text-slate-800 py-6 px-3 sm:px-6 flex flex-col items-center justify-center font-['Anek_Bangla','Plus_Jakarta_Sans',sans-serif] print:bg-white print:p-0">
      
      {/* Top Floating Print Bar (Hidden on Print) */}
      <div className="max-w-xl w-full mb-4 flex items-center justify-between bg-slate-900 text-white px-4 py-2.5 rounded-2xl shadow-md print:hidden">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span className="text-xs font-bold">অফিসিয়াল ডিজিটাল রিসিট</span>
        </div>
        <button
          onClick={handlePrint}
          className="px-3.5 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
        >
          <Printer className="w-3.5 h-3.5" />
          <span>প্রিন্ট / PDF সেভ করুন</span>
        </button>
      </div>

      {/* Standalone Digital Cash Memo Card */}
      <div id="isolated-digital-receipt" className="bg-white max-w-xl w-full rounded-2xl shadow-lg border border-slate-200 overflow-hidden print:shadow-none print:border-none print:rounded-none">
        
        {/* Receipt Header */}
        <div className="p-6 sm:p-7 border-b border-slate-200 bg-linear-to-b from-rose-50/50 to-white text-center space-y-2">
          <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-100 border border-emerald-300 text-emerald-800 text-[11px] font-bold">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>ভেরিফাইড অফিসিয়াল ডিজিটাল ক্যাশ মেমো</span>
          </div>

          <h1 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight pt-1">
            {parlourInfo.branchName}
          </h1>

          <p className="text-xs text-slate-600 max-w-md mx-auto leading-relaxed">
            {parlourInfo.address}
          </p>

          <p className="text-xs font-bold text-rose-700">
            হটলাইন: {parlourInfo.hotline}
          </p>
        </div>

        {/* Memo Meta Information */}
        <div className="p-5 sm:p-6 bg-slate-50/80 border-b border-slate-200 grid grid-cols-2 gap-3 text-xs">
          <div className="space-y-1.5">
            <div className="flex items-center gap-1.5 text-slate-500">
              <FileText className="w-3.5 h-3.5 text-slate-400" />
              <span>মেমো / বুকিং নম্বর:</span>
            </div>
            <p className="font-extrabold text-sm text-slate-900 font-mono">
              #{order.orderId}
            </p>
          </div>

          <div className="space-y-1.5 text-right sm:text-left">
            <div className="flex items-center gap-1.5 text-slate-500 justify-end sm:justify-start">
              <Calendar className="w-3.5 h-3.5 text-slate-400" />
              <span>তারিখ:</span>
            </div>
            <p className="font-bold text-slate-800">
              {new Date(order.createdAt).toLocaleDateString('bn-BD', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </p>
          </div>

          <div className="space-y-1.5 pt-2 border-t border-slate-200/60">
            <div className="flex items-center gap-1.5 text-slate-500">
              <User className="w-3.5 h-3.5 text-slate-400" />
              <span>গ্রাহকের নাম:</span>
            </div>
            <p className="font-bold text-slate-900">{order.customerName}</p>
          </div>

          <div className="space-y-1.5 pt-2 border-t border-slate-200/60 text-right sm:text-left">
            <div className="flex items-center gap-1.5 text-slate-500 justify-end sm:justify-start">
              <Phone className="w-3.5 h-3.5 text-slate-400" />
              <span>মোবাইল নম্বর:</span>
            </div>
            <p className="font-bold text-slate-900 font-mono">{order.phone}</p>
          </div>
        </div>

        {/* Items List Table */}
        <div className="p-5 sm:p-6">
          <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-2.5">
            সেবা ও পণ্যের বিবরণ
          </h3>

          <div className="border border-slate-200 rounded-xl overflow-hidden">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                  <th className="py-2.5 px-3">বিবরণ</th>
                  <th className="py-2.5 px-2 text-center">পরিমাণ</th>
                  <th className="py-2.5 px-2 text-right">একক মূল্য</th>
                  <th className="py-2.5 px-3 text-right">মোট</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {order.items.map((it, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/50">
                    <td className="py-2.5 px-3 font-semibold text-slate-900">
                      {it.productTitle || (it as unknown as { titleBn?: string }).titleBn || 'আইটেম'}
                      {it.color && (
                        <span className="text-slate-400 font-normal text-[11px] block sm:inline sm:ml-1">
                          ({it.color})
                        </span>
                      )}
                    </td>
                    <td className="py-2.5 px-2 text-center font-bold text-slate-700">
                      {it.quantity}
                    </td>
                    <td className="py-2.5 px-2 text-right text-slate-600">
                      ৳{it.price.toLocaleString('bn-BD')}
                    </td>
                    <td className="py-2.5 px-3 text-right font-bold text-slate-900">
                      ৳{(it.price * it.quantity).toLocaleString('bn-BD')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Amount Calculation Breakdown */}
          <div className="mt-4 pt-3 border-t border-slate-100 space-y-2 text-xs">
            <div className="flex justify-between text-slate-600">
              <span>সাবটোটাল:</span>
              <span className="font-semibold text-slate-900">৳{subtotal.toLocaleString('bn-BD')}</span>
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

            <div className="flex justify-between border-t border-slate-200 pt-2 text-sm font-black text-slate-900">
              <span>সর্বমোট বিল:</span>
              <span>৳{total.toLocaleString('bn-BD')}</span>
            </div>

            <div className="flex justify-between text-slate-700 font-bold">
              <span>পরিশোধিত টাকা:</span>
              <span className="text-emerald-700 font-bold">৳{paid.toLocaleString('bn-BD')}</span>
            </div>

            <div className="flex justify-between border-t border-dashed border-slate-200 pt-2">
              <span className="font-bold text-slate-800">বকেয়া / বাকি:</span>
              <span className={`font-black ${isPaidFull ? 'text-emerald-700' : 'text-rose-700'}`}>
                ৳{due.toLocaleString('bn-BD')}
              </span>
            </div>
          </div>

          {/* Payment Status Stamp & Delivery Status */}
          <div className="mt-5 p-3.5 rounded-xl border flex flex-col sm:flex-row items-center justify-between gap-3 text-xs bg-slate-50 border-slate-200">
            <div className="flex items-center gap-2">
              {isPaidFull ? (
                <div className="flex items-center gap-1.5 text-emerald-800 font-extrabold bg-emerald-100 px-3 py-1 rounded-lg border border-emerald-300">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>সম্পূর্ণ পরিশোধিত (PAID)</span>
                </div>
              ) : (
                <div className="flex items-center gap-1.5 text-rose-800 font-extrabold bg-rose-100 px-3 py-1 rounded-lg border border-rose-300">
                  <Clock className="w-4 h-4 text-rose-600" />
                  <span>বকেয়া রয়েছে (৳{due.toLocaleString('bn-BD')})</span>
                </div>
              )}
            </div>

            <div className="text-[11px] text-slate-600 font-medium">
              সার্ভিস অবস্থা: <b className="text-slate-900">{order.status === 'delivered' ? 'সম্পন্ন' : order.status === 'confirmed' ? 'অনুমোদিত' : order.status === 'processing' ? 'প্রসেসিং' : 'পেন্ডিং'}</b>
            </div>
          </div>
        </div>

        {/* Security Footer Notice */}
        <div className="bg-slate-900 text-slate-300 p-4 sm:p-5 text-center space-y-1.5 border-t border-slate-800">
          <div className="flex items-center justify-center gap-1.5 text-[11px] font-bold text-slate-200">
            <Lock className="w-3 h-3 text-rose-400" />
            <span>সুরক্ষিত ডিজিটাল ভাউচার (ওয়েবসাইট গোপন ও লক করা)</span>
          </div>
          <p className="text-[10px] text-slate-400 max-w-sm mx-auto leading-tight">
            এই পেজটিতে শুধুমাত্র গ্রাহকের ক্যাশ মেমো সংরক্ষিত রয়েছে। এখান থেকে অন্য কোনো তথ্য বা ওয়েবসাইটে প্রবেশের সুযোগ নেই।
          </p>
        </div>

      </div>

    </div>
  );
};
