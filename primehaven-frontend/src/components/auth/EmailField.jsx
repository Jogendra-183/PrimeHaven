import React, { useState, useRef } from 'react';
import { User } from 'lucide-react';
import Input from '../common/Input';
import { isValidEmail, isEmailAttempt } from './LampStateController';

export const EmailField = ({
  value,
  onChange,
  onFocus,
  onBlur,
  onTyping,
  onValidationStateChange,
  error,
  disabled = false,
}) => {
  const typingTimeoutRef = useRef(null);
  const [emailStatus, setEmailStatus] = useState('neutral'); // 'neutral' | 'valid' | 'invalid'

  const handleChange = (e) => {
    const val = e.target.value;
    onChange(val);

    // Notify typing event to lamp
    if (onTyping) onTyping();

    // Check validity state
    if (isEmailAttempt(val)) {
      const valid = isValidEmail(val);
      const newStatus = valid ? 'valid' : 'invalid';
      setEmailStatus(newStatus);
      if (onValidationStateChange) {
        onValidationStateChange(newStatus);
      }
    } else {
      setEmailStatus('neutral');
      if (onValidationStateChange) {
        onValidationStateChange('neutral');
      }
    }

    // Debounce returning to focused pose
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      if (onFocus) onFocus();
    }, 450);
  };

  const handleBlur = (e) => {
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    if (onBlur) onBlur(e);
  };

  // Provide accessible hint or friendly validation message
  const hintMessage =
    !error && emailStatus === 'invalid'
      ? 'Please enter a complete email address (e.g. alex@primehaven.in)'
      : !error && emailStatus === 'valid'
      ? 'Valid email format recognized'
      : undefined;

  return (
    <div className={`auth-field-wrapper ${error ? 'shake-subtle' : ''}`}>
      <Input
        label="Username or Email"
        name="identifier"
        type="text"
        placeholder="Enter your username or email"
        icon={User}
        required
        value={value}
        onChange={handleChange}
        onFocus={onFocus}
        onBlur={handleBlur}
        error={error}
        hint={hintMessage}
        disabled={disabled}
        autoComplete="username"
        autoCapitalize="none"
        spellCheck="false"
      />
    </div>
  );
};

export default EmailField;
