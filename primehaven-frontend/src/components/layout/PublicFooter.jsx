import React from 'react';
import { Link } from 'react-router-dom';
import { Home, Mail, Phone, MapPin, ArrowRight } from 'lucide-react';
import './PublicFooter.css';

export const PublicFooter = () => {
  return (
    <footer className="public-footer">
      <div className="container footer-content">
        {/* Brand column */}
        <div className="footer-col footer-brand-col">
          <Link to="/" className="brand-logo footer-logo">
            <div className="brand-icon-box">
              <Home size={22} className="brand-home-icon" />
            </div>
            <div className="brand-text">
              <span className="brand-title font-serif">PrimeHaven</span>
              <span className="brand-subtitle">Real Estate Network</span>
            </div>
          </Link>
          <p className="footer-tagline">
            "Find Your Place. Build Your Future."
          </p>
          <p className="footer-desc">
            PrimeHaven is an elite property marketplace and modern real-estate management network connecting discerning homebuyers, professional agents, and premium property portfolios.
          </p>
        </div>

        {/* Discovery Links */}
        <div className="footer-col">
          <h4 className="footer-heading font-serif">Properties</h4>
          <ul className="footer-links">
            <li><Link to="/properties">All Listings</Link></li>
            <li><Link to="/properties?propertyType=Villa">Luxury Villas</Link></li>
            <li><Link to="/properties?propertyType=Apartment">Modern Apartments</Link></li>
            <li><Link to="/properties?propertyType=House">Family Houses</Link></li>
            <li><Link to="/properties?status=AVAILABLE">Available Now</Link></li>
          </ul>
        </div>

        {/* Quick Links */}
        <div className="footer-col">
          <h4 className="footer-heading font-serif">Platform</h4>
          <ul className="footer-links">
            <li><Link to="/">Home</Link></li>
            <li><Link to="/about">About PrimeHaven</Link></li>
            <li><Link to="/contact">Contact Support</Link></li>
            <li><Link to="/signin">Sign In</Link></li>
            <li><Link to="/signup">Join Network</Link></li>
          </ul>
        </div>

        {/* Contact info column */}
        <div className="footer-col">
          <h4 className="footer-heading font-serif">Get in Touch</h4>
          <ul className="footer-contact-list">
            <li>
              <MapPin size={16} className="contact-icon" />
              <span>450 Haven Blvd, Suite 800, Beverly Hills, CA</span>
            </li>
            <li>
              <Mail size={16} className="contact-icon" />
              <span>contact@primehaven.com</span>
            </li>
            <li>
              <Phone size={16} className="contact-icon" />
              <span>+1 (800) 555-HAVEN</span>
            </li>
          </ul>
          <div className="footer-badge-box">
            <span className="badge badge-success">Verified Architecture Network</span>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="footer-bottom">
        <div className="container footer-bottom-inner">
          <p className="copyright-text">
            &copy; {new Date().getFullYear()} PrimeHaven Real Estate Network. All rights reserved.
          </p>
          <div className="footer-legal-links">
            <span>Privacy Policy</span>
            <span>&bull;</span>
            <span>Terms of Service</span>
            <span>&bull;</span>
            <span>Equal Housing Opportunity</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default PublicFooter;
