// App Constants
export const APP_NAME = 'Car Rental';
export const APP_VERSION = '1.0.0';

// API Constants
export const API_BASE_URL = 'http://localhost:8080/api';
export const API_TIMEOUT = 30000;
export const API_RETRY_ATTEMPTS = 3;

// Auth Constants
export const AUTH_TOKEN_KEY = 'auth_token';
export const AUTH_REFRESH_TOKEN_KEY = 'refresh_token';
export const AUTH_TOKEN_EXPIRY = 24 * 60 * 60 * 1000; // 24 hours

// Pagination Constants
export const DEFAULT_PAGE_SIZE = 10;
export const MAX_PAGE_SIZE = 100;

// Car Constants
export const CAR_STATUS = {
  AVAILABLE: 'AVAILABLE',
  RENTED: 'RENTED',
  MAINTENANCE: 'MAINTENANCE',
  RESERVED: 'RESERVED'
};

export const CAR_TYPES = {
  SEDAN: 'SEDAN',
  SUV: 'SUV',
  HATCHBACK: 'HATCHBACK',
  COUPE: 'COUPE',
  CONVERTIBLE: 'CONVERTIBLE',
  VAN: 'VAN'
};

// Booking Constants
export const BOOKING_STATUS = {
  PENDING: 'PENDING',
  CONFIRMED: 'CONFIRMED',
  CANCELLED: 'CANCELLED',
  COMPLETED: 'COMPLETED'
};

// Payment Constants
export const PAYMENT_METHODS = {
  CREDIT_CARD: 'CREDIT_CARD',
  DEBIT_CARD: 'DEBIT_CARD',
  BANK_TRANSFER: 'BANK_TRANSFER',
  CASH: 'CASH'
};

// Date Format Constants
export const DATE_FORMAT = 'YYYY-MM-DD';
export const DATETIME_FORMAT = 'YYYY-MM-DD HH:mm:ss';

// Currency Constants
export const CURRENCY = 'VND';
export const CURRENCY_SYMBOL = '₫';

// Validation Constants
export const PASSWORD_MIN_LENGTH = 8;
export const PASSWORD_MAX_LENGTH = 32;
export const USERNAME_MIN_LENGTH = 3;
export const USERNAME_MAX_LENGTH = 20;

// File Upload Constants
export const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
export const ALLOWED_FILE_TYPES = ['image/jpeg', 'image/png', 'image/gif'];

// Cache Constants
export const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes 