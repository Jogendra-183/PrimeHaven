import apiClient from './apiClient';

export const visitApi = {
  // Get visits with optional status filter (role determines returned set)
  getAll: async (status = '') => {
    const params = {};
    if (status && status !== 'ALL') {
      params.status = status;
    }
    const response = await apiClient.get('/visits', { params });
    return response.data;
  },

  // Get specific visit by ID
  getById: async (id) => {
    const response = await apiClient.get(`/visits/${id}`);
    return response.data;
  },

  // Schedule a new visit (CLIENT or ADMIN)
  create: async (visitData) => {
    const payload = {
      propertyId: Number(visitData.propertyId),
      visitDate: visitData.visitDate, // ISO String / LocalDateTime format
      notes: visitData.notes?.trim() || '',
    };
    const response = await apiClient.post('/visits', payload);
    return response.data;
  },

  // Update visit notes or date
  update: async (id, visitData) => {
    const payload = {
      propertyId: visitData.propertyId ? Number(visitData.propertyId) : undefined,
      visitDate: visitData.visitDate,
      notes: visitData.notes?.trim(),
    };
    const response = await apiClient.put(`/visits/${id}`, payload);
    return response.data;
  },

  // Cancel or delete visit
  delete: async (id) => {
    const response = await apiClient.delete(`/visits/${id}`);
    return response.data;
  },

  // Update visit status (CONFIRMED, COMPLETED, CANCELLED)
  updateStatus: async (id, status) => {
    const response = await apiClient.put(`/visits/${id}/status`, { status });
    return response.data;
  },
};

export default visitApi;
