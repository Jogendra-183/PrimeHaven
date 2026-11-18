import apiClient from './apiClient';

export const inquiryApi = {
  // Get inquiries with optional status filter (role determines returned set)
  getAll: async (status = '') => {
    const params = {};
    if (status && status !== 'ALL') {
      params.status = status;
    }
    const response = await apiClient.get('/inquiries', { params });
    return response.data;
  },

  // Get single inquiry details by ID
  getById: async (id) => {
    const response = await apiClient.get(`/inquiries/${id}`);
    return response.data;
  },

  // Submit a new inquiry (CLIENT or ADMIN)
  create: async (inquiryData) => {
    const payload = {
      propertyId: Number(inquiryData.propertyId),
      message: inquiryData.message?.trim(),
    };
    const response = await apiClient.post('/inquiries', payload);
    return response.data;
  },

  // Update inquiry message (client), or answer with response & status (agent/admin)
  update: async (id, updateData) => {
    const payload = {
      message: updateData.message?.trim(),
      response: updateData.response?.trim(),
      status: updateData.status,
    };
    const response = await apiClient.put(`/inquiries/${id}`, payload);
    return response.data;
  },

  // Delete inquiry (Client if OPEN, or Admin)
  delete: async (id) => {
    const response = await apiClient.delete(`/inquiries/${id}`);
    return response.data;
  },

  // Update inquiry status
  updateStatus: async (id, status) => {
    const response = await apiClient.put(`/inquiries/${id}/status`, { status });
    return response.data;
  },
};

export default inquiryApi;
