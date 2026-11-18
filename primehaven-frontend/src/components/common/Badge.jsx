import React from 'react';

export const Badge = ({ status = '', children, className = '' }) => {
  const normalized = (status || children || '').toString().trim().toUpperCase();

  const getBadgeClass = (s) => {
    switch (s) {
      // Positive/Active states
      case 'AVAILABLE':
      case 'CONFIRMED':
      case 'COMPLETED':
      case 'RESOLVED':
      case 'SUCCESS':
      case 'AGENT':
        return 'badge-success';

      // Pending/In-progress states
      case 'UNDER_NEGOTIATION':
      case 'REQUESTED':
      case 'IN_PROGRESS':
      case 'OPEN':
      case 'WARNING':
      case 'CLIENT':
        return 'badge-warning';

      // Reserved / Special
      case 'RESERVED':
      case 'ADMIN':
      case 'PRIMARY':
        return 'badge-primary';

      // Closed/Cancelled states
      case 'SOLD':
      case 'CANCELLED':
      case 'CLOSED':
      case 'ERROR':
        return 'badge-error';

      default:
        return 'badge-primary';
    }
  };

  const formatText = (text) => {
    if (!text) return '';
    return text.replace(/_/g, ' ');
  };

  return (
    <span className={`badge ${getBadgeClass(normalized)} ${className}`}>
      {children || formatText(normalized)}
    </span>
  );
};

export default Badge;
