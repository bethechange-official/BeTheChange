import { adminApi, handleApiError } from './api';

export const adminCustomerService = {
  async getAll(params: {
    page?: number;
    limit?: number;
    search?: string;
    status?: 'Active' | 'Inactive';
    sort?: string;
    order?: 'asc' | 'desc';
  } = {}) {
    try {
      return await adminApi.getCustomers(params);
    } catch (error) {
      throw handleApiError(error);
    }
  },

  async getById(id: string) {
    try {
      return await adminApi.getCustomerById(id);
    } catch (error) {
      throw handleApiError(error);
    }
  },

  async updateStatus(id: string, isActive: boolean) {
    try {
      return await adminApi.updateCustomerStatus(id, isActive);
    } catch (error) {
      throw handleApiError(error);
    }
  },
};