import { Order } from '../types';

export interface ReceiptParlourInfo {
  branchName: string;
  hotline: string;
  address: string;
  hours?: string;
}

export const DEFAULT_PARLOUR_INFO: ReceiptParlourInfo = {
  branchName: 'তনু বিউটি পার্লার এন্ড লেজার সেন্টার',
  hotline: '01302383795',
  address: 'ডুবাইল, সেহড়াতৈল রোড, নাটিয়াপাড়া বাজার, দেলদুয়ার, টাঙ্গাইল',
  hours: 'সকাল ১০:০০ টা - রাত ৮:০০ টা',
};

/**
 * Generates pure offline text representation of the receipt for QR code.
 * When scanned by ANY smartphone camera or QR scanner, it displays the receipt
 * text directly on screen WITHOUT opening any website or browser.
 */
export function generateOfflineReceiptText(
  order: Order,
  parlourInfo: ReceiptParlourInfo = DEFAULT_PARLOUR_INFO
): string {
  const subtotal = order.subtotal || order.items.reduce((s, it) => s + (it.price * it.quantity), 0);
  const discount = order.discount || 0;
  const deliveryFee = order.deliveryFee || 0;
  const total = order.totalAmount || (subtotal - discount + deliveryFee);
  const paid = order.paidAmount !== undefined ? order.paidAmount : total;
  const due = order.dueAmount !== undefined ? order.dueAmount : Math.max(0, total - paid);

  const formattedDate = new Date(order.createdAt).toLocaleDateString('bn-BD', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const itemsList = order.items
    .map(
      (it, idx) =>
        `${idx + 1}. ${it.productTitle || (it as unknown as { titleBn?: string }).titleBn || 'আইটেম'} (${it.quantity}টি) - ৳${(it.price * it.quantity).toLocaleString('bn-BD')}`
    )
    .join('\n');

  const statusBn =
    order.status === 'delivered'
      ? 'সম্পন্ন (Delivered)'
      : order.status === 'shipped'
      ? 'ডেলিভারিতে চলমান'
      : order.status === 'confirmed'
      ? 'অনুমোদিত (Confirmed)'
      : order.status === 'processing'
      ? 'প্রসেসিং (Processing)'
      : 'পেন্ডিং (Pending)';

  return `[ অফিসিয়াল ডিজিটাল ক্যাশ মেমো ]
================================
${parlourInfo.branchName}
হটলাইন: ${parlourInfo.hotline}
ঠিকানা: ${parlourInfo.address}
================================
মেমো / বুকিং নং: #${order.orderId}
তারিখ: ${formattedDate}
গ্রাহক: ${order.customerName}
মোবাইল: ${order.phone}
ঠিকানা: ${order.address || 'প্রতিষ্ঠানে সেবা গ্রহণ'}

[ সেবা ও পণ্যের বিবরণ ]
${itemsList}
--------------------------------
সাবটোটাল: ৳${subtotal.toLocaleString('bn-BD')}
${discount > 0 ? `বিশেষ ছাড়: -৳${discount.toLocaleString('bn-BD')}\n` : ''}${deliveryFee > 0 ? `ডেলিভারি চার্জ: ৳${deliveryFee.toLocaleString('bn-BD')}\n` : ''}সর্বমোট বিল: ৳${total.toLocaleString('bn-BD')}
পরিশোধিত টাকা: ৳${paid.toLocaleString('bn-BD')}
বকেয়া / বাকি: ৳${due.toLocaleString('bn-BD')}
পেমেন্ট অবস্থা: ${due === 0 ? '✅ সম্পূর্ণ পরিশোধিত (PAID)' : '⚠️ বকেয়া রয়েছে (DUE)'}
সার্ভিস অবস্থা: ${statusBn}
================================
* তনু বিউটি পার্লার কর্তৃক আনুষ্ঠানিকভাবে অনুমোদিত ও ভেরিফাইড মেমো।`;
}

/**
 * Returns the isolated web receipt URL (?receipt=ID).
 * Opens strictly the isolated receipt without the rest of the website.
 */
export function getSecureReceiptUrl(orderId: string): string {
  if (typeof window === 'undefined') return `?receipt=${orderId}`;
  return `${window.location.origin}${window.location.pathname}?receipt=${encodeURIComponent(orderId)}`;
}
