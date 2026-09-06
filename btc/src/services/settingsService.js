import { api } from './api';

export const settingsService = {
  async getPublicSettings() {
    return api.get('/settings');
  },
};
