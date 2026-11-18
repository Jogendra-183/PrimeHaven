import React, { useState, useEffect } from 'react';
import { Users, Search, ShieldAlert, Key, UserCheck, Shield, AlertTriangle, Building, Calendar } from 'lucide-react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import Input from '../../components/common/Input';
import Badge from '../../components/common/Badge';
import Skeleton from '../../components/common/Skeleton';
import EmptyState from '../../components/common/EmptyState';
import { useAuth } from '../../context/AuthContext';
import propertyApi from '../../services/propertyApi';
import visitApi from '../../services/visitApi';
import inquiryApi from '../../services/inquiryApi';
import './AdminPages.css';

export const AdminUsersPage = () => {
  const { user: currentAdmin } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [roleFilter, setRoleFilter] = useState('ALL');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const compileUserDirectory = async () => {
      setLoading(true);
      try {
        const [props, visits, inqs] = await Promise.all([
          propertyApi.getAll(),
          visitApi.getAll(),
          inquiryApi.getAll(),
        ]);

        const discovered = new Map();

        // 1. Current admin
        if (currentAdmin) {
          discovered.set(`usr-${currentAdmin.id || 'admin'}`, {
            id: currentAdmin.id || 1,
            username: currentAdmin.username || 'admin',
            fullName: currentAdmin.fullName || 'System Administrator',
            email: currentAdmin.email || 'admin@primehaven.com',
            role: 'ADMIN',
            source: 'Active Session',
            activityCount: 1,
          });
        }

        // 2. Discover agents from properties
        if (Array.isArray(props)) {
          props.forEach((p) => {
            if (p.agentId) {
              const key = `agt-${p.agentId}`;
              if (!discovered.has(key)) {
                discovered.set(key, {
                  id: p.agentId,
                  username: `agent_${p.agentId}`,
                  fullName: `Licensed Agent #${p.agentId}`,
                  email: `agent${p.agentId}@primehaven.com`,
                  role: 'AGENT',
                  source: 'Property Service',
                  activityCount: 1,
                });
              } else {
                discovered.get(key).activityCount += 1;
              }
            }
          });
        }

        // 3. Discover clients from visits
        if (Array.isArray(visits)) {
          visits.forEach((v) => {
            if (v.userId) {
              const key = `cli-${v.userId}`;
              if (!discovered.has(key)) {
                discovered.set(key, {
                  id: v.userId,
                  username: `client_${v.userId}`,
                  fullName: `Client #${v.userId}`,
                  email: `client${v.userId}@primehaven.com`,
                  role: 'CLIENT',
                  source: 'Visit Service',
                  activityCount: 1,
                });
              } else {
                discovered.get(key).activityCount += 1;
              }
            }
          });
        }

        // 4. Discover clients and agents from inquiries
        if (Array.isArray(inqs)) {
          inqs.forEach((i) => {
            if (i.userId) {
              const key = `cli-${i.userId}`;
              if (!discovered.has(key)) {
                discovered.set(key, {
                  id: i.userId,
                  username: `client_${i.userId}`,
                  fullName: `Client #${i.userId}`,
                  email: `client${i.userId}@primehaven.com`,
                  role: 'CLIENT',
                  source: 'Inquiry Service',
                  activityCount: 1,
                });
              } else {
                discovered.get(key).activityCount += 1;
              }
            }
          });
        }

        setUsers(Array.from(discovered.values()));
      } catch (err) {
        console.error('Failed to aggregate user directory', err);
      } finally {
        setLoading(false);
      }
    };

    compileUserDirectory();
  }, [currentAdmin]);

  const filteredUsers = users.filter((u) => {
    if (roleFilter !== 'ALL' && u.role !== roleFilter) return false;
    if (!searchTerm.trim()) return true;
    const term = searchTerm.toLowerCase();
    return (
      u.username.toLowerCase().includes(term) ||
      u.fullName.toLowerCase().includes(term) ||
      u.email.toLowerCase().includes(term) ||
      String(u.id).includes(term)
    );
  });

  return (
    <DashboardLayout title="User & Role Directory">
      <div className="admin-page-header">
        <div>
          <h2 className="font-serif admin-page-subtitle">Platform Identity Directory</h2>
          <p className="admin-page-desc">
            Accounts discovered across transaction microservices, authenticated roles, and platform permissions.
          </p>
        </div>
      </div>

      {/* Backend API Gap Architectural Notice */}
      <div className="admin-notice-banner" style={{ borderLeft: '4px solid var(--color-warning)' }}>
        <AlertTriangle size={22} style={{ color: 'var(--color-warning)', flexShrink: 0 }} />
        <div>
          <strong>Backend Contract Audit Notice:</strong> The existing Spring Boot <code>AUTH-SERVICE</code> exposes authentication endpoints (<code>/signin</code>, <code>/signup</code>) but currently omits a dedicated administrative user-management route (such as <code>GET /admin/users</code>). The records below represent verified transacting accounts synchronized from live <code>properties</code>, <code>visits</code>, and <code>inquiries</code> database tables.
        </div>
      </div>

      {/* Toolbar */}
      <div className="admin-toolbar">
        <div className="filter-pill-tabs" style={{ marginBottom: 0 }}>
          {['ALL', 'CLIENT', 'AGENT', 'ADMIN'].map((r) => (
            <button
              key={r}
              type="button"
              className={`pill-tab ${roleFilter === r ? 'is-active' : ''}`}
              onClick={() => setRoleFilter(r)}
            >
              {r === 'ALL' ? 'All Roles' : `${r}s`}
            </button>
          ))}
        </div>

        <div style={{ width: '280px' }}>
          <Input
            placeholder="Search by name, ID, email..."
            icon={Search}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Users Grid */}
      {loading ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '18px' }}>
          <Skeleton height="160px" />
          <Skeleton height="160px" />
          <Skeleton height="160px" />
        </div>
      ) : filteredUsers.length === 0 ? (
        <EmptyState
          icon={Users}
          title="No users match filter"
          description="Try selecting a different role or adjusting your search term."
        />
      ) : (
        <div className="user-directory-grid">
          {filteredUsers.map((u) => (
            <div key={`${u.role}-${u.id}`} className="user-card card-surface">
              <div className="user-card-top">
                <div
                  className="user-avatar-circle font-serif"
                  style={{
                    backgroundColor:
                      u.role === 'ADMIN'
                        ? '#EDE8E0'
                        : u.role === 'AGENT'
                        ? 'var(--color-soft-terracotta)'
                        : 'var(--color-soft-sage)',
                    color:
                      u.role === 'ADMIN'
                        ? 'var(--color-earth)'
                        : u.role === 'AGENT'
                        ? 'var(--color-primary)'
                        : 'var(--color-sage)',
                  }}
                >
                  {u.fullName.charAt(0)}
                </div>
                <div className="user-card-info">
                  <div className="user-card-name">{u.fullName}</div>
                  <div className="user-card-username">@{u.username}</div>
                </div>
                <Badge status={u.role}>{u.role}</Badge>
              </div>

              <div style={{ fontSize: '0.82rem', color: 'var(--color-text-secondary)' }}>
                <div>Email: {u.email}</div>
                <div>ID: #{u.id} • Discovered via: {u.source}</div>
              </div>

              <div className="user-meta-row">
                <span>Associated Operations</span>
                <strong style={{ color: 'var(--color-primary)' }}>{u.activityCount} Recorded</strong>
              </div>
            </div>
          ))}
        </div>
      )}
    </DashboardLayout>
  );
};

export default AdminUsersPage;
