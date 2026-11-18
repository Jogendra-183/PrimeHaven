import apiClient from './apiClient';
import { SAMPLE_PROPERTIES, getSamplePropertyById } from '../data/sampleProperties';

export const propertyApi = {
  /**
   * Get all properties with optional filters
   * Prioritizes live backend data; falls back to curated sample portfolio if backend is offline or empty.
   * Returns an Array with .isLiveBackend attached for seamless backwards compatibility.
   */
  getAll: async (filters = {}) => {
    const params = {};
    if (filters.status && filters.status !== 'ALL') {
      params.status = filters.status;
    }
    if (filters.location && filters.location.trim()) {
      params.location = filters.location.trim();
    }

    try {
      const response = await apiClient.get('/properties', { params });
      if (Array.isArray(response.data) && response.data.length > 0) {
        // Tag as real backend data
        const liveProperties = response.data.map((p) => ({
          ...p,
          isSample: false,
        }));
        liveProperties.isLiveBackend = true;
        return liveProperties;
      }
    } catch (err) {
      console.warn('Property service live backend offline or unreachable. Using curated sample portfolio fallback.', err.message);
    }

    // Curated Sample Data Fallback
    let sampleData = [...SAMPLE_PROPERTIES];

    if (filters.location && filters.location.trim()) {
      const query = filters.location.trim().toLowerCase();
      sampleData = sampleData.filter(
        (p) =>
          p.location.toLowerCase().includes(query) ||
          p.title.toLowerCase().includes(query) ||
          (p.city && p.city.toLowerCase().includes(query)) ||
          (p.locality && p.locality.toLowerCase().includes(query))
      );
    }

    if (filters.status && filters.status !== 'ALL') {
      const st = filters.status.toUpperCase();
      sampleData = sampleData.filter(
        (p) => (p.status && p.status.toUpperCase() === st) || (p.listingType && p.listingType.toUpperCase() === st)
      );
    }

    sampleData.isLiveBackend = false;
    return sampleData;
  },

  /**
   * Get single property details by ID
   * Checks live API first, falls back to sample property catalog
   */
  getById: async (id) => {
    try {
      const response = await apiClient.get(`/properties/${id}`);
      if (response.data) {
        return {
          ...response.data,
          isSample: false,
        };
      }
    } catch (err) {
      console.warn(`Failed to fetch property #${id} from live API, checking sample catalog`, err.message);
    }

    const sample = getSamplePropertyById(id);
    if (sample) {
      return {
        ...sample,
        isSample: true,
      };
    }

    throw new Error('Property not found');
  },

  // Create a new property (AGENT or ADMIN)
  create: async (propertyData) => {
    const payload = {
      title: propertyData.title?.trim(),
      description: propertyData.description?.trim(),
      location: propertyData.location?.trim(),
      price: Number(propertyData.price),
      status: propertyData.status || 'AVAILABLE',
      propertyType: propertyData.propertyType || 'Apartment',
      bedrooms: propertyData.bedrooms ? Number(propertyData.bedrooms) : null,
      bathrooms: propertyData.bathrooms ? Number(propertyData.bathrooms) : null,
      area: propertyData.area ? Number(propertyData.area) : null,
      agentId: propertyData.agentId ? Number(propertyData.agentId) : null,
    };
    const response = await apiClient.post('/properties', payload);
    return response.data;
  },

  // Update property details (AGENT or ADMIN)
  update: async (id, propertyData) => {
    const payload = {
      title: propertyData.title?.trim(),
      description: propertyData.description?.trim(),
      location: propertyData.location?.trim(),
      price: propertyData.price !== undefined ? Number(propertyData.price) : undefined,
      status: propertyData.status,
      propertyType: propertyData.propertyType,
      bedrooms: propertyData.bedrooms !== undefined ? Number(propertyData.bedrooms) : undefined,
      bathrooms: propertyData.bathrooms !== undefined ? Number(propertyData.bathrooms) : undefined,
      area: propertyData.area !== undefined ? Number(propertyData.area) : undefined,
      agentId: propertyData.agentId ? Number(propertyData.agentId) : undefined,
    };
    const response = await apiClient.put(`/properties/${id}`, payload);
    return response.data;
  },

  // Delete property (AGENT or ADMIN)
  delete: async (id) => {
    const response = await apiClient.delete(`/properties/${id}`);
    return response.data;
  },

  // Update property status directly
  updateStatus: async (id, status) => {
    const response = await apiClient.put(`/properties/${id}/status`, { status });
    return response.data;
  },
};

export default propertyApi;
