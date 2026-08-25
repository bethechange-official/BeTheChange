import { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);
const USER_SESSION_KEY = 'btc_current_user';
const USER_DB_KEY = 'btc_registered_users';
const ORDERS_KEY = 'btc_user_orders';

// Initial default users for demo
const defaultUsers = [
  {
    id: 'user-1',
    name: 'Sarah Jenkins',
    email: 'sarah@example.com',
    phone: '+91 98765 43210',
    password: 'password123',
    createdAt: '2026-01-15'
  }
];

export function AuthProvider({ children }) {
  // Load registered users from localStorage or initialize with demo users
  const [users, setUsers] = useState(() => {
    try {
      const saved = localStorage.getItem(USER_DB_KEY);
      return saved ? JSON.parse(saved) : defaultUsers;
    } catch {
      return defaultUsers;
    }
  });

  // Current logged in user
  const [user, setUser] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem(USER_SESSION_KEY));
    } catch {
      return null;
    }
  });

  // User orders
  const [orders, setOrders] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem(ORDERS_KEY)) || [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem(USER_DB_KEY, JSON.stringify(users));
  }, [users]);

  useEffect(() => {
    if (user) {
      localStorage.setItem(USER_SESSION_KEY, JSON.stringify(user));
    } else {
      localStorage.removeItem(USER_SESSION_KEY);
    }
  }, [user]);

  useEffect(() => {
    localStorage.setItem(ORDERS_KEY, JSON.stringify(orders));
  }, [orders]);

  // Login handler
  const login = (email, password) => {
    const existing = users.find(u => u.email.toLowerCase() === email.toLowerCase());
    
    if (existing) {
      if (existing.password === password) {
        setUser(existing);
        return { success: true };
      } else {
        return { success: false, message: 'Incorrect password. Please try again.' };
      }
    }

    // Auto-create user if not found (convenient demo mode)
    const newUser = {
      id: 'user-' + Date.now(),
      name: email.split('@')[0].replace('.', ' '),
      email,
      phone: '+91 98765 43210',
      password,
      createdAt: new Date().toISOString().split('T')[0]
    };
    
    setUsers(prev => [...prev, newUser]);
    setUser(newUser);
    return { success: true };
  };

  // Register handler
  const register = (data) => {
    const existing = users.find(u => u.email.toLowerCase() === data.email.toLowerCase());
    if (existing) {
      return { success: false, message: 'An account with this email address already exists.' };
    }

    const newUser = {
      id: 'user-' + Date.now(),
      name: data.name,
      email: data.email,
      phone: data.phone,
      password: data.password,
      createdAt: new Date().toISOString().split('T')[0]
    };

    setUsers(prev => [...prev, newUser]);
    setUser(newUser);
    return { success: true };
  };

  // Logout handler
  const logout = () => {
    setUser(null);
  };

  // Update profile details
  const updateProfile = (updatedData) => {
    if (!user) return { success: false };
    const updatedUser = { ...user, ...updatedData };
    setUser(updatedUser);
    setUsers(prev => prev.map(u => u.id === user.id ? updatedUser : u));
    return { success: true };
  };

  // Save new order to user history
  const saveOrder = (orderData) => {
    const newOrder = {
      ...orderData,
      userId: user ? user.id : 'guest',
      createdAt: new Date().toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    };
    setOrders(prev => [newOrder, ...prev]);
  };

  // Get orders for current user
  const getUserOrders = () => {
    if (!user) return orders.filter(o => o.userId === 'guest');
    return orders.filter(o => o.userId === user.id || o.customer?.email?.toLowerCase() === user.email.toLowerCase());
  };

  return (
    <AuthContext.Provider value={{
      user,
      login,
      register,
      logout,
      updateProfile,
      saveOrder,
      getUserOrders
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
