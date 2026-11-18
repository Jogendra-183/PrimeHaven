import React from 'react';
import './Button.css';

export const Button = ({
  children,
  variant = 'primary', // 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'sage'
  size = 'md', // 'sm' | 'md' | 'lg'
  icon: Icon,
  iconPosition = 'left',
  loading = false,
  disabled = false,
  type = 'button',
  onClick,
  className = '',
  fullWidth = false,
  ...rest
}) => {
  return (
    <button
      type={type}
      disabled={disabled || loading}
      onClick={onClick}
      className={`btn btn-${variant} btn-${size} ${fullWidth ? 'btn-full' : ''} ${className}`}
      {...rest}
    >
      {loading ? (
        <span className="btn-spinner" aria-hidden="true" />
      ) : Icon && iconPosition === 'left' ? (
        <Icon size={size === 'sm' ? 16 : size === 'lg' ? 22 : 18} className="btn-icon" />
      ) : null}
      <span className="btn-text">{children}</span>
      {!loading && Icon && iconPosition === 'right' ? (
        <Icon size={size === 'sm' ? 16 : size === 'lg' ? 22 : 18} className="btn-icon" />
      ) : null}
    </button>
  );
};

export default Button;
