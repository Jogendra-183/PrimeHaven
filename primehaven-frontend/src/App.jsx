import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/common/ProtectedRoute';

// Public Pages
import HomePage from './pages/public/HomePage';
import AboutPage from './pages/public/AboutPage';
import ContactPage from './pages/public/ContactPage';
import PropertyListPage from './pages/properties/PropertyListPage';
import PropertyDetailsPage from './pages/properties/PropertyDetailsPage';
import SignInPage from './pages/auth/SignInPage';
import SignUpPage from './pages/auth/SignUpPage';

// Client Dashboard Pages
import ClientDashboard from './pages/client/ClientDashboard';
import SavedPropertiesPage from './pages/client/SavedPropertiesPage';
import ClientVisitsPage from './pages/client/ClientVisitsPage';
import ClientInquiriesPage from './pages/client/ClientInquiriesPage';
import ClientProfilePage from './pages/client/ClientProfilePage';

// Agent Dashboard Pages
import AgentDashboard from './pages/agent/AgentDashboard';
import AgentListingsPage from './pages/agent/AgentListingsPage';
import AgentPropertyFormPage from './pages/agent/AgentPropertyFormPage';
import AgentVisitsPage from './pages/agent/AgentVisitsPage';
import AgentInquiriesPage from './pages/agent/AgentInquiriesPage';
import AgentPerformancePage from './pages/agent/AgentPerformancePage';
import AgentProfilePage from './pages/agent/AgentProfilePage';

// Admin Dashboard Pages
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminPropertiesPage from './pages/admin/AdminPropertiesPage';
import AdminVisitsPage from './pages/admin/AdminVisitsPage';
import AdminInquiriesPage from './pages/admin/AdminInquiriesPage';
import AdminUsersPage from './pages/admin/AdminUsersPage';
import AdminReportsPage from './pages/admin/AdminReportsPage';

// Error Pages
import NotFoundPage from './pages/errors/NotFoundPage';
import AccessDeniedPage from './pages/errors/AccessDeniedPage';

// Scroll to top helper on route transition
const ScrollToTop = () => {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
};

export const App = () => {
  return (
    <AuthProvider>
      <Router>
        <ScrollToTop />
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: '#FFFCF7',
              color: '#302D29',
              border: '1px solid #E6D8C6',
              borderRadius: '8px',
              fontFamily: "'Plus Jakarta Sans', sans-serif",
              boxShadow: '0 8px 24px rgba(48, 45, 41, 0.08)',
            },
            success: {
              iconTheme: {
                primary: '#43594A',
                secondary: '#FFFCF7',
              },
            },
            error: {
              iconTheme: {
                primary: '#BD4848',
                secondary: '#FFFCF7',
              },
            },
          }}
        />

        <Routes>
          {/* ================= PUBLIC ROUTES ================= */}
          <Route path="/" element={<HomePage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/properties" element={<PropertyListPage />} />
          <Route path="/properties/:id" element={<PropertyDetailsPage />} />
          <Route path="/signin" element={<SignInPage />} />
          <Route path="/login" element={<SignInPage />} />
          <Route path="/signup" element={<SignUpPage />} />
          <Route path="/register" element={<SignUpPage />} />

          {/* ================= CLIENT ROUTES ================= */}
          <Route
            path="/client/dashboard"
            element={
              <ProtectedRoute allowedRoles={['CLIENT', 'ADMIN']}>
                <ClientDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/client/properties"
            element={
              <ProtectedRoute allowedRoles={['CLIENT', 'ADMIN']}>
                <PropertyListPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/client/saved"
            element={
              <ProtectedRoute allowedRoles={['CLIENT', 'ADMIN']}>
                <SavedPropertiesPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/client/visits"
            element={
              <ProtectedRoute allowedRoles={['CLIENT', 'ADMIN']}>
                <ClientVisitsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/client/inquiries"
            element={
              <ProtectedRoute allowedRoles={['CLIENT', 'ADMIN']}>
                <ClientInquiriesPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/client/profile"
            element={
              <ProtectedRoute allowedRoles={['CLIENT', 'ADMIN']}>
                <ClientProfilePage />
              </ProtectedRoute>
            }
          />

          {/* ================= AGENT ROUTES ================= */}
          <Route
            path="/agent/dashboard"
            element={
              <ProtectedRoute allowedRoles={['AGENT', 'ADMIN']}>
                <AgentDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/agent/listings"
            element={
              <ProtectedRoute allowedRoles={['AGENT', 'ADMIN']}>
                <AgentListingsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/agent/listings/new"
            element={
              <ProtectedRoute allowedRoles={['AGENT', 'ADMIN']}>
                <AgentPropertyFormPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/agent/listings/:id/edit"
            element={
              <ProtectedRoute allowedRoles={['AGENT', 'ADMIN']}>
                <AgentPropertyFormPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/agent/visits"
            element={
              <ProtectedRoute allowedRoles={['AGENT', 'ADMIN']}>
                <AgentVisitsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/agent/inquiries"
            element={
              <ProtectedRoute allowedRoles={['AGENT', 'ADMIN']}>
                <AgentInquiriesPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/agent/performance"
            element={
              <ProtectedRoute allowedRoles={['AGENT', 'ADMIN']}>
                <AgentPerformancePage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/agent/profile"
            element={
              <ProtectedRoute allowedRoles={['AGENT', 'ADMIN']}>
                <AgentProfilePage />
              </ProtectedRoute>
            }
          />

          {/* ================= ADMIN ROUTES ================= */}
          <Route
            path="/admin/dashboard"
            element={
              <ProtectedRoute allowedRoles={['ADMIN']}>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/properties"
            element={
              <ProtectedRoute allowedRoles={['ADMIN']}>
                <AdminPropertiesPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/visits"
            element={
              <ProtectedRoute allowedRoles={['ADMIN']}>
                <AdminVisitsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/inquiries"
            element={
              <ProtectedRoute allowedRoles={['ADMIN']}>
                <AdminInquiriesPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/users"
            element={
              <ProtectedRoute allowedRoles={['ADMIN']}>
                <AdminUsersPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/reports"
            element={
              <ProtectedRoute allowedRoles={['ADMIN']}>
                <AdminReportsPage />
              </ProtectedRoute>
            }
          />

          {/* ================= ERROR & FALLBACK ROUTES ================= */}
          <Route path="/access-denied" element={<AccessDeniedPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
};

export default App;
