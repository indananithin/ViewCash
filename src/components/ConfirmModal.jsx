import React from 'react';
import { X, LogOut, AlertTriangle } from 'lucide-react';

const ConfirmModal = ({ isOpen, onClose, onConfirm, title, message, confirmText, cancelText, iconType = 'logout' }) => {
  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0,0,0,0.5)',
      backdropFilter: 'blur(5px)',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 10000,
      padding: '20px'
    }}>
      <div style={{
        background: 'white',
        borderRadius: '24px',
        width: '100%',
        maxWidth: '320px',
        padding: '24px',
        boxShadow: '0 20px 40px rgba(0,0,0,0.2)',
        animation: 'modalSlideUp 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        position: 'relative'
      }}>
        <div style={{
          width: '56px',
          height: '56px',
          borderRadius: '16px',
          background: iconType === 'logout' ? 'rgba(238, 93, 80, 0.1)' : 'rgba(255, 128, 8, 0.1)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          margin: '0 auto 16px'
        }}>
          {iconType === 'logout' ? (
            <LogOut size={28} color="#EE5D50" />
          ) : (
            <AlertTriangle size={28} color="#FF8008" />
          )}
        </div>

        <h3 style={{ textAlign: 'center', marginBottom: '8px', fontSize: '18px', color: 'var(--text-main)' }}>
          {title}
        </h3>
        <p style={{ textAlign: 'center', marginBottom: '24px', fontSize: '14px', color: 'var(--text-muted)', lineHeight: '1.5' }}>
          {message}
        </p>

        <div style={{ display: 'flex', gap: '12px' }}>
          <button 
            onClick={onClose}
            style={{
              flex: 1,
              padding: '12px',
              borderRadius: '12px',
              border: '1px solid #eee',
              background: '#f9f9f9',
              color: 'var(--text-main)',
              fontWeight: '600',
              cursor: 'pointer'
            }}
          >
            {cancelText || 'Cancel'}
          </button>
          <button 
            onClick={onConfirm}
            style={{
              flex: 1,
              padding: '12px',
              borderRadius: '12px',
              border: 'none',
              background: iconType === 'logout' ? '#EE5D50' : 'var(--primary-orange)',
              color: 'white',
              fontWeight: '600',
              cursor: 'pointer'
            }}
          >
            {confirmText || 'Yes, Log Out'}
          </button>
        </div>
      </div>

      <style>{`
        @keyframes modalSlideUp {
          from { opacity: 0; transform: translateY(20px) scale(0.95); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
      `}</style>
    </div>
  );
};

export default ConfirmModal;
