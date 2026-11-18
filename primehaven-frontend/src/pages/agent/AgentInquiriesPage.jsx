import React, { useState, useEffect } from 'react';
import { Mail, Search, MessageSquare, Send, CheckCircle2, Clock } from 'lucide-react';
import toast from 'react-hot-toast';
import DashboardLayout from '../../components/layout/DashboardLayout';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import Select from '../../components/common/Select';
import Badge from '../../components/common/Badge';
import Modal from '../../components/common/Modal';
import { TableSkeleton } from '../../components/common/Skeleton';
import EmptyState from '../../components/common/EmptyState';
import inquiryApi from '../../services/inquiryApi';
import './AgentPages.css';

const INQUIRY_STATUSES = [
  { value: 'OPEN', label: 'Open / Unanswered' },
  { value: 'IN_PROGRESS', label: 'In Progress / Researching' },
  { value: 'RESOLVED', label: 'Resolved / Answered' },
  { value: 'CLOSED', label: 'Closed' },
];

export const AgentInquiriesPage = () => {
  const [inquiries, setInquiries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [searchTerm, setSearchTerm] = useState('');

  // Reply Modal State
  const [selectedInquiry, setSelectedInquiry] = useState(null);
  const [replyText, setReplyText] = useState('');
  const [newStatus, setNewStatus] = useState('RESOLVED');
  const [submittingReply, setSubmittingReply] = useState(false);

  const fetchInquiries = async () => {
    setLoading(true);
    try {
      const data = await inquiryApi.getAll(statusFilter === 'ALL' ? '' : statusFilter);
      if (Array.isArray(data)) {
        setInquiries(data);
      }
    } catch (err) {
      console.error('Failed to load inquiries', err);
      toast.error('Failed to retrieve inquiries');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInquiries();
  }, [statusFilter]);

  const handleOpenReplyModal = (inq) => {
    setSelectedInquiry(inq);
    setReplyText(inq.response || '');
    setNewStatus(inq.status === 'OPEN' ? 'RESOLVED' : inq.status || 'RESOLVED');
  };

  const handleCloseReplyModal = () => {
    setSelectedInquiry(null);
    setReplyText('');
    setSubmittingReply(false);
  };

  const handleSubmitReply = async (e) => {
    e.preventDefault();
    if (!replyText.trim()) {
      toast.error('Please enter an advisory response for the prospective client');
      return;
    }

    setSubmittingReply(true);
    try {
      await inquiryApi.update(selectedInquiry.id, {
        response: replyText.trim(),
        status: newStatus,
      });
      toast.success('Response dispatched to client');
      handleCloseReplyModal();
      fetchInquiries();
    } catch (err) {
      console.error('Failed to submit response', err);
      toast.error(err.response?.data?.message || 'Failed to submit response');
    } finally {
      setSubmittingReply(false);
    }
  };

  const filteredInquiries = inquiries.filter((inq) => {
    if (!searchTerm.trim()) return true;
    const term = searchTerm.toLowerCase();
    const propTitle = inq.propertySummary?.title?.toLowerCase() || '';
    const msg = inq.message?.toLowerCase() || '';
    const clientId = String(inq.userId || '');
    return propTitle.includes(term) || msg.includes(term) || clientId.includes(term);
  });

  return (
    <DashboardLayout title="Client Inquiries & Messages">
      <div className="agent-page-header">
        <div>
          <h2 className="font-serif agent-page-subtitle">Inquiry Dispatch & Advisory</h2>
          <p className="agent-page-desc">
            Review buyer questions, provide architectural and transaction details, and maintain high response rates.
          </p>
        </div>
      </div>

      {/* Filter Tabs & Search */}
      <div className="agent-filter-bar">
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

      {/* Inquiries Table */}
      <div className="card-surface table-card">
        {loading ? (
          <TableSkeleton rows={5} cols={5} />
        ) : filteredInquiries.length === 0 ? (
          <EmptyState
            icon={Mail}
            title="No inquiries found"
            description={
              searchTerm
                ? 'No inquiries match your search criteria.'
                : statusFilter === 'ALL'
                ? 'You have not received any client inquiries for your properties yet.'
                : `No inquiries with status ${statusFilter}.`
            }
          />
        ) : (
          <div className="table-responsive">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Client & Property</th>
                  <th>Client Message</th>
                  <th>Agent Response</th>
                  <th>Status</th>
                  <th style={{ textAlign: 'right' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredInquiries.map((inq) => (
                  <tr key={inq.id}>
                    <td style={{ minWidth: '180px' }}>
                      <div className="row-title">
                        {inq.propertySummary?.title || `Property #${inq.propertyId}`}
                      </div>
                      <div className="row-meta">
                        Client #{inq.userId} •{' '}
                        {inq.createdAt
                          ? new Date(inq.createdAt).toLocaleDateString([], {
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric',
                            })
                          : 'Recent'}
                      </div>
                    </td>

                    <td style={{ maxWidth: '280px' }}>
                      <div
                        style={{
                          fontSize: '0.88rem',
                          color: 'var(--color-text)',
                          whiteSpace: 'pre-wrap',
                          maxHeight: '4.5em',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                        }}
                      >
                        "{inq.message}"
                      </div>
                    </td>

                    <td style={{ maxWidth: '260px' }}>
                      {inq.response ? (
                        <div
                          style={{
                            fontSize: '0.85rem',
                            color: 'var(--color-sage)',
                            backgroundColor: 'var(--color-soft-sage)',
                            padding: '6px 10px',
                            borderRadius: '6px',
                            display: 'inline-block',
                          }}
                        >
                          <CheckCircle2 size={13} style={{ display: 'inline', marginRight: '4px' }} />
                          {inq.response}
                        </div>
                      ) : (
                        <span style={{ fontSize: '0.82rem', color: 'var(--color-text-secondary)', fontStyle: 'italic' }}>
                          Awaiting agent reply
                        </span>
                      )}
                    </td>

                    <td>
                      <Badge status={inq.status} />
                    </td>

                    <td style={{ textAlign: 'right' }}>
                      <Button
                        variant={inq.response ? 'outline' : 'primary'}
                        size="sm"
                        icon={MessageSquare}
                        onClick={() => handleOpenReplyModal(inq)}
                      >
                        {inq.response ? 'Update' : 'Respond'}
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Reply Modal */}
      <Modal
        isOpen={Boolean(selectedInquiry)}
        onClose={handleCloseReplyModal}
        title="Respond to Prospective Client"
      >
        {selectedInquiry && (
          <form onSubmit={handleSubmitReply} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
            {/* Inquiry Context */}
            <div className="inquiry-message-card">
              <div className="inquiry-client-meta">
                <strong>Client #{selectedInquiry.userId}</strong>
                <span>• Regarding: {selectedInquiry.propertySummary?.title || `Property #${selectedInquiry.propertyId}`}</span>
              </div>
              <p className="inquiry-client-body">"{selectedInquiry.message}"</p>
            </div>

            <Input
              label="Your Advisory Response"
              type="textarea"
              rows={4}
              required
              placeholder="Provide requested property details, pricing terms, viewing availability, or contact steps..."
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
              hint="This response will be visible on the client's PrimeHaven inquiry dashboard."
            />

            <Select
              label="Update Inquiry Status"
              options={INQUIRY_STATUSES}
              value={newStatus}
              onChange={(e) => setNewStatus(e.target.value)}
              required
            />

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '8px' }}>
              <Button type="button" variant="outline" onClick={handleCloseReplyModal} disabled={submittingReply}>
                Cancel
              </Button>
              <Button type="submit" variant="primary" icon={Send} loading={submittingReply}>
                Send Advisory Reply
              </Button>
            </div>
          </form>
        )}
      </Modal>
    </DashboardLayout>
  );
};

export default AgentInquiriesPage;
