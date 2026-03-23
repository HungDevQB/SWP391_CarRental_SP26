import React from 'react';
import { ErrorBoundary as ReactErrorBoundary } from 'react-error-boundary';
import styles from './ErrorBoundary.module.scss';

function ErrorFallback({ error, resetErrorBoundary }) {
  return (
    <div className={styles.errorContainer}>
      <h2>Oops! Something went wrong</h2>
      <pre className={styles.errorMessage}>{error.message}</pre>
      <button onClick={resetErrorBoundary} className={styles.retryButton}>
        Try again
      </button>
    </div>
  );
}

export function ErrorBoundary({ children }) {
  return (
    <ReactErrorBoundary
      FallbackComponent={ErrorFallback}
      onReset={() => {
        // Reset the state of your app here
        window.location.reload();
      }}
    >
      {children}
    </ReactErrorBoundary>
  );
}

export default ErrorBoundary; 