import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  MapPin,
  Bed,
  Bath,
  Square,
  Calendar,
  MessageSquare,
  Heart,
  ArrowLeft,
  Share2,
  CheckCircle2,
  Clock,
  ShieldCheck,
  Sparkles,
  Phone,
  Mail,
} from 'lucide-react';
import toast from 'react-hot-toast';
import PublicNavbar from '../../components/layout/PublicNavbar';
import PublicFooter from '../../components/layout/PublicFooter';
import Badge from '../../components/common/Badge';
import Button from '../../components/common/Button';
import Modal from '../../components/common/Modal';
import Input from '../../components/common/Input';
import PropertyMap from '../../components/property/PropertyMap';
import Skeleton from '../../components/common/Skeleton';
import ErrorState from '../../components/common/ErrorState';
import propertyApi from '../../services/propertyApi';
import visitApi from '../../services/visitApi';
import inquiryApi from '../../services/inquiryApi';
import { getPropertyGallery, FALLBACK_IMAGE } from '../../utils/propertyImages';
import { formatIndianPrice, formatIndianPriceFull } from '../../utils/currencyFormatter';
import { isFavorite, toggleFavorite } from '../../utils/favoritesStorage';
import { useAuth } from '../../context/AuthContext';
import './PropertyDetailsPage.css';

