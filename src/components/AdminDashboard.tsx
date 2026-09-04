import React, { useState, useEffect, useMemo } from 'react';
import { Product, Order, Category, OrderItem } from '../types';
import {
  getOrdersFromFirestore,
  subscribeToOrders,
  updateOrderStatusInFirestore,
  deleteOrderFromFirestore,
  saveOrderToFirestore,
  saveProductToFirestore,
  deleteProductFromFirestore,
  saveProductsToFirestore,
  saveAppSettingsToFirestore,
  subscribeToAppSettings,
} from '../lib/firebase';
import { A4PrintInvoice } from './A4PrintInvoice';
import { ServiceManagerModal } from './ServiceManagerModal';
import { AppointmentManager } from './AppointmentManager';
import { isProductItem } from '../data/products';
import { resizeScroll, resumeScroll } from '../lib/smoothScroll';
import {
  LayoutDashboard,
  ClipboardList,
  Receipt,
  Users,
  Sparkles,
  Settings,
  Plus,
  Trash2,
  Phone,
  Search,
  Lock,
  LogOut,
  ArrowLeft,
  Clock,
  CheckCircle2,
  X,
  Upload,
  Loader2,
  Printer,
  FileText,
  UserCheck,
  AlertCircle,
  Eye,
  RefreshCw,
  Tag,
  DollarSign,
  TrendingUp,
  MapPin,
  Calendar,
  Save,
  QrCode,
  Globe,
  Smartphone,
  Edit2,
  Check,
  Layers,
  ShoppingBag,
  Truck,
  Building2,
  Image as ImageIcon
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
  // Authentication State (Passcode strictly 3795)
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return localStorage.getItem('tanu_admin_auth') === 'true';
  });
  const [passwordInput, setPasswordInput] = useState('');
  const [loginError, setLoginError] = useState('');

  // Active Navigation Tabs: 'overview' | 'orders' | 'appointments' | 'billing' | 'statements' | 'services' | 'settings'
  const [activeTab, setActiveTab] = useState<'overview' | 'orders' | 'appointments' | 'billing' | 'statements' | 'services' | 'settings'>(() => {
    try {
      const urlParams = new URLSearchParams(window.location.search);
      const tabParam = urlParams.get('tab') || urlParams.get('view');
      const adminParam = urlParams.get('admin');
      if (tabParam === 'appointments' || adminParam === 'appointments' || tabParam === 'appointment') {
        return 'appointments';
      }
    } catch {}
    return 'overview';
  });

  // Orders State (synced from Firestore)
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoadingOrders, setIsLoadingOrders] = useState(false);
  const [orderSearchQuery, setOrderSearchQuery] = useState('');
  const [orderStatusFilter, setOrderStatusFilter] = useState<string>('all');

  // A4 Invoice Modal State
  const [printInvoiceOrder, setPrintInvoiceOrder] = useState<Order | null>(null);

  // Parlour Info
  const [parlourInfo, setParlourInfo] = useState(() => {
    try {
      const saved = localStorage.getItem('tanu_parlour_info');
      return saved
        ? JSON.parse(saved)
        : {
            branchName: 'তনু বিউটি পার্লার এন্ড লেজার সেন্টার',
            hotline: '01302383795',
            address: 'ডুবাইল, সেহড়াতৈল রোড, নাটিয়াপাড়া বাজার, দেলদুয়ার, টাঙ্গাইল',
            hours: 'সকাল ১০:০০ টা - রাত ৮:০০ টা (প্রতিদিন খোলা)',
          };
    } catch {
      return {
        branchName: 'তনু বিউটি পার্লার এন্ড লেজার সেন্টার',
        hotline: '01302383795',
        address: 'ডুবাইল, সেহড়াতৈল রোড, নাটিয়াপাড়া বাজার, দেলদুয়ার, টাঙ্গাইল',
        hours: 'সকাল ১০:০০ টা - রাত ৮:০০ টা (প্রতিদিন খোলা)',
      };
    }
  });

  // QR Code View Option (On = Text Memo with no URL, Off = Receipt URL)
  const [qrTextMemoEnabled, setQrTextMemoEnabled] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem('tanu_qr_text_memo');
      return saved !== null ? JSON.parse(saved) : true;
    } catch {
      return true;
    }
  });
  const [isUpdatingQrOption, setIsUpdatingQrOption] = useState(false);

  // Manual Billing Form State
  const [billCustomerPhone, setBillCustomerPhone] = useState('');
  const [billCustomerName, setBillCustomerName] = useState('');
  const [billCustomerAddress, setBillCustomerAddress] = useState('');
  const [billCustomerDistrict, setBillCustomerDistrict] = useState('টাঙ্গাইল');
  const [billPaymentMethod, setBillPaymentMethod] = useState<'cash' | 'bkash' | 'nagad' | 'cod'>('cash');
  const [billDiscount, setBillDiscount] = useState<number>(0);
  const [billPaidAmount, setBillPaidAmount] = useState<string>('');
  const [billNotes, setBillNotes] = useState('');
  const [billItems, setBillItems] = useState<OrderItem[]>([
    { productId: products[0]?.id || 'custom-1', productTitle: products[0]?.titleBn || 'সিএসএ লেজার ট্রিটমেন্ট', quantity: 1, price: products[0]?.price || 1500 }
  ]);
  const [isSavingBill, setIsSavingBill] = useState(false);
  const [matchedCustomerInfo, setMatchedCustomerInfo] = useState<{ count: number; totalSpent: number } | null>(null);

  // Customer Statement Search State
  const [statementPhoneQuery, setStatementPhoneQuery] = useState('');

  // Service & Package Management State
  const [isServiceModalOpen, setIsServiceModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [serviceSearchQuery, setServiceSearchQuery] = useState('');
  const [adminDivisionFilter, setAdminDivisionFilter] = useState<'all' | 'products' | 'services'>('all');
  const [serviceCategoryFilter, setServiceCategoryFilter] = useState('all');
  const [isSyncingServices, setIsSyncingServices] = useState(false);

  // Open modal to add a new service
  const handleOpenAddService = () => {
    setEditingProduct(null);
    setIsServiceModalOpen(true);
  };

  // Open modal to edit an existing service
  const handleOpenEditService = (prod: Product) => {
    setEditingProduct(prod);
    setIsServiceModalOpen(true);
  };

  // Save product to Firestore and update local state
  const handleSaveProduct = async (productData: Product) => {
    try {
      // 1. Save to Firestore
      await saveProductToFirestore(productData);

      // 2. Update local state
      const exists = products.some((p) => p.id === productData.id);
      let updatedList: Product[];
      if (exists) {
        updatedList = products.map((p) => (p.id === productData.id ? productData : p));
        onToast(`সার্ভিস "${productData.titleBn}" সফলভাবে আপডেট ও ফায়ারবেসে সেভ হয়েছে`);
      } else {
        updatedList = [productData, ...products];
        onToast(`নতুন সার্ভিস "${productData.titleBn}" সফলভাবে ফায়ারবেসে যোগ হয়েছে`);
      }

      onUpdateProducts(updatedList);
    } catch (err) {
      console.error('Error saving product:', err);
      onToast('সার্ভিস সেভ করতে সমস্যা হয়েছে।');
      throw err;
    }
  };

  // Delete product from Firestore and local state
  const handleDeleteProduct = async (productId: string, titleBn: string) => {
    if (window.confirm(`আপনি কি সত্যিই "${titleBn}" সার্ভিসটি স্থায়ীভাবে ডিলিট করতে চান?`)) {
      try {
        await deleteProductFromFirestore(productId);
        const updatedList = products.filter((p) => p.id !== productId);
        onUpdateProducts(updatedList);
        onToast(`সার্ভিস "${titleBn}" ফায়ারবেস থেকে ডিলিট করা হয়েছে`);
      } catch (err) {
        console.error('Error deleting product:', err);
        onToast('সার্ভিস ডিলিট করতে ব্যর্থ হয়েছে');
      }
    }
  };

  // Batch sync all services to Firestore
  const handleSyncAllServices = async () => {
    setIsSyncingServices(true);
    try {
      await saveProductsToFirestore(products);
      onToast(`সকল (${products.length} টি) সার্ভিস সফলভাবে ফায়ারবেস ক্লাউডে সিঙ্ক করা হয়েছে`);
    } catch (err) {
      console.error('Failed to sync services:', err);
      onToast('ফায়ারবেস সিঙ্ক করতে সমস্যা হয়েছে');
    } finally {
      setIsSyncingServices(false);
    }
  };

  // Initial Data Fetch & Firestore Real-Time Subscription
  useEffect(() => {
    if (isAuthenticated) {
      setIsLoadingOrders(true);
      getOrdersFromFirestore().then((initialOrders) => {
        if (initialOrders && initialOrders.length > 0) {
          setOrders(initialOrders);
        } else {
          const localSaved = localStorage.getItem('tanu_orders');
          if (localSaved) {
            try {
              setOrders(JSON.parse(localSaved));
            } catch (e) {
              console.error(e);
            }
          }
        }
        setIsLoadingOrders(false);
      }).catch(() => {
        setIsLoadingOrders(false);
      });

      const unsubscribe = subscribeToOrders((updatedOrders) => {
        if (updatedOrders && updatedOrders.length > 0) {
          setOrders(updatedOrders);
        }
      });
      return () => unsubscribe();
    }
  }, [isAuthenticated]);

  // Recalculate Lenis scroll dimensions whenever activeTab or modal changes in Admin
  useEffect(() => {
    resizeScroll();
    resumeScroll();
  }, [activeTab, isServiceModalOpen, printInvoiceOrder]);

  // Handle Login with Passcode
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanPass = passwordInput.trim();
    if (cleanPass === '3795' || cleanPass === '01302383795') {
      setIsAuthenticated(true);
      localStorage.setItem('tanu_admin_auth', 'true');
      setPasswordInput('');
      setLoginError('');
      onToast('এডমিন লগইন সফল হয়েছে!');
    } else {
      setLoginError('ভুল পাসকোড! অনুগ্রহ করে সঠিক পাসকোড দিন।');
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setPasswordInput('');
    setLoginError('');
    localStorage.removeItem('tanu_admin_auth');
    sessionStorage.clear();
    onToast('এডমিন প্যানেল থেকে সফলভাবে লগআউট করা হয়েছে');
    onBackToWebsite();
  };

  // Subscribe to real-time app settings from Firestore
  useEffect(() => {
    const unsubSettings = subscribeToAppSettings((settings) => {
      if (typeof settings.qrTextMemoEnabled === 'boolean') {
        setQrTextMemoEnabled(settings.qrTextMemoEnabled);
        localStorage.setItem('tanu_qr_text_memo', JSON.stringify(settings.qrTextMemoEnabled));
      }
      if (settings.parlourInfo) {
        setParlourInfo(settings.parlourInfo);
        localStorage.setItem('tanu_parlour_info', JSON.stringify(settings.parlourInfo));
      }
    });

    return () => {
      unsubSettings();
    };
  }, []);

  // Smart Autofill when typing Customer Phone Number in Billing Tab
  useEffect(() => {
    const cleanPhone = billCustomerPhone.replace(/[\s-]/g, '').trim();
    if (cleanPhone.length >= 6) {
      const pastMatch = orders.find(o => o.phone.replace(/[\s-]/g, '').includes(cleanPhone));
      if (pastMatch) {
        if (!billCustomerName) setBillCustomerName(pastMatch.customerName);
        if (!billCustomerAddress) setBillCustomerAddress(pastMatch.address);
        if (pastMatch.district && !billCustomerDistrict) setBillCustomerDistrict(pastMatch.district);

        // Calculate total stats for this customer
        const customerOrders = orders.filter(o => o.phone.replace(/[\s-]/g, '') === pastMatch.phone.replace(/[\s-]/g, ''));
        const totalSpent = customerOrders.reduce((sum, o) => sum + (o.totalAmount || 0), 0);
        setMatchedCustomerInfo({ count: customerOrders.length, totalSpent });
        return;
      }
    }
    setMatchedCustomerInfo(null);
  }, [billCustomerPhone, orders]);

  // Order Status update
  const handleStatusChange = async (orderId: string, newStatus: Order['status']) => {
    try {
      const updated = orders.map(o => {
        if (o.orderId === orderId) {
          const updatedHistory = [...(o.trackingHistory || [])];
          let titleBn = 'স্ট্যাটাস আপডেট';
          let descBn = 'আপনার বুকিং এর স্ট্যাটাস পরিবর্তন করা হয়েছে।';
          if (newStatus === 'confirmed') {
            titleBn = 'বুকিং গ্রহণ ও নিশ্চিত';
            descBn = 'তনু পার্লার ও লেজার শাখা থেকে আপনার বুকিং নিশ্চিত করা হয়েছে।';
          } else if (newStatus === 'processing') {
            titleBn = 'সার্ভিস প্রক্রিয়াধীন';
            descBn = 'সিরিয়াল বা ডেলিভারি প্রস্তুত করা হচ্ছে।';
          } else if (newStatus === 'delivered') {
            titleBn = 'সার্ভিস সম্পন্ন / ডেলিভার্ড';
            descBn = 'সার্ভিস বা অর্ডার সফলভাবে সম্পন্ন হয়েছে।';
          }
          updatedHistory.push({
            status: newStatus,
            titleBn,
            timestamp: new Date().toLocaleTimeString('bn-BD', { hour: '2-digit', minute: '2-digit' }),
            descriptionBn: descBn,
            completed: true
          });
          return { ...o, status: newStatus, trackingHistory: updatedHistory };
        }
        return o;
      });

      setOrders(updated);
      await updateOrderStatusInFirestore(orderId, newStatus);
      localStorage.setItem('tanu_orders', JSON.stringify(updated));
      onToast(`অর্ডার (${orderId}) স্ট্যাটাস '${newStatus}' করা হয়েছে`);
    } catch (e) {
      console.error(e);
      onToast('স্ট্যাটাস আপডেট হতে সমস্যা হয়েছে');
    }
  };

  // Delete Order
  const handleDeleteOrder = async (orderId: string) => {
    if (window.confirm(`আপনি কি সত্যিই অর্ডারটি (${orderId}) ডিলিট করতে চান?`)) {
      const updated = orders.filter(o => o.orderId !== orderId);
      setOrders(updated);
      await deleteOrderFromFirestore(orderId);
      localStorage.setItem('tanu_orders', JSON.stringify(updated));
      onToast('অর্ডার ডিলিট করা হয়েছে');
    }
  };

  // Billing Item Operations
  const handleAddBillItem = () => {
    setBillItems(prev => [
      ...prev,
      { productId: `custom-${Date.now()}`, productTitle: '', quantity: 1, price: 500 }
    ]);
  };

  const handleRemoveBillItem = (index: number) => {
    if (billItems.length > 1) {
      setBillItems(prev => prev.filter((_, i) => i !== index));
    }
  };

  const handleBillItemChange = (index: number, field: keyof OrderItem, value: any) => {
    setBillItems(prev => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  };

  const handleSelectProductForBill = (index: number, prodId: string) => {
    const selectedProd = products.find(p => p.id === prodId);
    if (selectedProd) {
      setBillItems(prev => {
        const updated = [...prev];
        updated[index] = {
          ...updated[index],
          productId: selectedProd.id,
          productTitle: selectedProd.titleBn,
          price: selectedProd.price,
        };
        return updated;
      });
    }
  };

  // Calculations for Manual Bill
  const billSubtotal = useMemo(() => {
    return billItems.reduce((sum, it) => sum + ((it.price || 0) * (it.quantity || 1)), 0);
  }, [billItems]);

  const billGrandTotal = Math.max(0, billSubtotal - (billDiscount || 0));
  const parsedPaid = billPaidAmount !== '' ? Number(billPaidAmount) : billGrandTotal;
  const billDueAmount = Math.max(0, billGrandTotal - parsedPaid);

  // Submit Manual Bill & Save to Firebase
  const handleSaveManualBill = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!billCustomerName.trim() || !billCustomerPhone.trim()) {
      onToast('অনুগ্রহ করে কাস্টমারের নাম ও মোবাইল নম্বর লিখুন');
      return;
    }
    if (billItems.some(it => !it.productTitle.trim() || it.price <= 0)) {
      onToast('অনুগ্রহ করে প্রতিটি আইটেমের নাম ও সঠিক মূল্য দিন');
      return;
    }

    setIsSavingBill(true);
    const invoiceId = `TB-INV-${Math.floor(100000 + Math.random() * 900000)}`;

    const newBillOrder: Order = {
      orderId: invoiceId,
      createdAt: new Date().toISOString(),
      customerName: billCustomerName.trim(),
      phone: billCustomerPhone.trim(),
      address: billCustomerAddress.trim() || 'নাটিয়াপাড়া, দেলদুয়ার',
      district: billCustomerDistrict.trim() || 'টাঙ্গাইল',
      orderType: 'manual_bill',
      items: billItems.map(it => ({
        productId: it.productId || `prod-${Date.now()}`,
        productTitle: it.productTitle,
        quantity: Number(it.quantity) || 1,
        price: Number(it.price) || 0,
      })),
      subtotal: billSubtotal,
      deliveryFee: 0,
      discount: billDiscount,
      totalAmount: billGrandTotal,
      paidAmount: parsedPaid,
      dueAmount: billDueAmount,
      paymentMethod: billPaymentMethod,
      status: 'delivered', // Manual bills are usually done on spot
      notes: billNotes.trim(),
      trackingHistory: [
        {
          status: 'confirmed',
          titleBn: 'বিল তৈরি ও এন্ট্রি',
          timestamp: new Date().toLocaleTimeString('bn-BD', { hour: '2-digit', minute: '2-digit' }),
          descriptionBn: 'ম্যানুয়াল বিল তৈরি করা হয়েছে।',
          completed: true,
        },
        {
          status: 'delivered',
          titleBn: 'সার্ভিস সম্পন্ন ও রিসিট প্রদান',
          timestamp: new Date().toLocaleTimeString('bn-BD', { hour: '2-digit', minute: '2-digit' }),
          descriptionBn: 'পেমেন্ট গ্রহণ ও কাস্টমার কপি প্রস্তুত।',
          completed: true,
        }
      ]
    };

    try {
      // 1. Save to Firebase Firestore
      await saveOrderToFirestore(newBillOrder);

      // 2. Save locally
      const updated = [newBillOrder, ...orders];
      setOrders(updated);
      localStorage.setItem('tanu_orders', JSON.stringify(updated));

      onToast(`ইনভয়েস (${invoiceId}) সফলভাবে সেভ হয়েছে!`);

      // 3. Open A4 print invoice directly
      setPrintInvoiceOrder(newBillOrder);

      // Reset form for next bill
      setBillCustomerName('');
      setBillCustomerPhone('');
      setBillCustomerAddress('');
      setBillDiscount(0);
      setBillPaidAmount('');
      setBillNotes('');
      setBillItems([
        { productId: products[0]?.id || 'custom-1', productTitle: products[0]?.titleBn || 'সিএসএ লেজার ট্রিটমেন্ট', quantity: 1, price: products[0]?.price || 1500 }
      ]);
    } catch (err) {
      console.error(err);
      onToast('বিল সেভ করতে সমস্যা হয়েছে');
    } finally {
      setIsSavingBill(false);
    }
  };

