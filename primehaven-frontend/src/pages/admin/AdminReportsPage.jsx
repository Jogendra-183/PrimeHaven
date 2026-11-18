import React, { useState, useEffect } from 'react';
import {
  TrendingUp,
  BarChart3,
  DollarSign,
  Building,
  CalendarCheck,
  MessageSquare,
  ShieldCheck,
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
import propertyApi from '../../services/propertyApi';
import visitApi from '../../services/visitApi';
import inquiryApi from '../../services/inquiryApi';
import './AdminPages.css';

const PALETTE = ['#B86648', '#43594A', '#D9B98C', '#BD4848', '#76644E'];

export const AdminReportsPage = () => {
  const [properties, setProperties] = useState([]);
  const [visits, setVisits] = useState([]);
  const [inquiries, setInquiries] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReportData = async () => {
      setLoading(true);
      try {
        const [p, v, i] = await Promise.all([
          propertyApi.getAll(),
          visitApi.getAll(),
          inquiryApi.getAll(),
        ]);
        if (Array.isArray(p)) setProperties(p);
        if (Array.isArray(v)) setVisits(v);
        if (Array.isArray(i)) setInquiries(i);
      } catch (err) {
        console.error('Failed to load reports data', err);
      } finally {
        setLoading(false);
      }
    };

    fetchReportData();
  }, []);

  // Financial & Inventory Statistics
  const totalValuation = properties.reduce((sum, p) => sum + (Number(p.price) || 0), 0);
  const avgPrice = properties.length > 0 ? Math.round(totalValuation / properties.length) : 0;
  const maxPrice = properties.reduce((max, p) => Math.max(max, Number(p.price) || 0), 0);

  // Property types distribution
  const typeMap = properties.reduce((acc, p) => {
    const t = p.propertyType || 'Apartment';
    acc[t] = (acc[t] || 0) + 1;
    return acc;
  }, {});
  const typeData = Object.keys(typeMap).map((k) => ({ name: k, count: typeMap[k] }));

  // Visit status distribution
  const visitMap = visits.reduce((acc, v) => {
    const st = v.status || 'REQUESTED';
    acc[st] = (acc[st] || 0) + 1;
    return acc;
  }, {});
  const visitData = Object.keys(visitMap).map((k) => ({ name: k, value: visitMap[k] }));

  // Inquiry resolution
  const answeredInquiries = inquiries.filter((i) => i.response && i.response.trim().length > 0).length;
  const unansweredInquiries = inquiries.length - answeredInquiries;
  const inquiryData = [
    { name: 'Resolved / Answered', value: answeredInquiries },
    { name: 'Pending Agent Response', value: unansweredInquiries },
  ].filter((d) => d.value > 0);

  return (
    <DashboardLayout title="System Reports & Intelligence">
      <div className="admin-page-header">
        <div>
          <h2 className="font-serif admin-page-subtitle">Platform Analytics & Trends</h2>
          <p className="admin-page-desc">
            Aggregated intelligence spanning marketplace capitalization, category distribution, and appointment volume.
          </p>
        </div>
      </div>

      {/* Portfolio Financial Summary */}
      <div className="admin-stats-grid">
        <div className="admin-stat-card card-surface">
          <div className="admin-stat-icon terracotta">
            <DollarSign size={24} />
          </div>
          <div>
            <div className="admin-stat-number font-serif">
              ${(totalValuation / 1000000).toFixed(1)}M
            </div>
            <div className="admin-stat-label">Total Inventory Value</div>
            <div className="admin-stat-sub">Gross marketplace volume</div>
          </div>
        </div>

        <div className="admin-stat-card card-surface">
          <div className="admin-stat-icon gold">
            <TrendingUp size={24} />
          </div>
          <div>
            <div className="admin-stat-number font-serif">
              ${(avgPrice / 1000).toFixed(0)}k
            </div>
            <div className="admin-stat-label">Average Listing Price</div>
            <div className="admin-stat-sub">Across all categories</div>
          </div>
        </div>

        <div className="admin-stat-card card-surface">
          <div className="admin-stat-icon sage">
            <Building size={24} />
          </div>
          <div>
            <div className="admin-stat-number font-serif">
              ${(maxPrice / 1000000).toFixed(1)}M
            </div>
            <div className="admin-stat-label">Top Flagship Asset</div>
            <div className="admin-stat-sub">Highest valued listing</div>
          </div>
        </div>

        <div className="admin-stat-card card-surface">
          <div className="admin-stat-icon earth">
            <ShieldCheck size={24} />
          </div>
          <div>
            <div className="admin-stat-number font-serif">
              {inquiries.length > 0 ? Math.round((answeredInquiries / inquiries.length) * 100) : 100}%
            </div>
            <div className="admin-stat-label">Resolution Rate</div>
            <div className="admin-stat-sub">Global agent response rate</div>
          </div>
        </div>
      </div>

      {/* 2-Column Visual Charts */}
      <div className="admin-command-grid">
        {/* Category Breakdown */}
        <div className="admin-panel-card card-surface">
          <div className="admin-panel-header">
            <h3 className="font-serif">Listings by Architectural Typology</h3>
            <span className="card-badge-info">{typeData.length} Types</span>
          </div>

          {loading ? (
            <Skeleton height="240px" />
          ) : typeData.length === 0 ? (
            <EmptyState icon={BarChart3} title="No inventory data" description="Publish properties to generate report." />
          ) : (
            <div style={{ height: '260px', width: '100%' }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={typeData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
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

        {/* Visit Status Pipeline */}
        <div className="admin-panel-card card-surface">
          <div className="admin-panel-header">
            <h3 className="font-serif">Client Tour Pipeline Distribution</h3>
            <span className="card-badge-info">{visits.length} Total</span>
          </div>

          {loading ? (
            <Skeleton height="240px" />
          ) : visitData.length === 0 ? (
            <EmptyState icon={CalendarCheck} title="No visits recorded" description="Client visits will appear here." />
          ) : (
            <div style={{ height: '260px', width: '100%' }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={visitData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={85}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {visitData.map((entry, index) => (
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
    </DashboardLayout>
  );
};

export default AdminReportsPage;
