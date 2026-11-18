/**
 * LampStateController.js
 * State definitions and transition logic for the PrimeHaven Interactive Desk Lamp
 */

export const LAMP_STATES = {
  ENTERING: 'entering',
  IDLE: 'idle',
  EMAIL_FOCUSED: 'email-focused',
  EMAIL_TYPING: 'email-typing',
  EMAIL_VALID: 'email-valid',
  EMAIL_INVALID: 'email-invalid',
  PASSWORD_FOCUSED: 'password-focused',
  PASSWORD_TYPING: 'password-typing',
  PASSWORD_HIDDEN: 'password-hidden',
  PASSWORD_VISIBLE: 'password-visible',
  AUTHENTICATING: 'authenticating',
  AUTHENTICATION_SUCCESS: 'authentication-success',
  AUTHENTICATION_ERROR: 'authentication-error',
  NETWORK_ERROR: 'network-error',
  FORM_INVALID: 'form-invalid',
  RETURNING_TO_IDLE: 'returning-to-idle',
  SIGNUP_HOVERED: 'signup-hovered',
};

// Email validation helper
export const isValidEmail = (email) => {
  if (!email || typeof email !== 'string') return false;
  const regex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  return regex.test(email.trim());
};

// Check if string looks like an email attempt (has @ or user is typing an address)
export const isEmailAttempt = (str) => {
  if (!str) return false;
  return str.includes('@') || str.includes('.');
};

export default {
  LAMP_STATES,
  isValidEmail,
  isEmailAttempt,
};

