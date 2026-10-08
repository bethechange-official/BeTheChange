import { api } from './api';

export const collectionService = {
  // Active collections that have products, each with a preview of its products (Admin → Categories → Collections).
  async getCollections(productsPerCollection = 4) {
    return api.get(`/collections?products=${productsPerCollection}`);
  },

  async getCollection(slug) {
    return api.get(`/collections/${encodeURIComponent(slug)}`);
  },
};
