import { useState, useEffect, useCallback, useRef } from 'react';
import { inventoryService } from '../services/inventoryService';
import { useDebounce } from './useDebounce';

// Configuration constants
const CONFIG = {
  DEFAULT_DEBOUNCE_DELAY: 300,
  DEFAULT_PAGE_SIZE: 50,
  REQUEST_TIMEOUT: 10000, // 10 seconds
  MAX_RETRIES: 2,
  RETRY_DELAY: 500,
};

/**
 * Hook for server-side inventory search with debounce
 * Optimized for large datasets (2000+ products)
 *
 * @param {Object} options - Configuration options
 * @param {string} options.locationId - Location ID to search in
 * @param {string} options.productType - Product type filter (FRAME, CONTACT_LENS, etc.)
 * @param {number} options.debounceDelay - Debounce delay in ms (default: 300)
 * @param {number} options.pageSize - Number of results to fetch (default: 50)
 * @param {number} options.minSearchLength - Minimum search length to trigger search (default: 0)
 * @returns {Object} - Search state and handlers
 */
export const useInventorySearch = ({
  locationId,
  productType,
  debounceDelay = CONFIG.DEFAULT_DEBOUNCE_DELAY,
  pageSize = CONFIG.DEFAULT_PAGE_SIZE,
  minSearchLength = 0,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [results, setResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [hasMore, setHasMore] = useState(false);
  const [totalCount, setTotalCount] = useState(0);

  // Abort controller for cancelling pending requests
  const abortControllerRef = useRef(null);
  const retryCountRef = useRef(0);
  const timeoutRef = useRef(null);

  // Debounce the search query
  const debouncedQuery = useDebounce(searchQuery, debounceDelay);

  // Cache for initial load (no search query)
  const initialDataRef = useRef(null);
  const lastParamsRef = useRef({ locationId: null, productType: null });

  // Clean up timeout
  const clearRequestTimeout = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  }, []);

  // Fetch inventory data with retry logic
  const fetchInventory = useCallback(async (query = '', isRetry = false) => {
    if (!locationId) {
      setResults([]);
      setTotalCount(0);
      return;
    }

    // Check if we should use cached initial data
    const isSameParams = lastParamsRef.current.locationId === locationId &&
                         lastParamsRef.current.productType === productType;

    if (!query && isSameParams && initialDataRef.current && !isRetry) {
      setResults(initialDataRef.current.results);
      setTotalCount(initialDataRef.current.totalCount);
      setHasMore(initialDataRef.current.hasMore);
      return;
    }

    // Cancel any pending request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    clearRequestTimeout();

    // Create new abort controller
    abortControllerRef.current = new AbortController();

    // Set up request timeout
    timeoutRef.current = setTimeout(() => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
        setError('Przekroczono limit czasu żądania. Spróbuj ponownie.');
        setIsLoading(false);
      }
    }, CONFIG.REQUEST_TIMEOUT);

    if (!isRetry) {
      setIsLoading(true);
      setError(null);
      retryCountRef.current = 0;
    }

    try {
      const params = {
        page: 0,
        size: pageSize,
        sortBy: 'createdAt',
        sortDirection: 'desc',
      };

      // Add search parameter if query exists
      if (query && query.length >= minSearchLength) {
        params.search = query.trim();
      }

      // Add product type filter
      if (productType) {
        params.productType = productType;
      }

      const response = await inventoryService.getInventory(locationId, params);

      clearRequestTimeout();

      // Check if request was aborted
      if (abortControllerRef.current?.signal.aborted) {
        return;
      }

      const data = response.data?.data || response.data;
      const content = data?.content || [];
      const total = data?.totalElements || content.length;
      const hasMoreResults = data?.totalPages > 1;

      // Filter only items with available quantity > 0 (items that can be sold/transferred)
      const availableItems = content.filter(item =>
        item.product && item.availableQuantity > 0
      );

      setResults(availableItems);
      setTotalCount(total);
      setHasMore(hasMoreResults);
      setError(null);
      retryCountRef.current = 0;

      // Cache initial data (no search query)
      if (!query) {
        initialDataRef.current = {
          results: availableItems,
          totalCount: total,
          hasMore: hasMoreResults,
        };
        lastParamsRef.current = { locationId, productType };
      }
    } catch (err) {
      clearRequestTimeout();

      // Don't set error for aborted requests
      if (err.name === 'AbortError' || err.name === 'CanceledError') {
        return;
      }

      console.error('Inventory search error:', err);

      // Retry logic for network errors
      if (retryCountRef.current < CONFIG.MAX_RETRIES) {
        retryCountRef.current += 1;
        console.log(`Retrying request (${retryCountRef.current}/${CONFIG.MAX_RETRIES})...`);

        setTimeout(() => {
          fetchInventory(query, true);
        }, CONFIG.RETRY_DELAY * retryCountRef.current);
        return;
      }

      // Set user-friendly error message
      let errorMessage = 'Nie udało się pobrać produktów.';
      if (err.response?.status === 404) {
        errorMessage = 'Nie znaleziono lokalizacji.';
      } else if (err.response?.status === 403) {
        errorMessage = 'Brak uprawnień do tej lokalizacji.';
      } else if (err.code === 'ECONNABORTED' || err.message?.includes('timeout')) {
        errorMessage = 'Przekroczono limit czasu żądania.';
      } else if (!navigator.onLine) {
        errorMessage = 'Brak połączenia z internetem.';
      }

      setError(errorMessage);
      setResults([]);
    } finally {
      setIsLoading(false);
    }
  }, [locationId, productType, pageSize, minSearchLength, clearRequestTimeout]);

  // Fetch on debounced query change
  useEffect(() => {
    fetchInventory(debouncedQuery);
  }, [debouncedQuery, fetchInventory]);

  // Refetch when location or product type changes
  useEffect(() => {
    // Clear cache when params change
    if (lastParamsRef.current.locationId !== locationId ||
        lastParamsRef.current.productType !== productType) {
      initialDataRef.current = null;
      setSearchQuery('');
      fetchInventory('');
    }
  }, [locationId, productType, fetchInventory]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  // Clear search
  const clearSearch = useCallback(() => {
    setSearchQuery('');
  }, []);

  // Refresh data
  const refresh = useCallback(() => {
    initialDataRef.current = null;
    fetchInventory(searchQuery);
  }, [fetchInventory, searchQuery]);

  return {
    searchQuery,
    setSearchQuery,
    results,
    isLoading,
    error,
    hasMore,
    totalCount,
    clearSearch,
    refresh,
    // Indicates if currently debouncing (user is typing)
    isDebouncing: searchQuery !== debouncedQuery,
  };
};

