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

// Initialize Firebase App
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];

// Initialize Firestore with custom database ID if available
export const db =
  firebaseConfig.firestoreDatabaseId && firebaseConfig.firestoreDatabaseId !== '(default)'
    ? getFirestore(app, firebaseConfig.firestoreDatabaseId)
    : getFirestore(app);

const ORDERS_COLLECTION = 'orders';
const PRODUCTS_COLLECTION = 'products';

// Save or create an order in Firestore
export async function saveOrderToFirestore(order: Order): Promise<boolean> {
  try {
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

// Save products to Firestore
export async function saveProductsToFirestore(products: Product[]): Promise<boolean> {
  try {
    for (const prod of products) {
      const docRef = doc(db, PRODUCTS_COLLECTION, prod.id);
      await setDoc(docRef, prod, { merge: true });
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
