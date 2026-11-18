import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  ShieldAlert,
  Building2,
  Users,
  CalendarDays,
  Inbox,
  BarChart3,
  ExternalLink,
} from 'lucide-react';

export const AdminSidebar = ({ onClose }) => {
  return (
    <div className="sidebar-nav-group">
      <div className="sidebar-section-label">Command Center</div>

      <NavLink
        to="/admin/dashboard"
        className={({ isActive }) => `sidebar-link ${isActive ? 'is-active' : ''}`}
        onClick={onClose}
        end
      >
        <ShieldAlert size={19} />
        <span>System Overview</span>
      </NavLink>

      <div className="sidebar-section-label">Inventory & Ops</div>

      <NavLink
        to="/admin/properties"
        className={({ isActive }) => `sidebar-link ${isActive ? 'is-active' : ''}`}
        onClick={onClose}
      >
        <Building2 size={19} />
        <span>All Properties</span>
      </NavLink>

      <NavLink
        to="/admin/visits"
        className={({ isActive }) => `sidebar-link ${isActive ? 'is-active' : ''}`}
        onClick={onClose}
      >
        <CalendarDays size={19} />
        <span>Visits Management</span>
      </NavLink>

      <NavLink
        to="/admin/inquiries"
        className={({ isActive }) => `sidebar-link ${isActive ? 'is-active' : ''}`}
        onClick={onClose}
      >
        <Inbox size={19} />
        <span>Inquiries Management</span>
      </NavLink>

      <div className="sidebar-section-label">Governance</div>

      <NavLink
        to="/admin/users"
        className={({ isActive }) => `sidebar-link ${isActive ? 'is-active' : ''}`}
        onClick={onClose}
      >
        <Users size={19} />
        <span>User Directory</span>
      </NavLink>

      <NavLink
        to="/admin/reports"
        className={({ isActive }) => `sidebar-link ${isActive ? 'is-active' : ''}`}
        onClick={onClose}
      >
        <BarChart3 size={19} />
        <span>Analytics & Reports</span>
      </NavLink>

      <div className="sidebar-divider" />

      <NavLink to="/properties" className="sidebar-link public-link" onClick={onClose}>
        <ExternalLink size={17} />
        <span>Public Marketplace</span>
      </NavLink>
    </div>
  );
};

export default AdminSidebar;
