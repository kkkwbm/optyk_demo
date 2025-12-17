import { useEffect, useMemo } from 'react';
import { RouterProvider } from 'react-router-dom';
import { Provider, useSelector, useDispatch } from 'react-redux';
import { Toaster, ToastBar, toast } from 'react-hot-toast';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import router from './app/router';
import store from './app/store';
import { createAppTheme } from './shared/styles/theme';
import ErrorBoundary from './shared/components/ErrorBoundary';
import { createAriaLiveAnnouncer } from './utils/accessibility';
import { selectTheme, setTheme } from './app/uiSlice';
import { initializeAuth, selectUser, logout } from './features/auth/authSlice';
import { initializeCurrentLocation } from './features/locations/locationsSlice';
import { tokenManager } from './config/api';

function ThemedApp() {
  const dispatch = useDispatch();
  const themeMode = useSelector(selectTheme);
  const user = useSelector(selectUser);
  const theme = useMemo(() => createAppTheme(themeMode), [themeMode]);

  useEffect(() => {
    // Initialize ARIA live announcer for accessibility
    createAriaLiveAnnouncer();

    // Initialize current location
    dispatch(initializeCurrentLocation());

    // Register active logout handler
    tokenManager.setupTokenExpirationHandlers(() => {
      dispatch(logout());
    });

    // Initialize authentication (try to restore session)
    // Only try once - don't retry on failure to avoid infinite loops
    dispatch(initializeAuth()).catch(() => {
      // Silently fail - user will be redirected to login if needed
    });
  }, [dispatch]);

  // Apply user's theme preference from database after authentication
  useEffect(() => {
    if (user?.themePreference && user.themePreference !== themeMode) {
      dispatch(setTheme(user.themePreference));
    }
  }, [user, dispatch, themeMode]);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <RouterProvider router={router} />
      <Toaster
        position="top-right"
        reverseOrder={false}
      >
        {(t) => (
          <ToastBar toast={t}>
            {({ icon, message }) => (
              <>
                {icon}
                {message}
                {t.type !== 'loading' && (
                  <button
                    onClick={() => toast.dismiss(t.id)}
                    style={{
                      border: 'none',
                      background: 'transparent',
                      cursor: 'pointer',
                      marginLeft: '8px',
                      padding: '0 4px',
                      fontSize: '16px',
                      color: '#666',
                    }}
                  >
                    ✕
                  </button>
                )}
              </>
            )}
          </ToastBar>
        )}
      </Toaster>
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
