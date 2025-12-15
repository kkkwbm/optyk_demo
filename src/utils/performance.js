/**
 * Performance utilities
 * Helpers for optimization and performance monitoring
 */

// Debounce function
export const debounce = (func, wait = 300) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

// Throttle function
export const throttle = (func, limit = 300) => {
  let inThrottle;
  return function executedFunction(...args) {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => {
        inThrottle = false;
      }, limit);
    }
  };
};

// Lazy load image helper
export const lazyLoadImage = (src, placeholder = '/placeholder.png') => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.src = src;
    img.onload = () => resolve(src);
    img.onerror = () => resolve(placeholder);
  });
};

// Check if reduced motion is preferred
export const prefersReducedMotion = () => {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
};

// Measure performance of a function
export const measurePerformance = async (name, func) => {
  const startTime = performance.now();
  const result = await func();
  const endTime = performance.now();
  const duration = endTime - startTime;

  if (process.env.NODE_ENV === 'development') {
  }

  return { result, duration };
};

// Batch updates helper (for React 18+)
export const batchUpdates = (callback) => {
  // In React 18, batching is automatic, but this can be used for explicit batching
  // if needed in specific scenarios
  requestAnimationFrame(() => {
    callback();
  });
};

// Virtual scroll helper - calculate visible items
export const calculateVisibleItems = (scrollTop, itemHeight, containerHeight, totalItems) => {
  const visibleStart = Math.floor(scrollTop / itemHeight);
  const visibleEnd = Math.min(
    Math.ceil((scrollTop + containerHeight) / itemHeight),
    totalItems
  );

  return {
    start: Math.max(0, visibleStart - 2), // Add buffer
    end: Math.min(totalItems, visibleEnd + 2), // Add buffer
  };
};

// Local storage with size tracking
export const storage = {
  set: (key, value) => {
    try {
      const serialized = JSON.stringify(value);
      localStorage.setItem(key, serialized);
      return true;
    } catch (error) {
      return false;
    }
  },

  get: (key, defaultValue = null) => {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : defaultValue;
    } catch (error) {
      return defaultValue;
    }
  },

  remove: (key) => {
    try {
      localStorage.removeItem(key);
      return true;
    } catch (error) {
      return false;
    }
  },

  clear: () => {
    try {
      localStorage.clear();
      return true;
    } catch (error) {
      return false;
    }
  },

  getSize: () => {
    let size = 0;
    for (const key in localStorage) {
      if (localStorage.hasOwnProperty(key)) {
        size += localStorage[key].length + key.length;
      }
    }
    return (size / 1024).toFixed(2) + ' KB';
  },
};

// Session storage wrapper
export const sessionStorage = {
  set: (key, value) => {
    try {
      const serialized = JSON.stringify(value);
      window.sessionStorage.setItem(key, serialized);
      return true;
    } catch (error) {
      return false;
    }
  },

  get: (key, defaultValue = null) => {
    try {
      const item = window.sessionStorage.getItem(key);
      return item ? JSON.parse(item) : defaultValue;
    } catch (error) {
      return defaultValue;
    }
  },

  remove: (key) => {
    try {
      window.sessionStorage.removeItem(key);
      return true;
    } catch (error) {
      return false;
    }
  },

  clear: () => {
    try {
      window.sessionStorage.clear();
      return true;
    } catch (error) {
      return false;
    }
  },
};

// Memoization helper
export const memoize = (fn) => {
  const cache = new Map();

  return (...args) => {
    const key = JSON.stringify(args);

    if (cache.has(key)) {
      return cache.get(key);
    }

    const result = fn(...args);
    cache.set(key, result);

    // Limit cache size
    if (cache.size > 100) {
      const firstKey = cache.keys().next().value;
      cache.delete(firstKey);
    }

    return result;
  };
};

// Request idle callback wrapper (with fallback)
export const requestIdleCallback =
  window.requestIdleCallback ||
  function (callback) {
    const start = Date.now();
    return setTimeout(() => {
      callback({
        didTimeout: false,
        timeRemaining: () => Math.max(0, 50 - (Date.now() - start)),
      });
    }, 1);
  };

// Cancel idle callback wrapper
export const cancelIdleCallback =
  window.cancelIdleCallback ||
  function (id) {
    clearTimeout(id);
  };

// Image optimization helper
export const optimizeImageUrl = (url, options = {}) => {
  const { width, height, quality = 80, format = 'webp' } = options;

  // This is a placeholder - in production, you'd use a service like Cloudinary, Imgix, etc.
  // For now, just return the original URL
  // Example with query params: return `${url}?w=${width}&h=${height}&q=${quality}&f=${format}`;

  return url;
};

// Check if element is visible (Intersection Observer)
export const observeVisibility = (element, callback, options = {}) => {
  const { threshold = 0.1, rootMargin = '0px' } = options;

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        callback(entry.isIntersecting, entry);
      });
    },
    { threshold, rootMargin }
  );

  observer.observe(element);

  return () => observer.disconnect();
};

export default {
  debounce,
  throttle,
  lazyLoadImage,
  prefersReducedMotion,
  measurePerformance,
  batchUpdates,
  calculateVisibleItems,
  storage,
  sessionStorage,
  memoize,
  requestIdleCallback,
  cancelIdleCallback,
  optimizeImageUrl,
  observeVisibility,
};
