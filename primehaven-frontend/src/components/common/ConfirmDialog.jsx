import React from 'react';
import Modal from './Modal';
import Button from './Button';
import { AlertTriangle } from 'lucide-react';

export const ConfirmDialog = ({
  isOpen,
  onClose,
  onConfirm,
  title = 'Are you sure?',
  message = 'This action cannot be undone.',
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  isDestructive = true,
  loading = false,
}) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} maxWidth="440px">
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', textAlign: 'center', alignItems: 'center' }}>
        <div
          style={{
            width: '54px',
            height: '54px',
            borderRadius: '50%',
            backgroundColor: isDestructive ? '#FDECEC' : 'var(--color-soft-terracotta)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: isDestructive ? 'var(--color-error)' : 'var(--color-primary)',
          }}
        >
          <AlertTriangle size={28} />
        </div>

        <div>
          <h3 className="font-serif" style={{ fontSize: '1.3rem', marginBottom: '8px', color: 'var(--color-text)' }}>
            {title}
          </h3>
          <p style={{ fontSize: '0.92rem', color: 'var(--color-text-secondary)', lineHeight: 1.5 }}>
            {message}
          </p>
        </div>

        <div style={{ display: 'flex', gap: '12px', width: '100%', marginTop: '6px' }}>
          <Button variant="outline" fullWidth onClick={onClose} disabled={loading}>
            {cancelText}
          </Button>
          <Button
            variant={isDestructive ? 'danger' : 'primary'}
            fullWidth
            onClick={onConfirm}
            loading={loading}
          >
            {confirmText}
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default ConfirmDialog;
