import React, { useState, useEffect, useMemo } from 'react';
import { Appointment, AppointmentStatus, AppointmentServiceCategory } from '../types';
import {
  saveAppointmentToFirestore,
  getAppointmentsFromFirestore,
  subscribeToAppointments,
  updateAppointmentStatusInFirestore,
  deleteAppointmentFromFirestore,
  saveAppointmentServiceCategory,
  getAppointmentServiceCategories,
  subscribeToAppointmentServices,
  deleteAppointmentServiceCategory,
} from '../lib/firebase';
import {
  Calendar,
  Clock,
  User,
  Phone,
  MapPin,
  Sparkles,
  Plus,
  Search,
  Filter,
  CheckCircle2,
  PhoneCall,
  MessageCircle,
  AlertCircle,
  Check,
  Trash2,
  ExternalLink,
  RefreshCw,
  X,
  FileText,
  Printer,
  ChevronDown,
  ArrowRight,
  Maximize2,
  Minimize2,
  Tag,
  Send,
  CalendarDays,
  UserCheck,
} from 'lucide-react';
import { printElementViaAboutBlank } from '../lib/printHelper';

interface AppointmentManagerProps {
  onToast: (msg: string) => void;
  onOpenManualBilling?: (customerData: { name: string; phone: string; service: string }) => void;
  isStandalonePage?: boolean;
  onCloseStandalone?: () => void;
}

const DEFAULT_SERVICES = [
  'হাইড্রা ফেসিয়াল',
  'হেয়ার রিবন্ডিং ও স্মুদনিং',
  'হেয়ার স্পা ও ড্যামেজ রিপেয়ার',
  'ব্রাইডাল প্রিমিয়াম মেকআপ',
  'পার্টি গেটআপ ও মেকআপ',
  'মেছতা ও পিগমেন্টেশন লেজার',
  'ব্রণ ও একনে স্কার ট্রিটমেন্ট',
  'মেনিকিউর ও পেডিকিউর',
  'আইব্রো প্লাক ও ফেসিয়াল থ্রেডিং',
  'স্কিন হোয়াইটেনিং ও গ্লো থেরাপি',
];

