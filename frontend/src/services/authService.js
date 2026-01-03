import api from './api';

export const authService = {
  async login(email, password) {
    const response = await api.post('/auth/login', { email, password });
    return response.data;
  },

  async register(username, email, password, role = 'user') {
    const response = await api.post('/auth/register', { username, email, password, role });
    return response.data;
  },

  async verify() {
    const response = await api.get('/auth/verify');
    return response.data;
  },
};
