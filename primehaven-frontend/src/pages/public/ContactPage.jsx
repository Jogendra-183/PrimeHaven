import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, Phone, MapPin, Send, Clock, CheckCircle, Sparkles, ShieldCheck } from 'lucide-react';
import toast from 'react-hot-toast';
import PublicNavbar from '../../components/layout/PublicNavbar';
import PublicFooter from '../../components/layout/PublicFooter';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import './ContactPage.css';

export const ContactPage = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  });
  const [sending, setSending] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.message) {
      toast.error('Please complete all required fields');
      return;
    }

    setSending(true);
    setTimeout(() => {
      setSending(false);
      setSubmitted(true);
      toast.success('Your message has been delivered to PrimeHaven Concierge');
    }, 600);
  };

  return (
    <div className="contact-page-container">
      <PublicNavbar />

      <main className="contact-main-wrapper">
        {/* Hero Section */}
        <section className="contact-hero">
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="contact-hero-content"
          >
            <span className="luxury-eyebrow">
              <Sparkles /> PrimeHaven Concierge & Advisory
            </span>
            <h1 className="font-serif contact-hero-title">
              Private Client Advisory Desk
            </h1>
            <div className="bronze-divider bronze-divider-center" />
            <p className="contact-hero-subtitle">
              Whether you are acquiring a flagship residence, scheduling a private architectural tour, or listing an estate, our senior partners are at your service.
            </p>
          </motion.div>
        </section>

        {/* Contact Split Grid */}
        <section className="container contact-grid">
          {/* Left: Contact Form */}
          <div className="contact-card card-surface">
            <span className="luxury-eyebrow">Direct Electronic Dispatch</span>
            <h2 className="font-serif contact-card-title">
              Send an Advisory Inquiry
            </h2>
            <p className="contact-card-sub">
              Our property advisors respond to all client inquiries within four business hours.
            </p>

            {submitted ? (
              <div className="contact-success-box">
                <CheckCircle size={44} className="success-icon" />
                <h3 className="font-serif success-title">
                  Inquiry Dispatched
                </h3>
                <p className="success-text">
                  Thank you, {formData.name}. A PrimeHaven property advisor has received your request and will contact you directly.
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  style={{ marginTop: '20px' }}
                  onClick={() => {
                    setSubmitted(false);
                    setFormData({ name: '', email: '', subject: '', message: '' });
                  }}
                >
                  Send Another Message
                </Button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="contact-form-flow">
                <Input
                  label="Full Name"
                  required
                  placeholder="e.g. Eleanor Vance"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />

                <Input
                  label="Email Address"
                  type="email"
                  required
                  placeholder="eleanor@example.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />

                <Input
                  label="Inquiry Subject"
                  placeholder="e.g. Penthouse Walkthrough or Portfolio Acquisition"
                  value={formData.subject}
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                />

                <Input
                  label="Message"
                  type="textarea"
                  rows={4}
                  required
                  placeholder="Detail your requirements, preferred viewing dates, or questions..."
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                />

                <Button
                  type="submit"
                  variant="primary"
                  size="lg"
                  icon={Send}
                  loading={sending}
                  style={{ marginTop: '8px' }}
                >
                  Transmit Message
                </Button>
              </form>
            )}
          </div>

          {/* Right: Office & Direct Contact Info */}
          <div className="contact-info-list">
            <div className="contact-card card-surface">
              <span className="luxury-eyebrow">Atelier & Headquarters</span>
              <h3 className="font-serif contact-card-title">
                Sanctuary Studios & Desks
              </h3>

              <div className="contact-items-stack">
                <div className="contact-info-item">
                  <div className="contact-icon-box gold">
                    <MapPin size={22} />
                  </div>
                  <div>
                    <div className="contact-info-title">Global Headquarters</div>
                    <div className="contact-info-text">
                      PrimeHaven Tower, 450 Lexington Avenue<br />
                      Suite 3200, New York, NY 10017
                    </div>
                  </div>
                </div>

                <div className="contact-info-item">
                  <div className="contact-icon-box terracotta">
                    <Phone size={22} />
                  </div>
                  <div>
                    <div className="contact-info-title">Telephone Advisory</div>
                    <div className="contact-info-text">
                      +1 (800) 582-7746 (Toll-Free)<br />
                      Mon - Sat: 8:00 AM – 7:00 PM EST
                    </div>
                  </div>
                </div>

                <div className="contact-info-item">
                  <div className="contact-icon-box sage">
                    <Mail size={22} />
                  </div>
                  <div>
                    <div className="contact-info-title">Direct Electronic Dispatch</div>
                    <div className="contact-info-text">
                      concierge@primehaven.com<br />
                      advisory@primehaven.com
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="contact-card card-surface private-walkthrough-card">
              <div className="walkthrough-header">
                <Clock size={22} className="walkthrough-icon" />
                <h4 className="font-serif walkthrough-title">
                  Private Client Walkthroughs
                </h4>
              </div>
              <p className="walkthrough-p">
                Clients registered on PrimeHaven can schedule private viewings directly from any property page with zero intermediate booking fees and direct agent coordination.
              </p>
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="faq-section">
          <div className="container faq-inner">
            <div className="faq-header-wrap">
              <span className="luxury-eyebrow">Client Inquiries</span>
              <h2 className="font-serif faq-title">Frequently Asked Questions</h2>
              <div className="bronze-divider bronze-divider-center" />
            </div>

            <div className="faq-grid">
              <div className="faq-item card-surface">
                <div className="faq-q">How do I schedule a property walkthrough?</div>
                <div className="faq-a">
                  Simply navigate to any property details page, click "Schedule Private Tour", choose your preferred date and time, and submit. The assigned agent confirms your appointment directly in your dashboard.
                </div>
              </div>

              <div className="faq-item card-surface">
                <div className="faq-q">Are all PrimeHaven listings verified?</div>
                <div className="faq-a">
                  Yes. Every residence listed on PrimeHaven undergoes architectural and legal title verification by our certified agent partners before being designated available.
                </div>
              </div>

              <div className="faq-item card-surface">
                <div className="faq-q">Can I register as a real-estate agent?</div>
                <div className="faq-a">
                  Yes! During sign-up, select "Licensed Real Estate Agent" as your account tier to immediately unlock listing publication tools, tour queues, and client inquiry desks.
                </div>
              </div>

              <div className="faq-item card-surface">
                <div className="faq-q">Is there any fee to submit an inquiry?</div>
                <div className="faq-a">
                  None whatsoever. Prospective buyers and renters can communicate directly with listing advisors with full privacy and zero advisory fees.
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <PublicFooter />
    </div>
  );
};

export default ContactPage;

