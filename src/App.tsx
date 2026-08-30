import React, { useState, useEffect } from 'react';
import { PRODUCTS, CATEGORIES } from './data/products';
import { Product, CartItem, DeliveryZone, Order } from './types';
import { getProductsFromFirestore } from './lib/firebase';
import { Header } from './components/Header';
import { HeroSection } from './components/HeroSection';
import { ProductCatalog } from './components/ProductCatalog';
import { ProductDetailPage } from './components/ProductDetailPage';
import { CartDrawer } from './components/CartDrawer';
import { OrderFormModal } from './components/OrderFormModal';
import { OrderSuccessModal } from './components/OrderSuccessModal';
import { TrackOrderModal } from './components/TrackOrderModal';
import { SecurityNotice } from './components/SecurityNotice';
import { Footer } from './components/Footer';
import { FloatingMobileBar } from './components/FloatingMobileBar';
import { TanuBeautySection } from './components/TanuBeautySection';
import { BeautyAppointmentModal } from './components/BeautyAppointmentModal';
import { AdminDashboard } from './components/AdminDashboard';
import { Check, ShoppingBag, ShieldCheck, Truck } from 'lucide-react';

export default function App() {
  // Navigation View State: 'website' | 'admin'
  const [currentView, setCurrentView] = useState<'website' | 'admin'>('website');

  // Load products from localStorage or default PRODUCTS
  const [products, setProducts] = useState<Product[]>(() => {
    try {
      const saved = localStorage.getItem('tanu_products');
      return saved ? JSON.parse(saved) : PRODUCTS;
    } catch {
      return PRODUCTS;
    }
  });

  // Modal & Filter States
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [deliveryZone, setDeliveryZone] = useState<DeliveryZone>('inside_dhaka');
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isOrderFormOpen, setIsOrderFormOpen] = useState(false);
  const [completedOrder, setCompletedOrder] = useState<Order | null>(null);
  const [isTrackModalOpen, setIsTrackModalOpen] = useState(false);
  const [trackOrderId, setTrackOrderId] = useState('');
  const [isAppointmentModalOpen, setIsAppointmentModalOpen] = useState(false);
  const [appointmentService, setAppointmentService] = useState('');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Load products from Firestore
  useEffect(() => {
    async function loadFirestoreProducts() {
      try {
        const fsProducts = await getProductsFromFirestore();
        if (fsProducts && fsProducts.length > 0) {
          setProducts(fsProducts);
          localStorage.setItem('tanu_products', JSON.stringify(fsProducts));
        }
      } catch (err) {
        console.error('Failed to load products from Firestore:', err);
      }
    }
    loadFirestoreProducts();
  }, []);

  // Helper to push history state when opening a modal or view
  const pushModalHistory = (type: string) => {
    try {
      window.history.pushState({ modal: type, timestamp: Date.now() }, '');
    } catch (e) {
      console.error(e);
    }
  };

  // Synchronized Browser & Hardware Back Button Handler
  useEffect(() => {
    // Initial history state setup
    try {
      if (!window.history.state || !window.history.state.root) {
        window.history.replaceState({ root: true, view: 'website' }, '');
      }
    } catch (e) {
      console.error(e);
    }

    const handlePopState = (event: PopStateEvent) => {
      // Step-by-step Back Navigation: Closes whichever layer is open
      if (completedOrder) {
        setCompletedOrder(null);
        return;
      }
      if (isOrderFormOpen) {
        setIsOrderFormOpen(false);
        return;
      }
      if (isAppointmentModalOpen) {
        setIsAppointmentModalOpen(false);
        return;
      }
      if (isTrackModalOpen) {
        setIsTrackModalOpen(false);
        return;
      }
      if (isCartOpen) {
        setIsCartOpen(false);
        return;
      }
      if (quickViewProduct) {
        setQuickViewProduct(null);
        return;
      }
      if (currentView === 'admin') {
        setCurrentView('website');
        return;
      }
      if (selectedCategory !== 'all') {
        setSelectedCategory('all');
        return;
      }
      if (searchQuery !== '') {
        setSearchQuery('');
        return;
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [
    completedOrder,
    isOrderFormOpen,
    isAppointmentModalOpen,
    isTrackModalOpen,
    isCartOpen,
    quickViewProduct,
    currentView,
    selectedCategory,
    searchQuery,
  ]);

  // Always return to home page and reset views
  const handleGoHome = () => {
    setQuickViewProduct(null);
    setIsCartOpen(false);
    setIsOrderFormOpen(false);
    setCompletedOrder(null);
    setIsTrackModalOpen(false);
    setIsAppointmentModalOpen(false);
    setCurrentView('website');
    setSelectedCategory('all');
    setSearchQuery('');
    window.scrollTo({ top: 0, behavior: 'smooth' });
    try {
      window.history.replaceState({ root: true, view: 'website' }, '');
    } catch (e) {
      console.error(e);
    }
  };

  // Check URL query parameters or hash for direct product sharing (?product=PROD_ID)
  useEffect(() => {
    const handleUrlProduct = () => {
      try {
        const urlParams = new URLSearchParams(window.location.search);
        const productId = urlParams.get('product') || urlParams.get('p');
        const trackId = urlParams.get('track') || urlParams.get('order');
        const adminParam = urlParams.get('admin');

        if (adminParam === 'true' || adminParam === '1') {
          setCurrentView('admin');
        }

        if (trackId) {
          setTrackOrderId(trackId);
          setIsTrackModalOpen(true);
        }

        if (productId && products.length > 0) {
          const match = products.find((p) => p.id === productId);
          if (match) {
            setQuickViewProduct(match);
            setTimeout(() => {
              const elem = document.getElementById(`product-${match.id}`) || document.getElementById('catalog-section');
              if (elem) {
                elem.scrollIntoView({ behavior: 'smooth' });
              }
            }, 300);
          }
        }
      } catch (err) {
        console.error('Error handling URL product:', err);
      }
    };

    handleUrlProduct();
  }, [products]);

  const handleUpdateProducts = (updatedList: Product[]) => {
    setProducts(updatedList);
    try {
      localStorage.setItem('tanu_products', JSON.stringify(updatedList));
    } catch (e) {
      console.error('Failed to save products to localStorage', e);
    }
  };

  // Cart items state
  const [cartItems, setCartItems] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem('deshibazar_cart');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Save cart to localStorage on change
  useEffect(() => {
    try {
      localStorage.setItem('deshibazar_cart', JSON.stringify(cartItems));
    } catch (e) {
      console.error('Failed to save cart to storage:', e);
    }
  }, [cartItems]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const totalCartCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);
  const cartSubtotal = cartItems.reduce((sum, item) => sum + item.product.price * item.quantity, 0);

  // Cart actions
  const handleAddToCart = (
    product: Product,
    quantity = 1,
    selectedColor?: string,
    selectedSize?: string
  ) => {
    setCartItems((prevItems) => {
      const existingIndex = prevItems.findIndex((it) => it.product.id === product.id);
      if (existingIndex > -1) {
        const updated = [...prevItems];
        updated[existingIndex].quantity += quantity;
        if (selectedColor) updated[existingIndex].selectedColor = selectedColor;
        if (selectedSize) updated[existingIndex].selectedSize = selectedSize;
        return updated;
      } else {
        return [...prevItems, { product, quantity, selectedColor, selectedSize }];
      }
    });

    showToast(`"${product.titleBn}" কার্টে যোগ করা হয়েছে!`);
  };

  const handleDirectOrder = (
    product: Product,
    quantity = 1,
    selectedColor?: string,
    selectedSize?: string
  ) => {
    handleAddToCart(product, quantity, selectedColor, selectedSize);
    if (quickViewProduct) setQuickViewProduct(null);
    pushModalHistory('orderForm');
    setIsOrderFormOpen(true);
  };

  const handleUpdateQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      handleRemoveItem(productId);
      return;
    }
    setCartItems((prev) =>
      prev.map((item) => (item.product.id === productId ? { ...item, quantity } : item))
    );
  };

  const handleRemoveItem = (productId: string) => {
    setCartItems((prev) => prev.filter((item) => item.product.id !== productId));
    showToast('কার্ট থেকে আইটেম সরানো হয়েছে');
  };

  const handleProceedToCheckout = () => {
    setIsCartOpen(false);
    pushModalHistory('orderForm');
    setIsOrderFormOpen(true);
  };

  const handleOrderComplete = (newOrder: Order) => {
    setCartItems([]);
    localStorage.removeItem('deshibazar_cart');
    setIsOrderFormOpen(false);
    pushModalHistory('orderSuccess');
    setCompletedOrder(newOrder);
  };

  const handleOpenTrackModalWithId = (id = '') => {
    setTrackOrderId(id);
    pushModalHistory('track');
    setIsTrackModalOpen(true);
  };

  const scrollToCatalog = () => {
    const el = document.getElementById('catalog-section');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  if (currentView === 'admin') {
    return (
      <AdminDashboard
        products={products}
        onUpdateProducts={handleUpdateProducts}
        categories={CATEGORIES}
        onToast={showToast}
        onBackToWebsite={() => {
          setCurrentView('website');
          window.history.replaceState({ root: true, view: 'website' }, '');
        }}
      />
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-800 font-['Anek_Bangla','Plus_Jakarta_Sans',sans-serif] pb-20 md:pb-0">
      
      {/* Toast Notification Popup */}
      {toastMessage && (
        <div className="fixed top-20 right-4 z-50 bg-slate-900 text-white px-4 py-3 rounded-2xl shadow-xl border border-slate-700 flex items-center gap-2.5 text-xs sm:text-sm font-semibold animate-in slide-in-from-top duration-300">
          <div className="w-5 h-5 rounded-full bg-emerald-500 text-slate-950 flex items-center justify-center font-bold">
            <Check className="w-3.5 h-3.5" />
          </div>
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Main Header */}
      <Header
        cartCount={totalCartCount}
        cartTotal={cartSubtotal}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onOpenCart={() => {
          pushModalHistory('cart');
          setIsCartOpen(true);
        }}
        onOpenTrackModal={() => handleOpenTrackModalWithId('')}
        categories={CATEGORIES}
        selectedCategory={selectedCategory}
        onSelectCategory={(catId) => {
          pushModalHistory('category');
          setSelectedCategory(catId);
        }}
        onOpenAppointmentModal={() => {
          setAppointmentService('');
          pushModalHistory('appointment');
          setIsAppointmentModalOpen(true);
        }}
        onOpenAdminModal={() => {
          pushModalHistory('admin');
          setCurrentView('admin');
        }}
        onGoHome={handleGoHome}
      />

      {/* Main Content Area */}
      <main className="flex-1">
        {quickViewProduct ? (
          /* Full Page Product Detail View */
          <ProductDetailPage
            product={quickViewProduct}
            onBack={() => setQuickViewProduct(null)}
            onAddToCart={handleAddToCart}
            onDirectOrder={handleDirectOrder}
            onOpenAppointment={(serviceName) => {
              setAppointmentService(serviceName || '');
              pushModalHistory('appointment');
              setIsAppointmentModalOpen(true);
            }}
            onToast={showToast}
          />
        ) : (
          /* Normal Homepage & Catalog View */
          <>
            {/* Hero Section */}
            <HeroSection
              onExploreClick={scrollToCatalog}
              onOpenAppointmentModal={() => {
                setAppointmentService('');
                pushModalHistory('appointment');
                setIsAppointmentModalOpen(true);
              }}
            />

            {/* Tanu Beauty Parlour & Laser Center Featured Section */}
            <TanuBeautySection
              onBookAppointment={(serviceName) => {
                setAppointmentService(serviceName || '');
                pushModalHistory('appointment');
                setIsAppointmentModalOpen(true);
              }}
              onExploreBeautyProducts={() => {
                pushModalHistory('category');
                setSelectedCategory('csa_laser');
                scrollToCatalog();
              }}
            />

            {/* Product Catalog Grid */}
            <ProductCatalog
              products={products}
              categories={CATEGORIES}
              selectedCategory={selectedCategory}
              onSelectCategory={(catId) => {
                pushModalHistory('category');
                setSelectedCategory(catId);
              }}
              searchQuery={searchQuery}
              onQuickView={(p) => {
                pushModalHistory('quickView');
                setQuickViewProduct(p);
              }}
              onAddToCart={handleAddToCart}
              onDirectOrder={handleDirectOrder}
              onToast={showToast}
            />

            {/* Security and Data Protection Section */}
            <SecurityNotice />
          </>
        )}
      </main>

      {/* Footer */}
      <Footer
        onOpenTrackModal={() => handleOpenTrackModalWithId('')}
        onSelectCategory={(catId) => {
          setQuickViewProduct(null);
          pushModalHistory('category');
          setSelectedCategory(catId);
          scrollToCatalog();
        }}
        onOpenAppointmentModal={() => {
          setAppointmentService('');
          pushModalHistory('appointment');
          setIsAppointmentModalOpen(true);
        }}
        onOpenAdminDashboard={() => {
          pushModalHistory('admin');
          setCurrentView('admin');
        }}
      />

      {/* Floating Sticky Mobile Bar */}
      <FloatingMobileBar
        cartCount={totalCartCount}
        cartTotal={cartSubtotal}
        onOpenCart={() => {
          pushModalHistory('cart');
          setIsCartOpen(true);
        }}
        onOpenTrackModal={() => handleOpenTrackModalWithId('')}
        onOpenAppointmentModal={() => {
          setAppointmentService('');
          pushModalHistory('appointment');
          setIsAppointmentModalOpen(true);
        }}
      />

      {/* Modals & Slide-overs */}
      {/* 1. Cart Drawer */}
      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        cartItems={cartItems}
        onUpdateQuantity={handleUpdateQuantity}
        onRemoveItem={handleRemoveItem}
        deliveryZone={deliveryZone}
        onDeliveryZoneChange={setDeliveryZone}
        onProceedToCheckout={handleProceedToCheckout}
      />

      {/* 3. Cash on Delivery Order Form Modal */}
      <OrderFormModal
        isOpen={isOrderFormOpen}
        onClose={() => setIsOrderFormOpen(false)}
        cartItems={cartItems}
        deliveryZone={deliveryZone}
        onDeliveryZoneChange={setDeliveryZone}
        onOrderComplete={handleOrderComplete}
      />

      {/* 4. Order Success Confirmation Modal */}
      <OrderSuccessModal
        order={completedOrder}
        onClose={() => setCompletedOrder(null)}
        onTrackOrder={(id) => handleOpenTrackModalWithId(id)}
      />

      {/* 5. Live Track Order Modal */}
      <TrackOrderModal
        isOpen={isTrackModalOpen}
        onClose={() => setIsTrackModalOpen(false)}
        initialOrderId={trackOrderId}
      />

      {/* 6. Tanu Beauty Parlour Appointment Modal */}
      <BeautyAppointmentModal
        isOpen={isAppointmentModalOpen}
        onClose={() => setIsAppointmentModalOpen(false)}
        preSelectedService={appointmentService}
        onSuccessToast={showToast}
      />

    </div>
  );
}
