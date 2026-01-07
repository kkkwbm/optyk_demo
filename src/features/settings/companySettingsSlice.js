import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import companySettingsService from '../../services/companySettingsService';

// Initial state
const initialState = {
  settings: null,
  loading: false,
  error: null,
};

// Async thunks
export const fetchCompanySettings = createAsyncThunk(
  'companySettings/fetchSettings',
  async (_, { rejectWithValue }) => {
    try {
      const response = await companySettingsService.getSettings();
      if (response.data.success) {
        return response.data.data;
      }
      return rejectWithValue(response.data.error);
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || 'Nie udało się pobrać ustawień firmy');
    }
  }
);

export const updateCompanySettings = createAsyncThunk(
  'companySettings/updateSettings',
  async (data, { rejectWithValue }) => {
    try {
      const response = await companySettingsService.updateSettings(data);
      if (response.data.success) {
        return response.data.data;
      }
      return rejectWithValue(response.data.error);
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || 'Nie udało się zaktualizować ustawień firmy');
    }
  }
);

export const uploadCompanyLogo = createAsyncThunk(
  'companySettings/uploadLogo',
  async (file, { rejectWithValue }) => {
    try {
      const response = await companySettingsService.uploadLogo(file);
      if (response.data.success) {
        return response.data.data;
      }
      return rejectWithValue(response.data.error);
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || 'Nie udało się wgrać logo');
    }
  }
);

export const deleteCompanyLogo = createAsyncThunk(
  'companySettings/deleteLogo',
  async (_, { rejectWithValue }) => {
    try {
      const response = await companySettingsService.deleteLogo();
      if (response.data.success) {
        return response.data.data;
      }
      return rejectWithValue(response.data.error);
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || 'Nie udało się usunąć logo');
    }
  }
);

// Slice
const companySettingsSlice = createSlice({
  name: 'companySettings',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearSettings: (state) => {
      state.settings = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Settings
      .addCase(fetchCompanySettings.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCompanySettings.fulfilled, (state, action) => {
        state.loading = false;
        state.settings = action.payload;
      })
      .addCase(fetchCompanySettings.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Update Settings
      .addCase(updateCompanySettings.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateCompanySettings.fulfilled, (state, action) => {
        state.loading = false;
        state.settings = action.payload;
      })
      .addCase(updateCompanySettings.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Upload Logo
      .addCase(uploadCompanyLogo.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(uploadCompanyLogo.fulfilled, (state, action) => {
        state.loading = false;
        state.settings = action.payload;
      })
      .addCase(uploadCompanyLogo.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Delete Logo
      .addCase(deleteCompanyLogo.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteCompanyLogo.fulfilled, (state, action) => {
        state.loading = false;
        state.settings = action.payload;
      })
      .addCase(deleteCompanyLogo.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

// Actions
export const { clearError, clearSettings } = companySettingsSlice.actions;

// Selectors
export const selectCompanySettings = (state) => state.companySettings.settings;
export const selectCompanySettingsLoading = (state) => state.companySettings.loading;
export const selectCompanySettingsError = (state) => state.companySettings.error;

export default companySettingsSlice.reducer;
