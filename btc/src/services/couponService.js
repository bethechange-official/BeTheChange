import { api } from './api';

export const couponService = {
  // The server prices the coupon against the caller's own cart, so no amounts are sent.
  async validateCoupon(code) {
    return api.post('/coupons/validate', { code });
  },
};
