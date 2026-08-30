import React, { useState, useEffect } from 'react';
import { X, Search, PackageSearch, CheckCircle2, Clock, Truck, ShieldCheck, AlertCircle, Loader2 } from 'lucide-react';
import { Order } from '../types';
import { getOrdersFromFirestore } from '../lib/firebase';

interface TrackOrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialOrderId?: string;
}

export const TrackOrderModal: React.FC<TrackOrderModalProps> = ({
  isOpen,
  onClose,
  initialOrderId = '',
}) => {
  if (!isOpen) return null;

  const [searchQuery, setSearchQuery] = useState(initialOrderId);
  const [orders, setOrders] = useState<Order[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const fetchOrder = async (query: string) => {
    const q = query.trim();
    if (!q) return;
    setLoading(true);
    setErrorMsg(null);

    try {
      const cleanQ = q.replace(/[\s-]/g, '').toLowerCase();

      // 1. Try Firestore first
      const fsOrders = await getOrdersFromFirestore();
      if (fsOrders && fsOrders.length > 0) {
        const matches = fsOrders.filter(
          (o) =>
            o.orderId.toLowerCase().includes(cleanQ) ||
            o.phone.replace(/[\s-]/g, '').includes(cleanQ) ||
            cleanQ.includes(o.phone.replace(/[\s-]/g, ''))
        );
        if (matches.length > 0) {
          setOrders(matches);
          setLoading(false);
          return;
        }
      }

      // 2. Try server API
      const response = await fetch(`/api/orders/track?query=${encodeURIComponent(q)}`);
      const data = await response.json();

      if (!response.ok || !data.success) {
        // 3. Fallback to local storage
        const saved = localStorage.getItem('tanu_orders');
        if (saved) {
          const localOrders: Order[] = JSON.parse(saved);
          const matches = localOrders.filter(
            (o) =>
              o.orderId.toLowerCase().includes(cleanQ) ||
              o.phone.replace(/[\s-]/g, '').includes(cleanQ) ||
              cleanQ.includes(o.phone.replace(/[\s-]/g, ''))
          );
          if (matches.length > 0) {
            setOrders(matches);
            setLoading(false);
            return;
          }
        }
        throw new Error(data.messageBn || 'কোনো অর্ডার পাওয়া যায়নি।');
      }

      setOrders(data.orders);
    } catch (err: any) {
      setOrders(null);
      setErrorMsg(err.message || 'অর্ডার ট্র্যাকিং এ সমস্যা হয়েছে। সঠিক মোবাইল নম্বর বা অর্ডার আইডি দিয়ে চেষ্টা করুন।');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (initialOrderId) {
      setSearchQuery(initialOrderId);
      fetchOrder(initialOrderId);
    }
  }, [initialOrderId]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchOrder(searchQuery);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200">
      <div className="relative bg-white rounded-3xl shadow-2xl max-w-xl w-full overflow-hidden border border-slate-200 my-auto max-h-[92vh] flex flex-col">
        
        {/* Modal Header */}
        <div className="bg-slate-900 text-white p-5 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-500 text-slate-950 flex items-center justify-center font-bold">
              <PackageSearch className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-base text-white leading-tight">অর্ডার ট্র্যাকিং সিস্টেম</h3>
              <p className="text-[11px] text-emerald-300 font-medium">
                অর্ডার আইডি বা মোবাইল নম্বর দিয়ে লাইভ স্ট্যাটাস দেখুন
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center justify-center transition-colors cursor-pointer"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-5 flex-1 no-scrollbar">
          
          {/* Search Input Bar */}
          <form onSubmit={handleSearchSubmit} className="space-y-1.5">
            <label className="text-xs font-bold text-slate-800">
              অর্ডার আইডি বা মোবাইল নম্বর লিখুন:
            </label>
            <div className="relative flex items-center gap-2">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="যেমন: BD-88412 অথবা 01712345678"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none text-xs sm:text-sm text-slate-900 font-medium"
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl transition-colors shrink-0 flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <span>সার্চ করুন</span>}
              </button>
            </div>
          </form>

          {/* Error Alert */}
          {errorMsg && (
            <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-2xl flex items-start gap-2.5 text-xs text-amber-900">
              <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold">তথ্য মেলেনি: </span>
                <span>{errorMsg}</span>
              </div>
            </div>
          )}

          {/* Orders Tracking Display */}
          {orders && orders.length > 0 && (
            <div className="space-y-6">
              {orders.map((order) => (
                <div key={order.orderId} className="bg-slate-50 rounded-2xl border border-slate-200/90 p-4 space-y-4">
                  
                  {/* Order Overview Header */}
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 pb-3">
                    <div>
                      <span className="text-[10px] text-slate-400 uppercase font-semibold">অর্ডার নম্বর</span>
                      <h4 className="text-base font-extrabold text-slate-900">{order.orderId}</h4>
                    </div>

                    <div className="text-right">
                      <span className="text-xs font-bold text-emerald-800 bg-emerald-100 px-2.5 py-1 rounded-lg inline-block">
                        ক্যাশ অন ডেলিভারি (৳{order.totalAmount.toLocaleString('bn-BD')})
                      </span>
                    </div>
                  </div>

                  {/* Customer Info */}
                  <div className="text-xs text-slate-600 space-y-0.5">
                    <p><b>গ্রাহক:</b> {order.customerName} ({order.phone})</p>
                    <p><b>ঠিকানা:</b> {order.address}</p>
                  </div>

                  {/* Tracking Steps Timeline */}
                  <div className="space-y-2 pt-2">
                    <h5 className="text-xs font-bold text-slate-900 flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-emerald-600" /> বর্তমান স্ট্যাটাস টাইমলাইন:
                    </h5>

                    <div className="space-y-3 relative pl-4 border-l-2 border-slate-200 ml-2 pt-1">
                      {order.trackingHistory.map((step, idx) => (
                        <div key={idx} className="relative group">
                          {/* Circle status marker */}
                          <div
                            className={`absolute -left-[21px] top-0 w-3.5 h-3.5 rounded-full border-2 ${
                              step.completed
                                ? 'bg-emerald-600 border-emerald-600'
                                : 'bg-white border-slate-300'
                            }`}
                          />
                          <div className="text-xs">
                            <div className="flex items-center justify-between">
                              <span className={`font-bold ${step.completed ? 'text-slate-900' : 'text-slate-400'}`}>
                                {step.titleBn}
                              </span>
                              <span className="text-[10px] text-slate-400">{step.timestamp}</span>
                            </div>
                            <p className="text-[11px] text-slate-500 mt-0.5">{step.descriptionBn}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Items List */}
                  <div className="pt-2 border-t border-slate-200 text-xs">
                    <span className="font-bold text-slate-800">অর্ডারভুক্ত পণ্য:</span>
                    <ul className="mt-1 space-y-1 text-slate-600">
                      {order.items.map((it, i) => (
                        <li key={i} className="flex justify-between">
                          <span>• {it.productTitle} (x{it.quantity})</span>
                          <span>৳{(it.price * it.quantity).toLocaleString('bn-BD')}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                </div>
              ))}
            </div>
          )}

          {/* Default Help Hint */}
          {!orders && !errorMsg && (
            <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200 text-center space-y-2">
              <ShieldCheck className="w-8 h-8 text-emerald-600 mx-auto" />
              <h4 className="font-bold text-slate-900 text-sm">সহজ অর্ডারিং ও ট্র্যাকিং</h4>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                অর্ডার নিশ্চিত করার পর আপনার দেওয়া ফোন নম্বরে এসএমএস এর মাধ্যমে অর্ডার ট্র্যাকিং আইডি দেওয়া হয়।
              </p>
            </div>
          )}

        </div>

      </div>
    </div>
  );
};
