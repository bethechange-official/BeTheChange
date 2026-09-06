import { api } from './api';

export const addressService = {
  async getAddresses() {
    return api.get('/addresses');
  },

  async createAddress(data) {
    return api.post('/addresses', data);
  },

  async updateAddress(id, data) {
    return api.put(`/addresses/${id}`, data);
  },

  async deleteAddress(id) {
    return api.delete(`/addresses/${id}`);
  },
};