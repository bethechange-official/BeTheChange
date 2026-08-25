import { initialProducts } from '../data/mockProducts';
import { initialCategories, initialCollections } from '../data/mockCategories';
import { initialCoupons } from '../data/mockCoupons';
import { initialCustomers } from '../data/mockCustomers';
import { initialOrders } from '../data/mockOrders';

const KEYS = {
  PRODUCTS: 'btc_admin_products',
  CATEGORIES: 'btc_admin_categories',
  COLLECTIONS: 'btc_admin_collections',
  COUPONS: 'btc_admin_coupons',
  CUSTOMERS: 'btc_admin_customers',
  ORDERS: 'btc_admin_orders',
  SETTINGS: 'btc_admin_settings'
};

const defaultSettings = {
  storeName: 'Be The Change (BTC)',
  storeEmail: 'contact@bethechange.com',
  storePhone: '+91 98765 43210',
  storeAddress: '12 Botanical Avenue, Jubilee Hills, Hyderabad, Telangana 500033',
  shippingFee: 50,
  freeShippingThreshold: 999,
  lowStockAlertThreshold: 5,
  currency: 'INR'
};

const getItem = (key, fallback) => {
  try {
    const saved = localStorage.getItem(key);
    if (!saved) {
      localStorage.setItem(key, JSON.stringify(fallback));
      return fallback;
    }
    return JSON.parse(saved);
  } catch {
    return fallback;
  }
};

const setItem = (key, value) => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    console.error('LocalStorage write error:', e);
  }
};

export const adminStorage = {
  // PRODUCTS
  getProducts: () => getItem(KEYS.PRODUCTS, initialProducts),
  saveProducts: (products) => setItem(KEYS.PRODUCTS, products),

  // CATEGORIES
  getCategories: () => getItem(KEYS.CATEGORIES, initialCategories),
  saveCategories: (categories) => setItem(KEYS.CATEGORIES, categories),

  // COLLECTIONS
  getCollections: () => getItem(KEYS.COLLECTIONS, initialCollections),
  saveCollections: (collections) => setItem(KEYS.COLLECTIONS, collections),

  // COUPONS
  getCoupons: () => getItem(KEYS.COUPONS, initialCoupons),
  saveCoupons: (coupons) => setItem(KEYS.COUPONS, coupons),

  // CUSTOMERS
  getCustomers: () => getItem(KEYS.CUSTOMERS, initialCustomers),
  saveCustomers: (customers) => setItem(KEYS.CUSTOMERS, customers),

  // ORDERS
  getOrders: () => getItem(KEYS.ORDERS, initialOrders),
  saveOrders: (orders) => setItem(KEYS.ORDERS, orders),

  // SETTINGS
  getSettings: () => getItem(KEYS.SETTINGS, defaultSettings),
  saveSettings: (settings) => setItem(KEYS.SETTINGS, settings)
};
