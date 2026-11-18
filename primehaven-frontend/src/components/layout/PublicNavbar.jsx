import React, { useState, useEffect } from 'react';
import { Link, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { Menu, X, Home, User, LogOut, LayoutDashboard, Compass } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import Button from '../common/Button';
import './PublicNavbar.css';

export const PublicNavbar = () => {
  const { user, isAuthenticated, role, logout } = useAuth();
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 15);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const getDashboardPath = () => {
    if (!user) return '/signin';
    const r = role || user?.roleName || 'CLIENT';
    if (r === 'ADMIN') return '/admin/dashboard';
    if (r === 'AGENT') return '/agent/dashboard';
    return '/client/dashboard';
  };

  const handleLogoClick = (e) => {
    setMobileMenuOpen(false);
    if (location.pathname === '/') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <header className={`public-navbar ${scrolled ? 'is-scrolled' : ''}`}>
      <div className="container public-navbar-inner">
        {/* Brand Logo */}
        <Link to="/" className="brand-logo" onClick={handleLogoClick}>
          <div className="brand-icon-box">
            <Home size={20} className="brand-home-icon" />
          </div>
          <div className="brand-text">
            <span className="brand-title font-serif">PrimeHaven</span>
            <span className="brand-subtitle">Real Estate Network</span>
          </div>
        </Link>

        {/* Desktop Navigation Links */}
        <nav className="desktop-nav" aria-label="Main navigation">
          <NavLink
            to="/"
            end
            className={({ isActive }) => `nav-link ${isActive ? 'is-active' : ''}`}
            onClick={() => {
              if (location.pathname === '/') {
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }
            }}
          >
            Home
          </NavLink>
          <NavLink
            to="/properties"
            className={({ isActive }) => `nav-link ${isActive ? 'is-active' : ''}`}
          >
            Explore Properties
          </NavLink>
          <NavLink
            to="/about"
            className={({ isActive }) => `nav-link ${isActive ? 'is-active' : ''}`}
          >
            About
          </NavLink>
          <NavLink
            to="/contact"
            className={({ isActive }) => `nav-link ${isActive ? 'is-active' : ''}`}
          >
            Contact
          </NavLink>
        </nav>

        {/* Desktop Auth Controls */}
        <div className="desktop-auth-actions">
          {isAuthenticated ? (
            <div className="auth-user-dropdown">
              <Link to={getDashboardPath()}>
                <Button variant="outline-dark" size="sm" icon={LayoutDashboard}>
                  {role === 'ADMIN' ? 'Admin Portal' : role === 'AGENT' ? 'Agent Studio' : 'Client Suite'}
                </Button>
              </Link>
              <Button
                variant="ghost"
                size="sm"
                icon={LogOut}
                onClick={logout}
                title="Sign Out"
                aria-label="Sign Out"
                className="nav-logout-btn"
              />
            </div>
          ) : (
            <div className="auth-guest-actions">
              <Link to="/signin">
                <Button variant="outline-dark" size="sm">
                  Sign In
                </Button>
              </Link>
              <Link to="/signup">
                <Button variant="gold" size="sm">
                  Get Started
                </Button>
              </Link>
            </div>
          )}
        </div>

        {/* Mobile Menu Toggle Button */}
        <button
          type="button"
          className="mobile-menu-toggle"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
        >
          {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            className="mobile-drawer"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25 }}
          >
            <div className="container mobile-drawer-inner">
              <NavLink
                to="/"
                end
                className={({ isActive }) => `mobile-nav-link ${isActive ? 'is-active' : ''}`}
                onClick={() => setMobileMenuOpen(false)}
              >
                Home
              </NavLink>
              <NavLink
                to="/properties"
                className={({ isActive }) => `mobile-nav-link ${isActive ? 'is-active' : ''}`}
                onClick={() => setMobileMenuOpen(false)}
              >
                Explore Properties
              </NavLink>
              <NavLink
                to="/about"
                className={({ isActive }) => `mobile-nav-link ${isActive ? 'is-active' : ''}`}
                onClick={() => setMobileMenuOpen(false)}
              >
                About
              </NavLink>
              <NavLink
                to="/contact"
                className={({ isActive }) => `mobile-nav-link ${isActive ? 'is-active' : ''}`}
                onClick={() => setMobileMenuOpen(false)}
              >
                Contact
              </NavLink>

              <div className="mobile-auth-divider" />

              {isAuthenticated ? (
                <div className="mobile-auth-actions">
                  <Link to={getDashboardPath()} onClick={() => setMobileMenuOpen(false)}>
                    <Button variant="gold" fullWidth icon={LayoutDashboard}>
                      Open Workspace ({role})
                    </Button>
                  </Link>
                  <Button
                    variant="outline-dark"
                    fullWidth
                    icon={LogOut}
                    onClick={() => {
                      setMobileMenuOpen(false);
                      logout();
                    }}
                  >
                    Sign Out
                  </Button>
                </div>
              ) : (
                <div className="mobile-auth-actions">
                  <Link to="/signin" onClick={() => setMobileMenuOpen(false)}>
                    <Button variant="outline-dark" fullWidth>
                      Sign In
                    </Button>
                  </Link>
                  <Link to="/signup" onClick={() => setMobileMenuOpen(false)}>
                    <Button variant="gold" fullWidth>
                      Get Started
                    </Button>
                  </Link>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};

export default PublicNavbar;
