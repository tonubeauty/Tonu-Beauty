import express, { Request, Response } from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { PRODUCTS, isProductItem } from './src/data/products';
import { Order, OrderFormData, CartItem } from './src/types';

// In-memory store for orders (with seed sample for demo tracking)
const ordersStore: Order[] = [
  {
    orderId: 'BD-88412',
    createdAt: new Date(Date.now() - 3600000 * 24).toISOString(),
    customerName: 'মোহাম্মদ রাফসান',
    phone: '01712345678',
    address: 'বাসা ৪২, রোড ৭, ধানমন্ডি',
    district: 'ঢাকা',
    deliveryZone: 'inside_dhaka',
    items: [
      {
        productId: 'prod-1',
        productTitle: 'আল্ট্রা ট্রু ওয়্যারলেস ব্লুটুথ ইয়ারবাডস উইথ নোয়েজ ক্যানসেলেশন',
        quantity: 1,
        price: 1450,
        color: 'ব্ল্যাক',
        image: 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?auto=format&fit=crop&w=400&q=80'
      }
    ],
    subtotal: 1450,
    deliveryFee: 60,
    totalAmount: 1510,
    paymentMethod: 'cod',
    status: 'processing',
    trackingHistory: [
      {
        status: 'pending',
        titleBn: 'অর্ডার গ্রহন সম্পন্ন',
        timestamp: new Date(Date.now() - 3600000 * 24).toLocaleString('bn-BD'),
        descriptionBn: 'আপনার অর্ডারটি সফলভাবে গ্রহণ করা হয়েছে।',
        completed: true
      },
      {
        status: 'confirmed',
        titleBn: 'অর্ডার নিশ্চিতকরণ',
        timestamp: new Date(Date.now() - 3600000 * 18).toLocaleString('bn-BD'),
        descriptionBn: 'পণ্য স্টক যাচাই সম্পন্ন এবং অর্ডার নিশ্চিত করা হয়েছে।',
        completed: true
      },
      {
        status: 'processing',
        titleBn: 'প্যাকিং ও কোয়ালিটি চেক',
        timestamp: new Date(Date.now() - 3600000 * 6).toLocaleString('bn-BD'),
        descriptionBn: 'সুরক্ষিত বাবল র‍্যাপে পার্সেল প্যাকিং সম্পন্ন করা হচ্ছে।',
        completed: true
      },
      {
        status: 'shipped',
        titleBn: 'কুরিয়ারে হস্তান্তর',
        timestamp: 'আসন্ন',
        descriptionBn: 'রেডক্স/স্টেডফাস্ট কুরিয়ারে রাইডারের নিকট পার্সেল হস্তান্তরিত হবে।',
        completed: false
      },
      {
        status: 'delivered',
        titleBn: 'ক্যাশ অন ডেলিভারি সম্পন্ন',
        timestamp: 'আসন্ন',
        descriptionBn: 'পণ্য হাতে পেয়ে টাকা বুঝিয়ে দেবেন।',
        completed: false
      }
    ]
  }
];

