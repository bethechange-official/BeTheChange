import { createContext, useContext, useReducer, useEffect, useCallback, useRef, useState } from 'react';
import { cartService } from '../services/cartService';
import { couponService } from '../services/couponService';
import { useAuth } from './AuthContext';
import { settingsService } from '../services/settingsService';

const CartContext = createContext(null);

const COUPON_STORAGE_KEY = 'btc_applied_coupon';
const readStoredCoupon = () => {
  try { return sessionStorage.getItem(COUPON_STORAGE_KEY) || null; } catch { return null; }
};
const storeCoupon = (code) => {
  try {
    if (code) sessionStorage.setItem(COUPON_STORAGE_KEY, code);
    else sessionStorage.removeItem(COUPON_STORAGE_KEY);
  } catch { /* storage unavailable: the coupon just won't survive a reload */ }
};

function cartReducer(state, action) {
  switch (action.type) {
    case 'SET_CART': {
      const items = action.payload.items?.map(item => ({
        ...item.product,
        qty: item.quantity,
        cartItemId: item.id,
        itemTotal: item.price * item.quantity,
      })) || [];
      const subtotal = items.reduce((sum, i) => sum + i.price * i.qty, 0);
      // Preserve existing coupon/discount when reloading cart
      return { ...state, items, subtotal };
    }
    case 'ADD_ITEM': {
      const items = [...state.items];
      const existing = items.find(i => i.id === action.payload.product.id);
      if (existing) {
        existing.qty += action.payload.quantity;
        existing.itemTotal = existing.price * existing.qty;
      } else {
        items.push({
          ...action.payload.product,
          qty: action.payload.quantity,
          cartItemId: action.payload.cartItemId,
          itemTotal: action.payload.product.price * action.payload.quantity,
        });
      }
      const subtotal = items.reduce((sum, i) => sum + i.price * i.qty, 0);
      return { ...state, items, subtotal };
    }
    case 'UPDATE_QTY': {
      if (action.payload.qty < 1) {
        const items = state.items.filter(i => i.id !== action.payload.id);
        const subtotal = items.reduce((sum, i) => sum + i.price * i.qty, 0);
        return { ...state, items, subtotal };
      }
      const items = state.items.map(i =>
        i.id === action.payload.id ? { ...i, qty: action.payload.qty, itemTotal: i.price * action.payload.qty } : i
      );
      const subtotal = items.reduce((sum, i) => sum + i.price * i.qty, 0);
      return { ...state, items, subtotal };
    }
    case 'REMOVE_ITEM': {
      const items = state.items.filter(i => i.id !== action.payload.id);
      const subtotal = items.reduce((sum, i) => sum + i.price * i.qty, 0);
      return { ...state, items, subtotal };
    }
    case 'APPLY_COUPON': {
      if (!action.payload.valid) {
        return { ...state, couponError: action.payload.message, coupon: null, discount: 0 };
      }
      return { ...state, coupon: action.payload.coupon, discount: action.payload.discount, couponError: null };
    }
    case 'REMOVE_COUPON':
      return { ...state, coupon: null, discount: 0, couponError: null };
    case 'CLEAR_CART':
      return { items: [], subtotal: 0, coupon: null, discount: 0, couponError: null };
    default:
      return state;
  }
}

const initialState = { items: [], subtotal: 0, coupon: null, discount: 0, couponError: null };

