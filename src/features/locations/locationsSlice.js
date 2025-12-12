import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import locationService from '../../services/locationService';

// Initial state
const initialState = {
  items: [],
  activeLocations: [],
  myLocations: [],
  currentLocation: null,
  loading: false,
  error: null,
  pagination: {
    page: 0,
    size: 20,
    totalElements: 0,
    totalPages: 0,
  },
  filters: {
    type: null,
    status: null,
    city: null,
    search: '',
  },
};

// Async thunks
export const fetchLocations = createAsyncThunk(
  'locations/fetchLocations',
  async (params, { rejectWithValue }) => {
    try {
      const response = await locationService.getLocations(params);
      if (response.data.success) {
        return response.data.data;
      }
      return rejectWithValue(response.data.error);
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || 'Nie udało się pobrać lokalizacji');
    }
  }
);

export const fetchLocationById = createAsyncThunk(
  'locations/fetchLocationById',
  async (id, { rejectWithValue }) => {
    try {
      const response = await locationService.getLocationById(id);
      if (response.data.success) {
        return response.data.data;
      }
      return rejectWithValue(response.data.error);
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || 'Nie udało się pobrać lokalizacji');
    }
  }
);

export const createLocation = createAsyncThunk(
  'locations/createLocation',
  async (data, { rejectWithValue }) => {
    try {
      const response = await locationService.createLocation(data);
      if (response.data.success) {
        return response.data.data;
      }
      return rejectWithValue(response.data.error);
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || 'Nie udało się utworzyć lokalizacji');
    }
  }
);

export const updateLocation = createAsyncThunk(
  'locations/updateLocation',
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const response = await locationService.updateLocation(id, data);
      if (response.data.success) {
        return response.data.data;
      }
      return rejectWithValue(response.data.error);
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || 'Nie udało się zaktualizować lokalizacji');
    }
  }
);

export const activateLocation = createAsyncThunk(
  'locations/activateLocation',
  async (id, { rejectWithValue }) => {
    try {
      const response = await locationService.activateLocation(id);
      if (response.data.success) {
        return { id, status: 'ACTIVE' };
      }
      return rejectWithValue(response.data.error);
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || 'Nie udało się aktywować lokalizacji');
    }
  }
);

export const deactivateLocation = createAsyncThunk(
  'locations/deactivateLocation',
  async (id, { rejectWithValue }) => {
    try {
      const response = await locationService.deactivateLocation(id);
      if (response.data.success) {
        return { id, status: 'INACTIVE' };
      }
      return rejectWithValue(response.data.error);
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || 'Nie udało się dezaktywować lokalizacji');
    }
  }
);

export const deleteLocation = createAsyncThunk(
  'locations/deleteLocation',
  async (id, { rejectWithValue }) => {
    try {
      const response = await locationService.deleteLocation(id);
      // Handle 204 No Content response (successful deletion with empty body)
      if (response.status === 204 || response.data?.success) {
        return id;
      }
      return rejectWithValue(response.data?.error || 'Nie udało się usunąć lokalizacji');
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || 'Nie udało się usunąć lokalizacji');
    }
  }
);

export const fetchActiveLocations = createAsyncThunk(
  'locations/fetchActiveLocations',
  async (type = null, { rejectWithValue }) => {
    try {
      const response = await locationService.getActiveLocations(type);
      if (response.data.success) {
        return response.data.data;
      }
      return rejectWithValue(response.data.error);
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || 'Nie udało się pobrać aktywnych lokalizacji');
    }
  }
);

export const fetchMyLocations = createAsyncThunk(
  'locations/fetchMyLocations',
  async (_, { rejectWithValue }) => {
    try {
      const response = await locationService.getMyLocations();
      if (response.data.success) {
        return response.data.data;
      }
      return rejectWithValue(response.data.error);
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || 'Nie udało się pobrać moich lokalizacji');
    }
  }
);

export const fetchLocationsByType = createAsyncThunk(
  'locations/fetchLocationsByType',
  async ({ type, params }, { rejectWithValue }) => {
    try {
      const response = await locationService.getLocationsByType(type, params);
      if (response.data.success) {
        return response.data.data;
      }
      return rejectWithValue(response.data.error);
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || 'Nie udało się pobrać lokalizacji według typu');
    }
  }
);

export const fetchLocationStats = createAsyncThunk(
  'locations/fetchLocationStats',
  async (id, { rejectWithValue }) => {
    try {
      const response = await locationService.getLocationStats(id);
      if (response.data.success) {
        return response.data.data;
      }
      return rejectWithValue(response.data.error);
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || 'Nie udało się pobrać statystyk lokalizacji');
    }
  }
);

export const searchLocations = createAsyncThunk(
  'locations/searchLocations',
  async ({ query, params }, { rejectWithValue }) => {
    try {
      const response = await locationService.searchLocations(query, params);
      if (response.data.success) {
        return response.data.data;
      }
      return rejectWithValue(response.data.error);
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || 'Nie udało się wyszukać lokalizacji');
    }
  }
);

