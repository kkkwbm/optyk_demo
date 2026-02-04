import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

// Global error handler for chunk loading errors (catches errors before React/Router)
window.addEventListener('error', (event) => {
  const isChunkLoadError =
    event.message?.includes('Failed to fetch dynamically imported module') ||
    event.message?.includes('Loading chunk') ||
    event.message?.includes('ChunkLoadError');

  if (isChunkLoadError) {
    const hasReloadedForChunkError = sessionStorage.getItem('chunk-error-reload');

    if (!hasReloadedForChunkError) {
      sessionStorage.setItem('chunk-error-reload', 'true');
      window.location.reload();
      event.preventDefault();
    } else {
      // If reload didn't fix it, clear flag and let error display
      sessionStorage.removeItem('chunk-error-reload');
    }
  }
});

// Handle promise rejections for dynamic imports
window.addEventListener('unhandledrejection', (event) => {
  const error = event.reason;
  const isChunkLoadError =
    error?.message?.includes('Failed to fetch dynamically imported module') ||
    error?.message?.includes('Loading chunk') ||
    error?.message?.includes('ChunkLoadError');

  if (isChunkLoadError) {
    const hasReloadedForChunkError = sessionStorage.getItem('chunk-error-reload');

    if (!hasReloadedForChunkError) {
      sessionStorage.setItem('chunk-error-reload', 'true');
      window.location.reload();
      event.preventDefault();
    } else{
      // If reload didn't fix it, clear flag and let error display
      sessionStorage.removeItem('chunk-error-reload');
    }
  }
});

// Start MSW for demo mode, then render the app
async function startApp() {
  // Start Mock Service Worker to intercept API calls
  const { worker } = await import('./mocks/browser');
  await worker.start({
    onUnhandledRequest(request, print) {
      // For demo mode: block ALL unhandled API requests, don't let them reach the network
      const url = new URL(request.url);

      // Allow requests for static assets, fonts, and local resources
      if (
        url.pathname.startsWith('/src/') ||
        url.pathname.startsWith('/node_modules/') ||
        url.pathname.startsWith('/@') ||
        url.pathname.endsWith('.js') ||
        url.pathname.endsWith('.css') ||
        url.pathname.endsWith('.ttf') ||
        url.pathname.endsWith('.woff') ||
        url.pathname.endsWith('.woff2') ||
        url.pathname.endsWith('.png') ||
        url.pathname.endsWith('.svg') ||
        url.pathname.endsWith('.ico') ||
        url.hostname === 'localhost' && !url.pathname.startsWith('/api')
      ) {
        return;
      }

      // Block any API requests that aren't handled - this prevents backend communication
      print.warning();
      console.error(
        `[MSW] Demo mode: Blocked unhandled request to ${request.method} ${request.url}. ` +
        `Add a handler in src/mocks/handlers.js if this endpoint is needed.`
      );
    },
    quiet: true // Quiet mode - no MSW logs in console
  });

  createRoot(document.getElementById('root')).render(
    <StrictMode>
      <App />
    </StrictMode>,
  );
}

startApp();
