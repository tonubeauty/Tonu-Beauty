import { initializeApp, getApps } from 'firebase/app';
import {
  getFirestore,
  collection,
  doc,
  setDoc,
  getDocs,
  getDoc,
  updateDoc,
  deleteDoc,
  query,
  orderBy,
  onSnapshot
} from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';
import { Order, Product, Appointment, AppointmentStatus, AppointmentServiceCategory } from '../types';

// Safely initialize Firebase App
let app: any = null;
let dbInstance: any = null;

try {
  const config = (firebaseConfig as any) || {};
  if (config && config.projectId && config.apiKey) {
    app = getApps().length === 0 ? initializeApp(config) : getApps()[0];
    dbInstance =
      config.firestoreDatabaseId && config.firestoreDatabaseId !== '(default)'
        ? getFirestore(app, config.firestoreDatabaseId)
        : getFirestore(app);
  } else {
    console.warn('Firebase config incomplete. Running in offline/local mode.');
  }
} catch (err) {
  console.warn('Failed to initialize Firebase app or Firestore:', err);
}

export const db = dbInstance;

const ORDERS_COLLECTION = 'orders';
const PRODUCTS_COLLECTION = 'products';
const SETTINGS_COLLECTION = 'settings';
const SETTINGS_DOC_ID = 'app_config';

export interface AppSettings {
  qrTextMemoEnabled: boolean; // true = On (সরাসরি টেক্সট মেমো, URL বিহীন), false = Off (ওয়েবসাইট রিসিট URL)
  parlourInfo?: {
    branchName: string;
    hotline: string;
    address: string;
    hours: string;
  };
  updatedAt?: string;
}

// Utility to clean undefined fields before saving to Firestore
function cleanForFirestore<T>(data: T): any {
  return JSON.parse(JSON.stringify(data));
}

// Save or create an order in Firestore
export async function saveOrderToFirestore(order: Order): Promise<boolean> {
  try {
    if (!db) return false;
    const docRef = doc(db, ORDERS_COLLECTION, order.orderId);
    const sanitized = cleanForFirestore({
      ...order,
      updatedAt: new Date().toISOString(),
    });
    await setDoc(docRef, sanitized, { merge: true });
    return true;
  } catch (err) {
    console.error('Error saving order to Firestore:', err);
    return false;
  }
}

// Fetch all orders from Firestore
export async function getOrdersFromFirestore(): Promise<Order[]> {
  try {
    if (!db) return [];
    const q = query(collection(db, ORDERS_COLLECTION));
    const snapshot = await getDocs(q);
    const orders: Order[] = [];
    snapshot.forEach((docSnap) => {
      orders.push(docSnap.data() as Order);
    });
    // Sort orders by createdAt descending
    return orders.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  } catch (err) {
    console.error('Error fetching orders from Firestore:', err);
    return [];
  }
}

// Fetch single order by orderId from Firestore
export async function getSingleOrderFromFirestore(orderId: string): Promise<Order | null> {
  try {
    if (!db) return null;
    const docRef = doc(db, ORDERS_COLLECTION, orderId);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return docSnap.data() as Order;
    }
    return null;
  } catch (err) {
    console.error('Error fetching single order from Firestore:', err);
    return null;
  }
}

// Update order status in Firestore
export async function updateOrderStatusInFirestore(
  orderId: string,
  newStatus: Order['status']
): Promise<boolean> {
  try {
    if (!db) return false;
    const docRef = doc(db, ORDERS_COLLECTION, orderId);
    await updateDoc(docRef, {
      status: newStatus,
      updatedAt: new Date().toISOString(),
    });
    return true;
  } catch (err) {
    console.error('Error updating order status in Firestore:', err);
    return false;
  }
}

// Delete order from Firestore
export async function deleteOrderFromFirestore(orderId: string): Promise<boolean> {
  try {
    if (!db) return false;
    const docRef = doc(db, ORDERS_COLLECTION, orderId);
    await deleteDoc(docRef);
    return true;
  } catch (err) {
    console.error('Error deleting order from Firestore:', err);
    return false;
  }
}

// Subscribe to real-time orders updates
export function subscribeToOrders(onUpdate: (orders: Order[]) => void) {
  try {
    if (!db) return () => {};
    const q = query(collection(db, ORDERS_COLLECTION));
    return onSnapshot(
      q,
      (snapshot) => {
        const orders: Order[] = [];
        snapshot.forEach((docSnap) => {
          orders.push(docSnap.data() as Order);
        });
        orders.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        onUpdate(orders);
      },
      (error) => {
        console.error('Firestore snapshot listener error:', error);
      }
    );
  } catch (err) {
    console.error('Error setting up snapshot listener:', err);
    return () => {};
  }
}

// Save single product to Firestore
export async function saveProductToFirestore(product: Product): Promise<boolean> {
  try {
    if (!db) return false;
    const docRef = doc(db, PRODUCTS_COLLECTION, product.id);
    const sanitized = cleanForFirestore({
      ...product,
      updatedAt: new Date().toISOString(),
    });
    await setDoc(docRef, sanitized, { merge: true });
    return true;
  } catch (err) {
    console.error('Error saving product to Firestore:', err);
    return false;
  }
}

