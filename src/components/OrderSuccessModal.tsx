import React from 'react';
import { CheckCircle2, Truck, Copy, Download, ShoppingBag, PackageSearch, ShieldCheck } from 'lucide-react';
import { Order } from '../types';
import { printElementViaAboutBlank } from '../lib/printHelper';

interface OrderSuccessModalProps {
  order: Order | null;
  onClose: () => void;
  onTrackOrder: (orderId: string) => void;
}

export const OrderSuccessModal: React.FC<OrderSuccessModalProps> = ({
  order,
  onClose,
  onTrackOrder,
}) => {
  const [copied, setCopied] = React.useState(false);

  if (!order) return null;

  const handleCopyOrderId = () => {
    navigator.clipboard.writeText(order.orderId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePrint = () => {
    printElementViaAboutBlank('printable-receipt', {
      title: `অর্ডার_রিসিট_${order.orderId}`,
      pageFormat: 'receipt',
    });
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200">
      <div className="relative bg-white rounded-3xl shadow-2xl max-w-xl w-full overflow-hidden border border-slate-200 my-auto max-h-[92vh] flex flex-col">
        
        {/* Top Success Banner */}
        <div className="bg-emerald-600 text-white p-6 text-center space-y-2">
          <div className="w-16 h-16 rounded-full bg-white/20 backdrop-blur-xs flex items-center justify-center mx-auto text-white">
            <CheckCircle2 className="w-10 h-10 text-emerald-100" />
          </div>
          <h2 className="text-2xl font-bold">অভিনন্দন! আপনার অর্ডারটি সফল হয়েছে!</h2>
          <p className="text-emerald-100 text-xs sm:text-sm">
            আমাদের কাস্টমার কেয়ার প্রতিনিধি শিগগিরই আপনার সাথে যোগাযোগ করে অর্ডারটি কনফার্ম করবেন।
          </p>
        </div>

        {/* Scrollable Receipt Body */}
        <div id="printable-receipt" data-lenis-prevent className="p-5 sm:p-6 overflow-y-auto space-y-5 flex-1 text-xs sm:text-sm">
          
          {/* Order ID Box */}
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl flex items-center justify-between">
            <div>
              <span className="text-[11px] text-slate-500 font-semibold block uppercase">অর্ডার ট্র্যাকিং আইডি</span>
              <span className="text-xl font-extrabold text-slate-900 tracking-wider">{order.orderId}</span>
            </div>

            <button
              onClick={handleCopyOrderId}
              className="px-3 py-1.5 rounded-lg bg-white border border-slate-300 text-slate-700 font-semibold text-xs hover:bg-slate-100 transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <Copy className="w-3.5 h-3.5 text-slate-500" />
              <span>{copied ? 'কপি হয়েছে!' : 'আইডি কপি'}</span>
            </button>
          </div>

          {/* Delivery Details */}
          <div className="grid grid-cols-2 gap-3 p-3.5 bg-slate-50/70 rounded-2xl border border-slate-200 text-slate-700">
            <div>
              <span className="text-slate-400 font-semibold text-[11px] block">গ্রাহকের নাম:</span>
              <span className="font-bold text-slate-900">{order.customerName}</span>
            </div>
            <div>
              <span className="text-slate-400 font-semibold text-[11px] block">মোবাইল নম্বর:</span>
              <span className="font-bold text-slate-900">{order.phone}</span>
            </div>
            <div className="col-span-2">
              <span className="text-slate-400 font-semibold text-[11px] block">ডেলিভারি ঠিকানা:</span>
              <span className="font-bold text-slate-900">{order.address}</span>
            </div>
          </div>

          {/* Order Items Table */}
          <div className="space-y-2">
            <h4 className="font-bold text-slate-900 border-b border-slate-200 pb-1">অর্ডারকৃত আইটেমস:</h4>
            <div className="space-y-2">
              {order.items.map((item, idx) => (
                <div key={idx} className="flex items-center justify-between py-1 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <img src={item.image} alt={item.productTitle} referrerPolicy="no-referrer" className="w-8 h-8 rounded-md object-cover border" />
                    <div>
                      <span className="font-semibold text-slate-800 line-clamp-1">{item.productTitle}</span>
                      <span className="text-[10px] text-slate-400">পরিমাণ: {item.quantity}টি</span>
                    </div>
                  </div>
                  <span className="font-bold text-slate-900">৳{(item.price * item.quantity).toLocaleString('bn-BD')}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Payment Summary */}
          <div className="p-3 bg-emerald-50/60 rounded-xl border border-emerald-200 space-y-1">
            <div className="flex justify-between text-slate-600">
              <span>প্রোডাক্ট মূল্য:</span>
              <span>৳{order.subtotal.toLocaleString('bn-BD')}</span>
            </div>
            <div className="flex justify-between text-slate-600">
              <span>ডেলিভারি চার্জ:</span>
              <span>৳{order.deliveryFee.toLocaleString('bn-BD')}</span>
            </div>
            <div className="flex justify-between text-base font-extrabold text-slate-900 pt-1.5 border-t border-emerald-200">
              <span>সর্বমোট দেও (ক্যাশ অন ডেলিভারি):</span>
              <span className="text-emerald-700">৳{order.totalAmount.toLocaleString('bn-BD')}</span>
            </div>
          </div>

          {/* Tracking Status Box */}
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Truck className="w-5 h-5 text-emerald-600" />
              <div>
                <span className="font-bold text-slate-900 block text-xs">ডেলিভারি সময়সীমা</span>
                <span className="text-[11px] text-slate-500">
                  {order.deliveryZone === 'inside_dhaka' ? '২৪-৪৮ ঘণ্টার মধ্যে' : '২-৩ কার্যদিবসের মধ্যে'}
                </span>
              </div>
            </div>

            <button
              onClick={() => {
                onTrackOrder(order.orderId);
                onClose();
              }}
              className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer"
            >
              <PackageSearch className="w-3.5 h-3.5" />
              <span>ট্র্যাক করুন</span>
            </button>
          </div>

        </div>

        {/* Modal Action Buttons */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex flex-wrap items-center justify-between gap-2">
          <button
            onClick={handlePrint}
            className="px-4 py-2 rounded-xl bg-white border border-slate-300 text-slate-700 font-semibold text-xs hover:bg-slate-100 transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>ইনভয়েস প্রিন্ট</span>
          </button>

          <button
            onClick={onClose}
            className="px-6 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs transition-colors cursor-pointer"
          >
            হোম পেজে ফিরুন
          </button>
        </div>

      </div>
    </div>
  );
};
