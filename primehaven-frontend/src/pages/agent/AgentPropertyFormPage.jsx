import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Building, ArrowLeft, Save, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import DashboardLayout from '../../components/layout/DashboardLayout';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import Select from '../../components/common/Select';
import propertyApi from '../../services/propertyApi';
import './AgentPages.css';

const PROPERTY_TYPES = [
  { value: 'Apartment', label: 'Apartment' },
  { value: 'Villa', label: 'Luxury Villa' },
  { value: 'House', label: 'Independent House' },
  { value: 'Plot', label: 'Residential Plot' },
  { value: 'Commercial', label: 'Commercial Property' },
];

const PROPERTY_STATUSES = [
  { value: 'AVAILABLE', label: 'Available' },
  { value: 'UNDER_NEGOTIATION', label: 'Under Negotiation' },
  { value: 'RESERVED', label: 'Reserved' },
  { value: 'SOLD', label: 'Sold' },
];

export const AgentPropertyFormPage = () => {
  const { id } = useParams();
  const isEditing = Boolean(id);
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    location: '',
    price: '',
    propertyType: 'Apartment',
    status: 'AVAILABLE',
    bedrooms: '',
    bathrooms: '',
    area: '',
  });

  const [formErrors, setFormErrors] = useState({});
  const [loading, setLoading] = useState(isEditing);
  const [submitting, setSubmitting] = useState(false);
  const [serverError, setServerError] = useState('');

  useEffect(() => {
    if (isEditing) {
      const fetchProperty = async () => {
        setLoading(true);
        try {
          const data = await propertyApi.getById(id);
          setFormData({
            title: data.title || '',
            description: data.description || '',
            location: data.location || '',
            price: data.price !== undefined && data.price !== null ? String(data.price) : '',
            propertyType: data.propertyType || 'Apartment',
            status: data.status || 'AVAILABLE',
            bedrooms: data.bedrooms !== undefined && data.bedrooms !== null ? String(data.bedrooms) : '',
            bathrooms: data.bathrooms !== undefined && data.bathrooms !== null ? String(data.bathrooms) : '',
            area: data.area !== undefined && data.area !== null ? String(data.area) : '',
          });
        } catch (err) {
          console.error('Failed to load property for editing', err);
          toast.error('Unable to load property details');
          navigate('/agent/listings');
        } finally {
          setLoading(false);
        }
      };
      fetchProperty();
    }
  }, [id, isEditing, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const validate = () => {
    const errors = {};
    if (!formData.location.trim()) {
      errors.location = 'Location is required';
    }
    if (!formData.price || Number(formData.price) <= 0) {
      errors.price = 'Valid positive price is required';
    }
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setServerError('');

    if (!validate()) return;

    setSubmitting(true);
    const payload = {
      title: formData.title.trim() || `Property at ${formData.location.trim()}`,
      description: formData.description.trim(),
      location: formData.location.trim(),
      price: Number(formData.price),
      propertyType: formData.propertyType,
      status: formData.status,
      bedrooms: formData.bedrooms ? Number(formData.bedrooms) : null,
      bathrooms: formData.bathrooms ? Number(formData.bathrooms) : null,
      area: formData.area ? Number(formData.area) : null,
    };

    try {
      if (isEditing) {
        await propertyApi.update(id, payload);
        toast.success('Property updated successfully!');
      } else {
        await propertyApi.create(payload);
        toast.success('Property published to the network!');
      }
      navigate('/agent/listings');
    } catch (err) {
      console.error('Failed to save property', err);
      const msg = err.response?.data?.message || err.message || 'Operation failed';
      setServerError(msg);
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <DashboardLayout title={isEditing ? 'Edit Property Listing' : 'Add New Property'}>
      <div className="agent-page-header">
        <div>
          <Link to="/agent/listings" className="back-link" style={{ marginBottom: '8px' }}>
            <ArrowLeft size={16} /> Back to My Listings
          </Link>
          <h2 className="font-serif agent-page-subtitle">
            {isEditing ? `Edit: ${formData.title || 'Property'}` : 'Publish a Prime Residence'}
          </h2>
          <p className="agent-page-desc">
            Provide accurate architectural specifications, pricing, and locality details.
          </p>
        </div>
      </div>

      <div className="form-card-wrapper card-surface">
        {serverError && (
          <div className="auth-server-error" style={{ marginBottom: '20px' }}>
            <AlertCircle size={18} />
            <span>{serverError}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="agent-property-form" noValidate>
          {/* Section: General Info */}
          <div className="form-section-title">
            <h3 className="font-serif">General Information</h3>
          </div>

          <div className="form-grid-2">
            <Input
              label="Property Title"
              name="title"
              placeholder="e.g. Modern Minimalist Glass Villa"
              value={formData.title}
              onChange={handleChange}
              hint="Leave blank to default to location name"
            />

            <Select
              label="Property Type"
              name="propertyType"
              value={formData.propertyType}
              onChange={handleChange}
              options={PROPERTY_TYPES}
              placeholder=""
              required
            />
          </div>

          <Input
            label="Property Description"
            name="description"
            type="textarea"
            rows={4}
            placeholder="Describe architectural layout, light orientation, materials, private amenities, and neighborhood lifestyle..."
            value={formData.description}
            onChange={handleChange}
          />

          {/* Section: Location & Pricing */}
          <div className="form-section-title">
            <h3 className="font-serif">Pricing & Location</h3>
          </div>

          <div className="form-grid-2">
            <Input
              label="Location / Locality"
              name="location"
              placeholder="e.g. Beverly Hills, CA"
              required
              value={formData.location}
              onChange={handleChange}
              error={formErrors.location}
            />

            <Input
              label="Listing Price (USD)"
              name="price"
              type="number"
              placeholder="e.g. 1250000"
              required
              value={formData.price}
              onChange={handleChange}
              error={formErrors.price}
            />
          </div>

          <div className="form-grid-2">
            <Select
              label="Listing Status"
              name="status"
              value={formData.status}
              onChange={handleChange}
              options={PROPERTY_STATUSES}
              placeholder=""
              required
            />
          </div>

          {/* Section: Specs */}
          <div className="form-section-title">
            <h3 className="font-serif">Specifications & Layout</h3>
          </div>

          <div className="form-grid-3">
            <Input
              label="Bedrooms"
              name="bedrooms"
              type="number"
              placeholder="e.g. 4"
              value={formData.bedrooms}
              onChange={handleChange}
            />

            <Input
              label="Bathrooms"
              name="bathrooms"
              type="number"
              placeholder="e.g. 3"
              value={formData.bathrooms}
              onChange={handleChange}
            />

            <Input
              label="Area (Sq Ft)"
              name="area"
              type="number"
              placeholder="e.g. 3200"
              value={formData.area}
              onChange={handleChange}
            />
          </div>

          <div className="form-submit-row">
            <Button
              variant="outline"
              onClick={() => navigate('/agent/listings')}
              disabled={submitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="lg"
              loading={submitting}
              icon={Save}
            >
              {isEditing ? 'Save Changes' : 'Publish Property'}
            </Button>
          </div>
        </form>
      </div>
    </DashboardLayout>
  );
};

export default AgentPropertyFormPage;
