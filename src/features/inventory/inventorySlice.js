import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import inventoryService from '../../services/inventoryService';

// Initial state
const initialState = {
  items: [],
  stats: null,
  summary: null,
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
      return rejectWithValue(error.response?.data?.error || 'Nie udało się pobrać magazynu');
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
      return rejectWithValue(error.response?.data?.error || 'Nie udało się pobrać pozycji magazynowej');
    }
  }
);

export const fetchInventoryStock = createAsyncThunk(
  'inventory/fetchInventoryStock',
  async (params, { rejectWithValue }) => {
    try {
      const { locationId, ...restParams } = params;
      const response = await inventoryService.getInventory(locationId, restParams);
      if (response.data.success) {
        return response.data.data;
      }
      return rejectWithValue(response.data.error);
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || 'Nie udało się pobrać zapasów magazynowych');
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
      return rejectWithValue(error.response?.data?.error || 'Nie udało się dostosować stanu');
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
      return rejectWithValue(error.response?.data?.error || 'Nie udało się zarezerwować stanu');
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
      return rejectWithValue(error.response?.data?.error || 'Nie udało się zwolnić stanu');
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
      return rejectWithValue(error.response?.data?.error || 'Nie udało się pobrać statystyk magazynu');
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
      return rejectWithValue(error.response?.data?.error || 'Nie udało się pobrać wartości magazynu');
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
      return rejectWithValue(error.response?.data?.error || 'Nie udało się pobrać historii stanu');
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
      return rejectWithValue(error.response?.data?.error || 'Nie udało się masowo dostosować stanu');
    }
  }
);

export const fetchInventorySummary = createAsyncThunk(
  'inventory/fetchInventorySummary',
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await inventoryService.getInventorySummary(params);
      if (response.data.success) {
        return response.data.data;
      }
      return rejectWithValue(response.data.error);
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || 'Nie udało się pobrać podsumowania magazynu');
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
    setDemoInventory: (state) => {
      const demoItems = [
        {
          id: 'demo-inv-1',
          product: {
            id: 'demo-prod-1',
            type: 'FRAME',
            model: 'Aviator Classic',
            color: 'Gold',
            size: '58',
            brand: { id: 'demo-brand-1', name: 'Ray-Ban' },
            sellingPrice: 599.00,
            purchasePrice: 350.00,
            status: 'ACTIVE',
          },
          quantity: 5,
          location: { id: 'demo-store-1', name: 'Salon Optyczny Centrum' },
        },
        {
          id: 'demo-inv-2',
          product: {
            id: 'demo-prod-2',
            type: 'FRAME',
            model: 'Wayfarer',
            color: 'Black',
            size: '54',
            brand: { id: 'demo-brand-1', name: 'Ray-Ban' },
            sellingPrice: 499.00,
            purchasePrice: 280.00,
            status: 'ACTIVE',
          },
          quantity: 3,
          location: { id: 'demo-store-1', name: 'Salon Optyczny Centrum' },
        },
        {
          id: 'demo-inv-3',
          product: {
            id: 'demo-prod-3',
            type: 'SUNGLASSES',
            model: 'Holbrook',
            color: 'Matte Black',
            size: '55',
            brand: { id: 'demo-brand-2', name: 'Oakley' },
            sellingPrice: 749.00,
            purchasePrice: 420.00,
            status: 'ACTIVE',
          },
          quantity: 2,
          location: { id: 'demo-store-1', name: 'Salon Optyczny Centrum' },
        },
        {
          id: 'demo-inv-4',
          product: {
            id: 'demo-prod-4',
            type: 'CONTACT_LENS',
            model: 'Dailies Total1',
            lensType: 'DAILY',
            power: '-2.00',
            brand: { id: 'demo-brand-1', name: 'Ray-Ban' },
            sellingPrice: 129.00,
            purchasePrice: 75.00,
            status: 'ACTIVE',
          },
          quantity: 10,
          location: { id: 'demo-store-1', name: 'Salon Optyczny Centrum' },
        },
      ];
      state.items = demoItems;
      state.loading = false;
      state.pagination = {
        page: 0,
        size: 20,
        totalElements: demoItems.length,
        totalPages: 1,
      };
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
      // Fetch Inventory Stock (with pagination and search)
      .addCase(fetchInventoryStock.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchInventoryStock.fulfilled, (state, action) => {
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
      .addCase(fetchInventoryStock.rejected, (state, action) => {
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
      })
      // Fetch Inventory Summary
      .addCase(fetchInventorySummary.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchInventorySummary.fulfilled, (state, action) => {
        state.loading = false;
        state.summary = action.payload;
      })
      .addCase(fetchInventorySummary.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

// Actions
export const { clearError, setFilters, clearFilters, clearInventory, setDemoInventory } = inventorySlice.actions;

// Selectors
export const selectInventoryItems = (state) => state.inventory.items;
export const selectInventoryStats = (state) => state.inventory.stats;
export const selectInventorySummary = (state) => state.inventory.summary;
export const selectInventoryLoading = (state) => state.inventory.loading;
export const selectInventoryError = (state) => state.inventory.error;
export const selectInventoryPagination = (state) => state.inventory.pagination;
export const selectInventoryFilters = (state) => state.inventory.filters;

// Alias for backwards compatibility
export const fetchInventoryByProductAndLocation = fetchInventoryItem;

export default inventorySlice.reducer;
