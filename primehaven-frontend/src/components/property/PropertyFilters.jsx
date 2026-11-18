import React, { useState } from 'react';
import {
  Search,
  MapPin,
  Building,
  DollarSign,
  SlidersHorizontal,
  RotateCcw,
  Bed,
  Bath,
  Maximize2,
  ChevronDown,
  ChevronUp,
  X,
  Sparkles,
} from 'lucide-react';
import Input from '../common/Input';
import Select from '../common/Select';
import Button from '../common/Button';
import './PropertyFilters.css';

const PROPERTY_TYPES = [
  { value: 'ALL', label: 'All Property Types' },
  { value: 'Apartment', label: 'Apartment' },
  { value: 'Flat', label: 'Luxury Flat' },
  { value: 'Villa', label: 'Luxury Villa' },
  { value: 'Penthouse', label: 'Penthouse' },
  { value: 'Independent House', label: 'Independent House / Villa' },
];

const LISTING_STATUSES = [
  { value: 'ALL', label: 'All Listing Statuses' },
  { value: 'FOR_SALE', label: 'For Sale' },
  { value: 'FOR_RENT', label: 'For Rent' },
  { value: 'AVAILABLE', label: 'Available' },
];

const BEDROOM_OPTIONS = [
  { value: 'ALL', label: 'Any Bedrooms' },
  { value: '1', label: '1+ Bedroom' },
  { value: '2', label: '2+ Bedrooms' },
  { value: '3', label: '3+ Bedrooms' },
  { value: '4', label: '4+ Bedrooms' },
];

const BATHROOM_OPTIONS = [
  { value: 'ALL', label: 'Any Bathrooms' },
  { value: '1', label: '1+ Bathroom' },
  { value: '2', label: '2+ Bathrooms' },
  { value: '3', label: '3+ Bathrooms' },
  { value: '4', label: '4+ Bathrooms' },
];

