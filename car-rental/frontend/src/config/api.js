import { API_BASE_URL, API_TIMEOUT, API_RETRY_ATTEMPTS } from './constants';

// API Endpoints
export const API_ENDPOINTS = {
  // Auth
  AUTH: {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    LOGOUT: '/auth/logout',
    REFRESH_TOKEN: '/auth/refresh-token',
    FORGOT_PASSWORD: '/auth/forgot-password',
    RESET_PASSWORD: '/auth/reset-password',
    VERIFY_EMAIL: '/auth/verify-email'
  },

  // Users
  USERS: {
    BASE: '/users',
    PROFILE: '/users/profile',
    CHANGE_PASSWORD: '/users/change-password',
    UPDATE_PROFILE: '/users/update-profile'
  },

  // Cars
  CARS: {
    BASE: '/cars',
    FEATURED: '/cars/featured',
    POPULAR: '/cars/popular',
    SEARCH: '/cars/search',
    FILTER: '/cars/filter',
    CATEGORIES: '/cars/categories',
    BRANDS: '/cars/brands'
  },

  // Bookings
  BOOKINGS: {
    BASE: '/bookings',
    USER: '/bookings/user',
    CAR: '/bookings/car',
    CANCEL: '/bookings/cancel',
    CONFIRM: '/bookings/confirm',
    COMPLETE: '/bookings/complete'
  },

  // Payments
  PAYMENTS: {
    BASE: '/payments',
    USER: '/payments/user',
    BOOKING: '/payments/booking',
    REFUND: '/payments/refund',
    VERIFY: '/payments/verify'
  },

  // Reviews
  REVIEWS: {
    BASE: '/reviews',
    CAR: '/reviews/car',
    USER: '/reviews/user'
  },

  // Admin
  ADMIN: {
    USERS: '/admin/users',
    CARS: '/admin/cars',
    BOOKINGS: '/admin/bookings',
    PAYMENTS: '/admin/payments',
    REPORTS: '/admin/reports',
    SETTINGS: '/admin/settings'
  },

  // Supplier
  SUPPLIER: {
    CARS: '/supplier/cars',
    BOOKINGS: '/supplier/bookings',
    PAYMENTS: '/supplier/payments',
    REPORTS: '/supplier/reports',
    SETTINGS: '/supplier/settings'
  }
};

// API Configuration
export const API_CONFIG = {
  baseURL: API_BASE_URL,
  timeout: API_TIMEOUT,
  retryAttempts: API_RETRY_ATTEMPTS,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
};

// API Response Status Codes
export const API_STATUS = {
  SUCCESS: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  INTERNAL_SERVER_ERROR: 500
};

// API Error Messages
export const API_ERROR_MESSAGES = {
  [API_STATUS.BAD_REQUEST]: 'Bad Request',
  [API_STATUS.UNAUTHORIZED]: 'Unauthorized',
  [API_STATUS.FORBIDDEN]: 'Forbidden',
  [API_STATUS.NOT_FOUND]: 'Not Found',
  [API_STATUS.INTERNAL_SERVER_ERROR]: 'Internal Server Error'
}; 