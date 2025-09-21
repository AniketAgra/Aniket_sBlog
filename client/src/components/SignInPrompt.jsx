import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import styles from '../styles/components/SignInPrompt.module.css';

function SignInPrompt({ onClose, message, title = 'Unlock Full Access' }) {
  return (
    <div className={styles.card} role="region" aria-label="Sign-in prompt">
      <div className={styles.headerRow}>
        <div className={styles.textWrap}>
          <div className={styles.title}>{title}</div>
          {message && <div className={styles.desc}>{message}</div>}
        </div>
        {onClose && (
          <button type="button" aria-label="Close" onClick={onClose} className={styles.closeBtn}>
            ✕
          </button>
        )}
      </div>
      <div className={styles.actions}>
        <Link to="/signup" className={styles.primaryBtn} aria-label="Create Account">
          {/* simple inline svg icon to avoid extra deps */}
          <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={styles.buttonIcon}>
            <path d="M12 12c2.761 0 5-2.239 5-5S14.761 2 12 2 7 4.239 7 7s2.239 5 5 5Zm0 2c-4.418 0-8 2.239-8 5v1h16v-1c0-2.761-3.582-5-8-5Z" fill="currentColor"/>
          </svg>
          Create Account
        </Link>
        <Link to="/signin" className={styles.secondaryBtn} aria-label="Log In">
          Log In
        </Link>
      </div>
    </div>
  );
}

SignInPrompt.propTypes = {
  onClose: PropTypes.func,
  message: PropTypes.string,
  title: PropTypes.string,
};

export default SignInPrompt;
