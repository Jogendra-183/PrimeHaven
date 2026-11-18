import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { MessageSquare, ExternalLink, Trash2, Edit2, CheckCircle2, Clock } from 'lucide-react';
import toast from 'react-hot-toast';
import DashboardLayout from '../../components/layout/DashboardLayout';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import Modal from '../../components/common/Modal';
import Input from '../../components/common/Input';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import { TableSkeleton } from '../../components/common/Skeleton';
import EmptyState from '../../components/common/EmptyState';
import inquiryApi from '../../services/inquiryApi';
import './ClientPages.css';

export const ClientInquiriesPage = () => {
  const [inquiries, setInquiries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedStatus, setSelectedStatus] = useState('ALL');

  // Edit message modal
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [inquiryToEdit, setInquiryToEdit] = useState(null);
  const [editedMessage, setEditedMessage] = useState('');
  const [savingEdit, setSavingEdit] = useState(false);

  // Delete dialog
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [inquiryToDelete, setInquiryToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const fetchInquiries = async () => {
    setLoading(true);
    try {
      const data = await inquiryApi.getAll(selectedStatus !== 'ALL' ? selectedStatus : '');
      if (Array.isArray(data)) {
        setInquiries(data);
      } else {
        setInquiries([]);
      }
    } catch (err) {
      console.error('Failed to load inquiries', err);
      toast.error('Failed to load inquiries from service');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInquiries();
  }, [selectedStatus]);

  const handleOpenEdit = (inquiry) => {
    setInquiryToEdit(inquiry);
    setEditedMessage(inquiry.message || '');
    setEditModalOpen(true);
  };

  const handleSaveEdit = async (e) => {
    e.preventDefault();
    if (!editedMessage.trim()) {
      toast.error('Inquiry message cannot be empty');
      return;
    }
    setSavingEdit(true);
    try {
      await inquiryApi.update(inquiryToEdit.id, {
        message: editedMessage.trim(),
      });
      toast.success('Inquiry updated successfully');
      setEditModalOpen(false);
      fetchInquiries();
    } catch (err) {
      console.error('Failed to update inquiry', err);
      toast.error(err.response?.data?.message || 'Failed to update inquiry');
    } finally {
      setSavingEdit(false);
    }
  };

  const handleOpenDelete = (inquiry) => {
    setInquiryToDelete(inquiry);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!inquiryToDelete) return;
    setDeleting(true);
    try {
      await inquiryApi.delete(inquiryToDelete.id);
      toast.success('Inquiry withdrawn successfully');
      setDeleteDialogOpen(false);
      setInquiryToDelete(null);
      fetchInquiries();
    } catch (err) {
      console.error('Failed to delete inquiry', err);
      toast.error(err.response?.data?.message || 'Failed to withdraw inquiry');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <DashboardLayout title="My Property Inquiries">
      <div className="client-page-header">
        <div>
          <h2 className="font-serif page-subtitle">Correspondence & Questions</h2>
          <p className="page-desc">
            Review inquiries submitted to listing agents and monitor incoming replies.
          </p>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="filter-pill-tabs">
        {['ALL', 'OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED'].map((st) => (
          <button
            key={st}
            type="button"
            className={`pill-tab ${selectedStatus === st ? 'is-active' : ''}`}
            onClick={() => setSelectedStatus(st)}
          >
            {st === 'ALL' ? 'All Inquiries' : st}
          </button>
        ))}
      </div>

      {/* Inquiries Table */}
      <div className="card-surface table-card">
        {loading ? (
          <TableSkeleton rows={4} cols={5} />
        ) : inquiries.length === 0 ? (
          <EmptyState
            icon={MessageSquare}
            title="No inquiries found"
            description={
              selectedStatus === 'ALL'
                ? 'You have not submitted any inquiries yet.'
                : `No inquiries currently match the ${selectedStatus} status.`
            }
            actionLabel="Discover Properties"
            onAction={() => (window.location.href = '/properties')}
          />
        ) : (
          <div className="table-responsive">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Property</th>
                  <th>My Message</th>
                  <th>Agent Response</th>
                  <th>Status</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {inquiries.map((inquiry) => {
                  const isOpen = inquiry.status === 'OPEN';
                  return (
                    <tr key={inquiry.id}>
                      <td>
                        <Link
                          to={`/properties/${inquiry.propertyId}`}
                          className="table-link-title"
                          title="View property details"
                        >
                          {inquiry.propertySummary?.title || `Property #${inquiry.propertyId}`}
                          <ExternalLink size={13} style={{ marginLeft: '4px' }} />
                        </Link>
                        {inquiry.createdAt && (
                          <div style={{ fontSize: '0.78rem', color: 'var(--color-text-secondary)', marginTop: '2px' }}>
                            {new Date(inquiry.createdAt).toLocaleDateString()}
                          </div>
                        )}
                      </td>

                      <td style={{ maxWidth: '320px' }}>
                        <p style={{ fontSize: '0.92rem', color: 'var(--color-text)', lineHeight: 1.5 }}>
                          "{inquiry.message}"
                        </p>
                      </td>

                      <td style={{ maxWidth: '300px' }}>
                        {inquiry.response ? (
                          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '6px', color: 'var(--color-sage)', fontSize: '0.9rem' }}>
                            <CheckCircle2 size={16} style={{ flexShrink: 0, marginTop: '2px' }} />
                            <span>{inquiry.response}</span>
                          </div>
                        ) : (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--color-text-secondary)', fontSize: '0.84rem' }}>
                            <Clock size={14} />
                            <span>Pending response</span>
                          </div>
                        )}
                      </td>

                      <td>
                        <Badge status={inquiry.status} />
                      </td>

                      <td style={{ textAlign: 'right' }}>
                        {isOpen ? (
                          <div style={{ display: 'inline-flex', gap: '8px' }}>
                            <Button
                              variant="outline"
                              size="sm"
                              icon={Edit2}
                              onClick={() => handleOpenEdit(inquiry)}
                              title="Edit message"
                            >
                              Edit
                            </Button>
                            <Button
                              variant="danger"
                              size="sm"
                              icon={Trash2}
                              onClick={() => handleOpenDelete(inquiry)}
                              title="Withdraw inquiry"
                            >
                              Withdraw
                            </Button>
                          </div>
                        ) : (
                          <span style={{ fontSize: '0.82rem', color: 'var(--color-text-secondary)' }}>
                            Locked ({inquiry.status})
                          </span>
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

      {/* Edit Inquiry Modal */}
      <Modal
        isOpen={editModalOpen}
        onClose={() => setEditModalOpen(false)}
        title="Edit Inquiry Message"
        subtitle="You can edit inquiries while they remain in OPEN status"
      >
        <form onSubmit={handleSaveEdit} className="modal-form-flow">
          <Input
            label="Inquiry Message"
            name="editedMessage"
            type="textarea"
            rows={4}
            required
            value={editedMessage}
            onChange={(e) => setEditedMessage(e.target.value)}
          />

          <div className="modal-form-actions">
            <Button
              variant="outline"
              onClick={() => setEditModalOpen(false)}
              disabled={savingEdit}
            >
              Cancel
            </Button>
            <Button type="submit" variant="primary" loading={savingEdit}>
              Save Changes
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        onConfirm={handleConfirmDelete}
        title="Withdraw Inquiry?"
        message="Are you sure you want to withdraw this inquiry from the agent's queue?"
        confirmText="Yes, Withdraw"
        loading={deleting}
      />
    </DashboardLayout>
  );
};

export default ClientInquiriesPage;
