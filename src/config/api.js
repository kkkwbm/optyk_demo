import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api/v1';

/**
 * In-memory storage for access token
 * This prevents XSS attacks from stealing the token
 * Token is lost on page reload, but refresh token in httpOnly cookie allows re-authentication
 */
import { jwtDecode } from 'jwt-decode';

/**
 * In-memory storage for access token
 */
let inMemoryAccessToken = null;
let expirationTimer = null;
let logoutCallback = null;

export const tokenManager = {
  getAccessToken: () => inMemoryAccessToken,

  setAccessToken: (token) => {
    inMemoryAccessToken = token;
    tokenManager.setTokenExpirationTimer(token);
  },

  clearAccessToken: () => {
    inMemoryAccessToken = null;
    if (expirationTimer) {
      clearTimeout(expirationTimer);
      expirationTimer = null;
    }
  },

  /**
   * Registers a callback function to be called when the token expires
   * This handles the circular dependency issue by allowing App.jsx or main.jsx 
   * to inject the Redux dispatch(logout()) action.
   */
  setupTokenExpirationHandlers: (callback) => {
    logoutCallback = callback;
  },

  /**
   * Sets a timer to automatically log out when the token expires
   */
  setTokenExpirationTimer: (token) => {
    if (!token) return;

    try {
      // Clear existing timer
      if (expirationTimer) {
        clearTimeout(expirationTimer);
        expirationTimer = null;
      }

      const decoded = jwtDecode(token);

      if (!decoded.exp) return;

      // Calculate time until expiration (in ms)
      // exp is in seconds, so multiply by 1000
      const currentTime = Date.now();
      const expirationTime = decoded.exp * 1000;
      const timeUntilExpiration = expirationTime - currentTime;

      // If token is already expired or expires very soon, logout immediately
      // Adding a small buffer (e.g., 1000ms) to ensure server also considers it expired
      if (timeUntilExpiration <= 0) {
        // Run immediately
        if (typeof logoutCallback === 'function') {
          logoutCallback();
        }
        return;
      }

      // Set timeout
      // Cap at 24 hours (just in case of extremely long tokens) to avoid integer overflow issues
      const maxTimeout = 24 * 60 * 60 * 1000;
      const timeoutDuration = Math.min(timeUntilExpiration, maxTimeout);

      expirationTimer = setTimeout(() => {
        if (typeof logoutCallback === 'function') {
          logoutCallback();
        }
      }, timeoutDuration);

    } catch (error) {
      // Error decoding token for expiration timer
    }
  }
};

/**
 * Get CSRF token from cookies
 * Spring Security stores CSRF token in XSRF-TOKEN cookie
 */
function getCsrfTokenFromCookie() {
  const name = 'XSRF-TOKEN=';
  const decodedCookie = decodeURIComponent(document.cookie);
  const cookies = decodedCookie.split(';');

  for (let cookie of cookies) {
    cookie = cookie.trim();
    if (cookie.indexOf(name) === 0) {
      return cookie.substring(name.length);
    }
  }
  return null;
}

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // Enable credentials (cookies) for CSRF and refresh tokens
});

// Request interceptor - Add JWT token and CSRF token to requests
api.interceptors.request.use(
  (config) => {
    // Add JWT Bearer token from memory (not localStorage!)
    const accessToken = tokenManager.getAccessToken();
    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }

    // Add CSRF token for state-changing requests
    if (['post', 'put', 'patch', 'delete'].includes(config.method?.toLowerCase())) {
      const csrfToken = getCsrfTokenFromCookie();
      if (csrfToken) {
        config.headers['X-XSRF-TOKEN'] = csrfToken;
      }
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor - Handle token refresh
api.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    // Don't log errors if request was marked as silent (e.g., initial auth check)
    const isSilent = originalRequest.silent;

    // Don't retry on rate limit errors - just fail
    if (error.response?.status === 429) {
      return Promise.reject(error);
    }

    // Don't try to refresh if the failed request was already a refresh request or a login request
    // This prevents infinite loops and duplicate refresh attempts, and prevents refresh errors from overwriting login errors
    const isRefreshRequest = originalRequest.url?.includes('/auth/refresh');
    const isLoginRequest = originalRequest.url?.includes('/auth/login');

    // If error is 401 and we haven't retried yet and it's not a refresh/login request
    if (error.response?.status === 401 && !originalRequest._retry && !isRefreshRequest && !isLoginRequest) {
      originalRequest._retry = true;

      try {
        // Attempt to refresh the token using httpOnly cookie
        // No need to send refresh token in body - it's in the cookie!
        const response = await axios.post(
          `${API_BASE_URL}/auth/refresh`,
          {}, // Empty body - refresh token is in httpOnly cookie
          { withCredentials: true } // Important: send cookies
        );

        if (response.data.success) {
          const { accessToken: newAccessToken } = response.data.data;

          // Store new access token in memory
          tokenManager.setAccessToken(newAccessToken);

          // Update the original request with new token
          originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;

          // Retry the original request
          return api(originalRequest);
        }
      } catch (refreshError) {
        // Don't redirect if rate limited
        if (refreshError.response?.status === 429) {
          return Promise.reject(refreshError);
        }

        // Refresh failed, clear tokens and redirect to login
        tokenManager.clearAccessToken();

        // Only redirect if not already on login page and not a silent request
        if (!isSilent && !window.location.pathname.includes('/login')) {
          window.location.href = '/login';
        }
        return Promise.reject(refreshError);
      }
    }

    // Suppress error logging for silent requests
    if (isSilent && error.response?.status === 401) {
      // Silently reject without logging
      return Promise.reject({ ...error, silent: true });
    }

    return Promise.reject(error);
  }
);

export default api;
