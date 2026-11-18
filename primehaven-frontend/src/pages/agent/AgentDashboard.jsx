import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Building,
  CalendarCheck,
  MailCheck,
  TrendingUp,
  PlusCircle,
  Clock,
  ArrowRight,
  CheckCircle,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import DashboardLayout from '../../components/layout/DashboardLayout';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import Skeleton from '../../components/common/Skeleton';
import EmptyState from '../../components/common/EmptyState';
import { useAuth } from '../../context/AuthContext';
import propertyApi from '../../services/propertyApi';
import visitApi from '../../services/visitApi';
import inquiryApi from '../../services/inquiryApi';
import './AgentPages.css';

const CHART_COLORS = ['#B86648', '#43594A', '#D9B98C', '#BD4848'];

export const AgentDashboard = () => {
  const { user } = useAuth();
  const [properties, setProperties] = useState([]);
  const [visits, setVisits] = useState([]);
  const [inquiries, setInquiries] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAgentData = async () => {
      setLoading(true);
      try {
        const [pData, vData, iData] = await Promise.allSettled([
          propertyApi.getAll(),
          visitApi.getAll(),
          inquiryApi.getAll(),
        ]);

        if (pData.status === 'fulfilled' && Array.isArray(pData.value)) {
          // Agent sees properties assigned to them
          const agentProps = pData.value.filter(
            (p) => p.agentId === user?.id || !p.agentId
          );
          setProperties(agentProps);
        }
        if (vData.status === 'fulfilled' && Array.isArray(vData.value)) {
          setVisits(vData.value);
        }
        if (iData.status === 'fulfilled' && Array.isArray(iData.value)) {
          setInquiries(iData.value);
        }
      } catch (err) {
        console.error('Failed to load agent dashboard data', err);
      } finally {
        setLoading(false);
      }
    };
    fetchAgentData();
  }, [user?.id]);

  const activeListings = properties.filter((p) => p.status === 'AVAILABLE');
  const pendingVisits = visits.filter((v) => v.status === 'REQUESTED');
  const openInquiries = inquiries.filter((i) => i.status === 'OPEN');

  // Chart data: Status distribution
  const statusCounts = properties.reduce((acc, curr) => {
    const st = curr.status || 'AVAILABLE';
    acc[st] = (acc[st] || 0) + 1;
    return acc;
  }, {});

  const pieData = Object.entries(statusCounts).map(([name, value]) => ({
    name,
    value,
  }));

  return (
    <DashboardLayout title="Agent Workspace">
      {/* Top Banner */}
      <div className="agent-welcome-banner card-surface">
        <div>
          <span className="agent-eyebrow">Professional Sales Console</span>
          <h2 className="agent-banner-title font-serif">
            Welcome, {user?.fullName || user?.username}
          </h2>
          <p className="agent-banner-desc">
            Monitor incoming client tour appointments, respond to property inquiries, and manage your luxury listings.
          </p>
        </div>
        <Link to="/agent/listings/new">
          <Button variant="primary" size="lg" icon={PlusCircle}>
            Add New Property
          </Button>
        </Link>
      </div>

      {/* KPI Cards Row */}
      <div className="agent-kpi-grid">
        <div className="kpi-card card-surface">
          <div className="kpi-icon-box terracotta">
            <Building size={22} />
          </div>
          <div>
            <div className="kpi-number font-serif">{properties.length}</div>
            <div className="kpi-label">Assigned Properties</div>
            <div className="kpi-subtext">{activeListings.length} Active / Available</div>
          </div>
        </div>

        <div className="kpi-card card-surface">
          <div className="kpi-icon-box sage">
            <CalendarCheck size={22} />
          </div>
          <div>
            <div className="kpi-number font-serif">{pendingVisits.length}</div>
            <div className="kpi-label">Pending Tour Requests</div>
            <div className="kpi-subtext">{visits.length} Total appointments</div>
          </div>
        </div>

        <div className="kpi-card card-surface">
          <div className="kpi-icon-box earth">
            <MailCheck size={22} />
          </div>
          <div>
            <div className="kpi-number font-serif">{openInquiries.length}</div>
            <div className="kpi-label">Unanswered Inquiries</div>
            <div className="kpi-subtext">{inquiries.length} Total inquiries</div>
          </div>
        </div>

        <div className="kpi-card card-surface">
          <div className="kpi-icon-box accent">
            <TrendingUp size={22} />
          </div>
          <div>
            <div className="kpi-number font-serif">
              {visits.filter((v) => v.status === 'COMPLETED').length}
            </div>
            <div className="kpi-label">Completed Tours</div>
            <div className="kpi-subtext">Verified buyer walkthroughs</div>
          </div>
        </div>
      </div>

      {/* Charts & Tasks Section */}
      <div className="agent-split-grid">
        {/* Left: Listing Status Visual */}
        <div className="agent-section-card card-surface">
          <div className="agent-card-header">
            <h3 className="font-serif card-title">Portfolio Inventory Status</h3>
            <span className="card-badge-info">{properties.length} Listings</span>
          </div>

          {loading ? (
            <Skeleton height="220px" />
          ) : properties.length === 0 ? (
            <EmptyState
              icon={Building}
              title="No properties listed yet"
              description="Add your first property to start receiving visits and inquiries."
              actionLabel="Add Property"
              onAction={() => (window.location.href = '/agent/listings/new')}
            />
          ) : (
            <div style={{ height: '240px', width: '100%' }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={pieData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <XAxis dataKey="name" stroke="#81776C" fontSize={12} />
                  <YAxis stroke="#81776C" fontSize={12} allowDecimals={false} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#FFFCF7',
                      borderColor: '#E6D8C6',
                      borderRadius: '8px',
                    }}
                  />
                  <Bar dataKey="value" fill="#B86648" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        {/* Right: Urgent Action Inbox */}
        <div className="agent-section-card card-surface">
          <div className="agent-card-header">
            <h3 className="font-serif card-title">Pending Tour Requests</h3>
            <Link to="/agent/visits" className="agent-header-link">
              Manage All <ArrowRight size={14} />
            </Link>
          </div>

          {loading ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <Skeleton height="60px" />
              <Skeleton height="60px" />
            </div>
          ) : pendingVisits.length === 0 ? (
            <EmptyState
              icon={CalendarCheck}
              title="No pending tour requests"
              description="All current visit appointments have been reviewed."
            />
          ) : (
            <div className="agent-pending-list">
              {pendingVisits.slice(0, 4).map((v) => (
                <div key={v.id} className="agent-pending-row">
                  <div className="pending-date-pill">
                    <Clock size={14} />
                    <span>
                      {v.visitDate
                        ? new Date(v.visitDate).toLocaleDateString([], {
                            month: 'short',
                            day: 'numeric',
                          })
                        : 'TBA'}
                    </span>
                  </div>
                  <div className="pending-prop-info">
                    <strong>{v.propertySummary?.title || `Property #${v.propertyId}`}</strong>
                    <span style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)' }}>
                      Client #{v.userId} • {v.notes || 'No special notes'}
                    </span>
                  </div>
                  <Link to="/agent/visits">
                    <Button variant="outline" size="sm">
                      Review
                    </Button>
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default AgentDashboard;