/**
 * Helper function to build product label based on product type
 * Extracted for reuse across components
 */
export const buildProductLabel = (item, productType) => {
  const product = item.product || item;
  const brand = product.brand?.name || '';
  const stock = item.availableQuantity ?? item.quantity ?? 0;
  const stockSuffix = ` (${stock} szt.)`;

  switch (productType) {
    case 'FRAME':
    case 'SUNGLASSES':
      return `${brand} ${product.model || ''} - ${product.size || ''} - ${product.color || ''}`.trim() + stockSuffix;

    case 'CONTACT_LENS': {
      const lensTypeLabels = {
        DAILY: 'Jednodniowe',
        BI_WEEKLY: 'Dwutygodniowe',
        MONTHLY: 'Miesięczne',
      };
      const lensType = lensTypeLabels[product.lensType] || product.lensType || '';
      return `${brand} ${product.model || ''} - ${lensType} - ${product.power || ''}`.trim() + stockSuffix;
    }

    case 'SOLUTION':
      return `${brand} - ${product.volume || product.capacity || ''} ml`.trim() + stockSuffix;

    case 'OTHER':
    default:
      return `${brand} ${product.model || product.name || ''}`.trim() + stockSuffix;
  }
};

/**
 * Helper function to format product details for display
 */
export const formatProductDetails = (product, productType) => {
  const getLensTypeLabel = (type) => {
    switch (type) {
      case 'DAILY': return 'Jednodniowe';
      case 'BI_WEEKLY': return 'Dwutygodniowe';
      case 'MONTHLY': return 'Miesięczne';
      default: return type || '';
    }
  };

  switch (productType) {
    case 'FRAME':
    case 'SUNGLASSES':
      return `Rozmiar: ${product.size || '-'}, Kolor: ${product.color || '-'}`;

    case 'CONTACT_LENS':
      return `Typ: ${getLensTypeLabel(product.lensType) || '-'}, Moc: ${product.power || '-'}`;

    case 'SOLUTION':
      return `Pojemność: ${product.volume || product.capacity || '-'} (ml)`;

    case 'OTHER':
    default:
      return product.notes || '-';
  }
};

export default useInventorySearch;
