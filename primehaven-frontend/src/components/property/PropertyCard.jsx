import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Bed, Bath, Square, Heart, ArrowUpRight, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';
import Badge from '../common/Badge';
import { getPropertyImage, FALLBACK_IMAGE } from '../../utils/propertyImages';
import { formatIndianPrice, formatIndianPriceFull } from '../../utils/currencyFormatter';
import { isFavorite, toggleFavorite } from '../../utils/favoritesStorage';
import { useAuth } from '../../context/AuthContext';
import './PropertyCard.css';

export const PropertyCard = ({ property, featured = false }) => {
  const { user } = useAuth();
  const userId = user?.id || 'guest';
  const [favorite, setFavorite] = useState(false);
  const [imgSrc, setImgSrc] = useState(null);

  useEffect(() => {
    if (property?.id) {
      setFavorite(isFavorite(property.id, userId));
    }
  }, [property?.id, userId]);

  useEffect(() => {
    if (property) {
      setImgSrc(getPropertyImage(property.id, property.propertyType, property));
    }
  }, [property]);

  if (!property) return null;

  const handleFavoriteClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    const nowFav = toggleFavorite(property.id, userId);
    setFavorite(nowFav);
  };

  const handleImageError = () => {
    setImgSrc(FALLBACK_IMAGE);
  };

  // Amenities list for preview (2-3 items)
  const amenitiesList = Array.isArray(property.amenities)
    ? property.amenities.slice(0, 3)
    : typeof property.amenities === 'string'
    ? property.amenities.split(',').map((s) => s.trim()).slice(0, 3)
    : [];

  const displayType = property.categoryLabel || property.propertyType || 'Residence';
  const priceDisplay = property.priceDisplay || formatIndianPrice(property.price);
  const fullPriceTitle = formatIndianPriceFull(property.price);

  return (
    <motion.div
      className={`property-card card-surface ${featured ? 'is-featured' : ''}`}
      whileHover={{ y: -6 }}
      transition={{ duration: 0.25, ease: 'easeOut' }}
    >
      <div className="property-card-image-wrap">
        <img
          src={imgSrc || FALLBACK_IMAGE}
          alt={property.title || 'PrimeHaven Luxury Property'}
          className="property-card-img"
          loading="lazy"
          onError={handleImageError}
        />

        {/* Top Gradient Overlay */}
        <div className="property-card-gradient-top" />

        {/* Status Badge */}
        <div className="property-card-status">
          <Badge status={property.status || 'AVAILABLE'}>
            {property.listingType === 'FOR_RENT' ? 'For Rent' : property.status === 'AVAILABLE' ? 'For Sale' : undefined}
          </Badge>
        </div>

        {/* Favorite Button */}
        <button
          type="button"
          className={`property-card-fav-btn ${favorite ? 'is-active' : ''}`}
          onClick={handleFavoriteClick}
          aria-label={favorite ? 'Remove from favorites' : 'Add to favorites'}
        >
          <Heart size={18} fill={favorite ? 'var(--terracotta)' : 'none'} />
        </button>

        {/* Bottom Tag Bar */}
        <div className="property-card-bottom-tags">
          <span className="property-card-type-tag">{displayType}</span>
          {property.isSample && (
            <span className="property-card-sample-pill" title="Illustrative sample residence">
              <Sparkles size={11} /> Sample Listing
            </span>
          )}
        </div>
      </div>

      <div className="property-card-body">
        {/* Price Row */}
        <div className="property-card-price-row" title={fullPriceTitle}>
          <span className="property-card-price font-serif">{priceDisplay}</span>
          {property.listingType === 'FOR_RENT' && (
            <span className="property-card-price-period">/ month</span>
          )}
        </div>

        {/* Title */}
        <Link to={`/properties/${property.id}`} className="property-card-title-link">
          <h3 className="property-card-title font-serif">{property.title || 'Luxury Residence'}</h3>
        </Link>

        {/* Location */}
        <p className="property-card-location">
          <MapPin size={15} className="location-icon" />
          <span>{property.location || 'Prime Location'}</span>
        </p>

        {/* Specs row */}
        <div className="property-card-specs">
          {property.bedrooms !== null && property.bedrooms !== undefined && (
            <div className="spec-item" title={`${property.bedrooms} Bedrooms`}>
              <Bed size={16} />
              <span>{property.bedrooms} Beds</span>
            </div>
          )}

          {property.bathrooms !== null && property.bathrooms !== undefined && (
            <div className="spec-item" title={`${property.bathrooms} Bathrooms`}>
              <Bath size={16} />
              <span>{property.bathrooms} Baths</span>
            </div>
          )}

          {property.area !== null && property.area !== undefined && (
            <div className="spec-item" title={`${property.area} Sq Ft`}>
              <Square size={15} />
              <span>{property.area.toLocaleString()} sqft</span>
            </div>
          )}
        </div>

        {/* Key Amenities Preview */}
        {amenitiesList.length > 0 && (
          <div className="property-card-amenities-row">
            {amenitiesList.map((amenity, idx) => (
              <span key={idx} className="amenity-chip">
                {amenity}
              </span>
            ))}
          </div>
        )}

        {/* Action Button */}
        <div className="property-card-footer">
          <Link to={`/properties/${property.id}`} className="property-card-view-btn">
            <span>View Details</span>
            <ArrowUpRight size={16} className="view-btn-arrow" />
          </Link>
        </div>
      </div>
    </motion.div>
  );
};

export default PropertyCard;
