import React, { useState, useEffect } from 'react';
import { Product, Order, Category } from '../types';
import {
  getOrdersFromFirestore,
  subscribeToOrders,
  updateOrderStatusInFirestore,
  deleteOrderFromFirestore,
  saveProductsToFirestore
} from '../lib/firebase';
import { compressImageFileToMaxKB } from '../lib/imageCompressor';
import {
  LayoutDashboard,
  PackageCheck,
  Sparkles,
  Plus,
  Edit,
  Trash2,
  Phone,
  MapPin,
  Search,
  Filter,
  Lock,
  LogOut,
  Save,
  DollarSign,
  TrendingUp,
  Calendar,
  Eye,
  RefreshCw,
  Tag,
  ShieldCheck,
  AlertTriangle,
  ArrowLeft,
  Clock,
  User,
  ExternalLink,
  Sliders,
  CheckCircle2,
  X,
  Building2,
  ChevronRight,
  BarChart3,
  Upload,
  Loader2,
  Boxes
} from 'lucide-react';

interface AdminDashboardProps {
  products: Product[];
  onUpdateProducts: (products: Product[]) => void;
  categories: Category[];
  onToast: (msg: string) => void;
  onBackToWebsite: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  products,
  onUpdateProducts,
  categories,
  onToast,
  onBackToWebsite,
}) => {
  // Authentication State
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return localStorage.getItem('tanu_admin_auth') === 'true';
  });
  const [passwordInput, setPasswordInput] = useState('');
  const [loginError, setLoginError] = useState('');

  // Active Tab: 'overview' | 'orders' | 'services' | 'add_edit_service' | 'settings'
  const [activeTab, setActiveTab] = useState<'overview' | 'orders' | 'services' | 'add_edit_service' | 'settings'>('overview');

  // Orders State
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoadingOrders, setIsLoadingOrders] = useState(false);
  const [orderSearchQuery, setOrderSearchQuery] = useState('');
  const [orderStatusFilter, setOrderStatusFilter] = useState<string>('all');
  const [selectedOrderDetails, setSelectedOrderDetails] = useState<Order | null>(null);

  // Service Edit Form State
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [formData, setFormData] = useState<{
    id: string;
    title: string;
    titleBn: string;
    category: string;
    categoryBn: string;
    price: number;
    originalPrice: number;
    description: string;
    descriptionBn: string;
    keyFeaturesBn: string;
    imageUrl: string;
    stockCount: number;
    isFeatured: boolean;
    isBestSeller: boolean;
  }>({
    id: '',
    title: '',
    titleBn: '',
    category: 'csa_laser',
    categoryBn: 'CSA লেজার ট্রিটমেন্ট',
    price: 0,
    originalPrice: 0,
    description: '',
    descriptionBn: '',
    keyFeaturesBn: '',
    imageUrl: 'https://images.unsplash.com/photo-1560750588-73207b1ef5b8?auto=format&fit=crop&w=800&q=80',
    stockCount: 50,
    isFeatured: false,
    isBestSeller: false,
  });

  // Image Upload Compression & Restock Modal States
  const [isCompressingImage, setIsCompressingImage] = useState(false);
  const [imageKbSize, setImageKbSize] = useState<number | null>(null);

  // Quick Restock Popup State
  const [restockProduct, setRestockProduct] = useState<Product | null>(null);
  const [addStockQty, setAddStockQty] = useState<number>(10);

  // Parlour Settings State
  const [parlourInfo, setParlourInfo] = useState(() => {
    try {
      const saved = localStorage.getItem('tanu_parlour_info');
      return saved
        ? JSON.parse(saved)
        : {
            branchName: 'তনু বিউটি পার্লার এন্ড লেজার সেন্টার (CSA শাখা)',
            hotline: '01302383795',
            address: 'ডুবাইল, সেহড়াতৈল রোড, নাটিয়াপাড়া বাজার, দেলদুয়ার, টাঙ্গাইল',
            hours: 'সকাল ১০:০০ টা - রাত ৮:০০ টা (প্রতিদিন খোলা)',
            notice: 'বিশেষ ছাড় চলছে! আধুনিক CSA লেজার প্রযুক্তিতে স্থায়ী হেয়ার রিমুভাল ও স্কিন কেয়ার।',
          };
    } catch {
      return {
        branchName: 'তনু বিউটি পার্লার এন্ড লেজার সেন্টার (CSA শাখা)',
        hotline: '01302383795',
        address: 'ডুবাইল, সেহড়াতৈল রোড, নাটিয়াপাড়া বাজার, দেলদুয়ার, টাঙ্গাইল',
        hours: 'সকাল ১০:০০ টা - রাত ৮:০০ টা (প্রতিদিন খোলা)',
        notice: 'বিশেষ ছাড় চলছে! আধুনিক CSA লেজার প্রযুক্তিতে স্থায়ী হেয়ার রিমুভাল ও স্কিন কেয়ার।',
      };
    }
  });

  // Fetch orders from Firestore, server API, or local storage
  const fetchOrders = async () => {
    setIsLoadingOrders(true);
    try {
      // 1. Try fetching from Firestore first
      const fsOrders = await getOrdersFromFirestore();
      if (fsOrders && fsOrders.length > 0) {
        setOrders(fsOrders);
        setIsLoadingOrders(false);
        return;
      }

      // 2. Fallback to server API
      const res = await fetch('/api/orders/track?query=BD');
      if (res.ok) {
        const data = await res.json();
        if (data.success && data.orders && data.orders.length > 0) {
          setOrders(data.orders);
        } else {
          loadOrdersFromLocal();
        }
      } else {
        loadOrdersFromLocal();
      }
    } catch {
      loadOrdersFromLocal();
    } finally {
      setIsLoadingOrders(false);
    }
  };

  const loadOrdersFromLocal = () => {
    const localSaved = localStorage.getItem('tanu_orders');
    if (localSaved) {
      try {
        setOrders(JSON.parse(localSaved));
      } catch {
        setOrders([]);
      }
    } else {
      setOrders([]);
    }
  };

  // Real-time Firestore order subscription when authenticated
  useEffect(() => {
    if (isAuthenticated) {
      fetchOrders();
      const unsubscribe = subscribeToOrders((updatedOrders) => {
        if (updatedOrders && updatedOrders.length > 0) {
          setOrders(updatedOrders);
        }
      });
      return () => unsubscribe();
    }
  }, [isAuthenticated]);

  // Helper to resolve product thumbnail image
  const getItemImageUrl = (item: Order['items'][0]) => {
    if (item.image && typeof item.image === 'string' && item.image.trim().length > 0) {
      return item.image;
    }
    const matchById = products.find((p) => p.id === item.productId);
    if (matchById && matchById.images && matchById.images[0]) {
      return matchById.images[0];
    }
    const matchByTitle = products.find(
      (p) => p.titleBn === item.productTitle || p.title === item.productTitle
    );
    if (matchByTitle && matchByTitle.images && matchByTitle.images[0]) {
      return matchByTitle.images[0];
    }
    return 'https://images.unsplash.com/photo-1560750588-73207b1ef5b8?auto=format&fit=crop&w=300&q=80';
  };

  // Handle Login
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordInput === '1234' || passwordInput === 'admin123' || passwordInput === 'tanubeauty') {
      setIsAuthenticated(true);
      localStorage.setItem('tanu_admin_auth', 'true');
      setLoginError('');
      onToast('এডমিন লগইন সফল হয়েছে!');
    } else {
      setLoginError('ভুল পাসওয়ার্ড! অনুগ্রহ করে সঠিক পাসওয়ার্ড দিন। (যেমন: 1234)');
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    localStorage.removeItem('tanu_admin_auth');
    onToast('এডমিন প্যানেল থেকে লগআউট করা হয়েছে');
  };

  // Status Change for Order (Auto-deduct stock on Delivery)
  const handleStatusChange = async (orderId: string, newStatus: Order['status']) => {
    const targetOrder = orders.find((o) => o.orderId === orderId);
    
    // Deduct product stock automatically if order is delivered
    if (newStatus === 'delivered' && targetOrder && targetOrder.status !== 'delivered') {
      const updatedProducts = products.map((prod) => {
        const itemInOrder = targetOrder.items.find((i) => i.productId === prod.id || i.productTitle === prod.titleBn);
        if (itemInOrder) {
          const newQty = Math.max(0, (prod.stockCount || 0) - itemInOrder.quantity);
          return { ...prod, stockCount: newQty };
        }
        return prod;
      });

      onUpdateProducts(updatedProducts);
      saveProductsToFirestore(updatedProducts);
      onToast(`অর্ডার #${orderId} 'ডেলিভার্ড' হওয়ায় প্রোডাক্ট স্টক থেকে স্বয়ংক্রিয়ভাবে হ্রাস পেয়েছে!`);
    }

    const updated = orders.map((ord) => {
      if (ord.orderId === orderId) {
        return { ...ord, status: newStatus };
      }
      return ord;
    });

    setOrders(updated);
    localStorage.setItem('tanu_orders', JSON.stringify(updated));
    await updateOrderStatusInFirestore(orderId, newStatus);
    onToast(`অর্ডার #${orderId} এর স্ট্যাটাস '${newStatus}' ফায়ারবেসে সংরক্ষিত হয়েছে`);
  };

  // Image Upload and Auto-compression to <= 100KB
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsCompressingImage(true);
    try {
      const compressedDataUrl = await compressImageFileToMaxKB(file, 100);
      const base64Str = compressedDataUrl.split(',')[1] || '';
      const approxKB = Math.round((base64Str.length * 3) / 4 / 1024);
      setImageKbSize(approxKB);
      setFormData((prev) => ({ ...prev, imageUrl: compressedDataUrl }));
      onToast(`ছবি সফলভাবে কমপ্রেস করা হয়েছে (${approxKB} KB - ১০০KB এর নিচে)`);
    } catch (err) {
      console.error('Image compression error:', err);
      alert('ছবি প্রসেস করতে সমস্যা হয়েছে।');
    } finally {
      setIsCompressingImage(false);
    }
  };

  // Quick Restock Handler
  const handleApplyRestock = (e: React.FormEvent) => {
    e.preventDefault();
    if (!restockProduct) return;

    const added = Number(addStockQty) || 0;
    if (added <= 0) {
      alert('অনুগ্রহ করে সঠিক স্টক পরিমাণ প্রবেশ করান।');
      return;
    }

    const updatedList = products.map((p) => {
      if (p.id === restockProduct.id) {
        const newStock = (p.stockCount || 0) + added;
        return { ...p, stockCount: newStock };
      }
      return p;
    });

    onUpdateProducts(updatedList);
    saveProductsToFirestore(updatedList);
    onToast(`'${restockProduct.titleBn}' পণ্যে +${added} টি নতুন স্টক যুক্ত হয়েছে! (মোট: ${(restockProduct.stockCount || 0) + added} টি)`);
    setRestockProduct(null);
  };

  // Delete Order
  const handleDeleteOrder = async (orderId: string) => {
    if (window.confirm(`আপনি কি নিশ্চিত অর্ডার #${orderId} টি মুছে ফেলতে চান?`)) {
      const updated = orders.filter((o) => o.orderId !== orderId);
      setOrders(updated);
      localStorage.setItem('tanu_orders', JSON.stringify(updated));
      await deleteOrderFromFirestore(orderId);
      onToast(`অর্ডার #${orderId} মুছে ফেলা হয়েছে`);
      if (selectedOrderDetails?.orderId === orderId) {
        setSelectedOrderDetails(null);
      }
    }
  };

  // Form Start Actions
  const startAddProduct = () => {
    setEditingProduct(null);
    setFormData({
      id: 'srv-' + Date.now(),
      title: '',
      titleBn: '',
      category: 'csa_laser',
      categoryBn: 'CSA লেজার ট্রিটমেন্ট',
      price: 1000,
      originalPrice: 2000,
      description: '',
      descriptionBn: '',
      keyFeaturesBn: '১০০% ব্যথামুক্ত বিশ্বমানের CSA লেজার\nঅভিজ্ঞ নারী বিশেষজ্ঞ টিম\nসম্পূর্ণ হাইজিনিক স্যানিটাইজড পরিবেশ',
      imageUrl: 'https://images.unsplash.com/photo-1560750588-73207b1ef5b8?auto=format&fit=crop&w=800&q=80',
      stockCount: 50,
      isFeatured: true,
      isBestSeller: false,
    });
    setActiveTab('add_edit_service');
  };

  const startEditProduct = (prod: Product) => {
    setEditingProduct(prod);
    setFormData({
      id: prod.id,
      title: prod.title,
      titleBn: prod.titleBn,
      category: prod.category,
      categoryBn: prod.categoryBn,
      price: prod.price,
      originalPrice: prod.originalPrice,
      description: prod.description,
      descriptionBn: prod.descriptionBn,
      keyFeaturesBn: prod.keyFeaturesBn ? prod.keyFeaturesBn.join('\n') : '',
      imageUrl: prod.images[0] || '',
      stockCount: prod.stockCount || 50,
      isFeatured: !!prod.isFeatured,
      isBestSeller: !!prod.isBestSeller,
    });
    setActiveTab('add_edit_service');
  };

  const handleDeleteProduct = (productId: string, titleBn: string) => {
    if (window.confirm(`আপনি কি নিশ্চিত '${titleBn}' সার্ভিসটি ডিলিট করতে চান?`)) {
      const updated = products.filter((p) => p.id !== productId);
      onUpdateProducts(updated);
      onToast(`'${titleBn}' মুছে ফেলা হয়েছে!`);
    }
  };

  // Save Service / Product
  const handleSaveProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.titleBn.trim() || formData.price <= 0) {
      alert('অনুগ্রহ করে সেবার নাম ও সঠিক অফার মূল্য প্রদান করুন।');
      return;
    }

    const discount =
      formData.originalPrice > formData.price
        ? Math.round(((formData.originalPrice - formData.price) / formData.originalPrice) * 100)
        : 0;

    const featureArray = formData.keyFeaturesBn
      .split('\n')
      .map((s) => s.trim())
      .filter((s) => s.length > 0);

    const categoryObj = categories.find((c) => c.id === formData.category);
    const categoryBn = categoryObj ? categoryObj.nameBn : formData.categoryBn;

    const newOrUpdatedProd: Product = {
      id: formData.id || 'srv-' + Date.now(),
      title: formData.title || formData.titleBn,
      titleBn: formData.titleBn,
      category: formData.category,
      categoryBn,
      price: Number(formData.price),
      originalPrice: Number(formData.originalPrice) || Number(formData.price),
      discountPercent: discount,
      rating: editingProduct ? editingProduct.rating : 4.95,
      reviewCount: editingProduct ? editingProduct.reviewCount : 50,
      stockCount: Number(formData.stockCount) || 50,
      isFeatured: formData.isFeatured,
      isBestSeller: formData.isBestSeller,
      images: [
        formData.imageUrl ||
          'https://images.unsplash.com/photo-1560750588-73207b1ef5b8?auto=format&fit=crop&w=800&q=80',
      ],
      description: formData.description || formData.descriptionBn,
      descriptionBn: formData.descriptionBn,
      keyFeaturesBn: featureArray,
      specs: {
        'পার্লারের নাম': 'তনু বিউটি পার্লার এন্ড লেজার সেন্টার',
        'শাখা': 'CSA লেজারের একটি শাখা',
        'ঠিকানা': parlourInfo.address,
        'হটলাইন': parlourInfo.hotline,
      },
      warrantyBn: '১০০% নিরাপদ ও স্যানিটাইজড সার্ভিস',
      deliveryDaysBn: 'অনলাইন বুকিং ও সরাসরি ভিজিট',
    };

    let updatedList: Product[];
    if (editingProduct) {
      updatedList = products.map((p) => (p.id === editingProduct.id ? newOrUpdatedProd : p));
      onToast(`'${formData.titleBn}' সার্ভিস আপডেট করা হয়েছে!`);
    } else {
      updatedList = [newOrUpdatedProd, ...products];
      onToast(`নতুন সার্ভিস '${formData.titleBn}' সফলভাবে যুক্ত হয়েছে!`);
    }

    onUpdateProducts(updatedList);
    saveProductsToFirestore(updatedList);
    setActiveTab('services');
  };

  // Save Parlour Settings
  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    localStorage.setItem('tanu_parlour_info', JSON.stringify(parlourInfo));
    onToast('পার্লারের তথ্য সফলভাবে সংরক্ষণ করা হয়েছে!');
  };

  // Filtered Orders
  const filteredOrders = orders.filter((ord) => {
    const matchesSearch =
      ord.orderId.toLowerCase().includes(orderSearchQuery.toLowerCase()) ||
      ord.customerName.toLowerCase().includes(orderSearchQuery.toLowerCase()) ||
      ord.phone.includes(orderSearchQuery);

    const matchesStatus = orderStatusFilter === 'all' || ord.status === orderStatusFilter;

    return matchesSearch && matchesStatus;
  });

  // Calculate Metrics
  const totalRevenue = orders.reduce((sum, o) => sum + (o.totalAmount || 0), 0);
  const pendingOrdersCount = orders.filter((o) => o.status === 'pending').length;
  const completedOrdersCount = orders.filter((o) => o.status === 'delivered').length;

  // Render Login Page if Unauthenticated
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-4 font-['Anek_Bangla','Plus_Jakarta_Sans',sans-serif]">
        <div className="max-w-md w-full bg-slate-900 border border-slate-800 rounded-3xl p-8 shadow-2xl space-y-6">
          <div className="text-center space-y-2">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-rose-600 to-pink-600 flex items-center justify-center text-white mx-auto shadow-lg shadow-rose-900/30">
              <Sparkles className="w-8 h-8 text-amber-300" />
            </div>
            <h2 className="text-2xl font-extrabold text-white tracking-tight">
              তনু বিউটি পার্লার - এডমিন লগইন
            </h2>
            <p className="text-xs text-slate-400">
              ড্যাশবোর্ড ও অর্ডার অ্যাডমিনিস্ট্রেশনে প্রবেশ করতে সিকিউরিটি পিন/পাসওয়ার্ড প্রদান করুন
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            {loginError && (
              <div className="p-3 rounded-xl bg-red-950/60 border border-red-800/80 text-red-200 text-xs font-semibold flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0 text-red-400" />
                <span>{loginError}</span>
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5">
                এডমিন পাসওয়ার্ড
              </label>
              <input
                type="password"
                required
                placeholder="পাসওয়ার্ড লিখুন (ডিফল্ট: 1234)"
                value={passwordInput}
                onChange={(e) => setPasswordInput(e.target.value)}
                className="w-full px-4 py-3 rounded-2xl bg-slate-950 border border-slate-800 text-white text-sm font-bold text-center focus:outline-none focus:ring-2 focus:ring-rose-500 transition-all placeholder:text-slate-600"
              />
            </div>

            <button
              type="submit"
              className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-500 hover:to-pink-500 text-white font-extrabold text-sm shadow-xl transition-all cursor-pointer"
            >
              ড্যাশবোর্ডে প্রবেশ করুন
            </button>
          </form>

          <div className="pt-4 border-t border-slate-800 flex items-center justify-between text-xs text-slate-500">
            <button
              onClick={onBackToWebsite}
              className="text-rose-400 hover:text-rose-300 font-bold flex items-center gap-1 cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>ওয়েবসাইটে ফিরে যান</span>
            </button>
            <span className="text-[11px] font-mono">PIN: 1234</span>
          </div>
        </div>
      </div>
    );
  }

  // Render Full Page Professional Admin Dashboard
  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col font-['Anek_Bangla','Plus_Jakarta_Sans',sans-serif]">
      
      {/* Top Navigation Bar */}
      <header className="bg-slate-950 border-b border-slate-800 sticky top-0 z-40 px-4 sm:px-6 py-3 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-rose-600 to-pink-600 flex items-center justify-center text-white font-black text-lg shadow-md">
            তনু
          </div>
          <div>
            <h1 className="text-sm sm:text-base font-extrabold text-white flex items-center gap-2 leading-tight">
              <span>তনু বিউটি পার্লার এন্ড লেজার সেন্টার</span>
              <span className="text-[10px] bg-rose-500/20 text-rose-300 border border-rose-500/30 px-2 py-0.5 rounded-md font-bold">
                CSA শাখা
              </span>
            </h1>
            <p className="text-[11px] text-slate-400 hidden sm:block">
              অ্যাডমিন ম্যানেজমেন্ট কন্ট্রোল ড্যাশবোর্ড (টাঙ্গাইল, দেলদুয়ার)
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={onBackToWebsite}
            className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-slate-200 hover:text-white font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer border border-white/10"
          >
            <ExternalLink className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden sm:inline">মূল ওয়েবসাইটে ফিরে যান</span>
            <span className="sm:hidden">ওয়েবসাইট</span>
          </button>

          <button
            onClick={handleLogout}
            className="p-2 sm:px-3 sm:py-1.5 rounded-xl bg-red-950/50 hover:bg-red-900/60 text-red-300 font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer border border-red-800/40"
            title="লগআউট করুন"
          >
            <LogOut className="w-4 h-4" />
            <span className="hidden sm:inline">লগআউট</span>
          </button>
        </div>
      </header>

      {/* Main Dashboard Layout (Sidebar + Content) */}
      <div className="flex-1 flex flex-col md:flex-row">
        
        {/* Left Sidebar Navigation */}
        <aside className="w-full md:w-64 bg-slate-950/60 border-b md:border-b-0 md:border-r border-slate-800 shrink-0 p-3 sm:p-4 space-y-2">
          <div className="text-[11px] font-bold uppercase tracking-wider text-slate-500 px-3 py-1 hidden md:block">
            মেনু নেভিগেশন
          </div>

          <nav className="flex md:flex-col gap-1 overflow-x-auto md:overflow-visible pb-1 md:pb-0 no-scrollbar">
            <button
              onClick={() => setActiveTab('overview')}
              className={`w-full px-3.5 py-2.5 rounded-2xl text-xs font-bold transition-all flex items-center gap-2.5 cursor-pointer shrink-0 ${
                activeTab === 'overview'
                  ? 'bg-gradient-to-r from-rose-600 to-pink-600 text-white shadow-lg'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              <LayoutDashboard className="w-4 h-4" />
              <span>ড্যাশবোর্ড ওভারভিউ</span>
            </button>

            <button
              onClick={() => setActiveTab('orders')}
              className={`w-full px-3.5 py-2.5 rounded-2xl text-xs font-bold transition-all flex items-center justify-between cursor-pointer shrink-0 ${
                activeTab === 'orders'
                  ? 'bg-gradient-to-r from-rose-600 to-pink-600 text-white shadow-lg'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <PackageCheck className="w-4 h-4" />
                <span>অর্ডার ও বুকিং তালিকা</span>
              </div>
              {orders.length > 0 && (
                <span className="px-2 py-0.5 rounded-full text-[10px] bg-slate-800 text-rose-300 font-extrabold border border-rose-500/30">
                  {orders.length}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab('services')}
              className={`w-full px-3.5 py-2.5 rounded-2xl text-xs font-bold transition-all flex items-center justify-between cursor-pointer shrink-0 ${
                activeTab === 'services'
                  ? 'bg-gradient-to-r from-rose-600 to-pink-600 text-white shadow-lg'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Tag className="w-4 h-4" />
                <span>সার্ভিস ক্যাটালগ</span>
              </div>
              <span className="px-2 py-0.5 rounded-full text-[10px] bg-slate-800 text-slate-300 font-extrabold border border-slate-700">
                {products.length}
              </span>
            </button>

            <button
              onClick={startAddProduct}
              className={`w-full px-3.5 py-2.5 rounded-2xl text-xs font-bold transition-all flex items-center gap-2.5 cursor-pointer shrink-0 ${
                activeTab === 'add_edit_service'
                  ? 'bg-gradient-to-r from-rose-600 to-pink-600 text-white shadow-lg'
                  : 'text-emerald-400 hover:text-emerald-300 hover:bg-emerald-950/30'
              }`}
            >
              <Plus className="w-4 h-4" />
              <span>নতুন সার্ভিস যোগ করুন</span>
            </button>

            <button
              onClick={() => setActiveTab('settings')}
              className={`w-full px-3.5 py-2.5 rounded-2xl text-xs font-bold transition-all flex items-center gap-2.5 cursor-pointer shrink-0 ${
                activeTab === 'settings'
                  ? 'bg-gradient-to-r from-rose-600 to-pink-600 text-white shadow-lg'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              <Sliders className="w-4 h-4" />
              <span>পার্লার তথ্য ও হটলাইন</span>
            </button>
          </nav>

          <div className="hidden md:block pt-6 border-t border-slate-800/80 p-3 space-y-2 text-[11px] text-slate-400">
            <div className="flex items-center gap-2 text-rose-300 font-bold">
              <Building2 className="w-4 h-4" />
              <span>{parlourInfo.branchName}</span>
            </div>
            <p className="line-clamp-2 text-[10px] text-slate-500">
              {parlourInfo.address}
            </p>
          </div>
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 space-y-6 overflow-y-auto">
          
          {/* TAB 1: OVERVIEW */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              
              {/* Welcome Card */}
              <div className="bg-gradient-to-r from-rose-950/80 via-slate-900 to-indigo-950 border border-rose-900/40 rounded-3xl p-6 sm:p-8 relative overflow-hidden shadow-xl">
                <div className="relative z-10 space-y-2 max-w-2xl">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30 text-xs font-bold">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>এডমিন কন্ট্রোল সেন্টার</span>
                  </div>
                  <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                    স্বাগতম, তনু বিউটি পার্লার এডমিন ড্যাশবোর্ডে!
                  </h2>
                  <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                    এখানে আপনি সহজেই অনলাইনে আসা গ্রাহকদের বিউটি পার্লার ও লেজার অ্যাপয়েন্টমেন্ট প্রসেস করতে পারবেন, নতুন প্রোডাক্ট বা লেজার সার্ভিস যোগ করতে পারবেন এবং হটলাইন তথ্য পরিবর্তন করতে পারবেন।
                  </p>

                  <div className="pt-2 flex flex-wrap gap-3">
                    <button
                      onClick={() => setActiveTab('orders')}
                      className="px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs transition-all shadow-md cursor-pointer flex items-center gap-1.5"
                    >
                      <PackageCheck className="w-4 h-4" />
                      <span>অর্ডার তালিকা দেখুন</span>
                    </button>

                    <button
                      onClick={startAddProduct}
                      className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs transition-all border border-slate-700 cursor-pointer flex items-center gap-1.5"
                    >
                      <Plus className="w-4 h-4 text-emerald-400" />
                      <span>নতুন সার্ভিস আপলোড</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Metric Cards Grid */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                
                <div className="bg-slate-800/80 border border-slate-700/80 rounded-2xl p-5 space-y-2">
                  <div className="flex items-center justify-between text-slate-400">
                    <span className="text-xs font-bold">মোট বুকিং/অর্ডার</span>
                    <PackageCheck className="w-4 h-4 text-rose-400" />
                  </div>
                  <div className="text-2xl font-extrabold text-white">
                    {orders.length} <span className="text-xs font-medium text-slate-400">টি</span>
                  </div>
                  <span className="text-[11px] text-emerald-400 font-semibold block">
                    সিস্টেমে সংরক্ষিত
                  </span>
                </div>

                <div className="bg-slate-800/80 border border-slate-700/80 rounded-2xl p-5 space-y-2">
                  <div className="flex items-center justify-between text-slate-400">
                    <span className="text-xs font-bold">অপেক্ষমাণ (পেন্ডিং)</span>
                    <Clock className="w-4 h-4 text-amber-400" />
                  </div>
                  <div className="text-2xl font-extrabold text-amber-400">
                    {pendingOrdersCount} <span className="text-xs font-medium text-slate-400">টি</span>
                  </div>
                  <span className="text-[11px] text-amber-300 font-semibold block">
                    কনফার্মেশনের অপেক্ষায়
                  </span>
                </div>

                <div className="bg-slate-800/80 border border-slate-700/80 rounded-2xl p-5 space-y-2">
                  <div className="flex items-center justify-between text-slate-400">
                    <span className="text-xs font-bold">সম্পন্ন (Delivered)</span>
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  </div>
                  <div className="text-2xl font-extrabold text-emerald-400">
                    {completedOrdersCount} <span className="text-xs font-medium text-slate-400">টি</span>
                  </div>
                  <span className="text-[11px] text-emerald-300 font-semibold block">
                    সফলভাবে সেবা সম্পন্ন
                  </span>
                </div>

                <div className="bg-slate-800/80 border border-slate-700/80 rounded-2xl p-5 space-y-2">
                  <div className="flex items-center justify-between text-slate-400">
                    <span className="text-xs font-bold">মোট বুকিং ভ্যালু</span>
                    <BarChart3 className="w-4 h-4 text-purple-400" />
                  </div>
                  <div className="text-2xl font-extrabold text-rose-300">
                    ৳{totalRevenue.toLocaleString('bn-BD')}
                  </div>
                  <span className="text-[11px] text-slate-400 font-medium block">
                    অনলাইন বুকিং অ্যামাউন্ট
                  </span>
                </div>

              </div>

              {/* Recent Activity Table */}
              <div className="bg-slate-950 border border-slate-800 rounded-3xl p-5 space-y-4">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <h3 className="font-extrabold text-white text-sm flex items-center gap-2">
                    <Clock className="w-4 h-4 text-rose-500" />
                    <span>সর্বশেষ বুকিং ও অর্ডারসমূহ</span>
                  </h3>

                  <button
                    onClick={() => setActiveTab('orders')}
                    className="text-xs font-bold text-rose-400 hover:text-rose-300 flex items-center gap-1 cursor-pointer"
                  >
                    <span>সব দেখুন ({orders.length})</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>

                {orders.length === 0 ? (
                  <div className="text-center py-8 text-slate-500 text-xs">
                    এখনো পর্যন্ত কোনো অর্ডার বা বুকিং জমা হয়নি।
                  </div>
                ) : (
                  <div className="space-y-3">
                    {orders.slice(0, 5).map((ord) => (
                      <div
                        key={ord.orderId}
                        className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:border-slate-700 transition-all text-xs shadow-sm"
                      >
                        <div className="space-y-2 flex-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-mono font-bold text-rose-300 bg-rose-950/80 px-2.5 py-0.5 rounded-lg border border-rose-800/60">
                              #{ord.orderId}
                            </span>
                            <span className="font-extrabold text-white text-sm">{ord.customerName}</span>
                            <a
                              href={`tel:${ord.phone}`}
                              className="text-amber-300 font-bold hover:underline text-xs flex items-center gap-1"
                            >
                              <Phone className="w-3 h-3 text-emerald-400" />
                              <span>{ord.phone}</span>
                            </a>
                            <span className="text-slate-400 text-[11px]">
                              ({new Date(ord.createdAt).toLocaleDateString('bn-BD')})
                            </span>
                          </div>

                          {/* Ordered Product Thumbnails & Titles */}
                          <div className="flex flex-wrap items-center gap-2 pt-1">
                            {ord.items.map((item, idx) => {
                              const imgUrl = getItemImageUrl(item);
                              return (
                                <div
                                  key={idx}
                                  className="flex items-center gap-2 bg-slate-950/90 border border-slate-800 p-1.5 pr-3 rounded-xl max-w-xs shadow-inner"
                                >
                                  <img
                                    src={imgUrl}
                                    alt={item.productTitle}
                                    className="w-10 h-10 object-cover rounded-lg shrink-0 border border-slate-700"
                                    referrerPolicy="no-referrer"
                                  />
                                  <div className="min-w-0">
                                    <p className="font-bold text-slate-200 text-xs line-clamp-1">
                                      {item.productTitle}
                                    </p>
                                    <p className="text-[10px] text-slate-400">
                                      পরিমাণ: <span className="text-amber-300 font-bold">x{item.quantity}</span>
                                    </p>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>

                        <div className="flex items-center justify-between md:justify-end gap-3 shrink-0 pt-2 md:pt-0 border-t md:border-t-0 border-slate-800/80">
                          <div className="text-left md:text-right">
                            <span className="text-[10px] text-slate-400 block font-medium">মোট পেমেন্ট</span>
                            <span className="font-extrabold text-amber-300 text-base">
                              ৳{ord.totalAmount.toLocaleString('bn-BD')}
                            </span>
                          </div>

                          <span
                            className={`px-3 py-1.5 rounded-xl text-[10px] font-extrabold ${
                              ord.status === 'delivered'
                                ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                                : ord.status === 'confirmed'
                                ? 'bg-blue-950 text-blue-300 border border-blue-800'
                                : 'bg-amber-950 text-amber-300 border border-amber-800'
                            }`}
                          >
                            {ord.status === 'delivered'
                              ? 'সম্পন্ন'
                              : ord.status === 'confirmed'
                              ? 'কনফার্মড'
                              : 'পেন্ডিং'}
                          </span>

                          <button
                            onClick={() => setSelectedOrderDetails(ord)}
                            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors cursor-pointer border border-slate-700"
                            title="বিস্তারিত দেখুন"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

            </div>
          )}

          {/* TAB 2: ORDERS & APPOINTMENTS LIST */}
          {activeTab === 'orders' && (
            <div className="space-y-5">
              
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-950 border border-slate-800 p-4 rounded-3xl">
                <div>
                  <h3 className="font-extrabold text-white text-base">
                    গ্রাহকের অনলাইন অ্যাপয়েন্টমেন্ট ও অর্ডার তালিকা
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    মোট {orders.length} টি অর্ডার ডাটাবেজে রয়েছে
                  </p>
                </div>

                <button
                  onClick={fetchOrders}
                  className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer shrink-0 border border-slate-700"
                >
                  <RefreshCw className="w-3.5 h-3.5 text-rose-400" />
                  <span>ডাটা রিফ্রেশ করুন</span>
                </button>
              </div>

              {/* Search & Status Filter */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
                <div className="relative w-full sm:w-80">
                  <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <input
                    type="text"
                    placeholder="অর্ডার আইডি, গ্রাহকের নাম বা মোবাইল নম্বর..."
                    value={orderSearchQuery}
                    onChange={(e) => setOrderSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-slate-950 border border-slate-800 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-rose-500"
                  />
                </div>

                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <Filter className="w-4 h-4 text-slate-500 shrink-0" />
                  <select
                    value={orderStatusFilter}
                    onChange={(e) => setOrderStatusFilter(e.target.value)}
                    className="px-3.5 py-2.5 rounded-2xl bg-slate-950 border border-slate-800 text-xs font-bold text-slate-200 focus:outline-none focus:ring-2 focus:ring-rose-500 cursor-pointer"
                  >
                    <option value="all">সকল স্ট্যাটাস (All)</option>
                    <option value="pending">⏳ পেন্ডিং (Pending)</option>
                    <option value="confirmed">✅ কনফার্মড (Confirmed)</option>
                    <option value="processing">⚙️ প্রসেসিং (Processing)</option>
                    <option value="delivered">🎉 সম্পন্ন (Delivered)</option>
                  </select>
                </div>
              </div>

              {/* Orders List */}
              {isLoadingOrders ? (
                <div className="text-center py-16 text-slate-500 text-xs">
                  <RefreshCw className="w-6 h-6 animate-spin mx-auto text-rose-500 mb-2" />
                  <span>অর্ডার ডাটা লোড হচ্ছে...</span>
                </div>
              ) : filteredOrders.length === 0 ? (
                <div className="text-center py-16 bg-slate-950 border border-dashed border-slate-800 rounded-3xl p-6">
                  <PackageCheck className="w-12 h-12 text-slate-600 mx-auto mb-3" />
                  <h4 className="font-extrabold text-white text-sm">কোনো অর্ডার পাওয়া যায়নি</h4>
                  <p className="text-xs text-slate-500 mt-1">
                    ফিল্টার পরিবর্তন করে খুঁজুন অথবা নতুন অর্ডারের জন্য অপেক্ষা করুন।
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {filteredOrders.map((ord) => (
                    <div
                      key={ord.orderId}
                      className="bg-slate-950 border border-slate-800 rounded-2xl p-4 sm:p-5 space-y-3 hover:border-slate-700 transition-all shadow-md"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
                        <div className="flex items-center gap-2.5 flex-wrap">
                          <span className="font-mono font-extrabold text-rose-300 text-sm bg-rose-950/80 px-3 py-1 rounded-xl border border-rose-800/60">
                            #{ord.orderId}
                          </span>
                          <span className="text-sm font-extrabold text-white">{ord.customerName}</span>
                          <span className="text-xs text-slate-400">
                            ({new Date(ord.createdAt).toLocaleDateString('bn-BD')})
                          </span>
                        </div>

                        <div className="flex items-center gap-2">
                          <select
                            value={ord.status}
                            onChange={(e) =>
                              handleStatusChange(ord.orderId, e.target.value as Order['status'])
                            }
                            className={`px-3 py-1.5 rounded-xl text-xs font-extrabold cursor-pointer border ${
                              ord.status === 'delivered'
                                ? 'bg-emerald-950 text-emerald-300 border-emerald-800'
                                : ord.status === 'confirmed'
                                ? 'bg-blue-950 text-blue-300 border-blue-800'
                                : 'bg-amber-950 text-amber-300 border-amber-800'
                            }`}
                          >
                            <option value="pending">⏳ পেন্ডিং (Pending)</option>
                            <option value="confirmed">✅ কনফার্মড (Confirmed)</option>
                            <option value="processing">⚙️ প্রসেসিং (Processing)</option>
                            <option value="delivered">🎉 সম্পন্ন (Delivered)</option>
                          </select>

                          <button
                            onClick={() => setSelectedOrderDetails(ord)}
                            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors cursor-pointer"
                            title="বিস্তারিত দেখুন"
                          >
                            <Eye className="w-4 h-4" />
                          </button>

                          <button
                            onClick={() => handleDeleteOrder(ord.orderId)}
                            className="p-2 rounded-xl bg-red-950/60 hover:bg-red-900/80 text-red-400 transition-colors cursor-pointer border border-red-800/50"
                            title="মুছে ফেলুন"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                        <div>
                          <span className="text-slate-500 font-medium block">যোগাযোগ & সময়সূচি:</span>
                          <a
                            href={`tel:${ord.phone}`}
                            className="font-extrabold text-amber-300 hover:underline flex items-center gap-1.5 mt-0.5"
                          >
                            <Phone className="w-3.5 h-3.5 text-emerald-400" />
                            <span>{ord.phone}</span>
                          </a>
                          <span className="text-slate-300 block mt-1 line-clamp-2 leading-relaxed">
                            {ord.address}
                          </span>
                        </div>

                        <div>
                          <span className="text-slate-500 font-medium block mb-1.5">বুককৃত সার্ভিসসমূহ (ছবি সহ):</span>
                          <div className="space-y-1.5">
                            {ord.items.map((it, idx) => {
                              const imgUrl = getItemImageUrl(it);
                              return (
                                <div
                                  key={idx}
                                  className="flex items-center gap-2.5 bg-slate-900/90 border border-slate-800 p-1.5 rounded-xl"
                                >
                                  <img
                                    src={imgUrl}
                                    alt={it.productTitle}
                                    className="w-11 h-11 object-cover rounded-lg shrink-0 border border-slate-700"
                                    referrerPolicy="no-referrer"
                                  />
                                  <div className="min-w-0 flex-1">
                                    <span className="font-bold text-white text-xs block line-clamp-1">
                                      {it.productTitle}
                                    </span>
                                    <span className="text-[11px] text-slate-400">
                                      পরিমাণ: <span className="text-amber-300 font-bold">x{it.quantity}</span> | মূল্য: ৳{(it.price * it.quantity).toLocaleString('bn-BD')}
                                    </span>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>

                        <div className="sm:text-right">
                          <span className="text-slate-500 font-medium block">মোট পেমেন্ট:</span>
                          <span className="text-base font-extrabold text-rose-300 block mt-0.5">
                            ৳{ord.totalAmount.toLocaleString('bn-BD')}
                          </span>
                          <span className="text-[11px] text-emerald-400 font-semibold block mt-0.5">
                            ক্যাশ অন ডেলিভারি / পার্লার পেমেন্ট
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 3: SERVICES MANAGEMENT */}
          {activeTab === 'services' && (
            <div className="space-y-5">
              
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-950 border border-slate-800 p-4 rounded-3xl">
                <div>
                  <h3 className="font-extrabold text-white text-base">
                    পার্লার সার্ভিস ও লেজার ক্যাটালগ
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    ওয়েবসাইটে প্রদর্শিত সকল সার্ভিস ও লেজার প্যাকেজ ম্যানেজ করুন
                  </p>
                </div>

                <button
                  onClick={startAddProduct}
                  className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-500 hover:to-pink-500 text-white font-extrabold text-xs flex items-center gap-1.5 shadow-md transition-all cursor-pointer shrink-0"
                >
                  <Plus className="w-4 h-4" />
                  <span>নতুন সার্ভিস যোগ করুন</span>
                </button>
              </div>

              {/* Products Cards Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {products.map((prod) => (
                  <div
                    key={prod.id}
                    className="bg-slate-950 border border-slate-800 rounded-2xl p-4 space-y-3 flex flex-col justify-between hover:border-rose-900/60 transition-all shadow-md"
                  >
                    <div className="space-y-2">
                      <div className="aspect-16/9 rounded-xl overflow-hidden bg-slate-900 relative">
                        <img
                          src={prod.images[0]}
                          alt={prod.titleBn}
                          className="w-full h-full object-cover"
                          referrerPolicy="no-referrer"
                        />
                        <span className="absolute top-2 left-2 bg-rose-600 text-white font-bold text-[10px] px-2 py-0.5 rounded-md shadow-md">
                          {prod.categoryBn}
                        </span>
                        {prod.isFeatured && (
                          <span className="absolute top-2 right-2 bg-amber-500 text-slate-950 font-bold text-[10px] px-2 py-0.5 rounded-md shadow-md">
                            Featured
                          </span>
                        )}
                      </div>

                      <div>
                        <h4 className="font-extrabold text-white text-sm line-clamp-1">
                          {prod.titleBn}
                        </h4>
                        <p className="text-[11px] text-slate-400 line-clamp-2 mt-0.5 leading-relaxed">
                          {prod.descriptionBn}
                        </p>
                      </div>
                    </div>

                    <div className="pt-3 border-t border-slate-800 space-y-2.5">
                      <div className="flex items-center justify-between">
                        <div>
                          <span className="text-base font-extrabold text-rose-300">
                            ৳{prod.price.toLocaleString('bn-BD')}
                          </span>
                          {prod.originalPrice > prod.price && (
                            <span className="text-xs text-slate-500 line-through ml-2">
                              ৳{prod.originalPrice}
                            </span>
                          )}
                        </div>

                        {/* Stock status badge */}
                        <span className={`px-2 py-0.5 rounded-lg text-[10px] font-extrabold flex items-center gap-1 border ${
                          (prod.stockCount || 0) > 10
                            ? 'bg-emerald-950/80 text-emerald-300 border-emerald-800'
                            : (prod.stockCount || 0) > 0
                            ? 'bg-amber-950/80 text-amber-300 border-amber-800'
                            : 'bg-red-950/80 text-red-300 border-red-800'
                        }`}>
                          <Boxes className="w-3 h-3" />
                          <span>স্টক: {prod.stockCount || 0} টি</span>
                        </span>
                      </div>

                      <div className="flex items-center justify-between gap-1.5">
                        <button
                          onClick={() => {
                            setRestockProduct(prod);
                            setAddStockQty(10);
                          }}
                          className="px-2.5 py-1.5 rounded-xl bg-emerald-950 hover:bg-emerald-900 text-emerald-300 text-[11px] font-bold border border-emerald-800 flex items-center gap-1 transition-colors cursor-pointer"
                          title="নতুন স্টক যোগ করুন"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          <span>স্টক যোগ</span>
                        </button>

                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => startEditProduct(prod)}
                            className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold flex items-center gap-1 transition-colors cursor-pointer border border-slate-700"
                          >
                            <Edit className="w-3.5 h-3.5 text-amber-400" />
                            <span>এডিট</span>
                          </button>

                          <button
                            onClick={() => handleDeleteProduct(prod.id, prod.titleBn)}
                            className="p-1.5 rounded-xl bg-red-950/60 hover:bg-red-900/80 text-red-400 text-xs font-bold transition-colors cursor-pointer border border-red-800/50"
                            title="মুছে ফেলুন"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

            </div>
          )}

          {/* TAB 4: ADD / EDIT SERVICE FORM */}
          {activeTab === 'add_edit_service' && (
            <div className="space-y-5 max-w-3xl mx-auto">
              
              <div className="flex items-center justify-between bg-slate-950 border border-slate-800 p-4 rounded-3xl">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-rose-500/20 text-rose-300 flex items-center justify-center border border-rose-500/30">
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <h3 className="font-extrabold text-white text-base">
                    {editingProduct ? `'${editingProduct.titleBn}' এডিট করুন` : 'নতুন সার্ভিস বা প্যাকেজ যোগ করুন'}
                  </h3>
                </div>

                <button
                  onClick={() => setActiveTab('services')}
                  className="text-xs font-bold text-slate-400 hover:text-white"
                >
                  ← তালিকায় ফিরুন
                </button>
              </div>

              <form onSubmit={handleSaveProduct} className="bg-slate-950 border border-slate-800 rounded-3xl p-6 space-y-4 text-xs">
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block font-bold text-slate-300 mb-1.5">
                      সেবার নাম (বাংলা) <span className="text-rose-400">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="যেমন: CSA লেজার স্থায়ী হেয়ার রিমুভাল"
                      value={formData.titleBn}
                      onChange={(e) => setFormData({ ...formData, titleBn: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-2xl bg-slate-900 border border-slate-800 text-white text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-rose-500"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-300 mb-1.5">
                      সেবার নাম (English)
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. CSA Laser Hair Removal"
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-2xl bg-slate-900 border border-slate-800 text-white text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-rose-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <label className="block font-bold text-slate-300 mb-1.5">
                      ক্যাটেগরি নির্বাচন করুন <span className="text-rose-400">*</span>
                    </label>
                    <select
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-2xl bg-slate-900 border border-slate-800 text-white text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-rose-500 cursor-pointer"
                    >
                      {categories.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.nameBn}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-300 mb-1.5">
                      অফার মূল্য (BDT) <span className="text-rose-400">*</span>
                    </label>
                    <input
                      type="number"
                      required
                      value={formData.price}
                      onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
                      className="w-full px-4 py-2.5 rounded-2xl bg-slate-900 border border-slate-800 text-amber-300 font-extrabold text-sm focus:outline-none focus:ring-2 focus:ring-rose-500"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-300 mb-1.5">
                      আগের মূল্য (রেগুলার)
                    </label>
                    <input
                      type="number"
                      value={formData.originalPrice}
                      onChange={(e) => setFormData({ ...formData, originalPrice: Number(e.target.value) })}
                      className="w-full px-4 py-2.5 rounded-2xl bg-slate-900 border border-slate-800 text-slate-300 font-semibold text-xs focus:outline-none focus:ring-2 focus:ring-rose-500"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-300 mb-1.5">
                      স্টক পরিমাণ (Stock Quantity) <span className="text-rose-400">*</span>
                    </label>
                    <input
                      type="number"
                      required
                      min="0"
                      value={formData.stockCount}
                      onChange={(e) => setFormData({ ...formData, stockCount: Number(e.target.value) })}
                      className="w-full px-4 py-2.5 rounded-2xl bg-slate-900 border border-slate-800 text-emerald-400 font-extrabold text-sm focus:outline-none focus:ring-2 focus:ring-rose-500"
                    />
                  </div>
                </div>

                {/* Image Upload Component with 100KB Compression */}
                <div className="space-y-2 bg-slate-900/90 p-4 rounded-2xl border border-slate-800/80">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <label className="block font-bold text-slate-200 text-xs flex items-center gap-1.5">
                      <Upload className="w-4 h-4 text-rose-400" />
                      <span>পণ্যের ছবি আপলোড করুন (অটোমেটিক ১০০KB-এর নিচে কমপ্রেস হবে)</span>
                    </label>
                    {imageKbSize !== null && (
                      <span className="text-[11px] font-bold text-emerald-400 bg-emerald-950 px-2.5 py-0.5 rounded-lg border border-emerald-800 shrink-0">
                        সাইজ: {imageKbSize} KB (১০০KB এর নিচে অপটিমাইজড)
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-3">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileUpload}
                      disabled={isCompressingImage}
                      className="block w-full text-xs text-slate-400 file:mr-3 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-rose-600 file:text-white hover:file:bg-rose-500 cursor-pointer"
                    />
                    {isCompressingImage && (
                      <div className="flex items-center gap-1.5 text-xs text-amber-300 font-bold shrink-0">
                        <Loader2 className="w-4 h-4 animate-spin text-amber-400" />
                        <span>কমপ্রেস হচ্ছে...</span>
                      </div>
                    )}
                  </div>

                  <p className="text-[10px] text-slate-400 leading-relaxed">
                    💡 <b>ফায়ারবেস অটো-কমপ্রেসন:</b> আপনি যেকোনো বড় বা হাই-কোয়ালিটি ছবি নির্বাচন করলেও সিস্টেম সেটিকে ১০০KB-এর নিচে কমপ্রেস করে ফায়ারবেসে স্টোর করবে।
                  </p>

                  <div className="pt-2">
                    <label className="block font-semibold text-slate-400 text-[11px] mb-1">
                      অথবা সরাসরি ছবির লিঙ্ক (Image URL) পেস্ট করুন:
                    </label>
                    <input
                      type="text"
                      placeholder="https://..."
                      value={formData.imageUrl}
                      onChange={(e) => {
                        setImageKbSize(null);
                        setFormData({ ...formData, imageUrl: e.target.value });
                      }}
                      className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:outline-none focus:ring-2 focus:ring-rose-500"
                    />
                  </div>

                  {formData.imageUrl && (
                    <div className="mt-2 flex items-center gap-3 bg-slate-950 p-2 rounded-xl border border-slate-800">
                      <img
                        src={formData.imageUrl}
                        alt="Preview"
                        className="w-12 h-12 object-cover rounded-lg border border-slate-700 shrink-0"
                        referrerPolicy="no-referrer"
                      />
                      <div className="min-w-0 flex-1">
                        <span className="text-[11px] font-bold text-slate-200 block">ছবির কারেন্ট প্রিভিউ</span>
                        <span className="text-[10px] text-slate-400 truncate block">
                          {formData.imageUrl.startsWith('data:') ? 'অটো-কমপ্রেসড ডাটা ইমেজ (<১০০KB)' : formData.imageUrl.substring(0, 50) + '...'}
                        </span>
                      </div>
                    </div>
                  )}
                </div>

                <div>
                  <label className="block font-bold text-slate-300 mb-1.5">
                    বিবরণ (বাংলা)
                  </label>
                  <textarea
                    rows={3}
                    placeholder="সেবার সুবিধা ও বিস্তারিত তথ্য লিখুন..."
                    value={formData.descriptionBn}
                    onChange={(e) => setFormData({ ...formData, descriptionBn: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-2xl bg-slate-900 border border-slate-800 text-white text-xs focus:outline-none focus:ring-2 focus:ring-rose-500 leading-relaxed"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-300 mb-1.5">
                    মূল বৈশিষ্ট্যসমূহ (প্রতি লাইনে একটি করে পয়েন্ট)
                  </label>
                  <textarea
                    rows={3}
                    placeholder="১০০% ব্যথামুক্ত প্রযুক্তি&#10;অভিজ্ঞ নারী স্পেশালিস্ট"
                    value={formData.keyFeaturesBn}
                    onChange={(e) => setFormData({ ...formData, keyFeaturesBn: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-2xl bg-slate-900 border border-slate-800 text-white text-xs focus:outline-none focus:ring-2 focus:ring-rose-500 leading-relaxed font-sans"
                  />
                </div>

                <div className="flex flex-wrap items-center gap-6 pt-2">
                  <label className="flex items-center gap-2 cursor-pointer font-bold text-slate-200">
                    <input
                      type="checkbox"
                      checked={formData.isFeatured}
                      onChange={(e) => setFormData({ ...formData, isFeatured: e.target.checked })}
                      className="w-4 h-4 rounded text-rose-600 focus:ring-rose-500"
                    />
                    <span>ফিচার্ড সার্ভিস (হোমপেজে স্পেশাল ক্যাটাগরিতে দেখাবে)</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer font-bold text-slate-200">
                    <input
                      type="checkbox"
                      checked={formData.isBestSeller}
                      onChange={(e) => setFormData({ ...formData, isBestSeller: e.target.checked })}
                      className="w-4 h-4 rounded text-rose-600 focus:ring-rose-500"
                    />
                    <span>পপুলার / হট সেলিং</span>
                  </label>
                </div>

                <div className="pt-4 border-t border-slate-800 flex items-center justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setActiveTab('services')}
                    className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs cursor-pointer transition-all border border-slate-700"
                  >
                    বাতিল
                  </button>

                  <button
                    type="submit"
                    className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-500 hover:to-pink-500 text-white font-extrabold text-xs shadow-lg cursor-pointer transition-all flex items-center gap-1.5"
                  >
                    <Save className="w-4 h-4" />
                    <span>সংরক্ষণ করুন</span>
                  </button>
                </div>
              </form>

            </div>
          )}

          {/* TAB 5: PARLOUR SETTINGS */}
          {activeTab === 'settings' && (
            <div className="space-y-5 max-w-2xl mx-auto">
              
              <div className="flex items-center gap-2.5 bg-slate-950 border border-slate-800 p-4 rounded-3xl">
                <Sliders className="w-5 h-5 text-rose-400" />
                <div>
                  <h3 className="font-extrabold text-white text-base">
                    পার্লারের তথ্য ও হটলাইন সেটিংস
                  </h3>
                  <p className="text-xs text-slate-400">
                    ফুটার, হেডার এবং নোটিশে প্রদর্শিত তথ্য পরিবর্তন করুন
                  </p>
                </div>
              </div>

              <form onSubmit={handleSaveSettings} className="bg-slate-950 border border-slate-800 rounded-3xl p-6 space-y-4 text-xs">
                <div>
                  <label className="block font-bold text-slate-300 mb-1.5">
                    পার্লার ও শাখার নাম
                  </label>
                  <input
                    type="text"
                    required
                    value={parlourInfo.branchName}
                    onChange={(e) => setParlourInfo({ ...parlourInfo, branchName: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-2xl bg-slate-900 border border-slate-800 text-white font-bold text-xs focus:outline-none focus:ring-2 focus:ring-rose-500"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-300 mb-1.5">
                    হটলাইন ফোন নম্বর
                  </label>
                  <input
                    type="text"
                    required
                    value={parlourInfo.hotline}
                    onChange={(e) => setParlourInfo({ ...parlourInfo, hotline: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-2xl bg-slate-900 border border-slate-800 text-amber-300 font-extrabold text-sm focus:outline-none focus:ring-2 focus:ring-rose-500"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-300 mb-1.5">
                    পার্লারের ঠিকানা (টাঙ্গাইল শাখা)
                  </label>
                  <input
                    type="text"
                    required
                    value={parlourInfo.address}
                    onChange={(e) => setParlourInfo({ ...parlourInfo, address: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-2xl bg-slate-900 border border-slate-800 text-white font-semibold text-xs focus:outline-none focus:ring-2 focus:ring-rose-500"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-300 mb-1.5">
                    খোলা থাকার সময়সূচি
                  </label>
                  <input
                    type="text"
                    value={parlourInfo.hours}
                    onChange={(e) => setParlourInfo({ ...parlourInfo, hours: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-2xl bg-slate-900 border border-slate-800 text-white font-medium text-xs focus:outline-none focus:ring-2 focus:ring-rose-500"
                  />
                </div>

                <div className="pt-3 border-t border-slate-800 flex justify-end">
                  <button
                    type="submit"
                    className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-500 hover:to-pink-500 text-white font-extrabold text-xs shadow-lg cursor-pointer transition-all flex items-center gap-1.5"
                  >
                    <Save className="w-4 h-4" />
                    <span>তথ্য সংরক্ষণ করুন</span>
                  </button>
                </div>
              </form>

            </div>
          )}

        </main>
      </div>

      {/* Order Detail Modal */}
      {selectedOrderDetails && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-slate-900 text-slate-100 rounded-3xl max-w-lg w-full p-6 space-y-4 relative border border-slate-800 shadow-2xl">
            <button
              onClick={() => setSelectedOrderDetails(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white p-1.5 rounded-full"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
              <span className="font-extrabold text-rose-400 text-base">
                অর্ডার বিস্তারিত - #{selectedOrderDetails.orderId}
              </span>
            </div>

            <div className="space-y-2.5 text-xs text-slate-300">
              <div className="flex justify-between">
                <span className="text-slate-500">গ্রাহকের নাম:</span>
                <span className="font-extrabold text-white">{selectedOrderDetails.customerName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">মোবাইল নম্বর:</span>
                <a href={`tel:${selectedOrderDetails.phone}`} className="font-bold text-amber-300 hover:underline">
                  {selectedOrderDetails.phone}
                </a>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">ঠিকানা/নোট:</span>
                <span className="font-semibold text-slate-200 text-right max-w-[220px]">
                  {selectedOrderDetails.address}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">তারিখ:</span>
                <span className="font-medium text-slate-400">
                  {new Date(selectedOrderDetails.createdAt).toLocaleString('bn-BD')}
                </span>
              </div>

              <div className="pt-3 border-t border-slate-800">
                <span className="font-bold text-white block mb-1.5">বুককৃত সার্ভিসসমূহ (ছবি সহ):</span>
                <div className="space-y-2 bg-slate-950 p-3 rounded-2xl border border-slate-800 max-h-60 overflow-y-auto">
                  {selectedOrderDetails.items.map((it, idx) => {
                    const imgUrl = getItemImageUrl(it);
                    return (
                      <div
                        key={idx}
                        className="flex items-center gap-3 p-2 bg-slate-900/90 rounded-xl border border-slate-800"
                      >
                        <img
                          src={imgUrl}
                          alt={it.productTitle}
                          className="w-12 h-12 object-cover rounded-xl shrink-0 border border-slate-700"
                          referrerPolicy="no-referrer"
                        />
                        <div className="flex-1 min-w-0">
                          <span className="font-extrabold text-white text-xs block line-clamp-1">
                            {it.productTitle}
                          </span>
                          <span className="text-[11px] text-slate-400">
                            পরিমাণ: <span className="text-amber-300 font-bold">x{it.quantity}</span>
                          </span>
                        </div>
                        <span className="font-extrabold text-amber-300 text-xs shrink-0">
                          ৳{(it.price * it.quantity).toLocaleString('bn-BD')}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="flex justify-between pt-3 border-t border-slate-800 font-extrabold text-white text-sm">
                <span>মোট পেমেন্ট:</span>
                <span className="text-rose-400">৳{selectedOrderDetails.totalAmount.toLocaleString('bn-BD')}</span>
              </div>
            </div>

            <button
              onClick={() => setSelectedOrderDetails(null)}
              className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs transition-colors border border-slate-700"
            >
              বন্ধ করুন
            </button>
          </div>
        </div>
      )}

      {/* QUICK RESTOCK MODAL */}
      {restockProduct && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 max-w-sm w-full space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/30">
                  <Boxes className="w-4 h-4" />
                </div>
                <h3 className="font-extrabold text-white text-sm">নতুন স্টক যুক্ত করুন (Restock)</h3>
              </div>
              <button
                onClick={() => setRestockProduct(null)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-2">
              <p className="text-xs text-slate-300 font-bold line-clamp-1">
                {restockProduct.titleBn}
              </p>
              <div className="flex items-center justify-between text-xs bg-slate-950 p-2.5 rounded-xl border border-slate-800">
                <span className="text-slate-400">বর্তমান স্টক:</span>
                <span className="font-extrabold text-amber-300">{restockProduct.stockCount || 0} টি</span>
              </div>
            </div>

            <form onSubmit={handleApplyRestock} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-200 mb-1.5">
                  কতগুলো নতুন স্টক যোগ করবেন?
                </label>
                <input
                  type="number"
                  required
                  min="1"
                  value={addStockQty}
                  onChange={(e) => setAddStockQty(Number(e.target.value))}
                  className="w-full px-4 py-2.5 rounded-2xl bg-slate-950 border border-slate-800 text-emerald-400 font-extrabold text-base focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  placeholder="যেমন: 10, 20, 50"
                />
              </div>

              <div className="flex items-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setRestockProduct(null)}
                  className="w-1/2 py-2.5 rounded-xl bg-slate-800 text-slate-300 font-bold text-xs hover:bg-slate-700 cursor-pointer"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  className="w-1/2 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-extrabold text-xs shadow-md cursor-pointer"
                >
                  + স্টক আপডেট করুন
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
