import { adminApi, handleApiError } from './api';

export const adminCollectionService = {
  async getAll() {
    try {
      return await adminApi.getCollections();
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
      return await adminApi.createCollection(data);
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
      return await adminApi.updateCollection(id, data);
    } catch (error) {
      throw handleApiError(error);
    }
  },

  async delete(id: string) {
    try {
      return await adminApi.deleteCollection(id);
    } catch (error) {
      throw handleApiError(error);
    }
  },
};