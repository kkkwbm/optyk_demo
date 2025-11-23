import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import inventoryService from '../../services/inventoryService';

// Initial state
const initialState = {
  items: [],
  stats: null,
  loading: false,
  error: null,
  pagination: {
    page: 0,
    size: 20,
    totalElements: 0,
    totalPages: 0,
  },
  filters: {
    locationId: null,
    productType: null,
    search: '',
  },
};

// Async thunks
export const fetchInventory = createAsyncThunk(
  'inventory/fetchInventory',
  async ({ locationId, params }, { rejectWithValue }) => {
    try {
      // If locationId is null/undefined, getInventory will now fetch all inventory
      // params may contain locationType
      const response = await inventoryService.getInventory(locationId, params);
      if (response.data.success) {
        return response.data.data;
      }
      return rejectWithValue(response.data.error);
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || 'Failed to fetch inventory');
    }
  }
);

export const fetchInventoryItem = createAsyncThunk(
  'inventory/fetchInventoryItem',
  async ({ productId, locationId }, { rejectWithValue }) => {
    try {
      const response = await inventoryService.getInventoryItem(productId, locationId);
      if (response.data.success) {
        return response.data.data;
      }
      return rejectWithValue(response.data.error);
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || 'Failed to fetch inventory item');
    }
  }
);

export const adjustStock = createAsyncThunk(
  'inventory/adjustStock',
  async (data, { rejectWithValue }) => {
    try {
      const response = await inventoryService.adjustStock(data);
      if (response.data.success) {
        return response.data.data;
      }
      return rejectWithValue(response.data.error);
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || 'Failed to adjust stock');
    }
  }
);

export const reserveStock = createAsyncThunk(
  'inventory/reserveStock',
  async (data, { rejectWithValue }) => {
    try {
      const response = await inventoryService.reserveStock(data);
      if (response.data.success) {
        return response.data.data;
      }
      return rejectWithValue(response.data.error);
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || 'Failed to reserve stock');
    }
  }
);

export const releaseStock = createAsyncThunk(
  'inventory/releaseStock',
  async (data, { rejectWithValue }) => {
    try {
      const response = await inventoryService.releaseStock(data);
      if (response.data.success) {
        return response.data.data;
      }
      return rejectWithValue(response.data.error);
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || 'Failed to release stock');
    }
  }
);

export const fetchInventoryStats = createAsyncThunk(
  'inventory/fetchInventoryStats',
  async (locationId, { rejectWithValue }) => {
    try {
      const response = await inventoryService.getInventoryStats(locationId);
      if (response.data.success) {
        return response.data.data;
      }
      return rejectWithValue(response.data.error);
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || 'Failed to fetch inventory stats');
    }
  }
);

export const fetchInventoryValue = createAsyncThunk(
  'inventory/fetchInventoryValue',
  async (locationId, { rejectWithValue }) => {
    try {
      const response = await inventoryService.getInventoryValue(locationId);
      if (response.data.success) {
        return response.data.data;
      }
      return rejectWithValue(response.data.error);
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || 'Failed to fetch inventory value');
    }
  }
);

export const fetchStockHistory = createAsyncThunk(
  'inventory/fetchStockHistory',
  async ({ productId, locationId, params }, { rejectWithValue }) => {
    try {
      const response = await inventoryService.getStockHistory(productId, locationId, params);
      if (response.data.success) {
        return response.data.data;
      }
      return rejectWithValue(response.data.error);
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || 'Failed to fetch stock history');
    }
  }
);

export const batchAdjustStock = createAsyncThunk(
  'inventory/batchAdjustStock',
  async (adjustments, { rejectWithValue }) => {
    try {
      const response = await inventoryService.batchAdjustStock(adjustments);
      if (response.data.success) {
        return response.data.data;
      }
      return rejectWithValue(response.data.error);
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || 'Failed to batch adjust stock');
    }
  }
);

// Slice
const inventorySlice = createSlice({
  name: 'inventory',
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
    clearInventory: (state) => {
      state.items = [];
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Inventory
      .addCase(fetchInventory.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchInventory.fulfilled, (state, action) => {
        state.loading = false;
        // Replace items instead of appending to prevent duplication when switching locations
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
      .addCase(fetchInventory.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Adjust Stock
      .addCase(adjustStock.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(adjustStock.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.items.findIndex(
          item => item.productId === action.payload.productId && item.locationId === action.payload.locationId
        );
        if (index !== -1) {
          state.items[index] = action.payload;
        }
      })
      .addCase(adjustStock.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Reserve Stock
      .addCase(reserveStock.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(reserveStock.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.items.findIndex(
          item => item.productId === action.payload.productId && item.locationId === action.payload.locationId
        );
        if (index !== -1) {
          state.items[index] = action.payload;
        }
      })
      .addCase(reserveStock.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Release Stock
      .addCase(releaseStock.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(releaseStock.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.items.findIndex(
          item => item.productId === action.payload.productId && item.locationId === action.payload.locationId
        );
        if (index !== -1) {
          state.items[index] = action.payload;
        }
      })
      .addCase(releaseStock.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Fetch Inventory Stats
      .addCase(fetchInventoryStats.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchInventoryStats.fulfilled, (state, action) => {
        state.loading = false;
        state.stats = action.payload;
      })
      .addCase(fetchInventoryStats.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Batch Adjust Stock
      .addCase(batchAdjustStock.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(batchAdjustStock.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(batchAdjustStock.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

// Actions
export const { clearError, setFilters, clearFilters, clearInventory } = inventorySlice.actions;

// Selectors
export const selectInventoryItems = (state) => state.inventory.items;
export const selectInventoryStats = (state) => state.inventory.stats;
export const selectInventoryLoading = (state) => state.inventory.loading;
export const selectInventoryError = (state) => state.inventory.error;
export const selectInventoryPagination = (state) => state.inventory.pagination;
export const selectInventoryFilters = (state) => state.inventory.filters;

// Alias for backwards compatibility
export const fetchInventoryByProductAndLocation = fetchInventoryItem;

export default inventorySlice.reducer;
