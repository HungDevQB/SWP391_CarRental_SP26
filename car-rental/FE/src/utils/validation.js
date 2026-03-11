import {
  PASSWORD_MIN_LENGTH,
  PASSWORD_MAX_LENGTH,
  USERNAME_MIN_LENGTH,
  USERNAME_MAX_LENGTH,
  MAX_FILE_SIZE,
  ALLOWED_FILE_TYPES
} from '../config/constants';

/**
 * Validate email
 * @param {string} email - Email to validate
 * @returns {boolean} True if email is valid
 */
export const isValidEmail = (email) => {
  if (!email) return false;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Validate password
 * @param {string} password - Password to validate
 * @returns {boolean} True if password is valid
 */
export const isValidPassword = (password) => {
  if (!password) return false;
  return (
    password.length >= PASSWORD_MIN_LENGTH &&
    password.length <= PASSWORD_MAX_LENGTH &&
    /[A-Z]/.test(password) && // At least one uppercase letter
    /[a-z]/.test(password) && // At least one lowercase letter
    /[0-9]/.test(password) && // At least one number
    /[^A-Za-z0-9]/.test(password) // At least one special character
  );
};

/**
 * Validate username
 * @param {string} username - Username to validate
 * @returns {boolean} True if username is valid
 */
export const isValidUsername = (username) => {
  if (!username) return false;
  return (
    username.length >= USERNAME_MIN_LENGTH &&
    username.length <= USERNAME_MAX_LENGTH &&
    /^[a-zA-Z0-9_]+$/.test(username) // Only letters, numbers and underscore
  );
};

/**
 * Validate phone number
 * @param {string} phone - Phone number to validate
 * @returns {boolean} True if phone number is valid
 */
export const isValidPhone = (phone) => {
  if (!phone) return false;
  const phoneRegex = /^[0-9]{10}$/;
  return phoneRegex.test(phone.replace(/\D/g, ''));
};

/**
 * Validate file size
 * @param {number} size - File size in bytes
 * @returns {boolean} True if file size is valid
 */
export const isValidFileSize = (size) => {
  if (!size) return false;
  return size <= MAX_FILE_SIZE;
};

/**
 * Validate file type
 * @param {string} type - File MIME type
 * @returns {boolean} True if file type is valid
 */
export const isValidFileType = (type) => {
  if (!type) return false;
  return ALLOWED_FILE_TYPES.includes(type);
};

/**
 * Validate credit card number
 * @param {string} number - Credit card number
 * @returns {boolean} True if credit card number is valid
 */
export const isValidCreditCard = (number) => {
  if (!number) return false;
  const cleaned = number.replace(/\D/g, '');
  if (cleaned.length !== 16) return false;

  // Luhn algorithm
  let sum = 0;
  let isEven = false;
  for (let i = cleaned.length - 1; i >= 0; i--) {
    let digit = parseInt(cleaned.charAt(i));
    if (isEven) {
      digit *= 2;
      if (digit > 9) {
        digit -= 9;
      }
    }
    sum += digit;
    isEven = !isEven;
  }
  return sum % 10 === 0;
};

/**
 * Validate date
 * @param {string|Date} date - Date to validate
 * @returns {boolean} True if date is valid
 */
export const isValidDate = (date) => {
  if (!date) return false;
  const parsedDate = new Date(date);
  return parsedDate instanceof Date && !isNaN(parsedDate);
};

/**
 * Validate URL
 * @param {string} url - URL to validate
 * @returns {boolean} True if URL is valid
 */
export const isValidUrl = (url) => {
  if (!url) return false;
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

/**
 * Validate required field
 * @param {*} value - Value to validate
 * @returns {boolean} True if value is not empty
 */
export const isRequired = (value) => {
  if (value === undefined || value === null) return false;
  if (typeof value === 'string') return value.trim().length > 0;
  if (Array.isArray(value)) return value.length > 0;
  return true;
}; 