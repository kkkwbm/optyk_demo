import { useState, useEffect, useCallback, useRef } from 'react';
import { DEBOUNCE_DELAYS } from '../constants';

/**
 * Debounce hook
 * Delays updating a value until after a specified delay
 *
 * @param {any} value - The value to debounce
 * @param {number} delay - Delay in milliseconds
 * @returns {any} - Debounced value
 */
export const useDebounce = (value, delay = DEBOUNCE_DELAYS.INPUT) => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
};

/**
 * Debounced callback hook
 * Creates a debounced version of a callback function
 *
 * @param {Function} callback - The function to debounce
 * @param {number} delay - Delay in milliseconds
 * @param {Array} dependencies - Dependencies array
 * @returns {Function} - Debounced callback
 */
export const useDebouncedCallback = (callback, delay = DEBOUNCE_DELAYS.INPUT, dependencies = []) => {
  const timeoutRef = useRef(null);

  const debouncedCallback = useCallback(
    (...args) => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      timeoutRef.current = setTimeout(() => {
        callback(...args);
      }, delay);
    },
    [callback, delay, ...dependencies]
  );

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  // Cancel function to clear pending debounce
  const cancel = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
  }, []);

  // Immediate execution function
  const flush = useCallback(
    (...args) => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      callback(...args);
    },
    [callback]
  );

  return Object.assign(debouncedCallback, { cancel, flush });
};

/**
 * Debounced search hook
 * Specifically designed for search inputs
 *
 * @param {string} initialValue - Initial search value
 * @param {Function} onSearch - Callback when search is triggered
 * @param {number} delay - Delay in milliseconds
 * @returns {Object} - { searchTerm, setSearchTerm, debouncedSearchTerm, isSearching }
 */
export const useDebouncedSearch = (
  initialValue = '',
  onSearch,
  delay = DEBOUNCE_DELAYS.SEARCH
) => {
  const [searchTerm, setSearchTerm] = useState(initialValue);
  const [isSearching, setIsSearching] = useState(false);
  const debouncedSearchTerm = useDebounce(searchTerm, delay);

  useEffect(() => {
    if (debouncedSearchTerm !== initialValue || debouncedSearchTerm !== '') {
      setIsSearching(true);
      if (onSearch) {
        onSearch(debouncedSearchTerm);
      }
      setIsSearching(false);
    }
  }, [debouncedSearchTerm, onSearch]);

  const clearSearch = useCallback(() => {
    setSearchTerm('');
  }, []);

  return {
    searchTerm,
    setSearchTerm,
    debouncedSearchTerm,
    isSearching,
    clearSearch,
  };
};

export default useDebounce;
