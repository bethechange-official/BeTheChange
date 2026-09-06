import { adminApi, handleApiError } from './api';

export const adminCouponService = {
  async getAll(params: {
    page?: number;
    limit?: number;
    search?: string;
    status?: 'Active' | 'Inactive';
    sort?: string;
    order?: 'asc' | 'desc';
  } = {}) {
    try {
      return await adminApi.getCoupons(params);
    } catch (error) {
      throw handleApiError(error);
    }
  },

  async getById(id: string) {
    try {
      return await adminApi.getCouponById(id);
    } catch (error) {
      throw handleApiError(error);
    }
  },

  async create(data: {
    code: string;
    description?: string;
    discountType: 'PERCENTAGE' | 'FLAT';
    discountValue: number;
    minimumOrderAmount?: number;
    maximumDiscountAmount?: number;
    startDate: string;
    expiryDate: string;
    usageLimit: number;
    isActive?: boolean;
  }) {
    try {
      return await adminApi.createCoupon(data);
    } catch (error) {
      throw handleApiError(error);
    }
  },

  async update(id: string, data: {
    code?: string;
    description?: string;
    discountType?: 'PERCENTAGE' | 'FLAT';
    discountValue?: number;
    minimumOrderAmount?: number;
    maximumDiscountAmount?: number;
    startDate?: string;
    expiryDate?: string;
    usageLimit?: number;
    isActive?: boolean;
  }) {
    try {
      return await adminApi.updateCoupon(id, data);
    } catch (error) {
      throw handleApiError(error);
    }
  },

  async toggleStatus(id: string) {
    try {
      return await adminApi.toggleCouponStatus(id);
    } catch (error) {
      throw handleApiError(error);
    }
  },

  async delete(id: string) {
    try {
      return await adminApi.deleteCoupon(id);
    } catch (error) {
      throw handleApiError(error);
    }
  },
};