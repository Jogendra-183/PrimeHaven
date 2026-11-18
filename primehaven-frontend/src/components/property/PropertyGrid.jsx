import React from 'react';
import PropertyCard from './PropertyCard';
import { PropertyCardSkeleton } from '../common/Skeleton';
import EmptyState from '../common/EmptyState';
import './PropertyGrid.css';

export const PropertyGrid = ({
  properties = [],
  loading = false,
  emptyTitle = 'No properties found',
  emptyDescription = 'Try adjusting your search criteria or filters to explore more properties.',
  onResetFilters,
}) => {
  if (loading) {
    return (
      <div className="property-grid">
        {Array.from({ length: 6 }).map((_, i) => (
          <PropertyCardSkeleton key={i} />
        ))}
      </div>
    );
  }

  if (!properties || properties.length === 0) {
    return (
      <EmptyState
        title={emptyTitle}
        description={emptyDescription}
        actionLabel={onResetFilters ? 'Clear Filters' : undefined}
        onAction={onResetFilters}
      />
    );
  }

  return (
    <div className="property-grid">
      {properties.map((property) => (
        <PropertyCard key={property.id} property={property} />
      ))}
    </div>
  );
};

export default PropertyGrid;
