import React, { useState, useEffect } from 'react';
import { CalendarCheck2, Search, Clock, MapPin, User, Eye } from 'lucide-react';
import toast from 'react-hot-toast';
import DashboardLayout from '../../components/layout/DashboardLayout';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import Badge from '../../components/common/Badge';
import Modal from '../../components/common/Modal';
import { TableSkeleton } from '../../components/common/Skeleton';
import EmptyState from '../../components/common/EmptyState';
import visitApi from '../../services/visitApi';
import './AdminPages.css';

const VISIT_STATUSES = ['REQUESTED', 'CONFIRMED', 'COMPLETED', 'CANCELLED'];

export const AdminVisitsPage = () => {
  const [visits, setVisits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [searchTerm, setSearchTerm] = useState('');

  // Selected visit modal
  const [selectedVisit, setSelectedVisit] = useState(null);

  const fetchVisits = async () => {
    setLoading(true);
    try {
      const data = await visitApi.getAll(statusFilter === 'ALL' ? '' : statusFilter);
      if (Array.isArray(data)) {
        setVisits(data);
      }
    } catch (err) {
      console.error('Failed to load global visits', err);
      toast.error('Failed to retrieve visit appointments');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVisits();
  }, [statusFilter]);

  const handleStatusChange = async (visitId, newStatus) => {
    try {
      await visitApi.updateStatus(visitId, newStatus);
      toast.success(`Visit #${visitId} updated to ${newStatus}`);
      fetchVisits();
    } catch (err) {
      console.error('Failed to update visit status', err);
      toast.error(err.response?.data?.message || 'Status update failed');
    }
  };

  const filteredVisits = visits.filter((v) => {
    if (!searchTerm.trim()) return true;
    const term = searchTerm.toLowerCase();
    const propTitle = (v.propertySummary?.title || '').toLowerCase();
    const notes = (v.notes || '').toLowerCase();
    const clientId = String(v.userId || '');
    return propTitle.includes(term) || notes.includes(term) || clientId.includes(term);
  });

  return (
    <DashboardLayout title="Global Visit Appointments">
      <div className="admin-page-header">
        <div>
          <h2 className="font-serif admin-page-subtitle">Platform Tour Management</h2>
          <p className="admin-page-desc">
            Complete schedule oversight of client property walkthroughs, agent confirmations, and completions.
          </p>
        </div>
      </div>

      {/* Toolbar */}
      <div className="admin-toolbar">
        <div className="filter-pill-tabs" style={{ marginBottom: 0 }}>
          {['ALL', ...VISIT_STATUSES].map((st) => (
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

        <div style={{ width: '280px' }}>
          <Input
            placeholder="Search by client, property, notes..."
            icon={Search}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Visits Table */}
      <div className="admin-table-wrapper">
        {loading ? (
          <TableSkeleton rows={6} cols={6} />
        ) : filteredVisits.length === 0 ? (
          <EmptyState
            icon={CalendarCheck2}
            title="No appointments found"
            description={
              searchTerm
                ? 'No appointments match your search term.'
                : statusFilter === 'ALL'
                ? 'No client visits have been scheduled yet.'
                : `No visits in ${statusFilter} state.`
            }
          />
        ) : (
          <table className="admin-table">
            <thead>
              <tr>
                <th>Appointment Date</th>
                <th>Property</th>
                <th>Client ID</th>
                <th>Notes / Details</th>
                <th>Status</th>
                <th style={{ textAlign: 'right' }}>Update Status</th>
              </tr>
            </thead>
            <tbody>
              {filteredVisits.map((v) => (
                <tr key={v.id}>
                  <td style={{ minWidth: '150px' }}>
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

                  <td style={{ minWidth: '200px' }}>
                    <div style={{ fontWeight: '600', color: 'var(--color-earth)', marginBottom: '2px' }}>
                      {v.propertySummary?.title || `Property #${v.propertyId}`}
                    </div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <MapPin size={12} color="var(--color-primary)" />
                      {v.propertySummary?.location || 'PrimeHaven Network'}
                    </div>
                  </td>

                  <td>
                    <span className="admin-id-badge">Client #{v.userId}</span>
                  </td>

                  <td style={{ maxWidth: '240px' }}>
                    <span
                      style={{
                        fontSize: '0.85rem',
                        color: 'var(--color-text)',
                        display: 'block',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {v.notes || 'No special requirements'}
                    </span>
                  </td>

                  <td>
                    <select
                      className="status-select-inline"
                      value={v.status || 'REQUESTED'}
                      onChange={(e) => handleStatusChange(v.id, e.target.value)}
                    >
                      {VISIT_STATUSES.map((st) => (
                        <option key={st} value={st}>
                          {st}
                        </option>
                      ))}
                    </select>
                  </td>

                  <td style={{ textAlign: 'right' }}>
                    <Button
                      variant="ghost"
                      size="sm"
                      icon={Eye}
                      onClick={() => setSelectedVisit(v)}
                    >
                      Inspect
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Visit Details Modal */}
      <Modal
        isOpen={Boolean(selectedVisit)}
        onClose={() => setSelectedVisit(null)}
        title="Appointment Inspection"
      >
        {selectedVisit && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ padding: '16px', backgroundColor: '#FAF5ED', borderRadius: '8px' }}>
              <h4 className="font-serif" style={{ fontSize: '1.1rem', marginBottom: '6px' }}>
                {selectedVisit.propertySummary?.title || `Property #${selectedVisit.propertyId}`}
              </h4>
              <p style={{ fontSize: '0.88rem', color: 'var(--color-text-secondary)' }}>
                {selectedVisit.propertySummary?.location} • ${Number(selectedVisit.propertySummary?.price || 0).toLocaleString()}
              </p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', fontSize: '0.9rem' }}>
              <div>
                <span style={{ color: 'var(--color-text-secondary)', fontSize: '0.8rem' }}>Client ID</span>
                <div>Client #{selectedVisit.userId}</div>
              </div>
              <div>
                <span style={{ color: 'var(--color-text-secondary)', fontSize: '0.8rem' }}>Scheduled Date</span>
                <div>
                  {selectedVisit.visitDate
                    ? new Date(selectedVisit.visitDate).toLocaleString()
                    : 'To be scheduled'}
                </div>
              </div>
              <div>
                <span style={{ color: 'var(--color-text-secondary)', fontSize: '0.8rem' }}>Assigned Agent</span>
                <div>
                  {selectedVisit.propertySummary?.agentId
                    ? `Agent #${selectedVisit.propertySummary?.agentId}`
                    : 'Direct Service'}
                </div>
              </div>
              <div>
                <span style={{ color: 'var(--color-text-secondary)', fontSize: '0.8rem' }}>Current Status</span>
                <div><Badge status={selectedVisit.status} /></div>
              </div>
            </div>

            <div>
              <span style={{ color: 'var(--color-text-secondary)', fontSize: '0.8rem' }}>Client Instructions / Notes</span>
              <p style={{ marginTop: '4px', fontSize: '0.92rem', padding: '10px', backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: '6px' }}>
                {selectedVisit.notes || 'None provided.'}
              </p>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '10px' }}>
              <Button variant="primary" onClick={() => setSelectedVisit(null)}>
                Close
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </DashboardLayout>
  );
};

export default AdminVisitsPage;
