import React, { createContext, useContext, useState, useEffect } from 'react';
import authApi from '../services/authApi';

const AuthContext = createContext(null);

export const normalizeRole = (role) => {
  if (role === null || role === undefined) return 'CLIENT';
  const roleStr = String(role).toUpperCase().replace('ROLE_', '');
  if (roleStr === '0' || roleStr === '3' || roleStr === 'ADMIN') return 'ADMIN';
  if (roleStr === '2' || roleStr === 'AGENT') return 'AGENT';
  return 'CLIENT';
};

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(() => localStorage.getItem('primehaven_token'));
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem('primehaven_user');
      if (saved) {
        const parsed = JSON.parse(saved);
        return {
          ...parsed,
          roleName: normalizeRole(parsed.role),
        };
      }
    } catch (e) {
      console.error('Failed to parse saved user', e);
    }
    return null;
  });
  const [loading, setLoading] = useState(false);

  // Synchronize auth state and listen for session expiration events
  useEffect(() => {
    const handleUnauthorized = () => {
      logout();
    };

    window.addEventListener('primehaven:unauthorized', handleUnauthorized);
    return () => {
      window.removeEventListener('primehaven:unauthorized', handleUnauthorized);
    };
  }, []);

  const signin = async (credentials) => {
    setLoading(true);
    try {
      const response = await authApi.signin(credentials);

      if (response && response.code === 200) {
        const receivedToken = response.token || response.jwt;
        const roleName = normalizeRole(response.role);

        const userData = {
          id: response.userId,
          username: response.username,
          role: response.role,
          roleName,
          email: response.email,
          fullName: response.fullName || response.username,
          phone: response.phone,
        };

        localStorage.setItem('primehaven_token', receivedToken);
        localStorage.setItem('primehaven_user', JSON.stringify(userData));

        setToken(receivedToken);
        setUser(userData);
        return { success: true, user: userData };
      } else {
        return {
          success: false,
          message: response?.message || 'Login failed. Please check your credentials.',
        };
      }
    } catch (error) {
      const message =
        error.response?.data?.message ||
        error.response?.data?.error ||
        error.message ||
        'Unable to connect to the authentication service.';
      return { success: false, message };
    } finally {
      setLoading(false);
    }
  };

  const signup = async (userData) => {
    setLoading(true);
    try {
      const response = await authApi.signup(userData);
      if (response && (response.code === 200 || response.code === 201)) {
        return { success: true, data: response };
      } else {
        return {
          success: false,
          message: response?.message || 'Registration failed.',
        };
      }
    } catch (error) {
      const message =
        error.response?.data?.message ||
        error.response?.data?.error ||
        error.message ||
        'Registration request failed.';
      return { success: false, message };
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('primehaven_token');
    localStorage.removeItem('primehaven_user');
    setToken(null);
    setUser(null);
  };

  const value = {
    user,
    token,
    isAuthenticated: !!token && !!user,
    role: user?.roleName || 'CLIENT',
    loading,
    signin,
    signup,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;
