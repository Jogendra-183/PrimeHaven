import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Building2, Search, Trash2, Eye, MapPin, Plus } from 'lucide-react';
import toast from 'react-hot-toast';
import DashboardLayout from '../../components/layout/DashboardLayout';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import Badge from '../../components/common/Badge';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import { TableSkeleton } from '../../components/common/Skeleton';
import EmptyState from '../../components/common/EmptyState';
import propertyApi from '../../services/propertyApi';
import './AdminPages.css';

const PROPERTY_STATUSES = ['AVAILABLE', 'UNDER_NEGOTIATION', 'RESERVED', 'SOLD'];

export const AdminPropertiesPage = () => {
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  // Deletion modal state
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [propertyToDelete, setPropertyToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const fetchProperties = async () => {
    setLoading(true);
    try {
      const data = await propertyApi.getAll();
      if (Array.isArray(data)) {
        setProperties(data);
      }
    } catch (err) {
      console.error('Failed to load global property inventory', err);
      toast.error('Failed to retrieve properties');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProperties();
  }, []);

  const handleStatusChange = async (propertyId, newStatus) => {
    try {
      await propertyApi.updateStatus(propertyId, newStatus);
      toast.success(`Property #${propertyId} status changed to ${newStatus}`);
      fetchProperties();
    } catch (err) {
      console.error('Failed to update property status', err);
      toast.error(err.response?.data?.message || 'Failed to update property status');
    }
  };

  const handleConfirmDelete = async () => {
    if (!propertyToDelete) return;
    setDeleting(true);
    try {
      await propertyApi.delete(propertyToDelete.id);
      toast.success(`Property "${propertyToDelete.title || propertyToDelete.id}" deleted`);
      setDeleteDialogOpen(false);
      setPropertyToDelete(null);
      fetchProperties();
    } catch (err) {
      console.error('Failed to delete property', err);
      toast.error(err.response?.data?.message || 'Administrative delete failed');
    } finally {
      setDeleting(false);
    }
  };

  const filteredProperties = properties.filter((p) => {
    const matchesStatus = statusFilter === 'ALL' || p.status === statusFilter;
    if (!matchesStatus) return false;

    if (!searchTerm.trim()) return true;
    const term = searchTerm.toLowerCase();
    const title = (p.title || '').toLowerCase();
    const loc = (p.location || '').toLowerCase();
    const type = (p.propertyType || '').toLowerCase();
    return title.includes(term) || loc.includes(term) || type.includes(term);
  });

  return (
    <DashboardLayout title="Global Property Management">
      <div className="admin-page-header">
        <div>
          <h2 className="font-serif admin-page-subtitle">Platform Property Directory</h2>
          <p className="admin-page-desc">
            Full administrative oversight of residential listings, verification status, and availability.
          </p>
        </div>

        <div className="admin-header-actions">
          <Link to="/agent/listings/new">
            <Button variant="primary" size="sm" icon={Plus}>
              Publish New Property
            </Button>
          </Link>
        </div>
      </div>

      {/* Toolbar: Filters & Search */}
      <div className="admin-toolbar">
        <div className="filter-pill-tabs" style={{ marginBottom: 0 }}>
          {['ALL', ...PROPERTY_STATUSES].map((st) => (
            <button
              key={st}
              type="button"
              className={`pill-tab ${statusFilter === st ? 'is-active' : ''}`}
              onClick={() => setStatusFilter(st)}
            >
              {st === 'ALL' ? 'All Inventory' : st.replace('_', ' ')}
            </button>
          ))}
        </div>

        <div style={{ width: '280px' }}>
          <Input
            placeholder="Search by title, location, type..."
            icon={Search}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Properties Table */}
      <div className="admin-table-wrapper">
        {loading ? (
          <TableSkeleton rows={6} cols={6} />
        ) : filteredProperties.length === 0 ? (
          <EmptyState
            icon={Building2}
            title="No properties found"
            description={
              searchTerm
                ? 'No listings match your search query.'
                : 'No properties registered in the platform database.'
            }
          />
        ) : (
          <table className="admin-table">
            <thead>
              <tr>
                <th>Property</th>
                <th>Category</th>
                <th>Price</th>
                <th>Assigned Agent</th>
                <th>Status</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredProperties.map((p) => (
                <tr key={p.id}>
                  <td style={{ minWidth: '220px' }}>
                    <div style={{ fontWeight: '600', color: 'var(--color-earth)', marginBottom: '3px' }}>
                      {p.title || `Property #${p.id}`}
                    </div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <MapPin size={13} color="var(--color-primary)" />
                      {p.location || 'Location undisclosed'}
                    </div>
                  </td>

                  <td>
                    <span style={{ fontSize: '0.85rem', fontWeight: '500' }}>
                      {p.propertyType || 'Apartment'}
                    </span>
                    <div style={{ fontSize: '0.78rem', color: 'var(--color-text-secondary)' }}>
                      {p.bedrooms || 0} Beds • {p.bathrooms || 0} Baths
                    </div>
                  </td>

                  <td>
                    <strong style={{ color: 'var(--color-primary)', fontSize: '0.95rem' }}>
                      ${Number(p.price || 0).toLocaleString()}
                    </strong>
                  </td>

                  <td>
                    <span className="admin-id-badge">
                      {p.agentId ? `Agent #${p.agentId}` : 'Unassigned'}
                    </span>
                  </td>

                  <td>
                    <select
                      className="status-select-inline"
                      value={p.status || 'AVAILABLE'}
                      onChange={(e) => handleStatusChange(p.id, e.target.value)}
                    >
                      {PROPERTY_STATUSES.map((st) => (
                        <option key={st} value={st}>
                          {st.replace('_', ' ')}
                        </option>
                      ))}
                    </select>
                  </td>

                  <td style={{ textAlign: 'right' }}>
                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                      <Link to={`/properties/${p.id}`} target="_blank" rel="noopener noreferrer">
                        <button
                          type="button"
                          className="admin-action-btn"
                          title="View live marketplace page"
                        >
                          <Eye size={16} />
                        </button>
                      </Link>

                      <button
                        type="button"
                        className="admin-action-btn delete"
                        title="Delete property from database"
                        onClick={() => {
                          setPropertyToDelete(p);
                          setDeleteDialogOpen(true);
                        }}
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      <ConfirmDialog
        isOpen={deleteDialogOpen}
        onClose={() => {
          setDeleteDialogOpen(false);
          setPropertyToDelete(null);
        }}
        onConfirm={handleConfirmDelete}
        title="Delete Property Listing"
        message={`Are you sure you want to permanently delete "${propertyToDelete?.title || `Property #${propertyToDelete?.id}`}"? This action removes the listing from the database.`}
        confirmLabel="Delete Property"
        variant="danger"
        loading={deleting}
      />
    </DashboardLayout>
  );
};

export default AdminPropertiesPage;
