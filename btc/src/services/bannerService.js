import { api } from './api';

export const bannerService = {
  // Active homepage sliders, already filtered by schedule and ordered (Admin → Home Page Sliders).
  async getBanners() {
    return api.get('/banners');
  },
};
