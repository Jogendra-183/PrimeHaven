import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Building,
  PlusCircle,
  CalendarCheck,
  MailCheck,
  TrendingUp,
  User,
  ExternalLink,
} from 'lucide-react';

export const AgentSidebar = ({ onClose }) => {
  return (
    <div className="sidebar-nav-group">
      <div className="sidebar-section-label">Sales Workspace</div>

      <NavLink
        to="/agent/dashboard"
        className={({ isActive }) => `sidebar-link ${isActive ? 'is-active' : ''}`}
        onClick={onClose}
        end
      >
        <LayoutDashboard size={19} />
        <span>Overview</span>
      </NavLink>

      <NavLink
        to="/agent/listings"
        className={({ isActive }) => `sidebar-link ${isActive ? 'is-active' : ''}`}
        onClick={onClose}
        end
      >
        <Building size={19} />
        <span>My Listings</span>
      </NavLink>

      <NavLink
        to="/agent/listings/new"
        className={({ isActive }) => `sidebar-link ${isActive ? 'is-active' : ''}`}
        onClick={onClose}
      >
        <PlusCircle size={19} />
        <span>Add Property</span>
      </NavLink>

      <div className="sidebar-section-label">Client Operations</div>

      <NavLink
        to="/agent/visits"
        className={({ isActive }) => `sidebar-link ${isActive ? 'is-active' : ''}`}
        onClick={onClose}
      >
        <CalendarCheck size={19} />
        <span>Manage Visits</span>
      </NavLink>

      <NavLink
        to="/agent/inquiries"
        className={({ isActive }) => `sidebar-link ${isActive ? 'is-active' : ''}`}
        onClick={onClose}
      >
        <MailCheck size={19} />
        <span>Inquiry Inbox</span>
      </NavLink>

      <NavLink
        to="/agent/performance"
        className={({ isActive }) => `sidebar-link ${isActive ? 'is-active' : ''}`}
        onClick={onClose}
      >
        <TrendingUp size={19} />
        <span>Performance</span>
      </NavLink>

      <div className="sidebar-section-label">Settings</div>

      <NavLink
        to="/agent/profile"
        className={({ isActive }) => `sidebar-link ${isActive ? 'is-active' : ''}`}
        onClick={onClose}
      >
        <User size={19} />
        <span>Agent Profile</span>
      </NavLink>

      <div className="sidebar-divider" />

      <NavLink to="/properties" className="sidebar-link public-link" onClick={onClose}>
        <ExternalLink size={17} />
        <span>View Marketplace</span>
      </NavLink>
    </div>
  );
};

export default AgentSidebar;