// Slice
const locationsSlice = createSlice({
  name: 'locations',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    clearFilters: (state) => {
      state.filters = initialState.filters;
    },
    setCurrentLocation: (state, action) => {
      state.currentLocation = action.payload;
      // Store in localStorage for persistence
      if (action.payload) {
        localStorage.setItem('currentLocation', JSON.stringify(action.payload));
      } else {
        localStorage.removeItem('currentLocation');
      }
    },
    initializeCurrentLocation: (state) => {
      const savedLocation = localStorage.getItem('currentLocation');
      if (savedLocation) {
        try {
          state.currentLocation = JSON.parse(savedLocation);
        } catch (error) {
          console.error('Failed to parse saved location:', error);
          localStorage.removeItem('currentLocation');
        }
      }
    },
    clearCurrentLocation: (state) => {
      state.currentLocation = null;
      localStorage.removeItem('currentLocation');
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Locations
      .addCase(fetchLocations.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchLocations.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload.content || action.payload;
        if (action.payload.page !== undefined) {
          state.pagination = {
            page: action.payload.page,
            size: action.payload.size,
            totalElements: action.payload.totalElements,
            totalPages: action.payload.totalPages,
          };
        }
      })
      .addCase(fetchLocations.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Fetch Location By ID
      .addCase(fetchLocationById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchLocationById.fulfilled, (state, action) => {
        state.loading = false;
        state.currentLocation = action.payload;
      })
      .addCase(fetchLocationById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Create Location
      .addCase(createLocation.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createLocation.fulfilled, (state, action) => {
        state.loading = false;
        state.items.unshift(action.payload);
      })
      .addCase(createLocation.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Update Location
      .addCase(updateLocation.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateLocation.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.items.findIndex(location => location.id === action.payload.id);
        if (index !== -1) {
          state.items[index] = action.payload;
        }
        if (state.currentLocation?.id === action.payload.id) {
          state.currentLocation = action.payload;
        }
      })
      .addCase(updateLocation.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Activate Location
      .addCase(activateLocation.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(activateLocation.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.items.findIndex(location => location.id === action.payload.id);
        if (index !== -1) {
          state.items[index].status = action.payload.status;
        }
        if (state.currentLocation?.id === action.payload.id) {
          state.currentLocation.status = action.payload.status;
        }
      })
      .addCase(activateLocation.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Deactivate Location
      .addCase(deactivateLocation.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deactivateLocation.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.items.findIndex(location => location.id === action.payload.id);
        if (index !== -1) {
          state.items[index].status = action.payload.status;
        }
        if (state.currentLocation?.id === action.payload.id) {
          state.currentLocation.status = action.payload.status;
        }
      })
      .addCase(deactivateLocation.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Delete Location
      .addCase(deleteLocation.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteLocation.fulfilled, (state, action) => {
        state.loading = false;
        state.items = state.items.filter(location => location.id !== action.payload);
        state.activeLocations = state.activeLocations.filter(location => location.id !== action.payload);
        if (state.currentLocation?.id === action.payload) {
          state.currentLocation = null;
        }
      })
      .addCase(deleteLocation.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Fetch Active Locations
      .addCase(fetchActiveLocations.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchActiveLocations.fulfilled, (state, action) => {
        state.loading = false;
        state.activeLocations = action.payload;
      })
      .addCase(fetchActiveLocations.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Fetch My Locations
      .addCase(fetchMyLocations.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchMyLocations.fulfilled, (state, action) => {
        state.loading = false;
        state.myLocations = action.payload;
      })
      .addCase(fetchMyLocations.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Fetch Locations By Type
      .addCase(fetchLocationsByType.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchLocationsByType.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload.content || action.payload;
        if (action.payload.page !== undefined) {
          state.pagination = {
            page: action.payload.page,
            size: action.payload.size,
            totalElements: action.payload.totalElements,
            totalPages: action.payload.totalPages,
          };
        }
      })
      .addCase(fetchLocationsByType.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Search Locations
      .addCase(searchLocations.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(searchLocations.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload.content || action.payload;
        if (action.payload.page !== undefined) {
          state.pagination = {
            page: action.payload.page,
            size: action.payload.size,
            totalElements: action.payload.totalElements,
            totalPages: action.payload.totalPages,
          };
        }
      })
      .addCase(searchLocations.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

// Actions
export const { clearError, setFilters, clearFilters, setCurrentLocation, clearCurrentLocation, initializeCurrentLocation } = locationsSlice.actions;

// Selectors
export const selectLocations = (state) => state.locations.items;
export const selectActiveLocations = (state) => state.locations.activeLocations;
export const selectMyLocations = (state) => state.locations.myLocations;
export const selectCurrentLocation = (state) => state.locations.currentLocation;
export const selectCurrentLocationId = (state) => state.locations.currentLocation?.id;
export const selectLocationsLoading = (state) => state.locations.loading;
export const selectLocationsError = (state) => state.locations.error;
export const selectLocationsPagination = (state) => state.locations.pagination;
export const selectLocationsFilters = (state) => state.locations.filters;

export default locationsSlice.reducer;
