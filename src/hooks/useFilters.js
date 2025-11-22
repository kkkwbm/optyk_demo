import { useState, useCallback, useMemo } from 'react';

/**
 * Filter management hook
 * Manages filter state and provides helper functions
 *
 * @param {Object} initialFilters - Initial filter values
 * @param {Function} onFilterChange - Callback when filters change
 * @returns {Object} - Filter state and controls
 */
export const useFilters = (initialFilters = {}, onFilterChange) => {
  const [filters, setFilters] = useState(initialFilters);

  // Update a single filter
  const setFilter = useCallback(
    (key, value) => {
      setFilters((prev) => {
        const newFilters = { ...prev, [key]: value };
        if (onFilterChange) {
          onFilterChange(newFilters);
        }
        return newFilters;
      });
    },
    [onFilterChange]
  );

  // Update multiple filters at once
  const setMultipleFilters = useCallback(
    (newFilters) => {
      setFilters((prev) => {
        const updated = { ...prev, ...newFilters };
        if (onFilterChange) {
          onFilterChange(updated);
        }
        return updated;
      });
    },
    [onFilterChange]
  );

  // Reset filters to initial state
  const resetFilters = useCallback(() => {
    setFilters(initialFilters);
    if (onFilterChange) {
      onFilterChange(initialFilters);
    }
  }, [initialFilters, onFilterChange]);

  // Clear all filters (set to empty/null values)
  const clearFilters = useCallback(() => {
    const clearedFilters = Object.keys(filters).reduce((acc, key) => {
      acc[key] = null;
      return acc;
    }, {});
    setFilters(clearedFilters);
    if (onFilterChange) {
      onFilterChange(clearedFilters);
    }
  }, [filters, onFilterChange]);

  // Remove a specific filter
  const removeFilter = useCallback(
    (key) => {
      setFilters((prev) => {
        const { [key]: removed, ...rest } = prev;
        if (onFilterChange) {
          onFilterChange(rest);
        }
        return rest;
      });
    },
    [onFilterChange]
  );

  // Check if any filters are active (non-null, non-empty)
  const hasActiveFilters = useMemo(() => {
    return Object.values(filters).some((value) => {
      if (value === null || value === undefined) return false;
      if (typeof value === 'string') return value.trim() !== '';
      if (Array.isArray(value)) return value.length > 0;
      return true;
    });
  }, [filters]);

  // Count active filters
  const activeFilterCount = useMemo(() => {
    return Object.values(filters).filter((value) => {
      if (value === null || value === undefined) return false;
      if (typeof value === 'string') return value.trim() !== '';
      if (Array.isArray(value)) return value.length > 0;
      return true;
    }).length;
  }, [filters]);

  // Get query params (filters with non-empty values)
  const getQueryParams = useCallback(() => {
    return Object.entries(filters).reduce((acc, [key, value]) => {
      if (value !== null && value !== undefined) {
        if (typeof value === 'string' && value.trim() === '') {
          return acc;
        }
        if (Array.isArray(value) && value.length === 0) {
          return acc;
        }
        acc[key] = value;
      }
      return acc;
    }, {});
  }, [filters]);

  // Get a specific filter value
  const getFilter = useCallback(
    (key) => {
      return filters[key];
    },
    [filters]
  );

  return {
    // State
    filters,
    hasActiveFilters,
    activeFilterCount,

    // Actions
    setFilter,
    setMultipleFilters,
    resetFilters,
    clearFilters,
    removeFilter,
    getFilter,
    getQueryParams,
  };
};

export default useFilters;
