import api from './api';

export const groupService = {
  async authenticateGroup(formData) {
    const response = await api.post('/group/authenticate', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },

  async getAttendance(eventId) {
    const response = await api.get(`/group/attendance/${eventId}`);
    return response.data;
  },

  async getAttendanceHistory(filters = {}) {
    const params = new URLSearchParams(filters);
    const response = await api.get(`/group/attendance/history?${params}`);
    return response.data;
  },
};
