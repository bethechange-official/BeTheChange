import { createContext, useContext, useReducer, useEffect, useCallback, useState } from 'react';
import { cartService } from '../services/cartService';
import { couponService } from '../services/couponService';
import { useAuth } from './AuthContext';
import { settingsService } from '../services/settingsService';

const CartContext = createContext(null);

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
        dispatch({ type: 'CLEAR_CART' });
        return { success: true };
      }
      return { success: false, message: response.message };
    } catch (error) {
      return { success: false, message: error.message };
    }
  }, []);

  const applyCoupon = useCallback(async (code) => {
    try {
      const response = await couponService.validateCoupon(code, state.subtotal);
      if (response.success) {
        dispatch({
          type: 'APPLY_COUPON',
          payload: { valid: true, discount: response.data.discountAmount, coupon: { code: response.data.couponCode } },
        });
        return { success: true };
      }
      dispatch({ type: 'APPLY_COUPON', payload: { valid: false, message: response.message } });
      return { success: false, message: response.message };
    } catch (error) {
      dispatch({ type: 'APPLY_COUPON', payload: { valid: false, message: error.message } });
      return { success: false, message: error.message };
    }
  }, [state.subtotal]);

  const removeCoupon = useCallback(() => {
    dispatch({ type: 'REMOVE_COUPON' });
  }, []);

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
      applyCoupon,
      removeCoupon,
    }}>
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => useContext(CartContext);
