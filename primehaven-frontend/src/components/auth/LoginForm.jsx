import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { ArrowRight, Home } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';
import EmailField from './EmailField';
import PasswordField from './PasswordField';
import AuthenticationStatus from './AuthenticationStatus';
import Button from '../common/Button';
import { LAMP_STATES } from './LampStateController';

export const LoginForm = ({ onLampStateChange, currentLampState }) => {
  const { signin } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [formErrors, setFormErrors] = useState({});
  const [authError, setAuthError] = useState('');
  const [isNetworkError, setIsNetworkError] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Handle URL query parameter ?focus=email or ?focus=password for preview/testing
  React.useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const focusParam = params.get('focus');
    if (focusParam === 'email') {
      const el = document.getElementById('identifier');
      if (el) el.focus();
      if (onLampStateChange) onLampStateChange(LAMP_STATES.EMAIL_FOCUSED);
    } else if (focusParam === 'password') {
      const el = document.getElementById('auth-password');
      if (el) el.focus();
      if (onLampStateChange) onLampStateChange(LAMP_STATES.PASSWORD_FOCUSED);
    }
  }, []);

  // Derive active focus mode for dynamic card illumination & dimming
  const isEmailActive = [
    LAMP_STATES.EMAIL_FOCUSED,
    LAMP_STATES.EMAIL_TYPING,
    LAMP_STATES.EMAIL_VALID,
    LAMP_STATES.EMAIL_INVALID,
  ].includes(currentLampState);

  const isPasswordActive = [
    LAMP_STATES.PASSWORD_FOCUSED,
    LAMP_STATES.PASSWORD_TYPING,
    LAMP_STATES.PASSWORD_HIDDEN,
    LAMP_STATES.PASSWORD_VISIBLE,
  ].includes(currentLampState);

  const focusMode = isEmailActive ? 'email' : isPasswordActive ? 'password' : 'none';

  // Email Field Event Handlers
  const handleEmailFocus = () => {
    if (onLampStateChange) onLampStateChange(LAMP_STATES.EMAIL_FOCUSED);
  };

  const handleEmailTyping = () => {
    if (onLampStateChange) onLampStateChange(LAMP_STATES.EMAIL_TYPING);
  };

  const handleEmailValidationState = (state) => {
    if (state === 'valid') {
      if (onLampStateChange) onLampStateChange(LAMP_STATES.EMAIL_VALID);
    } else if (state === 'invalid') {
      if (onLampStateChange) onLampStateChange(LAMP_STATES.EMAIL_INVALID);
    }
  };

  // Password Field Event Handlers
  const handlePasswordFocus = () => {
    if (onLampStateChange) onLampStateChange(LAMP_STATES.PASSWORD_FOCUSED);
  };

  const handlePasswordTyping = () => {
    if (onLampStateChange) onLampStateChange(LAMP_STATES.PASSWORD_TYPING);
  };

  const handlePasswordVisibilityToggle = (isVisible) => {
    if (onLampStateChange) {
      onLampStateChange(
        isVisible ? LAMP_STATES.PASSWORD_VISIBLE : LAMP_STATES.PASSWORD_HIDDEN
      );
    }
  };

  const handleFieldBlur = () => {
    // Return to balanced idle lighting when user clicks away
    if (!submitting && currentLampState !== LAMP_STATES.AUTHENTICATION_SUCCESS) {
      if (onLampStateChange) onLampStateChange(LAMP_STATES.IDLE);
    }
  };

  // Signup Link Hover Handlers
  const handleSignupMouseEnter = () => {
    if (!submitting && currentLampState === LAMP_STATES.IDLE) {
      if (onLampStateChange) onLampStateChange(LAMP_STATES.SIGNUP_HOVERED);
    }
  };

  const handleSignupMouseLeave = () => {
    if (!submitting && currentLampState === LAMP_STATES.SIGNUP_HOVERED) {
      if (onLampStateChange) onLampStateChange(LAMP_STATES.IDLE);
    }
  };

  const handleSubmit = async (e) => {
    if (e && e.preventDefault) e.preventDefault();
    setAuthError('');
    setIsNetworkError(false);

    const trimmedIdentifier = identifier.trim();
    const errors = {};

    if (!trimmedIdentifier) {
      errors.identifier = 'Please enter your username or email address';
    }
    if (!password) {
      errors.password = 'Please enter your password';
    }

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      if (onLampStateChange) onLampStateChange(LAMP_STATES.FORM_INVALID);
      return;
    }

    setFormErrors({});
    // Briefly brighten light right before request processing
    if (onLampStateChange) onLampStateChange(LAMP_STATES.AUTHENTICATING);
    setSubmitting(true);

    try {
      const result = await signin({
        username: trimmedIdentifier,
        password,
      });

      if (result.success) {
        if (onLampStateChange) onLampStateChange(LAMP_STATES.AUTHENTICATION_SUCCESS);
        toast.success(`Welcome back, ${result.user.fullName || result.user.username}!`);

        // Smooth pause for celebratory lamp animation before transition
        setTimeout(() => {
          const from = location.state?.from?.pathname;
          if (from) {
            navigate(from, { replace: true });
          } else {
            const r = result.user.roleName;
            if (r === 'ADMIN') navigate('/admin/dashboard', { replace: true });
            else if (r === 'AGENT') navigate('/agent/dashboard', { replace: true });
            else navigate('/client/dashboard', { replace: true });
          }
        }, 950);
      } else {
        const msg = result.message || '';
        const isNet =
          msg.toLowerCase().includes('network') ||
          msg.toLowerCase().includes('connect') ||
          msg.toLowerCase().includes('unavailable') ||
          msg.toLowerCase().includes('econnrefused');

        setIsNetworkError(isNet);
        if (isNet) {
          if (onLampStateChange) onLampStateChange(LAMP_STATES.NETWORK_ERROR);
          setAuthError('Authentication service is currently offline. Please verify backend services.');
        } else {
          if (onLampStateChange) onLampStateChange(LAMP_STATES.AUTHENTICATION_ERROR);
          setAuthError('Unable to sign in. Check your credentials and try again.');
        }
      }
    } catch (err) {
      setIsNetworkError(true);
      if (onLampStateChange) onLampStateChange(LAMP_STATES.NETWORK_ERROR);
      setAuthError('Unable to reach the server. Please check your network connection.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className={`auth-form-card focus-${focusMode}`}>
      {/* Brand Header */}
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
        <h1 className="auth-title font-serif">Sign in to your account</h1>
        <p className="auth-subtitle">
          Welcome back. Access your saved homes, visits, inquiries, and portfolios.
        </p>
      </div>

      {/* Authentication Status Banner (Auth Error or Network Failure) */}
      <AuthenticationStatus
        error={authError}
        isNetworkError={isNetworkError}
        onRetry={handleSubmit}
      />

      <form onSubmit={handleSubmit} className="auth-form-flow" noValidate>
        {/* Username / Email Field Container */}
        <div className="auth-field-block auth-field-email">
          <EmailField
            value={identifier}
            onChange={setIdentifier}
            onFocus={handleEmailFocus}
            onBlur={handleFieldBlur}
            onTyping={handleEmailTyping}
            onValidationStateChange={handleEmailValidationState}
            error={formErrors.identifier}
            disabled={submitting}
          />
        </div>

        {/* Password Field Container */}
        <div className="auth-field-block auth-field-password">
          <PasswordField
            value={password}
            onChange={setPassword}
            onFocus={handlePasswordFocus}
            onBlur={handleFieldBlur}
            onTyping={handlePasswordTyping}
            onVisibilityToggle={handlePasswordVisibilityToggle}
            error={formErrors.password}
            disabled={submitting}
          />
        </div>

        {/* Sign In CTA Button */}
        <div className="auth-field-block auth-form-submit">
          <Button
            type="submit"
            variant="primary"
            size="lg"
            fullWidth
            loading={submitting}
            icon={submitting ? undefined : ArrowRight}
            iconPosition="right"
          >
            {submitting ? 'Signing in...' : 'Sign In'}
          </Button>
        </div>
      </form>

      <div className="auth-footer-prompt">
        <span>Don't have an account yet?</span>{' '}
        <Link
          to="/signup"
          className="auth-inline-link"
          onMouseEnter={handleSignupMouseEnter}
          onMouseLeave={handleSignupMouseLeave}
        >
          Create an account
        </Link>
      </div>
    </div>
  );
};

export default LoginForm;
