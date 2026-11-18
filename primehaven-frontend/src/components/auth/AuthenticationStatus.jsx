import React from 'react';
import { AlertCircle, WifiOff, RefreshCw } from 'lucide-react';
import './AuthenticationStatus.css';

export const AuthenticationStatus = ({
  error,
  isNetworkError = false,
  onRetry,
}) => {
  if (!error) return null;

  return (
    <div
      className={`auth-status-banner ${isNetworkError ? 'is-network-error' : 'is-auth-error'}`}
      role="alert"
    >
      <div className="status-icon-wrap">
        {isNetworkError ? <WifiOff size={18} /> : <AlertCircle size={18} />}
      </div>

      <div className="status-message-content">
        <span className="status-text">{error}</span>
        {isNetworkError && onRetry && (
          <button
            type="button"
            className="status-retry-button"
            onClick={onRetry}
          >
            <RefreshCw size={12} />
            <span>Retry Connection</span>
          </button>
        )}
      </div>
    </div>
  );
};

export default AuthenticationStatus;