export const PropertyFilters = ({
  filters,
  onChange,
  onReset,
  totalResults = 0,
  totalCatalogCount = 12,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const handleInputChange = (field, value) => {
    onChange({
      ...filters,
      [field]: value,
    });
  };

  // Quick preset filter chips
  const applyPreset = (preset) => {
    if (preset === 'ALL') {
      onReset();
    } else if (preset === 'PENTHOUSE') {
      onChange({ ...filters, propertyType: 'Penthouse' });
    } else if (preset === 'VILLA') {
      onChange({ ...filters, propertyType: 'Villa' });
    } else if (preset === 'APARTMENT') {
      onChange({ ...filters, propertyType: 'Apartment' });
    } else if (preset === 'HYDERABAD') {
      onChange({ ...filters, location: 'Hyderabad' });
    } else if (preset === 'VIJAYAWADA') {
      onChange({ ...filters, location: 'Vijayawada' });
    } else if (preset === 'UNDER_1CR') {
      onChange({ ...filters, minPrice: '', maxPrice: '10000000' });
    } else if (preset === 'ABOVE_2CR') {
      onChange({ ...filters, minPrice: '20000000', maxPrice: '' });
    }
  };

  // Count active filters
  const activeCount = [
    filters.location,
    filters.propertyType && filters.propertyType !== 'ALL',
    filters.status && filters.status !== 'ALL',
    filters.bedrooms && filters.bedrooms !== 'ALL',
    filters.bathrooms && filters.bathrooms !== 'ALL',
    filters.minPrice,
    filters.maxPrice,
    filters.minArea,
    filters.maxArea,
  ].filter(Boolean).length;

  return (
    <div className="property-filters-container card-surface">
      {/* Top Header Bar */}
      <div className="filters-header-row">
        <div className="filters-header-left">
          <div className="filters-icon-badge">
            <SlidersHorizontal size={18} />
          </div>
          <div>
            <h3 className="filters-title font-serif">Refine Portfolio Selection</h3>
            <p className="filters-subtitle">Search by city, architectural typology, price, or spatial dimensions.</p>
          </div>
        </div>

        <div className="filters-header-right">
          <div className="results-count-pill">
            <span className="count-number">{totalResults}</span>
            <span className="count-label">residences found</span>
          </div>

          <button
            type="button"
            className="mobile-expand-btn"
            onClick={() => setIsExpanded(!isExpanded)}
            aria-expanded={isExpanded}
          >
            <span>More Filters</span>
            {activeCount > 0 && <span className="active-badge">{activeCount}</span>}
            {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </button>
        </div>
      </div>

      {/* Quick Filter Chips */}
      <div className="filter-chips-row">
        <span className="chips-label">Quick Views:</span>
        <button
          type="button"
          className={`filter-chip ${activeCount === 0 ? 'is-active' : ''}`}
          onClick={() => applyPreset('ALL')}
        >
          All Residences
        </button>
        <button
          type="button"
          className={`filter-chip ${filters.propertyType === 'Penthouse' ? 'is-active' : ''}`}
          onClick={() => applyPreset('PENTHOUSE')}
        >
          Penthouses
        </button>
        <button
          type="button"
          className={`filter-chip ${filters.propertyType === 'Villa' ? 'is-active' : ''}`}
          onClick={() => applyPreset('VILLA')}
        >
          Luxury Villas
        </button>
        <button
          type="button"
          className={`filter-chip ${filters.propertyType === 'Apartment' ? 'is-active' : ''}`}
          onClick={() => applyPreset('APARTMENT')}
        >
          Apartments
        </button>
        <button
          type="button"
          className={`filter-chip ${filters.location?.toLowerCase().includes('hyderabad') ? 'is-active' : ''}`}
          onClick={() => applyPreset('HYDERABAD')}
        >
          Hyderabad
        </button>
        <button
          type="button"
          className={`filter-chip ${filters.location?.toLowerCase().includes('vijayawada') ? 'is-active' : ''}`}
          onClick={() => applyPreset('VIJAYAWADA')}
        >
          Vijayawada
        </button>
        <button
          type="button"
          className={`filter-chip ${filters.maxPrice === '10000000' ? 'is-active' : ''}`}
          onClick={() => applyPreset('UNDER_1CR')}
        >
          Under ₹1 Crore
        </button>
        <button
          type="button"
          className={`filter-chip ${filters.minPrice === '20000000' ? 'is-active' : ''}`}
          onClick={() => applyPreset('ABOVE_2CR')}
        >
          Above ₹2 Crore
        </button>
      </div>

      {/* Main Primary Filters Row (Always Visible) */}
      <div className="filters-main-grid">
        {/* Search by City, Locality, or Name */}
        <div className="filter-col-search">
          <label className="filter-field-label">Search Location or Name</label>
          <Input
            placeholder="Search by city, locality, or residence name..."
            icon={Search}
            value={filters.location || ''}
            onChange={(e) => handleInputChange('location', e.target.value)}
          />
        </div>

        {/* Property Type */}
        <div className="filter-col">
          <label className="filter-field-label">Property Type</label>
          <Select
            placeholder=""
            value={filters.propertyType || 'ALL'}
            onChange={(e) => handleInputChange('propertyType', e.target.value)}
            options={PROPERTY_TYPES}
          />
        </div>

        {/* Status */}
        <div className="filter-col">
          <label className="filter-field-label">Listing Status</label>
          <Select
            placeholder=""
            value={filters.status || 'ALL'}
            onChange={(e) => handleInputChange('status', e.target.value)}
            options={LISTING_STATUSES}
          />
        </div>

        {/* Bedrooms */}
        <div className="filter-col">
          <label className="filter-field-label">Bedrooms</label>
          <Select
            placeholder=""
            value={filters.bedrooms || 'ALL'}
            onChange={(e) => handleInputChange('bedrooms', e.target.value)}
            options={BEDROOM_OPTIONS}
          />
        </div>

        {/* Bathrooms */}
        <div className="filter-col">
          <label className="filter-field-label">Bathrooms</label>
          <Select
            placeholder=""
            value={filters.bathrooms || 'ALL'}
            onChange={(e) => handleInputChange('bathrooms', e.target.value)}
            options={BATHROOM_OPTIONS}
          />
        </div>
      </div>

      {/* Extended Filters (Price, Area, and Reset Action) */}
      <div className={`filters-advanced-row ${isExpanded ? 'is-open' : ''}`}>
        <div className="advanced-inputs-grid">
          {/* Min Price */}
          <div className="filter-col">
            <label className="filter-field-label">Min Price (₹)</label>
            <Input
              type="number"
              placeholder="e.g. 5000000 (50L)"
              value={filters.minPrice || ''}
              onChange={(e) => handleInputChange('minPrice', e.target.value)}
            />
          </div>

          {/* Max Price */}
          <div className="filter-col">
            <label className="filter-field-label">Max Price (₹)</label>
            <Input
              type="number"
              placeholder="e.g. 30000000 (3 Cr)"
              value={filters.maxPrice || ''}
              onChange={(e) => handleInputChange('maxPrice', e.target.value)}
            />
          </div>

          {/* Min Area */}
          <div className="filter-col">
            <label className="filter-field-label">Min Area (sq. ft.)</label>
            <Input
              type="number"
              placeholder="e.g. 1200"
              value={filters.minArea || ''}
              onChange={(e) => handleInputChange('minArea', e.target.value)}
            />
          </div>

          {/* Max Area */}
          <div className="filter-col">
            <label className="filter-field-label">Max Area (sq. ft.)</label>
            <Input
              type="number"
              placeholder="e.g. 4000"
              value={filters.maxArea || ''}
              onChange={(e) => handleInputChange('maxArea', e.target.value)}
            />
          </div>

          {/* Actions */}
          <div className="filter-col-actions">
            <label className="filter-field-label">&nbsp;</label>
            <Button
              variant="outline"
              icon={RotateCcw}
              onClick={onReset}
              fullWidth
              className="reset-filters-btn"
            >
              Reset Filters
            </Button>
          </div>
        </div>
      </div>

      {/* Bottom Bar: Active Filter Badges */}
      {activeCount > 0 && (
        <div className="filters-active-summary">
          <span className="summary-title">Active Filters:</span>
          <div className="active-tags-list">
            {filters.location && (
              <span className="active-tag">
                Location: "{filters.location}"
                <X size={13} onClick={() => handleInputChange('location', '')} />
              </span>
            )}
            {filters.propertyType && filters.propertyType !== 'ALL' && (
              <span className="active-tag">
                Type: {filters.propertyType}
                <X size={13} onClick={() => handleInputChange('propertyType', 'ALL')} />
              </span>
            )}
            {filters.status && filters.status !== 'ALL' && (
              <span className="active-tag">
                Status: {filters.status}
                <X size={13} onClick={() => handleInputChange('status', 'ALL')} />
              </span>
            )}
            {filters.bedrooms && filters.bedrooms !== 'ALL' && (
              <span className="active-tag">
                {filters.bedrooms}+ Beds
                <X size={13} onClick={() => handleInputChange('bedrooms', 'ALL')} />
              </span>
            )}
            {filters.bathrooms && filters.bathrooms !== 'ALL' && (
              <span className="active-tag">
                {filters.bathrooms}+ Baths
                <X size={13} onClick={() => handleInputChange('bathrooms', 'ALL')} />
              </span>
            )}
            {filters.minPrice && (
              <span className="active-tag">
                Min: ₹{Number(filters.minPrice).toLocaleString('en-IN')}
                <X size={13} onClick={() => handleInputChange('minPrice', '')} />
              </span>
            )}
            {filters.maxPrice && (
              <span className="active-tag">
                Max: ₹{Number(filters.maxPrice).toLocaleString('en-IN')}
                <X size={13} onClick={() => handleInputChange('maxPrice', '')} />
              </span>
            )}
            {filters.minArea && (
              <span className="active-tag">
                Min Area: {filters.minArea} sqft
                <X size={13} onClick={() => handleInputChange('minArea', '')} />
              </span>
            )}
            {filters.maxArea && (
              <span className="active-tag">
                Max Area: {filters.maxArea} sqft
                <X size={13} onClick={() => handleInputChange('maxArea', '')} />
              </span>
            )}
            <button type="button" className="clear-all-text-btn" onClick={onReset}>
              Clear All
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default PropertyFilters;
