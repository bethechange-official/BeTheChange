import { createContext, useContext, useReducer, useEffect } from 'react';
import { applyCoupon } from '../data/coupons';

const CartContext = createContext(null);

const STORAGE_KEY = 'btc_cart';

function cartReducer(state, action) {
  switch (action.type) {
    case 'ADD': {
      const existing = state.items.find(i => i.id === action.product.id);
      const items = existing
        ? state.items.map(i => i.id === action.product.id ? { ...i, qty: i.qty + 1 } : i)
        : [...state.items, { ...action.product, qty: 1 }];
      return { ...state, items };
    }
    case 'REMOVE':
      return { ...state, items: state.items.filter(i => i.id !== action.id) };
    case 'UPDATE_QTY': {
      if (action.qty < 1) return { ...state, items: state.items.filter(i => i.id !== action.id) };
      return { ...state, items: state.items.map(i => i.id === action.id ? { ...i, qty: action.qty } : i) };
    }
    case 'APPLY_COUPON': {
      const result = applyCoupon(action.code, action.subtotal);
      if (!result.valid) return { ...state, couponError: result.message, coupon: null, discount: 0 };
      return { ...state, coupon: result.coupon, discount: result.discount, couponError: null };
    }
    case 'REMOVE_COUPON':
      return { ...state, coupon: null, discount: 0, couponError: null };
    case 'CLEAR':
      return { items: [], coupon: null, discount: 0, couponError: null };
    case 'LOAD':
      return action.state;
    default:
      return state;
  }
}

const initialState = { items: [], coupon: null, discount: 0, couponError: null };

export function CartProvider({ children }) {
  const [state, dispatch] = useReducer(cartReducer, initialState, () => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? JSON.parse(saved) : initialState;
    } catch { return initialState; }
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [state]);

  const subtotal = state.items.reduce((sum, i) => sum + i.price * i.qty, 0);
  const total = Math.max(0, subtotal - state.discount);
  const itemCount = state.items.reduce((sum, i) => sum + i.qty, 0);

  return (
    <CartContext.Provider value={{ ...state, subtotal, total, itemCount, dispatch }}>
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => useContext(CartContext);
