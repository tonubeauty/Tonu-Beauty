import React from 'react';
import { X, Trash2, ShoppingBag, Plus, Minus, ArrowRight, ShieldCheck, Truck, Building2, AlertTriangle, Calendar } from 'lucide-react';
import { CartItem, DeliveryZone } from '../types';
import { isProductItem } from '../data/products';

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
  const hasPhysicalProducts = cartItems.some((item) => isProductItem(item.product));
  const hasServices = cartItems.some((item) => !isProductItem(item.product));
  
  // Delivery fee is only charged if physical products are in the cart
  const deliveryFee = hasPhysicalProducts ? (deliveryZone === 'inside_dhaka' ? 60 : 120) : 0;
  const totalAmount = subtotal > 0 ? subtotal + deliveryFee : 0;

  // Free shipping threshold (only relevant if physical products exist)
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
              <h3 className="font-bold text-slate-900 text-base leading-tight">আপনার কার্ট ও বুকিং</h3>
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

        {/* Product / Service Notice */}
        {cartItems.length > 0 && (
          <div className="px-4 py-2 bg-slate-100 border-b border-slate-200 text-xs text-slate-700 flex items-center justify-between">
            <span className="font-semibold text-slate-800">আইটেম ধরণ:</span>
            <div className="flex items-center gap-2 text-[10px]">
              {hasPhysicalProducts && (
                <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-bold">
                  🛍️ পণ্য (ডেলিভারিযোগ্য)
                </span>
              )}
              {hasServices && (
                <span className="px-2 py-0.5 rounded bg-rose-100 text-rose-800 font-bold">
                  🏢 সার্ভিস (প্রতিষ্ঠানে গ্রহণ)
                </span>
              )}
            </div>
          </div>
        )}

        {/* Free Shipping Progress Indicator (only if physical goods exist) */}
        {hasPhysicalProducts && subtotal > 0 && (
          <div className="bg-emerald-50 px-4 py-2.5 border-b border-emerald-100 text-xs">
            {remainingForFreeShipping > 0 ? (
              <p className="text-emerald-800 font-medium mb-1">
                আর <b>৳{remainingForFreeShipping.toLocaleString('bn-BD')}</b> টাকার পণ্যে পাচ্ছেন ঢাকা সিটিতে ফ্রি ডেলিভারি!
              </p>
            ) : (
              <p className="text-emerald-700 font-bold mb-1 flex items-center gap-1">
                🎉 অভিনন্দন! পণ্যের অর্ডারে ঢাকা সিটিতে ফ্রি ডেলিভারি প্রযোজ্য!
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
        <div data-lenis-prevent className="flex-1 overflow-y-auto p-4 space-y-3 no-scrollbar">
          {cartItems.length > 0 ? (
            cartItems.map(({ product, quantity, selectedColor }) => {
              const isPhysical = isProductItem(product);
              return (
                <div
                  key={product.id}
                  className={`flex items-center gap-3 p-3 rounded-2xl border transition-all ${
                    isPhysical
                      ? 'bg-emerald-50/40 border-emerald-200/80 hover:border-emerald-300'
                      : 'bg-rose-50/40 border-rose-200/80 hover:border-rose-300'
                  }`}
                >
                  {/* Thumbnail */}
                  <div className="w-16 h-16 rounded-xl bg-white border border-slate-200 overflow-hidden shrink-0 relative">
                    <img
                      src={product.images[0]}
                      alt={product.titleBn}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover"
                    />
                  </div>

                  {/* Details */}
                  <div className="flex-1 min-w-0 space-y-1">
                    <div className="flex items-center gap-1.5">
                      <span className={`text-[9px] font-bold px-1.5 py-0.2 rounded ${
                        isPhysical
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-rose-100 text-rose-800'
                      }`}>
                        {isPhysical ? 'পণ্য • ডেলিভারি' : 'সার্ভিস • প্রতিষ্ঠানে'}
                      </span>
                    </div>

                    <h4 className="text-xs font-bold text-slate-900 truncate leading-snug" title={product.titleBn}>
                      {product.titleBn}
                    </h4>

                    {selectedColor && (
                      <span className="text-[10px] text-slate-500 bg-white px-1.5 py-0.5 rounded border border-slate-200 inline-block">
                        কালার: {selectedColor}
                      </span>
                    )}

                    <div className="flex items-center justify-between pt-1">
                      <span className={`text-sm font-extrabold ${isPhysical ? 'text-emerald-700' : 'text-slate-900'}`}>
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
              );
            })
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-3">
              <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center text-slate-400">
                <ShoppingBag className="w-8 h-8" />
              </div>
              <h4 className="font-bold text-slate-800 text-base">আপনার কার্ট ফাঁকা</h4>
              <p className="text-xs text-slate-500 max-w-xs">
                পছন্দের প্রসাধন পণ্য বা পার্লার সেবা কার্টে যোগ করুন।
              </p>
              <button
                onClick={onClose}
                className="px-5 py-2.5 rounded-xl bg-emerald-600 text-white font-semibold text-xs shadow-xs hover:bg-emerald-700 transition-colors cursor-pointer"
              >
                পণ্য ও সার্ভিস দেখুন
              </button>
            </div>
          )}
        </div>

        {/* Footer Checkout Summary */}
        {cartItems.length > 0 && (
          <div className="p-4 sm:p-5 border-t border-slate-200 bg-slate-50 space-y-3.5">
            
            {/* Delivery Location Selector - Only if physical products are in the cart */}
            {hasPhysicalProducts ? (
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 flex items-center justify-between">
                  <span>পণ্যের ডেলিভারি লোকেশন:</span>
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
            ) : (
              <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-900 space-y-1">
                <div className="font-bold flex items-center gap-1.5 text-amber-950">
                  <Building2 className="w-3.5 h-3.5 text-amber-700" />
                  <span>সার্ভিস সরাসরি প্রতিষ্ঠানে এসে নিতে হবে:</span>
                </div>
                <p className="text-[11px] text-amber-800">
                  প্রোডাক্ট ছাড়া বাকি সার্ভিসগুলো কোনো হোম ডেলিভারি হবে না। প্রতিষ্ঠানে এসে সেবা গ্রহণের জন্য কোনো ডেলিভারি চার্জ নেই (৳০)।
                </p>
              </div>
            )}

            {/* Calculations */}
            <div className="space-y-1 text-xs text-slate-600 pt-1 border-t border-slate-200">
              <div className="flex justify-between">
                <span>সাব টোটাল:</span>
                <span className="font-semibold text-slate-900">৳{subtotal.toLocaleString('bn-BD')}</span>
              </div>
              <div className="flex justify-between">
                <span>ডেলিভারি চার্জ:</span>
                {hasPhysicalProducts ? (
                  <span className="font-semibold text-slate-900">৳{deliveryFee.toLocaleString('bn-BD')}</span>
                ) : (
                  <span className="font-bold text-emerald-700">৳০ (ডেলিভারি প্রযোজ্য নয়)</span>
                )}
              </div>
              <div className="flex justify-between text-base font-extrabold text-slate-900 pt-2 border-t border-slate-200">
                <span>সর্বমোট পরিশোধযোগ্য:</span>
                <span className={hasPhysicalProducts ? 'text-emerald-700' : 'text-slate-900'}>
                  ৳{totalAmount.toLocaleString('bn-BD')}
                </span>
              </div>
            </div>

            {/* Checkout Action */}
            <button
              onClick={onProceedToCheckout}
              className={`w-full py-3.5 px-4 rounded-xl text-white font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer ${
                hasPhysicalProducts
                  ? 'bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800'
                  : 'bg-rose-600 hover:bg-rose-700 active:bg-rose-800'
              }`}
            >
              <span>{hasPhysicalProducts ? 'অর্ডার ও বুকিং সম্পন্ন করুন' : 'সিরিয়াল বুকিং কনফার্ম করুন'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <div className="flex items-center justify-center gap-2 text-[11px] text-slate-500 font-medium">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>নিরাপদ সিস্টেম • কোনো আগাম পেমেন্ট দরকার নেই</span>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
