import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Compass,
  ArrowUpDown,
  Sparkles,
  Wifi,
  WifiOff,
  RefreshCw,
  Building2,
  Info,
} from 'lucide-react';
import PublicNavbar from '../../components/layout/PublicNavbar';
import PublicFooter from '../../components/layout/PublicFooter';
import PropertyFilters from '../../components/property/PropertyFilters';
import PropertyGrid from '../../components/property/PropertyGrid';
import FeaturedResidences from '../../components/property/FeaturedResidences';
import Pagination from '../../components/common/Pagination';
import ErrorState from '../../components/common/ErrorState';
import Select from '../../components/common/Select';
import propertyApi from '../../services/propertyApi';
import { SAMPLE_PROPERTIES } from '../../data/sampleProperties';
import './PropertyListPage.css';

const SORT_OPTIONS = [
  { value: 'NEWEST', label: 'Newest First' },
  { value: 'PRICE_ASC', label: 'Price: Low to High' },
  { value: 'PRICE_DESC', label: 'Price: High to Low' },
  { value: 'AREA_DESC', label: 'Largest Area' },
  { value: 'BEDS_DESC', label: 'Most Bedrooms' },
];

export const PropertyListPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  // Parse filters from URL
  const [filters, setFilters] = useState(() => ({
    location: searchParams.get('location') || '',
    propertyType: searchParams.get('propertyType') || 'ALL',
    status: searchParams.get('status') || 'ALL',
    bedrooms: searchParams.get('bedrooms') || 'ALL',
    bathrooms: searchParams.get('bathrooms') || 'ALL',
    minPrice: searchParams.get('minPrice') || '',
    maxPrice: searchParams.get('maxPrice') || '',
    minArea: searchParams.get('minArea') || '',
    maxArea: searchParams.get('maxArea') || '',
  }));

  const [sortBy, setSortBy] = useState(() => searchParams.get('sortBy') || 'NEWEST');
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isLiveBackend, setIsLiveBackend] = useState(false);
  const [retrying, setRetrying] = useState(false);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 9;

  // Fetch properties using propertyApi service
  const fetchProperties = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await propertyApi.getAll({
        status: filters.status !== 'ALL' ? filters.status : undefined,
        location: filters.location || undefined,
      });

      if (Array.isArray(result)) {
        setProperties(result);
        setIsLiveBackend(result.isLiveBackend === true);
      } else if (result && Array.isArray(result.data)) {
        setProperties(result.data);
        setIsLiveBackend(result.isLiveBackend === true);
      } else {
        // Fallback to sample catalog
        setProperties(SAMPLE_PROPERTIES);
        setIsLiveBackend(false);
      }
    } catch (err) {
      console.error('Failed to fetch properties from API, using sample portfolio', err);
      setProperties(SAMPLE_PROPERTIES);
      setIsLiveBackend(false);
    } finally {
      setLoading(false);
      setRetrying(false);
    }
  }, [filters.status, filters.location]);

  useEffect(() => {
    fetchProperties();
  }, [fetchProperties]);

  const handleManualRetry = () => {
    setRetrying(true);
    fetchProperties();
  };

  // Sync state changes with URL query parameters
  const handleFiltersChange = (newFilters) => {
    setFilters(newFilters);
    setCurrentPage(1);

    const params = new URLSearchParams();
    if (newFilters.location) params.set('location', newFilters.location);
    if (newFilters.propertyType && newFilters.propertyType !== 'ALL')
      params.set('propertyType', newFilters.propertyType);
    if (newFilters.status && newFilters.status !== 'ALL')
      params.set('status', newFilters.status);
    if (newFilters.bedrooms && newFilters.bedrooms !== 'ALL')
      params.set('bedrooms', newFilters.bedrooms);
    if (newFilters.bathrooms && newFilters.bathrooms !== 'ALL')
      params.set('bathrooms', newFilters.bathrooms);
    if (newFilters.minPrice) params.set('minPrice', newFilters.minPrice);
    if (newFilters.maxPrice) params.set('maxPrice', newFilters.maxPrice);
    if (newFilters.minArea) params.set('minArea', newFilters.minArea);
    if (newFilters.maxArea) params.set('maxArea', newFilters.maxArea);
    if (sortBy !== 'NEWEST') params.set('sortBy', sortBy);

    setSearchParams(params);
  };

  const handleResetFilters = () => {
    const defaultFilters = {
      location: '',
      propertyType: 'ALL',
      status: 'ALL',
      bedrooms: 'ALL',
      bathrooms: 'ALL',
      minPrice: '',
      maxPrice: '',
      minArea: '',
      maxArea: '',
    };
    setFilters(defaultFilters);
    setSortBy('NEWEST');
    setSearchParams(new URLSearchParams());
    setCurrentPage(1);
  };

  const handleSortChange = (newSort) => {
    setSortBy(newSort);
    setCurrentPage(1);
    const params = new URLSearchParams(searchParams);
    if (newSort !== 'NEWEST') {
      params.set('sortBy', newSort);
    } else {
      params.delete('sortBy');
    }
    setSearchParams(params);
  };

  // Client-side multi-parameter filtering & sorting
  const filteredProperties = useMemo(() => {
    let result = [...properties];

    // Location search (city, locality, title, or description)
    if (filters.location && filters.location.trim()) {
      const q = filters.location.trim().toLowerCase();
      result = result.filter((p) => {
        const titleMatch = p.title && p.title.toLowerCase().includes(q);
        const locMatch = p.location && p.location.toLowerCase().includes(q);
        const cityMatch = p.city && p.city.toLowerCase().includes(q);
        const localityMatch = p.locality && p.locality.toLowerCase().includes(q);
        const descMatch = p.description && p.description.toLowerCase().includes(q);
        return titleMatch || locMatch || cityMatch || localityMatch || descMatch;
      });
    }

    // Property Type
    if (filters.propertyType && filters.propertyType !== 'ALL') {
      const targetType = filters.propertyType.toLowerCase();
      result = result.filter((p) => {
        const propType = (p.propertyType || '').toLowerCase();
        const catLabel = (p.categoryLabel || '').toLowerCase();
        return propType.includes(targetType) || catLabel.includes(targetType);
      });
    }

    // Listing Status / Availability
    if (filters.status && filters.status !== 'ALL') {
      const targetStatus = filters.status.toUpperCase();
      result = result.filter((p) => {
        const st = (p.status || '').toUpperCase();
        const lt = (p.listingType || '').toUpperCase();
        if (targetStatus === 'FOR_SALE') {
          return lt === 'FOR_SALE' || st === 'AVAILABLE';
        }
        if (targetStatus === 'FOR_RENT') {
          return lt === 'FOR_RENT';
        }
        return st === targetStatus;
      });
    }

    // Bedrooms
    if (filters.bedrooms && filters.bedrooms !== 'ALL') {
      const minBeds = Number(filters.bedrooms);
      result = result.filter((p) => Number(p.bedrooms || 0) >= minBeds);
    }

    // Bathrooms
    if (filters.bathrooms && filters.bathrooms !== 'ALL') {
      const minBaths = Number(filters.bathrooms);
      result = result.filter((p) => Number(p.bathrooms || 0) >= minBaths);
    }

    // Price range
    if (filters.minPrice) {
      const min = Number(filters.minPrice);
      result = result.filter((p) => Number(p.price || 0) >= min);
    }
    if (filters.maxPrice) {
      const max = Number(filters.maxPrice);
      result = result.filter((p) => Number(p.price || 0) <= max);
    }

    // Area range
    if (filters.minArea) {
      const minA = Number(filters.minArea);
      result = result.filter((p) => Number(p.area || 0) >= minA);
    }
    if (filters.maxArea) {
      const maxA = Number(filters.maxArea);
      result = result.filter((p) => Number(p.area || 0) <= maxA);
    }

    // Sorting
    switch (sortBy) {
      case 'PRICE_ASC':
        result.sort((a, b) => (Number(a.price) || 0) - (Number(b.price) || 0));
        break;
      case 'PRICE_DESC':
        result.sort((a, b) => (Number(b.price) || 0) - (Number(a.price) || 0));
        break;
      case 'AREA_DESC':
        result.sort((a, b) => (Number(b.area) || 0) - (Number(a.area) || 0));
        break;
      case 'BEDS_DESC':
        result.sort((a, b) => (Number(b.bedrooms) || 0) - (Number(a.bedrooms) || 0));
        break;
      case 'NEWEST':
      default:
        result.sort((a, b) => (Number(b.id) || 0) - (Number(a.id) || 0));
        break;
    }

    return result;
  }, [properties, filters, sortBy]);

  // Pagination calculation
  const totalPages = Math.ceil(filteredProperties.length / itemsPerPage);
  const paginatedProperties = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredProperties.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredProperties, currentPage, itemsPerPage]);

  return (
    <div className="property-list-page">
      <PublicNavbar />

      {/* Decorative architectural background line detail */}
      <div className="page-background-pattern" aria-hidden="true" />

      <main className="container page-main-content">
        {/* Header Section */}
        <header className="page-header">
          <div className="page-header-content">
            <div className="header-badge-row">
              <span className="luxury-eyebrow">
                <Compass size={13} className="eyebrow-icon" /> CURATED RESIDENCES
              </span>
              <span className="header-verified-pill">
                <Sparkles size={12} /> Architectural Selection
              </span>
            </div>

            <h1 className="page-title font-serif">Find a Place Worth Calling Home</h1>
            <p className="page-subtitle-text">
              Explore thoughtfully selected apartments, contemporary residences, luxury penthouses, and exceptional private estates.
            </p>
          </div>

          <div className="page-header-controls">
            <div className="header-catalog-stat">
              <span className="stat-num font-serif">{properties.length}</span>
              <span className="stat-label">Total Residences Available</span>
            </div>

            <div className="sort-control-wrap">
              <label className="sort-label">
                <ArrowUpDown size={14} /> Sort By:
              </label>
              <div className="sort-select-box">
                <Select
                  placeholder=""
                  value={sortBy}
                  onChange={(e) => handleSortChange(e.target.value)}
                  options={SORT_OPTIONS}
                />
              </div>
            </div>
          </div>
        </header>

        {/* Backend Connectivity Status Notification */}
        {!isLiveBackend ? (
          <div className="backend-status-banner dev-mode">
            <div className="banner-left">
              <div className="banner-icon-circle">
                <WifiOff size={16} />
              </div>
              <div>
                <strong className="banner-title">Development Mode Active — Curated Sample Portfolio</strong>
                <p className="banner-desc">
                  Demonstrating 12 premium residences with complete specifications, architectural photography, working filters, and modal interactions. (Live microservices at port 6001 are currently offline).
                </p>
              </div>
            </div>
            <button
              type="button"
              className="retry-live-btn"
              onClick={handleManualRetry}
              disabled={retrying}
            >
              <RefreshCw size={14} className={retrying ? 'spin-icon' : ''} />
              <span>{retrying ? 'Connecting...' : 'Retry Live Gateway'}</span>
            </button>
          </div>
        ) : (
          <div className="backend-status-banner live-mode">
            <div className="banner-left">
              <div className="banner-icon-circle live">
                <Wifi size={16} />
              </div>
              <div>
                <strong className="banner-title">Connected to Live Property Database</strong>
                <p className="banner-desc">
                  Displaying real-time property records synchronized with PrimeHaven Cloud Services.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Editorial Featured Residences Section */}
        <FeaturedResidences />

        {/* Property Filter Panel */}
        <PropertyFilters
          filters={filters}
          onChange={handleFiltersChange}
          onReset={handleResetFilters}
          totalResults={filteredProperties.length}
          totalCatalogCount={properties.length}
        />

        {/* Main Results Header */}
        <div className="results-subheading-bar">
          <div className="results-heading-left">
            <h2 className="results-heading font-serif">Explore All Listings</h2>
            <span className="results-sub-text">
              Showing {filteredProperties.length > 0 ? (currentPage - 1) * itemsPerPage + 1 : 0}–
              {Math.min(currentPage * itemsPerPage, filteredProperties.length)} of {filteredProperties.length} curated homes
            </span>
          </div>

          {filteredProperties.length < properties.length && (
            <button
              type="button"
              className="reset-inline-btn"
              onClick={handleResetFilters}
            >
              Reset All Filters
            </button>
          )}
        </div>

        {/* Property Grid & Pagination */}
        {error ? (
          <ErrorState message={error} onRetry={fetchProperties} />
        ) : (
          <>
            <PropertyGrid
              properties={paginatedProperties}
              loading={loading}
              emptyTitle="No residences match your criteria"
              emptyDescription="Try expanding your price range, searching a different city or locality, or resetting active filters."
              onResetFilters={handleResetFilters}
            />

            {totalPages > 1 && (
              <div className="pagination-wrap">
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  totalItems={filteredProperties.length}
                  onPageChange={setCurrentPage}
                />
              </div>
            )}
          </>
        )}

        {/* Sample Data Disclaimer (Requested in Section 4) */}
        {!isLiveBackend && (
          <div className="development-disclaimer-box">
            <Info size={16} className="disclaimer-icon" />
            <p className="disclaimer-text">
              <strong>Sample Data Disclaimer:</strong> These are illustrative development listings created for architectural exploration and UI evaluation, not verified live market offerings or guaranteed sale prices. Live verified properties will automatically populate once the backend service is activated.
            </p>
          </div>
        )}
      </main>

      <PublicFooter />
    </div>
  );
};

export default PropertyListPage;
