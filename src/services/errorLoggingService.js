/**
 * Error Logging Service
 *
 * Centralized error logging that can be configured to send errors to:
 * - Console (development)
 * - Backend API (production)
 * - External services like Sentry, LogRocket, etc. (future enhancement)
 */

import api from '../config/api';

class ErrorLoggingService {
  constructor() {
    this.isProduction = import.meta.env.MODE === 'production';
    this.isDevelopment = import.meta.env.MODE === 'development';
  }

  /**
   * Log error to appropriate destination based on environment
   * @param {Error} error - The error object
   * @param {Object} errorInfo - Additional error information (React error boundary info)
   * @param {Object} context - Additional context (user info, location, etc.)
   */
  logError(error, errorInfo = null, context = {}) {
    const errorData = this.formatError(error, errorInfo, context);

    // Always log to console in development
    if (this.isDevelopment) {
      console.error('Error logged:', errorData);
    }

    // In production, send to backend API for logging
    if (this.isProduction) {
      this.sendToBackend(errorData);
    }

    // Future: Add integration with external services
    // this.sendToSentry(errorData);
    // this.sendToLogRocket(errorData);
  }

  /**
   * Format error data for logging
   */
  formatError(error, errorInfo, context) {
    return {
      message: error.message || 'Unknown error',
      stack: error.stack || null,
      componentStack: errorInfo?.componentStack || null,
      timestamp: new Date().toISOString(),
      url: window.location.href,
      userAgent: navigator.userAgent,
      context: {
        ...context,
        windowSize: {
          width: window.innerWidth,
          height: window.innerHeight,
        },
      },
    };
  }

  /**
   * Send error to backend API
   */
  async sendToBackend(errorData) {
    try {
      // Create a lightweight error log endpoint call
      // This won't throw errors to avoid infinite error loops
      await api.post('/logs/client-errors', errorData, {
        timeout: 5000, // 5 second timeout
      }).catch(() => {
        // Silently fail - we don't want logging errors to cause more errors
        console.warn('Failed to send error to backend');
      });
    } catch {
      // Silently fail - no need to use the error variable
    }
  }

  /**
   * Log a warning (non-critical issue)
   */
  logWarning(message, context = {}) {
    const warningData = {
      level: 'warning',
      message,
      timestamp: new Date().toISOString(),
      url: window.location.href,
      context,
    };

    if (this.isDevelopment) {
      console.warn('Warning logged:', warningData);
    }

    if (this.isProduction) {
      this.sendToBackend(warningData);
    }
  }

  /**
   * Log an info message (for tracking user actions, etc.)
   */
  logInfo(message, context = {}) {
    const infoData = {
      level: 'info',
      message,
      timestamp: new Date().toISOString(),
      url: window.location.href,
      context,
    };

    if (this.isDevelopment) {
      console.info('Info logged:', infoData);
    }

    // Only send important info to backend in production
    if (this.isProduction && context.important) {
      this.sendToBackend(infoData);
    }
  }

  /**
   * Future: Integration with Sentry
   */
  // sendToSentry(errorData) {
  //   if (window.Sentry) {
  //     window.Sentry.captureException(new Error(errorData.message), {
  //       extra: errorData,
  //     });
  //   }
  // }

  /**
   * Future: Integration with LogRocket
   */
  // sendToLogRocket(errorData) {
  //   if (window.LogRocket) {
  //     window.LogRocket.captureException(new Error(errorData.message), {
  //       extra: errorData,
  //     });
  //   }
  // }
}

// Export singleton instance
const errorLoggingService = new ErrorLoggingService();
export default errorLoggingService;
