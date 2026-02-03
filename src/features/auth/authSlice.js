import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api, { tokenManager } from '../../config/api';

// Async thunks
export const login = createAsyncThunk(
  'auth/login',
  async ({ email, password }, { rejectWithValue }) => {
    try {
      const response = await api.post('/auth/login', { email, password });

      if (response.data.success) {
        const { accessToken, user } = response.data.data;
        // Note: refreshToken is now in httpOnly cookie, not in response

        // Store access token in memory only (not localStorage!)
        tokenManager.setAccessToken(accessToken);

        // Fetch CSRF token after successful login to ensure it's available for subsequent requests
        try {
          await api.get('/auth/csrf');
        } catch (csrfError) {
          // If CSRF fetch fails, don't fail the login
        }

        return { user, accessToken };
      }

      return rejectWithValue(response.data.error || 'Login failed');
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.error || 'Network error. Please try again.'
      );
    }
  }
);

export const logout = createAsyncThunk(
  'auth/logout',
  async (_, { rejectWithValue }) => {
    try {
      await api.post('/auth/logout');
    } catch (error) {
      // Even if logout fails on server, we'll clear local state
    } finally {
      // Clear access token from memory
      tokenManager.clearAccessToken();
      // Refresh token cookie is cleared by backend
    }
  }
);

export const changePassword = createAsyncThunk(
  'auth/changePassword',
  async ({ currentPassword, newPassword, confirmPassword }, { rejectWithValue }) => {
    try {
      const response = await api.post('/auth/change-password', {
        currentPassword,
        newPassword,
        confirmPassword
      });

      if (response.data.success) {
        return response.data.message;
      }

      return rejectWithValue(response.data.error || 'Password change failed');
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.error ||
        error.response?.data?.data ||
        'Nie udało się zmienić hasła'
      );
    }
  }
);

export const getCurrentUser = createAsyncThunk(
  'auth/getCurrentUser',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/auth/me');

      if (response.data.success) {
        return response.data.data;
      }

      return rejectWithValue(response.data.error);
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.error || 'Nie udało się pobrać danych użytkownika'
      );
    }
  }
);

/**
 * Initialize auth state on app load
 * Attempts to refresh token to get new access token
 */
export const initializeAuth = createAsyncThunk(
  'auth/initialize',
  async (_, { rejectWithValue }) => {
    try {
      // Try to refresh using the httpOnly cookie
      // Use silent mode to suppress expected 401 errors
      const response = await api.post('/auth/refresh', {}, {
        silent: true // Custom flag to suppress error logging
      });

      if (response.data.success) {
        const { accessToken, user } = response.data.data;

        // Store new access token in memory
        tokenManager.setAccessToken(accessToken);

        // Get current user data and CSRF token
        const userResponse = await api.get('/auth/me');

        // Fetch CSRF token to ensure it's available for subsequent requests
        try {
          await api.get('/auth/csrf');
        } catch (csrfError) {
          // CSRF token fetch failed
        }

        return {
          accessToken,
          user: userResponse.data.data,
        };
      }

      return rejectWithValue('No valid session');
    } catch (error) {
      // Silently fail - this is expected when user has no session
      return rejectWithValue('Not authenticated');
    }
  }
);

const authSlice = createSlice({
  name: 'auth',
  initialState: {
    user: null,
    accessToken: null, // Now stored in memory only, not localStorage
    isAuthenticated: false,
    isDemo: false, // Demo mode flag
    loading: false,
    initializing: true, // New flag for app initialization
    error: null,
  },
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setUser: (state, action) => {
      state.user = action.payload;
      state.isAuthenticated = true;
    },
    setDemoAuth: (state, action) => {
      const { user, accessToken } = action.payload;
      state.user = user;
      state.accessToken = accessToken;
      state.isAuthenticated = true;
      state.initializing = false;
      state.loading = false;
      state.error = null;
      tokenManager.setAccessToken(accessToken);
    },
    clearAuth: (state) => {
      state.user = null;
      state.accessToken = null;
      state.isAuthenticated = false;
      state.isDemo = false;
      state.error = null;
      tokenManager.clearAccessToken();
    },
    loginAsDemo: (state) => {
      state.user = {
        id: 'demo-user',
        email: 'demo@optyk.pl',
        firstName: 'Demo',
        lastName: 'User',
        role: 'ADMIN',
      };
      state.accessToken = null;
      state.isAuthenticated = true;
      state.isDemo = true;
      state.loading = false;
      state.initializing = false;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Initialize
      .addCase(initializeAuth.pending, (state) => {
        state.initializing = true;
      })
      .addCase(initializeAuth.fulfilled, (state, action) => {
        state.initializing = false;
        state.isAuthenticated = true;
        state.user = action.payload.user;
        state.accessToken = action.payload.accessToken;
        state.error = null;
      })
      .addCase(initializeAuth.rejected, (state) => {
        state.initializing = false;
        state.isAuthenticated = false;
        state.user = null;
        state.accessToken = null;
      })
      // Login
      .addCase(login.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.loading = false;
        state.isAuthenticated = true;
        state.user = action.payload.user;
        state.accessToken = action.payload.accessToken;
        state.error = null;
      })
      .addCase(login.rejected, (state, action) => {
        state.loading = false;
        state.isAuthenticated = false;
        state.error = action.payload;
      })
      // Logout
      .addCase(logout.fulfilled, (state) => {
        state.user = null;
        state.accessToken = null;
        state.isAuthenticated = false;
        state.error = null;
        state.loading = false;
      })
      // Get Current User
      .addCase(getCurrentUser.pending, (state) => {
        state.loading = true;
      })
      .addCase(getCurrentUser.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;
        state.isAuthenticated = true;
        state.error = null;
      })
      .addCase(getCurrentUser.rejected, (state, action) => {
        state.loading = false;
        state.isAuthenticated = false;
        state.user = null;
        state.accessToken = null;
        tokenManager.clearAccessToken();
      })
      // Change Password
      .addCase(changePassword.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(changePassword.fulfilled, (state) => {
        state.loading = false;
        state.error = null;
      })
      .addCase(changePassword.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearError, setUser, setDemoAuth, clearAuth, loginAsDemo } = authSlice.actions;

// Selectors
export const selectAuth = (state) => state.auth;
export const selectUser = (state) => state.auth.user;
export const selectIsAuthenticated = (state) => state.auth.isAuthenticated;
export const selectIsDemo = (state) => state.auth.isDemo;
export const selectAuthLoading = (state) => state.auth.loading;
export const selectAuthInitializing = (state) => state.auth.initializing;
export const selectAuthError = (state) => state.auth.error;
export const selectUserRole = (state) => state.auth.user?.role;

export default authSlice.reducer;
