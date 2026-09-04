export interface Product {
  id: string;
  title: string;
  titleBn: string;
  category: string;
  categoryBn: string;
  itemType?: 'product' | 'service'; // 'product' = পণ্য (অনলাইন ও অফলাইনে বিক্রি ও ডেলিভারি), 'service' = সার্ভিস (ডেলিভারি হবে না, প্রতিষ্ঠানে এসে নিতে হবে)
  price: number; // Price in BDT
  originalPrice: number; // Original price before discount
  discountPercent: number;
  rating: number; // 1 to 5
  reviewCount: number;
  stockCount: number;
  isFeatured?: boolean;
  isBestSeller?: boolean;
  isNewArrival?: boolean;
  images: string[];
  description: string;
  descriptionBn: string;
  keyFeaturesBn: string[];
  specs: Record<string, string>;
  colors?: string[];
  sizes?: string[];
  warrantyBn?: string;
  deliveryDaysBn?: string;
  deliveryNoticeBn?: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
  selectedColor?: string;
  selectedSize?: string;
}

export type DeliveryZone = 'inside_dhaka' | 'outside_dhaka';

export interface OrderFormData {
  fullName: string;
  phone: string;
  altPhone?: string;
  address: string;
  district: string;
  area?: string;
  deliveryNote?: string;
  deliveryZone: DeliveryZone;
  paymentMethod: 'cod' | 'cash' | 'bkash' | 'nagad';
  agreeTerms: boolean;
}

export interface OrderTrackingEvent {
  status: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered';
  titleBn: string;
  timestamp: string;
  descriptionBn: string;
  completed: boolean;
}

export interface OrderItem {
  productId: string;
  productTitle: string;
  quantity: number;
  price: number;
  color?: string;
  size?: string;
  image?: string;
}

export interface Order {
  orderId: string;
  createdAt: string;
  customerName: string;
  phone: string;
  address: string;
  district: string;
  deliveryZone?: DeliveryZone;
  orderType?: 'appointment' | 'order' | 'manual_bill';
  items: OrderItem[];
  subtotal: number;
  deliveryFee: number;
  discount?: number;
  paidAmount?: number;
  dueAmount?: number;
  notes?: string;
  totalAmount: number;
  paymentMethod: 'cod' | 'cash' | 'bkash' | 'nagad';
  status: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered';
  trackingHistory: OrderTrackingEvent[];
  securityHash?: string;
}

export interface Category {
  id: string;
  nameBn: string;
  iconName: string;
  count: number;
}

export interface FilterOptions {
  category: string;
  searchQuery: string;
  minPrice: number;
  maxPrice: number;
  sortBy: 'popular' | 'price_low' | 'price_high' | 'newest' | 'rating';
  inStockOnly: boolean;
}

export interface Review {
  id: string;
  author: string;
  rating: number;
  date: string;
  comment: string;
  verifiedPurchase: boolean;
}

export type AppointmentStatus = 'pending' | 'received' | 'not_attended' | 'contacted' | 'cancelled';

export interface Appointment {
  id: string;
  name: string; // নাম
  address: string; // ঠিকানা
  phone: string; // ফোন নম্বর
  service: string; // সেবা
  date: string; // YYYY-MM-DD
  dateDisplay: string; // দিন/মাস ও বছর (e.g. 05/09/2026)
  time?: string; // সময় (যেমন: ১১:০০ AM)
  status: AppointmentStatus; // স্ট্যাটাস: অপেক্ষমান / রিসিভড / আসলো না / যোগাযোগ সম্পন্ন / বাতিল
  notes?: string; // অতিরিক্ত বিবরণ
  createdAt: string;
  updatedAt?: string;
  receivedAt?: string; // রিসিভ করার সময়
  lastContactedAt?: string; // যোগাযোগের সময়
  contactNotes?: string; // যোগাযোগের বিবরণ বা প্রতিক্রিয়া
}

export interface AppointmentServiceCategory {
  id: string;
  name: string; // সার্ভিসের নাম (যা পরবর্তীতে ক্যাটাগরি হিসেবে সংরক্ষিত থাকবে)
  count?: number;
  createdAt?: string;
}
