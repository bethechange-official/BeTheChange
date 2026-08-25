const ADMIN_AUTH_KEY = 'btc_admin_auth';

export const adminAuth = {
  login: (email, password) => {
    if (email.toLowerCase() === 'admin@btc.com' && password === 'admin123') {
      const sessionData = {
        email,
        name: 'BTC Administrator',
        role: 'Admin',
        isLoggedIn: true,
        loggedInAt: new Date().toISOString()
      };
      localStorage.setItem(ADMIN_AUTH_KEY, JSON.stringify(sessionData));
      return { success: true };
    }
    return { success: false, message: 'Invalid admin email or password.' };
  },

  logout: () => {
    localStorage.removeItem(ADMIN_AUTH_KEY);
  },

  getCurrentAdmin: () => {
    try {
      const data = localStorage.getItem(ADMIN_AUTH_KEY);
      return data ? JSON.parse(data) : null;
    } catch {
      return null;
    }
  },

  isAuthenticated: () => {
    try {
      const data = localStorage.getItem(ADMIN_AUTH_KEY);
      if (!data) return false;
      const parsed = JSON.parse(data);
      return Boolean(parsed && parsed.isLoggedIn);
    } catch {
      return false;
    }
  }
};
