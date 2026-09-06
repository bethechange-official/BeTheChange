import { adminApi, setAccessToken, getAccessToken, handleApiError } from './api';

const ADMIN_AUTH_KEY = 'btc_admin_auth';

interface AdminUser {
  email: string;
  name: string;
  role: string;
  isLoggedIn: boolean;
  loggedInAt: string;
}

export const adminAuth = {
  async login(email: string, password: string): Promise<{ success: boolean; message?: string }> {
    try {
      const response = await adminApi.login(email, password);
      if (response.success && response.data) {
        const sessionData: AdminUser = {
          email: response.data.admin.email,
          name: response.data.admin.name,
          role: response.data.admin.role,
          isLoggedIn: true,
          loggedInAt: new Date().toISOString(),
        };
        localStorage.setItem(ADMIN_AUTH_KEY, JSON.stringify(sessionData));
        return { success: true };
      }
      return { success: false, message: response.message };
    } catch (error) {
      const { message } = handleApiError(error);
      return { success: false, message };
    }
  },

  logout(): void {
    adminApi.logout().catch(() => {});
    localStorage.removeItem(ADMIN_AUTH_KEY);
    setAccessToken(null);
  },

  getCurrentAdmin(): AdminUser | null {
    try {
      const data = localStorage.getItem(ADMIN_AUTH_KEY);
      return data ? JSON.parse(data) : null;
    } catch {
      return null;
    }
  },

  isAuthenticated(): boolean {
    try {
      const data = localStorage.getItem(ADMIN_AUTH_KEY);
      if (!data) return false;
      const parsed = JSON.parse(data);
      return Boolean(parsed && parsed.isLoggedIn);
    } catch {
      return false;
    }
  },

  async initializeAuth(): Promise<AdminUser | null> {
    try {
      if (!getAccessToken()) {
        await adminApi.refreshToken();
      }
      const response = await adminApi.getProfile();
      if (response.success && response.data) {
        const sessionData: AdminUser = {
          email: response.data.email,
          name: response.data.name,
          role: response.data.role,
          isLoggedIn: true,
          loggedInAt: new Date().toISOString(),
        };
        localStorage.setItem(ADMIN_AUTH_KEY, JSON.stringify(sessionData));
        return sessionData;
      }
    } catch (error) {
      console.error('Auth initialization failed:', error);
      localStorage.removeItem(ADMIN_AUTH_KEY);
      setAccessToken(null);
    }
    return null;
  },
};