// Security helper: sanitize raw strings to prevent HTML injection
function sanitizeInput(str: string): string {
  if (typeof str !== 'string') return '';
  return str.replace(/[<>'"]/g, '').trim();
}

// Phone validator for Bangladeshi mobile numbers
function isValidBDPhone(phone: string): boolean {
  const cleanPhone = phone.replace(/[\s-]/g, '');
  const bdPhoneRegex = /^(?:\+88|88)?(01[3-9]\d{8})$/;
  return bdPhoneRegex.test(cleanPhone);
}

// Convert Bengali numerals to English numerals
function normalizeBnToEn(str: string): string {
  if (!str) return '';
  const bnToEn: Record<string, string> = {
    '০': '0', '১': '1', '২': '2', '৩': '3', '৪': '4',
    '৫': '5', '৬': '6', '৭': '7', '৮': '8', '৯': '9'
  };
  return str.replace(/[০-৯]/g, (d) => bnToEn[d] || d);
}

// Clean string for unified search comparison
function cleanSearchQuery(str: string): string {
  if (!str) return '';
  return normalizeBnToEn(str)
    .replace(/[\s\-_#,:;./\\]/g, '')
    .toLowerCase()
    .trim();
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Middleware for JSON body parsing
  app.use(express.json({ limit: '1mb' }));

  // API Route: Health Check
  app.get('/api/health', (_req: Request, res: Response) => {
    res.json({ status: 'ok', serverTime: new Date().toISOString() });
  });

  // API Route: Get Product Catalog
  app.get('/api/products', (_req: Request, res: Response) => {
    res.json({ success: true, count: PRODUCTS.length, products: PRODUCTS });
  });

  // API Route: Place Cash on Delivery Order (with Security Validation & Price Recalculation)
  app.post('/api/orders', (req: Request, res: Response) => {
    try {
      const { customer, items } = req.body as {
        customer: OrderFormData;
        items: { productId: string; quantity: number; color?: string; size?: string }[];
      };

      // Security Check 1: Input presence validation
      if (!customer || !items || !Array.isArray(items) || items.length === 0) {
        return res.status(400).json({
          success: false,
          messageBn: 'অবৈধ অনুরোধ! অনুগ্রহ করে সঠিক কার্ট তথ্য ও নাম-ঠিকানা প্রদান করুন।'
        });
      }

      // Sanitize fields
      const fullName = sanitizeInput(customer.fullName);
      const phone = sanitizeInput(customer.phone);
      const altPhone = sanitizeInput(customer.altPhone || '');
      const address = sanitizeInput(customer.address);
      const district = sanitizeInput(customer.district);
      const deliveryNote = sanitizeInput(customer.deliveryNote || '');
      const deliveryZone = customer.deliveryZone === 'outside_dhaka' ? 'outside_dhaka' : 'inside_dhaka';

      // Security Check 2: Name and Address length
      if (fullName.length < 2) {
        return res.status(400).json({
          success: false,
          messageBn: 'অনুগ্রহ করে আপনার সঠিক নাম প্রদান করুন (নূন্যতম ২ অক্ষর)।'
        });
      }

      if (address.length < 5) {
        return res.status(400).json({
          success: false,
          messageBn: 'অনুগ্রহ করে আপনার বিস্তারিত ডেলিভারি ঠিকানা প্রদান করুন।'
        });
      }

      // Security Check 3: BD Phone validation
      if (!isValidBDPhone(phone)) {
        return res.status(400).json({
          success: false,
          messageBn: 'অবৈধ মোবাইল নম্বর! অনুগ্রহ করে ১১ ডিজিটের সঠিক বাংলাদেশী মোবাইল নম্বর দিন (যেমন: 01712345678)।'
        });
      }

      // Security Check 4: Server-side Price Calculation (prevents client-side price manipulation)
      let calculatedSubtotal = 0;
      const verifiedItems: Order['items'] = [];

      for (const item of items) {
        const product = PRODUCTS.find((p) => p.id === item.productId);
        if (!product) {
          return res.status(400).json({
            success: false,
            messageBn: `পণ্য পাওয়া যায়নি! আইডি: ${item.productId}`
          });
        }

        const qty = Math.max(1, Math.min(10, Math.floor(Number(item.quantity) || 1)));
        const itemPrice = product.price; // Always take official server price
        calculatedSubtotal += itemPrice * qty;

        verifiedItems.push({
          productId: product.id,
          productTitle: product.titleBn,
          quantity: qty,
          price: itemPrice,
          color: item.color,
          size: item.size,
          image: product.images[0]
        });
      }

      // Delivery Fee Calculation:
      // Physical products require delivery; parlour service-only reservations do not have delivery fee!
      const hasPhysicalProducts = verifiedItems.some((it) => {
        const prod = PRODUCTS.find((p) => p.id === it.productId);
        return isProductItem(prod);
      });
      const deliveryFee = hasPhysicalProducts ? (deliveryZone === 'inside_dhaka' ? 60 : 120) : 0;
      const totalAmount = calculatedSubtotal + deliveryFee;

      // Unique Order ID Generation (BD-XXXXX)
      const randomNum = Math.floor(10000 + Math.random() * 90000);
      const orderId = `BD-${randomNum}`;

      const now = new Date();
      const timestampBn = now.toLocaleString('bn-BD', {
        dateStyle: 'medium',
        timeStyle: 'short'
      });

      // Construct Order Record
      const newOrder: Order = {
        orderId,
        createdAt: now.toISOString(),
        customerName: fullName,
        phone,
        address: `${address}${district ? `, ${district}` : ''}`,
        district: district || (deliveryZone === 'inside_dhaka' ? 'ঢাকা' : 'ঢাকার বাইরে'),
        deliveryZone,
        items: verifiedItems,
        subtotal: calculatedSubtotal,
        deliveryFee,
        totalAmount,
        paymentMethod: 'cod',
        status: 'pending',
        securityHash: Buffer.from(`${orderId}:${phone}:${totalAmount}`).toString('base64'),
        trackingHistory: [
          {
            status: 'pending',
            titleBn: 'অর্ডার গ্রহন করা হয়েছে',
            timestamp: timestampBn,
            descriptionBn: 'আপনার ক্যাশ অন ডেলিভারি অর্ডারটি সিস্টেমে নথিভুক্ত করা হয়েছে।',
            completed: true
          },
          {
            status: 'confirmed',
            titleBn: 'অর্ডার যাচাই ও কনফার্মেশন',
            timestamp: 'প্রসেসিং হচ্ছে',
            descriptionBn: 'আমাদের প্রতিনিধি ফোন কলের মাধ্যমে তথ্য যাচাই সম্পন্ন করবেন।',
            completed: false
          },
          {
            status: 'processing',
            titleBn: 'প্যাকিং ও কোয়ালিটি কন্ট্রোল',
            timestamp: 'অপেক্ষমাণ',
            descriptionBn: 'পণ্য চেক করে ওয়াটারপ্রুফ ব্যাগে সুরক্ষিতভাবে প্যাক করা হবে।',
            completed: false
          },
          {
            status: 'shipped',
            titleBn: 'কুরিয়ারে হ্যান্ডওভার',
            timestamp: 'অপেক্ষমাণ',
            descriptionBn: 'পার্সেল কুরিয়ার রাইডারের কাছে সমর্পণ করা হবে।',
            completed: false
          },
          {
            status: 'delivered',
            titleBn: 'ডেলিভারি ও ক্যাশ কালেকশন',
            timestamp: 'অপেক্ষমাণ',
            descriptionBn: 'পণ্য বুঝে পেয়ে রাইডারকে টাকা প্রদান করুন।',
            completed: false
          }
        ]
      };

      ordersStore.unshift(newOrder);

      return res.status(201).json({
        success: true,
        messageBn: 'আপনার ক্যাশ অন ডেলিভারি অর্ডারটি সফলভাবে গ্রহণ করা হয়েছে!',
        order: newOrder
      });
    } catch (err) {
      console.error('Order Error:', err);
      return res.status(500).json({
        success: false,
        messageBn: 'সার্ভারে একটি সাময়িক সমস্যা হয়েছে। অনুগ্রহ করে আবার চেষ্টা করুন।'
      });
    }
  });

  // API Route: Order Status Tracking Lookup
  app.get('/api/orders/track', (req: Request, res: Response) => {
    const rawQuery = sanitizeInput((req.query.query as string) || '').trim();

    if (!rawQuery) {
      return res.status(400).json({
        success: false,
        messageBn: 'অনুগ্রহ করে আপনার অর্ডার আইডি (যেমন: BD-88412 বা TB-123456) অথবা মোবাইল নম্বর প্রদান করুন।'
      });
    }

    const cleanQ = cleanSearchQuery(rawQuery);
    const queryDigits = cleanQ.replace(/\D/g, '');

    // Search by Order ID or Mobile number or Customer Name
    const foundOrders = ordersStore.filter((o) => {
      const cleanOrderId = cleanSearchQuery(o.orderId || '');
      const cleanPhone = cleanSearchQuery(o.phone || '');
      const cleanCustomer = (o.customerName || '').toLowerCase().trim();

      // 1. Order ID Match
      if (cleanOrderId && (cleanOrderId.includes(cleanQ) || cleanQ.includes(cleanOrderId))) {
        return true;
      }

      // 2. Numeric digits match
      const orderDigits = cleanOrderId.replace(/\D/g, '');
      if (queryDigits.length >= 3 && orderDigits && (orderDigits.includes(queryDigits) || queryDigits.includes(orderDigits))) {
        return true;
      }

      // 3. Phone match
      const phoneDigits = cleanPhone.replace(/\D/g, '');
      if (queryDigits.length >= 4 && phoneDigits) {
        if (phoneDigits.includes(queryDigits) || queryDigits.includes(phoneDigits)) {
          return true;
        }
      }

      // 4. Customer Name match
      if (cleanCustomer && cleanCustomer.includes(rawQuery.toLowerCase().trim())) {
        return true;
      }

      return false;
    });

    if (foundOrders.length === 0) {
      return res.status(404).json({
        success: false,
        messageBn: 'দুঃখিত! এই বুকিং আইডি বা মোবাইল নম্বরে কোনো অর্ডার রেকর্ড পাওয়া যায়নি।'
      });
    }

    return res.json({
      success: true,
      orders: foundOrders
    });
  });

  // Vite middleware for dev or Static serving for prod
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