export const AppointmentManager: React.FC<AppointmentManagerProps> = ({
  onToast,
  onOpenManualBilling,
  isStandalonePage = false,
  onCloseStandalone,
}) => {
  // Appointments List State
  const [appointments, setAppointments] = useState<Appointment[]>(() => {
    try {
      const saved = localStorage.getItem('tanu_appointments');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const [isLoading, setIsLoading] = useState(false);

  // Saved Service Categories
  const [savedServices, setSavedServices] = useState<AppointmentServiceCategory[]>(() => {
    try {
      const saved = localStorage.getItem('tanu_appointment_services');
      if (saved) return JSON.parse(saved);
    } catch {
      // fallback to defaults
    }
    return DEFAULT_SERVICES.map((s, idx) => ({ id: `srv-${idx}`, name: s, count: 5 }));
  });

  // Form State
  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  const [phone, setPhone] = useState('');
  const [service, setService] = useState('');
  const [date, setDate] = useState(() => {
    const today = new Date();
    return today.toISOString().split('T')[0]; // YYYY-MM-DD
  });
  const [time, setTime] = useState('');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // New Category Modal / Input
  const [showAddCategoryInput, setShowAddCategoryInput] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');

  // Filtering & Search
  const [searchQuery, setSearchQuery] = useState('');
  const [dateFilter, setDateFilter] = useState<'all' | 'today' | 'tomorrow' | 'specific'>('all');
  const [specificFilterDate, setSpecificFilterDate] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  // Contact Notes Modal
  const [contactingAppt, setContactingAppt] = useState<Appointment | null>(null);
  const [contactNoteText, setContactNoteText] = useState('');

  // Receive Confirmation Popup Modal
  const [confirmReceivingAppt, setConfirmReceivingAppt] = useState<Appointment | null>(null);

  // Fullscreen / Clean view toggle
  const [isFullscreenClean, setIsFullscreenClean] = useState(isStandalonePage);

  // Helper: Format YYYY-MM-DD to DD/MM/YYYY (দিন/মাস ও বছর)
  const formatDateToDDMMYYYY = (isoDate: string): string => {
    if (!isoDate) return '';
    try {
      const parts = isoDate.split('-');
      if (parts.length === 3) {
        return `${parts[2]}/${parts[1]}/${parts[0]}`; // দিন/মাস/বছর
      }
    } catch (e) {
      console.error(e);
    }
    return isoDate;
  };

  // Convert Date object to YYYY-MM-DD in local time
  const getLocalDateString = (d: Date): string => {
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const todayStr = useMemo(() => getLocalDateString(new Date()), []);
  const tomorrowStr = useMemo(() => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return getLocalDateString(d);
  }, []);

  // Sync with Firestore on mount
  useEffect(() => {
    setIsLoading(true);
    getAppointmentsFromFirestore().then((remoteAppts) => {
      if (remoteAppts && remoteAppts.length > 0) {
        setAppointments(remoteAppts);
        localStorage.setItem('tanu_appointments', JSON.stringify(remoteAppts));
      }
      setIsLoading(false);
    }).catch(() => setIsLoading(false));

    // Listen to real-time updates
    const unsubAppts = subscribeToAppointments((updated) => {
      if (updated && updated.length >= 0) {
        setAppointments(updated);
        localStorage.setItem('tanu_appointments', JSON.stringify(updated));
      }
    });

    // Listen to saved service categories
    getAppointmentServiceCategories().then((cats) => {
      if (cats && cats.length > 0) {
        setSavedServices(cats);
        localStorage.setItem('tanu_appointment_services', JSON.stringify(cats));
      }
    });

    const unsubServices = subscribeToAppointmentServices((updatedCats) => {
      if (updatedCats && updatedCats.length > 0) {
        setSavedServices(updatedCats);
        localStorage.setItem('tanu_appointment_services', JSON.stringify(updatedCats));
      }
    });

    return () => {
      unsubAppts();
      unsubServices();
    };
  }, []);

  // Quick select service category
  const handleSelectServiceCategory = (catName: string) => {
    if (!service.trim()) {
      setService(catName);
    } else if (!service.includes(catName)) {
      setService(`${service}, ${catName}`);
    }
  };

  // Save new service category manually
  const handleAddNewCategory = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const clean = newCategoryName.trim();
    if (!clean) return;

    await saveAppointmentServiceCategory(clean);
    setSavedServices((prev) => {
      if (prev.some((s) => s.name.toLowerCase() === clean.toLowerCase())) return prev;
      const updated = [{ id: `cat-${Date.now()}`, name: clean, count: 1 }, ...prev];
      localStorage.setItem('tanu_appointment_services', JSON.stringify(updated));
      return updated;
    });
    setNewCategoryName('');
    setShowAddCategoryInput(false);
    onToast(`'${clean}' সার্ভিস ক্যাটাগরি হিসেবে যুক্ত হয়েছে`);
  };

  // Delete a saved category
  const handleDeleteCategory = async (catId: string, catName: string) => {
    if (window.confirm(`আপনি কি সত্যিই '${catName}' ক্যাটাগরি তালিকা থেকে সরাতে চান?`)) {
      await deleteAppointmentServiceCategory(catId);
      setSavedServices((prev) => {
        const filtered = prev.filter((s) => s.id !== catId);
        localStorage.setItem('tanu_appointment_services', JSON.stringify(filtered));
        return filtered;
      });
      onToast(`'${catName}' ক্যাটাগরি মুছে ফেলা হয়েছে`);
    }
  };

  // Submit Appointment Form
  const handleSubmitAppointment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      onToast('কাস্টমারের নাম লিখুন');
      return;
    }
    if (!phone.trim()) {
      onToast('মোবাইল নম্বর লিখুন');
      return;
    }
    if (!address.trim()) {
      onToast('ঠিকানা লিখুন');
      return;
    }
    if (!service.trim()) {
      onToast('সার্ভিসের নাম নির্বাচন বা লিখুন');
      return;
    }
    if (!date) {
      onToast('অ্যাপয়েন্টমেন্টের তারিখ দিন');
      return;
    }

    setIsSubmitting(true);
    const dateFormatted = formatDateToDDMMYYYY(date);

    const newAppointment: Appointment = {
      id: `APT-${Date.now().toString().slice(-6)}`,
      name: name.trim(),
      address: address.trim(),
      phone: phone.trim(),
      service: service.trim(),
      date,
      dateDisplay: dateFormatted,
      time: time.trim() || undefined,
      status: 'pending',
      notes: notes.trim() || undefined,
      createdAt: new Date().toISOString(),
    };

    // 1. Save appointment to local state
    const updated = [newAppointment, ...appointments];
    setAppointments(updated);
    localStorage.setItem('tanu_appointments', JSON.stringify(updated));

    // 2. Automatically save services as categories so user won't need to retype in the future!
    const splittedServices = service
      .split(/[,+&/]/)
      .map((s) => s.trim())
      .filter((s) => s.length > 1);

    for (const sName of splittedServices) {
      saveAppointmentServiceCategory(sName);
      setSavedServices((prev) => {
        if (!prev.some((c) => c.name.toLowerCase() === sName.toLowerCase())) {
          return [{ id: `cat-${Date.now()}-${Math.random()}`, name: sName, count: 1 }, ...prev];
        }
        return prev;
      });
    }

    // 3. Persist to Firestore
    try {
      await saveAppointmentToFirestore(newAppointment);
      onToast('অ্যাপয়েন্টমেন্ট সফলভাবে সংরক্ষণ করা হয়েছে!');
    } catch (err) {
      console.error(err);
      onToast('অ্যাপয়েন্টমেন্ট স্থানীয়ভাবে সংরক্ষিত হয়েছে (অফলাইন মোড)');
    } finally {
      setIsSubmitting(false);
      // Reset form
      setName('');
      setPhone('');
      setAddress('');
      setService('');
      setNotes('');
      setTime('');
    }
  };

  // Mark as Received
  const handleMarkReceived = async (apt: Appointment) => {
    try {
      const updated = appointments.map((a) =>
        a.id === apt.id ? { ...a, status: 'received' as AppointmentStatus, receivedAt: new Date().toISOString() } : a
      );
      setAppointments(updated);
      localStorage.setItem('tanu_appointments', JSON.stringify(updated));
      await updateAppointmentStatusInFirestore(apt.id, 'received');
      onToast(`কাস্টমার '${apt.name}' রিসিভ করা হয়েছে`);
    } catch (err) {
      console.error(err);
      onToast('স্ট্যাটাস আপডেট ব্যর্থ হয়েছে');
    }
  };

  // Mark as Not Attended
  const handleMarkNotAttended = async (apt: Appointment) => {
    try {
      const updated = appointments.map((a) =>
        a.id === apt.id ? { ...a, status: 'not_attended' as AppointmentStatus } : a
      );
      setAppointments(updated);
      localStorage.setItem('tanu_appointments', JSON.stringify(updated));
      await updateAppointmentStatusInFirestore(apt.id, 'not_attended');
      onToast(`'${apt.name}'-এর স্ট্যাটাস 'আসলো না / যোগাযোগ প্রয়োজন' করা হয়েছে`);
    } catch (err) {
      console.error(err);
    }
  };

  // Save Contact Note and update status to 'contacted'
  const handleSaveContactNote = async () => {
    if (!contactingAppt) return;
    try {
      const updated = appointments.map((a) =>
        a.id === contactingAppt.id
          ? {
              ...a,
              status: 'contacted' as AppointmentStatus,
              contactNotes: contactNoteText,
              lastContactedAt: new Date().toISOString(),
            }
          : a
      );
      setAppointments(updated);
      localStorage.setItem('tanu_appointments', JSON.stringify(updated));
      await updateAppointmentStatusInFirestore(contactingAppt.id, 'contacted', {
        contactNotes: contactNoteText,
      });
      onToast(`'${contactingAppt.name}'-এর সাথে যোগাযোগের নোট সংরক্ষিত হয়েছে`);
      setContactingAppt(null);
      setContactNoteText('');
    } catch (err) {
      console.error(err);
      onToast('নোট সংরক্ষণে সমস্যা হয়েছে');
    }
  };

  // Delete Appointment
  const handleDeleteAppointment = async (aptId: string, aptName: string) => {
    if (window.confirm(`আপনি কি সত্যিই '${aptName}'-এর অ্যাপয়েন্টমেন্টটি ডিলিট করতে চান?`)) {
      const updated = appointments.filter((a) => a.id !== aptId);
      setAppointments(updated);
      localStorage.setItem('tanu_appointments', JSON.stringify(updated));
      await deleteAppointmentFromFirestore(aptId);
      onToast('অ্যাপয়েন্টমেন্ট ডিলিট করা হয়েছে');
    }
  };

  // Open WhatsApp with polished Bangla follow-up message
  const handleOpenWhatsApp = (apt: Appointment) => {
    const cleanPhone = apt.phone.replace(/\D/g, '');
    let fullPhone = cleanPhone;
    if (fullPhone.startsWith('0')) {
      fullPhone = '88' + fullPhone;
    } else if (!fullPhone.startsWith('880') && fullPhone.length === 10) {
      fullPhone = '880' + fullPhone;
    }

    const message = `আসসালামু আলাইকুম ${apt.name} আপু/ম্যাম,
তনু বিউটি পার্লার ও লেজার সেন্টার থেকে যোগাযোগ করা হচ্ছে।
আপনার আজকের অ্যাপয়েন্টমেন্ট সংক্রান্ত তথ্য:
🌸 সেবা: ${apt.service}
📅 তারিখ: ${apt.dateDisplay}${apt.time ? ` (${apt.time})` : ''}

আপনি কি আজ নির্ধারিত সময়ে আসছেন বা কোনো সময় পরিবর্তনের প্রয়োজন রয়েছে? অনুগ্রহ করে জানালে আমরা আপনার জন্য স্লট প্রস্তুত রাখব।
ধন্যবাদ,
তনু বিউটি পার্লার ও লেজার সেন্টার
📞 হটলাইন: 01302383795`;

    const encoded = encodeURIComponent(message);
    window.open(`https://wa.me/${fullPhone}?text=${encoded}`, '_blank');
  };

  // Print Appointments list cleanly using about:blank
  const handlePrintAppointments = () => {
    printElementViaAboutBlank('printable-appointments-table', {
      title: 'তনু_বিউটি_পার্লার_অ্যাপয়েন্টমেন্ট_তালিকা',
      pageFormat: 'A4',
    });
  };

  // Open Clean Standalone Portal in New Tab
  const handleOpenNewWindow = () => {
    const url = new URL(window.location.href);
    url.searchParams.set('admin', 'appointments');
    window.open(url.toString(), '_blank');
  };

  // Filtered Appointments List
  const filteredAppointments = useMemo(() => {
    return appointments.filter((apt) => {
      // 1. Search Query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchName = apt.name.toLowerCase().includes(q);
        const matchPhone = apt.phone.includes(q);
        const matchService = apt.service.toLowerCase().includes(q);
        const matchAddress = (apt.address || '').toLowerCase().includes(q);
        const matchDate = (apt.dateDisplay || '').includes(q);
        if (!matchName && !matchPhone && !matchService && !matchAddress && !matchDate) {
          return false;
        }
      }

      // 2. Status Filter
      if (statusFilter !== 'all' && apt.status !== statusFilter) {
        return false;
      }

      // 3. Date Filter
      if (dateFilter === 'today') {
        return apt.date === todayStr;
      }
      if (dateFilter === 'tomorrow') {
        return apt.date === tomorrowStr;
      }
      if (dateFilter === 'specific' && specificFilterDate) {
        return apt.date === specificFilterDate;
      }

      return true;
    });
  }, [appointments, searchQuery, statusFilter, dateFilter, specificFilterDate, todayStr, tomorrowStr]);

  // Dashboard KPI Metrics
  const metrics = useMemo(() => {
    const total = appointments.length;
    const todayCount = appointments.filter((a) => a.date === todayStr).length;
    const receivedCount = appointments.filter((a) => a.status === 'received').length;
    const pendingCount = appointments.filter((a) => a.status === 'pending').length;
    const notAttendedCount = appointments.filter((a) => a.status === 'not_attended').length;
    const contactedCount = appointments.filter((a) => a.status === 'contacted').length;

    return {
      total,
      todayCount,
      receivedCount,
      pendingCount,
      notAttendedCount,
      contactedCount,
    };
  }, [appointments, todayStr]);

  const containerClass = isFullscreenClean
    ? 'fixed inset-0 z-50 bg-slate-100 overflow-y-auto p-4 sm:p-6 lg:p-8 font-["Anek_Bangla",sans-serif]'
    : 'space-y-6 font-["Anek_Bangla",sans-serif]';

  return (
    <div className={containerClass}>
      
      {/* Top Header Card / Action Bar */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-4 sm:p-5 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 border border-rose-100 flex items-center justify-center shrink-0">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg sm:text-xl font-extrabold text-slate-900 tracking-tight">
                  অ্যাপয়েন্টমেন্ট এন্ট্রি ও ড্যাশবোর্ড
                </h2>
                <span className="px-2.5 py-0.5 rounded-full bg-rose-100/70 text-rose-700 text-xs font-bold font-['Plus_Jakarta_Sans',sans-serif]">
                  {appointments.length} মোট
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                সহজে অ্যাপয়েন্টমেন্ট এন্ট্রি, সংরক্ষিত সার্ভিস ক্যাটাগরি, কাস্টমার রিসিভ ও ফলো-আপ যোগাযোগ
              </p>
            </div>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center flex-wrap gap-2 w-full sm:w-auto justify-start sm:justify-end">
          <button
            onClick={handlePrintAppointments}
            className="px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer border border-slate-200"
            title="তালিকা প্রিন্ট করুন (A4)"
          >
            <Printer className="w-3.5 h-3.5 text-slate-600" />
            <span>প্রিন্ট করুন</span>
          </button>

          {!isStandalonePage && (
            <button
              onClick={() => setIsFullscreenClean(!isFullscreenClean)}
              className="px-3 py-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer border border-rose-200"
              title={isFullscreenClean ? 'সাধারণ ভিউতে ফিরুন' : 'ফুল পেজ ক্লিন ভিউ'}
            >
              {isFullscreenClean ? (
                <>
                  <Minimize2 className="w-3.5 h-3.5" />
                  <span>ছোট ভিউ</span>
                </>
              ) : (
                <>
                  <Maximize2 className="w-3.5 h-3.5" />
                  <span>ক্লিন ফুল পেজ</span>
                </>
              )}
            </button>
          )}

          <button
            onClick={handleOpenNewWindow}
            className="px-3 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
            title="নতুন ব্রাউজার ট্যাবে ক্লিন উইন্ডো ওপেন করুন"
          >
            <ExternalLink className="w-3.5 h-3.5 text-slate-300" />
            <span>নতুন ট্যাবে খুলুন</span>
          </button>

          {isFullscreenClean && onCloseStandalone && (
            <button
              onClick={onCloseStandalone}
              className="p-2 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-700 transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 1. APPOINTMENT DASHBOARD METRICS */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
        
        {/* Today's Appointments */}
        <div 
          onClick={() => { setDateFilter('today'); setStatusFilter('all'); }}
          className={`p-4 rounded-2xl border transition-all cursor-pointer ${
            dateFilter === 'today'
              ? 'bg-rose-50 border-rose-300 ring-2 ring-rose-500/20 shadow-xs'
              : 'bg-white border-slate-200 hover:border-rose-200 hover:bg-slate-50/50'
          }`}
        >
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-bold text-slate-700">আজকের শিডিউল</span>
            <div className="w-7 h-7 rounded-lg bg-rose-100 text-rose-600 flex items-center justify-center text-xs">
              <CalendarDays className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900 font-['Plus_Jakarta_Sans',sans-serif]">
            {metrics.todayCount}
          </div>
          <div className="text-[11px] text-rose-600 font-bold mt-0.5">
            {formatDateToDDMMYYYY(todayStr)}
          </div>
        </div>

        {/* Pending / Waiting */}
        <div 
          onClick={() => { setStatusFilter('pending'); setDateFilter('all'); }}
          className={`p-4 rounded-2xl border transition-all cursor-pointer ${
            statusFilter === 'pending'
              ? 'bg-amber-50 border-amber-300 ring-2 ring-amber-500/20 shadow-xs'
              : 'bg-white border-slate-200 hover:border-amber-200 hover:bg-slate-50/50'
          }`}
        >
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-bold text-slate-700">অপেক্ষমান</span>
            <div className="w-7 h-7 rounded-lg bg-amber-100 text-amber-600 flex items-center justify-center text-xs">
              <Clock className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-2xl font-black text-amber-700 font-['Plus_Jakarta_Sans',sans-serif]">
            {metrics.pendingCount}
          </div>
          <div className="text-[11px] text-amber-600 font-medium mt-0.5">
            আসবেন বলে শিডিউল রয়েছে
          </div>
        </div>

        {/* Received / Present */}
        <div 
          onClick={() => { setStatusFilter('received'); setDateFilter('all'); }}
          className={`p-4 rounded-2xl border transition-all cursor-pointer ${
            statusFilter === 'received'
              ? 'bg-emerald-50 border-emerald-300 ring-2 ring-emerald-500/20 shadow-xs'
              : 'bg-white border-slate-200 hover:border-emerald-200 hover:bg-slate-50/50'
          }`}
        >
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-bold text-slate-700">উপস্থিত / রিসিভড</span>
            <div className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-600 flex items-center justify-center text-xs">
              <CheckCircle2 className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-2xl font-black text-emerald-700 font-['Plus_Jakarta_Sans',sans-serif]">
            {metrics.receivedCount}
          </div>
          <div className="text-[11px] text-emerald-600 font-medium mt-0.5">
            পার্লারে এসেছেন ও সেবা নিচ্ছেন
          </div>
        </div>

        {/* Missed / Not Attended */}
        <div 
          onClick={() => { setStatusFilter('not_attended'); setDateFilter('all'); }}
          className={`p-4 rounded-2xl border transition-all cursor-pointer ${
            statusFilter === 'not_attended'
              ? 'bg-red-50 border-red-300 ring-2 ring-red-500/20 shadow-xs'
              : 'bg-white border-slate-200 hover:border-red-200 hover:bg-slate-50/50'
          }`}
        >
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-bold text-slate-700">আসলো না (যোগাযোগ)</span>
            <div className="w-7 h-7 rounded-lg bg-red-100 text-red-600 flex items-center justify-center text-xs">
              <PhoneCall className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-2xl font-black text-red-600 font-['Plus_Jakarta_Sans',sans-serif]">
            {metrics.notAttendedCount}
          </div>
          <div className="text-[11px] text-red-600 font-medium mt-0.5">
            কল বা হোয়াটসঅ্যাপ প্রয়োজন
          </div>
        </div>

        {/* Contacted / Followed Up */}
        <div 
          onClick={() => { setStatusFilter('contacted'); setDateFilter('all'); }}
          className={`p-4 rounded-2xl border transition-all cursor-pointer col-span-2 sm:col-span-1 ${
            statusFilter === 'contacted'
              ? 'bg-blue-50 border-blue-300 ring-2 ring-blue-500/20 shadow-xs'
              : 'bg-white border-slate-200 hover:border-blue-200 hover:bg-slate-50/50'
          }`}
        >
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-bold text-slate-700">যোগাযোগ সম্পন্ন</span>
            <div className="w-7 h-7 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center text-xs">
              <MessageCircle className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-2xl font-black text-blue-700 font-['Plus_Jakarta_Sans',sans-serif]">
            {metrics.contactedCount}
          </div>
          <div className="text-[11px] text-blue-600 font-medium mt-0.5">
            কথা বলে আপডেট নেওয়া হয়েছে
          </div>
        </div>

      </div>

      {/* ========================================================================= */}
      {/* 2. MAIN LAYOUT: (A) ENTRY FORM + (B) APPOINTMENTS LIST & FILTER */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* ======================================================================= */}
        {/* LEFT COLUMN: EASY APPOINTMENT ENTRY FORM (4 cols on lg) */}
        {/* ======================================================================= */}
        <div className="lg:col-span-5 bg-white border border-slate-200/80 rounded-2xl p-5 sm:p-6 shadow-xs space-y-5">
          
          <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-rose-600 text-white flex items-center justify-center">
                <Plus className="w-4 h-4" />
              </div>
              <h3 className="font-extrabold text-slate-900 text-base">
                নতুন অ্যাপয়েন্টমেন্ট এন্ট্রি
              </h3>
            </div>
            <span className="text-[11px] text-slate-400 font-semibold">
              সহজ ফর্ম
            </span>
          </div>

          <form onSubmit={handleSubmitAppointment} className="space-y-4">
            
            {/* Field 1: Customer Name */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-rose-500" />
                <span>কাস্টমারের নাম:</span>
                <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="যেমন: ফারহানা আক্তার মিলি"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-rose-500 focus:border-rose-500 text-xs sm:text-sm text-slate-800 outline-none transition-all placeholder:text-slate-400"
              />
            </div>

            {/* Field 2: Phone Number */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5 text-rose-500" />
                <span>ফোন নম্বর:</span>
                <span className="text-rose-500">*</span>
              </label>
              <input
                type="tel"
                required
                placeholder="যেমন: 017XXXXXXXX বা 018XXXXXXXX"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-rose-500 focus:border-rose-500 text-xs sm:text-sm text-slate-800 font-['Plus_Jakarta_Sans',sans-serif] outline-none transition-all placeholder:text-slate-400"
              />
            </div>

            {/* Field 3: Address */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-rose-500" />
                <span>ঠিকানা:</span>
                <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="যেমন: বাড়ি নং ১২, রোড নং ৫, বনশ্রী, ঢাকা"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-rose-500 focus:border-rose-500 text-xs sm:text-sm text-slate-800 outline-none transition-all placeholder:text-slate-400"
              />
            </div>

            {/* Field 4: Service (with Auto-remembered categories chips) */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-rose-500" />
                  <span>সেবা / ট্রিটমেন্ট:</span>
                  <span className="text-rose-500">*</span>
                </label>
                <button
                  type="button"
                  onClick={() => setShowAddCategoryInput(!showAddCategoryInput)}
                  className="text-[11px] text-rose-600 hover:text-rose-700 font-bold flex items-center gap-1 cursor-pointer"
                >
                  <Plus className="w-3 h-3" />
                  <span>ক্যাটাগরি যোগ</span>
                </button>
              </div>

              {/* Service Input */}
              <input
                type="text"
                required
                placeholder="সেবার নাম লিখুন বা নিচের ক্যাটাগরিতে ক্লিক করুন..."
                value={service}
                onChange={(e) => setService(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-rose-500 focus:border-rose-500 text-xs sm:text-sm text-slate-800 outline-none transition-all placeholder:text-slate-400"
              />

              {/* Quick Add Custom Category Bar */}
              {showAddCategoryInput && (
                <div className="p-2.5 bg-rose-50/70 border border-rose-200 rounded-xl space-y-2">
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      placeholder="নতুন সার্ভিসের নাম লিখুন..."
                      value={newCategoryName}
                      onChange={(e) => setNewCategoryName(e.target.value)}
                      className="flex-1 px-3 py-1.5 bg-white border border-rose-200 rounded-lg text-xs outline-none focus:ring-1 focus:ring-rose-500"
                    />
                    <button
                      type="button"
                      onClick={() => handleAddNewCategory()}
                      className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-bold cursor-pointer"
                    >
                      সংরক্ষণ
                    </button>
                  </div>
                  <p className="text-[10px] text-rose-700">
                    💡 এখানে সেভ করলে এটি ক্যাটাগরি হিসেবে স্থায়ী থাকবে, ভবিষ্যতে বারবার লিখতে হবে না।
                  </p>
                </div>
              )}

              {/* Saved Categories Quick Select Chips */}
              <div className="space-y-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  সংরক্ষিত সার্ভিস ক্যাটাগরি (ক্লিক করে নির্বাচন করুন):
                </span>
                <div className="flex flex-wrap gap-1.5 max-h-36 overflow-y-auto pr-1 py-1">
                  {savedServices.map((cat) => {
                    const isSelected = service.includes(cat.name);
                    return (
                      <span
                        key={cat.id}
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-colors cursor-pointer border ${
                          isSelected
                            ? 'bg-rose-600 text-white border-rose-600 shadow-2xs'
                            : 'bg-slate-50 hover:bg-rose-50 text-slate-700 hover:text-rose-700 border-slate-200'
                        }`}
                        onClick={() => handleSelectServiceCategory(cat.name)}
                      >
                        <span>{cat.name}</span>
                        {isSelected && <Check className="w-3 h-3" />}
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteCategory(cat.id, cat.name);
                          }}
                          className="ml-1 text-slate-400 hover:text-rose-700 opacity-60 hover:opacity-100"
                          title="ক্যাটাগরি মুছুন"
                        >
                          ×
                        </button>
                      </span>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Field 5: Appointment Date & Time */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              
              {/* Date with day/month/year format display */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-rose-500" />
                    <span>তারিখ:</span>
                    <span className="text-rose-500">*</span>
                  </span>
                  <span className="text-[10px] text-rose-600 font-semibold font-['Plus_Jakarta_Sans',sans-serif]">
                    (দিন/মাস/বছর)
                  </span>
                </label>
                <input
                  type="date"
                  required
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-rose-500 focus:border-rose-500 text-xs sm:text-sm text-slate-800 font-['Plus_Jakarta_Sans',sans-serif] outline-none transition-all"
                />
                <div className="flex items-center justify-between text-[10px] text-slate-500 font-['Plus_Jakarta_Sans',sans-serif]">
                  <span>ফরম্যাট: <b>{formatDateToDDMMYYYY(date)}</b></span>
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => setDate(todayStr)}
                      className="text-rose-600 hover:underline font-bold"
                    >
                      আজ
                    </button>
                    <span>•</span>
                    <button
                      type="button"
                      onClick={() => setDate(tomorrowStr)}
                      className="text-slate-600 hover:underline"
                    >
                      আগামীকাল
                    </button>
                  </div>
                </div>
              </div>

              {/* Time (Optional) */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-slate-400" />
                  <span>সময় (ঐচ্ছিক):</span>
                </label>
                <input
                  type="text"
                  placeholder="যেমন: ১১:৩০ AM বা বিকাল ৪ টা"
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-rose-500 focus:border-rose-500 text-xs sm:text-sm text-slate-800 outline-none transition-all placeholder:text-slate-400"
                />
              </div>

            </div>

            {/* Field 6: Notes (Optional) */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-slate-400" />
                <span>অতিরিক্ত নোট বা নির্দেশনা (ঐচ্ছিক):</span>
              </label>
              <textarea
                rows={2}
                placeholder="যেমন: স্পেশাল প্যাকেজ বা অগ্রিম বুকিং রিকোয়ারমেন্ট..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-rose-500 focus:border-rose-500 text-xs text-slate-800 outline-none transition-all placeholder:text-slate-400 resize-none"
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs sm:text-sm rounded-xl transition-all cursor-pointer shadow-xs hover:shadow-md flex items-center justify-center gap-2 active:scale-98 disabled:opacity-50"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>{isSubmitting ? 'সংরক্ষণ করা হচ্ছে...' : 'অ্যাপয়েন্টমেন্ট এন্ট্রি ও সেভ করুন'}</span>
            </button>

          </form>

        </div>

        {/* ======================================================================= */}
        {/* RIGHT COLUMN: APPOINTMENT LIST, DATE FILTER & ACTIONS (7 cols on lg) */}
        {/* ======================================================================= */}
        <div className="lg:col-span-7 bg-white border border-slate-200/80 rounded-2xl p-5 sm:p-6 shadow-xs space-y-4">
          
          {/* List Header & Filters */}
          <div className="space-y-3">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
              <div>
                <h3 className="font-extrabold text-slate-900 text-base flex items-center gap-2">
                  <span>অ্যাপয়েন্টমেন্ট তালিকা</span>
                  <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 text-xs font-['Plus_Jakarta_Sans',sans-serif]">
                    {filteredAppointments.length} টি
                  </span>
                </h3>
                <p className="text-xs text-slate-500">
                  তারিখ ও স্ট্যাটাস অনুযায়ী ফিল্টার করে কাস্টমার রিসিভ বা যোগাযোগ করুন
                </p>
              </div>

              {/* Status Filter Dropdown */}
              <div className="flex items-center gap-1.5 w-full sm:w-auto">
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 outline-none focus:ring-1 focus:ring-rose-500"
                >
                  <option value="all">সব স্ট্যাটাস</option>
                  <option value="pending">অপেক্ষমান</option>
                  <option value="received">উপস্থিত / রিসিভড</option>
                  <option value="not_attended">আসলো না (যোগাযোগ)</option>
                  <option value="contacted">যোগাযোগ সম্পন্ন</option>
                </select>
              </div>
            </div>

            {/* Date Filtering Bar */}
            <div className="flex flex-wrap items-center gap-2 pt-1">
              <span className="text-xs font-bold text-slate-600 flex items-center gap-1">
                <Filter className="w-3.5 h-3.5 text-rose-500" />
                <span>তারিখ ফিল্টার:</span>
              </span>

              <button
                type="button"
                onClick={() => { setDateFilter('all'); setSpecificFilterDate(''); }}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  dateFilter === 'all'
                    ? 'bg-rose-600 text-white shadow-2xs'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                }`}
              >
                সকল তারিখ
              </button>

              <button
                type="button"
                onClick={() => { setDateFilter('today'); setSpecificFilterDate(''); }}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  dateFilter === 'today'
                    ? 'bg-rose-600 text-white shadow-2xs'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                }`}
              >
                আজ ({formatDateToDDMMYYYY(todayStr)})
              </button>

              <button
                type="button"
                onClick={() => { setDateFilter('tomorrow'); setSpecificFilterDate(''); }}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  dateFilter === 'tomorrow'
                    ? 'bg-rose-600 text-white shadow-2xs'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                }`}
              >
                আগামীকাল ({formatDateToDDMMYYYY(tomorrowStr)})
              </button>

              {/* Custom Date Input for Filtering */}
              <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-lg px-2 py-1">
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                <input
                  type="date"
                  value={specificFilterDate}
                  onChange={(e) => {
                    setSpecificFilterDate(e.target.value);
                    if (e.target.value) setDateFilter('specific');
                  }}
                  className="bg-transparent text-xs text-slate-700 font-['Plus_Jakarta_Sans',sans-serif] outline-none"
                  title="নির্দিষ্ট তারিখ দিয়ে দেখুন"
                />
                {specificFilterDate && (
                  <button
                    onClick={() => { setSpecificFilterDate(''); setDateFilter('all'); }}
                    className="text-slate-400 hover:text-slate-600 text-xs"
                  >
                    ×
                  </button>
                )}
              </div>
            </div>

            {/* Search Input */}
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="কাস্টমারের নাম, ফোন নম্বর, সেবা বা ঠিকানা দিয়ে খুঁজুন..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder:text-slate-400 focus:bg-white focus:ring-1 focus:ring-rose-500 outline-none transition-all"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs"
                >
                  ✕
                </button>
              )}
            </div>

          </div>

          {/* Appointments List Container */}
          <div id="printable-appointments-table" className="space-y-3 pt-2">
            
            {/* Header when printing */}
            <div className="hidden print:block border-b-2 border-slate-900 pb-3 mb-4 text-center">
              <h1 className="text-xl font-bold text-slate-900">তনু বিউটি পার্লার ও লেজার সেন্টার</h1>
              <p className="text-xs text-slate-600">অ্যাপয়েন্টমেন্ট বুকিং ও কাস্টমার তালিকা ({dateFilter === 'today' ? 'আজকের' : 'সার্বিক'})</p>
              <p className="text-[11px] text-slate-500 font-['Plus_Jakarta_Sans',sans-serif]">প্রিন্ট তারিখ: {new Date().toLocaleDateString('bn-BD')}</p>
            </div>

            {filteredAppointments.length === 0 ? (
              <div className="p-8 text-center bg-slate-50 border border-slate-200/60 rounded-2xl space-y-2">
                <Calendar className="w-8 h-8 text-slate-300 mx-auto" />
                <h4 className="text-sm font-bold text-slate-700">কোনো অ্যাপয়েন্টমেন্ট পাওয়া যায়নি</h4>
                <p className="text-xs text-slate-400">
                  {searchQuery || dateFilter !== 'all' || statusFilter !== 'all'
                    ? 'ফিল্টার পরিবর্তন করে পুনরায় চেষ্টা করুন।'
                    : 'বাম পাশের ফর্ম ব্যবহার করে প্রথম অ্যাপয়েন্টমেন্ট এন্ট্রি করুন।'}
                </p>
              </div>
            ) : (
              filteredAppointments.map((apt) => {
                const isToday = apt.date === todayStr;
                const isReceived = apt.status === 'received';
                const isNotAttended = apt.status === 'not_attended';
                const isContacted = apt.status === 'contacted';

                return (
                  <div
                    key={apt.id}
                    className={`p-4 rounded-2xl border transition-all space-y-3 ${
                      isReceived
                        ? 'bg-emerald-50/40 border-emerald-200'
                        : isNotAttended
                        ? 'bg-red-50/40 border-red-200'
                        : isToday
                        ? 'bg-rose-50/30 border-rose-200'
                        : 'bg-white border-slate-200/80 hover:border-slate-300'
                    }`}
                  >
                    {/* Top Row: Name, Status & Date */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="font-extrabold text-slate-900 text-sm sm:text-base">
                          {apt.name}
                        </span>
                        
                        {/* Status Badge */}
                        {isReceived && (
                          <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-extrabold flex items-center gap-1">
                            <Check className="w-3 h-3" />
                            <span>উপস্থিত / রিসিভড</span>
                          </span>
                        )}

                        {isNotAttended && (
                          <span className="px-2.5 py-0.5 rounded-full bg-red-100 text-red-700 text-[10px] font-extrabold flex items-center gap-1">
                            <AlertCircle className="w-3 h-3" />
                            <span>আসলো না (যোগাযোগ করুন)</span>
                          </span>
                        )}

                        {isContacted && (
                          <span className="px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-800 text-[10px] font-extrabold flex items-center gap-1">
                            <MessageCircle className="w-3 h-3" />
                            <span>যোগাযোগ সম্পন্ন</span>
                          </span>
                        )}

                        {apt.status === 'pending' && (
                          <span className="px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800 text-[10px] font-bold">
                            অপেক্ষমান
                          </span>
                        )}

                        {isToday && (
                          <span className="px-2 py-0.5 rounded-full bg-rose-500 text-white text-[10px] font-extrabold">
                            আজকের
                          </span>
                        )}
                      </div>

                      {/* Date Display (দিন/মাস ও বছর) */}
                      <div className="flex items-center gap-2 text-xs font-['Plus_Jakarta_Sans',sans-serif]">
                        <span className="px-2.5 py-1 rounded-lg bg-slate-100 text-slate-800 font-bold border border-slate-200/70 flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5 text-rose-500" />
                          <span>{apt.dateDisplay}</span>
                        </span>
                        {apt.time && (
                          <span className="text-slate-500 text-[11px] font-semibold flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            <span>{apt.time}</span>
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Middle Row: Phone, Address, Service */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs text-slate-600 pt-1">
                      
                      {/* Phone */}
                      <div className="flex items-center gap-1.5">
                        <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span className="font-['Plus_Jakarta_Sans',sans-serif] font-bold text-slate-800">
                          {apt.phone}
                        </span>
                      </div>

                      {/* Address */}
                      <div className="flex items-center gap-1.5 truncate">
                        <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span className="truncate" title={apt.address}>{apt.address}</span>
                      </div>

                      {/* Service */}
                      <div className="flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                        <span className="font-bold text-slate-900 truncate" title={apt.service}>
                          {apt.service}
                        </span>
                      </div>

                    </div>

                    {/* Optional Notes / Contact Notes */}
                    {(apt.notes || apt.contactNotes) && (
                      <div className="text-[11px] text-slate-500 bg-slate-50 p-2.5 rounded-xl border border-slate-200/60 space-y-1">
                        {apt.notes && (
                          <div>
                            <b className="text-slate-700">নোট:</b> {apt.notes}
                          </div>
                        )}
                        {apt.contactNotes && (
                          <div className="text-blue-700">
                            <b>যোগাযোগের বিবরণ:</b> {apt.contactNotes}
                          </div>
                        )}
                      </div>
                    )}

                    {/* Action Buttons Row (রিসিভ করুন & যোগাযোগ করুন) */}
                    <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-100">
                      
                      {/* Left Side: Status Actions */}
                      <div className="flex items-center flex-wrap gap-2">
                        
                        {/* 1. Receive Button (যে আসবে তাকে রিসিভ করতে পারবো) */}
                        {!isReceived ? (
                          <button
                            type="button"
                            onClick={() => setConfirmReceivingAppt(apt)}
                            className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer shadow-2xs"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>রিসিভ করুন</span>
                          </button>
                        ) : (
                          <div className="flex items-center gap-2">
                            <span className="text-[11px] text-emerald-700 font-bold flex items-center gap-1">
                              <Check className="w-3.5 h-3.5" />
                              <span>রিসিভড সম্পন্ন</span>
                            </span>
                            {onOpenManualBilling && (
                              <button
                                type="button"
                                onClick={() =>
                                  onOpenManualBilling({
                                    name: apt.name,
                                    phone: apt.phone,
                                    service: apt.service,
                                  })
                                }
                                className="px-2.5 py-1 rounded-lg bg-emerald-100 hover:bg-emerald-200 text-emerald-800 text-[11px] font-bold flex items-center gap-1 cursor-pointer transition-colors"
                              >
                                <FileText className="w-3 h-3" />
                                <span>বিল তৈরি করুন</span>
                              </button>
                            )}
                          </div>
                        )}

                        {/* 2. Missed / Not Attended Action */}
                        {!isReceived && (
                          <button
                            type="button"
                            onClick={() => handleMarkNotAttended(apt)}
                            className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer border ${
                              isNotAttended
                                ? 'bg-red-100 text-red-800 border-red-200'
                                : 'bg-slate-100 hover:bg-red-50 text-slate-700 hover:text-red-700 border-slate-200'
                            }`}
                          >
                            <AlertCircle className="w-3.5 h-3.5" />
                            <span>আসলো না</span>
                          </button>
                        )}

                      </div>

                      {/* Right Side: Communication Tools (যে আসলো না তার সাথে আমি যোগাযোগ করতে পারবো) */}
                      <div className="flex items-center gap-1.5">
                        
                        {/* Direct Phone Call */}
                        <a
                          href={`tel:${apt.phone}`}
                          className="px-2.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer border border-slate-200"
                          title="সরাসরি কল করুন"
                        >
                          <PhoneCall className="w-3.5 h-3.5 text-emerald-600" />
                          <span className="hidden sm:inline">কল করুন</span>
                        </a>

                        {/* WhatsApp Reminder Message */}
                        <button
                          type="button"
                          onClick={() => handleOpenWhatsApp(apt)}
                          className="px-2.5 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer border border-emerald-200"
                          title="হোয়াটসঅ্যাপে অ্যাপয়েন্টমেন্ট রিমাইন্ডার বা মেসেজ পাঠান"
                        >
                          <MessageCircle className="w-3.5 h-3.5 text-emerald-600" />
                          <span>WhatsApp</span>
                        </button>

                        {/* Add Contact / Follow-up Note */}
                        <button
                          type="button"
                          onClick={() => {
                            setContactingAppt(apt);
                            setContactNoteText(apt.contactNotes || '');
                          }}
                          className="px-2.5 py-1.5 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer border border-blue-200"
                          title="কথোপকথনের নোট বা প্রতিক্রিয়া সংরক্ষণ করুন"
                        >
                          <FileText className="w-3.5 h-3.5 text-blue-600" />
                          <span className="hidden sm:inline">নোট</span>
                        </button>

                      </div>

                    </div>

                  </div>
                );
              })
            )}

          </div>

        </div>

      </div>

      {/* ========================================================================= */}
      {/* 3. CONTACT NOTES MODAL */}
      {/* ========================================================================= */}
      {contactingAppt && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-white rounded-2xl shadow-xl border border-slate-200 p-6 space-y-4 font-['Anek_Bangla',sans-serif]">
            
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h4 className="font-extrabold text-slate-900 text-base">
                  কাস্টমার যোগাযোগ নোট
                </h4>
                <p className="text-xs text-slate-500">
                  {contactingAppt.name} • {contactingAppt.phone}
                </p>
              </div>
              <button
                onClick={() => setContactingAppt(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700">
                যোগাযোগের ফলাফল বা কাস্টমারের বক্তব্য লিখুন:
              </label>
              <textarea
                rows={3}
                placeholder="যেমন: কথা হয়েছে, আজ আসতে পারবেন না, আগামী শুক্রবার আসবেন..."
                value={contactNoteText}
                onChange={(e) => setContactNoteText(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-rose-500 outline-none text-xs text-slate-800 resize-none"
                autoFocus
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setContactingAppt(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 cursor-pointer"
              >
                বাতিল
              </button>
              <button
                type="button"
                onClick={handleSaveContactNote}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold cursor-pointer transition-colors shadow-xs"
              >
                সংরক্ষণ ও যোগাযোগ সম্পন্ন
              </button>
            </div>

          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 4. RECEIVE CONFIRMATION POPUP MODAL (কাস্টমার উপস্থিতি নিশ্চিতকরণ) */}
      {/* ========================================================================= */}
      {confirmReceivingAppt && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-white rounded-2xl shadow-2xl border border-slate-200 p-5 sm:p-6 space-y-4 font-['Anek_Bangla',sans-serif] animate-in fade-in zoom-in-95 duration-150">
            
            {/* Header with Icon */}
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-100 shadow-2xs shrink-0">
                  <UserCheck className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="text-base font-extrabold text-slate-900 leading-tight">
                    উপস্থিতি যাচাই ও রিসিভ
                  </h4>
                  <p className="text-xs text-slate-500">
                    তনু বিউটি পার্লার ও লেজার
                  </p>
                </div>
              </div>
              <button
                onClick={() => setConfirmReceivingAppt(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Requested Prominent Message Banner */}
            <div className="bg-amber-50/90 border border-amber-200/90 rounded-2xl p-4 text-slate-800 text-xs sm:text-sm leading-relaxed font-semibold text-center shadow-2xs">
              “উনি কি পার্লারে এসেছেন? যদি আসে তবে রিসিভ করুন নয়তো রিসিভ করবেন না আর বুকিং করা তারিখে না আসলে দিন শেষে আসলো না এটায় ক্লিক করতে পারেন।”
            </div>

            {/* Appointment Details Card */}
            <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-3.5 space-y-2 text-xs">
              <div className="flex justify-between items-center">
                <span className="text-slate-500 font-medium">কাস্টমারের নাম:</span>
                <span className="font-extrabold text-slate-900 text-sm">{confirmReceivingAppt.name}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-500 font-medium">মোবাইল নম্বর:</span>
                <span className="font-bold text-slate-800 font-['Plus_Jakarta_Sans',sans-serif]">{confirmReceivingAppt.phone}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-500 font-medium">সেবা / ট্রিটমেন্ট:</span>
                <span className="font-bold text-rose-600">{confirmReceivingAppt.service}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-500 font-medium">বুকিং তারিখ ও সময়:</span>
                <span className="font-bold text-slate-700 font-['Plus_Jakarta_Sans',sans-serif]">
                  {confirmReceivingAppt.dateDisplay} {confirmReceivingAppt.time ? `(${confirmReceivingAppt.time})` : ''}
                </span>
              </div>
              {confirmReceivingAppt.address && (
                <div className="flex justify-between items-center">
                  <span className="text-slate-500 font-medium">ঠিকানা:</span>
                  <span className="text-slate-700 truncate max-w-[200px]">{confirmReceivingAppt.address}</span>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="space-y-2 pt-1">
              <button
                type="button"
                onClick={() => {
                  const target = confirmReceivingAppt;
                  setConfirmReceivingAppt(null);
                  handleMarkReceived(target);
                }}
                className="w-full py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs sm:text-sm flex items-center justify-center gap-2 transition-colors cursor-pointer shadow-xs"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>হ্যাঁ, উনি এসেছেন — রিসিভ করুন</span>
              </button>

              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => {
                    const target = confirmReceivingAppt;
                    setConfirmReceivingAppt(null);
                    handleMarkNotAttended(target);
                  }}
                  className="py-2 px-3 rounded-xl bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                >
                  <AlertCircle className="w-3.5 h-3.5" />
                  <span>আসলো না</span>
                </button>
                <button
                  type="button"
                  onClick={() => setConfirmReceivingAppt(null)}
                  className="py-2 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs flex items-center justify-center transition-colors cursor-pointer"
                >
                  <span>বাতিল / অপেক্ষা করুন</span>
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
