import { api } from './api';

export const orderService = {
  async createOrder(data) {
    return api.post('/orders', data);
  },

  async getMyOrders() {
    return api.get('/orders/my-orders');
  },

  async getOrderByNumber(orderNumber) {
    return api.get(`/orders/${orderNumber}`);
  },
};