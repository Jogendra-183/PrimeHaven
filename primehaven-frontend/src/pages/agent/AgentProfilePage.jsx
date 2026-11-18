import React from 'react';
import { User, Mail, Phone, ShieldCheck, Calendar, Key, Briefcase, Award } from 'lucide-react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import Badge from '../../components/common/Badge';
import { useAuth } from '../../context/AuthContext';
import './AgentPages.css';

export const AgentProfilePage = () => {
  const { user, role } = useAuth();

  return (
    <DashboardLayout title="Agent Credentials & Profile">
      <div className="agent-page-header">
        <div>
          <h2 className="font-serif agent-page-subtitle">Professional Advisory Credentials</h2>
          <p className="agent-page-desc">
            Your licensed agent identifier, portfolio assignment privileges, and authentication profile.
          </p>
        </div>
      </div>

      <div className="form-card-wrapper card-surface" style={{ padding: '0', overflow: 'hidden' }}>
        {/* Banner */}
        <div
          style={{
            height: '140px',
            background: 'linear-gradient(135deg, var(--color-primary) 0%, var(--color-earth) 100%)',
            position: 'relative',
            padding: '24px',
            display: 'flex',
            alignItems: 'flex-end',
          }}
        >
          <div
            style={{
              position: 'absolute',
              bottom: '-35px',
              left: '32px',
              width: '80px',
              height: '80px',
              borderRadius: '50%',
              backgroundColor: 'var(--color-surface)',
              border: '4px solid var(--color-surface)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '2rem',
              color: 'var(--color-primary)',
              boxShadow: 'var(--shadow-md)',
            }}
            className="font-serif"
          >
            {(user?.fullName || user?.username || 'A').charAt(0).toUpperCase()}
          </div>
        </div>

        <div style={{ padding: '48px 32px 32px' }}>
          <div style={{ marginBottom: '24px' }}>
            <h3 className="font-serif" style={{ fontSize: '1.5rem', color: 'var(--color-earth)' }}>
              {user?.fullName || user?.username}
            </h3>
            <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.9rem' }}>
              Licensed PrimeHaven Residential Partner • @{user?.username}
            </p>
            <div style={{ marginTop: '8px', display: 'flex', gap: '8px' }}>
              <Badge status="AGENT">LICENSED AGENT</Badge>
              <Badge status="AVAILABLE">ACTIVE LISTING PRIVILEGES</Badge>
            </div>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
              gap: '20px',
              borderTop: '1px solid var(--color-border)',
              paddingTop: '24px',
            }}
          >
            <div>
              <span className="row-meta" style={{ marginBottom: '4px' }}>
                <User size={15} /> Full Name
              </span>
              <strong style={{ fontSize: '0.95rem' }}>{user?.fullName || 'Not provided'}</strong>
            </div>

            <div>
              <span className="row-meta" style={{ marginBottom: '4px' }}>
                <Mail size={15} /> Work Email
              </span>
              <strong style={{ fontSize: '0.95rem' }}>{user?.email || `${user?.username}@primehaven.com`}</strong>
            </div>

            <div>
              <span className="row-meta" style={{ marginBottom: '4px' }}>
                <Phone size={15} /> Client Contact
              </span>
              <strong style={{ fontSize: '0.95rem' }}>{user?.phone || '+1 (555) 234-8900'}</strong>
            </div>

            <div>
              <span className="row-meta" style={{ marginBottom: '4px' }}>
                <Key size={15} /> Agent ID (Backend Key)
              </span>
              <strong style={{ fontSize: '0.95rem' }}>#AGT-{user?.id || '002'}</strong>
            </div>

            <div>
              <span className="row-meta" style={{ marginBottom: '4px' }}>
                <Briefcase size={15} /> Assigned Portfolio
              </span>
              <strong style={{ fontSize: '0.95rem' }}>Prime Luxury & Residential</strong>
            </div>

            <div>
              <span className="row-meta" style={{ marginBottom: '4px' }}>
                <Award size={15} /> Verification Status
              </span>
              <strong style={{ fontSize: '0.95rem', color: 'var(--color-success)' }}>
                Certified Real Estate Specialist
              </strong>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default AgentProfilePage;
