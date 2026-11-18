import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Home, User, Mail, Lock, Phone, ArrowRight, AlertCircle, Shield } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import './AuthPage.css';

export const SignUpPage = () => {
  const { signup, isAuthenticated, role } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // If query specifies role=2, default to Agent
  const initialRole = searchParams.get('role') === '2' ? 2 : 1;

  const [formData, setFormData] = useState({
    username: '',
    password: '',
    confirmPassword: '',
    email: '',
    fullName: '',
    phone: '',
    role: initialRole,
  });

  const [formErrors, setFormErrors] = useState({});
  const [serverError, setServerError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  React.useEffect(() => {
    if (isAuthenticated) {
      if (role === 'ADMIN') navigate('/admin/dashboard', { replace: true });
      else if (role === 'AGENT') navigate('/agent/dashboard', { replace: true });
      else navigate('/client/dashboard', { replace: true });
    }
  }, [isAuthenticated, role, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setServerError('');

    const form = e.currentTarget;
    const un = (formData.username || form.elements?.username?.value || '').trim();
    const pw = formData.password || form.elements?.password?.value || '';
    const cpw = formData.confirmPassword || form.elements?.confirmPassword?.value || '';
    const em = (formData.email || form.elements?.email?.value || '').trim();
    const fn = (formData.fullName || form.elements?.fullName?.value || '').trim();
    const ph = (formData.phone || form.elements?.phone?.value || '').trim();

    const errors = {};
    if (!un) {
      errors.username = 'Username is required';
    } else if (un.length < 3) {
      errors.username = 'Username must be at least 3 characters';
    }

    if (!pw) {
      errors.password = 'Password is required';
    } else if (pw.length < 6) {
      errors.password = 'Password must be at least 6 characters';
    }

    if (pw !== cpw) {
      errors.confirmPassword = 'Passwords do not match';
    }

    if (em && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(em)) {
      errors.email = 'Please provide a valid email address';
    }

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }
    setFormErrors({});

    setSubmitting(true);
    const result = await signup({
      username: un,
      password: pw,
      email: em,
      fullName: fn,
      phone: ph,
      role: formData.role,
    });
    setSubmitting(false);

    if (result.success) {
      toast.success('Account created successfully! Please sign in.');
      navigate('/signin');
    } else {
      setServerError(result.message || 'Registration failed. The username or email might already be taken.');
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-split-container">
        {/* Left: Form Column */}
        <div className="auth-form-column">
          <div className="auth-form-card">
            <Link to="/" className="auth-brand-logo">
              <div className="brand-icon-box">
                <Home size={22} className="brand-home-icon" />
              </div>
              <div className="brand-text">
                <span className="brand-title font-serif">PrimeHaven</span>
                <span className="brand-subtitle">Real Estate Network</span>
              </div>
            </Link>

            <div className="auth-header-text">
              <h1 className="auth-title font-serif">Create your account</h1>
              <p className="auth-subtitle">
                Join our verified property network as a home seeker or certified sales agent.
              </p>
            </div>

            {serverError && (
              <div className="auth-server-error" role="alert">
                <AlertCircle size={18} className="error-icon" />
                <span>{serverError}</span>
              </div>
            )}

            {/* Account Role Selector */}
            <div className="role-selector-box">
              <button
                type="button"
                className={`role-select-btn ${formData.role === 1 ? 'is-selected' : ''}`}
                onClick={() => setFormData((prev) => ({ ...prev, role: 1 }))}
              >
                <User size={18} />
                <span>Client / Homebuyer</span>
              </button>
              <button
                type="button"
                className={`role-select-btn ${formData.role === 2 ? 'is-selected' : ''}`}
                onClick={() => setFormData((prev) => ({ ...prev, role: 2 }))}
              >
                <Shield size={18} />
                <span>Real Estate Agent</span>
              </button>
            </div>

            <form onSubmit={handleSubmit} className="auth-form-flow" noValidate>
              <div className="form-row-two">
                <Input
                  label="Username"
                  name="username"
                  placeholder="Unique username"
                  icon={User}
                  required
                  value={formData.username}
                  onChange={handleChange}
                  error={formErrors.username}
                  autoComplete="username"
                />

                <Input
                  label="Full Name"
                  name="fullName"
                  placeholder="Your full legal name"
                  value={formData.fullName}
                  onChange={handleChange}
                  autoComplete="name"
                />
              </div>

              <div className="form-row-two">
                <Input
                  label="Email Address"
                  name="email"
                  type="email"
                  placeholder="name@example.com"
                  icon={Mail}
                  value={formData.email}
                  onChange={handleChange}
                  error={formErrors.email}
                  autoComplete="email"
                />

                <Input
                  label="Phone Number"
                  name="phone"
                  type="tel"
                  placeholder="+1 (555) 000-0000"
                  icon={Phone}
                  value={formData.phone}
                  onChange={handleChange}
                  autoComplete="tel"
                />
              </div>

              <div className="form-row-two">
                <Input
                  label="Password"
                  name="password"
                  type="password"
                  placeholder="Min 6 characters"
                  icon={Lock}
                  required
                  value={formData.password}
                  onChange={handleChange}
                  error={formErrors.password}
                  autoComplete="new-password"
                />

                <Input
                  label="Confirm Password"
                  name="confirmPassword"
                  type="password"
                  placeholder="Re-enter password"
                  icon={Lock}
                  required
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  error={formErrors.confirmPassword}
                  autoComplete="new-password"
                />
              </div>

              <Button
                type="submit"
                variant="primary"
                size="lg"
                fullWidth
                loading={submitting}
                icon={ArrowRight}
                iconPosition="right"
              >
                Create Account
              </Button>
            </form>

            <div className="auth-footer-prompt">
              <span>Already have an account?</span>{' '}
              <Link to="/signin" className="auth-inline-link">
                Sign in here
              </Link>
            </div>
          </div>
        </div>

        {/* Right: Visual Branding Column */}
        <div className="auth-visual-column">
          <img
            src="https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1200&q=80"
            alt="PrimeHaven Luxury Residence"
            className="auth-visual-img"
          />
          <div className="auth-visual-overlay">
            <blockquote className="auth-quote font-serif">
              "Find Your Place. Build Your Future."
            </blockquote>
            <p className="auth-quote-author">
              Access curated properties, schedule private tours, and collaborate with certified agents.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignUpPage;
