import { api } from './api';

export const categoryService = {
  async getCategories() {
    return api.get('/categories');
  },
  
  async getCategoryBySlug(slug) {
    return api.get(`/categories/${slug}`);
  },
};
