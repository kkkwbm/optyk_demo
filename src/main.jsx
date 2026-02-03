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
    onUnhandledRequest: 'warn', // Warn about unhandled requests so we can add missing handlers
    quiet: false // Show MSW logs for debugging
  });

  createRoot(document.getElementById('root')).render(
    <StrictMode>
      <App />
    </StrictMode>,
  );
}

startApp();
