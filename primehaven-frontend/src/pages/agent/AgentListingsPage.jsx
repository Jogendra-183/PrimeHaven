import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Building, Plus, Search, Edit2, Trash2, Eye, MapPin } from 'lucide-react';
import toast from 'react-hot-toast';
import DashboardLayout from '../../components/layout/DashboardLayout';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import Badge from '../../components/common/Badge';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import { TableSkeleton } from '../../components/common/Skeleton';
import EmptyState from '../../components/common/EmptyState';
import { useAuth } from '../../context/AuthContext';
import propertyApi from '../../services/propertyApi';
import './AgentPages.css';

export const AgentListingsPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  // Delete modal state
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [propertyToDelete, setPropertyToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const fetchProperties = async () => {
    setLoading(true);
    try {
      const data = await propertyApi.getAll();
      if (Array.isArray(data)) {
        // Filter to properties assigned to this agent
        const agentOnly = data.filter(
          (p) => p.agentId === user?.id || !p.agentId
        );
        setProperties(agentOnly);
      }
    } catch (err) {
      console.error('Failed to load agent listings', err);
      toast.error('Failed to retrieve listings');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProperties();
  }, [user?.id]);

  const handleStatusChange = async (propertyId, newStatus) => {
    try {
      await propertyApi.updateStatus(propertyId, newStatus);
      toast.success(`Property status updated to ${newStatus}`);
      fetchProperties();
    } catch (err) {
      console.error('Failed to update status', err);
      toast.error(err.response?.data?.message || 'Failed to update property status');
    }
  };

  const handleOpenDelete = (property) => {
    setPropertyToDelete(property);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!propertyToDelete) return;
    setDeleting(true);
    try {
      await propertyApi.delete(propertyToDelete.id);
      toast.success('Property listing deleted successfully');
      setDeleteDialogOpen(false);
      setPropertyToDelete(null);
      fetchProperties();
    } catch (err) {
      console.error('Failed to delete property', err);
      toast.error(err.response?.data?.message || 'Failed to delete property');
    } finally {
      setDeleting(false);
    }
  };

  const filtered = properties.filter((p) => {
    const matchSearch =
      (p.title && p.title.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (p.location && p.location.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchStatus =
      statusFilter === 'ALL' ||
      (p.status && p.status.toUpperCase() === statusFilter);
    return matchSearch && matchStatus;
  });

  return (
    <DashboardLayout title="My Listings Management">
      <div className="agent-page-header">
        <div>
          <h2 className="font-serif agent-page-subtitle">Managed Real Estate Portfolio</h2>
          <p className="agent-page-desc">
            Create, update, and manage your properties, price adjustments, and market availability.
          </p>
        </div>

        <Link to="/agent/listings/new">
          <Button variant="primary" icon={Plus}>
            Add New Property
          </Button>
        </Link>
      </div>

      {/* Search and Filter Bar */}
      <div className="agent-toolbar card-surface">
        <div style={{ flex: 1, maxWidth: '400px' }}>
          <Input
            placeholder="Search by title or location..."
            icon={Search}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="status-filter-pills">
          {['ALL', 'AVAILABLE', 'UNDER_NEGOTIATION', 'RESERVED', 'SOLD'].map((st) => (
            <button
              key={st}
              type="button"
              className={`agent-tab-pill ${statusFilter === st ? 'is-active' : ''}`}
              onClick={() => setStatusFilter(st)}
            >
              {st === 'ALL' ? 'All Listings' : st}
            </button>
          ))}
        </div>
      </div>

      {/* Listings Table */}
      <div className="card-surface table-card">
        {loading ? (
          <TableSkeleton rows={5} cols={6} />
        ) : filtered.length === 0 ? (
          <EmptyState
            icon={Building}
            title="No listings found"
            description="No properties match your current search and status filters."
            actionLabel="Add New Property"
            onAction={() => navigate('/agent/listings/new')}
          />
        ) : (
          <div className="table-responsive">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Property</th>
                  <th>Location</th>
                  <th>Price</th>
                  <th>Type</th>
                  <th>Status</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((item) => (
                  <tr key={item.id}>
                    <td>
                      <div style={{ display: 'flex', flexDirection: 'column' }}>
                        <Link
                          to={`/properties/${item.id}`}
                          className="table-link-title"
                          title="View public page"
                        >
                          {item.title}
                        </Link>
                        <span style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)' }}>
                          ID: #{item.id} • {item.bedrooms ? `${item.bedrooms}b ` : ''}
                          {item.bathrooms ? `${item.bathrooms}ba ` : ''}
                          {item.area ? `${item.area} sqft` : ''}
                        </span>
                      </div>
                    </td>

                    <td>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--color-text-secondary)', fontSize: '0.88rem' }}>
                        <MapPin size={13} /> {item.location}
                      </span>
                    </td>

                    <td>
                      <strong style={{ color: 'var(--color-primary)', fontSize: '0.98rem' }}>
                        ${Number(item.price || 0).toLocaleString()}
                      </strong>
                    </td>

                    <td>
                      <span style={{ fontSize: '0.88rem', color: 'var(--color-text)' }}>
                        {item.propertyType || 'Apartment'}
                      </span>
                    </td>

                    <td>
                      <select
                        value={item.status || 'AVAILABLE'}
                        onChange={(e) => handleStatusChange(item.id, e.target.value)}
                        className="status-dropdown-select"
                      >
                        <option value="AVAILABLE">AVAILABLE</option>
                        <option value="UNDER_NEGOTIATION">UNDER_NEGOTIATION</option>
                        <option value="RESERVED">RESERVED</option>
                        <option value="SOLD">SOLD</option>
                      </select>
                    </td>

                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'inline-flex', gap: '8px' }}>
                        <Link to={`/properties/${item.id}`} target="_blank">
                          <Button variant="ghost" size="sm" icon={Eye} title="Preview public page" />
                        </Link>
                        <Link to={`/agent/listings/${item.id}/edit`}>
                          <Button variant="outline" size="sm" icon={Edit2} title="Edit listing" />
                        </Link>
                        <Button
                          variant="danger"
                          size="sm"
                          icon={Trash2}
                          onClick={() => handleOpenDelete(item)}
                          title="Delete listing"
                        />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        onConfirm={handleConfirmDelete}
        title="Delete Property Listing?"
        message={`Are you sure you want to delete "${propertyToDelete?.title}"? This will permanently remove the property from the network.`}
        confirmText="Yes, Delete Property"
        loading={deleting}
      />
    </DashboardLayout>
  );
};

export default AgentListingsPage;
