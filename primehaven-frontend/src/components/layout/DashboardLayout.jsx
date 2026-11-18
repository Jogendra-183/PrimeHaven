import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Home, Menu, X, LogOut, User as UserIcon } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import ClientSidebar from './ClientSidebar';
import AgentSidebar from './AgentSidebar';
import AdminSidebar from './AdminSidebar';
import Badge from '../common/Badge';
import Button from '../common/Button';
import './DashboardLayout.css';

export const DashboardLayout = ({ children, title = 'Dashboard' }) => {
  const { user, role, logout } = useAuth();
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/signin');
  };

  const renderSidebarContent = () => {
    if (role === 'ADMIN') return <AdminSidebar onClose={() => setMobileSidebarOpen(false)} />;
    if (role === 'AGENT') return <AgentSidebar onClose={() => setMobileSidebarOpen(false)} />;
    return <ClientSidebar onClose={() => setMobileSidebarOpen(false)} />;
  };

  return (
    <div className="dashboard-shell">
      {/* Mobile Sidebar Overlay */}
      {mobileSidebarOpen && (
        <div
          className="dashboard-sidebar-overlay"
          onClick={() => setMobileSidebarOpen(false)}
        />
      )}

      {/* Persistent Left Sidebar */}
      <aside className={`dashboard-sidebar ${mobileSidebarOpen ? 'is-open' : ''}`}>
        <div className="dashboard-sidebar-header">
          <Link to="/" className="brand-logo">
            <div className="brand-icon-box">
              <Home size={20} className="brand-home-icon" />
            </div>
            <div className="brand-text">
              <span className="brand-title font-serif">PrimeHaven</span>
              <span className="brand-subtitle">{role} Workspace</span>
            </div>
          </Link>
          <button
            type="button"
            className="sidebar-close-btn"
            onClick={() => setMobileSidebarOpen(false)}
            aria-label="Close sidebar"
          >
            <X size={20} />
          </button>
        </div>

        <div className="dashboard-sidebar-nav">
          {renderSidebarContent()}
        </div>

        {/* User preview card at bottom of sidebar */}
        <div className="dashboard-sidebar-user">
          <div className="user-avatar-circle">
            {(user?.fullName || user?.username || 'U').charAt(0).toUpperCase()}
          </div>
          <div className="user-info-text">
            <span className="user-name-label">{user?.fullName || user?.username}</span>
            <span className="user-email-label">{user?.email || `${user?.username}@primehaven.com`}</span>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="dashboard-main-wrap">
        {/* Top Header */}
        <header className="dashboard-top-header">
          <div className="dashboard-top-left">
            <button
              type="button"
              className="dashboard-menu-btn"
              onClick={() => setMobileSidebarOpen(true)}
              aria-label="Open sidebar menu"
            >
              <Menu size={22} />
            </button>
            <h1 className="dashboard-header-title font-serif">{title}</h1>
          </div>

          <div className="dashboard-top-right">
            <Badge status={role}>{role}</Badge>
            <div className="header-user-badge">
              <UserIcon size={16} />
              <span>{user?.username}</span>
            </div>
            <Button
              variant="outline"
              size="sm"
              icon={LogOut}
              onClick={handleLogout}
              title="Sign Out"
            >
              Sign Out
            </Button>
          </div>
        </header>

        {/* Dynamic Page Content */}
        <main className="dashboard-page-content">
          <div className="container-wide">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
