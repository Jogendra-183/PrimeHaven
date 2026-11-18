import React from 'react';
import { User, Mail, Phone, ShieldCheck, Calendar, Key } from 'lucide-react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import Badge from '../../components/common/Badge';
import { useAuth } from '../../context/AuthContext';
import './ClientPages.css';

export const ClientProfilePage = () => {
  const { user, role } = useAuth();

  return (
    <DashboardLayout title="Client Profile">
      <div className="client-page-header">
        <div>
          <h2 className="font-serif page-subtitle">Personal Account Details</h2>
          <p className="page-desc">
            Your PrimeHaven identity and verified membership credentials.
          </p>
        </div>
      </div>

      <div className="profile-card-container">
        <div className="profile-card card-surface">
          <div className="profile-banner">
            <div className="profile-avatar-large font-serif">
              {(user?.fullName || user?.username || 'U').charAt(0).toUpperCase()}
            </div>
          </div>

          <div className="profile-body">
            <div className="profile-header-meta">
              <h3 className="profile-full-name font-serif">
                {user?.fullName || user?.username}
              </h3>
              <p className="profile-username">@{user?.username}</p>
              <div style={{ marginTop: '6px' }}>
                <Badge status={role}>{role} MEMBER</Badge>
              </div>
            </div>

            <div className="profile-details-grid">
              <div className="profile-field">
                <span className="field-label">
                  <User size={15} /> Full Name
                </span>
                <span className="field-value">{user?.fullName || 'Not provided'}</span>
              </div>

              <div className="profile-field">
                <span className="field-label">
                  <Mail size={15} /> Email Address
                </span>
                <span className="field-value">{user?.email || `${user?.username}@primehaven.com`}</span>
              </div>

              <div className="profile-field">
                <span className="field-label">
                  <Phone size={15} /> Phone Number
                </span>
                <span className="field-value">{user?.phone || 'Not provided'}</span>
              </div>

              <div className="profile-field">
                <span className="field-label">
                  <Key size={15} /> Account ID
                </span>
                <span className="field-value">#USR-{user?.id || '001'}</span>
              </div>

              <div className="profile-field">
                <span className="field-label">
                  <ShieldCheck size={15} /> Authorization Role
                </span>
                <span className="field-value">{role} (Verified Tier)</span>
              </div>

              <div className="profile-field">
                <span className="field-label">
                  <Calendar size={15} /> Membership Status
                </span>
                <span className="field-value" style={{ color: 'var(--color-sage)' }}>
                  Active & Good Standing
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default ClientProfilePage;
