import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, Clock, MapPin, XCircle, ExternalLink, Plus } from 'lucide-react';
import toast from 'react-hot-toast';
import DashboardLayout from '../../components/layout/DashboardLayout';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import { TableSkeleton } from '../../components/common/Skeleton';
import EmptyState from '../../components/common/EmptyState';
import visitApi from '../../services/visitApi';
import './ClientPages.css';

export const ClientVisitsPage = () => {
  const [visits, setVisits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedStatus, setSelectedStatus] = useState('ALL');

  // Cancel dialog
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [visitToCancel, setVisitToCancel] = useState(null);
  const [cancelling, setCancelling] = useState(false);

  const fetchVisits = async () => {
    setLoading(true);
    try {
      const data = await visitApi.getAll(selectedStatus !== 'ALL' ? selectedStatus : '');
      if (Array.isArray(data)) {
        setVisits(data);
      } else {
        setVisits([]);
      }
    } catch (err) {
      console.error('Failed to load visits', err);
      toast.error('Failed to load visits from service');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVisits();
  }, [selectedStatus]);

  const handleOpenCancelDialog = (visit) => {
    setVisitToCancel(visit);
    setCancelDialogOpen(true);
  };

  const handleConfirmCancel = async () => {
    if (!visitToCancel) return;
    setCancelling(true);
    try {
      // Client cancellation: updates status to CANCELLED
      await visitApi.updateStatus(visitToCancel.id, 'CANCELLED');
      toast.success('Visit has been cancelled');
      setCancelDialogOpen(false);
      setVisitToCancel(null);
      fetchVisits();
    } catch (err) {
      console.error('Failed to cancel visit', err);
      toast.error(err.response?.data?.message || 'Failed to cancel visit');
    } finally {
      setCancelling(false);
    }
  };

  return (
    <DashboardLayout title="My Scheduled Visits">
      <div className="client-page-header">
        <div>
          <h2 className="font-serif page-subtitle">Property Walkthroughs & Tours</h2>
          <p className="page-desc">
            Manage your scheduled private appointments and view agent confirmation statuses.
          </p>
        </div>

        <Link to="/properties">
          <Button variant="primary" icon={Plus}>
            Book a New Visit
          </Button>
        </Link>
      </div>

      {/* Filter Tabs */}
      <div className="filter-pill-tabs">
        {['ALL', 'REQUESTED', 'CONFIRMED', 'COMPLETED', 'CANCELLED'].map((st) => (
          <button
            key={st}
            type="button"
            className={`pill-tab ${selectedStatus === st ? 'is-active' : ''}`}
            onClick={() => setSelectedStatus(st)}
          >
            {st === 'ALL' ? 'All Visits' : st}
          </button>
        ))}
      </div>

      {/* Visits Table */}
      <div className="card-surface table-card">
        {loading ? (
          <TableSkeleton rows={4} cols={5} />
        ) : visits.length === 0 ? (
          <EmptyState
            icon={Calendar}
            title="No visits found"
            description={
              selectedStatus === 'ALL'
                ? 'You have not scheduled any property visits yet.'
                : `No visits currently match the ${selectedStatus} status.`
            }
            actionLabel="Explore Properties"
            onAction={() => (window.location.href = '/properties')}
          />
        ) : (
          <div className="table-responsive">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Appointment Date</th>
                  <th>Property</th>
                  <th>Location</th>
                  <th>Status</th>
                  <th>Notes</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {visits.map((visit) => {
                  const isCancellable =
                    visit.status === 'REQUESTED' || visit.status === 'CONFIRMED';
                  return (
                    <tr key={visit.id}>
                      <td>
                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                          <span style={{ fontWeight: 600 }}>
                            {visit.visitDate
                              ? new Date(visit.visitDate).toLocaleDateString('en-US', {
                                  month: 'short',
                                  day: 'numeric',
                                  year: 'numeric',
                                })
                              : 'TBA'}
                          </span>
                          <span style={{ fontSize: '0.82rem', color: 'var(--color-text-secondary)' }}>
                            {visit.visitDate
                              ? new Date(visit.visitDate).toLocaleTimeString([], {
                                  hour: '2-digit',
                                  minute: '2-digit',
                                })
                              : ''}
                          </span>
                        </div>
                      </td>

                      <td>
                        <Link
                          to={`/properties/${visit.propertyId}`}
                          className="table-link-title"
                          title="View property details"
                        >
                          {visit.propertySummary?.title || `Property #${visit.propertyId}`}
                          <ExternalLink size={13} style={{ marginLeft: '4px' }} />
                        </Link>
                      </td>

                      <td>
                        <span style={{ color: 'var(--color-text-secondary)' }}>
                          {visit.propertySummary?.location || '—'}
                        </span>
                      </td>

                      <td>
                        <Badge status={visit.status} />
                      </td>

                      <td>
                        <span style={{ fontSize: '0.88rem', color: 'var(--color-text-secondary)' }}>
                          {visit.notes || '—'}
                        </span>
                      </td>

                      <td style={{ textAlign: 'right' }}>
                        {isCancellable && (
                          <Button
                            variant="danger"
                            size="sm"
                            icon={XCircle}
                            onClick={() => handleOpenCancelDialog(visit)}
                          >
                            Cancel
                          </Button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Cancel Confirmation Dialog */}
      <ConfirmDialog
        isOpen={cancelDialogOpen}
        onClose={() => setCancelDialogOpen(false)}
        onConfirm={handleConfirmCancel}
        title="Cancel Visit Appointment?"
        message={`Are you sure you want to cancel your scheduled visit for "${visitToCancel?.propertySummary?.title || 'this property'}"?`}
        confirmText="Yes, Cancel Visit"
        loading={cancelling}
      />
    </DashboardLayout>
  );
};

export default ClientVisitsPage;
