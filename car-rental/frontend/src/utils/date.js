import { format, parseISO, isValid, differenceInDays, addDays, isBefore, isAfter } from 'date-fns';
import { DATE_FORMAT, DATETIME_FORMAT } from '../config/constants';

/**
 * Format date to string
 * @param {Date|string} date - Date to format
 * @param {string} formatStr - Format string
 * @returns {string} Formatted date string
 */
export const formatDate = (date, formatStr = DATE_FORMAT) => {
  if (!date) return '';
  const parsedDate = typeof date === 'string' ? parseISO(date) : date;
  return isValid(parsedDate) ? format(parsedDate, formatStr) : '';
};

/**
 * Format datetime to string
 * @param {Date|string} date - Date to format
 * @returns {string} Formatted datetime string
 */
export const formatDateTime = (date) => formatDate(date, DATETIME_FORMAT);

/**
 * Calculate number of days between two dates
 * @param {Date|string} startDate - Start date
 * @param {Date|string} endDate - End date
 * @returns {number} Number of days
 */
export const calculateDays = (startDate, endDate) => {
  const start = typeof startDate === 'string' ? parseISO(startDate) : startDate;
  const end = typeof endDate === 'string' ? parseISO(endDate) : endDate;
  return differenceInDays(end, start);
};

/**
 * Add days to date
 * @param {Date|string} date - Date to add days to
 * @param {number} days - Number of days to add
 * @returns {Date} New date
 */
export const addDaysToDate = (date, days) => {
  const parsedDate = typeof date === 'string' ? parseISO(date) : date;
  return addDays(parsedDate, days);
};

/**
 * Check if date is before another date
 * @param {Date|string} date - Date to check
 * @param {Date|string} compareDate - Date to compare with
 * @returns {boolean} True if date is before compareDate
 */
export const isDateBefore = (date, compareDate) => {
  const parsedDate = typeof date === 'string' ? parseISO(date) : date;
  const parsedCompareDate = typeof compareDate === 'string' ? parseISO(compareDate) : compareDate;
  return isBefore(parsedDate, parsedCompareDate);
};

/**
 * Check if date is after another date
 * @param {Date|string} date - Date to check
 * @param {Date|string} compareDate - Date to compare with
 * @returns {boolean} True if date is after compareDate
 */
export const isDateAfter = (date, compareDate) => {
  const parsedDate = typeof date === 'string' ? parseISO(date) : date;
  const parsedCompareDate = typeof compareDate === 'string' ? parseISO(compareDate) : compareDate;
  return isAfter(parsedDate, parsedCompareDate);
};

/**
 * Get current date in ISO format
 * @returns {string} Current date in ISO format
 */
export const getCurrentDate = () => new Date().toISOString();

/**
 * Get start of day
 * @param {Date|string} date - Date to get start of day for
 * @returns {Date} Start of day
 */
export const getStartOfDay = (date) => {
  const parsedDate = typeof date === 'string' ? parseISO(date) : date;
  return new Date(parsedDate.setHours(0, 0, 0, 0));
};

/**
 * Get end of day
 * @param {Date|string} date - Date to get end of day for
 * @returns {Date} End of day
 */
export const getEndOfDay = (date) => {
  const parsedDate = typeof date === 'string' ? parseISO(date) : date;
  return new Date(parsedDate.setHours(23, 59, 59, 999));
}; 