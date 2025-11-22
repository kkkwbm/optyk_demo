import { useEffect, useMemo } from 'react';
import { RouterProvider } from 'react-router-dom';
import { Provider, useSelector, useDispatch } from 'react-redux';
import { Toaster } from 'react-hot-toast';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import router from './app/router';
import store from './app/store';
import { createAppTheme } from './shared/styles/theme';
import ErrorBoundary from './shared/components/ErrorBoundary';
import { createAriaLiveAnnouncer } from './utils/accessibility';
import { selectTheme } from './app/uiSlice';
import { initializeAuth } from './features/auth/authSlice';
import { initializeCurrentLocation } from './features/locations/locationsSlice';

function ThemedApp() {
  const dispatch = useDispatch();
  const themeMode = useSelector(selectTheme);
  const theme = useMemo(() => createAppTheme(themeMode), [themeMode]);

  useEffect(() => {
    // Initialize ARIA live announcer for accessibility
    createAriaLiveAnnouncer();

    // Initialize current location
    dispatch(initializeCurrentLocation());

    // Initialize authentication (try to restore session)
    // Only try once - don't retry on failure to avoid infinite loops
    dispatch(initializeAuth()).catch(() => {
      // Silently fail - user will be redirected to login if needed
      console.log('Session restoration failed - user needs to login');
    });
  }, [dispatch]);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <RouterProvider router={router} />
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: themeMode === 'dark' ? '#2e2e2e' : '#363636',
            color: '#fff',
          },
          success: {
            duration: 3000,
            iconTheme: {
              primary: '#4caf50',
              secondary: '#fff',
            },
          },
          error: {
            duration: 5000,
            iconTheme: {
              primary: '#f44336',
              secondary: '#fff',
            },
          },
        }}
      />
    </ThemeProvider>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <Provider store={store}>
        <ThemedApp />
      </Provider>
    </ErrorBoundary>
  );
}

export default App;
