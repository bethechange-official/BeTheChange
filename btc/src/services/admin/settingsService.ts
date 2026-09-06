import { adminApi, handleApiError } from './api';

export const adminSettingsService = {
  async getAll() {
    try {
      return await adminApi.getSettings();
    } catch (error) {
      throw handleApiError(error);
    }
  },

  async update(data: {
    storeName?: string;
    storeEmail?: string;
    storePhone?: string;
    storeAddress?: string;
    shippingFee?: number;
    freeShippingThreshold?: number;
    lowStockAlertThreshold?: number;
    currency?: string;
  }) {
    try {
      return await adminApi.updateSettings(data);
    } catch (error) {
      throw handleApiError(error);
    }
  },
};