// Convert Bengali numerals to English numerals
function convertBnToEnDigits(str: string): string {
  if (!str) return '';
  const bnToEn: Record<string, string> = {
    '০': '0', '১': '1', '২': '2', '৩': '3', '৪': '4',
    '৫': '5', '৬': '6', '৭': '7', '৮': '8', '৯': '9'
  };
  return str.replace(/[০-৯]/g, (d) => bnToEn[d] || d);
}

function cleanStr(str: string): string {
  if (!str) return '';
  return convertBnToEnDigits(str).replace(/[\s\-_#,:;./\\]/g, '').toLowerCase().trim();
}

  // Filtered Orders List
  const filteredOrders = useMemo(() => {
    return orders.filter(order => {
      const rawQ = orderSearchQuery.trim();
      if (!rawQ) {
        return orderStatusFilter === 'all' || order.status === orderStatusFilter;
      }

      const cleanQ = cleanStr(rawQ);
      const cleanOrderId = cleanStr(order.orderId || '');
      const cleanPhone = cleanStr(order.phone || '');
      const cleanName = (order.customerName || '').toLowerCase().trim();
      const rawQNorm = convertBnToEnDigits(rawQ).toLowerCase().trim();

      const queryDigits = cleanQ.replace(/\D/g, '');
      const orderDigits = cleanOrderId.replace(/\D/g, '');
      const phoneDigits = cleanPhone.replace(/\D/g, '');

      const matchOrderId = cleanOrderId && (cleanOrderId.includes(cleanQ) || cleanQ.includes(cleanOrderId));
      const matchDigits = queryDigits.length >= 3 && orderDigits && (orderDigits.includes(queryDigits) || queryDigits.includes(orderDigits));
      const matchPhone = (cleanPhone && cleanPhone.includes(cleanQ)) || (queryDigits.length >= 4 && phoneDigits && (phoneDigits.includes(queryDigits) || queryDigits.includes(phoneDigits)));
      const matchName = cleanName && (cleanName.includes(rawQNorm) || rawQNorm.includes(cleanName));

      const matchQuery = matchOrderId || matchDigits || matchPhone || matchName;
      const matchStatus = orderStatusFilter === 'all' || order.status === orderStatusFilter;
      return matchQuery && matchStatus;
    });
  }, [orders, orderSearchQuery, orderStatusFilter]);

  // Customer Statement Calculation based on search query
  const statementCustomerData = useMemo(() => {
    const rawQ = statementPhoneQuery.trim();
    if (!rawQ) return null;

    const cleanQ = cleanStr(rawQ);
    const queryDigits = cleanQ.replace(/\D/g, '');
    const rawQNorm = convertBnToEnDigits(rawQ).toLowerCase().trim();

    const matchedOrders = orders.filter(o => {
      const cleanPhone = cleanStr(o.phone || '');
      const phoneDigits = cleanPhone.replace(/\D/g, '');
      const cleanName = (o.customerName || '').toLowerCase().trim();

      if (cleanPhone && cleanPhone.includes(cleanQ)) return true;
      if (queryDigits.length >= 4 && phoneDigits && (phoneDigits.includes(queryDigits) || queryDigits.includes(phoneDigits))) return true;
      if (cleanName && (cleanName.includes(rawQNorm) || rawQNorm.includes(cleanName))) return true;
      return false;
    });

    if (matchedOrders.length === 0) return null;

    const latestOrder = matchedOrders[0];
    const totalSpent = matchedOrders.reduce((sum, o) => sum + (o.totalAmount || 0), 0);
    const totalPaid = matchedOrders.reduce((sum, o) => sum + (o.paidAmount !== undefined ? o.paidAmount : (o.totalAmount || 0)), 0);
    const totalDue = matchedOrders.reduce((sum, o) => sum + (o.dueAmount || 0), 0);

    // List of all items taken
    const allServices: { title: string; count: number; total: number }[] = [];
    matchedOrders.forEach(o => {
      o.items.forEach(it => {
        const existing = allServices.find(s => s.title === it.productTitle);
        if (existing) {
          existing.count += it.quantity;
          existing.total += (it.price * it.quantity);
        } else {
          allServices.push({ title: it.productTitle, count: it.quantity, total: (it.price * it.quantity) });
        }
      });
    });

    return {
      customerName: latestOrder.customerName,
      phone: latestOrder.phone,
      address: latestOrder.address,
      district: latestOrder.district,
      totalOrdersCount: matchedOrders.length,
      totalSpent,
      totalPaid,
      totalDue,
      ordersList: matchedOrders,
      servicesSummary: allServices,
    };
  }, [orders, statementPhoneQuery]);

  // Filtered Services and Products for Admin Management Tab
  const filteredAdminProducts = useMemo(() => {
    return products.filter((p) => {
      const isProduct = isProductItem(p);
      if (adminDivisionFilter === 'products' && !isProduct) return false;
      if (adminDivisionFilter === 'services' && isProduct) return false;

      if (serviceCategoryFilter !== 'all' && p.category !== serviceCategoryFilter) {
        return false;
      }
      if (serviceSearchQuery.trim()) {
        const q = serviceSearchQuery.toLowerCase().trim();
        const matchBn = (p.titleBn || '').toLowerCase().includes(q);
        const matchEn = (p.title || '').toLowerCase().includes(q);
        const matchCat = (p.categoryBn || '').toLowerCase().includes(q);
        const matchDesc = (p.descriptionBn || '').toLowerCase().includes(q);
        return matchBn || matchEn || matchCat || matchDesc;
      }
      return true;
    });
  }, [products, adminDivisionFilter, serviceCategoryFilter, serviceSearchQuery]);

  // Save Parlour Settings
  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    localStorage.setItem('tanu_parlour_info', JSON.stringify(parlourInfo));
    try {
      await saveAppSettingsToFirestore({
        parlourInfo,
        qrTextMemoEnabled,
      });
      onToast('পার্লার তথ্য ও সেটিংস সফলভাবে ক্লাউড ফায়ারবেসে সংরক্ষিত হয়েছে');
    } catch {
      onToast('পার্লার তথ্য সংরক্ষিত হয়েছে');
    }
  };

  // Toggle QR Code View Option (On = Text memo with no URL, Off = Receipt URL)
  const handleToggleQrMode = async (enabled: boolean) => {
    setQrTextMemoEnabled(enabled);
    localStorage.setItem('tanu_qr_text_memo', JSON.stringify(enabled));
    setIsUpdatingQrOption(true);
    try {
      const success = await saveAppSettingsToFirestore({
        qrTextMemoEnabled: enabled,
        parlourInfo,
      });
      if (success) {
        onToast(
          enabled
            ? '✅ QR কোড ভিউ "On": সরাসরি টেক্সট মেমো মোড চালু হয়েছে (URL লুকানো থাকবে)'
            : '🌐 QR কোড ভিউ "Off": সুরক্ষিত রিসিট URL মোড চালু হয়েছে'
        );
      } else {
        onToast('লোকাল সেভ হয়েছে, তবে ফায়ারবেস ক্লাউডে সিঙ্ক নিশ্চিত করা যায়নি');
      }
    } catch (err) {
      console.error('Error saving QR view setting:', err);
      onToast('সেটিংস পরিবর্তন সেভ করার সময় সমস্যা হয়েছে');
    } finally {
      setIsUpdatingQrOption(false);
    }
  };

  // If not authenticated, show Login Screen with 3795 code prompt
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-3xl shadow-xl border border-slate-200 p-8 space-y-6">
          <div className="text-center space-y-2">
            <div className="w-14 h-14 bg-rose-50 text-rose-600 rounded-2xl flex items-center justify-center mx-auto border border-rose-100 shadow-2xs">
              <Lock className="w-7 h-7" />
            </div>
            <h2 className="text-xl font-bold text-slate-900">এডমিন লগইন</h2>
            <p className="text-xs text-slate-500">
              তনু বিউটি পার্লার ও লেজার সেন্টারের নিয়ন্ত্রণ প্যানেল
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700">
                এডমিন পাসকোড লিখুন:
              </label>
              <input
                type="password"
                name="admin_secret_code"
                autoComplete="new-password"
                placeholder="গোপন পাসকোড লিখুন..."
                value={passwordInput}
                onChange={(e) => setPasswordInput(e.target.value)}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:ring-2 focus:ring-rose-500 focus:border-rose-500 text-sm font-mono text-center tracking-widest outline-none"
                autoFocus
              />
            </div>

            {loginError && (
              <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{loginError}</span>
              </div>
            )}

            <button
              type="submit"
              className="w-full py-3 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs sm:text-sm rounded-xl transition-colors cursor-pointer shadow-xs"
            >
              লগইন করুন
            </button>
          </form>

          <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
            <button
              onClick={onBackToWebsite}
              className="text-slate-600 hover:text-slate-900 font-semibold flex items-center gap-1 cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>ওয়েবসাইটে ফিরুন</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col font-['Anek_Bangla',sans-serif] antialiased">
      
      {/* Top Admin Header */}
      <header className="bg-slate-900 text-white px-3.5 sm:px-6 py-3 sticky top-0 z-30 shadow-md">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-2">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-xl bg-rose-600 flex items-center justify-center font-bold text-sm text-white shrink-0 shadow-xs">
              তনু
            </div>
            <div className="min-w-0">
              <h1 className="font-bold text-xs sm:text-base leading-tight truncate">
                তনু বিউটি পার্লার ও লেজার এডমিন
              </h1>
              <span className="text-[10px] text-rose-400 font-medium hidden sm:block truncate">
                সিএসএ লেজার ম্যানেজমেন্ট ও বিলিং সিস্টেম
              </span>
            </div>
          </div>

          <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
            <button
              onClick={onBackToWebsite}
              className="px-2.5 sm:px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer border border-slate-700"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">ওয়েবসাইট দেখুন</span>
            </button>

            <button
              onClick={handleLogout}
              className="px-2.5 sm:px-3 py-1.5 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 hover:text-white text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer border border-rose-500/30"
              title="লগআউট"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">লগআউট</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Admin Sub-Navigation: Responsive 4-Column Icon Grid on Mobile, Sleek Horizontal Tabs on Desktop */}
      <div className="bg-white border-b border-slate-200 sticky top-12 sm:top-14 z-20 shadow-2xs">
        
        {/* MOBILE & MINI-TABLET: 4-COLUMN ICON GRID (সহজে বুঝার জন্য প্রতি সারিতে ৪ টি করে আইকন গ্রিড) */}
        <div className="md:hidden px-2 py-2 bg-slate-50/70 border-b border-slate-100">
          <div className="grid grid-cols-4 gap-1.5 sm:gap-2">
            
            {/* 1. ড্যাশবোর্ড */}
            <button
              onClick={() => setActiveTab('overview')}
              className={`flex flex-col items-center justify-center py-2 px-1 rounded-xl transition-all cursor-pointer relative text-center select-none ${
                activeTab === 'overview'
                  ? 'bg-rose-600 text-white shadow-xs ring-2 ring-rose-500/30'
                  : 'bg-white hover:bg-slate-100 text-slate-700 border border-slate-200/80 shadow-2xs'
              }`}
            >
              <LayoutDashboard className={`w-4 h-4 sm:w-5 sm:h-5 mb-1 ${activeTab === 'overview' ? 'text-white' : 'text-slate-700'}`} />
              <span className={`text-[10.5px] sm:text-xs leading-tight font-bold ${activeTab === 'overview' ? 'text-white' : 'text-slate-800'}`}>
                ড্যাশবোর্ড
              </span>
            </button>

            {/* 2. বুকিং ও অর্ডার */}
            <button
              onClick={() => setActiveTab('orders')}
              className={`flex flex-col items-center justify-center py-2 px-1 rounded-xl transition-all cursor-pointer relative text-center select-none ${
                activeTab === 'orders'
                  ? 'bg-rose-600 text-white shadow-xs ring-2 ring-rose-500/30'
                  : 'bg-white hover:bg-slate-100 text-slate-700 border border-slate-200/80 shadow-2xs'
              }`}
            >
              <div className="relative mb-1">
                <ClipboardList className={`w-4 h-4 sm:w-5 sm:h-5 ${activeTab === 'orders' ? 'text-white' : 'text-amber-600'}`} />
                {orders.length > 0 && (
                  <span className={`absolute -top-1.5 -right-2 px-1 py-0.2 rounded-full text-[9px] font-black leading-none ${
                    activeTab === 'orders' ? 'bg-white text-rose-600' : 'bg-rose-600 text-white'
                  }`}>
                    {orders.length}
                  </span>
                )}
              </div>
              <span className={`text-[10px] sm:text-xs leading-tight font-bold ${activeTab === 'orders' ? 'text-white' : 'text-slate-800'}`}>
                বুকিং ও অর্ডার {orders.length > 0 ? `(${orders.length})` : ''}
              </span>
            </button>

            {/* 3. অ্যাপয়েন্টমেন্ট এন্ট্রি ও ড্যাশবোর্ড */}
            <button
              onClick={() => setActiveTab('appointments')}
              className={`flex flex-col items-center justify-center py-2 px-1 rounded-xl transition-all cursor-pointer relative text-center select-none ${
                activeTab === 'appointments'
                  ? 'bg-rose-600 text-white shadow-xs ring-2 ring-rose-500/30'
                  : 'bg-white hover:bg-slate-100 text-slate-700 border border-slate-200/80 shadow-2xs'
              }`}
            >
              <Calendar className={`w-4 h-4 sm:w-5 sm:h-5 mb-1 ${activeTab === 'appointments' ? 'text-white' : 'text-rose-600'}`} />
              <span className={`text-[10px] sm:text-xs leading-tight font-bold ${activeTab === 'appointments' ? 'text-white' : 'text-rose-700'}`}>
                অ্যাপয়েন্টমেন্ট
              </span>
            </button>

            {/* 4. নতুন বিলিং ও POS */}
            <button
              onClick={() => setActiveTab('billing')}
              className={`flex flex-col items-center justify-center py-2 px-1 rounded-xl transition-all cursor-pointer relative text-center select-none ${
                activeTab === 'billing'
                  ? 'bg-rose-600 text-white shadow-xs ring-2 ring-rose-500/30'
                  : 'bg-white hover:bg-slate-100 text-slate-700 border border-slate-200/80 shadow-2xs'
              }`}
            >
              <Receipt className={`w-4 h-4 sm:w-5 sm:h-5 mb-1 ${activeTab === 'billing' ? 'text-white' : 'text-emerald-600'}`} />
              <span className={`text-[10.5px] sm:text-xs leading-tight font-bold ${activeTab === 'billing' ? 'text-white' : 'text-emerald-800'}`}>
                বিলিং ও POS
              </span>
            </button>

            {/* 5. কাস্টমার হিস্ট্রি */}
            <button
              onClick={() => setActiveTab('statements')}
              className={`flex flex-col items-center justify-center py-2 px-1 rounded-xl transition-all cursor-pointer relative text-center select-none ${
                activeTab === 'statements'
                  ? 'bg-rose-600 text-white shadow-xs ring-2 ring-rose-500/30'
                  : 'bg-white hover:bg-slate-100 text-slate-700 border border-slate-200/80 shadow-2xs'
              }`}
            >
              <Users className={`w-4 h-4 sm:w-5 sm:h-5 mb-1 ${activeTab === 'statements' ? 'text-white' : 'text-blue-600'}`} />
              <span className={`text-[10.5px] sm:text-xs leading-tight font-bold ${activeTab === 'statements' ? 'text-white' : 'text-slate-800'}`}>
                কাস্টমার হিস্ট্রি
              </span>
            </button>

            {/* 6. সার্ভিস ও স্টক */}
            <button
              onClick={() => setActiveTab('services')}
              className={`flex flex-col items-center justify-center py-2 px-1 rounded-xl transition-all cursor-pointer relative text-center select-none ${
                activeTab === 'services'
                  ? 'bg-rose-600 text-white shadow-xs ring-2 ring-rose-500/30'
                  : 'bg-white hover:bg-slate-100 text-slate-700 border border-slate-200/80 shadow-2xs'
              }`}
            >
              <Sparkles className={`w-4 h-4 sm:w-5 sm:h-5 mb-1 ${activeTab === 'services' ? 'text-white' : 'text-purple-600'}`} />
              <span className={`text-[10.5px] sm:text-xs leading-tight font-bold ${activeTab === 'services' ? 'text-white' : 'text-slate-800'}`}>
                সার্ভিস ও স্টক
              </span>
            </button>

            {/* 7. পার্লার সেটিংস */}
            <button
              onClick={() => setActiveTab('settings')}
              className={`flex flex-col items-center justify-center py-2 px-1 rounded-xl transition-all cursor-pointer relative text-center select-none ${
                activeTab === 'settings'
                  ? 'bg-rose-600 text-white shadow-xs ring-2 ring-rose-500/30'
                  : 'bg-white hover:bg-slate-100 text-slate-700 border border-slate-200/80 shadow-2xs'
              }`}
            >
              <Settings className={`w-4 h-4 sm:w-5 sm:h-5 mb-1 ${activeTab === 'settings' ? 'text-white' : 'text-slate-600'}`} />
              <span className={`text-[10.5px] sm:text-xs leading-tight font-bold ${activeTab === 'settings' ? 'text-white' : 'text-slate-800'}`}>
                পার্লার সেটিংস
              </span>
            </button>

            {/* 8. ওয়েবসাইট দেখুন (গ্রিড ব্যালান্স ও দ্রুত ভিজিট) */}
            <button
              onClick={onBackToWebsite}
              className="flex flex-col items-center justify-center py-2 px-1 rounded-xl transition-all cursor-pointer relative text-center select-none bg-white hover:bg-slate-100 text-slate-700 border border-slate-200/80 shadow-2xs"
              title="ওয়েবসাইটে ফিরে যান"
            >
              <Globe className="w-4 h-4 sm:w-5 sm:h-5 mb-1 text-teal-600" />
              <span className="text-[10.5px] sm:text-xs leading-tight font-bold text-slate-800">
                ওয়েবসাইট
              </span>
            </button>

          </div>
        </div>

        {/* DESKTOP / LARGE TABLET VIEW: HORIZONTAL TABS */}
        <div className="hidden md:flex max-w-7xl mx-auto px-4 sm:px-6 items-center gap-1 sm:gap-2 overflow-x-auto no-scrollbar">
          
          <button
            onClick={() => setActiveTab('overview')}
            className={`py-3 px-3.5 text-xs font-bold border-b-2 flex items-center gap-1.5 transition-colors cursor-pointer shrink-0 ${
              activeTab === 'overview'
                ? 'border-rose-600 text-rose-600 bg-rose-50/50'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <LayoutDashboard className="w-4 h-4" />
            <span>ড্যাশবোর্ড</span>
          </button>

          <button
            onClick={() => setActiveTab('orders')}
            className={`py-3 px-3.5 text-xs font-bold border-b-2 flex items-center gap-1.5 transition-colors cursor-pointer shrink-0 ${
              activeTab === 'orders'
                ? 'border-rose-600 text-rose-600 bg-rose-50/50'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <ClipboardList className="w-4 h-4 text-amber-600" />
            <span>বুকিং ও অর্ডার ({orders.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('appointments')}
            className={`py-3 px-3.5 text-xs font-bold border-b-2 flex items-center gap-1.5 transition-colors cursor-pointer shrink-0 ${
              activeTab === 'appointments'
                ? 'border-rose-600 text-rose-600 bg-rose-50/50'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <Calendar className="w-4 h-4 text-rose-600" />
            <span className="font-extrabold text-rose-700">অ্যাপয়েন্টমেন্ট এন্ট্রি ও ড্যাশবোর্ড</span>
          </button>

          <button
            onClick={() => setActiveTab('billing')}
            className={`py-3 px-3.5 text-xs font-bold border-b-2 flex items-center gap-1.5 transition-colors cursor-pointer shrink-0 ${
              activeTab === 'billing'
                ? 'border-rose-600 text-rose-600 bg-rose-50/50'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <Receipt className="w-4 h-4 text-emerald-600" />
            <span className="font-extrabold text-emerald-700">নতুন বিলিং ও POS</span>
          </button>

          <button
            onClick={() => setActiveTab('statements')}
            className={`py-3 px-3.5 text-xs font-bold border-b-2 flex items-center gap-1.5 transition-colors cursor-pointer shrink-0 ${
              activeTab === 'statements'
                ? 'border-rose-600 text-rose-600 bg-rose-50/50'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <Users className="w-4 h-4 text-blue-600" />
            <span>কাস্টমার হিস্ট্রি</span>
          </button>

          <button
            onClick={() => setActiveTab('services')}
            className={`py-3 px-3.5 text-xs font-bold border-b-2 flex items-center gap-1.5 transition-colors cursor-pointer shrink-0 ${
              activeTab === 'services'
                ? 'border-rose-600 text-rose-600 bg-rose-50/50'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <Sparkles className="w-4 h-4 text-purple-600" />
            <span>সার্ভিস ও স্টক</span>
          </button>

          <button
            onClick={() => setActiveTab('settings')}
            className={`py-3 px-3.5 text-xs font-bold border-b-2 flex items-center gap-1.5 transition-colors cursor-pointer shrink-0 ${
              activeTab === 'settings'
                ? 'border-rose-600 text-rose-600 bg-rose-50/50'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <Settings className="w-4 h-4" />
            <span>পার্লার সেটিংস</span>
          </button>

        </div>
      </div>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
        
        {/* ========================================================================= */}
        {/* TAB 1: OVERVIEW DASHBOARD */}
        {/* ========================================================================= */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            
            {/* Quick Metrics Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              
              <div className="p-4 rounded-2xl bg-white border border-slate-200 space-y-1">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">মোট বুকিং ও বিল</span>
                <div className="text-2xl sm:text-3xl font-extrabold text-slate-900">
                  {orders.length} <span className="text-xs text-slate-400 font-normal">টি</span>
                </div>
                <p className="text-[11px] text-emerald-600 font-medium">ফায়ারবেসে সংরক্ষিত</p>
              </div>

              <div className="p-4 rounded-2xl bg-white border border-slate-200 space-y-1">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">মোট বিক্রয় ও আয়</span>
                <div className="text-2xl sm:text-3xl font-extrabold text-slate-900">
                  ৳{orders.reduce((sum, o) => sum + (o.totalAmount || 0), 0).toLocaleString('bn-BD')}
                </div>
                <p className="text-[11px] text-slate-500">সকল বুকিং ও বিল থেকে</p>
              </div>

              <div className="p-4 rounded-2xl bg-white border border-slate-200 space-y-1">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">অপেক্ষমাণ (Pending)</span>
                <div className="text-2xl sm:text-3xl font-extrabold text-amber-600">
                  {orders.filter(o => o.status === 'pending').length} <span className="text-xs text-slate-400 font-normal">টি</span>
                </div>
                <p className="text-[11px] text-amber-700">কনফার্মেশনের অপেক্ষায়</p>
              </div>

              <div className="p-4 rounded-2xl bg-white border border-slate-200 space-y-1">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">সম্পন্ন সার্ভিস</span>
                <div className="text-2xl sm:text-3xl font-extrabold text-emerald-700">
                  {orders.filter(o => o.status === 'delivered' || o.status === 'confirmed').length} <span className="text-xs text-slate-400 font-normal">টি</span>
                </div>
                <p className="text-[11px] text-emerald-700">সফল গ্রাহক সেবা</p>
              </div>

            </div>

            {/* Quick Actions Bar */}
            <div className="p-5 rounded-2xl bg-gradient-to-r from-slate-900 to-slate-800 text-white flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="space-y-1 text-center sm:text-left">
                <h3 className="font-bold text-base text-white">নতুন কাস্টমারের বিল তৈরি করতে চান?</h3>
                <p className="text-xs text-slate-300">
                  সরাসরি কাস্টমারের ফোন নম্বর লিখে ম্যানুয়াল বিলিং ও A4 ইনভয়েস প্রিন্ট করুন।
                </p>
              </div>

              <button
                onClick={() => setActiveTab('billing')}
                className="px-5 py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-xl flex items-center gap-2 transition-colors cursor-pointer shrink-0 shadow-xs"
              >
                <Receipt className="w-4 h-4" />
                <span>নতুন বিলিং শুরু করুন</span>
              </button>
            </div>

            {/* Recent Bookings Table */}
            <div className="bg-white rounded-2xl border border-slate-200 p-5 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-sm text-slate-900">সাম্প্রতিক ৫টি বুকিং ও বিল</h3>
                <button
                  onClick={() => setActiveTab('orders')}
                  className="text-xs font-semibold text-rose-600 hover:underline"
                >
                  সবগুলো দেখুন →
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200">
                    <tr>
                      <th className="py-2.5 px-3">আইডি</th>
                      <th className="py-2.5 px-3">গ্রাহক</th>
                      <th className="py-2.5 px-3">সার্ভিস</th>
                      <th className="py-2.5 px-3 text-right">টাকা</th>
                      <th className="py-2.5 px-3 text-center">স্ট্যাটাস</th>
                      <th className="py-2.5 px-3 text-right">অ্যাকশন</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {orders.slice(0, 5).map(o => (
                      <tr key={o.orderId} className="hover:bg-slate-50/50">
                        <td className="py-2.5 px-3 font-mono font-bold text-slate-900">{o.orderId}</td>
                        <td className="py-2.5 px-3 font-medium text-slate-800">{o.customerName} ({o.phone})</td>
                        <td className="py-2.5 px-3 text-slate-600 truncate max-w-xs">{o.items.map(i => i.productTitle).join(', ')}</td>
                        <td className="py-2.5 px-3 text-right font-bold text-slate-900">৳{o.totalAmount.toLocaleString('bn-BD')}</td>
                        <td className="py-2.5 px-3 text-center">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            o.status === 'delivered' ? 'bg-emerald-100 text-emerald-800' :
                            o.status === 'confirmed' ? 'bg-blue-100 text-blue-800' :
                            'bg-amber-100 text-amber-800'
                          }`}>
                            {o.status === 'delivered' ? 'সম্পন্ন' : o.status === 'confirmed' ? 'গৃহীত' : 'পেন্ডিং'}
                          </span>
                        </td>
                        <td className="py-2.5 px-3 text-right">
                          <button
                            onClick={() => setPrintInvoiceOrder(o)}
                            className="p-1.5 text-slate-600 hover:text-rose-600 transition-colors cursor-pointer"
                            title="A4 ইনভয়েস প্রিন্ট"
                          >
                            <Printer className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 2: ORDERS & BOOKINGS LIST */}
        {/* ========================================================================= */}
        {activeTab === 'orders' && (
          <div className="space-y-4">
            
            {/* Filter & Search Bar */}
            <div className="bg-white p-4 rounded-2xl border border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="relative flex-1 w-full">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="মোবাইল নম্বর, নাম বা আইডি দিয়ে খুঁজুন..."
                  value={orderSearchQuery}
                  onChange={(e) => setOrderSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:ring-1 focus:ring-rose-500 focus:bg-white"
                />
              </div>

              {/* Status Filter */}
              <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto no-scrollbar">
                {['all', 'pending', 'confirmed', 'delivered'].map((st) => (
                  <button
                    key={st}
                    onClick={() => setOrderStatusFilter(st)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold shrink-0 transition-colors cursor-pointer border ${
                      orderStatusFilter === st
                        ? 'bg-slate-900 text-white border-slate-900'
                        : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    {st === 'all' ? 'সবগুলো' : st === 'pending' ? 'পেন্ডিং' : st === 'confirmed' ? 'গৃহীত' : 'সম্পন্ন'}
                  </button>
                ))}
              </div>
            </div>

            {/* Orders Feed / Table */}
            <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
              <div className="p-4 border-b border-slate-200 flex items-center justify-between text-xs text-slate-500">
                <span>মোট প্রাপ্ত বুকিং: <b>{filteredOrders.length}</b> টি</span>
                <span className="text-emerald-700 font-medium">ফায়ারবেসে লাইভ কানেক্টেড</span>
              </div>

              {filteredOrders.length === 0 ? (
                <div className="py-12 text-center text-slate-400 text-xs">
                  কোনো বুকিং বা অর্ডার পাওয়া যায়নি।
                </div>
              ) : (
                <>
                  {/* Mobile Cards Feed for Mobile Screens */}
                  <div className="block sm:hidden divide-y divide-slate-100">
                    {filteredOrders.map(o => (
                      <div key={o.orderId} className="p-4 space-y-3 hover:bg-slate-50/70 transition-colors">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <div className="flex items-center gap-1.5">
                              <span className="font-mono font-bold text-slate-900 text-xs">{o.orderId}</span>
                              {o.orderType === 'manual_bill' && (
                                <span className="text-[9px] bg-slate-100 text-slate-700 font-semibold px-1.5 py-0.2 rounded">
                                  ম্যানুয়াল বিল
                                </span>
                              )}
                            </div>
                            <span className="text-[10px] text-slate-400">
                              {new Date(o.createdAt).toLocaleDateString('bn-BD', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>

                          <div className="text-right">
                            <span className="text-sm font-extrabold text-slate-900 block">৳{o.totalAmount.toLocaleString('bn-BD')}</span>
                            <span className="text-[10px] text-slate-500">
                              {o.paymentMethod === 'cod' ? 'ক্যাশ অন ডেলিভারি' : o.paymentMethod}
                            </span>
                          </div>
                        </div>

                        {/* Customer details */}
                        <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200 space-y-1">
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-slate-900 text-xs">{o.customerName}</span>
                            <a
                              href={`tel:${o.phone}`}
                              className="inline-flex items-center gap-1 text-xs font-mono font-bold text-rose-600 bg-rose-50 px-2 py-0.5 rounded-md border border-rose-200"
                            >
                              <Phone className="w-3 h-3 text-rose-600" />
                              <span>{o.phone}</span>
                            </a>
                          </div>
                          {o.address && (
                            <p className="text-[11px] text-slate-600 truncate">{o.address}</p>
                          )}
                        </div>

                        {/* Items */}
                        <div className="space-y-1 text-xs text-slate-700">
                          {o.items.map((it, idx) => (
                            <div key={idx} className="flex justify-between items-center text-[11px]">
                              <span className="truncate pr-2">• {it.productTitle}</span>
                              <span className="font-semibold text-slate-500 shrink-0">x{it.quantity} (৳{(it.price * it.quantity).toLocaleString('bn-BD')})</span>
                            </div>
                          ))}
                        </div>

                        {/* Status Select & Actions */}
                        <div className="flex items-center justify-between gap-2 pt-2 border-t border-slate-100">
                          <div className="flex-1">
                            <select
                              value={o.status}
                              onChange={(e) => handleStatusChange(o.orderId, e.target.value as Order['status'])}
                              className={`w-full text-[11px] font-bold py-1.5 px-2 rounded-lg border outline-none cursor-pointer ${
                                o.status === 'delivered' ? 'bg-emerald-50 text-emerald-800 border-emerald-300' :
                                o.status === 'confirmed' ? 'bg-blue-50 text-blue-800 border-blue-300' :
                                'bg-amber-50 text-amber-800 border-amber-300'
                              }`}
                            >
                              <option value="pending">অপেক্ষমাণ (পেন্ডিং)</option>
                              <option value="confirmed">গৃহীত ও নিশ্চিত</option>
                              <option value="processing">প্রক্রিয়াধীন</option>
                              <option value="delivered">সম্পন্ন / ডেলিভার্ড</option>
                            </select>
                          </div>

                          <button
                            onClick={() => setPrintInvoiceOrder(o)}
                            className="px-2.5 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white font-semibold text-[11px] inline-flex items-center gap-1 transition-colors cursor-pointer shrink-0"
                            title="A4 ইনভয়েস প্রিন্ট"
                          >
                            <Printer className="w-3.5 h-3.5" />
                            <span>ইনভয়েস</span>
                          </button>

                          <button
                            onClick={() => handleDeleteOrder(o.orderId)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer border border-slate-200"
                            title="ডিলিট"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Desktop Table View */}
                  <div className="hidden sm:block overflow-x-auto">
                    <table className="w-full text-left text-xs min-w-[640px]">
                      <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200">
                        <tr>
                          <th className="py-3 px-3.5">তারিখ ও আইডি</th>
                          <th className="py-3 px-3.5">গ্রাহক বিবরণ</th>
                          <th className="py-3 px-3.5">সার্ভিস ও আইটেম</th>
                          <th className="py-3 px-3.5 text-right">মোট বিল</th>
                          <th className="py-3 px-3.5 text-center">স্ট্যাটাস পরিবর্তন</th>
                          <th className="py-3 px-3.5 text-right">অ্যাকশন</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {filteredOrders.map(o => (
                          <tr key={o.orderId} className="hover:bg-slate-50/60 transition-colors">
                            <td className="py-3 px-3.5 space-y-0.5">
                              <span className="font-mono font-bold text-slate-900 block">{o.orderId}</span>
                              <span className="text-[10px] text-slate-400">
                                {new Date(o.createdAt).toLocaleDateString('bn-BD', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                              </span>
                              {o.orderType === 'manual_bill' && (
                                <span className="inline-block text-[9px] bg-slate-100 text-slate-700 font-semibold px-1.5 py-0.5 rounded">
                                  ম্যানুয়াল বিল
                                </span>
                              )}
                            </td>

                            <td className="py-3 px-3.5 space-y-0.5">
                              <span className="font-bold text-slate-900 block">{o.customerName}</span>
                              <a href={`tel:${o.phone}`} className="text-slate-600 hover:text-rose-600 font-mono block">
                                {o.phone}
                              </a>
                              <span className="text-[10px] text-slate-400 block truncate max-w-xs">{o.address}</span>
                            </td>

                            <td className="py-3 px-3.5 space-y-1">
                              {o.items.map((it, idx) => (
                                <div key={idx} className="text-slate-700">
                                  <span>• {it.productTitle}</span>
                                  <span className="text-slate-400 text-[10px] ml-1">x{it.quantity}</span>
                                </div>
                              ))}
                            </td>

                            <td className="py-3 px-3.5 text-right font-extrabold text-slate-900">
                              <div>৳{o.totalAmount.toLocaleString('bn-BD')}</div>
                              <div className="text-[10px] text-slate-400 font-normal">
                                {o.paymentMethod === 'cod' ? 'ক্যাশ অন ডেলিভারি' : o.paymentMethod}
                              </div>
                            </td>

                            <td className="py-3 px-3.5 text-center">
                              <select
                                value={o.status}
                                onChange={(e) => handleStatusChange(o.orderId, e.target.value as Order['status'])}
                                className={`text-[11px] font-bold py-1 px-2.5 rounded-lg border outline-none cursor-pointer ${
                                  o.status === 'delivered' ? 'bg-emerald-50 text-emerald-800 border-emerald-300' :
                                  o.status === 'confirmed' ? 'bg-blue-50 text-blue-800 border-blue-300' :
                                  'bg-amber-50 text-amber-800 border-amber-300'
                                }`}
                              >
                                <option value="pending">অপেক্ষমাণ (পেন্ডিং)</option>
                                <option value="confirmed">গৃহীত ও নিশ্চিত</option>
                                <option value="processing">প্রক্রিয়াধীন</option>
                                <option value="delivered">সম্পন্ন / ডেলিভার্ড</option>
                              </select>
                            </td>

                            <td className="py-3 px-3.5 text-right space-x-1">
                              <button
                                onClick={() => setPrintInvoiceOrder(o)}
                                className="px-2.5 py-1.5 rounded-lg bg-slate-100 hover:bg-rose-50 text-slate-700 hover:text-rose-600 font-semibold text-[11px] inline-flex items-center gap-1 transition-colors cursor-pointer border border-slate-200"
                                title="A4 সাইজ ইনভয়েস প্রিন্ট"
                              >
                                <Printer className="w-3.5 h-3.5" />
                                <span>ইনভয়েস</span>
                              </button>

                              <button
                                onClick={() => handleDeleteOrder(o.orderId)}
                                className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                                title="ডিলিট করুন"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </>
              )}
            </div>

          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB: APPOINTMENT ENTRY & DASHBOARD */}
        {/* ========================================================================= */}
        {activeTab === 'appointments' && (
          <AppointmentManager
            onToast={onToast}
            onOpenManualBilling={(customerData) => {
              setBillCustomerName(customerData.name);
              setBillCustomerPhone(customerData.phone);
              setBillNotes(`অ্যাপয়েন্টমেন্ট সেবা: ${customerData.service}`);
              setActiveTab('billing');
            }}
          />
        )}

        {/* ========================================================================= */}
        {/* TAB 3: MANUAL BILLING & POS SYSTEM */}
        {/* ========================================================================= */}
        {activeTab === 'billing' && (
          <div className="space-y-6">
            
            <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-6">
              
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <div className="space-y-0.5">
                  <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                    <Receipt className="w-5 h-5 text-emerald-600" />
                    <span>ম্যানুয়াল বিলিং ও A4 ইনভয়েস জেনারেটর</span>
                  </h2>
                  <p className="text-xs text-slate-500">
                    ফোন নম্বর টাইপ করলেই পূর্বের কাস্টমার রেকর্ড স্বয়ংক্রিয়ভাবে চলে আসবে।
                  </p>
                </div>

                <span className="text-xs font-semibold px-3 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-lg">
                  রিয়েল-টাইম ফায়ারবেস সিঙ্ক
                </span>
              </div>

              <form onSubmit={handleSaveManualBill} className="space-y-6">
                
                {/* Customer Details Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  
                  {/* Phone with Auto-search */}
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-800">
                      কাস্টমার মোবাইল নম্বর <span className="text-rose-600">*</span>
                    </label>
                    <input
                      type="text"
                      placeholder="01XXXXXXXXX"
                      value={billCustomerPhone}
                      onChange={(e) => setBillCustomerPhone(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs sm:text-sm font-medium text-slate-900 focus:bg-white focus:ring-2 focus:ring-emerald-500 outline-none"
                      required
                    />
                    {matchedCustomerInfo && (
                      <div className="p-2 bg-emerald-50 border border-emerald-200 rounded-lg text-[11px] text-emerald-800 flex items-center gap-1.5 animate-in fade-in">
                        <UserCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                        <span>
                          <b>পূর্বের কাস্টমার!</b> ({matchedCustomerInfo.count}টি সার্ভিস নিয়েছেন, মোট: ৳{matchedCustomerInfo.totalSpent.toLocaleString('bn-BD')})
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Name */}
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-800">
                      কাস্টমারের নাম <span className="text-rose-600">*</span>
                    </label>
                    <input
                      type="text"
                      placeholder="যেমন: মোসাঃ সুমি আক্তার"
                      value={billCustomerName}
                      onChange={(e) => setBillCustomerName(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs sm:text-sm font-medium text-slate-900 focus:bg-white focus:ring-2 focus:ring-emerald-500 outline-none"
                      required
                    />
                  </div>

                  {/* Address */}
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-800">
                      ঠিকানা / এলাকা
                    </label>
                    <input
                      type="text"
                      placeholder="নাটিয়াপাড়া, দেলদুয়ার"
                      value={billCustomerAddress}
                      onChange={(e) => setBillCustomerAddress(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs sm:text-sm font-medium text-slate-900 focus:bg-white focus:ring-2 focus:ring-emerald-500 outline-none"
                    />
                  </div>

                </div>

                {/* Items Selection */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-slate-800">
                      সার্ভিস ও পণ্যের তালিকা:
                    </label>
                    <button
                      type="button"
                      onClick={handleAddBillItem}
                      className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-lg flex items-center gap-1 transition-colors cursor-pointer border border-slate-200"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>সার্ভিস যোগ করুন</span>
                    </button>
                  </div>

                  {/* Mobile Item Cards View (Screen < 640px) */}
                  <div className="block sm:hidden space-y-3">
                    {billItems.map((item, index) => (
                      <div key={index} className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-2.5">
                        <div className="flex items-center justify-between">
                          <span className="text-[11px] font-bold text-slate-600">আইটেম #{index + 1}</span>
                          <button
                            type="button"
                            disabled={billItems.length <= 1}
                            onClick={() => handleRemoveBillItem(index)}
                            className="text-slate-400 hover:text-rose-600 disabled:opacity-30 p-1 cursor-pointer"
                            title="মুছুন"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>

                        {/* Preset Dropdown */}
                        <div>
                          <select
                            onChange={(e) => handleSelectProductForBill(index, e.target.value)}
                            className="w-full py-2 px-2.5 bg-white border border-slate-200 rounded-lg text-xs outline-none"
                          >
                            <option value="">-- সার্ভিস ড্রপডাউন নির্বাচন --</option>
                            {products.map(p => (
                              <option key={p.id} value={p.id}>{p.titleBn} (৳{p.price})</option>
                            ))}
                          </select>
                        </div>

                        {/* Custom Title */}
                        <div>
                          <input
                            type="text"
                            value={item.productTitle}
                            onChange={(e) => handleBillItemChange(index, 'productTitle', e.target.value)}
                            placeholder="সার্ভিস বা পণ্যের নাম..."
                            className="w-full py-2 px-2.5 bg-white border border-slate-200 rounded-lg text-xs font-semibold outline-none"
                            required
                          />
                        </div>

                        {/* Price, Quantity, Subtotal in Grid */}
                        <div className="grid grid-cols-3 gap-2 pt-1">
                          <div>
                            <label className="text-[10px] text-slate-500 block mb-0.5">একক রেট (৳)</label>
                            <input
                              type="number"
                              value={item.price}
                              onChange={(e) => handleBillItemChange(index, 'price', Number(e.target.value))}
                              className="w-full py-1.5 px-2 bg-white border border-slate-200 rounded-lg text-xs font-bold text-right outline-none"
                              min={0}
                              required
                            />
                          </div>

                          <div>
                            <label className="text-[10px] text-slate-500 block mb-0.5 text-center">পরিমাণ</label>
                            <input
                              type="number"
                              value={item.quantity}
                              onChange={(e) => handleBillItemChange(index, 'quantity', Math.max(1, Number(e.target.value)))}
                              className="w-full py-1.5 px-2 bg-white border border-slate-200 rounded-lg text-xs font-bold text-center outline-none"
                              min={1}
                              required
                            />
                          </div>

                          <div className="text-right">
                            <label className="text-[10px] text-slate-500 block mb-0.5">মোট টাকা</label>
                            <div className="py-1.5 px-2 bg-white border border-slate-200 rounded-lg text-xs font-extrabold text-slate-900 truncate">
                              ৳{(item.price * item.quantity).toLocaleString('bn-BD')}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Desktop Items Table View (Screen >= 640px) */}
                  <div className="hidden sm:block border border-slate-200 rounded-xl overflow-x-auto">
                    <table className="w-full text-left text-xs min-w-[560px]">
                      <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200">
                        <tr>
                          <th className="py-2.5 px-3">সার্ভিস / আইটেম নির্বাচন</th>
                          <th className="py-2.5 px-3">সার্ভিসের নাম (ম্যানুয়াল পরিবর্তনযোগ্য)</th>
                          <th className="py-2.5 px-3 w-28 text-right">একক রেট (৳)</th>
                          <th className="py-2.5 px-3 w-20 text-center">পরিমাণ</th>
                          <th className="py-2.5 px-3 w-28 text-right">মোট (৳)</th>
                          <th className="py-2.5 px-3 w-10 text-center">মুছুন</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {billItems.map((item, index) => (
                          <tr key={index}>
                            {/* Preset Dropdown */}
                            <td className="py-2 px-3">
                              <select
                                onChange={(e) => handleSelectProductForBill(index, e.target.value)}
                                className="w-full py-1.5 px-2 bg-slate-50 border border-slate-200 rounded-lg text-xs outline-none"
                              >
                                <option value="">-- সার্ভিস ড্রপডাউন --</option>
                                {products.map(p => (
                                  <option key={p.id} value={p.id}>{p.titleBn} (৳{p.price})</option>
                                ))}
                              </select>
                            </td>

                            {/* Title */}
                            <td className="py-2 px-3">
                              <input
                                type="text"
                                value={item.productTitle}
                                onChange={(e) => handleBillItemChange(index, 'productTitle', e.target.value)}
                                placeholder="সার্ভিস বা পণ্যের নাম..."
                                className="w-full py-1.5 px-2 bg-white border border-slate-200 rounded-lg text-xs font-semibold outline-none"
                                required
                              />
                            </td>

                            {/* Price */}
                            <td className="py-2 px-3 text-right">
                              <input
                                type="number"
                                value={item.price}
                                onChange={(e) => handleBillItemChange(index, 'price', Number(e.target.value))}
                                className="w-full py-1.5 px-2 bg-white border border-slate-200 rounded-lg text-xs font-bold text-right outline-none"
                                min={0}
                                required
                              />
                            </td>

                            {/* Quantity */}
                            <td className="py-2 px-3 text-center">
                              <input
                                type="number"
                                value={item.quantity}
                                onChange={(e) => handleBillItemChange(index, 'quantity', Math.max(1, Number(e.target.value)))}
                                className="w-16 py-1.5 px-2 bg-white border border-slate-200 rounded-lg text-xs font-bold text-center outline-none mx-auto"
                                min={1}
                                required
                              />
                            </td>

                            {/* Subtotal */}
                            <td className="py-2 px-3 text-right font-extrabold text-slate-900">
                              ৳{(item.price * item.quantity).toLocaleString('bn-BD')}
                            </td>

                            {/* Delete */}
                            <td className="py-2 px-3 text-center">
                              <button
                                type="button"
                                disabled={billItems.length <= 1}
                                onClick={() => handleRemoveBillItem(index)}
                                className="text-slate-400 hover:text-rose-600 disabled:opacity-30 cursor-pointer p-1"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Calculation, Discount, Payment Method */}
                <div className="grid grid-cols-1 md:grid-cols-12 gap-6 bg-slate-50 p-5 rounded-2xl border border-slate-200">
                  
                  {/* Left: Payment Method & Notes */}
                  <div className="md:col-span-6 space-y-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-800">পেমেন্ট মাধ্যম:</label>
                      <div className="grid grid-cols-3 gap-2">
                        {[
                          { id: 'cash', label: 'ক্যাশ (Cash)' },
                          { id: 'bkash', label: 'বিকাশ (bKash)' },
                          { id: 'nagad', label: 'নগদ (Nagad)' },
                        ].map((m) => (
                          <button
                            key={m.id}
                            type="button"
                            onClick={() => setBillPaymentMethod(m.id as any)}
                            className={`py-2 px-3 rounded-xl text-xs font-bold border transition-colors cursor-pointer text-center ${
                              billPaymentMethod === m.id
                                ? 'bg-slate-900 text-white border-slate-900'
                                : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                            }`}
                          >
                            {m.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-800">অতিরিক্ত নোট / মন্তব্য (ঐচ্ছিক):</label>
                      <input
                        type="text"
                        placeholder="যেমন: ৩য় সেশন সম্পন্ন, বিশেষ ছাড় দেওয়া হয়েছে"
                        value={billNotes}
                        onChange={(e) => setBillNotes(e.target.value)}
                        className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs outline-none"
                      />
                    </div>
                  </div>

                  {/* Right: Calculations */}
                  <div className="md:col-span-6 space-y-2 text-xs">
                    <div className="flex justify-between text-slate-600">
                      <span>সাবটোটাল:</span>
                      <span className="font-bold text-slate-900">৳{billSubtotal.toLocaleString('bn-BD')}</span>
                    </div>

                    <div className="flex items-center justify-between gap-4">
                      <span className="text-slate-600">বিশেষ ছাড় (Discount ৳):</span>
                      <input
                        type="number"
                        min={0}
                        value={billDiscount}
                        onChange={(e) => setBillDiscount(Number(e.target.value))}
                        className="w-28 px-2.5 py-1 bg-white border border-slate-200 rounded-lg text-right font-bold text-rose-700 outline-none"
                      />
                    </div>

                    <div className="flex justify-between border-t border-slate-200 pt-2 text-sm font-extrabold text-slate-900">
                      <span>সর্বমোট প্রদেয় বিল:</span>
                      <span>৳{billGrandTotal.toLocaleString('bn-BD')}</span>
                    </div>

                    <div className="flex items-center justify-between gap-4 pt-1">
                      <span className="text-emerald-800 font-semibold">জমা / পেইড টাকা (Paid ৳):</span>
                      <input
                        type="number"
                        placeholder={billGrandTotal.toString()}
                        value={billPaidAmount}
                        onChange={(e) => setBillPaidAmount(e.target.value)}
                        className="w-28 px-2.5 py-1 bg-white border border-emerald-300 rounded-lg text-right font-bold text-emerald-800 outline-none"
                      />
                    </div>

                    {billDueAmount > 0 ? (
                      <div className="flex justify-between text-rose-700 font-bold">
                        <span>বকেয়া (Due):</span>
                        <span>৳{billDueAmount.toLocaleString('bn-BD')}</span>
                      </div>
                    ) : (
                      <div className="flex justify-between text-emerald-700 font-semibold text-[11px]">
                        <span>পেমেন্ট অবস্থা:</span>
                        <span>পরিশোধিত (Paid)</span>
                      </div>
                    )}
                  </div>

                </div>

                {/* Submit Buttons */}
                <div className="flex items-center justify-end gap-3 pt-2">
                  <button
                    type="submit"
                    disabled={isSavingBill}
                    className="py-3 px-6 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm rounded-xl flex items-center gap-2 transition-colors cursor-pointer shadow-xs disabled:opacity-50"
                  >
                    {isSavingBill ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <>
                        <Printer className="w-4 h-4" />
                        <span>বিল সেভ ও A4 ইনভয়েস প্রিন্ট</span>
                      </>
                    )}
                  </button>
                </div>

              </form>

            </div>

          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 4: CUSTOMER STATEMENT & HISTORY */}
        {/* ========================================================================= */}
        {activeTab === 'statements' && (
          <div className="space-y-6">
            
            <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-6">
              
              <div className="space-y-1">
                <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <Users className="w-5 h-5 text-blue-600" />
                  <span>কাস্টমার স্টেটমেন্ট ও সার্ভিস হিস্ট্রি</span>
                </h2>
                <p className="text-xs text-slate-500">
                  যেকোনো কাস্টমারের মোবাইল নম্বর দিয়ে সার্চ করে তাঁর সর্বমোট খরচ ও নেওয়া সকল সার্ভিসের বিস্তারিত দেখুন।
                </p>
              </div>

              {/* Search Bar */}
              <div className="relative max-w-md">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="কাস্টমার মোবাইল নম্বর বা নাম লিখুন..."
                  value={statementPhoneQuery}
                  onChange={(e) => setStatementPhoneQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs sm:text-sm font-medium focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none"
                  autoFocus
                />
              </div>

              {/* Statement Result Display */}
              {statementCustomerData ? (
                <div className="space-y-6 border-t border-slate-200 pt-6">
                  
                  {/* Customer Profile Summary */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 bg-slate-50 p-4 sm:p-5 rounded-2xl border border-slate-200">
                    <div className="space-y-0.5 col-span-2 sm:col-span-1">
                      <span className="text-[11px] text-slate-400 uppercase font-bold">গ্রাহকের নাম:</span>
                      <p className="text-sm sm:text-base font-extrabold text-slate-900">{statementCustomerData.customerName}</p>
                      <p className="text-xs font-mono text-slate-600">{statementCustomerData.phone}</p>
                      <p className="text-[11px] text-slate-500 truncate">{statementCustomerData.address}</p>
                    </div>

                    <div className="space-y-0.5">
                      <span className="text-[11px] text-slate-400 uppercase font-bold">মোট সার্ভিস গ্রহণ:</span>
                      <p className="text-xl sm:text-2xl font-extrabold text-blue-600">{statementCustomerData.totalOrdersCount} বার</p>
                      <p className="text-[10px] text-slate-500">সেবা গ্রহণ করেছেন</p>
                    </div>

                    <div className="space-y-0.5">
                      <span className="text-[11px] text-slate-400 uppercase font-bold">সর্বমোট খরচ:</span>
                      <p className="text-xl sm:text-2xl font-extrabold text-slate-900">৳{statementCustomerData.totalSpent.toLocaleString('bn-BD')}</p>
                      <p className="text-[10px] text-emerald-700">জমা: ৳{statementCustomerData.totalPaid.toLocaleString('bn-BD')}</p>
                    </div>

                    <div className="space-y-0.5">
                      <span className="text-[11px] text-slate-400 uppercase font-bold">বর্তমান বকেয়া:</span>
                      <p className={`text-xl sm:text-2xl font-extrabold ${statementCustomerData.totalDue > 0 ? 'text-rose-600' : 'text-emerald-700'}`}>
                        ৳{statementCustomerData.totalDue.toLocaleString('bn-BD')}
                      </p>
                      <p className="text-[10px] text-slate-500">
                        {statementCustomerData.totalDue > 0 ? 'বকেয়া রয়েছে' : 'কোনো বকেয়া নেই'}
                      </p>
                    </div>
                  </div>

                  {/* Summary of Services Taken */}
                  <div className="space-y-2">
                    <h3 className="text-xs font-bold text-slate-800">
                      এই কাস্টমার যে যে সার্ভিস গ্রহণ করেছেন:
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                      {statementCustomerData.servicesSummary.map((srv, idx) => (
                        <div key={idx} className="p-3 bg-white border border-slate-200 rounded-xl flex items-center justify-between text-xs">
                          <div>
                            <p className="font-bold text-slate-900">{srv.title}</p>
                            <span className="text-[11px] text-slate-500">মোট নেওয়া হয়েছে: {srv.count} বার</span>
                          </div>
                          <span className="font-bold text-slate-900">৳{srv.total.toLocaleString('bn-BD')}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Detailed Visits History Table */}
                  <div className="space-y-2">
                    <h3 className="text-xs font-bold text-slate-800">
                      ভিজিট ও অর্ডারের তারিখ অনুযায়ী তালিকা:
                    </h3>
                    <div className="border border-slate-200 rounded-xl overflow-x-auto">
                      <table className="w-full text-left text-xs min-w-[540px]">
                        <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200">
                          <tr>
                            <th className="py-2.5 px-3">তারিখ ও বিল আইডি</th>
                            <th className="py-2.5 px-3">সার্ভিসসমূহ</th>
                            <th className="py-2.5 px-3 text-right">বিল টাকা</th>
                            <th className="py-2.5 px-3 text-center">স্ট্যাটাস</th>
                            <th className="py-2.5 px-3 text-right">A4 ইনভয়েস</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {statementCustomerData.ordersList.map((o) => (
                            <tr key={o.orderId} className="hover:bg-slate-50/50">
                              <td className="py-2.5 px-3">
                                <span className="font-mono font-bold text-slate-900 block">{o.orderId}</span>
                                <span className="text-[10px] text-slate-400">
                                  {new Date(o.createdAt).toLocaleDateString('bn-BD', { year: 'numeric', month: 'long', day: 'numeric' })}
                                </span>
                              </td>

                              <td className="py-2.5 px-3 font-medium text-slate-800">
                                {o.items.map(it => `${it.productTitle} (x${it.quantity})`).join(', ')}
                              </td>

                              <td className="py-2.5 px-3 text-right font-bold text-slate-900">
                                ৳{o.totalAmount.toLocaleString('bn-BD')}
                              </td>

                              <td className="py-2.5 px-3 text-center">
                                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                                  {o.status === 'delivered' ? 'সম্পন্ন' : o.status}
                                </span>
                              </td>

                              <td className="py-2.5 px-3 text-right">
                                <button
                                  onClick={() => setPrintInvoiceOrder(o)}
                                  className="px-2.5 py-1 bg-slate-100 hover:bg-rose-50 text-slate-700 hover:text-rose-600 rounded-lg text-xs font-semibold inline-flex items-center gap-1 transition-colors cursor-pointer"
                                >
                                  <Printer className="w-3.5 h-3.5" />
                                  <span>প্রিন্ট</span>
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>

                </div>
              ) : statementPhoneQuery.trim() ? (
                <div className="p-8 text-center bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
                  <AlertCircle className="w-6 h-6 text-slate-400 mx-auto" />
                  <p className="text-xs text-slate-600 font-medium">
                    '{statementPhoneQuery}' নম্বরে কোনো পূর্বের কাস্টমার হিস্ট্রি পাওয়া যায়নি।
                  </p>
                </div>
              ) : (
                <div className="p-8 text-center bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
                  <UserCheck className="w-8 h-8 text-blue-600 mx-auto" />
                  <p className="text-xs text-slate-600 font-medium">
                    উপরে কাস্টমারের ফোন নম্বর লিখে সার্চ করলে তাঁর সমস্ত অতীত লেনদেন ও সার্ভিস হিস্ট্রি প্রদর্শিত হবে।
                  </p>
                </div>
              )}

            </div>

          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 5: SERVICES & STOCK MANAGEMENT */}
        {/* ========================================================================= */}
        {activeTab === 'services' && (
          <div className="space-y-6">
            
            {/* Header & Quick Action Buttons */}
            <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h2 className="text-base sm:text-lg font-bold text-slate-900">
                      সার্ভিস ও পণ্য ব্যবস্থাপনা (Firebase Firestore)
                    </h2>
                    <span className="px-2.5 py-0.5 rounded-full bg-rose-100 text-rose-700 text-xs font-bold">
                      মোট {products.length} টি
                    </span>
                  </div>
                  <p className="text-xs text-slate-500">
                    পণ্য (অনলাইন/অফলাইন ডেলিভারিযোগ্য) ও পার্লার সার্ভিস (প্রতিষ্ঠানে সেবা) যোগ, সম্পাদনা ও স্বয়ংক্রিয় ২০০ KB ইমেজ কম্প্রেশন
                  </p>
                </div>

                {/* Top Action Buttons */}
                <div className="flex items-center gap-2.5 shrink-0 flex-wrap">
                  <button
                    onClick={handleSyncAllServices}
                    disabled={isSyncingServices}
                    className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50"
                    title="সকল সার্ভিস ও পণ্য ক্লাউড ফায়ারবেসে সিঙ্ক করুন"
                  >
                    {isSyncingServices ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin text-rose-600" />
                    ) : (
                      <RefreshCw className="w-3.5 h-3.5 text-slate-600" />
                    )}
                    <span>ফায়ারবেস সিঙ্ক</span>
                  </button>

                  <button
                    onClick={handleOpenAddService}
                    className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
                  >
                    <Plus className="w-4 h-4" />
                    <span>নতুন সার্ভিস বা পণ্য যোগ করুন</span>
                  </button>
                </div>
              </div>

              {/* Division Segmented Control: All / Products / Services */}
              <div className="grid grid-cols-3 gap-1 sm:gap-2 p-1 bg-slate-100 rounded-xl">
                <button
                  type="button"
                  onClick={() => setAdminDivisionFilter('all')}
                  className={`py-1.5 sm:py-2 px-2 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                    adminDivisionFilter === 'all'
                      ? 'bg-white text-slate-900 shadow-2xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Layers className="w-3.5 h-3.5" />
                  <span>সব ({products.length})</span>
                </button>

                <button
                  type="button"
                  onClick={() => setAdminDivisionFilter('products')}
                  className={`py-1.5 sm:py-2 px-2 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                    adminDivisionFilter === 'products'
                      ? 'bg-emerald-600 text-white shadow-2xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <ShoppingBag className="w-3.5 h-3.5" />
                  <span>🛍️ পণ্য ({products.filter(p => isProductItem(p)).length})</span>
                </button>

                <button
                  type="button"
                  onClick={() => setAdminDivisionFilter('services')}
                  className={`py-1.5 sm:py-2 px-2 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                    adminDivisionFilter === 'services'
                      ? 'bg-rose-600 text-white shadow-2xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Building2 className="w-3.5 h-3.5" />
                  <span>💆 সার্ভিস ({products.filter(p => !isProductItem(p)).length})</span>
                </button>
              </div>

              {/* Quick Category / Search Filter Bar */}
              <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 pt-2 border-t border-slate-100">
                {/* Search Bar */}
                <div className="sm:col-span-6 relative">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="নাম বা বিবরণ দিয়ে খুঁজুন..."
                    value={serviceSearchQuery}
                    onChange={(e) => setServiceSearchQuery(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:bg-white focus:ring-2 focus:ring-rose-500"
                  />
                  {serviceSearchQuery && (
                    <button
                      onClick={() => setServiceSearchQuery('')}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                {/* Category Dropdown Filter */}
                <div className="sm:col-span-6 flex items-center gap-2 overflow-x-auto no-scrollbar">
                  <select
                    value={serviceCategoryFilter}
                    onChange={(e) => setServiceCategoryFilter(e.target.value)}
                    className="w-full py-2 px-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold outline-none focus:bg-white focus:ring-2 focus:ring-rose-500 text-slate-700"
                  >
                    <option value="all">-- সকল ক্যাটেগরি --</option>
                    <option value="beauty_products">🛍️ প্রসাধন ও স্কিনকেয়ার পণ্য</option>
                    <option value="csa_laser">সিএসএ লেজার ট্রিটমেন্ট</option>
                    <option value="csa-laser">সিএসএ লেজার (Old)</option>
                    <option value="facial_skin">ফেসিয়াল ও স্কিন কেয়ার</option>
                    <option value="facial-skin">ফেসিয়াল ও স্কিন কেয়ার (Old)</option>
                    <option value="bridal_makeup">ব্রাইডাল মেকআপ ও সাজ</option>
                    <option value="bridal-makeup">ব্রাইডাল মেকআপ (Old)</option>
                    <option value="hair_spa">হেয়ার রিবন্ডিং ও স্পা</option>
                    <option value="hair-care">হেয়ার রিবন্ডিং (Old)</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Services & Products Grid Display */}
            {filteredAdminProducts.length === 0 ? (
              <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center space-y-3">
                <Sparkles className="w-10 h-10 text-slate-300 mx-auto" />
                <h3 className="font-bold text-sm text-slate-800">কোনো আইটেম পাওয়া যায়নি</h3>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  সার্চ ফিল্টারে কোনো ফলাফল মেলেনি অথবা কোনো সার্ভিস বা পণ্য যুক্ত করা হয়নি।
                </p>
                <button
                  onClick={handleOpenAddService}
                  className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold inline-flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>নতুন সার্ভিস বা পণ্য যোগ করুন</span>
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredAdminProducts.map((prod) => {
                  const isProd = isProductItem(prod);
                  return (
                    <div
                      key={prod.id}
                      className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-2xs hover:shadow-md transition-shadow flex flex-col justify-between group"
                    >
                      {/* Top Image & Badges */}
                      <div className="relative aspect-video bg-slate-100 overflow-hidden">
                        <img
                          src={prod.images[0] || 'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?auto=format&fit=crop&q=80&w=800'}
                          alt={prod.titleBn}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          loading="lazy"
                        />
                        
                        {/* Top Badges */}
                        <div className="absolute top-2 left-2 flex flex-col gap-1 items-start">
                          <span className={`backdrop-blur-xs text-white font-bold text-[10px] px-2 py-0.5 rounded-md shadow-xs flex items-center gap-1 ${
                            isProd ? 'bg-emerald-700/90' : 'bg-rose-700/90'
                          }`}>
                            {isProd ? <Truck className="w-2.5 h-2.5" /> : <Building2 className="w-2.5 h-2.5" />}
                            <span>{isProd ? 'পণ্য (হোম ডেলিভারি)' : 'সার্ভিস (প্রতিষ্ঠানে)'}</span>
                          </span>
                          {prod.discountPercent > 0 && (
                            <span className="bg-rose-600 text-white font-bold text-[10px] px-2 py-0.5 rounded-md shadow-xs">
                              {prod.discountPercent}% ছাড়
                            </span>
                          )}
                        </div>

                        {/* Image Size Optimization Tag */}
                        <div className="absolute bottom-2 right-2 bg-emerald-950/80 backdrop-blur-xs text-emerald-300 text-[9px] font-bold px-1.5 py-0.5 rounded shadow-xs flex items-center gap-1">
                          <Check className="w-2.5 h-2.5" />
                          <span>≤ 200KB অপ্টিমাইজড</span>
                        </div>
                      </div>

                      {/* Content Body */}
                      <div className="p-4 space-y-3 flex-1 flex flex-col justify-between">
                        <div className="space-y-1">
                          <div className="flex items-start justify-between gap-2">
                            <h4 className="font-extrabold text-sm sm:text-base text-slate-900 leading-snug">
                              {prod.titleBn}
                            </h4>
                          </div>
                          {prod.title && prod.title !== prod.titleBn && (
                            <p className="text-[11px] text-slate-500 font-medium truncate">
                              {prod.title}
                            </p>
                          )}
                          <p className="text-xs text-slate-600 line-clamp-2 pt-1">
                            {prod.descriptionBn}
                          </p>
                        </div>

                        {/* Pricing and Highlights */}
                        <div className="space-y-2 pt-2 border-t border-slate-100">
                          <div className="flex items-baseline justify-between">
                            <div className="flex items-baseline gap-2">
                              <span className={`text-base font-extrabold ${isProd ? 'text-emerald-800' : 'text-slate-900'}`}>
                                ৳{prod.price.toLocaleString('bn-BD')}
                              </span>
                              {prod.originalPrice > prod.price && (
                                <span className="text-xs text-slate-400 line-through">
                                  ৳{prod.originalPrice.toLocaleString('bn-BD')}
                                </span>
                              )}
                            </div>
                            <span className="text-[11px] text-slate-500 font-medium">
                              স্টক: <b>{prod.stockCount ?? 50}</b>
                            </span>
                          </div>

                          {/* Delivery / In-person badge */}
                          <div className="flex items-center text-[10px] font-semibold">
                            {isProd ? (
                              <span className="text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-md flex items-center gap-1">
                                <Truck className="w-3 h-3 text-emerald-600" />
                                <span>অনলাইন/অফলাইনে ডেলিভারিযোগ্য</span>
                              </span>
                            ) : (
                              <span className="text-rose-700 bg-rose-50 border border-rose-200 px-2 py-0.5 rounded-md flex items-center gap-1">
                                <Building2 className="w-3 h-3 text-rose-600" />
                                <span>প্রতিষ্ঠানে এসে সার্ভিস নিতে হবে</span>
                              </span>
                            )}
                          </div>

                          {/* Badges Preview */}
                          <div className="flex flex-wrap gap-1">
                            {prod.isFeatured && (
                              <span className="text-[9px] bg-amber-50 text-amber-700 border border-amber-200 px-1.5 py-0.5 rounded font-bold">
                                Featured
                              </span>
                            )}
                            {prod.isBestSeller && (
                              <span className="text-[9px] bg-rose-50 text-rose-700 border border-rose-200 px-1.5 py-0.5 rounded font-bold">
                                Best Seller
                              </span>
                            )}
                            {prod.isNewArrival && (
                              <span className="text-[9px] bg-blue-50 text-blue-700 border border-blue-200 px-1.5 py-0.5 rounded font-bold">
                                New Offer
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Action Buttons: Edit and Delete */}
                        <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100">
                          <button
                            onClick={() => handleOpenEditService(prod)}
                            className="py-2 px-3 bg-slate-100 hover:bg-rose-50 text-slate-800 hover:text-rose-700 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer border border-slate-200"
                          >
                            <Edit2 className="w-3.5 h-3.5 text-rose-600" />
                            <span>এডিট করুন</span>
                          </button>

                          <button
                            onClick={() => handleDeleteProduct(prod.id, prod.titleBn)}
                            className="py-2 px-3 bg-slate-50 hover:bg-rose-100/70 text-slate-600 hover:text-rose-700 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer border border-slate-200"
                          >
                            <Trash2 className="w-3.5 h-3.5 text-rose-500" />
                            <span>ডিলিট</span>
                          </button>
                        </div>

                      </div>
                    </div>
                  );
                })}
              </div>
            )}

          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 6: SETTINGS */}
        {/* ========================================================================= */}
        {activeTab === 'settings' && (
          <div className="max-w-3xl space-y-6">
            
            {/* QR Code View Option (Firebase Synced) */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-5 shadow-xs">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-xl bg-rose-50 border border-rose-200 flex items-center justify-center text-rose-600">
                      <QrCode className="w-4 h-4" />
                    </div>
                    <h2 className="text-base font-bold text-slate-900">QR code View Option (কিউআর কোড ভিউ অপশন)</h2>
                  </div>
                  <p className="text-xs text-slate-500">
                    কিউআর কোড স্ক্যান করলে গ্রাহকরা কীভাবে মেমো দেখতে পাবেন তা নিয়ন্ত্রণ করুন।
                  </p>
                </div>

                <div className="flex items-center gap-1.5 px-2.5 py-1 bg-emerald-50 border border-emerald-200 rounded-full text-[11px] font-semibold text-emerald-700 self-start sm:self-auto">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span>🔥 ফায়ারবেস লাইভ ক্লাউড কানেক্টেড</span>
                </div>
              </div>

              {/* Toggle Switch Banner */}
              <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-4 sm:p-5 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <span className="text-[11px] uppercase tracking-wider font-extrabold text-slate-400 block">
                      বর্তমান কিউআর কোড মোড:
                    </span>
                    <div className="flex items-center gap-2 mt-1">
                      {qrTextMemoEnabled ? (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-extrabold bg-emerald-600 text-white shadow-xs">
                          <Check className="w-3.5 h-3.5" />
                          <span>On (সরাসরি টেক্সট মেমো - URL লুকানো)</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-extrabold bg-slate-700 text-white shadow-xs">
                          <Globe className="w-3.5 h-3.5" />
                          <span>Off (সুরক্ষিত রিসিট URL লিংক)</span>
                        </span>
                      )}

                      {isUpdatingQrOption && (
                        <span className="text-xs text-rose-600 flex items-center gap-1 font-medium">
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          ক্লাউডে সেভ হচ্ছে...
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Fast Toggle Switch Button */}
                  <button
                    type="button"
                    onClick={() => handleToggleQrMode(!qrTextMemoEnabled)}
                    disabled={isUpdatingQrOption}
                    className={`py-2.5 px-5 rounded-xl font-bold text-xs flex items-center gap-2 transition-all cursor-pointer shadow-sm ${
                      qrTextMemoEnabled
                        ? 'bg-slate-900 hover:bg-slate-800 text-white'
                        : 'bg-emerald-600 hover:bg-emerald-700 text-white'
                    }`}
                  >
                    {qrTextMemoEnabled ? (
                      <>
                        <Globe className="w-4 h-4" />
                        <span>Off করুন (URL মোডে নিতে)</span>
                      </>
                    ) : (
                      <>
                        <FileText className="w-4 h-4" />
                        <span>On করুন (টেক্সট মেমো মোডে নিতে)</span>
                      </>
                    )}
                  </button>
                </div>

                {/* Option 1 & Option 2 Selection Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
                  
                  {/* Card On: Text Memo */}
                  <div
                    onClick={() => handleToggleQrMode(true)}
                    className={`p-4 rounded-xl border-2 transition-all cursor-pointer text-left relative ${
                      qrTextMemoEnabled
                        ? 'border-emerald-500 bg-white shadow-md ring-2 ring-emerald-500/20'
                        : 'border-slate-200 bg-white/60 hover:bg-white hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center font-extrabold text-xs">
                        ON
                      </div>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                        🔒 URL ১০০% হাইড
                      </span>
                    </div>
                    <h3 className="font-extrabold text-sm text-slate-900 mt-2">সরাসরি টেক্সট মেমো</h3>
                    <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                      স্ক্যান করলে কোনো ওয়েবসাইট বা লিঙ্ক ওপেন হবে না। সরাসরি স্ক্রিনে ক্যাশ মেমোর টেক্সট বিবরণ (পণ্য তালিকা, বিল ও বাকি) ভেসে উঠবে।
                    </p>
                    <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px]">
                      <span className="text-slate-500">গ্রাহক অভিজ্ঞতা:</span>
                      <span className="font-bold text-emerald-700">অফলাইন ও নিরবচ্ছিন্ন</span>
                    </div>
                  </div>

                  {/* Card Off: URL */}
                  <div
                    onClick={() => handleToggleQrMode(false)}
                    className={`p-4 rounded-xl border-2 transition-all cursor-pointer text-left relative ${
                      !qrTextMemoEnabled
                        ? 'border-rose-500 bg-white shadow-md ring-2 ring-rose-500/20'
                        : 'border-slate-200 bg-white/60 hover:bg-white hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="w-8 h-8 rounded-lg bg-slate-100 text-slate-700 flex items-center justify-center font-extrabold text-xs">
                        OFF
                      </div>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
                        🌐 ওয়েব ডিজিটাল ভাউচার
                      </span>
                    </div>
                    <h3 className="font-extrabold text-sm text-slate-900 mt-2">সুরক্ষিত রিসিট URL লিংক</h3>
                    <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                      স্ক্যান করলে ব্রাউজারে অফিসিয়াল ডিজিটাল রিসিট পেজ ওপেন হবে। (মূল ওয়েবসাইটের শপ ও মেনু সম্পূর্ণ লক থাকবে)।
                    </p>
                    <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px]">
                      <span className="text-slate-500">গ্রাহক অভিজ্ঞতা:</span>
                      <span className="font-bold text-slate-700">ডিজিটাল ওয়েব ভাউচার</span>
                    </div>
                  </div>

                </div>

                {/* Real-time sync note */}
                <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-xs text-amber-900 flex items-start gap-2">
                  <Sparkles className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  <div>
                    <b>রিয়েল-টাইম ফায়ারবেস কার্যকর:</b> আপনি এখানে <b>On</b> বা <b>Off</b> এ ক্লিক করার সাথে সাথে ফায়ারবেস ক্লাউডে সংরক্ষিত হচ্ছে। অন্য সকল গ্রাহক বা ইউজাররা সাথে সাথে আপনার নির্ধারিত অপশন অনুযায়ী সেবা পাবে।
                  </div>
                </div>
              </div>
            </div>

            {/* Parlour Info Settings Form */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-6 shadow-xs">
              <div className="space-y-0.5 border-b border-slate-100 pb-3">
                <h2 className="text-base font-bold text-slate-900">পার্লার ও ইনভয়েস সাধারণ তথ্য</h2>
                <p className="text-xs text-slate-500">ইনভয়েস এবং ওয়েবসাইটে প্রদর্শিত নাম, ঠিকানা ও যোগাযোগের তথ্য।</p>
              </div>

              <form onSubmit={handleSaveSettings} className="space-y-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">পার্লারের পূর্ণ নাম:</label>
                  <input
                    type="text"
                    value={parlourInfo.branchName}
                    onChange={(e) => setParlourInfo({ ...parlourInfo, branchName: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs outline-none focus:bg-white focus:ring-1 focus:ring-rose-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">হটলাইন নম্বর:</label>
                  <input
                    type="text"
                    value={parlourInfo.hotline}
                    onChange={(e) => setParlourInfo({ ...parlourInfo, hotline: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-mono outline-none focus:bg-white focus:ring-1 focus:ring-rose-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">ঠিকানা:</label>
                  <input
                    type="text"
                    value={parlourInfo.address}
                    onChange={(e) => setParlourInfo({ ...parlourInfo, address: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs outline-none focus:bg-white focus:ring-1 focus:ring-rose-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">খোলা থাকার সময়সূচি:</label>
                  <input
                    type="text"
                    value={parlourInfo.hours}
                    onChange={(e) => setParlourInfo({ ...parlourInfo, hours: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs outline-none focus:bg-white focus:ring-1 focus:ring-rose-500"
                  />
                </div>

                <button
                  type="submit"
                  className="py-2.5 px-5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>সেটিংস সংরক্ষণ করুন (Save All)</span>
                </button>
              </form>
            </div>

          </div>
        )}

      </main>

      {/* Service Add / Edit Modal with Automatic 200KB Image Compressor */}
      <ServiceManagerModal
        isOpen={isServiceModalOpen}
        onClose={() => setIsServiceModalOpen(false)}
        productToEdit={editingProduct}
        categories={categories}
        onSave={handleSaveProduct}
      />

      {/* A4 Printable Invoice Modal Component */}
      {printInvoiceOrder && (
        <A4PrintInvoice
          order={printInvoiceOrder}
          onClose={() => setPrintInvoiceOrder(null)}
          defaultQrMode={qrTextMemoEnabled ? 'offline_text' : 'secure_link'}
          parlourInfo={parlourInfo}
        />
      )}

    </div>
  );
};
