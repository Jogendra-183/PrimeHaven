import React from 'react';
import Button from './Button';
import { AlertCircle, RefreshCw } from 'lucide-react';

export const ErrorState = ({
  title = 'Something went wrong',
  message = 'Failed to load data from the server. Please ensure the backend microservices and API Gateway are running.',
  onRetry,
}) => {
  return (
    <div
      className="card-surface"
      style={{
        padding: '56px 28px',
        textAlign: 'center',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '18px',
        backgroundColor: '#ffffff',
        borderColor: 'rgba(181, 71, 71, 0.28)',
      }}
    >
      <div
        style={{
          width: '60px',
          height: '60px',
          borderRadius: '50%',
          backgroundColor: 'var(--color-error-bg)',
          color: 'var(--color-error)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          border: '1px solid rgba(181, 71, 71, 0.25)',
        }}
      >
        <AlertCircle size={28} />
      </div>

      <div style={{ maxWidth: '440px' }}>
        <h4 className="font-serif" style={{ fontSize: '1.3rem', color: 'var(--color-text)', marginBottom: '8px' }}>
          {title}
        </h4>
        <p style={{ fontSize: '0.92rem', color: 'var(--color-text-secondary)', lineHeight: 1.6 }}>
          {message}
        </p>
      </div>

      {onRetry && (
        <Button variant="outline" icon={RefreshCw} onClick={onRetry}>
          Try Again
        </Button>
      )}
    </div>
  );
};

export default ErrorState;

