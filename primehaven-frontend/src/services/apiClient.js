import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:6001';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 15000,
});

// Request interceptor: attach JWT token to both Token and Authorization headers
apiClient.interceptors.request.use(
  (config) => {
    try {
      const token = localStorage.getItem('primehaven_token');
      if (token) {
        config.headers['Authorization'] = `Bearer ${token}`;
        config.headers['Token'] = token;
      }
    } catch (e) {
      console.warn('Failed to retrieve token from storage', e);
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor: graceful error normalization
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    // Check if unauthorized and handle session expiration
    if (error.response && error.response.status === 401) {
      const currentPath = window.location.pathname;
      if (!currentPath.includes('/signin') && !currentPath.includes('/signup')) {
        // Dispatch custom session-expired event
        window.dispatchEvent(new CustomEvent('primehaven:unauthorized'));
      }
    }
    return Promise.reject(error);
  }
);

export default apiClient;
