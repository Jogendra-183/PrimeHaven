import React, { useState, useRef } from 'react';
import { Lock, Eye, EyeOff } from 'lucide-react';
import './PasswordField.css';

export const PasswordField = ({
  value,
  onChange,
  onFocus,
  onBlur,
  onTyping,
  onVisibilityToggle,
  error,
  disabled = false,
}) => {
  const [showPassword, setShowPassword] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const typingTimeoutRef = useRef(null);

  const handleToggleVisibility = () => {
    const nextState = !showPassword;
    setShowPassword(nextState);
    if (onVisibilityToggle) {
      onVisibilityToggle(nextState);
    }
  };

  const handleFocus = (e) => {
    setIsFocused(true);
    if (onFocus) onFocus(e);
  };

  const handleBlur = (e) => {
    setIsFocused(false);
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    if (onBlur) onBlur(e);
  };

  const handleChange = (e) => {
    onChange(e.target.value);

    // Notify typing without exposing password string to animation
    if (onTyping) onTyping();

    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      if (onFocus) onFocus();
    }, 450);
  };

  return (
    <div className={`input-group ${error ? 'has-error shake-subtle' : ''}`}>
      <label htmlFor="auth-password" className="input-label">
        Password
        <span className="required-star">*</span>
      </label>

      <div className={`input-wrapper ${isFocused ? 'is-focused' : ''}`}>
        <Lock
          className={`input-prefix-icon ${isFocused ? 'lock-unlocked' : ''}`}
          size={18}
          aria-hidden="true"
        />

        <input
          id="auth-password"
          name="password"
          type={showPassword ? 'text' : 'password'}
          placeholder="Enter your password"
          value={value}
          onChange={handleChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
          disabled={disabled}
          className="input-control has-prefix has-suffix"
          autoComplete="current-password"
        />

        <button
          type="button"
          className={`input-password-toggle ${showPassword ? 'is-visible' : ''}`}
          onClick={handleToggleVisibility}
          tabIndex={0}
          aria-label={showPassword ? 'Hide password' : 'Show password'}
        >
          <span className="toggle-icon-wrap">
            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </span>
        </button>
      </div>

      {error && <p className="input-error-msg">{error}</p>}
    </div>
  );
};

export default PasswordField;
