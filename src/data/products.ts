import { Product, Category } from '../types';

export const CATEGORIES: Category[] = [
  { id: 'all', nameBn: 'সব সেবা ও ট্রিটমেন্ট', iconName: 'Grid', count: 10 },
  { id: 'csa_laser', nameBn: 'CSA লেজার ট্রিটমেন্ট', iconName: 'Sparkles', count: 4 },
  { id: 'facial_skin', nameBn: 'ফেসিয়াল ও স্কিন কেয়ার', iconName: 'Heart', count: 3 },
  { id: 'bridal_makeup', nameBn: 'ব্রাইডাল ও পার্টি মেকআপ', iconName: 'Star', count: 2 },
  { id: 'hair_spa', nameBn: 'হেয়ার রিবন্ডিং ও স্পা', iconName: 'Scissors', count: 2 },
];

export const PRODUCTS: Product[] = [
  {
    id: 'laser-hair-removal',
    title: 'CSA Laser Permanent Hair Removal Package - Tanu Beauty Parlour',
    titleBn: 'CSA লেজার স্থায়ী হেয়ার রিমুভাল প্যাকেজ - তনু বিউটি পার্লার',
    category: 'csa_laser',
    categoryBn: 'CSA লেজার ট্রিটমেন্ট',
    price: 490,
    originalPrice: 1500,
    discountPercent: 67,
    rating: 4.98,
    reviewCount: 310,
    stockCount: 50,
    isFeatured: true,
    isBestSeller: true,
    images: [
      'https://images.unsplash.com/photo-1560750588-73207b1ef5b8?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1512290900673-700200874312?auto=format&fit=crop&w=800&q=80'
    ],
    description: 'Tanu Beauty Parlour & Laser Center (Branch of CSA Laser), Dubail, Sehroil Road, Natiyapara Bazar, Delduar, Tangail. Hotline: 01302383795.',
    descriptionBn: 'তনু বিউটি পার্লার এন্ড লেজার সেন্টার (CSA লেজারের একটি শাখা)। ডুবাইল, সেহড়াতৈল রোড, নাটিয়াপাড়া বাজার, দেলদুয়ার, টাঙ্গাইল। হটলাইন: 01302383795। জার্মানি প্রযুক্তির ব্যথামুক্ত সিএসএ লেজারের মাধ্যমে স্থায়ীভাবে মুখের বা শরীরের অনাকাঙ্ক্ষিত চুল রিমুভ করুন।',
    keyFeaturesBn: [
      'জার্মানি প্রযুক্তির উন্নত CSA লেজার (১০০% ব্যথামুক্ত ও নিরাপদ)',
      'ফুল ফেস, আন্ডারআর্মস, হ্যান্ডস ও লেগস কাস্টম সেশন',
      'অভিজ্ঞ নারী লেজার স্পেশালিস্ট দিয়ে শতভাগ স্যানিটাইজড সেবা',
      'ঠিকানা: ডুবাইল, সেহড়াতৈল রোড, নাটিয়াপাড়া বাজার, দেলদুয়ার, টাঙ্গাইল',
      'যোগাযোগ ও বুকিং হটলাইন: 01302383795'
    ],
    specs: {
      'পার্লারের নাম': 'তনু বিউটি পার্লার এন্ড লেজার সেন্টার',
      'শাখা': 'CSA লেজারের একটি বিশেষ শাখা',
      'ঠিকানা': 'ডুবাইল, সেহড়াতৈল রোড, নাটিয়াপাড়া বাজার, দেলদুয়ার, টাঙ্গাইল',
      'হটলাইন': '01302383795',
      'প্রযুক্তি': 'জার্মান CSA Laser System'
    },
    colors: ['ফুল ফেস সেশন', 'আন্ডারআর্মস সেশন', 'হ্যান্ডস ও লেগস সেশন'],
    warrantyBn: '১০০% স্কিন ফ্রেন্ডলি ও নিরাপদ লেজার থেরাপি',
    deliveryDaysBn: 'অনলাইন অ্যাপয়েন্টমেন্ট অথবা সরাসরি পার্লারে আসুন'
  },
  {
    id: 'laser-acne-spot',
    title: 'CSA Laser Pigmentation & Acne Spot Removal',
    titleBn: 'CSA লেজার মেছতা, ব্রণের দাগ ও পিগমেন্টেশন ট্রিটমেন্ট',
    category: 'csa_laser',
    categoryBn: 'CSA লেজার ট্রিটমেন্ট',
    price: 1200,
    originalPrice: 2500,
    discountPercent: 52,
    rating: 4.92,
    reviewCount: 215,
    stockCount: 35,
    isFeatured: true,
    isBestSeller: true,
    images: [
      'https://images.unsplash.com/photo-1512290900673-700200874312?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?auto=format&fit=crop&w=800&q=80'
    ],
    description: 'Special CSA Laser therapy for acne spot removal, melasma and pigmentation treatment at Tanu Beauty Parlour, Delduar, Tangail.',
    descriptionBn: 'মেছতা, ব্রণের মেছতা ভাব এবং পুরনো ছোপ ছোপ কালচে দাগ রিমুভ করতে অত্যাধুনিক CSA লেজার থেরাপি। মেলানিন নিয়ন্ত্রণ করে স্কিনকে করে তোলে দাগহীন ও স্বাভাবিক উজ্জ্বল।',
    keyFeaturesBn: [
      'মেছতা ও যেকোনো পুরনো কালচে ছোপ রিমুভ করতে অনন্য সমাধান',
      'ত্বকের কোলাজেন বৃদ্ধিতে কাজ করে ও রিংকেল দূর করে',
      'কোনো প্রকার কোনো পার্শ্বপ্রতিক্রিয়া ছাড়া দ্রুত ফলপ্রসূ',
      'তনু বিউটি পার্লার টাঙ্গাইল শাখা (কল: 01302383795)'
    ],
    specs: {
      'পার্লার নাম': 'তনু বিউটি পার্লার এন্ড লেজার সেন্টার',
      'প্রযুক্তি': 'CSA Laser Beam Therapy',
      'ঠিকানা': 'নাটিয়াপাড়া বাজার, দেলদুয়ার, টাঙ্গাইল',
      'মোবাইল': '01302383795'
    },
    warrantyBn: 'বিশেষজ্ঞ কনসালটেশন সহ কাস্টমাইজড গাইড',
    deliveryDaysBn: 'অ্যাপয়েন্টমেন্ট বুকিং করে সরাসরি পার্লারে আসুন'
  },
  {
    id: 'laser-tattoo-removal',
    title: 'CSA Laser Tattoo & Birthmark Removal',
    titleBn: 'CSA লেজার ট্যাটু ও জন্মদাগ অপসারণ ট্রিটমেন্ট',
    category: 'csa_laser',
    categoryBn: 'CSA লেজার ট্রিটমেন্ট',
    price: 1800,
    originalPrice: 3500,
    discountPercent: 48,
    rating: 4.89,
    reviewCount: 140,
    stockCount: 20,
    images: [
      'https://images.unsplash.com/photo-1560750588-73207b1ef5b8?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1512290900673-700200874312?auto=format&fit=crop&w=800&q=80'
    ],
    description: 'Safe laser removal of unwanted tattoos and dark birthmarks using precision CSA Laser.',
    descriptionBn: 'অবাঞ্ছিত ট্যাটু বা জন্মদাগ কোনো দাগ না রেখে নিরাপদে তোলার জন্য সিএসএ লেজার প্রযুক্তি। ত্বকের স্বাভাবিক গঠন বজায় রেখে লেজার লাইটের মাধ্যমে পিগমেন্ট ভেঙ্গে দূর করা হয়।',
    keyFeaturesBn: [
      'অনাকাঙ্ক্ষিত ট্যাটু ও স্থায়ী ক্ষতের কালচে দাগ রিমুভাল',
      'ত্বকের ওপর কোনো দাগ বা গর্ত সৃষ্টি হয় না',
      'সম্পূর্ণ জীবাণুমুক্ত পরিবেশে সার্ভিস',
      'তনু বিউটি পার্লার দেলদুয়ার, টাঙ্গাইল'
    ],
    specs: {
      'সেন্টার': 'তনু বিউটি পার্লার এন্ড লেজার সেন্টার',
      'ঠিকানা': 'ডুবাইল, সেহড়াতৈল রোড, নাটিয়াপাড়া বাজার, টাঙ্গাইল',
      'হটলাইন': '01302383795'
    },
    warrantyBn: 'ব্যথামুক্ত ও নিখুঁত স্কিন রিপ্রোসেসিং',
    deliveryDaysBn: 'সরাসরি পার্লার ভিজিট করুন'
  },
  {
    id: 'laser-skin-tightening',
    title: 'CSA Laser Anti-Aging & Skin Tightening Session',
    titleBn: 'CSA লেজার এন্টি-এজিং ও স্কিন টাইটনিং লিফটিং',
    category: 'csa_laser',
    categoryBn: 'CSA লেজার ট্রিটমেন্ট',
    price: 1600,
    originalPrice: 3200,
    discountPercent: 50,
    rating: 4.91,
    reviewCount: 175,
    stockCount: 25,
    images: [
      'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?auto=format&fit=crop&w=800&q=80'
    ],
    description: 'Rejuvenate skin tone and firmness with advanced CSA Laser Anti-aging therapy.',
    descriptionBn: 'বয়সের ছাপ, চোখের কোণের ভাজ ও ঝুলে পড়া চামড়া আবার টানটান করতে সিএসএ লেজার থেরাপি। ত্বকের নতুন কোলাজেন সেল তৈরি করে তারুণ্য ফিরিয়ে আনে।',
    keyFeaturesBn: [
      'ত্বকের ঝুলে পড়া ভাব দূর করে টানটান গ্লো নিয়ে আসে',
      'রিংকেলস ও বয়সের ছাপ দূরীকরণে কাজ করে',
      'নন-সার্জিক্যাল স্কিন লিফটিং থেরাপি',
      'তনু বিউটি পার্লার, দেলদুয়ার, টাঙ্গাইল (01302383795)'
    ],
    specs: {
      'সেন্টার': 'তনু বিউটি পার্লার (CSA লেজার)',
      'সময়কাল': '৪০-৫০ মিনিট',
      'মোবাইল': '01302383795'
    },
    warrantyBn: 'ন্যাচারাল ইয়ং স্কিন ফিল',
    deliveryDaysBn: 'অনলাইন অ্যাপয়েন্টমেন্ট বুকিং'
  },
  {
    id: 'hydra-facial-glow',
    title: 'Advanced 7-Step Deep Hydra Facial & Glow Infusion',
    titleBn: '৭-স্টেপ প্রিমিয়াম হাইড্রা ফেসিয়াল ও ব্রাইটেনিং গ্লো - তনু বিউটি পার্লার',
    category: 'facial_skin',
    categoryBn: 'ফেসিয়াল ও স্কিন কেয়ার',
    price: 1500,
    originalPrice: 3000,
    discountPercent: 50,
    rating: 4.95,
    reviewCount: 280,
    stockCount: 40,
    isFeatured: true,
    isBestSeller: true,
    images: [
      'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1560750588-73207b1ef5b8?auto=format&fit=crop&w=800&q=80'
    ],
    description: 'Deep hydrating facial with water dermabrasion, blackhead extraction and hyaluronic acid infusion for radiant glowing skin.',
    descriptionBn: 'ত্বকের গভীরতম স্তর থেকে ধূলিকণা ও ডেড স্কিন তুলে ফেলে তাৎক্ষণিক ন্যাচারাল ফর্সা গ্লো ফিরিয়ে আনতে আমাদের ৭ ধাপে হাইড্রা ফেসিয়াল। ব্ল্যাকহেডস ও হোয়াইটহেডস দূর করে।',
    keyFeaturesBn: [
      'হাইড্রা ওয়াটার সাকশন দিয়ে পোরস ডিপ ক্লিনজিং',
      'ভিটামিন সি ও হাইড্রালুরোনিক এসিড সিরাম ইনফিউশন',
      'ব্ল্যাকহেডস ও হোয়াইটহেডস একস্ট্রাকশন',
      'তনু বিউটি পার্লার দেলদুয়ার (হটলাইন: 01302383795)'
    ],
    specs: {
      'ধাপসমূহ': '৭টি ডিপ ক্লিনজিং ও গ্লোইন ধাপ',
      'ঠিকানা': 'নাটিয়াপাড়া বাজার, দেলদুয়ার, টাঙ্গাইল',
      'ফোন': '01302383795'
    },
    warrantyBn: 'ইনস্ট্যান্ট ফর্সা ও সতেজ ত্বকের অনুভূতি',
    deliveryDaysBn: 'যেকোনো দিন সকাল ১০টা - রাত ৮টা'
  },
  {
    id: 'gold-diamond-facial',
    title: '24K Gold & Diamond Radiant Facial Therapy',
    titleBn: '২৪কে গোল্ড ও ডায়মন্ড গ্লো ফেসিয়াল থেরাপি',
    category: 'facial_skin',
    categoryBn: 'ফেসিয়াল ও স্কিন কেয়ার',
    price: 1200,
    originalPrice: 2200,
    discountPercent: 45,
    rating: 4.88,
    reviewCount: 160,
    stockCount: 30,
    images: [
      'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1512290900673-700200874312?auto=format&fit=crop&w=800&q=80'
    ],
    description: 'Luxurious 24K gold foil facial for skin brightening, fairness and bridal glow prep.',
    descriptionBn: '২৪ ক্যারেট গোল্ড এক্সট্র্যাক্ট দিয়ে তৈরি বিশেষ ফেসিয়াল যা ত্বকের উজ্জ্বলতা বহু গুণ বাড়িয়ে তোলে। বিয়ে বা যেকোনো বড় অনুষ্ঠানের আগে ত্বককে ঝলমলে করে তুলতে উপযুক্ত।',
    keyFeaturesBn: [
      'অরিজিনাল ২৪কে গোল্ড সিরাম ও মাস্ক প্যাক',
      'ত্বকের সানট্যান ও কালচে ভাব দূর করে',
      'পার্টি ও ব্রাইডাল পিরিয়ডের জন্য সেরা ফেসিয়াল',
      'তনু বিউটি পার্লার, টাঙ্গাইল দেলদুয়ার'
    ],
    specs: {
      'পার্লার': 'তনু বিউটি পার্লার এন্ড লেজার সেন্টার',
      'সময়': '৪৫ মিনিট',
      'ফোন': '01302383795'
    },
    warrantyBn: 'প্রাকৃতিক দ্যুতি ও দীর্ঘস্থায়ী উজ্জ্বলতা',
    deliveryDaysBn: 'অনলাইন সার্ভিস বুকিং'
  },
  {
    id: 'organic-fruit-facial',
    title: 'Herbal Organic Fruit Detox Facial for Sensitive Skin',
    titleBn: 'অর্গানিক হার্বাল ফ্রুট ডিটক্স ফেসিয়াল (সংবেদনশীল ত্বকের জন্য)',
    category: 'facial_skin',
    categoryBn: 'ফেসিয়াল ও স্কিন কেয়ার',
    price: 800,
    originalPrice: 1500,
    discountPercent: 46,
    rating: 4.85,
    reviewCount: 120,
    stockCount: 30,
    images: [
      'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=800&q=80'
    ],
    description: 'Pure organic herbal fruit facial designed for sensitive and acne prone skin.',
    descriptionBn: 'সম্পূর্ণ কেমিক্যাল মুক্ত ১০০% প্রাকৃতিক ফল ও ঔষধি ভেষজ উপাদানে তৈরি ফেসিয়াল। সংবেদনশীল ত্বক বা যাদের কেমিক্যালে অ্যালার্জি রয়েছে তাদের জন্য ১০০% নিরাপদ।',
    keyFeaturesBn: [
      'প্রাকৃতিক ফল ও অ্যালোভেরা ভেষজ মাস্ক',
      'সংবেদনশীল ত্বকের অ্যালার্জি ও র্যাশ দূর করে',
      'সান বার্ন ও সান ট্যান রিমুভাল',
      'তনু বিউটি পার্লার টাঙ্গাইল (01302383795)'
    ],
    specs: {
      'উপাদান': '১০০% প্রাকৃতিক ভেষজ উপাদান',
      'মোবাইল': '01302383795'
    },
    warrantyBn: 'অ্যালার্জি ফ্রি ও রিল্যাক্সিং থেরাপি',
    deliveryDaysBn: 'সরাসরি পার্লারে আসুন'
  },
  {
    id: 'bridal-hd-package',
    title: 'Premium Bridal Waterproof HD Makeup & Jewellery Styling',
    titleBn: 'প্রিমিয়াম ব্রাইডাল ওয়াটারপ্রুফ এইচডি মেকআপ প্যাকেজ - তনু বিউটি পার্লার',
    category: 'bridal_makeup',
    categoryBn: 'ব্রাইডাল ও পার্টি মেকআপ',
    price: 3500,
    originalPrice: 7000,
    discountPercent: 50,
    rating: 4.99,
    reviewCount: 420,
    stockCount: 15,
    isFeatured: true,
    isBestSeller: true,
    images: [
      'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=800&q=80'
    ],
    description: 'Complete bridal makeover with HD waterproof makeup, hair styling, jewellery setting and complimentary skin prep facial.',
    descriptionBn: 'কনের জীবনের সবচেয়ে স্পেশাল দিনের জন্য লং-লাস্টিং এইচডি মেকআপ, আই মেকআপ, আইল্যাশ, হেয়ার ডু, শাড়ি ও জুয়েলারি প্লেসমেন্ট সহ সম্পূর্ণ ব্রাইডাল সার্ভিস। ফ্রি ট্রায়াল ও স্কিন প্রিপারেশন ফেসিয়াল অন্তর্ভুক্ত।',
    keyFeaturesBn: [
      '২৪ ঘণ্টা ওয়াটারপ্রুফ ও সোয়েট-প্রুফ আন্তর্জাতিক ব্র্যান্ডের এইচডি মেকআপ',
      'অভিজ্ঞ ব্রাইডাল মেকআপ আর্টিস্ট দ্বারা নিপুণ সাজ',
      'জুয়েলারি প্লেসমেন্ট, হেয়ার স্টাইলিং ও শাড়ি সেটিং',
      'ফ্রি প্রি-ব্রাইডাল স্কিন কেয়ার কনসালটেশন',
      'তনু বিউটি পার্লার (CSA লেজার শাখা) - 01302383795'
    ],
    specs: {
      'সার্ভিস টাইপ': 'ফুল ব্রাইডাল এইচডি মেকআপ',
      'অন্তর্ভুক্ত': 'মেকআপ + হেয়ার স্টাইল + শাড়ি ড্র্যাপিং + জুয়েলারি সেটিং',
      'ঠিকানা': 'ডুবাইল, সেহড়াতৈল রোড, নাটিয়াপাড়া বাজার, দেলদুয়ার, টাঙ্গাইল',
      'হটলাইন': '01302383795'
    },
    warrantyBn: '১০০% স্যাটিসফেকশন ও প্রি-বুকিং গ্যারান্টি',
    deliveryDaysBn: 'পূর্ব বুকিং আবশ্যক'
  },
  {
    id: 'party-gorgious-makeup',
    title: 'Gorgious Party Glam Makeup & Hair Styling',
    titleBn: 'গর্জিয়াস পার্টি গ্ল্যাম মেকআপ ও লেটেস্ট হেয়ার ড্র্যাপিং',
    category: 'bridal_makeup',
    categoryBn: 'ব্রাইডাল ও পার্টি মেকআপ',
    price: 1200,
    originalPrice: 2200,
    discountPercent: 45,
    rating: 4.9,
    reviewCount: 190,
    stockCount: 30,
    images: [
      'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?auto=format&fit=crop&w=800&q=80'
    ],
    description: 'Glamorous party makeup for weddings, receptions and special events.',
    descriptionBn: 'গায়ে হলুদ, রিসেপশন, বার্থডে বা যেকোনো সামাজিক অনুষ্ঠানের জন্য মনকাড়া স্টাইলিশ গ্ল্যামারাস পার্টি মেকআপ। লেন্স ও আইল্যাশ সেটিং অন্তর্ভুক্ত।',
    keyFeaturesBn: [
      'স্মুথ ফিনিশ পার্টি লুক ও কনট্যুরিং',
      'আইল্যাশ ও হেয়ার ড্র্যাপিং সহ সম্পূর্ণ লুক',
      'অরিজিনাল ব্র্যান্ডের কসমোটোলজিকাল প্রোডাক্ট',
      'তনু বিউটি পার্লার দেলদুয়ার (01302383795)'
    ],
    specs: {
      'সার্ভিস': 'পার্টি গ্ল্যাম মেকআপ',
      'মোবাইল': '01302383795'
    },
    warrantyBn: 'লং লাস্টিং ওয়াটারপ্রুফ মেকআপ',
    deliveryDaysBn: 'অনলাইন বুকিং করুন'
  },
  {
    id: 'hair-straight-rebonding',
    title: 'Silk Shine Hair Straight Rebonding & Keratin Spa Treatment',
    titleBn: 'সিল্কি শাইন হেয়ার স্ট্রেইট রিবন্ডিং ও কেরাটিন স্মুদেনিং স্পা',
    category: 'hair_spa',
    categoryBn: 'হেয়ার রিবন্ডিং ও স্পা',
    price: 2500,
    originalPrice: 5000,
    discountPercent: 50,
    rating: 4.96,
    reviewCount: 230,
    stockCount: 20,
    isFeatured: true,
    images: [
      'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1560750588-73207b1ef5b8?auto=format&fit=crop&w=800&q=80'
    ],
    description: "L'Oreal and Schwarzkopf milk rebonding with deep keratin spa for ultra silky straight hair.",
    descriptionBn: 'কোঁকড়ানো বা রুক্ষ চুলকে কাচের মতো চকচকে সিল্কি ও সোজা করতে লোরিয়াল ও সোয়ার্জকফ অরিজিনাল মিল্ক রিবন্ডিং এবং কেরাটিন ডিপ প্রোটিন স্পা থেরাপি।',
    keyFeaturesBn: [
      'অরিজিনাল ইমপোর্টেড মিল্ক রিবন্ডিং ক্রিম',
      'চুলের ক্ষতি ছাড়াই স্থায়ী সিল্কি সোজা চুল',
      'ফ্রি ড্যামেজ প্রটেকশন স্পা সেশন',
      'তনু বিউটি পার্লার দেলদুয়ার, টাঙ্গাইল'
    ],
    specs: {
      'ব্র্যান্ড': 'L\'Oreal Professional / Schwarzkopf',
      'স্থায়িত্ব': '১ বছরের বেশি প্রফেশনাল সিল্কনেস',
      'স্থান': 'ডুবাইল, নাটিয়াপাড়া বাজার, দেলদুয়ার, টাঙ্গাইল',
      'ফোন': '01302383795'
    },
    warrantyBn: '১০০% অরিজিনাল প্রোডাক্ট গ্যারান্টি',
    deliveryDaysBn: 'বুকিং করে পার্লারে সরাসরি আসুন'
  },
  {
    id: 'hair-fall-protein-spa',
    title: 'Hair Fall Repair Protein Spa & Dandruff Treatment',
    titleBn: 'চুল পড়া বন্ধের হেয়ার প্রোটিন স্পা ও ড্যানড্রাফ কন্ট্রোল',
    category: 'hair_spa',
    categoryBn: 'হেয়ার রিবন্ডিং ও স্পা',
    price: 800,
    originalPrice: 1500,
    discountPercent: 46,
    rating: 4.87,
    reviewCount: 150,
    stockCount: 30,
    images: [
      'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=800&q=80'
    ],
    description: 'Deep hair root nourishing protein spa to prevent hair loss and eliminate stubborn dandruff.',
    descriptionBn: 'চুলের গোড়া মজবুত করতে এবং খুশকি সম্পূর্ণরূপে দূর করতে ডিপ নারিশিং প্রোটিন স্পা ও স্টিম থেরাপি। চুল পড়া ৯০% পর্যন্ত হ্রাস পায়।',
    keyFeaturesBn: [
      'চুলের গোড়ায় ডিপ অর্গানিক প্রোটিন স্টিমিং',
      'খুশকি ও স্ক্যাল্পের চুলকানি দূরীকরণে ১০০% কার্যকরী',
      'চুলকে ঘন ও সতেজ করতে সহায়তা করে',
      'তনু বিউটি পার্লার টাঙ্গাইল (01302383795)'
    ],
    specs: {
      'সময়কাল': '৪০ মিনিট প্রফেশনাল সেশন',
      'মোবাইল': '01302383795'
    },
    warrantyBn: 'মজবুত ও নরম সিল্কি চুল',
    deliveryDaysBn: 'অ্যাপয়েন্টমেন্ট বুকিং'
  }
];
