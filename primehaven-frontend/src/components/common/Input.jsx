import React, { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import './Input.css';

export const Input = ({
  label,
  name,
  type = 'text',
  placeholder,
  value,
  onChange,
  error,
  required = false,
  disabled = false,
  icon: Icon,
  hint,
  rows,
  className = '',
  ...rest
}) => {
  const [showPassword, setShowPassword] = useState(false);
  const isPassword = type === 'password';
  const effectiveType = isPassword ? (showPassword ? 'text' : 'password') : type;
  const isTextarea = type === 'textarea';

  return (
    <div className={`input-group ${error ? 'has-error' : ''} ${className}`}>
      {label && (
        <label htmlFor={name} className="input-label">
          {label}
          {required && <span className="required-star">*</span>}
        </label>
      )}

      <div className="input-wrapper">
        {Icon && <Icon className="input-prefix-icon" size={18} />}

        {isTextarea ? (
          <textarea
            id={name}
            name={name}
            rows={rows || 3}
            placeholder={placeholder}
            value={value}
            onChange={onChange}
            disabled={disabled}
            className={`input-control input-textarea ${Icon ? 'has-prefix' : ''}`}
            {...rest}
          />
        ) : (
          <input
            id={name}
            name={name}
            type={effectiveType}
            placeholder={placeholder}
            value={value}
            onChange={onChange}
            disabled={disabled}
            className={`input-control ${Icon ? 'has-prefix' : ''} ${isPassword ? 'has-suffix' : ''}`}
            {...rest}
          />
        )}

        {isPassword && (
          <button
            type="button"
            className="input-password-toggle"
            onClick={() => setShowPassword(!showPassword)}
            tabIndex={-1}
            aria-label={showPassword ? 'Hide password' : 'Show password'}
          >
            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        )}
      </div>

      {error && <p className="input-error-msg">{error}</p>}
      {!error && hint && <p className="input-hint">{hint}</p>}
    </div>
  );
};

export default Input;
