import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import brandService from '../../services/brandService';

// Initial state
const initialState = {
  items: [],
  activeBrands: [],
  currentBrand: null,
  loading: false,
  error: null,
  pagination: {
    page: 0,
    size: 20,
    totalElements: 0,
    totalPages: 0,
  },
  filters: {
    status: null,
    search: '',
  },
};

// Async thunks
export const fetchBrands = createAsyncThunk(
  'brands/fetchBrands',
  async (params, { rejectWithValue }) => {
    try {
      const response = await brandService.getBrands(params);
      if (response.data.success) {
        return response.data.data;
      }
      return rejectWithValue(response.data.error);
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || 'Nie udało się pobrać marek');
    }
  }
);

export const fetchBrandById = createAsyncThunk(
  'brands/fetchBrandById',
  async (id, { rejectWithValue }) => {
    try {
      const response = await brandService.getBrandById(id);
      if (response.data.success) {
        return response.data.data;
      }
      return rejectWithValue(response.data.error);
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || 'Nie udało się pobrać marki');
    }
  }
);

export const createBrand = createAsyncThunk(
  'brands/createBrand',
  async (data, { rejectWithValue }) => {
    try {
      const response = await brandService.createBrand(data);
      if (response.data.success) {
        return response.data.data;
      }
      return rejectWithValue(response.data.error);
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || 'Nie udało się utworzyć marki');
    }
  }
);

export const updateBrand = createAsyncThunk(
  'brands/updateBrand',
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const response = await brandService.updateBrand(id, data);
      if (response.data.success) {
        return response.data.data;
      }
      return rejectWithValue(response.data.error);
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || 'Nie udało się zaktualizować marki');
    }
  }
);

export const activateBrand = createAsyncThunk(
  'brands/activateBrand',
  async (id, { rejectWithValue }) => {
    try {
      const response = await brandService.activateBrand(id);
      if (response.data.success) {
        return { id, status: 'ACTIVE' };
      }
      return rejectWithValue(response.data.error);
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || 'Nie udało się aktywować marki');
    }
  }
);

export const deactivateBrand = createAsyncThunk(
  'brands/deactivateBrand',
  async (id, { rejectWithValue }) => {
    try {
      const response = await brandService.deactivateBrand(id);
      if (response.data.success) {
        return { id, status: 'INACTIVE' };
      }
      return rejectWithValue(response.data.error);
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || 'Nie udało się dezaktywować marki');
    }
  }
);

export const deleteBrand = createAsyncThunk(
  'brands/deleteBrand',
  async (id, { rejectWithValue }) => {
    try {
      const response = await brandService.deleteBrand(id);
      if (response.data.success || response.status === 204) {
        return id;
      }
      return rejectWithValue(response.data.error);
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || 'Nie udało się usunąć marki');
    }
  }
);

export const fetchActiveBrands = createAsyncThunk(
  'brands/fetchActiveBrands',
  async (_, { rejectWithValue }) => {
    try {
      const response = await brandService.getActiveBrands();
      if (response.data.success) {
        return response.data.data;
      }
      return rejectWithValue(response.data.error);
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || 'Nie udało się pobrać aktywnych marek');
    }
  }
);

export const searchBrands = createAsyncThunk(
  'brands/searchBrands',
  async ({ query, params }, { rejectWithValue }) => {
    try {
      const response = await brandService.searchBrands(query, params);
      if (response.data.success) {
        return response.data.data;
      }
      return rejectWithValue(response.data.error);
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || 'Nie udało się wyszukać marek');
    }
  }
);

export const fetchBrandStats = createAsyncThunk(
  'brands/fetchBrandStats',
  async (id, { rejectWithValue }) => {
    try {
      const response = await brandService.getBrandStats(id);
      if (response.data.success) {
        return response.data.data;
      }
      return rejectWithValue(response.data.error);
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || 'Nie udało się pobrać statystyk marki');
    }
  }
);

