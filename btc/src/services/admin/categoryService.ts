import { adminApi, handleApiError } from './api';

export const adminCategoryService = {
  async getAll() {
    try {
      return await adminApi.getCategories();
    } catch (error) {
      throw handleApiError(error);
    }
  },

  async create(data: {
    name: string;
    slug: string;
    description?: string;
    imageUrl?: string;
    isActive?: boolean;
  }) {
    try {
      return await adminApi.createCategory(data);
    } catch (error) {
      throw handleApiError(error);
    }
  },

  async update(id: string, data: {
    name?: string;
    slug?: string;
    description?: string;
    imageUrl?: string;
    isActive?: boolean;
  }) {
    try {
      return await adminApi.updateCategory(id, data);
    } catch (error) {
      throw handleApiError(error);
    }
  },

  async delete(id: string) {
    try {
      return await adminApi.deleteCategory(id);
    } catch (error) {
      throw handleApiError(error);
    }
  },
};