import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Calendar,
  MessageSquare,
  Heart,
  Compass,
  ArrowRight,
  Clock,
  MapPin,
  CheckCircle,
} from 'lucide-react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import Skeleton from '../../components/common/Skeleton';
import EmptyState from '../../components/common/EmptyState';
import { useAuth } from '../../context/AuthContext';
import visitApi from '../../services/visitApi';
import inquiryApi from '../../services/inquiryApi';
import { getFavorites } from '../../utils/favoritesStorage';
import './ClientPages.css';

export const ClientDashboard = () => {
  const { user } = useAuth();
  const [visits, setVisits] = useState([]);
  const [inquiries, setInquiries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [savedCount, setSavedCount] = useState(0);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [vData, iData] = await Promise.allSettled([
          visitApi.getAll(),
          inquiryApi.getAll(),
        ]);

        if (vData.status === 'fulfilled' && Array.isArray(vData.value)) {
          setVisits(vData.value);
        }
        if (iData.status === 'fulfilled' && Array.isArray(iData.value)) {
          setInquiries(iData.value);
        }
        const favs = getFavorites(user?.id);
        setSavedCount(favs.length);
      } catch (err) {
        console.error('Failed to load dashboard data', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [user?.id]);

  const upcomingVisits = visits.filter(
    (v) => v.status === 'REQUESTED' || v.status === 'CONFIRMED'
  );

  return (
    <DashboardLayout title="Client Overview">
      {/* Welcome Banner */}
      <div className="client-welcome-card card-surface">
        <div className="welcome-text-side">
          <span className="welcome-eyebrow">Welcome to your Haven</span>
          <h2 className="welcome-name font-serif">
            Hello, {user?.fullName || user?.username}!
          </h2>
          <p className="welcome-desc">
            Track your scheduled property walkthroughs, review agent responses, and explore curated residences.
          </p>
          <div className="welcome-actions">
            <Link to="/properties">
              <Button variant="primary" icon={Compass}>
                Explore Properties
              </Button>
            </Link>
            <Link to="/client/visits">
              <Button variant="outline" icon={Calendar}>
                View My Appointments
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="metrics-summary-grid">
        <div className="metric-card card-surface">
          <div className="metric-icon-wrap terracotta">
            <Calendar size={22} />
          </div>
          <div>
            <div className="metric-value font-serif">{upcomingVisits.length}</div>
            <div className="metric-label">Active / Upcoming Visits</div>
          </div>
        </div>

        <div className="metric-card card-surface">
          <div className="metric-icon-wrap sage">
            <MessageSquare size={22} />
          </div>
          <div>
            <div className="metric-value font-serif">{inquiries.length}</div>
            <div className="metric-label">Inquiries Submitted</div>
          </div>
        </div>

        <div className="metric-card card-surface">
          <div className="metric-icon-wrap earth">
            <Heart size={22} />
          </div>
          <div>
            <div className="metric-value font-serif">{savedCount}</div>
            <div className="metric-label">Saved Properties</div>
          </div>
        </div>
      </div>

      {/* Two Column Grid: Upcoming Visits & Recent Inquiries */}
      <div className="dashboard-double-col">
        {/* Left: Upcoming Visits */}
        <div className="dashboard-section-card card-surface">
          <div className="section-card-header">
            <div>
              <h3 className="card-heading font-serif">Upcoming Private Visits</h3>
              <p className="card-subtext">Guided property appointments</p>
            </div>
            <Link to="/client/visits" className="card-header-link">
              View All <ArrowRight size={14} />
            </Link>
          </div>

          {loading ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <Skeleton height="70px" />
              <Skeleton height="70px" />
            </div>
          ) : upcomingVisits.length === 0 ? (
            <EmptyState
              icon={Calendar}
              title="No upcoming visits scheduled"
              description="Browse properties and request a private tour to visit on your schedule."
              actionLabel="Discover Properties"
              onAction={() => (window.location.href = '/properties')}
            />
          ) : (
            <div className="appointment-list">
              {upcomingVisits.slice(0, 4).map((visit) => (
                <div key={visit.id} className="appointment-item">
                  <div className="appointment-date-badge">
                    <Calendar size={18} />
                    <span>
                      {visit.visitDate
                        ? new Date(visit.visitDate).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                          })
                        : 'Scheduled'}
                    </span>
                  </div>

                  <div className="appointment-info">
                    <h4 className="appointment-title">
                      {visit.propertySummary?.title || `Property #${visit.propertyId}`}
                    </h4>
                    <p className="appointment-time">
                      <Clock size={13} />
                      {visit.visitDate
                        ? new Date(visit.visitDate).toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit',
                          })
                        : 'Time TBA'}
                      {visit.propertySummary?.location && ` • ${visit.propertySummary.location}`}
                    </p>
                  </div>

                  <Badge status={visit.status} />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right: Recent Inquiries */}
        <div className="dashboard-section-card card-surface">
          <div className="section-card-header">
            <div>
              <h3 className="card-heading font-serif">Recent Inquiries</h3>
              <p className="card-subtext">Direct correspondence with agents</p>
            </div>
            <Link to="/client/inquiries" className="card-header-link">
              View All <ArrowRight size={14} />
            </Link>
          </div>

          {loading ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <Skeleton height="70px" />
              <Skeleton height="70px" />
            </div>
          ) : inquiries.length === 0 ? (
            <EmptyState
              icon={MessageSquare}
              title="No active inquiries"
              description="Have questions about a listing? Send an inquiry directly from any property page."
              actionLabel="Browse Listings"
              onAction={() => (window.location.href = '/properties')}
            />
          ) : (
            <div className="inquiry-summary-list">
              {inquiries.slice(0, 4).map((inquiry) => (
                <div key={inquiry.id} className="inquiry-summary-item">
                  <div className="inquiry-item-header">
                    <span className="inquiry-property-name">
                      {inquiry.propertySummary?.title || `Property #${inquiry.propertyId}`}
                    </span>
                    <Badge status={inquiry.status} />
                  </div>
                  <p className="inquiry-message-text">"{inquiry.message}"</p>
                  {inquiry.response ? (
                    <div className="inquiry-reply-preview">
                      <CheckCircle size={14} className="reply-check-icon" />
                      <span><strong>Agent Reply:</strong> {inquiry.response}</span>
                    </div>
                  ) : (
                    <div className="inquiry-pending-tag">
                      <Clock size={13} /> Awaiting agent review
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default ClientDashboard;
