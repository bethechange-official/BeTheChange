import { api } from './api';

export const couponService = {
  async validateCoupon(code, subtotal) {
    return api.post('/coupons/validate', { code, subtotal });
  },
};