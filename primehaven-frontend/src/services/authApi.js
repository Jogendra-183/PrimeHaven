import apiClient from './apiClient';

export const authApi = {
  // Sign up a new user (role: 1 = CLIENT, 2 = AGENT)
  signup: async (userData) => {
    const payload = {
      username: userData.username?.trim(),
      password: userData.password,
      email: userData.email?.trim(),
      fullName: userData.fullName?.trim() || userData.name?.trim(),
      phone: userData.phone?.trim(),
      role: userData.role !== undefined ? Number(userData.role) : 1,
    };
    const response = await apiClient.post('/user/signup', payload);
    return response.data;
  },

  // Sign in with username/email/phone and password
  signin: async (credentials) => {
    const rawId = (credentials.username || credentials.email || credentials.identifier || '').trim();
    const payload = {
      username: rawId,
      email: rawId,
      identifier: rawId,
      password: credentials.password,
    };
    const response = await apiClient.post('/user/signin', payload);
    return response.data;
  },
};

export default authApi;
