import { api } from './api';

export const authService = {
  async register(data) {
    return api.post('/auth/register', data);
  },

  async login(data) {
    return api.post('/auth/login', data);
  },

  async getProfile() {
    return api.get('/auth/me');
  },

  async refresh() {
    return api.post('/auth/refresh', {});
  },

  async updateProfile(data) {
    return api.put('/auth/profile', data);
  },

  async logout() {
    return api.post('/auth/logout', {});
  },
};
