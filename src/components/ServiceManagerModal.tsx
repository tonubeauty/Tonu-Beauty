import React, { useState, useEffect } from 'react';
import { Product, Category } from '../types';
import { isProductItem } from '../data/products';
import { compressImageFile } from '../lib/imageCompressor';
import {
  X,
  Upload,
  Sparkles,
  Plus,
  Trash2,
  Image as ImageIcon,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Tag,
  ShoppingBag,
  Building2,
  FileText,
  Truck
} from 'lucide-react';

interface ServiceManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  productToEdit: Product | null;
  categories: Category[];
  onSave: (productData: Product) => Promise<void>;
}

// Preset beauty parlour high-definition images as quick choices
const PRESET_BEAUTY_IMAGES = [
  {
    title: 'লেজার ট্রিটমেন্ট',
    url: 'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?auto=format&fit=crop&q=80&w=800',
  },
  {
    title: 'ব্রাইডাল সাজ',
    url: 'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?auto=format&fit=crop&q=80&w=800',
  },
  {
    title: 'স্কিন কেয়ার ফেসিয়াল',
    url: 'https://images.unsplash.com/photo-1512290900672-1f5be4eb5b14?auto=format&fit=crop&q=80&w=800',
  },
  {
    title: 'হেয়ার কাট ও রিবন্ডিং',
    url: 'https://images.unsplash.com/photo-1562322140-8baeececf3df?auto=format&fit=crop&q=80&w=800',
  },
  {
    title: 'ম্যানিকিউর ও স্পা',
    url: 'https://images.unsplash.com/photo-1632345031435-8727f6897d53?auto=format&fit=crop&q=80&w=800',
  },
  {
    title: 'বডি স্পা ও ম্যাসাজ',
    url: 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&q=80&w=800',
  },
];

// Preset cosmetic products images as quick choices
const PRESET_PRODUCT_IMAGES = [
  {
    title: 'ভিটামিন সি সিরাম',
    url: 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&w=800&q=80',
  },
  {
    title: 'গ্লো ক্রিম ও ময়েশ্চারাইজার',
    url: 'https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&w=800&q=80',
  },
  {
    title: 'ফেসওয়াশ ও ক্লিনজার',
    url: 'https://images.unsplash.com/photo-1556228722-d0b5d0f3bb2c?auto=format&fit=crop&w=800&q=80',
  },
  {
    title: 'সানস্ক্রিন এসপিএফ ৫০+',
    url: 'https://images.unsplash.com/photo-1598440947619-2c35fc9aa908?auto=format&fit=crop&w=800&q=80',
  },
  {
    title: 'স্কিন টোনার ও এসেন্স',
    url: 'https://images.unsplash.com/photo-1608248597359-216524177d70?auto=format&fit=crop&w=800&q=80',
  },
];

