import React, { useState, useEffect } from 'react';
import { CalendarCheck, Clock, Check, X, CheckCheck, ExternalLink } from 'lucide-react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import DashboardLayout from '../../components/layout/DashboardLayout';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import { TableSkeleton } from '../../components/common/Skeleton';
import EmptyState from '../../components/common/EmptyState';
import visitApi from '../../services/visitApi';
import './AgentPages.css';

export const AgentVisitsPage = () => {
  const [visits, setVisits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('ALL');

  const fetchVisits = async () => {
    setLoading(true);
    try {
      const data = await visitApi.getAll(statusFilter !== 'ALL' ? statusFilter : '');
      if (Array.isArray(data)) {
        setVisits(data);
      } else {
        setVisits([]);
      }
    } catch (err) {
      console.error('Failed to load agent visits', err);
      toast.error('Failed to load tour appointments');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVisits();
  }, [statusFilter]);

  const handleUpdateStatus = async (id, newStatus) => {
    try {
      await visitApi.updateStatus(id, newStatus);
      toast.success(`Visit marked as ${newStatus}`);
      fetchVisits();
    } catch (err) {
      console.error('Failed to update visit status', err);
      toast.error(err.response?.data?.message || 'Failed to update visit status');
    }
  };

  return (
    <DashboardLayout title="Client Tour Requests">
      <div className="agent-page-header">
        <div>
          <h2 className="font-serif agent-page-subtitle">Visit Appointment Queue</h2>
          <p className="agent-page-desc">
            Review client walkthrough requests, confirm viewing dates, or mark tours completed.
          </p>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="filter-pill-tabs">
        {['ALL', 'REQUESTED', 'CONFIRMED', 'COMPLETED', 'CANCELLED'].map((st) => (
          <button
            key={st}
            type="button"
            className={`pill-tab ${statusFilter === st ? 'is-active' : ''}`}
            onClick={() => setStatusFilter(st)}
          >
            {st === 'ALL' ? 'All Visits' : st}
          </button>
        ))}
      </div>

      {/* Visits Table */}
      <div className="card-surface table-card">
        {loading ? (
          <TableSkeleton rows={5} cols={6} />
        ) : visits.length === 0 ? (
          <EmptyState
            icon={CalendarCheck}
            title="No appointments found"
            description={
              statusFilter === 'ALL'
                ? 'No client visits have been requested for your listings yet.'
                : `No visits in ${statusFilter} status.`
            }
          />
        ) : (
          <div className="table-responsive">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Date & Time</th>
                  <th>Property</th>
                  <th>Client</th>
                  <th>Notes</th>
                  <th>Status</th>
                  <th style={{ textAlign: 'right' }}>Update Status</th>
                </tr>
              </thead>
              <tbody>
                {visits.map((v) => (
                  <tr key={v.id}>
                    <td>
                      <div style={{ display: 'flex', flexDirection: 'column' }}>
                        <span style={{ fontWeight: 600 }}>
                          {v.visitDate
                            ? new Date(v.visitDate).toLocaleDateString('en-US', {
                                month: 'short',
                                day: 'numeric',
                                year: 'numeric',
                              })
                            : 'TBA'}
                        </span>
                        <span style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)' }}>
                          {v.visitDate
                            ? new Date(v.visitDate).toLocaleTimeString([], {
                                hour: '2-digit',
                                minute: '2-digit',
                              })
                            : ''}
                        </span>
                      </div>
                    </td>

                    <td>
                      <Link to={`/properties/${v.propertyId}`} className="table-link-title">
                        {v.propertySummary?.title || `Property #${v.propertyId}`}
                        <ExternalLink size={12} style={{ marginLeft: '4px' }} />
                      </Link>
                      <div style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)' }}>
                        {v.propertySummary?.location}
                      </div>
                    </td>

                    <td>
                      <span style={{ fontSize: '0.9rem', color: 'var(--color-text)' }}>
                        Client #{v.userId}
                      </span>
                    </td>

                    <td style={{ maxWidth: '240px' }}>
                      <span style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)' }}>
                        {v.notes || '—'}
                      </span>
                    </td>

                    <td>
                      <Badge status={v.status} />
                    </td>

                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'inline-flex', gap: '6px' }}>
                        {v.status === 'REQUESTED' && (
                          <Button
                            variant="sage"
                            size="sm"
                            icon={Check}
                            onClick={() => handleUpdateStatus(v.id, 'CONFIRMED')}
                            title="Confirm appointment"
                          >
                            Confirm
                          </Button>
                        )}
                        {v.status === 'CONFIRMED' && (
                          <Button
                            variant="primary"
                            size="sm"
                            icon={CheckCheck}
                            onClick={() => handleUpdateStatus(v.id, 'COMPLETED')}
                            title="Mark tour completed"
                          >
                            Complete
                          </Button>
                        )}
                        {v.status !== 'CANCELLED' && v.status !== 'COMPLETED' && (
                          <Button
                            variant="danger"
                            size="sm"
                            icon={X}
                            onClick={() => handleUpdateStatus(v.id, 'CANCELLED')}
                            title="Decline / Cancel visit"
                          >
                            Cancel
                          </Button>
                        )}
                      </div>
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

export default AgentVisitsPage;
