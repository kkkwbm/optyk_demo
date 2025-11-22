import { useState, useCallback, useMemo } from 'react';
import { PAGINATION } from '../constants';

/**
 * Pagination logic hook
 * Manages pagination state and provides helper functions
 *
 * @param {Object} options - Configuration options
 * @returns {Object} - Pagination state and controls
 */
export const usePagination = (options = {}) => {
  const {
    initialPage = PAGINATION.DEFAULT_PAGE,
    initialSize = PAGINATION.DEFAULT_SIZE,
    onPageChange,
    onSizeChange,
  } = options;

  const [page, setPage] = useState(initialPage);
  const [size, setSize] = useState(initialSize);
  const [totalElements, setTotalElements] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  // Handle page change
  const handlePageChange = useCallback(
    (newPage) => {
      setPage(newPage);
      if (onPageChange) {
        onPageChange(newPage);
      }
    },
    [onPageChange]
  );

  // Handle size change
  const handleSizeChange = useCallback(
    (newSize) => {
      setSize(newSize);
      setPage(0); // Reset to first page when size changes
      if (onSizeChange) {
        onSizeChange(newSize);
      }
    },
    [onSizeChange]
  );

  // Go to next page
  const nextPage = useCallback(() => {
    if (page < totalPages - 1) {
      handlePageChange(page + 1);
    }
  }, [page, totalPages, handlePageChange]);

  // Go to previous page
  const previousPage = useCallback(() => {
    if (page > 0) {
      handlePageChange(page - 1);
    }
  }, [page, handlePageChange]);

  // Go to first page
  const firstPage = useCallback(() => {
    handlePageChange(0);
  }, [handlePageChange]);

  // Go to last page
  const lastPage = useCallback(() => {
    if (totalPages > 0) {
      handlePageChange(totalPages - 1);
    }
  }, [totalPages, handlePageChange]);

  // Update pagination metadata from API response
  const updatePagination = useCallback((paginationData) => {
    if (paginationData) {
      if (paginationData.page !== undefined) setPage(paginationData.page);
      if (paginationData.size !== undefined) setSize(paginationData.size);
      if (paginationData.totalElements !== undefined) setTotalElements(paginationData.totalElements);
      if (paginationData.totalPages !== undefined) setTotalPages(paginationData.totalPages);
    }
  }, []);

  // Reset pagination to initial state
  const resetPagination = useCallback(() => {
    setPage(initialPage);
    setSize(initialSize);
    setTotalElements(0);
    setTotalPages(0);
  }, [initialPage, initialSize]);

  // Check if there is a next page
  const hasNextPage = useMemo(() => page < totalPages - 1, [page, totalPages]);

  // Check if there is a previous page
  const hasPreviousPage = useMemo(() => page > 0, [page]);

  // Calculate current range
  const currentRange = useMemo(() => {
    const start = page * size + 1;
    const end = Math.min((page + 1) * size, totalElements);
    return { start, end };
  }, [page, size, totalElements]);

  // Get query params for API calls
  const getQueryParams = useCallback(() => {
    return { page, size };
  }, [page, size]);

  return {
    // State
    page,
    size,
    totalElements,
    totalPages,
    hasNextPage,
    hasPreviousPage,
    currentRange,

    // Actions
    setPage: handlePageChange,
    setSize: handleSizeChange,
    nextPage,
    previousPage,
    firstPage,
    lastPage,
    updatePagination,
    resetPagination,
    getQueryParams,
  };
};

export default usePagination;
