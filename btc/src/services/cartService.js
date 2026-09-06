import { api } from './api';

export const cartService = {
  async getCart() {
    return api.get('/cart');
  },

  async addToCart(productId, quantity = 1) {
    return api.post('/cart/items', { productId, quantity });
  },

  async updateCartItem(productId, quantity) {
    return api.put(`/cart/items/${productId}`, { quantity });
  },

  async removeFromCart(productId) {
    return api.delete(`/cart/items/${productId}`);
  },

  async clearCart() {
    return api.delete('/cart/clear');
  },
};