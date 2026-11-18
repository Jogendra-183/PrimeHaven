import React from 'react';
import { Link } from 'react-router-dom';
import { Compass, Home, Search } from 'lucide-react';
import PublicNavbar from '../../components/layout/PublicNavbar';
import PublicFooter from '../../components/layout/PublicFooter';
import Button from '../../components/common/Button';
import './ErrorPages.css';

export const NotFoundPage = () => {
  return (
    <div className="error-page-container">
      <PublicNavbar />

      <main className="error-content-wrapper">
        <div className="error-card">
          <div className="error-code font-serif">404</div>
          <h1 className="font-serif error-title">Sanctuary Not Found</h1>
          <p className="error-desc">
            The architectural residence, page, or resource you are seeking could not be located. It may have been archived, relocated, or temporarily unlisted.
          </p>

          <div className="error-actions">
            <Link to="/">
              <Button variant="primary" icon={Home}>
                Return Home
              </Button>
            </Link>
            <Link to="/properties">
              <Button variant="outline" icon={Search}>
                Browse Properties
              </Button>
            </Link>
          </div>
        </div>
      </main>

      <PublicFooter />
    </div>
  );
};

export default NotFoundPage;