export const ServiceManagerModal: React.FC<ServiceManagerModalProps> = ({
  isOpen,
  onClose,
  productToEdit,
  categories,
  onSave,
}) => {
  const isEditing = !!productToEdit;

  // Item Type: 'product' (পণ্য - অনলাইন/অফলাইন ডেলিভারিযোগ্য) | 'service' (সার্ভিস - প্রতিষ্ঠানে সেবা)
  const [itemType, setItemType] = useState<'product' | 'service'>('service');

  const [titleBn, setTitleBn] = useState('');
  const [titleEn, setTitleEn] = useState('');
  const [category, setCategory] = useState('csa_laser');
  const [price, setPrice] = useState<number | ''>('');
  const [originalPrice, setOriginalPrice] = useState<number | ''>('');
  const [stockCount, setStockCount] = useState<number>(50);
  const [descriptionBn, setDescriptionBn] = useState('');
  const [featuresList, setFeaturesList] = useState<string[]>([]);
  const [newFeatureInput, setNewFeatureInput] = useState('');
  const [images, setImages] = useState<string[]>([]);
  const [imageUrlInput, setImageUrlInput] = useState('');
  const [isFeatured, setIsFeatured] = useState(false);
  const [isBestSeller, setIsBestSeller] = useState(false);
  const [isNewArrival, setIsNewArrival] = useState(false);

  // Image upload and compression tracking
  const [isCompressing, setIsCompressing] = useState(false);
  const [compressionLog, setCompressionLog] = useState<{ original: number; compressed: number } | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [formError, setFormError] = useState('');

  // Populate when editing or reset when adding
  useEffect(() => {
    if (productToEdit) {
      const isProduct = isProductItem(productToEdit);
      setItemType(isProduct ? 'product' : 'service');
      setTitleBn(productToEdit.titleBn || '');
      setTitleEn(productToEdit.title || '');
      setCategory(productToEdit.category || (isProduct ? 'beauty_products' : 'csa_laser'));
      setPrice(productToEdit.price || 0);
      setOriginalPrice(productToEdit.originalPrice || productToEdit.price || 0);
      setStockCount(productToEdit.stockCount ?? 50);
      setDescriptionBn(productToEdit.descriptionBn || productToEdit.description || '');
      setFeaturesList(productToEdit.keyFeaturesBn || []);
      setImages(productToEdit.images || []);
      setIsFeatured(!!productToEdit.isFeatured);
      setIsBestSeller(!!productToEdit.isBestSeller);
      setIsNewArrival(!!productToEdit.isNewArrival);
    } else {
      setItemType('service');
      setTitleBn('');
      setTitleEn('');
      setCategory('csa_laser');
      setPrice('');
      setOriginalPrice('');
      setStockCount(50);
      setDescriptionBn('');
      setFeaturesList([
        'অভিজ্ঞ নারী বিউটিশিয়ান ও স্পেশালিস্ট দ্বারা পরিচালিত',
        'উন্নত জার্মান সিএসএ টেকনোলজি লেজার ইকুইপমেন্ট',
        '১০০% নিরাপদ, ব্যথাহীন ও দীর্ঘস্থায়ী ফলাফল'
      ]);
      setImages([PRESET_BEAUTY_IMAGES[0].url]);
      setIsFeatured(false);
      setIsBestSeller(false);
      setIsNewArrival(true);
    }
    setCompressionLog(null);
    setFormError('');
  }, [productToEdit, isOpen]);

  // When switching itemType in "Add" mode, adapt default category and features
  const handleItemTypeChange = (newType: 'product' | 'service') => {
    setItemType(newType);
    if (!isEditing) {
      if (newType === 'product') {
        setCategory('beauty_products');
        setFeaturesList([
          'শতভাগ অরিজিনাল ও অথেনটিক বিউটি প্রোডাক্ট',
          'অনলাইন ও অফলাইনে সরাসরি ক্রয় সুবিধা',
          'সারাদেশে দ্রুত ক্যাশ অন হোম ডেলিভারি ব্যবস্থা'
        ]);
        setImages([PRESET_PRODUCT_IMAGES[0].url]);
      } else {
        setCategory('csa_laser');
        setFeaturesList([
          'অভিজ্ঞ নারী বিউটিশিয়ান ও স্পেশালিস্ট দ্বারা পরিচালিত',
          'উন্নত জার্মান সিএসএ টেকনোলজি লেজার ইকুইপমেন্ট',
          '১০০% নিরাপদ ও দীর্ঘস্থায়ী ফলাফল'
        ]);
        setImages([PRESET_BEAUTY_IMAGES[0].url]);
      }
    }
  };

  if (!isOpen) return null;

  // Handle Image File Upload with Auto-compression to <= 200KB
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsCompressing(true);
    setFormError('');

    try {
      const newCompressedImages: string[] = [];
      let totalOriginalKb = 0;
      let totalCompressedKb = 0;

      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        if (!file.type.startsWith('image/')) continue;

        const result = await compressImageFile(file, 200 * 1024);
        newCompressedImages.push(result.dataUrl);
        totalOriginalKb += result.originalSizeKb;
        totalCompressedKb += result.sizeKb;
      }

      if (newCompressedImages.length > 0) {
        setImages((prev) => [...prev, ...newCompressedImages]);
        setCompressionLog({
          original: Math.round(totalOriginalKb),
          compressed: Math.round(totalCompressedKb),
        });
      }
    } catch (err: any) {
      console.error('Image compression failed:', err);
      setFormError('ছবি কমপ্রেস করতে সমস্যা হয়েছে। অনুগ্রহ করে আবার চেষ্টা করুন।');
    } finally {
      setIsCompressing(false);
      e.target.value = '';
    }
  };

  // Add Image via Direct URL
  const handleAddImageUrl = () => {
    if (!imageUrlInput.trim()) return;
    setImages((prev) => [...prev, imageUrlInput.trim()]);
    setImageUrlInput('');
  };

  // Quick preset image selector
  const handleSelectPresetImage = (url: string) => {
    if (!images.includes(url)) {
      setImages((prev) => [...prev, url]);
    }
  };

  // Remove image from list
  const handleRemoveImage = (indexToRemove: number) => {
    setImages((prev) => prev.filter((_, idx) => idx !== indexToRemove));
  };

  // Add Key Feature bullet
  const handleAddFeature = () => {
    if (!newFeatureInput.trim()) return;
    setFeaturesList((prev) => [...prev, newFeatureInput.trim()]);
    setNewFeatureInput('');
  };

  // Remove Key Feature bullet
  const handleRemoveFeature = (idx: number) => {
    setFeaturesList((prev) => prev.filter((_, i) => i !== idx));
  };

  // Submit Handler: Saves directly to Firestore via onSave prop
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    if (!titleBn.trim()) {
      setFormError('দয়া করে বাংলা নাম লিখুন।');
      return;
    }
    if (price === '' || Number(price) <= 0) {
      setFormError('দয়া করে সঠিক মূল্য লিখুন।');
      return;
    }
    if (images.length === 0) {
      setFormError('কমপক্ষে একটি ছবি যুক্ত করুন।');
      return;
    }

    setIsSaving(true);

    try {
      const numPrice = Number(price);
      const numOrig = originalPrice !== '' && Number(originalPrice) > numPrice ? Number(originalPrice) : numPrice;
      const discountPercent = numOrig > numPrice ? Math.round(((numOrig - numPrice) / numOrig) * 100) : 0;

      // Find Category Name in Bengali
      let categoryBn = 'পার্লার সার্ভিস';
      if (itemType === 'product') {
        categoryBn = 'প্রসাধন ও স্কিনকেয়ার পণ্য';
      } else {
        const matchedCat = categories.find((c) => c.id === category);
        if (matchedCat) categoryBn = matchedCat.nameBn;
        else if (category === 'csa_laser') categoryBn = 'সিএসএ লেজার ট্রিটমেন্ট';
        else if (category === 'facial_skin') categoryBn = 'ফেসিয়াল ও স্কিন কেয়ার';
        else if (category === 'bridal_makeup') categoryBn = 'ব্রাইডাল মেকআপ ও সাজ';
        else if (category === 'hair_spa') categoryBn = 'হেয়ার রিবন্ডিং ও স্পা';
      }

      const itemId = productToEdit?.id || (itemType === 'product' ? `prod-${Date.now()}` : `srv-${Date.now()}`);

      const finalProduct: Product = {
        id: itemId,
        title: titleEn.trim() || titleBn.trim(),
        titleBn: titleBn.trim(),
        category: itemType === 'product' ? 'beauty_products' : category,
        categoryBn,
        itemType,
        price: numPrice,
        originalPrice: numOrig,
        discountPercent,
        rating: productToEdit?.rating || 4.9,
        reviewCount: productToEdit?.reviewCount || 20,
        stockCount: Number(stockCount) || (itemType === 'product' ? 50 : 30),
        isFeatured,
        isBestSeller,
        isNewArrival,
        images,
        description: descriptionBn.trim() || titleBn.trim(),
        descriptionBn: descriptionBn.trim() || (itemType === 'product'
          ? `${titleBn} তনু বিউটি পার্লারের শতভাগ অথেনটিক স্কিনকেয়ার পণ্য।`
          : `${titleBn} তনু বিউটি পার্লার ও লেজার সেন্টারের জনপ্রিয় প্রিমিয়াম সার্ভিস।`),
        keyFeaturesBn: featuresList.length > 0 ? featuresList : ['উন্নত সেবা', 'শতভাগ সন্তুষ্টি'],
        warrantyBn: itemType === 'product' ? '১০০% অরিজিনাল প্রোডাক্ট গ্যারান্টি' : 'প্রফেশনাল স্পেশালিস্ট কেয়ার',
        deliveryDaysBn: itemType === 'product' ? '২-৩ দিনের মধ্যে হোম ডেলিভারি' : 'ডেলিভারি হবে না - প্রতিষ্ঠানে এসে সেবা নিতে হবে',
        deliveryNoticeBn: itemType === 'product'
          ? 'অনলাইন ও অফলাইনে বিক্রয়যোগ্য। সারাদেশে হোম ডেলিভারি ও ক্যাশ অন ডেলিভারি প্রযোজ্য।'
          : 'প্রোডাক্ট ছাড়া বাকি সার্ভিসগুলো ডেলিভারি হবে না। প্রতিষ্ঠানে এসে সার্ভিস নিতে হবে।',
        specs: productToEdit?.specs || (itemType === 'product' ? {
          'প্রকার': 'বিউটি ও স্কিনকেয়ার প্রোডাক্ট',
          'বিক্রয়': 'অনলাইন ও অফলাইন উভয় মাধ্যমে',
          'হোম ডেলিভারি': 'সারাদেশে ক্যাশ অন ডেলিভারি',
          'শপ লোকেশন': 'নাটিয়াপাড়া বাজার, দেলদুয়ার, টাঙ্গাইল'
        } : {
          'সার্ভিস স্থান': 'তনু বিউটি পার্লার, নাটিয়াপাড়া বাজার, দেলদুয়ার, টাঙ্গাইল',
          'সার্ভিস সময়কাল': '৪০-৬০ মিনিট প্রফেশনাল সেশন',
          'যোগাযোগ': '01302383795'
        }),
      };

      await onSave(finalProduct);
      onClose();
    } catch (err: any) {
      console.error('Failed to save item to Firestore:', err);
      setFormError('ফায়ারবেসে সেভ করতে সমস্যা হয়েছে: ' + (err.message || 'ইন্টারনেট চেক করুন'));
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[92vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden my-auto animate-in fade-in zoom-in-95 duration-200">
        
        {/* Modal Header */}
        <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50/80 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${
              itemType === 'product' ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'
            }`}>
              {itemType === 'product' ? <ShoppingBag className="w-5 h-5" /> : <Sparkles className="w-5 h-5" />}
            </div>
            <div>
              <h3 className="font-extrabold text-slate-900 text-sm sm:text-base">
                {isEditing ? 'সার্ভিস বা পণ্য সম্পাদনা' : 'নতুন সার্ভিস বা পণ্য যোগ করুন'}
              </h3>
              <p className="text-[11px] text-slate-500">
                ফায়ারবেস ক্লাউড ডাটাবেস (Firestore) এ স্বয়ংক্রিয়ভাবে রিয়েল-টাইমে সংরক্ষিত হবে
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-200/80 hover:bg-slate-300 text-slate-700 flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-4 sm:p-6 overflow-y-auto space-y-5 flex-1 text-slate-800">
          
          {formError && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{formError}</span>
            </div>
          )}

          {/* ========================================================================= */}
          {/* SECTION 0: PRIMARY ITEM TYPE SELECTOR (পণ্য বনাম সার্ভিস) */}
          {/* ========================================================================= */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-900 block">
              আইটেমের ধরন নির্বাচন করুন <span className="text-rose-600">*</span>:
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {/* Option 1: Product */}
              <button
                type="button"
                onClick={() => handleItemTypeChange('product')}
                className={`p-3 rounded-2xl border text-left transition-all cursor-pointer flex items-start gap-3 ${
                  itemType === 'product'
                    ? 'bg-emerald-50/90 border-emerald-400 ring-2 ring-emerald-500/20 shadow-xs'
                    : 'bg-white border-slate-200 hover:bg-slate-50 text-slate-600'
                }`}
              >
                <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
                  itemType === 'product' ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-500'
                }`}>
                  <ShoppingBag className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-bold text-xs sm:text-sm text-slate-900 flex items-center justify-between">
                    <span>🛍️ বিউটি ও স্কিনকেয়ার পণ্য</span>
                    {itemType === 'product' && <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />}
                  </div>
                  <p className="text-[11px] text-slate-500 mt-0.5 leading-relaxed">
                    অনলাইন ও অফলাইনে বিক্রয়যোগ্য • সারাদেশে হোম ডেলিভারি প্রযোজ্য
                  </p>
                </div>
              </button>

              {/* Option 2: Service */}
              <button
                type="button"
                onClick={() => handleItemTypeChange('service')}
                className={`p-3 rounded-2xl border text-left transition-all cursor-pointer flex items-start gap-3 ${
                  itemType === 'service'
                    ? 'bg-rose-50/90 border-rose-400 ring-2 ring-rose-500/20 shadow-xs'
                    : 'bg-white border-slate-200 hover:bg-slate-50 text-slate-600'
                }`}
              >
                <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
                  itemType === 'service' ? 'bg-rose-600 text-white' : 'bg-slate-100 text-slate-500'
                }`}>
                  <Building2 className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-bold text-xs sm:text-sm text-slate-900 flex items-center justify-between">
                    <span>💆 পার্লার ও লেজার সার্ভিস</span>
                    {itemType === 'service' && <CheckCircle2 className="w-4 h-4 text-rose-600 shrink-0" />}
                  </div>
                  <p className="text-[11px] text-slate-500 mt-0.5 leading-relaxed">
                    ডেলিভারি হবে না • প্রতিষ্ঠানে এসে সেবা নিতে হবে
                  </p>
                </div>
              </button>
            </div>
          </div>

          {/* Section 1: Basic Info */}
          <div className="space-y-4">
            <h4 className="font-bold text-slate-900 text-xs sm:text-sm flex items-center gap-1.5 pb-1 border-b border-slate-100">
              <Tag className="w-4 h-4 text-rose-600" />
              <span>{itemType === 'product' ? 'পণ্যের মূল বিবরণ' : 'সার্ভিসের মূল বিবরণ'}</span>
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-800">
                  {itemType === 'product' ? 'পণ্যের নাম (বাংলায়)' : 'সার্ভিসের নাম (বাংলায়)'} <span className="text-rose-600">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder={itemType === 'product' ? 'যেমন: ভিটামিন সি গ্লো সিরাম' : 'যেমন: ফুল বডি সিএসএ লেজার ট্রিটমেন্ট'}
                  value={titleBn}
                  onChange={(e) => setTitleBn(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs sm:text-sm outline-none focus:bg-white focus:ring-2 focus:ring-rose-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-800">
                  নাম (ইংরেজিতে / Title)
                </label>
                <input
                  type="text"
                  placeholder={itemType === 'product' ? 'e.g. Vitamin C Face Serum' : 'e.g. Full Body CSA Laser Treatment'}
                  value={titleEn}
                  onChange={(e) => setTitleEn(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs sm:text-sm outline-none focus:bg-white focus:ring-2 focus:ring-rose-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-800">ক্যাটেগরি:</label>
                {itemType === 'product' ? (
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs sm:text-sm outline-none focus:bg-white focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="beauty_products">🛍️ প্রসাধন ও স্কিনকেয়ার পণ্য</option>
                  </select>
                ) : (
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs sm:text-sm outline-none focus:bg-white focus:ring-2 focus:ring-rose-500"
                  >
                    <option value="csa_laser">⚡ সিএসএ লেজার ট্রিটমেন্ট</option>
                    <option value="facial_skin">💆 ফেসিয়াল ও স্কিন কেয়ার</option>
                    <option value="bridal_makeup">💄 ব্রাইডাল মেকআপ ও সাজ</option>
                    <option value="hair_spa">✂️ হেয়ার রিবন্ডিং ও স্পা</option>
                  </select>
                )}
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-800">
                  বিক্রয় মূল্য (৳) <span className="text-rose-600">*</span>
                </label>
                <input
                  type="number"
                  required
                  min={1}
                  placeholder="যেমন: 850"
                  value={price}
                  onChange={(e) => setPrice(e.target.value ? Number(e.target.value) : '')}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs sm:text-sm font-bold text-slate-900 outline-none focus:bg-white focus:ring-2 focus:ring-rose-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-800">
                  পূর্বের মূল্য / ডিসকাউন্ট (৳):
                </label>
                <input
                  type="number"
                  min={0}
                  placeholder="যেমন: 1200 (ঐচ্ছিক)"
                  value={originalPrice}
                  onChange={(e) => setOriginalPrice(e.target.value ? Number(e.target.value) : '')}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs sm:text-sm outline-none focus:bg-white focus:ring-2 focus:ring-rose-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 pt-1">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-800">
                  {itemType === 'product' ? 'স্টকে বিদ্যমান পণ্যের সংখ্যা' : 'দৈনিক অ্যাপয়েন্টমেন্ট ক্যাপাসিটি'}:
                </label>
                <input
                  type="number"
                  min={1}
                  value={stockCount}
                  onChange={(e) => setStockCount(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs sm:text-sm outline-none focus:bg-white focus:ring-2 focus:ring-rose-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-800">
                  ডেলিভারি / সার্ভিস নীতি:
                </label>
                <div className={`px-3 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 ${
                  itemType === 'product' ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-rose-50 text-rose-800 border border-rose-200'
                }`}>
                  {itemType === 'product' ? (
                    <>
                      <Truck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <span>অনলাইন ও অফলাইনে বিক্রয় ও হোম ডেলিভারি</span>
                    </>
                  ) : (
                    <>
                      <Building2 className="w-3.5 h-3.5 text-rose-600 shrink-0" />
                      <span>ডেলিভারি হবে না • প্রতিষ্ঠানে এসে সেবা নিতে হবে</span>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Section 2: Image Upload with Automatic 200KB Compressor */}
          <div className="space-y-3 p-4 bg-slate-50 rounded-2xl border border-slate-200">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
              <div>
                <h4 className="font-bold text-slate-900 text-xs sm:text-sm flex items-center gap-1.5">
                  <ImageIcon className="w-4 h-4 text-rose-600" />
                  <span>ছবি আপলোড ও স্বয়ংক্রিয় ২০০ KB কম্প্রেশন</span>
                </h4>
                <p className="text-[11px] text-slate-500">
                  যেকোনো সাইজের ছবি আপলোড করলে সিস্টেম স্বয়ংক্রিয়ভাবে ২০০ কেবির মধ্যে কমপ্রেস করে ফায়ারবেসে জমা রাখবে।
                </p>
              </div>

              {compressionLog && (
                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-100 text-emerald-800 text-[11px] font-bold shrink-0">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>{compressionLog.original} KB ➔ {compressionLog.compressed} KB (২০০ KB এর নিচে অপ্টিমাইজড)</span>
                </div>
              )}
            </div>

            {/* Upload Area */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              
              {/* File input button */}
              <label className="border-2 border-dashed border-rose-300 hover:border-rose-500 bg-white hover:bg-rose-50/50 rounded-2xl p-4 flex flex-col items-center justify-center text-center cursor-pointer transition-colors space-y-1.5 group">
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="hidden"
                  disabled={isCompressing}
                />
                {isCompressing ? (
                  <div className="flex flex-col items-center gap-1 text-rose-600">
                    <Loader2 className="w-6 h-6 animate-spin" />
                    <span className="text-xs font-bold">ইমেজ ২০০ কেবিতে অপ্টিমাইজ হচ্ছে...</span>
                  </div>
                ) : (
                  <>
                    <div className="w-10 h-10 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                      <Upload className="w-5 h-5" />
                    </div>
                    <span className="text-xs font-bold text-slate-800">কম্পিউটার/মোবাইল থেকে ছবি আপলোড</span>
                    <span className="text-[10px] text-slate-400">JPG, PNG, WebP (অটো কমপ্রেসড ≤ 200KB)</span>
                  </>
                )}
              </label>

              {/* URL input */}
              <div className="bg-white p-3.5 rounded-2xl border border-slate-200 flex flex-col justify-center space-y-2">
                <span className="text-xs font-bold text-slate-700">অথবা সরাসরি ইমেজ লিংক (URL) দিন:</span>
                <div className="flex gap-2">
                  <input
                    type="url"
                    placeholder="https://..."
                    value={imageUrlInput}
                    onChange={(e) => setImageUrlInput(e.target.value)}
                    className="flex-1 px-3 py-1.5 bg-slate-50 border border-slate-300 rounded-xl text-xs outline-none"
                  />
                  <button
                    type="button"
                    onClick={handleAddImageUrl}
                    className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl transition-colors cursor-pointer"
                  >
                    যুক্ত করুন
                  </button>
                </div>
              </div>

            </div>

            {/* Quick preset selector */}
            <div className="pt-2">
              <span className="text-[11px] font-bold text-slate-500 block mb-1.5">
                {itemType === 'product' ? 'দ্রুত ব্যবহারের জন্য কসমেটিক ডেমো ফটো সিলেক্ট করুন:' : 'দ্রুত ব্যবহারের জন্য পার্লার ডেমো ফটো সিলেক্ট করুন:'}
              </span>
              <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                {(itemType === 'product' ? PRESET_PRODUCT_IMAGES : PRESET_BEAUTY_IMAGES).map((preset, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleSelectPresetImage(preset.url)}
                    className="group relative rounded-xl overflow-hidden border border-slate-200 aspect-video hover:ring-2 hover:ring-rose-500 transition-all cursor-pointer"
                    title={preset.title}
                  >
                    <img src={preset.url} alt={preset.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                    <span className="absolute inset-x-0 bottom-0 bg-black/60 text-white text-[9px] font-semibold py-0.5 px-1 truncate text-center">
                      {preset.title}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Active Selected Images Preview */}
            {images.length > 0 && (
              <div className="pt-2 border-t border-slate-200">
                <span className="text-xs font-bold text-slate-800 block mb-2">
                  সংযুক্ত ছবিসমূহ ({images.length} টি):
                </span>
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                  {images.map((imgUrl, idx) => (
                    <div key={idx} className="relative rounded-xl overflow-hidden border border-slate-200 aspect-video group bg-white shadow-2xs">
                      <img src={imgUrl} alt={`Item ${idx}`} className="w-full h-full object-cover" />
                      <div className="absolute top-1 right-1">
                        <button
                          type="button"
                          onClick={() => handleRemoveImage(idx)}
                          className="w-6 h-6 bg-rose-600 hover:bg-rose-700 text-white rounded-full flex items-center justify-center shadow-xs cursor-pointer"
                          title="ছবি মুছুন"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                      {idx === 0 && (
                        <span className="absolute bottom-1 left-1 bg-slate-900/80 text-white text-[9px] font-bold px-1.5 py-0.5 rounded">
                          প্রধান ছবি
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Section 3: Description & Key Features */}
          <div className="space-y-4">
            <h4 className="font-bold text-slate-900 text-xs sm:text-sm flex items-center gap-1.5 pb-1 border-b border-slate-100">
              <FileText className="w-4 h-4 text-rose-600" />
              <span>বিস্তারিত বিবরণ ও সুবিধাসমূহ</span>
            </h4>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-800">
                বিস্তারিত বিবরণ:
              </label>
              <textarea
                rows={3}
                placeholder={itemType === 'product' ? 'পণ্যের গুণাগুণ, ব্যবহারের নিয়ম ও উপকরণ সম্পর্কে লিখুন...' : 'সার্ভিসের উপকারিতা, পদ্ধতি ও স্পেশালিস্ট কেয়ার সম্পর্কে লিখুন...'}
                value={descriptionBn}
                onChange={(e) => setDescriptionBn(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs sm:text-sm outline-none focus:bg-white focus:ring-2 focus:ring-rose-500 resize-none"
              />
            </div>

            {/* Key Features List */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-800">
                বিশেষ সুবিধাসমূহ (Key Features):
              </label>

              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="যেমন: ১০০% অর্গানিক ও ত্বকের জন্য নিরাপদ"
                  value={newFeatureInput}
                  onChange={(e) => setNewFeatureInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddFeature();
                    }
                  }}
                  className="flex-1 px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs outline-none"
                />
                <button
                  type="button"
                  onClick={handleAddFeature}
                  className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl transition-colors cursor-pointer flex items-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>যুক্ত করুন</span>
                </button>
              </div>

              <div className="flex flex-wrap gap-2 pt-1">
                {featuresList.map((feat, idx) => (
                  <span
                    key={idx}
                    className="inline-flex items-center gap-1.5 px-3 py-1 bg-slate-100 border border-slate-200 text-slate-800 rounded-full text-xs font-medium"
                  >
                    <span>{feat}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveFeature(idx)}
                      className="text-slate-400 hover:text-rose-600 cursor-pointer"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
            </div>

            {/* Badges / Highlights */}
            <div className="pt-2 grid grid-cols-3 gap-2 sm:gap-3 bg-slate-50 p-3 rounded-2xl border border-slate-200 text-[11px] sm:text-xs">
              <label className="flex items-center gap-2 font-bold text-slate-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isFeatured}
                  onChange={(e) => setIsFeatured(e.target.checked)}
                  className="w-4 h-4 rounded text-rose-600 focus:ring-rose-500 cursor-pointer"
                />
                <span>স্পেশাল (Featured)</span>
              </label>

              <label className="flex items-center gap-2 font-bold text-slate-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isBestSeller}
                  onChange={(e) => setIsBestSeller(e.target.checked)}
                  className="w-4 h-4 rounded text-rose-600 focus:ring-rose-500 cursor-pointer"
                />
                <span>জনপ্রিয় (Best Seller)</span>
              </label>

              <label className="flex items-center gap-2 font-bold text-slate-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isNewArrival}
                  onChange={(e) => setIsNewArrival(e.target.checked)}
                  className="w-4 h-4 rounded text-rose-600 focus:ring-rose-500 cursor-pointer"
                />
                <span>নতুন (New Arrival)</span>
              </label>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="pt-4 border-t border-slate-200 flex items-center justify-end gap-3 shrink-0">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-100 font-bold text-xs transition-colors cursor-pointer"
            >
              বাতিল
            </button>

            <button
              type="submit"
              disabled={isSaving || isCompressing}
              className={`px-6 py-2.5 text-white font-bold text-xs sm:text-sm rounded-xl flex items-center gap-2 transition-colors cursor-pointer shadow-xs disabled:opacity-50 ${
                itemType === 'product' ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-rose-600 hover:bg-rose-700'
              }`}
            >
              {isSaving ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>ফায়ারবেসে সংরক্ষণ হচ্ছে...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{isEditing ? 'আপডেট ও ফায়ারবেসে সেভ করুন' : 'ফায়ারবেস ডাটাবেসে সেভ করুন'}</span>
                </>
              )}
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
