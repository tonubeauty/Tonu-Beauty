import React from 'react';
import { X, Trash2, ShoppingBag, Plus, Minus, ArrowRight, ShieldCheck, Truck } from 'lucide-react';
import { CartItem, DeliveryZone } from '../types';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  cartItems: CartItem[];
  onUpdateQuantity: (productId: string, quantity: number) => void;
  onRemoveItem: (productId: string) => void;
  deliveryZone: DeliveryZone;
  onDeliveryZoneChange: (zone: DeliveryZone) => void;
  onProceedToCheckout: () => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({
  isOpen,
  onClose,
  cartItems,
  onUpdateQuantity,
  onRemoveItem,
  deliveryZone,
  onDeliveryZoneChange,
  onProceedToCheckout,
}) => {
  if (!isOpen) return null;

  const subtotal = cartItems.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  const deliveryFee = deliveryZone === 'inside_dhaka' ? 60 : 120;
  const totalAmount = subtotal > 0 ? subtotal + deliveryFee : 0;

  // Free shipping threshold
  const freeShippingThreshold = 2000;
  const remainingForFreeShipping = Math.max(0, freeShippingThreshold - subtotal);
  const freeShippingPercent = Math.min(100, Math.round((subtotal / freeShippingThreshold) * 100));

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-slate-900/50 backdrop-blur-xs flex justify-end animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-white h-full shadow-2xl flex flex-col justify-between border-l border-slate-200">
        
        {/* Drawer Header */}
        <div className="p-4 sm:p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
              <ShoppingBag className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-base leading-tight">আপনার শপিং কার্ট</h3>
              <p className="text-[11px] text-slate-500 font-medium">
                {cartItems.length > 0 ? `${cartItems.length}টি আইটেম যুক্ত রয়েছে` : 'কার্ট খালি রয়েছে'}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-lg text-slate-500 hover:bg-slate-200 transition-colors cursor-pointer"
            aria-label="Close cart"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Free Shipping Progress Indicator */}
        {subtotal > 0 && (
          <div className="bg-emerald-50 px-4 py-2.5 border-b border-emerald-100 text-xs">
            {remainingForFreeShipping > 0 ? (
              <p className="text-emerald-800 font-medium mb-1">
                আর <b>৳{remainingForFreeShipping.toLocaleString('bn-BD')}</b> অর্ডারে পাচ্ছেন ঢাকা সিটিতে ফ্রি ডেলিভারি!
              </p>
            ) : (
              <p className="text-emerald-700 font-bold mb-1 flex items-center gap-1">
                🎉 অভিনন্দন! আপনি পাচ্ছেন ঢাকা সিটিতে ১০০০% ফ্রি ডেলিভারি!
              </p>
            )}
            <div className="w-full h-1.5 bg-emerald-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-emerald-600 transition-all duration-300"
                style={{ width: `${freeShippingPercent}%` }}
              />
            </div>
          </div>
        )}

        {/* Items List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3 no-scrollbar">
          {cartItems.length > 0 ? (
            cartItems.map(({ product, quantity, selectedColor }) => (
              <div
                key={product.id}
                className="flex items-center gap-3 p-3 bg-slate-50/80 rounded-2xl border border-slate-200/80 hover:border-slate-300 transition-all"
              >
                {/* Product Thumbnail */}
                <div className="w-16 h-16 rounded-xl bg-white border border-slate-200 overflow-hidden shrink-0">
                  <img
                    src={product.images[0]}
                    alt={product.titleBn}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover"
                  />
                </div>

                {/* Details */}
                <div className="flex-1 min-w-0 space-y-1">
                  <h4 className="text-xs font-bold text-slate-900 truncate leading-snug" title={product.titleBn}>
                    {product.titleBn}
                  </h4>

                  {selectedColor && (
                    <span className="text-[10px] text-slate-500 bg-white px-1.5 py-0.5 rounded border border-slate-200 inline-block">
                      কালার: {selectedColor}
                    </span>
                  )}

                  <div className="flex items-center justify-between pt-1">
                    <span className="text-sm font-extrabold text-emerald-700">
                      ৳{(product.price * quantity).toLocaleString('bn-BD')}
                    </span>

                    {/* Quantity Control Buttons */}
                    <div className="flex items-center border border-slate-300 rounded-lg bg-white overflow-hidden">
                      <button
                        onClick={() => onUpdateQuantity(product.id, quantity - 1)}
                        className="px-2 py-0.5 text-slate-600 hover:bg-slate-100 cursor-pointer"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="px-2 text-xs font-bold text-slate-900 min-w-[1.25rem] text-center">
                        {quantity}
                      </span>
                      <button
                        onClick={() => onUpdateQuantity(product.id, quantity + 1)}
                        className="px-2 py-0.5 text-slate-600 hover:bg-slate-100 cursor-pointer"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Remove Button */}
                <button
                  onClick={() => onRemoveItem(product.id)}
                  className="p-1.5 text-slate-400 hover:text-red-500 transition-colors cursor-pointer"
                  title="আইটেমটি মুছুন"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-3">
              <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center text-slate-400">
                <ShoppingBag className="w-8 h-8" />
              </div>
              <h4 className="font-bold text-slate-800 text-base">আপনার কার্ট ফাঁকা</h4>
              <p className="text-xs text-slate-500 max-w-xs">
                পছন্দের প্রোডাক্টটি কার্টে যোগ করুন এবং ক্যাশ অন ডেলিভারিতে সহজে অর্ডার সম্পন্ন করুন।
              </p>
              <button
                onClick={onClose}
                className="px-5 py-2.5 rounded-xl bg-emerald-600 text-white font-semibold text-xs shadow-xs hover:bg-emerald-700 transition-colors cursor-pointer"
              >
                কেনাকাটা শুরু করুন
              </button>
            </div>
          )}
        </div>

        {/* Footer Checkout Summary */}
        {cartItems.length > 0 && (
          <div className="p-4 sm:p-5 border-t border-slate-200 bg-slate-50 space-y-3.5">
            {/* Delivery Location Selector */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 flex items-center justify-between">
                <span>ডেলিভারি লোকেশন সিলেক্ট করুন:</span>
                <span className="text-emerald-700 font-semibold text-[11px]">ক্যাশ অন ডেলিভারি</span>
              </label>
              <div className="grid grid-cols-2 gap-2 text-xs font-semibold">
                <button
                  onClick={() => onDeliveryZoneChange('inside_dhaka')}
                  className={`p-2 rounded-xl border text-left transition-all cursor-pointer ${
                    deliveryZone === 'inside_dhaka'
                      ? 'bg-emerald-50 border-emerald-600 text-emerald-900 font-bold ring-1 ring-emerald-600'
                      : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  <div>ঢাকা সিটি</div>
                  <div className="text-[11px] text-emerald-700 font-normal">চার্জ: ৳৬০</div>
                </button>

                <button
                  onClick={() => onDeliveryZoneChange('outside_dhaka')}
                  className={`p-2 rounded-xl border text-left transition-all cursor-pointer ${
                    deliveryZone === 'outside_dhaka'
                      ? 'bg-emerald-50 border-emerald-600 text-emerald-900 font-bold ring-1 ring-emerald-600'
                      : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  <div>ঢাকার বাইরে</div>
                  <div className="text-[11px] text-emerald-700 font-normal">চার্জ: ৳১২০</div>
                </button>
              </div>
            </div>

            {/* Calculations */}
            <div className="space-y-1 text-xs text-slate-600 pt-1 border-t border-slate-200">
              <div className="flex justify-between">
                <span>প্রোডাক্ট সাব টোটাল:</span>
                <span className="font-semibold text-slate-900">৳{subtotal.toLocaleString('bn-BD')}</span>
              </div>
              <div className="flex justify-between">
                <span>ডেলিভারি চার্জ ({deliveryZone === 'inside_dhaka' ? 'ঢাকা' : 'ঢাকার বাইরে'}):</span>
                <span className="font-semibold text-slate-900">৳{deliveryFee.toLocaleString('bn-BD')}</span>
              </div>
              <div className="flex justify-between text-base font-extrabold text-slate-900 pt-2 border-t border-slate-200">
                <span>সর্বমোট দেও মূল্যে (COD):</span>
                <span className="text-emerald-700">৳{totalAmount.toLocaleString('bn-BD')}</span>
              </div>
            </div>

            {/* Checkout Action */}
            <button
              onClick={onProceedToCheckout}
              className="w-full py-3.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>ক্যাশ অন ডেলিভারিতে অর্ডার করুন</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <div className="flex items-center justify-center gap-2 text-[11px] text-slate-500 font-medium">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>নিরাপদ অর্ডার সিস্টেম • কোনো আগাম পেমেন্ট দরকার নেই</span>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
