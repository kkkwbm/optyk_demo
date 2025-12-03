import { format as dateFnsFormat } from 'date-fns';
import { pl } from 'date-fns/locale';

/**
 * Format date with Polish locale
 * @param {Date|string|number} date - Date to format
 * @param {string} formatStr - Format string (e.g., 'dd.MM.yyyy HH:mm')
 * @returns {string} Formatted date string in Polish
 */
export const formatDate = (date, formatStr) => {
  if (!date) return '';

  try {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return dateFnsFormat(dateObj, formatStr, { locale: pl });
  } catch (error) {
    console.error('Error formatting date:', error);
    return '';
  }
};

export default formatDate;