export const PropertyDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated, role } = useAuth();

  const [property, setProperty] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [fav, setFav] = useState(false);

  // Visit Modal State
  const [visitModalOpen, setVisitModalOpen] = useState(false);
  const [visitDate, setVisitDate] = useState('');
  const [visitNotes, setVisitNotes] = useState('');
  const [visitSubmitting, setVisitSubmitting] = useState(false);

  // Inquiry Modal State
  const [inquiryModalOpen, setInquiryModalOpen] = useState(false);
  const [inquiryMessage, setInquiryMessage] = useState('');
  const [inquirySubmitting, setInquirySubmitting] = useState(false);

  useEffect(() => {
    const fetchDetail = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await propertyApi.getById(id);
        setProperty(data);
        if (data?.id) {
          setFav(isFavorite(data.id, user?.id || 'guest'));
        }
      } catch (err) {
        console.error('Failed to load property details', err);
        setError('Property not found or unavailable. Please return to listings.');
      } finally {
        setLoading(false);
      }
    };
    if (id) {
      fetchDetail();
    }
  }, [id, user?.id]);

  const handleFavoriteToggle = () => {
    if (!property?.id) return;
    const nowFav = toggleFavorite(property.id, user?.id || 'guest');
    setFav(nowFav);
    toast.success(nowFav ? 'Property added to saved list' : 'Property removed from saved list');
  };

  const handleShare = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      toast.success('Property link copied to clipboard!');
    }
  };

  // Submit Visit Request
  const handleScheduleVisit = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) {
      toast.error('Please sign in as a Client to schedule visits');
      navigate('/signin');
      return;
    }
    if (role === 'AGENT') {
      toast.error('Agents cannot schedule client visits on properties');
      return;
    }
    if (!visitDate) {
      toast.error('Please select an appointment date and time');
      return;
    }

    setVisitSubmitting(true);
    try {
      if (property?.isSample) {
        // Sample residence simulated submission
        await new Promise((res) => setTimeout(res, 600));
        toast.success(`Visit scheduled for ${property.title}! An advisor will contact you.`);
        setVisitModalOpen(false);
        setVisitDate('');
        setVisitNotes('');
      } else {
        await visitApi.create({
          propertyId: property.id,
          visitDate,
          notes: visitNotes,
        });
        toast.success('Visit scheduled successfully! Status: REQUESTED');
        setVisitModalOpen(false);
        setVisitDate('');
        setVisitNotes('');
      }
    } catch (err) {
      console.error('Visit booking failed', err);
      toast.error(err.response?.data?.message || 'Failed to schedule visit. Please try again.');
    } finally {
      setVisitSubmitting(false);
    }
  };

  // Submit Inquiry Request
  const handleSubmitInquiry = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) {
      toast.error('Please sign in to submit inquiries');
      navigate('/signin');
      return;
    }
    if (role === 'AGENT') {
      toast.error('Agents cannot submit inquiries to properties');
      return;
    }
    if (!inquiryMessage.trim()) {
      toast.error('Please enter your inquiry message');
      return;
    }

    setInquirySubmitting(true);
    try {
      if (property?.isSample) {
        // Sample residence simulated submission
        await new Promise((res) => setTimeout(res, 600));
        toast.success(`Inquiry sent to ${property.agent?.name || 'PrimeHaven Advisory'}!`);
        setInquiryModalOpen(false);
        setInquiryMessage('');
      } else {
        await inquiryApi.create({
          propertyId: property.id,
          message: inquiryMessage,
        });
        toast.success('Inquiry submitted to the assigned agent!');
        setInquiryModalOpen(false);
        setInquiryMessage('');
      }
    } catch (err) {
      console.error('Inquiry submission failed', err);
      toast.error(err.response?.data?.message || 'Failed to submit inquiry.');
    } finally {
      setInquirySubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="property-details-page">
        <PublicNavbar />
        <div className="container" style={{ padding: '60px 24px' }}>
          <Skeleton height="480px" borderRadius="var(--radius-lg)" />
          <div style={{ marginTop: '32px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <Skeleton width="60%" height="36px" />
            <Skeleton width="40%" height="24px" />
            <Skeleton width="100%" height="160px" />
          </div>
        </div>
        <PublicFooter />
      </div>
    );
  }

  if (error || !property) {
    return (
      <div className="property-details-page">
        <PublicNavbar />
        <div className="container" style={{ padding: '80px 24px' }}>
          <ErrorState
            title="Property Not Found"
            message={error || 'The requested property could not be located.'}
            onRetry={() => navigate('/properties')}
          />
        </div>
        <PublicFooter />
      </div>
    );
  }

  const gallery = getPropertyGallery(property.id, property);
  const priceDisplay = property.priceDisplay || formatIndianPrice(property.price);
  const fullPriceTitle = formatIndianPriceFull(property.price);

  // Dynamic amenities list
  const amenitiesList = Array.isArray(property.amenities)
    ? property.amenities
    : typeof property.amenities === 'string'
    ? property.amenities.split(',').map((s) => s.trim())
    : [
        'Curated High-End Finishes',
        'Private Garage & Parking',
        'Smart Climate & Security Integration',
        'Expansive Balcony / Terrace',
        'Prime Urban & Transit Access',
        'Low-Density Boutique Architecture',
      ];

  const agent = property.agent || {
    name: 'PrimeHaven Advisor',
    title: 'Verified Portfolio Specialist',
    phone: '+91 98490 00000',
    email: 'advisory@primehaven.in',
    avatar: 'PA',
  };

  return (
    <div className="property-details-page">
      <PublicNavbar />

      <main className="container details-container">
        {/* Navigation Breadcrumb */}
        <div className="details-top-bar">
          <Link to="/properties" className="back-link">
            <ArrowLeft size={18} />
            <span>Back to All Properties</span>
          </Link>

          <div className="details-actions">
            <button
              type="button"
              className={`action-btn-circle ${fav ? 'is-fav' : ''}`}
              onClick={handleFavoriteToggle}
              title={fav ? 'Saved' : 'Save Property'}
            >
              <Heart size={18} fill={fav ? 'var(--terracotta)' : 'none'} />
            </button>
            <button
              type="button"
              className="action-btn-circle"
              onClick={handleShare}
              title="Share Link"
            >
              <Share2 size={18} />
            </button>
          </div>
        </div>

        {/* Gallery Section */}
        <section className="property-gallery-section">
          <div className="gallery-main-frame">
            <img
              src={gallery[selectedImageIndex] || gallery[0] || FALLBACK_IMAGE}
              alt={property.title}
              className="gallery-main-img"
              onError={(e) => {
                e.target.src = FALLBACK_IMAGE;
              }}
            />
            <div className="gallery-status-overlay">
              <Badge status={property.status || 'AVAILABLE'}>
                {property.listingType === 'FOR_RENT' ? 'For Rent' : property.status === 'AVAILABLE' ? 'For Sale' : undefined}
              </Badge>
            </div>
            {property.propertyType && (
              <div className="gallery-type-tag">
                {property.categoryLabel || property.propertyType}
              </div>
            )}
            {property.isSample && (
              <div className="gallery-sample-tag">
                <Sparkles size={12} /> Illustrative Development Listing
              </div>
            )}
          </div>

          <div className="gallery-thumbnails">
            {gallery.map((img, idx) => (
              <button
                key={idx}
                type="button"
                className={`thumb-btn ${selectedImageIndex === idx ? 'is-active' : ''}`}
                onClick={() => setSelectedImageIndex(idx)}
              >
                <img
                  src={img}
                  alt={`View ${idx + 1}`}
                  className="thumb-img"
                  onError={(e) => {
                    e.target.src = FALLBACK_IMAGE;
                  }}
                />
              </button>
            ))}
          </div>
        </section>

        {/* Content Layout Grid */}
        <div className="details-content-grid">
          {/* Left Column: Details */}
          <div className="details-main-col">
            <div className="details-header-card card-surface">
              <div className="details-price-tag font-serif" title={fullPriceTitle}>
                {priceDisplay}
                {property.listingType === 'FOR_RENT' && (
                  <span style={{ fontSize: '1rem', color: 'var(--color-text-secondary)', fontWeight: 500, marginLeft: '8px' }}>
                    / month
                  </span>
                )}
              </div>
              <h1 className="details-title font-serif">{property.title}</h1>
              <p className="details-location">
                <MapPin size={18} className="loc-icon" />
                <span>{property.location}</span>
              </p>

              {/* Spec Pills */}
              <div className="details-spec-pills">
                {property.bedrooms !== null && property.bedrooms !== undefined && (
                  <div className="spec-pill">
                    <Bed size={20} />
                    <span>{property.bedrooms} Bedrooms</span>
                  </div>
                )}
                {property.bathrooms !== null && property.bathrooms !== undefined && (
                  <div className="spec-pill">
                    <Bath size={20} />
                    <span>{property.bathrooms} Bathrooms</span>
                  </div>
                )}
                {property.area !== null && property.area !== undefined && (
                  <div className="spec-pill">
                    <Square size={19} />
                    <span>{Number(property.area).toLocaleString()} sq.ft.</span>
                  </div>
                )}
              </div>
            </div>

            {/* Description */}
            <div className="details-card card-surface">
              <h3 className="card-section-title font-serif">About This Residence</h3>
              <p className="details-description">
                {property.description ||
                  'A thoughtfully crafted residence offering an exceptional blend of modern design, generous living spaces, and premium natural materials in one of the most sought-after prime neighborhoods.'}
              </p>
              {property.highlights && (
                <div style={{ marginTop: '20px', padding: '14px 18px', backgroundColor: 'var(--color-surface-warm)', borderLeft: '3px solid var(--bronze)', borderRadius: '4px' }}>
                  <strong style={{ display: 'block', fontSize: '0.82rem', textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--bronze-dk)', marginBottom: '4px' }}>
                    Architectural Distinction
                  </strong>
                  <span style={{ fontSize: '0.92rem', color: 'var(--color-text)', lineHeight: 1.6 }}>
                    {property.highlights}
                  </span>
                </div>
              )}
            </div>

            {/* Architectural Features & Amenities */}
            <div className="details-card card-surface">
              <h3 className="card-section-title font-serif">Key Amenities & Highlights</h3>
              <div className="amenities-grid">
                {amenitiesList.map((amenity, idx) => (
                  <div key={idx} className="amenity-item">
                    <CheckCircle2 size={18} className="amenity-icon" />
                    <span>{amenity}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Location & Map */}
            <div className="details-card card-surface">
              <h3 className="card-section-title font-serif">Location & Vicinity</h3>
              <p className="map-location-sub">
                Neighborhood vicinity for <strong>{property.location}</strong>
              </p>
              <PropertyMap
                location={property.location}
                title={property.title}
                price={property.price}
                height="380px"
              />
            </div>
          </div>

          {/* Right Column: Interaction Card */}
          <div className="details-sidebar-col">
            <div className="engagement-card card-surface sticky-card">
              <h3 className="font-serif engagement-title">Schedule a Viewing</h3>
              <p className="engagement-sub">
                Connect with the designated portfolio representative for a private, guided walkthrough.
              </p>

              <div className="engagement-agent-box">
                <div className="agent-avatar-circle font-serif">
                  {agent.avatar || 'PA'}
                </div>
                <div>
                  <h4 className="agent-name">{agent.name}</h4>
                  <p className="agent-badge">
                    <ShieldCheck size={14} /> {agent.title || 'PrimeHaven Representative'}
                  </p>
                  {agent.phone && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', color: 'var(--color-text-secondary)', marginTop: '4px' }}>
                      <Phone size={12} style={{ color: 'var(--bronze)' }} />
                      <span>{agent.phone}</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="engagement-buttons">
                <Button
                  variant="primary"
                  size="lg"
                  icon={Calendar}
                  fullWidth
                  onClick={() => setVisitModalOpen(true)}
                >
                  Schedule Private Tour
                </Button>

                <Button
                  variant="outline"
                  size="lg"
                  icon={MessageSquare}
                  fullWidth
                  onClick={() => setInquiryModalOpen(true)}
                >
                  Send Inquiry
                </Button>
              </div>

              <div className="engagement-footer-note">
                <Clock size={15} />
                <span>Visits confirmed within 24 hours</span>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Schedule Visit Modal */}
      <Modal
        isOpen={visitModalOpen}
        onClose={() => setVisitModalOpen(false)}
        title="Schedule a Private Visit"
        subtitle={`Select your preferred date for ${property.title}`}
      >
        <form onSubmit={handleScheduleVisit} className="modal-form-flow">
          <Input
            label="Appointment Date & Time"
            name="visitDate"
            type="datetime-local"
            required
            value={visitDate}
            onChange={(e) => setVisitDate(e.target.value)}
            hint="Choose a convenient date during daylight hours"
          />

          <Input
            label="Visit Notes / Questions for Agent"
            name="notes"
            type="textarea"
            rows={3}
            placeholder="Special viewing requests, parking instructions, or topics to cover..."
            value={visitNotes}
            onChange={(e) => setVisitNotes(e.target.value)}
          />

          <div className="modal-form-actions">
            <Button
              variant="outline"
              onClick={() => setVisitModalOpen(false)}
              disabled={visitSubmitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              loading={visitSubmitting}
              icon={Calendar}
            >
              Confirm Visit Request
            </Button>
          </div>
        </form>
      </Modal>

      {/* Submit Inquiry Modal */}
      <Modal
        isOpen={inquiryModalOpen}
        onClose={() => setInquiryModalOpen(false)}
        title="Submit Property Inquiry"
        subtitle={`Your inquiry will be sent to ${agent.name} for ${property.title}`}
      >
        <form onSubmit={handleSubmitInquiry} className="modal-form-flow">
          <Input
            label="Inquiry Message"
            name="inquiryMessage"
            type="textarea"
            rows={4}
            required
            placeholder="Ask about pricing terms, disclosures, property tours, or lease conditions..."
            value={inquiryMessage}
            onChange={(e) => setInquiryMessage(e.target.value)}
          />

          <div className="modal-form-actions">
            <Button
              variant="outline"
              onClick={() => setInquiryModalOpen(false)}
              disabled={inquirySubmitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              loading={inquirySubmitting}
              icon={MessageSquare}
            >
              Send Inquiry
            </Button>
          </div>
        </form>
      </Modal>

      <PublicFooter />
    </div>
  );
};

export default PropertyDetailsPage;