export function CartProvider({ children }) {
  const [state, dispatch] = useReducer(cartReducer, initialState);
  const [shippingConfig, setShippingConfig] = useState({ shippingFee: 0, freeShippingThreshold: 0 });
  const { user } = useAuth();
  const couponCodeRef = useRef(readStoredCoupon());
  const couponRequestRef = useRef(0);

  const loadCart = useCallback(async () => {
    try {
      const response = await cartService.getCart();
      if (response.success) {
        dispatch({ type: 'SET_CART', payload: response.data.cart });
      }
    } catch (error) {
      console.error('Failed to load cart:', error);
    }
  }, []);

  useEffect(() => {
    loadCart();
  }, [loadCart, user?.id]);

  useEffect(() => {
    settingsService.getPublicSettings()
      .then((response) => {
        if (response.success) setShippingConfig(response.data);
      })
      .catch(() => undefined);
  }, []);

  const addToCart = useCallback(async (product, quantity = 1) => {
    try {
      const response = await cartService.addToCart(product.id, quantity);
      if (response.success) {
        loadCart();
        return { success: true };
      }
      return { success: false, message: response.message };
    } catch (error) {
      return { success: false, message: error.message };
    }
  }, [loadCart]);

  const updateQuantity = useCallback(async (productId, qty) => {
    try {
      const response = await cartService.updateCartItem(productId, qty);
      if (response.success) {
        loadCart();
        return { success: true };
      }
      return { success: false, message: response.message };
    } catch (error) {
      return { success: false, message: error.message };
    }
  }, [loadCart]);

  const removeFromCart = useCallback(async (productId) => {
    try {
      const response = await cartService.removeFromCart(productId);
      if (response.success) {
        loadCart();
        return { success: true };
      }
      return { success: false, message: response.message };
    } catch (error) {
      return { success: false, message: error.message };
    }
  }, [loadCart]);

  const clearCart = useCallback(async () => {
    try {
      const response = await cartService.clearCart();
      if (response.success) {
        couponRequestRef.current++;
        couponCodeRef.current = null;
        storeCoupon(null);
        dispatch({ type: 'CLEAR_CART' });
        return { success: true };
      }
      return { success: false, message: response.message };
    } catch (error) {
      return { success: false, message: error.message };
    }
  }, []);

  // Local-only reset for after an order is placed: the server already emptied the cart in the same transaction.
  const resetCart = useCallback(() => {
    couponRequestRef.current++;
    couponCodeRef.current = null;
    storeCoupon(null);
    dispatch({ type: 'CLEAR_CART' });
  }, []);

  // The server prices the coupon against its own copy of the cart; we only display what it returns.
  const applyCoupon = useCallback(async (code, { revalidating = false } = {}) => {
    const requestId = ++couponRequestRef.current;
    const normalized = String(code || '').trim().toUpperCase();
    try {
      const response = await couponService.validateCoupon(normalized);
      if (requestId !== couponRequestRef.current) return { success: false, stale: true };
      const data = response.data;
      couponCodeRef.current = data.couponCode;
      storeCoupon(data.couponCode);
      dispatch({
        type: 'APPLY_COUPON',
        payload: {
          valid: true,
          discount: data.discountAmount,
          coupon: {
            code: data.couponCode,
            description: data.description,
            discountType: data.discountType,
            discountValue: data.discountValue,
            maximumDiscountAmount: data.maximumDiscountAmount,
            minimumOrderAmount: data.minimumOrderAmount,
          },
        },
      });
      return { success: true };
    } catch (error) {
      if (requestId !== couponRequestRef.current) return { success: false, stale: true };
      couponCodeRef.current = null;
      storeCoupon(null);
      const message = revalidating ? `Coupon ${normalized} was removed: ${error.message}` : error.message;
      dispatch({ type: 'APPLY_COUPON', payload: { valid: false, message } });
      return { success: false, message };
    }
  }, []);

  const removeCoupon = useCallback(() => {
    couponRequestRef.current++;
    couponCodeRef.current = null;
    storeCoupon(null);
    dispatch({ type: 'REMOVE_COUPON' });
  }, []);

  // Re-check the coupon whenever the cart total changes (and restore it after a reload),
  // so the displayed discount always matches what the server will charge.
  useEffect(() => {
    if (couponCodeRef.current && state.items.length > 0) {
      applyCoupon(couponCodeRef.current, { revalidating: true });
    }
  }, [state.subtotal, state.items.length, applyCoupon]);

  const discountedSubtotal = Math.max(0, state.subtotal - state.discount);
  const shippingFee = state.items.length > 0 && (
    shippingConfig.freeShippingThreshold <= 0 || discountedSubtotal < shippingConfig.freeShippingThreshold
  ) ? Number(shippingConfig.shippingFee || 0) : 0;
  const total = discountedSubtotal + shippingFee;
  const itemCount = state.items.reduce((sum, i) => sum + i.qty, 0);

  return (
    <CartContext.Provider value={{
      ...state,
      total,
      shippingFee,
      freeShippingThreshold: Number(shippingConfig.freeShippingThreshold || 0),
      itemCount,
      loadCart,
      addToCart,
      updateQuantity,
      removeFromCart,
      clearCart,
      resetCart,
      applyCoupon,
      removeCoupon,
    }}>
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => useContext(CartContext);