// Delete product from Firestore
export async function deleteProductFromFirestore(productId: string): Promise<boolean> {
  try {
    if (!db) return false;
    const docRef = doc(db, PRODUCTS_COLLECTION, productId);
    await deleteDoc(docRef);
    return true;
  } catch (err) {
    console.error('Error deleting product from Firestore:', err);
    return false;
  }
}

// Save products to Firestore
export async function saveProductsToFirestore(products: Product[]): Promise<boolean> {
  try {
    if (!db) return false;
    for (const prod of products) {
      const docRef = doc(db, PRODUCTS_COLLECTION, prod.id);
      const sanitized = cleanForFirestore({
        ...prod,
        updatedAt: new Date().toISOString(),
      });
      await setDoc(docRef, sanitized, { merge: true });
    }
    return true;
  } catch (err) {
    console.error('Error saving products to Firestore:', err);
    return false;
  }
}

// Fetch products from Firestore
export async function getProductsFromFirestore(): Promise<Product[]> {
  try {
    if (!db) return [];
    const snapshot = await getDocs(collection(db, PRODUCTS_COLLECTION));
    const products: Product[] = [];
    snapshot.forEach((docSnap) => {
      products.push(docSnap.data() as Product);
    });
    return products;
  } catch (err) {
    console.error('Error fetching products from Firestore:', err);
    return [];
  }
}

// Subscribe to real-time products updates
export function subscribeToProducts(onUpdate: (products: Product[]) => void) {
  try {
    if (!db) return () => {};
    const q = query(collection(db, PRODUCTS_COLLECTION));
    return onSnapshot(
      q,
      (snapshot) => {
        const products: Product[] = [];
        snapshot.forEach((docSnap) => {
          products.push(docSnap.data() as Product);
        });
        if (products.length > 0) {
          onUpdate(products);
        }
      },
      (error) => {
        console.error('Firestore products snapshot listener error:', error);
      }
    );
  } catch (err) {
    console.error('Error setting up products snapshot listener:', err);
    return () => {};
  }
}

// Save app settings (QR code view option & parlour info) to Firestore
export async function saveAppSettingsToFirestore(settings: Partial<AppSettings>): Promise<boolean> {
  try {
    if (!db) return false;
    const docRef = doc(db, SETTINGS_COLLECTION, SETTINGS_DOC_ID);
    const sanitized = cleanForFirestore({
      ...settings,
      updatedAt: new Date().toISOString(),
    });
    await setDoc(docRef, sanitized, { merge: true });
    return true;
  } catch (err) {
    console.error('Error saving app settings to Firestore:', err);
    return false;
  }
}

// Get app settings from Firestore
export async function getAppSettingsFromFirestore(): Promise<AppSettings | null> {
  try {
    if (!db) return null;
    const docRef = doc(db, SETTINGS_COLLECTION, SETTINGS_DOC_ID);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return docSnap.data() as AppSettings;
    }
    return null;
  } catch (err) {
    console.error('Error fetching app settings from Firestore:', err);
    return null;
  }
}

// Real-time listener for app settings
export function subscribeToAppSettings(onUpdate: (settings: AppSettings) => void) {
  try {
    if (!db) return () => {};
    const docRef = doc(db, SETTINGS_COLLECTION, SETTINGS_DOC_ID);
    return onSnapshot(
      docRef,
      (docSnap) => {
        if (docSnap.exists()) {
          onUpdate(docSnap.data() as AppSettings);
        }
      },
      (error) => {
        console.error('Firestore app settings snapshot listener error:', error);
      }
    );
  } catch (err) {
    console.error('Error setting up app settings listener:', err);
    return () => {};
  }
}

// =========================================================================
// APPOINTMENTS & SERVICES CATALOG MANAGEMENT
// =========================================================================

const APPOINTMENTS_COLLECTION = 'appointments';
const APPOINTMENT_SERVICES_COLLECTION = 'appointment_services';

// Save or update an appointment
export async function saveAppointmentToFirestore(appointment: Appointment): Promise<boolean> {
  try {
    if (!db) return false;
    const docRef = doc(db, APPOINTMENTS_COLLECTION, appointment.id);
    const sanitized = cleanForFirestore({
      ...appointment,
      updatedAt: new Date().toISOString(),
    });
    await setDoc(docRef, sanitized, { merge: true });
    return true;
  } catch (err) {
    console.error('Error saving appointment to Firestore:', err);
    return false;
  }
}

