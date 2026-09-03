import React, { useState, useEffect, useMemo } from 'react';
import { 
  X, 
  Search, 
  PackageSearch, 
  Clock, 
  ShieldCheck, 
  AlertCircle, 
  Loader2, 
  QrCode, 
  Copy, 
  Check, 
  PhoneCall, 
  Calendar,
  Sparkles,
  RefreshCw,
  History,
  Lock,
  FileText
} from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { Order } from '../types';
import { getOrdersFromFirestore, subscribeToOrders, subscribeToAppSettings } from '../lib/firebase';
import { getSecureReceiptUrl, generateOfflineReceiptText, DEFAULT_PARLOUR_INFO, ReceiptParlourInfo } from '../lib/receiptHelper';

interface TrackOrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialOrderId?: string;
}

// Convert Bengali numerals to English numerals
export function convertBnToEnDigits(str: string): string {
  if (!str) return '';
  const bnToEn: Record<string, string> = {
    '০': '0', '১': '1', '২': '2', '৩': '3', '৪': '4',
    '৫': '5', '৬': '6', '৭': '7', '৮': '8', '৯': '9'
  };
  return str.replace(/[০-৯]/g, (d) => bnToEn[d] || d);
}

// Clean string for unified search comparison
export function cleanQueryString(str: string): string {
  if (!str) return '';
  return convertBnToEnDigits(str)
    .replace(/[\s\-_#,:;./\\]/g, '')
    .toLowerCase()
    .trim();
}

// Advanced flexible order matcher
export function checkOrderMatchesQuery(order: Order, query: string): boolean {
  if (!query || !query.trim()) return false;

  const cleanQ = cleanQueryString(query);
  if (!cleanQ) return false;

  const cleanOrderId = cleanQueryString(order.orderId || '');
  const cleanPhone = cleanQueryString(order.phone || '');
  const cleanCustomer = (order.customerName || '').toLowerCase().trim();
  const rawQNormalized = convertBnToEnDigits(query).toLowerCase().trim();

  // 1. Order ID direct / substring match
  if (cleanOrderId) {
    if (cleanOrderId === cleanQ || cleanOrderId.includes(cleanQ) || cleanQ.includes(cleanOrderId)) {
      return true;
    }
  }

  // 2. Numeric-only match (e.g. user typed 123456 for TB-123456)
  const orderDigitsOnly = cleanOrderId.replace(/\D/g, '');
  const queryDigitsOnly = cleanQ.replace(/\D/g, '');
  if (queryDigitsOnly.length >= 3 && orderDigitsOnly) {
    if (orderDigitsOnly === queryDigitsOnly || orderDigitsOnly.includes(queryDigitsOnly) || queryDigitsOnly.includes(orderDigitsOnly)) {
      return true;
    }
  }

  // 3. Phone number match (supports with/without +88, 88, leading 0)
  if (cleanPhone && queryDigitsOnly.length >= 4) {
    const rawPhoneDigits = cleanPhone.replace(/\D/g, '');
    const phoneNoLeadingZero = rawPhoneDigits.replace(/^0+|^880+|^88+/, '');
    const queryNoLeadingZero = queryDigitsOnly.replace(/^0+|^880+|^88+/, '');

    if (
      rawPhoneDigits.includes(queryDigitsOnly) ||
      queryDigitsOnly.includes(rawPhoneDigits) ||
      (phoneNoLeadingZero && phoneNoLeadingZero.includes(queryNoLeadingZero)) ||
      (queryNoLeadingZero && queryNoLeadingZero.includes(phoneNoLeadingZero))
    ) {
      return true;
    }
  }

  // 4. Customer Name match
  if (cleanCustomer && (cleanCustomer.includes(rawQNormalized) || rawQNormalized.includes(cleanCustomer))) {
    return true;
  }

  return false;
}

export const TrackOrderModal: React.FC<TrackOrderModalProps> = ({
  isOpen,
  onClose,
  initialOrderId = '',
}) => {
  const [searchQuery, setSearchQuery] = useState(initialOrderId);
  const [allOrders, setAllOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [copiedOrderId, setCopiedOrderId] = useState<string | null>(null);
  const [hasSearched, setHasSearched] = useState(false);

  // App settings for QR code mode (Text memo vs URL) synced with Firestore
  const [qrTextMemoEnabled, setQrTextMemoEnabled] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem('tanu_qr_text_memo');
      return saved !== null ? JSON.parse(saved) : true;
    } catch {
      return true;
    }
  });

  const [parlourInfo, setParlourInfo] = useState<ReceiptParlourInfo>(() => {
    try {
      const saved = localStorage.getItem('tanu_parlour_info');
      return saved ? JSON.parse(saved) : DEFAULT_PARLOUR_INFO;
    } catch {
      return DEFAULT_PARLOUR_INFO;
    }
  });

  // Helper to load all stored orders from all available storages
  const loadAllOrdersPool = async () => {
    const poolMap = new Map<string, Order>();

    // 1. LocalStorage 'tanu_orders'
    try {
      const tanuSaved = localStorage.getItem('tanu_orders');
      if (tanuSaved) {
        const parsed: Order[] = JSON.parse(tanuSaved);
        parsed.forEach((o) => { if (o?.orderId) poolMap.set(o.orderId, o); });
      }
    } catch (e) {
      console.warn('Error reading tanu_orders', e);
    }

    // 2. LocalStorage 'deshibazar_orders'
    try {
      const deshiSaved = localStorage.getItem('deshibazar_orders');
      if (deshiSaved) {
        const parsed: Order[] = JSON.parse(deshiSaved);
        parsed.forEach((o) => { if (o?.orderId) poolMap.set(o.orderId, o); });
      }
    } catch (e) {
      console.warn('Error reading deshibazar_orders', e);
    }

    // 3. Firestore Orders
    try {
      const fsOrders = await getOrdersFromFirestore();
      if (fsOrders && fsOrders.length > 0) {
        fsOrders.forEach((o) => { if (o?.orderId) poolMap.set(o.orderId, o); });
      }
    } catch (e) {
      console.warn('Error fetching Firestore orders', e);
    }

    // 4. Demo seed order (BD-88412) if pool is empty
    if (poolMap.size === 0) {
      const demoOrder: Order = {
        orderId: 'TB-88412',
        createdAt: new Date().toISOString(),
        customerName: 'নুসরাত জাহান',
        phone: '01302383795',
        address: 'ডুবাইল, সেহড়াতৈল রোড, নাটিয়াপাড়া বাজার, দেলদুয়ার, টাঙ্গাইল',
        district: 'টাঙ্গাইল',
        deliveryZone: 'inside_dhaka',
        items: [
          {
            productId: 'demo-1',
            productTitle: 'CSA লেজার মেছতা ও ব্রণের দাগ রিমুভাল',
            quantity: 1,
            price: 2500,
            image: 'https://images.unsplash.com/photo-1560750588-73207b1ef5b8?auto=format&fit=crop&w=400&q=80'
          }
        ],
        subtotal: 2500,
        deliveryFee: 0,
        totalAmount: 2500,
        paymentMethod: 'cash',
        status: 'confirmed',
        trackingHistory: [
          {
            status: 'confirmed',
            titleBn: 'বুকিং সিরিয়াল গ্রহণ সম্পন্ন',
            timestamp: 'আজ সকাল ১০:৩০',
            descriptionBn: 'তনু বিউটি পার্লার ও লেজার সেন্টারে আপনার বুকিং তালিকাভুক্ত হয়েছে।',
            completed: true
          }
        ]
      };
      poolMap.set(demoOrder.orderId, demoOrder);
    }

    const combinedList = Array.from(poolMap.values()).sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

    setAllOrders(combinedList);
    return combinedList;
  };

  // Real-time Firestore subscription & initial sync
  useEffect(() => {
    if (!isOpen) return;

    loadAllOrdersPool();

    const unsubscribe = subscribeToOrders((orders) => {
      if (orders && orders.length > 0) {
        setAllOrders((prev) => {
          const map = new Map<string, Order>();
          prev.forEach((o) => { if (o?.orderId) map.set(o.orderId, o); });
          orders.forEach((o) => { if (o?.orderId) map.set(o.orderId, o); });
          return Array.from(map.values()).sort(
            (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          );
        });
      }
    });

    const unsubSettings = subscribeToAppSettings((settings) => {
      if (typeof settings.qrTextMemoEnabled === 'boolean') {
        setQrTextMemoEnabled(settings.qrTextMemoEnabled);
        localStorage.setItem('tanu_qr_text_memo', JSON.stringify(settings.qrTextMemoEnabled));
      }
      if (settings.parlourInfo) {
        setParlourInfo(settings.parlourInfo);
        localStorage.setItem('tanu_parlour_info', JSON.stringify(settings.parlourInfo));
      }
    });

    return () => {
      unsubscribe();
      unsubSettings();
    };
  }, [isOpen]);

  // Handle initialOrderId prop
  useEffect(() => {
    if (!isOpen) return;
    if (initialOrderId) {
      setSearchQuery(initialOrderId);
      setHasSearched(true);
    }
  }, [initialOrderId, isOpen]);

  // Compute matched orders dynamically based on current searchQuery
  const matchedOrders = useMemo(() => {
    const q = searchQuery.trim();
    if (!q) return null;
    return allOrders.filter((order) => checkOrderMatchesQuery(order, q));
  }, [searchQuery, allOrders]);

  // Search submission handler (also falls back to server API if not found)
  const handleSearchSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const q = searchQuery.trim();
    if (!q) return;

    setHasSearched(true);
    setLoading(true);
    setErrorMsg(null);

    try {
      // 1. Refresh local & firestore pool
      const freshPool = await loadAllOrdersPool();
      const localMatches = freshPool.filter((order) => checkOrderMatchesQuery(order, q));

      if (localMatches.length > 0) {
        setLoading(false);
        return;
      }

      // 2. Fallback to API endpoint
      try {
        const response = await fetch(`/api/orders/track?query=${encodeURIComponent(q)}`);
        if (response.ok) {
          const data = await response.json();
          if (data.success && data.orders && data.orders.length > 0) {
            setAllOrders((prev) => {
              const map = new Map<string, Order>();
              prev.forEach((o) => { if (o?.orderId) map.set(o.orderId, o); });
              data.orders.forEach((o: Order) => { if (o?.orderId) map.set(o.orderId, o); });
              return Array.from(map.values()).sort(
                (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
              );
            });
            setLoading(false);
            return;
          }
        }
      } catch (apiErr) {
        console.warn('API track fallback failed', apiErr);
      }

      setErrorMsg('কোনো বুকিং বা অর্ডার রেকর্ড পাওয়া যায়নি। সঠিক মোবাইল নম্বর (যেমন: 01302383795) বা বুকিং আইডি (যেমন: TB-123456) দিয়ে চেষ্টা করুন।');
    } catch (err: any) {
      setErrorMsg(err.message || 'বুকিং ট্র্যাকিং লোড হতে সমস্যা হয়েছে।');
    } finally {
      setLoading(false);
    }
  };

  const handleCopyLink = (order: Order) => {
    const contentToCopy = qrTextMemoEnabled
      ? generateOfflineReceiptText(order, parlourInfo)
      : getSecureReceiptUrl(order.orderId);

    navigator.clipboard.writeText(contentToCopy).then(() => {
      setCopiedOrderId(order.orderId);
      setTimeout(() => setCopiedOrderId(null), 2000);
    });
  };

  const getStatusBadge = (status: Order['status']) => {
    switch (status) {
      case 'pending':
        return (
          <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-200 inline-flex items-center gap-1 animate-pulse">
            <Clock className="w-3 h-3 text-amber-600" />
            <span>অপেক্ষমাণ (পেন্ডিং)</span>
          </span>
        );
      case 'confirmed':
        return (
          <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-800 border border-blue-200 inline-flex items-center gap-1">
            <Check className="w-3 h-3 text-blue-600" />
            <span>গৃহীত ও নিশ্চিত</span>
          </span>
        );
      case 'processing':
        return (
          <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-purple-100 text-purple-800 border border-purple-200 inline-flex items-center gap-1">
            <RefreshCw className="w-3 h-3 text-purple-600 animate-spin" />
            <span>প্রক্রিয়াধীন</span>
          </span>
        );
      case 'delivered':
        return (
          <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-200 inline-flex items-center gap-1">
            <ShieldCheck className="w-3 h-3 text-emerald-600" />
            <span>সম্পন্ন / ডেলিভার্ড</span>
          </span>
        );
      default:
        return (
          <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-800 border border-slate-200">
            {status}
          </span>
        );
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200">
      <div className="relative bg-white rounded-3xl shadow-2xl max-w-2xl w-full overflow-hidden border border-slate-200 my-auto max-h-[92vh] flex flex-col">
        
        {/* Modal Header */}
        <div className="bg-slate-900 text-white p-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-500 text-slate-950 flex items-center justify-center font-bold shadow-xs">
              <QrCode className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-base text-white leading-tight">লাইভ বুকিং ট্র্যাকিং ও ভেরিফিকেশন</h3>
                <span className="text-[10px] bg-emerald-500/20 text-emerald-300 font-semibold px-2 py-0.5 rounded-md border border-emerald-500/30">
                  লাইভ সিঙ্ক
                </span>
              </div>
              <p className="text-xs text-slate-300 font-normal mt-0.5">
                বুকিং আইডি (যেমন: TB-123456) বা মোবাইল নম্বর লিখে চেক করুন
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
        <div data-lenis-prevent className="p-5 sm:p-6 overflow-y-auto space-y-5 flex-1 no-scrollbar">
          
          {/* Search Input Bar */}
          <form onSubmit={handleSearchSubmit} className="space-y-1.5">
            <label className="text-xs font-bold text-slate-800">
              বুকিং আইডি অথবা মোবাইল নম্বর:
            </label>
            <div className="relative flex items-center gap-2">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="যেমন: TB-123456 বা 123456 বা 01302383795"
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setHasSearched(true);
                    setErrorMsg(null);
                  }}
                  className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:ring-2 focus:ring-rose-500 focus:border-rose-500 outline-none text-xs sm:text-sm text-slate-900 font-medium"
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="px-4 py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-xl transition-colors shrink-0 flex items-center gap-1.5 cursor-pointer disabled:opacity-50 shadow-xs"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <span>চেক করুন</span>}
              </button>
            </div>
          </form>

          {/* Quick Click Recent Bookings Chips (if available) */}
          {allOrders.length > 0 && (
            <div className="space-y-1.5 pt-1">
              <div className="flex items-center gap-1.5 text-[11px] font-bold text-slate-500">
                <History className="w-3 h-3 text-rose-500" />
                <span>সাম্প্রতিক বুকিং আইডি (ক্লিক করে সরাসরি দেখুন):</span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {allOrders.slice(0, 4).map((ord) => (
                  <button
                    key={ord.orderId}
                    type="button"
                    onClick={() => {
                      setSearchQuery(ord.orderId);
                      setHasSearched(true);
                      setErrorMsg(null);
                    }}
                    className={`text-[11px] px-2.5 py-1 rounded-lg border font-semibold transition-all cursor-pointer ${
                      searchQuery.trim().toLowerCase() === ord.orderId.toLowerCase()
                        ? 'bg-rose-600 text-white border-rose-600 shadow-xs'
                        : 'bg-slate-100 hover:bg-rose-50 text-slate-700 border-slate-200'
                    }`}
                  >
                    #{ord.orderId} ({ord.customerName ? ord.customerName.split(' ')[0] : 'বুকিং'})
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Error Alert */}
          {errorMsg && hasSearched && (!matchedOrders || matchedOrders.length === 0) && (
            <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-2xl flex items-start gap-2.5 text-xs text-amber-900 animate-in fade-in">
              <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold">তথ্য মেলেনি: </span>
                <span>{errorMsg}</span>
              </div>
            </div>
          )}

          {/* Orders Tracking Display */}
          {matchedOrders && matchedOrders.length > 0 ? (
            <div className="space-y-5 animate-in fade-in">
              <div className="flex items-center justify-between text-xs text-slate-500">
                <span>পাওয়া গেছে: <b>{matchedOrders.length}</b> টি বুকিং / অর্ডার রেকর্ড</span>
                <span className="text-emerald-700 font-medium flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                  সার্ভার থেকে লাইভ সিঙ্ক হচ্ছে
                </span>
              </div>

              {matchedOrders.map((order) => {
                const receiptUrl = getSecureReceiptUrl(order.orderId);
                const offlineReceiptText = generateOfflineReceiptText(order, parlourInfo);
                const activeQrValue = qrTextMemoEnabled ? offlineReceiptText : receiptUrl;

                return (
                  <div key={order.orderId} className="bg-slate-50 rounded-2xl border border-slate-200 p-4 sm:p-5 space-y-4 shadow-xs">
                    
                    {/* Header: ID, Status, QR Code */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200/80 pb-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] uppercase font-bold text-slate-400">বুকিং আইডি:</span>
                          <span className="text-base font-extrabold text-slate-900 font-mono">#{order.orderId}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-slate-500">বর্তমান অবস্থা:</span>
                          {getStatusBadge(order.status)}
                        </div>
                        <div className="text-[11px] text-slate-500">
                          তারিখ: {new Date(order.createdAt).toLocaleDateString('bn-BD', { year: 'numeric', month: 'long', day: 'numeric' })}
                        </div>
                      </div>

                      {/* Sharp Vector QR Code */}
                      <div className="flex items-center gap-3 bg-white p-2.5 rounded-xl border border-slate-200 self-start sm:self-auto shadow-2xs">
                        <div className="bg-white p-1 rounded-lg">
                          <QRCodeSVG 
                            value={activeQrValue} 
                            size={qrTextMemoEnabled ? 80 : 72} 
                            level={qrTextMemoEnabled ? 'L' : 'M'} 
                            includeMargin={false}
                          />
                        </div>
                        <div className="space-y-1 text-left">
                          <div className="text-[11px] font-bold text-slate-800 flex items-center gap-1">
                            {qrTextMemoEnabled ? (
                              <>
                                <FileText className="w-3.5 h-3.5 text-emerald-600" />
                                <span className="text-emerald-800">টেক্সট মেমো QR</span>
                              </>
                            ) : (
                              <>
                                <Lock className="w-3.5 h-3.5 text-rose-600" />
                                <span>সুরক্ষিত রিসিট QR</span>
                              </>
                            )}
                          </div>
                          <p className="text-[10px] text-slate-500 max-w-[130px] leading-tight">
                            {qrTextMemoEnabled
                              ? 'স্ক্যান করলে সরাসরি মেমোর টেক্সট আসবে (URL বিহীন)'
                              : 'স্ক্যান করলে শুধুমাত্র মেমো দেখাবে (ওয়েবসাইট লক)'}
                          </p>
                          <button
                            onClick={() => handleCopyLink(order)}
                            className="text-[10px] font-semibold text-rose-600 hover:text-rose-700 inline-flex items-center gap-1 pt-0.5 cursor-pointer"
                          >
                            {copiedOrderId === order.orderId ? (
                              <>
                                <Check className="w-3 h-3 text-emerald-600" />
                                <span className="text-emerald-700">
                                  {qrTextMemoEnabled ? 'মেমো টেক্সট কপি হয়েছে' : 'রিসিট লিংক কপি হয়েছে'}
                                </span>
                              </>
                            ) : (
                              <>
                                <Copy className="w-3 h-3" />
                                <span>
                                  {qrTextMemoEnabled ? 'মেমো টেক্সট কপি' : 'রিসিট লিংক কপি'}
                                </span>
                              </>
                            )}
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Customer & Service Info */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs bg-white p-3 rounded-xl border border-slate-200/70">
                      <div>
                        <span className="text-slate-400 block text-[11px]">গ্রাহক বিবরণ:</span>
                        <p className="font-bold text-slate-900 mt-0.5">{order.customerName}</p>
                        <p className="text-slate-600 font-medium font-mono">{order.phone}</p>
                        {order.address && <p className="text-slate-500 text-[11px] mt-0.5">{order.address}</p>}
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[11px]">পেমেন্ট ও বিল তথ্য:</span>
                        <p className="font-bold text-slate-900 mt-0.5">
                          মোট বিল: ৳{(order.totalAmount || 0).toLocaleString('bn-BD')}
                        </p>
                        <p className="text-slate-600 text-[11px]">
                          পেমেন্ট মাধ্যম: {order.paymentMethod === 'cod' ? 'ক্যাশ অন ডেলিভারি' : order.paymentMethod === 'bkash' ? 'বিকাশ' : order.paymentMethod === 'nagad' ? 'নগদ' : 'ক্যাশ'}
                        </p>
                        {order.notes && (
                          <p className="text-rose-700 text-[11px] mt-0.5 font-medium">নোট: {order.notes}</p>
                        )}
                      </div>
                    </div>

                    {/* Items Table */}
                    <div className="text-xs space-y-1.5">
                      <span className="font-bold text-slate-800">বুকিংকৃত সার্ভিস ও আইটেমসমূহ:</span>
                      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
                        <table className="w-full text-left text-xs">
                          <thead className="bg-slate-50 border-b border-slate-200 text-slate-600">
                            <tr>
                              <th className="py-2 px-3">সার্ভিস / পণ্য</th>
                              <th className="py-2 px-3 text-center">পরিমাণ</th>
                              <th className="py-2 px-3 text-right">মূল্য</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100">
                            {order.items.map((it, idx) => (
                              <tr key={idx}>
                                <td className="py-2 px-3 font-medium text-slate-900">{it.productTitle}</td>
                                <td className="py-2 px-3 text-center text-slate-600">{it.quantity}</td>
                                <td className="py-2 px-3 text-right font-bold text-slate-900">
                                  ৳{(it.price * it.quantity).toLocaleString('bn-BD')}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>

                    {/* Tracking Timeline */}
                    <div className="space-y-2 pt-1">
                      <h5 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-rose-600" />
                        <span>লাইভ অগ্রগতি টাইমলাইন:</span>
                      </h5>

                      <div className="space-y-2.5 relative pl-4 border-l-2 border-slate-200 ml-2 pt-1">
                        {order.trackingHistory && order.trackingHistory.length > 0 ? (
                          order.trackingHistory.map((step, idx) => (
                            <div key={idx} className="relative">
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
                          ))
                        ) : (
                          <div className="text-xs text-slate-500">
                            স্ট্যাটাস: <b>{order.status}</b> (অর্ডারের তথ্য প্রস্তুত হচ্ছে)
                          </div>
                        )}
                      </div>
                    </div>

                  </div>
                );
              })}
            </div>
          ) : !hasSearched || !searchQuery ? (
            /* Default Help Hint */
            <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200 text-center space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto border border-rose-100">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <h4 className="font-bold text-slate-900 text-sm">সহজ বুকিং ভেরিফিকেশন ও ট্র্যাকিং</h4>
                <p className="text-xs text-slate-500 max-w-md mx-auto leading-relaxed">
                  বুকিং করার পর আপনার প্রাপ্ত বুকিং আইডি (যেমন: TB-123456 বা 123456) অথবা আপনার মোবাইল নম্বর উপরে লিখে চেক বাটনে চাপুন। সম্পূর্ণ তথ্য ও ভেরিফাইড QR কোড দেখতে পাবেন।
                </p>
              </div>

              <div className="pt-2 flex items-center justify-center gap-2 text-xs text-slate-600">
                <span>যেকোনো প্রয়োজনে সরাসরি কল করুন:</span>
                <a href="tel:01302383795" className="font-bold text-rose-600 hover:underline flex items-center gap-1 font-mono">
                  <PhoneCall className="w-3.5 h-3.5" />
                  <span>01302383795</span>
                </a>
              </div>
            </div>
          ) : null}

        </div>

      </div>
    </div>
  );
};

