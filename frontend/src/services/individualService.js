import api from './api';

export const individualService = {
  async register(formData) {
    const response = await api.post('/individual/register', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },

  async authenticate(formData) {
    const response = await api.post('/individual/authenticate', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },

  async getProfile(userId) {
    const response = await api.get(`/individual/${userId}`);
    return response.data;
  },
};
