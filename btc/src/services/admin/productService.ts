import { adminApi, handleApiError } from './api';

export const adminProductService = {
  async getAll(params: {
    page?: number;
    limit?: number;
    search?: string;
    category?: string;
    collection?: string;
    isActive?: boolean;
    stockStatus?: 'IN' | 'LOW' | 'OUT';
    sort?: string;
    order?: 'asc' | 'desc';
  } = {}) {
    try {
      return await adminApi.getProducts(params);
    } catch (error) {
      throw handleApiError(error);
    }
  },

  async getById(id: string) {
    try {
      return await adminApi.getProductById(id);
    } catch (error) {
      throw handleApiError(error);
    }
  },

  async create(data: {
    name: string;
    slug: string;
    category: string;
    collection?: string;
    skinConcern?: string;
    price: number;
    originalPrice?: number;
    stock: number;
    size?: string;
    shortDescription?: string;
    description?: string;
    ingredients?: string;
    benefits?: string;
    usageInstructions?: string;
    isFeatured?: boolean;
    isActive?: boolean;
    images?: string[];
  }) {
    try {
      return await adminApi.createProduct(data);
    } catch (error) {
      throw handleApiError(error);
    }
  },

  async update(id: string, data: {
    name?: string;
    slug?: string;
    category?: string;
    collection?: string;
    skinConcern?: string;
    price?: number;
    originalPrice?: number;
    stock?: number;
    size?: string;
    shortDescription?: string;
    description?: string;
    ingredients?: string;
    benefits?: string;
    usageInstructions?: string;
    isFeatured?: boolean;
    isActive?: boolean;
    images?: string[];
  }) {
    try {
      return await adminApi.updateProduct(id, data);
    } catch (error) {
      throw handleApiError(error);
    }
  },

  async delete(id: string) {
    try {
      return await adminApi.deleteProduct(id);
    } catch (error) {
      throw handleApiError(error);
    }
  },
};