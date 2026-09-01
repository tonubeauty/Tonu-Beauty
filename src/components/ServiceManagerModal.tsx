import React, { useState, useEffect } from 'react';
import { Product, Category } from '../types';
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
  Layers,
  FileText,
  DollarSign
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
    title: 'ম্যানিকিউর ও নেইল আর্ট',
    url: 'https://images.unsplash.com/photo-1632345031435-8727f6897d53?auto=format&fit=crop&q=80&w=800',
  },
  {
    title: 'বডি স্পা ও ম্যাসাজ',
    url: 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&q=80&w=800',
  }
];

export const ServiceManagerModal: React.FC<ServiceManagerModalProps> = ({
  isOpen,
  onClose,
  productToEdit,
  categories,
  onSave,
}) => {
  const isEditing = !!productToEdit;

  const [titleBn, setTitleBn] = useState('');
  const [titleEn, setTitleEn] = useState('');
  const [category, setCategory] = useState('csa-laser');
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
      setTitleBn(productToEdit.titleBn || '');
      setTitleEn(productToEdit.title || '');
      setCategory(productToEdit.category || 'csa-laser');
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
      setTitleBn('');
      setTitleEn('');
      setCategory('csa-laser');
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
        // Validate image type
        if (!file.type.startsWith('image/')) {
          continue;
        }

        // Compress strictly to <= 200 KB
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
      setFormError('ইমেজ কমপ্রেস করতে সমস্যা হয়েছে: ' + (err.message || 'অনুগ্রহ করে পুনরায় চেষ্টা করুন'));
    } finally {
      setIsCompressing(false);
      // Reset input value so same file can be re-uploaded if desired
      e.target.value = '';
    }
  };

  const handleAddImageUrl = () => {
    if (!imageUrlInput.trim()) return;
    setImages((prev) => [...prev, imageUrlInput.trim()]);
    setImageUrlInput('');
  };

  const handleRemoveImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  const handleAddFeature = () => {
    if (!newFeatureInput.trim()) return;
    setFeaturesList((prev) => [...prev, newFeatureInput.trim()]);
    setNewFeatureInput('');
  };

  const handleRemoveFeature = (index: number) => {
    setFeaturesList((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSelectPresetImage = (url: string) => {
    if (!images.includes(url)) {
      setImages((prev) => [...prev, url]);
    }
  };

  // Form Submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!titleBn.trim()) {
      setFormError('অনুগ্রহ করে সার্ভিসের বাংলা নাম লিখুন');
      return;
    }
    if (price === '' || Number(price) <= 0) {
      setFormError('অনুগ্রহ করে সঠিক মূল্য লিখুন');
      return;
    }
    if (images.length === 0) {
      setFormError('অনুগ্রহ করে অন্তত ১টি ছবি আপলোড বা যুক্ত করুন');
      return;
    }

    setIsSaving(true);
    setFormError('');

    try {
      const numPrice = Number(price);
      const numOrig = originalPrice !== '' && Number(originalPrice) > numPrice ? Number(originalPrice) : numPrice;
      const discountPercent = numOrig > numPrice ? Math.round(((numOrig - numPrice) / numOrig) * 100) : 0;

      // Find Category Name in Bengali
      const matchedCat = categories.find((c) => c.id === category);
      const categoryBn = matchedCat ? matchedCat.nameBn : 'পার্লার সার্ভিস';

      const serviceId = productToEdit?.id || `srv-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

      const finalProduct: Product = {
        id: serviceId,
        title: titleEn.trim() || titleBn.trim(),
        titleBn: titleBn.trim(),
        category,
        categoryBn,
        price: numPrice,
        originalPrice: numOrig,
        discountPercent,
        rating: productToEdit?.rating || 5,
        reviewCount: productToEdit?.reviewCount || 12,
        stockCount: Number(stockCount) || 50,
        isFeatured,
        isBestSeller,
        isNewArrival,
        images,
        description: descriptionBn.trim() || titleBn.trim(),
        descriptionBn: descriptionBn.trim() || `${titleBn} তনু বিউটি পার্লার ও লেজার সেন্টারের অন্যতম জনপ্রিয় প্রিমিয়াম সার্ভিস।`,
        keyFeaturesBn: featuresList.length > 0 ? featuresList : ['উন্নত সেবা', 'অভিজ্ঞ স্পেশালিস্ট'],
        specs: productToEdit?.specs || {
          'সার্ভিস সময়কাল': '৪৫-৬০ মিনিট',
          'শাখা': 'নাটিয়াপাড়া, দেলদুয়ার, টাঙ্গাইল',
        },
      };

      await onSave(finalProduct);
      onClose();
    } catch (err: any) {
      console.error('Failed to save service:', err);
      setFormError('সার্ভিস সেভ করতে সমস্যা হয়েছে: ' + (err.message || 'ফায়ারবেস চেক করুন'));
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 overflow-y-auto">
      <div className="bg-white rounded-3xl w-full max-w-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh] animate-in fade-in zoom-in-95 duration-200">
        
        {/* Modal Header */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-rose-600 flex items-center justify-center text-white">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-sm sm:text-base text-white">
                {isEditing ? 'সার্ভিস / প্যাকেজ সম্পাদনা (Edit)' : 'নতুন পার্লার সার্ভিস বা প্যাকেজ যোগ করুন'}
              </h3>
              <p className="text-[11px] text-slate-300">
                ফায়ারবেস ক্লাউড স্টোরেজ ও অটোমেটিক ২০০ KB ইমেজ অপ্টিমাইজার
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body / Form */}
        <form onSubmit={handleSubmit} className="p-5 sm:p-6 overflow-y-auto space-y-6 flex-1 text-xs sm:text-sm">
          
          {formError && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{formError}</span>
            </div>
          )}

          {/* Section 1: Basic Info */}
          <div className="space-y-4">
            <h4 className="font-bold text-slate-900 text-xs sm:text-sm flex items-center gap-1.5 pb-1 border-b border-slate-100">
              <Tag className="w-4 h-4 text-rose-600" />
              <span>সার্ভিসের মূল তথ্য</span>
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-800">
                  সার্ভিসের নাম (বাংলায়) <span className="text-rose-600">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="যেমন: ফুল বডি সিএসএ লেজার ট্রিটমেন্ট"
                  value={titleBn}
                  onChange={(e) => setTitleBn(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs sm:text-sm outline-none focus:bg-white focus:ring-2 focus:ring-rose-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-800">
                  সার্ভিসের নাম (ইংরেজিতে / Title)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Full Body CSA Laser Treatment"
                  value={titleEn}
                  onChange={(e) => setTitleEn(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs sm:text-sm outline-none focus:bg-white focus:ring-2 focus:ring-rose-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-800">ক্যাটেগরি নির্বাচন করুন:</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs sm:text-sm outline-none focus:bg-white focus:ring-2 focus:ring-rose-500"
                >
                  <option value="csa-laser">সিএসএ লেজার ট্রিটমেন্ট</option>
                  <option value="bridal-makeup">ব্রাইডাল মেকআপ ও সাজ</option>
                  <option value="facial-skin">ফেসিয়াল ও স্কিন কেয়ার</option>
                  <option value="hair-care">হেয়ার রিবন্ডিং ও কেয়ার</option>
                  <option value="pedicure-manicure">পেডিকিউর ও ম্যানিকিউর</option>
                  <option value="combo-packages">কম্বো প্যাকেজ ও অফার</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-800">
                  রেগুলার মূল্য (৳) <span className="text-rose-600">*</span>
                </label>
                <input
                  type="number"
                  required
                  min={1}
                  placeholder="যেমন: 2500"
                  value={price}
                  onChange={(e) => setPrice(e.target.value ? Number(e.target.value) : '')}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs sm:text-sm font-bold text-slate-900 outline-none focus:bg-white focus:ring-2 focus:ring-rose-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-800">
                  আগের মূল্য / ডিসকাউন্ট (৳):
                </label>
                <input
                  type="number"
                  min={0}
                  placeholder="যেমন: 3000 (ঐচ্ছিক)"
                  value={originalPrice}
                  onChange={(e) => setOriginalPrice(e.target.value ? Number(e.target.value) : '')}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs sm:text-sm outline-none focus:bg-white focus:ring-2 focus:ring-rose-500"
                />
              </div>
            </div>
          </div>

          {/* Section 2: Image Upload with Automatic 200KB Compressor */}
          <div className="space-y-3 p-4 bg-slate-50 rounded-2xl border border-slate-200">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
              <div>
                <h4 className="font-bold text-slate-900 text-xs sm:text-sm flex items-center gap-1.5">
                  <ImageIcon className="w-4 h-4 text-rose-600" />
                  <span>সার্ভিস / প্যাকেজের ছবি ও অটো ২০০ KB কম্প্রেশন</span>
                </h4>
                <p className="text-[11px] text-slate-500">
                  যেকোনো সাইজের ছবি আপলোড করলে সিস্টেম স্বয়ংক্রিয়ভাবে ২০০ কেবির মধ্যে অপ্টিমাইজ করে ফায়ারবেসে জমা রাখবে।
                </p>
              </div>

              {compressionLog && (
                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-100 text-emerald-800 text-[11px] font-bold shrink-0">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>{compressionLog.original} KB ➔ {compressionLog.compressed} KB (২০০ KB এর নিচে কনভার্ট)</span>
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
                    <span className="text-xs font-bold">ইমেজ ২০০ কেবিতে কমপ্রেস হচ্ছে...</span>
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
                দ্রুত ব্যবহারের জন্য পার্লার ডেমো ফটো সিলেক্ট করুন:
              </span>
              <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                {PRESET_BEAUTY_IMAGES.map((preset, idx) => (
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
                      <img src={imgUrl} alt={`Service ${idx}`} className="w-full h-full object-cover" />
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
              <span>সার্ভিসের বিস্তারিত বিবরণ ও সুবিধাসমূহ</span>
            </h4>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-800">
                সার্ভিস বা প্যাকেজের বিস্তারিত বিবরণ:
              </label>
              <textarea
                rows={3}
                placeholder="সার্ভিসের উপকারিতা, পদ্ধতি ও যত্ন সম্পর্কে লিখুন..."
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
                  placeholder="যেমন: ১ সেশনেই পরিবর্তন দৃশ্যমান"
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
            <div className="pt-2 grid grid-cols-3 gap-3 bg-slate-50 p-3 rounded-2xl border border-slate-200 text-xs">
              <label className="flex items-center gap-2 font-bold text-slate-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isFeatured}
                  onChange={(e) => setIsFeatured(e.target.checked)}
                  className="w-4 h-4 rounded text-rose-600 focus:ring-rose-500 cursor-pointer"
                />
                <span>স্পেশাল প্যাকেজ (Featured)</span>
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
                <span>নতুন অফার (New Offer)</span>
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
              className="px-6 py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs sm:text-sm rounded-xl flex items-center gap-2 transition-colors cursor-pointer shadow-xs disabled:opacity-50"
            >
              {isSaving ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>ফায়ারবেসে সংরক্ষণ হচ্ছে...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{isEditing ? 'সার্ভিস আপডেট ও ফায়ারবেসে সেভ' : 'নতুন সার্ভিস ফায়ারবেসে সেভ করুন'}</span>
                </>
              )}
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
