import React, { useState, useEffect } from 'react';
import { MessageSquareCode, Search, Trash2, Edit3, CheckCircle2, Clock } from 'lucide-react';
import toast from 'react-hot-toast';
import DashboardLayout from '../../components/layout/DashboardLayout';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import Select from '../../components/common/Select';
import Badge from '../../components/common/Badge';
import Modal from '../../components/common/Modal';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import { TableSkeleton } from '../../components/common/Skeleton';
import EmptyState from '../../components/common/EmptyState';
import inquiryApi from '../../services/inquiryApi';
import './AdminPages.css';

const INQUIRY_STATUSES = [
  { value: 'OPEN', label: 'Open' },
  { value: 'IN_PROGRESS', label: 'In Progress' },
  { value: 'RESOLVED', label: 'Resolved' },
  { value: 'CLOSED', label: 'Closed' },
];

export const AdminInquiriesPage = () => {
  const [inquiries, setInquiries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [searchTerm, setSearchTerm] = useState('');

  // Edit / Reply Modal
  const [selectedInquiry, setSelectedInquiry] = useState(null);
  const [adminResponseText, setAdminResponseText] = useState('');
  const [updatedStatus, setUpdatedStatus] = useState('RESOLVED');
  const [submitting, setSubmitting] = useState(false);

  // Deletion Modal
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [inquiryToDelete, setInquiryToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const fetchInquiries = async () => {
    setLoading(true);
    try {
      const data = await inquiryApi.getAll(statusFilter === 'ALL' ? '' : statusFilter);
      if (Array.isArray(data)) {
        setInquiries(data);
      }
    } catch (err) {
      console.error('Failed to load global inquiries', err);
      toast.error('Failed to retrieve inquiries');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInquiries();
  }, [statusFilter]);

  const handleOpenEdit = (inq) => {
    setSelectedInquiry(inq);
    setAdminResponseText(inq.response || '');
    setUpdatedStatus(inq.status || 'RESOLVED');
  };

  const handleSaveResponse = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await inquiryApi.update(selectedInquiry.id, {
        response: adminResponseText.trim(),
        status: updatedStatus,
      });
      toast.success('Inquiry updated successfully');
      setSelectedInquiry(null);
      fetchInquiries();
    } catch (err) {
      console.error('Failed to update inquiry', err);
      toast.error(err.response?.data?.message || 'Update failed');
    } finally {
      setSubmitting(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!inquiryToDelete) return;
    setDeleting(true);
    try {
      await inquiryApi.delete(inquiryToDelete.id);
      toast.success(`Inquiry #${inquiryToDelete.id} removed`);
      setDeleteDialogOpen(false);
      setInquiryToDelete(null);
      fetchInquiries();
    } catch (err) {
      console.error('Failed to delete inquiry', err);
      toast.error(err.response?.data?.message || 'Delete failed');
    } finally {
      setDeleting(false);
    }
  };

  const filteredInquiries = inquiries.filter((inq) => {
    if (!searchTerm.trim()) return true;
    const term = searchTerm.toLowerCase();
    const propTitle = (inq.propertySummary?.title || '').toLowerCase();
    const msg = (inq.message || '').toLowerCase();
    const resp = (inq.response || '').toLowerCase();
    const clientId = String(inq.userId || '');
    return propTitle.includes(term) || msg.includes(term) || resp.includes(term) || clientId.includes(term);
  });

  return (
    <DashboardLayout title="Global Inquiries Management">
      <div className="admin-page-header">
        <div>
          <h2 className="font-serif admin-page-subtitle">Platform Communication Oversight</h2>
          <p className="admin-page-desc">
            Monitor client inquiries, verify agent response quality, and manage communication threads.
          </p>
        </div>
      </div>

      {/* Toolbar */}
      <div className="admin-toolbar">
        <div className="filter-pill-tabs" style={{ marginBottom: 0 }}>
          {['ALL', 'OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED'].map((st) => (
            <button
              key={st}
              type="button"
              className={`pill-tab ${statusFilter === st ? 'is-active' : ''}`}
              onClick={() => setStatusFilter(st)}
            >
              {st === 'ALL' ? 'All Inquiries' : st.replace('_', ' ')}
            </button>
          ))}
        </div>

        <div style={{ width: '280px' }}>
          <Input
            placeholder="Search by client, property, text..."
            icon={Search}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Table */}
      <div className="admin-table-wrapper">
        {loading ? (
          <TableSkeleton rows={6} cols={6} />
        ) : filteredInquiries.length === 0 ? (
          <EmptyState
            icon={MessageSquareCode}
            title="No inquiries found"
            description={
              searchTerm
                ? 'No inquiries match your search filter.'
                : 'No client inquiries recorded across the platform.'
            }
          />
        ) : (
          <table className="admin-table">
            <thead>
              <tr>
                <th>Property</th>
                <th>Client</th>
                <th>Question / Message</th>
                <th>Agent Response</th>
                <th>Status</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredInquiries.map((inq) => (
                <tr key={inq.id}>
                  <td style={{ minWidth: '180px' }}>
                    <div style={{ fontWeight: '600', color: 'var(--color-earth)', marginBottom: '2px' }}>
                      {inq.propertySummary?.title || `Property #${inq.propertyId}`}
                    </div>
                    <span className="admin-id-badge">
                      {inq.agentId ? `Agent #${inq.agentId}` : 'No Agent'}
                    </span>
                  </td>

                  <td>
                    <span className="admin-id-badge">Client #{inq.userId}</span>
                  </td>

                  <td style={{ maxWidth: '240px' }}>
                    <div
                      style={{
                        fontSize: '0.85rem',
                        color: 'var(--color-text)',
                        whiteSpace: 'pre-wrap',
                        maxHeight: '3.5em',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                      }}
                    >
                      "{inq.message}"
                    </div>
                  </td>

                  <td style={{ maxWidth: '220px' }}>
                    {inq.response ? (
                      <div
                        style={{
                          fontSize: '0.82rem',
                          color: 'var(--color-sage)',
                          backgroundColor: 'var(--color-soft-sage)',
                          padding: '4px 8px',
                          borderRadius: '4px',
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                        }}
                      >
                        <CheckCircle2 size={12} style={{ display: 'inline', marginRight: '4px' }} />
                        {inq.response}
                      </div>
                    ) : (
                      <span style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)', fontStyle: 'italic' }}>
                        Pending response
                      </span>
                    )}
                  </td>

                  <td>
                    <Badge status={inq.status} />
                  </td>

                  <td style={{ textAlign: 'right' }}>
                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                      <button
                        type="button"
                        className="admin-action-btn"
                        title="Edit response / status"
                        onClick={() => handleOpenEdit(inq)}
                      >
                        <Edit3 size={15} />
                      </button>

                      <button
                        type="button"
                        className="admin-action-btn delete"
                        title="Delete inquiry"
                        onClick={() => {
                          setInquiryToDelete(inq);
                          setDeleteDialogOpen(true);
                        }}
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Edit Response Modal */}
      <Modal
        isOpen={Boolean(selectedInquiry)}
        onClose={() => setSelectedInquiry(null)}
        title="Administrative Inquiry Management"
      >
        {selectedInquiry && (
          <form onSubmit={handleSaveResponse} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ padding: '14px', backgroundColor: '#FAF5ED', borderRadius: '8px' }}>
              <div style={{ fontSize: '0.82rem', color: 'var(--color-text-secondary)', marginBottom: '4px' }}>
                Client #{selectedInquiry.userId} • Property: {selectedInquiry.propertySummary?.title || `#${selectedInquiry.propertyId}`}
              </div>
              <p style={{ fontSize: '0.92rem', color: 'var(--color-text)' }}>"{selectedInquiry.message}"</p>
            </div>

            <Input
              label="Advisory Response"
              type="textarea"
              rows={4}
              value={adminResponseText}
              onChange={(e) => setAdminResponseText(e.target.value)}
              placeholder="Enter official response or instructions..."
            />

            <Select
              label="Status"
              options={INQUIRY_STATUSES}
              value={updatedStatus}
              onChange={(e) => setUpdatedStatus(e.target.value)}
              required
            />

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '10px' }}>
              <Button type="button" variant="outline" onClick={() => setSelectedInquiry(null)} disabled={submitting}>
                Cancel
              </Button>
              <Button type="submit" variant="primary" loading={submitting}>
                Save Changes
              </Button>
            </div>
          </form>
        )}
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={deleteDialogOpen}
        onClose={() => {
          setDeleteDialogOpen(false);
          setInquiryToDelete(null);
        }}
        onConfirm={handleConfirmDelete}
        title="Delete Inquiry"
        message={`Are you sure you want to delete inquiry #${inquiryToDelete?.id}? This cannot be undone.`}
        confirmLabel="Delete"
        variant="danger"
        loading={deleting}
      />
    </DashboardLayout>
  );
};

export default AdminInquiriesPage;
