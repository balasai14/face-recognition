import api from './api';

export const crowdService = {
  async countCrowd(formData) {
    const response = await api.post('/crowd/count', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },

  async getHistory(filters = {}) {
    const params = new URLSearchParams(filters);
    const response = await api.get(`/crowd/history?${params}`);
    return response.data;
  },
};