// Slice
const brandsSlice = createSlice({
  name: 'brands',
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
    clearCurrentBrand: (state) => {
      state.currentBrand = null;
    },
    setDemoBrands: (state) => {
      const demoBrands = [
        { id: 'demo-brand-1', name: 'Ray-Ban', isActive: true, status: 'ACTIVE' },
        { id: 'demo-brand-2', name: 'Oakley', isActive: true, status: 'ACTIVE' },
        { id: 'demo-brand-3', name: 'Persol', isActive: true, status: 'ACTIVE' },
        { id: 'demo-brand-4', name: 'Carrera', isActive: true, status: 'ACTIVE' },
        { id: 'demo-brand-5', name: 'Tom Ford', isActive: true, status: 'ACTIVE' },
        { id: 'demo-brand-6', name: 'Gucci', isActive: true, status: 'ACTIVE' },
        { id: 'demo-brand-7', name: 'Prada', isActive: true, status: 'ACTIVE' },
        { id: 'demo-brand-8', name: 'Versace', isActive: true, status: 'ACTIVE' },
      ];
      state.items = demoBrands;
      state.activeBrands = demoBrands;
      state.loading = false;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Brands
      .addCase(fetchBrands.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchBrands.fulfilled, (state, action) => {
        state.loading = false;
        const brands = action.payload.content || action.payload;
        // Map isActive boolean to status string
        state.items = brands.map(brand => ({
          ...brand,
          status: brand.isActive ? 'ACTIVE' : 'INACTIVE'
        }));
        if (action.payload.page !== undefined) {
          state.pagination = {
            page: action.payload.page,
            size: action.payload.size,
            totalElements: action.payload.totalElements,
            totalPages: action.payload.totalPages,
          };
        }
      })
      .addCase(fetchBrands.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Fetch Brand By ID
      .addCase(fetchBrandById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchBrandById.fulfilled, (state, action) => {
        state.loading = false;
        state.currentBrand = {
          ...action.payload,
          status: action.payload.isActive ? 'ACTIVE' : 'INACTIVE'
        };
      })
      .addCase(fetchBrandById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Create Brand
      .addCase(createBrand.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createBrand.fulfilled, (state, action) => {
        state.loading = false;
        state.items.unshift({
          ...action.payload,
          status: action.payload.isActive ? 'ACTIVE' : 'INACTIVE'
        });
      })
      .addCase(createBrand.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Update Brand
      .addCase(updateBrand.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateBrand.fulfilled, (state, action) => {
        state.loading = false;
        const updatedBrand = {
          ...action.payload,
          status: action.payload.isActive ? 'ACTIVE' : 'INACTIVE'
        };
        const index = state.items.findIndex(brand => brand.id === action.payload.id);
        if (index !== -1) {
          state.items[index] = updatedBrand;
        }
        if (state.currentBrand?.id === action.payload.id) {
          state.currentBrand = updatedBrand;
        }
      })
      .addCase(updateBrand.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Activate Brand
      .addCase(activateBrand.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(activateBrand.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.items.findIndex(brand => brand.id === action.payload.id);
        if (index !== -1) {
          state.items[index].status = action.payload.status;
        }
        if (state.currentBrand?.id === action.payload.id) {
          state.currentBrand.status = action.payload.status;
        }
      })
      .addCase(activateBrand.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Deactivate Brand
      .addCase(deactivateBrand.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deactivateBrand.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.items.findIndex(brand => brand.id === action.payload.id);
        if (index !== -1) {
          state.items[index].status = action.payload.status;
        }
        if (state.currentBrand?.id === action.payload.id) {
          state.currentBrand.status = action.payload.status;
        }
      })
      .addCase(deactivateBrand.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Delete Brand
      .addCase(deleteBrand.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteBrand.fulfilled, (state, action) => {
        state.loading = false;
        state.items = state.items.filter(brand => brand.id !== action.payload);
        state.activeBrands = state.activeBrands.filter(brand => brand.id !== action.payload);
        if (state.currentBrand?.id === action.payload) {
          state.currentBrand = null;
        }
      })
      .addCase(deleteBrand.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Fetch Active Brands
      .addCase(fetchActiveBrands.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchActiveBrands.fulfilled, (state, action) => {
        state.loading = false;
        // Handle both paginated response (with content) and plain array
        state.activeBrands = action.payload.content || action.payload;
      })
      .addCase(fetchActiveBrands.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Search Brands
      .addCase(searchBrands.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(searchBrands.fulfilled, (state, action) => {
        state.loading = false;
        const brands = action.payload.content || action.payload;
        // Map isActive boolean to status string
        state.items = brands.map(brand => ({
          ...brand,
          status: brand.isActive ? 'ACTIVE' : 'INACTIVE'
        }));
        if (action.payload.page !== undefined) {
          state.pagination = {
            page: action.payload.page,
            size: action.payload.size,
            totalElements: action.payload.totalElements,
            totalPages: action.payload.totalPages,
          };
        }
      })
      .addCase(searchBrands.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

// Actions
export const { clearError, setFilters, clearFilters, clearCurrentBrand, setDemoBrands } = brandsSlice.actions;

// Selectors
export const selectBrands = (state) => state.brands.items;
export const selectActiveBrands = (state) => state.brands.activeBrands;
export const selectCurrentBrand = (state) => state.brands.currentBrand;
export const selectBrandsLoading = (state) => state.brands.loading;
export const selectBrandsError = (state) => state.brands.error;
export const selectBrandsPagination = (state) => state.brands.pagination;
export const selectBrandsFilters = (state) => state.brands.filters;

export default brandsSlice.reducer;
