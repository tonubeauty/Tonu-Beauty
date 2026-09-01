import { initializeApp, getApps } from 'firebase/app';
import {
  getFirestore,
  collection,
  doc,
  setDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  query,
  orderBy,
  onSnapshot
} from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';
import { Order, Product } from '../types';

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

// Save or create an order in Firestore
export async function saveOrderToFirestore(order: Order): Promise<boolean> {
  try {
    if (!db) return false;
    const docRef = doc(db, ORDERS_COLLECTION, order.orderId);
    await setDoc(docRef, {
      ...order,
      updatedAt: new Date().toISOString(),
    });
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
    await setDoc(docRef, {
      ...product,
      updatedAt: new Date().toISOString(),
    }, { merge: true });
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
      await setDoc(docRef, {
        ...prod,
        updatedAt: new Date().toISOString(),
      }, { merge: true });
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
