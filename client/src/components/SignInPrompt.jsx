import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';

function SignInPrompt({ onClose, message }) {
  return (
    <div style={{
      marginTop: '1rem',
      border: '1px solid #e5e7eb',
      borderRadius: '0.5rem',
      padding: '1rem',
      background: '#fafafa'
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '0.5rem' }}>
        <div>
          <div style={{ fontWeight: 600 }}>Sign in to see more</div>
          <div style={{ color: '#6b7280', fontSize: '0.9rem' }}>{message}</div>
        </div>
        {onClose && (
          <button
            type="button"
            aria-label="Close"
            onClick={onClose}
            style={{
              border: '1px solid #e5e7eb',
              background: 'white',
              padding: '0.25rem 0.5rem',
              borderRadius: '0.375rem',
              cursor: 'pointer'
            }}
          >
            ✕
          </button>
        )}
      </div>
      <div style={{ marginTop: '0.75rem' }}>
        <Link
          to="/signin"
          style={{
            display: 'inline-block',
            background: '#111827',
            color: 'white',
            padding: '0.5rem 0.75rem',
            borderRadius: '0.375rem',
            textDecoration: 'none',
            fontWeight: 600
          }}
        >
          Go to Sign in
        </Link>
      </div>
    </div>
  );
}

SignInPrompt.propTypes = {
  onClose: PropTypes.func,
};

export default SignInPrompt;
