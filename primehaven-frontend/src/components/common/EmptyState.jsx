import React from 'react';
import Button from './Button';
import { Home } from 'lucide-react';

export const EmptyState = ({
  icon: Icon = Home,
  title = 'No records found',
  description = 'There is currently no data matching your criteria.',
  actionLabel,
  onAction,
  className = '',
}) => {
  return (
    <div
      className={`card-surface ${className}`}
      style={{
        padding: '56px 28px',
        textAlign: 'center',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '18px',
        backgroundColor: '#ffffff',
      }}
    >
      <div
        style={{
          width: '64px',
          height: '64px',
          borderRadius: '50%',
          backgroundColor: 'var(--bronze-muted)',
          color: 'var(--bronze)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          border: '1px solid var(--color-border-gold)',
        }}
      >
        <Icon size={30} />
      </div>

      <div style={{ maxWidth: '420px' }}>
        <h4 className="font-serif" style={{ fontSize: '1.3rem', color: 'var(--color-text)', marginBottom: '8px' }}>
          {title}
        </h4>
        <p style={{ fontSize: '0.92rem', color: 'var(--color-text-secondary)', lineHeight: 1.6 }}>
          {description}
        </p>
      </div>

      {actionLabel && onAction && (
        <Button variant="primary" onClick={onAction}>
          {actionLabel}
        </Button>
      )}
    </div>
  );
};

export default EmptyState;

