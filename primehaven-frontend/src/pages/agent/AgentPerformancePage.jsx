import React, { useState, useEffect } from 'react';
import {
  TrendingUp,
  Award,
  CheckCircle,
  Clock,
  Building,
  CalendarCheck,
  Mail,
  Zap,
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
import Skeleton from '../../components/common/Skeleton';
import EmptyState from '../../components/common/EmptyState';
import { useAuth } from '../../context/AuthContext';
import propertyApi from '../../services/propertyApi';
import visitApi from '../../services/visitApi';
import inquiryApi from '../../services/inquiryApi';
import './AgentPages.css';

const PALETTE = ['#B86648', '#43594A', '#D9B98C', '#BD4848', '#76644E'];

export const AgentPerformancePage = () => {
  const { user } = useAuth();
  const [properties, setProperties] = useState([]);
  const [visits, setVisits] = useState([]);
  const [inquiries, setInquiries] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const [propsRes, visitsRes, inqRes] = await Promise.all([
          propertyApi.getAll(),
          visitApi.getAll(),
          inquiryApi.getAll(),
        ]);

        if (Array.isArray(propsRes)) {
          const agentProps = propsRes.filter((p) => p.agentId === user?.id || !p.agentId);
          setProperties(agentProps);
        }
        if (Array.isArray(visitsRes)) {
          setVisits(visitsRes);
        }
        if (Array.isArray(inqRes)) {
          setInquiries(inqRes);
        }
      } catch (err) {
        console.error('Failed to load performance metrics', err);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [user?.id]);

  // Derived Performance Analytics
  const completedVisits = visits.filter((v) => v.status === 'COMPLETED').length;
  const confirmedVisits = visits.filter((v) => v.status === 'CONFIRMED').length;
  const answeredInquiries = inquiries.filter((i) => i.response && i.response.trim().length > 0).length;

  const responseRate = inquiries.length > 0
    ? Math.round((answeredInquiries / inquiries.length) * 100)
    : 100;

  // Chart 1: Listing Status Distribution
  const statusCounts = properties.reduce((acc, p) => {
    const st = p.status || 'AVAILABLE';
    acc[st] = (acc[st] || 0) + 1;
    return acc;
  }, {});

  const listingChartData = Object.keys(statusCounts).map((k) => ({
    name: k.replace('_', ' '),
    count: statusCounts[k],
  }));

  // Chart 2: Visit Appointment Pipeline
  const visitStatusCounts = visits.reduce((acc, v) => {
    const st = v.status || 'REQUESTED';
    acc[st] = (acc[st] || 0) + 1;
    return acc;
  }, {});

  const visitChartData = [
    { name: 'Requested', value: visitStatusCounts['REQUESTED'] || 0 },
    { name: 'Confirmed', value: visitStatusCounts['CONFIRMED'] || 0 },
    { name: 'Completed', value: visitStatusCounts['COMPLETED'] || 0 },
    { name: 'Cancelled', value: visitStatusCounts['CANCELLED'] || 0 },
  ].filter((item) => item.value > 0);

  // Property Type Distribution
  const typeCounts = properties.reduce((acc, p) => {
    const t = p.propertyType || 'Apartment';
    acc[t] = (acc[t] || 0) + 1;
    return acc;
  }, {});

  const typeChartData = Object.keys(typeCounts).map((k) => ({
    name: k,
    count: typeCounts[k],
  }));

  return (
    <DashboardLayout title="Agent Performance & Sales Analytics">
      <div className="agent-page-header">
        <div>
          <h2 className="font-serif agent-page-subtitle">Commercial Performance Index</h2>
          <p className="agent-page-desc">
            Authorized metrics derived from actual listing pipeline, client walkthroughs, and buyer responsiveness.
          </p>
        </div>
      </div>

      {/* High-Level Scorecards */}
      <div className="kpi-grid">
        <div className="kpi-card card-surface">
          <div className="kpi-icon-box terracotta">
            <Award size={24} />
          </div>
          <div>
            <div className="kpi-number font-serif">{responseRate}%</div>
            <div className="kpi-label">Advisory Response Rate</div>
            <div className="kpi-subtext">{answeredInquiries} of {inquiries.length} answered</div>
          </div>
        </div>

        <div className="kpi-card card-surface">
          <div className="kpi-icon-box sage">
            <CheckCircle size={24} />
          </div>
          <div>
            <div className="kpi-number font-serif">{completedVisits}</div>
            <div className="kpi-label">Completed Tours</div>
            <div className="kpi-subtext">{confirmedVisits} upcoming confirmed</div>
          </div>
        </div>

        <div className="kpi-card card-surface">
          <div className="kpi-icon-box earth">
            <Building size={24} />
          </div>
          <div>
            <div className="kpi-number font-serif">{properties.length}</div>
            <div className="kpi-label">Active Portfolio Count</div>
            <div className="kpi-subtext">Managed luxury residences</div>
          </div>
        </div>

        <div className="kpi-card card-surface">
          <div className="kpi-icon-box accent">
            <Zap size={24} />
          </div>
          <div>
            <div className="kpi-number font-serif">
              {properties.length > 0 ? (visits.length / properties.length).toFixed(1) : '0.0'}
            </div>
            <div className="kpi-label">Avg. Tours per Listing</div>
            <div className="kpi-subtext">Buyer engagement ratio</div>
          </div>
        </div>
      </div>

      {/* Visual Analytics Grid */}
      <div className="agent-split-grid">
        {/* Chart 1: Listing Status Breakdown */}
        <div className="agent-section-card card-surface">
          <div className="agent-card-header">
            <h3 className="font-serif card-title">Portfolio Status Distribution</h3>
            <span className="card-badge-info">{properties.length} Total</span>
          </div>

          {loading ? (
            <Skeleton height="240px" />
          ) : listingChartData.length === 0 ? (
            <EmptyState
              icon={Building}
              title="No property listings"
              description="Publish properties to track status analytics."
            />
          ) : (
            <div style={{ height: '260px', width: '100%' }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={listingChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
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

        {/* Chart 2: Tour Pipeline Breakdown */}
        <div className="agent-section-card card-surface">
          <div className="agent-card-header">
            <h3 className="font-serif card-title">Tour Scheduling Pipeline</h3>
            <span className="card-badge-info">{visits.length} Appointments</span>
          </div>

          {loading ? (
            <Skeleton height="240px" />
          ) : visitChartData.length === 0 ? (
            <EmptyState
              icon={CalendarCheck}
              title="No tour bookings yet"
              description="Client visit requests will generate your conversion pipeline."
            />
          ) : (
            <div style={{ height: '260px', width: '100%' }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={visitChartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={85}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {visitChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={PALETTE[index % PALETTE.length]} />
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

      {/* Property Type Breakdown */}
      <div className="agent-section-card card-surface" style={{ marginBottom: '24px' }}>
        <div className="agent-card-header">
          <h3 className="font-serif card-title">Inventory by Architectural Category</h3>
          <span className="card-badge-info">{typeChartData.length} Categories</span>
        </div>

        {loading ? (
          <Skeleton height="200px" />
        ) : typeChartData.length === 0 ? (
          <EmptyState
            icon={Building}
            title="No inventory categories"
            description="Add properties to analyze type diversity."
          />
        ) : (
          <div style={{ height: '220px', width: '100%' }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={typeChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <XAxis dataKey="name" stroke="#81776C" fontSize={12} />
                <YAxis stroke="#81776C" fontSize={12} allowDecimals={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#FFFCF7',
                    borderColor: '#E6D8C6',
                    borderRadius: '8px',
                  }}
                />
                <Bar dataKey="count" fill="#43594A" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default AgentPerformancePage;
