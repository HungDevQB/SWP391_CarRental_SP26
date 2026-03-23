import React from 'react';
import styles from './ErrorMessage.module.scss';

const ErrorMessage = ({ message, onRetry }) => {
  return (
    <div className={styles.errorContainer}>
      <div className={styles.errorMessage}>{message}</div>
      {onRetry && (
        <button className={styles.retryButton} onClick={onRetry}>
          Thử lại
        </button>
      )}
    </div>
  );
};

export default ErrorMessage; 