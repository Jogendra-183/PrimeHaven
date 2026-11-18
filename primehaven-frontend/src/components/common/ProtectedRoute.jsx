import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export const ProtectedRoute = ({ children, allowedRoles = [] }) => {
  const { isAuthenticated, role, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div
        style={{
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: 'var(--color-background)',
          gap: '16px',
        }}
      >
        <div
          style={{
            width: '44px',
            height: '44px',
            border: '3px solid var(--color-border)',
            borderTopColor: 'var(--color-primary)',
            borderRadius: '50%',
            animation: 'spin 0.8s linear infinite',
          }}
        />
        <span
          className="font-serif"
          style={{ fontSize: '1.1rem', color: 'var(--color-earth)', letterSpacing: '0.02em' }}
        >
          PrimeHaven • Verifying Session...
        </span>
      </div>
    );
  }

  if (!isAuthenticated) {
    // Redirect unauthenticated users to signin, preserving destination
    return <Navigate to="/signin" state={{ from: location }} replace />;
  }

  if (allowedRoles.length > 0 && !allowedRoles.includes(role)) {
    // Authenticated, but role does not match required role
    return <Navigate to="/access-denied" replace />;
  }

  return children;
};

export default ProtectedRoute;
