import { api } from './api';

export const productService = {
  async getProducts(params = {}) {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== '') {
        searchParams.append(key, value);
      }
    });
    const query = searchParams.toString();
    return api.get(`/products${query ? `?${query}` : ''}`);
  },

  async getFeaturedProducts() {
    return api.get('/products/featured');
  },

  async getProductBySlug(slug) {
    return api.get(`/products/${slug}`);
  },
};