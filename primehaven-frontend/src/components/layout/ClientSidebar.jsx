import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Compass,
  Heart,
  Calendar,
  MessageSquare,
  User,
  ExternalLink,
} from 'lucide-react';

export const ClientSidebar = ({ onClose }) => {
  return (
    <div className="sidebar-nav-group">
      <div className="sidebar-section-label">My Haven</div>

      <NavLink
        to="/client/dashboard"
        className={({ isActive }) => `sidebar-link ${isActive ? 'is-active' : ''}`}
        onClick={onClose}
        end
      >
        <LayoutDashboard size={19} />
        <span>Overview</span>
      </NavLink>

      <NavLink
        to="/client/properties"
        className={({ isActive }) => `sidebar-link ${isActive ? 'is-active' : ''}`}
        onClick={onClose}
      >
        <Compass size={19} />
        <span>Discover Properties</span>
      </NavLink>

      <NavLink
        to="/client/saved"
        className={({ isActive }) => `sidebar-link ${isActive ? 'is-active' : ''}`}
        onClick={onClose}
      >
        <Heart size={19} />
        <span>Saved Properties</span>
      </NavLink>

      <div className="sidebar-section-label">Engagements</div>

      <NavLink
        to="/client/visits"
        className={({ isActive }) => `sidebar-link ${isActive ? 'is-active' : ''}`}
        onClick={onClose}
      >
        <Calendar size={19} />
        <span>My Visits</span>
      </NavLink>

      <NavLink
        to="/client/inquiries"
        className={({ isActive }) => `sidebar-link ${isActive ? 'is-active' : ''}`}
        onClick={onClose}
      >
        <MessageSquare size={19} />
        <span>My Inquiries</span>
      </NavLink>

      <div className="sidebar-section-label">Account</div>

      <NavLink
        to="/client/profile"
        className={({ isActive }) => `sidebar-link ${isActive ? 'is-active' : ''}`}
        onClick={onClose}
      >
        <User size={19} />
        <span>My Profile</span>
      </NavLink>

      <div className="sidebar-divider" />

      <NavLink to="/properties" className="sidebar-link public-link" onClick={onClose}>
        <ExternalLink size={17} />
        <span>Public Marketplace</span>
      </NavLink>
    </div>
  );
};

export default ClientSidebar;
