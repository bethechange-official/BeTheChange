import { adminApi, handleApiError } from './api';

export const adminOrderService = {
  async getAll(params: {
    page?: number;
    limit?: number;
    search?: string;
    orderStatus?: string;
    paymentStatus?: string;
    sort?: string;
    order?: 'asc' | 'desc';
  } = {}) {
    try {
      return await adminApi.getOrders(params);
    } catch (error) {
      throw handleApiError(error);
    }
  },

  async getById(id: string) {
    try {
      return await adminApi.getOrderById(id);
    } catch (error) {
      throw handleApiError(error);
    }
  },

  async updateStatus(id: string, data: {
    orderStatus?: string;
    paymentStatus?: string;
  }) {
    try {
      return await adminApi.updateOrderStatus(id, data);
    } catch (error) {
      throw handleApiError(error);
    }
  },
};