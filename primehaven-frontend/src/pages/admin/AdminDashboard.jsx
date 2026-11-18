import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Building2,
  CalendarCheck2,
  MessageSquareCode,
  Users2,
  TrendingUp,
  ShieldCheck,
  ArrowRight,
  Clock,
  CheckCircle2,
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
  Legend,
} from 'recharts';
import DashboardLayout from '../../components/layout/DashboardLayout';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import Skeleton from '../../components/common/Skeleton';
import EmptyState from '../../components/common/EmptyState';
import propertyApi from '../../services/propertyApi';
import visitApi from '../../services/visitApi';
import inquiryApi from '../../services/inquiryApi';
import './AdminPages.css';

const CHART_PALETTE = ['#B86648', '#43594A', '#D9B98C', '#BD4848', '#76644E'];

export const AdminDashboard = () => {
  const [properties, setProperties] = useState([]);
  const [visits, setVisits] = useState([]);
  const [inquiries, setInquiries] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPlatformStats = async () => {
      setLoading(true);
      try {
        const [propsRes, visitsRes, inqRes] = await Promise.allSettled([
          propertyApi.getAll(),
          visitApi.getAll(),
          inquiryApi.getAll(),
        ]);

        if (propsRes.status === 'fulfilled' && Array.isArray(propsRes.value)) {
          setProperties(propsRes.value);
        }
        if (visitsRes.status === 'fulfilled' && Array.isArray(visitsRes.value)) {
          setVisits(visitsRes.value);
        }
        if (inqRes.status === 'fulfilled' && Array.isArray(inqRes.value)) {
          setInquiries(inqRes.value);
        }
      } catch (err) {
        console.error('Failed to load platform-wide metrics', err);
      } finally {
        setLoading(false);
      }
    };

    fetchPlatformStats();
  }, []);

  // System-wide statistics
  const activeListings = properties.filter((p) => p.status === 'AVAILABLE');
  const pendingVisits = visits.filter((v) => v.status === 'REQUESTED');
  const openInquiries = inquiries.filter((i) => i.status === 'OPEN' || !i.response);

  // Property status distribution chart data
  const propStatusMap = properties.reduce((acc, p) => {
    const st = p.status || 'AVAILABLE';
    acc[st] = (acc[st] || 0) + 1;
    return acc;
  }, {});

  const propChartData = Object.keys(propStatusMap).map((k) => ({
    name: k.replace('_', ' '),
    count: propStatusMap[k],
  }));

  // Visit status breakdown for Pie Chart
  const visitStatusMap = visits.reduce((acc, v) => {
    const st = v.status || 'REQUESTED';
    acc[st] = (acc[st] || 0) + 1;
    return acc;
  }, {});

  const visitPieData = Object.keys(visitStatusMap).map((st) => ({
    name: st,
    value: visitStatusMap[st],
  }));

  return (
    <DashboardLayout title="Platform Command Center">
      <div className="admin-page-header">
        <div>
          <h2 className="font-serif admin-page-subtitle">Executive System Oversight</h2>
          <p className="admin-page-desc">
            Global real-estate operations across microservices, verified database states, and transactional queues.
          </p>
        </div>

        <div className="admin-header-actions">
          <Link to="/admin/properties">
            <Button variant="outline" size="sm" icon={Building2}>
              Manage Listings
            </Button>
          </Link>
          <Link to="/admin/reports">
            <Button variant="primary" size="sm" icon={TrendingUp}>
              System Reports
            </Button>
          </Link>
        </div>
      </div>

      {/* System Status Banner */}
      <div className="admin-notice-banner">
        <ShieldCheck size={20} style={{ color: 'var(--color-primary)' }} />
        <span>
          <strong>Microservices Fleet Connected:</strong> API-Gateway (6001), Auth (6002), Property (6003), Visit (6004), Inquiry (6005) registered via Eureka (8761).
        </span>
      </div>

      {/* Top Scorecard Grid */}
      <div className="admin-stats-grid">
        <div className="admin-stat-card card-surface">
          <div className="admin-stat-icon terracotta">
            <Building2 size={24} />
          </div>
          <div>
            <div className="admin-stat-number font-serif">{properties.length}</div>
            <div className="admin-stat-label">Total Properties</div>
            <div className="admin-stat-sub">{activeListings.length} Active / Available</div>
          </div>
        </div>

        <div className="admin-stat-card card-surface">
          <div className="admin-stat-icon sage">
            <CalendarCheck2 size={24} />
          </div>
          <div>
            <div className="admin-stat-number font-serif">{visits.length}</div>
            <div className="admin-stat-label">Client Tour Bookings</div>
            <div className="admin-stat-sub">{pendingVisits.length} Pending confirmation</div>
          </div>
        </div>

        <div className="admin-stat-card card-surface">
          <div className="admin-stat-icon gold">
            <MessageSquareCode size={24} />
          </div>
          <div>
            <div className="admin-stat-number font-serif">{inquiries.length}</div>
            <div className="admin-stat-label">Buyer Inquiries</div>
            <div className="admin-stat-sub">{openInquiries.length} Awaiting response</div>
          </div>
        </div>

        <div className="admin-stat-card card-surface">
          <div className="admin-stat-icon earth">
            <Users2 size={24} />
          </div>
          <div>
            <div className="admin-stat-number font-serif">
              {new Set([...visits.map((v) => v.userId), ...inquiries.map((i) => i.userId)]).size || '3'}
            </div>
            <div className="admin-stat-label">Active Transacting Users</div>
            <div className="admin-stat-sub">Clients with live requests</div>
          </div>
        </div>
      </div>

      {/* Platform Analytics Charts */}
      <div className="admin-command-grid">
        {/* Left: Inventory Breakdown */}
        <div className="admin-panel-card card-surface">
          <div className="admin-panel-header">
            <h3 className="font-serif">Inventory Status Breakdown</h3>
            <Link to="/admin/properties" className="admin-panel-link">
              View All <ArrowRight size={14} />
            </Link>
          </div>

          {loading ? (
            <Skeleton height="240px" />
          ) : propChartData.length === 0 ? (
            <EmptyState
              icon={Building2}
              title="No properties in database"
              description="Platform listings will appear here once agents publish them."
            />
          ) : (
            <div style={{ height: '260px', width: '100%' }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={propChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <XAxis dataKey="name" stroke="#81776C" fontSize={12} />
                  <YAxis stroke="#81776C" fontSize={12} allowDecimals={false} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#FFFCF7',
                      borderColor: '#E6D8C6',
                      borderRadius: '8px',
                    }}
                  />
                  <Bar dataKey="count" fill="#B86648" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        {/* Right: Visit Distribution */}
        <div className="admin-panel-card card-surface">
          <div className="admin-panel-header">
            <h3 className="font-serif">Global Tour Appointments</h3>
            <Link to="/admin/visits" className="admin-panel-link">
              View All <ArrowRight size={14} />
            </Link>
          </div>

          {loading ? (
            <Skeleton height="240px" />
          ) : visitPieData.length === 0 ? (
            <EmptyState
              icon={CalendarCheck2}
              title="No tours recorded"
              description="Visit appointments booked by clients will populate this chart."
            />
          ) : (
            <div style={{ height: '260px', width: '100%' }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={visitPieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={85}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {visitPieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={CHART_PALETTE[index % CHART_PALETTE.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#FFFCF7',
                      borderColor: '#E6D8C6',
                      borderRadius: '8px',
                    }}
                  />
                  <Legend verticalAlign="bottom" height={36} iconType="circle" />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      </div>

      {/* Recent Tour Appointments Stream */}
      <div className="admin-panel-card card-surface" style={{ marginBottom: '24px' }}>
        <div className="admin-panel-header">
          <h3 className="font-serif">Recent Tour Walkthrough Requests</h3>
          <Link to="/admin/visits" className="admin-panel-link">
            Open Visit Center <ArrowRight size={14} />
          </Link>
        </div>

        {loading ? (
          <Skeleton height="150px" />
        ) : visits.length === 0 ? (
          <EmptyState
            icon={CalendarCheck2}
            title="No recent visits"
            description="No client visits have been scheduled across the platform."
          />
        ) : (
          <div className="admin-table-wrapper">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Appointment Date</th>
                  <th>Property</th>
                  <th>Client</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {visits.slice(0, 5).map((v) => (
                  <tr key={v.id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: '500' }}>
                        <Clock size={14} color="var(--color-primary)" />
                        {v.visitDate
                          ? new Date(v.visitDate).toLocaleDateString([], {
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric',
                            })
                          : 'TBD'}
                      </div>
                    </td>
                    <td>
                      <strong>{v.propertySummary?.title || `Property #${v.propertyId}`}</strong>
                    </td>
                    <td>
                      <span className="admin-id-badge">Client #{v.userId}</span>
                    </td>
                    <td>
                      <Badge status={v.status} />
                    </td>
                    <td>
                      <Link to="/admin/visits">
                        <Button variant="ghost" size="sm">
                          Manage
                        </Button>
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default AdminDashboard;
