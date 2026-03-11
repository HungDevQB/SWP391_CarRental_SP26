import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { ErrorBoundary } from '../components/common/ErrorBoundary';

const ThrowError = () => {
  throw new Error('Test error');
};

describe('ErrorBoundary', () => {
  beforeEach(() => {
    // Suppress console.error for expected errors
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    console.error.mockRestore();
  });

  it('renders children when there is no error', () => {
    render(
      <ErrorBoundary>
        <div>Test content</div>
      </ErrorBoundary>
    );

    expect(screen.getByText('Test content')).toBeInTheDocument();
  });

  it('renders error fallback when there is an error', () => {
    render(
      <ErrorBoundary>
        <ThrowError />
      </ErrorBoundary>
    );

    expect(screen.getByText('Oops! Something went wrong')).toBeInTheDocument();
    expect(screen.getByText('Test error')).toBeInTheDocument();
    expect(screen.getByText('Try again')).toBeInTheDocument();
  });

  it('calls resetErrorBoundary when retry button is clicked', () => {
    const mockReload = jest.fn();
    delete window.location;
    window.location = { reload: mockReload };

    render(
      <ErrorBoundary>
        <ThrowError />
      </ErrorBoundary>
    );

    fireEvent.click(screen.getByText('Try again'));
    expect(mockReload).toHaveBeenCalled();
  });
}); 