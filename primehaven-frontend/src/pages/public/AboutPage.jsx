import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Building2, Compass, ShieldCheck, ArrowRight, Sparkles, CheckCircle2 } from 'lucide-react';
import PublicNavbar from '../../components/layout/PublicNavbar';
import PublicFooter from '../../components/layout/PublicFooter';
import Button from '../../components/common/Button';
import './AboutPage.css';

export const AboutPage = () => {
  return (
    <div className="about-page-container">
      <PublicNavbar />

      <main className="about-main-wrapper">
        {/* Hero Section */}
        <section className="about-hero">
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="about-hero-content"
          >
            <span className="luxury-eyebrow">
              <Sparkles /> The PrimeHaven Provenance
            </span>
            <h1 className="font-serif about-hero-title">
              Architectural Sanctuaries, <br />
              Tailored for Modern Living.
            </h1>
            <div className="bronze-divider bronze-divider-center" />
            <p className="about-hero-subtitle">
              PrimeHaven is an elite architectural real estate network. We curate distinctive residences defined by natural light, timeless materials, and structural mastery.
            </p>
          </motion.div>
        </section>

        {/* Feature Grid */}
        <section className="about-feature-grid container">
          <div className="about-card card-surface">
            <div className="about-icon-wrapper terracotta">
              <Building2 size={26} />
            </div>
            <h3 className="font-serif about-card-title">Curated Architecture</h3>
            <p className="about-card-desc">
              Every residence on PrimeHaven is vetted for design authenticity, light orientation, natural materials, and sustainable construction.
            </p>
          </div>

          <div className="about-card card-surface">
            <div className="about-icon-wrapper gold">
              <Compass size={26} />
            </div>
            <h3 className="font-serif about-card-title">Direct Agent Advisory</h3>
            <p className="about-card-desc">
              Connect directly with verified local real-estate partners. Schedule walkthroughs, ask architectural queries, and receive tailored property counsel.
            </p>
          </div>

          <div className="about-card card-surface">
            <div className="about-icon-wrapper sage">
              <ShieldCheck size={26} />
            </div>
            <h3 className="font-serif about-card-title">Enterprise Security</h3>
            <p className="about-card-desc">
              Built on a resilient microservices foundation with Spring Cloud, JWT authorization, and complete transparency at every stage of the property journey.
            </p>
          </div>
        </section>

        {/* Vision Section */}
        <section className="about-vision-section">
          <div className="container about-vision-inner">
            <div className="about-vision-image-frame">
              <img
                src="https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1400&q=80"
                alt="Contemporary architecture with natural stone and floor-to-ceiling glass"
                className="about-vision-img"
                loading="eager"
              />
              <div className="image-frame-gold-accent" />
            </div>

            <div className="about-vision-content">
              <span className="luxury-eyebrow">Our Guiding Ethos</span>
              <h2 className="font-serif about-vision-title">
                A Sanctuary for Every Stage of Life
              </h2>
              <div className="bronze-divider" />
              <p className="about-vision-p">
                We believe a home is not merely an asset class; it is the physical canvas where memories are forged and futures are cultivated.
              </p>
              <p className="about-vision-p">
                By replacing legacy high-friction processes with real-time tour booking, direct advisor communication, and transparent market valuation, PrimeHaven elevates the way people discover and acquire sanctuaries.
              </p>

              <div className="about-stats-row">
                <div className="about-stat-box">
                  <div className="font-serif stat-number">100%</div>
                  <div className="stat-label">Verified Listings</div>
                </div>

                <div className="about-stat-box">
                  <div className="font-serif stat-number">Zero</div>
                  <div className="stat-label">Viewing Fees</div>
                </div>

                <div className="about-stat-box">
                  <div className="font-serif stat-number">Tier-1</div>
                  <div className="stat-label">Sanctuary Portfolio</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="about-cta-section container">
          <div className="about-cta-card">
            <span className="luxury-eyebrow">Begin Your Journey</span>
            <h2 className="font-serif about-cta-title">
              Ready to Discover Your Sanctuary?
            </h2>
            <p className="about-cta-subtitle">
              Browse our curated marketplace of architecturally distinct residences.
            </p>
            <Link to="/properties">
              <Button variant="primary" size="lg" icon={ArrowRight} iconPosition="right">
                Explore Properties
              </Button>
            </Link>
          </div>
        </section>
      </main>

      <PublicFooter />
    </div>
  );
};

export default AboutPage;

