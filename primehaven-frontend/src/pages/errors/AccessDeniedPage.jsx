import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldAlert, Home, LogIn } from 'lucide-react';
import PublicNavbar from '../../components/layout/PublicNavbar';
import PublicFooter from '../../components/layout/PublicFooter';
import Button from '../../components/common/Button';
import { useAuth } from '../../context/AuthContext';
import './ErrorPages.css';

export const AccessDeniedPage = () => {
  const { user, role, logout } = useAuth();

  return (
    <div className="error-page-container">
      <PublicNavbar />

      <main className="error-content-wrapper">
        <div className="error-card">
          <div className="error-code font-serif" style={{ color: 'var(--color-error)' }}>
            403
          </div>
          <h1 className="font-serif error-title">Access Restricted</h1>
          <p className="error-desc">
            Your current account credentials ({role || 'Guest'}) do not possess authorization to access this portal or execute administrative operations.
          </p>

          <div className="error-actions">
            <Link to="/">
              <Button variant="outline" icon={Home}>
                Return to Sanctuary Home
              </Button>
            </Link>
            {user ? (
              <Button variant="primary" onClick={logout} icon={LogIn}>
                Switch Account
              </Button>
            ) : (
              <Link to="/signin">
                <Button variant="primary" icon={LogIn}>
                  Sign In with Authorized Account
                </Button>
              </Link>
            )}
          </div>
        </div>
      </main>

      <PublicFooter />
    </div>
  );
};

export default AccessDeniedPage;
