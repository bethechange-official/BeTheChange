import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authService } from '../services/authService';
import { orderService } from '../services/orderService';
import { setCustomerAccessToken } from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    const initAuth = async () => {
      try {
        const refreshResponse = await authService.refresh();
        const token = refreshResponse.data?.token;
        if (token) {
          setCustomerAccessToken(token);
          const response = await authService.getProfile();
          setUser(response.data.user);
        }
      } catch {
        setCustomerAccessToken(null);
      }
      setLoading(false);
    };
    initAuth();
  }, []);

  const login = useCallback(async (email, password) => {
    try {
      const response = await authService.login({ email, password });
      if (response.success) {
        setCustomerAccessToken(response.data.token);
        setUser(response.data.user);
        return { success: true };
      }
      return { success: false, message: response.message };
    } catch (error) {
      return { success: false, message: error.message };
    }
  }, []);

  const register = useCallback(async (data) => {
    try {
      const response = await authService.register(data);
      if (response.success) {
        setCustomerAccessToken(response.data.token);
        setUser(response.data.user);
        return { success: true };
      }
      return { success: false, message: response.message };
    } catch (error) {
      return { success: false, message: error.message };
    }
  }, []);

  const logout = useCallback(async () => {
    await authService.logout().catch(() => undefined);
    setCustomerAccessToken(null);
    setUser(null);
    setOrders([]);
  }, []);

  useEffect(() => {
    if (!user) return;
    orderService.getMyOrders()
      .then((response) => setOrders(response.data?.orders || []))
      .catch(() => setOrders([]));
  }, [user]);

  const updateProfile = useCallback(async (updatedData) => {
    if (!user) return { success: false };
    try {
      const response = await authService.updateProfile(updatedData);
      if (response.success) {
        const updatedUser = { ...user, ...response.data.user };
        setUser(updatedUser);
        return { success: true };
      }
      return { success: false, message: response.message };
    } catch (error) {
      return { success: false, message: error.message };
    }
  }, [user]);

  return (
    <AuthContext.Provider value={{
      user,
      loading,
      login,
      register,
      logout,
      updateProfile,
      getUserOrders: () => orders,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
