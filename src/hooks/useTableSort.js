import { useState, useCallback, useMemo } from 'react';
import { SORT_DIRECTIONS } from '../constants';

/**
 * Table sorting hook
 * Manages table sort state and provides helper functions
 *
 * @param {Object} options - Configuration options
 * @returns {Object} - Sort state and controls
 */
export const useTableSort = (options = {}) => {
  const {
    initialSortBy = null,
    initialSortDirection = SORT_DIRECTIONS.ASC,
    onSortChange,
  } = options;

  const [sortBy, setSortBy] = useState(initialSortBy);
  const [sortDirection, setSortDirection] = useState(initialSortDirection);

  // Handle sort change
  const handleSort = useCallback(
    (column) => {
      let newDirection = SORT_DIRECTIONS.ASC;

      // If clicking the same column, toggle direction
      if (sortBy === column) {
        newDirection =
          sortDirection === SORT_DIRECTIONS.ASC
            ? SORT_DIRECTIONS.DESC
            : SORT_DIRECTIONS.ASC;
      }

      setSortBy(column);
      setSortDirection(newDirection);

      if (onSortChange) {
        onSortChange(column, newDirection);
      }
    },
    [sortBy, sortDirection, onSortChange]
  );

  // Set sort with specific direction
  const setSortWithDirection = useCallback(
    (column, direction) => {
      setSortBy(column);
      setSortDirection(direction);

      if (onSortChange) {
        onSortChange(column, direction);
      }
    },
    [onSortChange]
  );

  // Reset sort to initial state
  const resetSort = useCallback(() => {
    setSortBy(initialSortBy);
    setSortDirection(initialSortDirection);

    if (onSortChange) {
      onSortChange(initialSortBy, initialSortDirection);
    }
  }, [initialSortBy, initialSortDirection, onSortChange]);

  // Clear sort
  const clearSort = useCallback(() => {
    setSortBy(null);
    setSortDirection(SORT_DIRECTIONS.ASC);

    if (onSortChange) {
      onSortChange(null, SORT_DIRECTIONS.ASC);
    }
  }, [onSortChange]);

  // Check if a column is currently sorted
  const isSorted = useCallback(
    (column) => {
      return sortBy === column;
    },
    [sortBy]
  );

  // Get sort direction for a column
  const getSortDirection = useCallback(
    (column) => {
      return sortBy === column ? sortDirection : null;
    },
    [sortBy, sortDirection]
  );

  // Get sort icon for a column (up/down arrow)
  const getSortIcon = useCallback(
    (column) => {
      if (sortBy !== column) return null;
      return sortDirection === SORT_DIRECTIONS.ASC ? 'asc' : 'desc';
    },
    [sortBy, sortDirection]
  );

  // Get query params for API calls
  const getQueryParams = useCallback(() => {
    if (!sortBy) return {};
    return {
      sort: `${sortBy},${sortDirection}`,
    };
  }, [sortBy, sortDirection]);

  // Get query params as separate fields
  const getQueryParamsSeparate = useCallback(() => {
    if (!sortBy) return {};
    return {
      sortBy,
      sortDirection,
    };
  }, [sortBy, sortDirection]);

  // Check if sorting is active
  const hasSorting = useMemo(() => sortBy !== null, [sortBy]);

  // Sort data locally (client-side sorting)
  const sortData = useCallback(
    (data, accessor) => {
      if (!sortBy || !data) return data;

      const sorted = [...data].sort((a, b) => {
        const aValue = accessor ? accessor(a, sortBy) : a[sortBy];
        const bValue = accessor ? accessor(b, sortBy) : b[sortBy];

        // Handle null/undefined values
        if (aValue == null && bValue == null) return 0;
        if (aValue == null) return 1;
        if (bValue == null) return -1;

        // Handle strings
        if (typeof aValue === 'string' && typeof bValue === 'string') {
          const comparison = aValue.localeCompare(bValue);
          return sortDirection === SORT_DIRECTIONS.ASC ? comparison : -comparison;
        }

        // Handle numbers and dates
        if (aValue < bValue) {
          return sortDirection === SORT_DIRECTIONS.ASC ? -1 : 1;
        }
        if (aValue > bValue) {
          return sortDirection === SORT_DIRECTIONS.ASC ? 1 : -1;
        }
        return 0;
      });

      return sorted;
    },
    [sortBy, sortDirection]
  );

  return {
    // State
    sortBy,
    sortDirection,
    hasSorting,

    // Actions
    handleSort,
    setSortWithDirection,
    resetSort,
    clearSort,

    // Helpers
    isSorted,
    getSortDirection,
    getSortIcon,
    getQueryParams,
    getQueryParamsSeparate,
    sortData,
  };
};

export default useTableSort;