// Fetch all appointments from Firestore
export async function getAppointmentsFromFirestore(): Promise<Appointment[]> {
  try {
    if (!db) return [];
    const q = query(collection(db, APPOINTMENTS_COLLECTION));
    const snapshot = await getDocs(q);
    const appointments: Appointment[] = [];
    snapshot.forEach((docSnap) => {
      appointments.push(docSnap.data() as Appointment);
    });
    // Sort by appointment date / createdAt descending
    return appointments.sort((a, b) => {
      const dateDiff = new Date(b.date).getTime() - new Date(a.date).getTime();
      if (dateDiff !== 0) return dateDiff;
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
  } catch (err) {
    console.error('Error fetching appointments from Firestore:', err);
    return [];
  }
}

// Real-time listener for appointments
export function subscribeToAppointments(onUpdate: (appointments: Appointment[]) => void) {
  try {
    if (!db) return () => {};
    const q = query(collection(db, APPOINTMENTS_COLLECTION));
    return onSnapshot(
      q,
      (snapshot) => {
        const appointments: Appointment[] = [];
        snapshot.forEach((docSnap) => {
          appointments.push(docSnap.data() as Appointment);
        });
        appointments.sort((a, b) => {
          const dateDiff = new Date(b.date).getTime() - new Date(a.date).getTime();
          if (dateDiff !== 0) return dateDiff;
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        });
        onUpdate(appointments);
      },
      (error) => {
        console.error('Firestore appointments snapshot error:', error);
      }
    );
  } catch (err) {
    console.error('Error subscribing to appointments:', err);
    return () => {};
  }
}

// Update status of an appointment (e.g. received, not_attended, contacted)
export async function updateAppointmentStatusInFirestore(
  appointmentId: string,
  status: AppointmentStatus,
  extraData?: Partial<Appointment>
): Promise<boolean> {
  try {
    if (!db) return false;
    const docRef = doc(db, APPOINTMENTS_COLLECTION, appointmentId);
    const updates: any = {
      status,
      updatedAt: new Date().toISOString(),
      ...(extraData || {}),
    };
    if (status === 'received') {
      updates.receivedAt = new Date().toISOString();
    } else if (status === 'contacted') {
      updates.lastContactedAt = new Date().toISOString();
    }
    await updateDoc(docRef, cleanForFirestore(updates));
    return true;
  } catch (err) {
    console.error('Error updating appointment status in Firestore:', err);
    return false;
  }
}

// Delete an appointment
export async function deleteAppointmentFromFirestore(appointmentId: string): Promise<boolean> {
  try {
    if (!db) return false;
    const docRef = doc(db, APPOINTMENTS_COLLECTION, appointmentId);
    await deleteDoc(docRef);
    return true;
  } catch (err) {
    console.error('Error deleting appointment from Firestore:', err);
    return false;
  }
}

// Save or remember a service name into the catalog
export async function saveAppointmentServiceCategory(serviceName: string): Promise<boolean> {
  const trimmed = serviceName.trim();
  if (!trimmed) return false;
  try {
    if (!db) return false;
    // Normalized ID
    const docId = trimmed.toLowerCase().replace(/[\s\-_#,:;./\\]+/g, '-');
    const docRef = doc(db, APPOINTMENT_SERVICES_COLLECTION, docId);
    const existing = await getDoc(docRef);
    if (existing.exists()) {
      const data = existing.data();
      await updateDoc(docRef, { count: (data?.count || 1) + 1 });
    } else {
      await setDoc(docRef, {
        id: docId,
        name: trimmed,
        count: 1,
        createdAt: new Date().toISOString(),
      });
    }
    return true;
  } catch (err) {
    console.error('Error saving appointment service category:', err);
    return false;
  }
}

// Fetch all saved service categories
export async function getAppointmentServiceCategories(): Promise<AppointmentServiceCategory[]> {
  try {
    if (!db) return [];
    const q = query(collection(db, APPOINTMENT_SERVICES_COLLECTION));
    const snapshot = await getDocs(q);
    const list: AppointmentServiceCategory[] = [];
    snapshot.forEach((docSnap) => {
      list.push(docSnap.data() as AppointmentServiceCategory);
    });
    return list.sort((a, b) => (b.count || 0) - (a.count || 0));
  } catch (err) {
    console.error('Error fetching appointment service categories:', err);
    return [];
  }
}

// Real-time listener for saved service categories
export function subscribeToAppointmentServices(onUpdate: (services: AppointmentServiceCategory[]) => void) {
  try {
    if (!db) return () => {};
    const q = query(collection(db, APPOINTMENT_SERVICES_COLLECTION));
    return onSnapshot(
      q,
      (snapshot) => {
        const list: AppointmentServiceCategory[] = [];
        snapshot.forEach((docSnap) => {
          list.push(docSnap.data() as AppointmentServiceCategory);
        });
        list.sort((a, b) => (b.count || 0) - (a.count || 0));
        onUpdate(list);
      },
      (err) => {
        console.error('Firestore appointment services snapshot error:', err);
      }
    );
  } catch (err) {
    console.error('Error subscribing to appointment services:', err);
    return () => {};
  }
}

// Delete a service category from catalog
export async function deleteAppointmentServiceCategory(docId: string): Promise<boolean> {
  try {
    if (!db) return false;
    const docRef = doc(db, APPOINTMENT_SERVICES_COLLECTION, docId);
    await deleteDoc(docRef);
    return true;
  } catch (err) {
    console.error('Error deleting appointment service category:', err);
    return false;
  }
}

