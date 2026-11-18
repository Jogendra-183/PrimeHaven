import React from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, MapPin, Bed, Bath, Square, ArrowRight, ShieldCheck } from 'lucide-react';
import { motion } from 'framer-motion';
import { FEATURED_PROPERTIES } from '../../data/sampleProperties';
import { formatIndianPrice } from '../../utils/currencyFormatter';
import './FeaturedResidences.css';

export const FeaturedResidences = () => {
  if (!FEATURED_PROPERTIES || FEATURED_PROPERTIES.length === 0) return null;

  return (
    <section className="featured-residences-section" aria-label="Featured Residences">
      <div className="featured-section-header">
        <div className="featured-header-left">
          <span className="featured-eyebrow">
            <Sparkles size={14} className="sparkle-icon" /> EDITORIAL SHOWCASE
          </span>
          <h2 className="featured-section-title font-serif">Featured Premier Residences</h2>
          <p className="featured-section-subtitle">
            Three exceptional architectural landmarks hand-selected for craftsmanship, location, and enduring prestige.
          </p>
        </div>
        <div className="featured-curation-pill">
          <ShieldCheck size={16} />
          <span>Curated by PrimeHaven Advisory</span>
        </div>
      </div>

      <div className="featured-grid">
        {FEATURED_PROPERTIES.map((property, idx) => (
          <motion.div
            key={property.id}
            className="featured-item-card"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: idx * 0.1 }}
          >
            <div className="featured-image-container">
              <img
                src={property.image}
                alt={property.title}
                className="featured-property-img"
                loading="lazy"
              />
              <div className="featured-image-overlay" />
              <div className="featured-tag-badge">
                <span>{property.categoryLabel || property.propertyType}</span>
              </div>
              <div className="featured-rank-badge">0{idx + 1}</div>
            </div>

            <div className="featured-content">
              <div className="featured-price-row">
                <span className="featured-price font-serif">{property.priceDisplay || formatIndianPrice(property.price)}</span>
                <span className="featured-status-pill">{property.listingType === 'FOR_RENT' ? 'For Rent' : 'For Sale'}</span>
              </div>

              <h3 className="featured-title font-serif">
                <Link to={`/properties/${property.id}`} className="featured-title-link">
                  {property.title}
                </Link>
              </h3>

              <p className="featured-location">
                <MapPin size={15} />
                <span>{property.location}</span>
              </p>

              <p className="featured-description">{property.description}</p>

              {/* Architectural Highlights */}
              {property.highlights && (
                <div className="featured-highlight-box">
                  <span className="highlight-label">Architectural Highlight:</span>
                  <span className="highlight-text">{property.highlights}</span>
                </div>
              )}

              {/* Specs */}
              <div className="featured-specs-row">
                <div className="f-spec">
                  <Bed size={15} />
                  <span>{property.bedrooms} Beds</span>
                </div>
                <div className="f-spec">
                  <Bath size={15} />
                  <span>{property.bathrooms} Baths</span>
                </div>
                <div className="f-spec">
                  <Square size={14} />
                  <span>{property.area.toLocaleString()} sq.ft.</span>
                </div>
              </div>

              {/* Action */}
              <div className="featured-action-wrap">
                <Link to={`/properties/${property.id}`} className="featured-explore-btn">
                  <span>Explore Residence</span>
                  <ArrowRight size={16} />
                </Link>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
};

export default FeaturedResidences;

