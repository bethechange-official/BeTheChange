import { api } from './api';

export const contactService = {
  async submitContact(data) {
    return api.post('/contact', data);
  },
};