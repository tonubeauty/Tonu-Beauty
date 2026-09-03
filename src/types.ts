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
