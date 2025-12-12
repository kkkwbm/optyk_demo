import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import saleService from '../../services/saleService';

// Initial state
const initialState = {
  items: [],
  currentSale: null,
  recentSales: [],
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
    status: null,
    startDate: null,
    endDate: null,
    search: '',
  },
};

// Async thunks
export const fetchSales = createAsyncThunk(
  'sales/fetchSales',
  async (params, { rejectWithValue }) => {
    try {
      const response = await saleService.getSales(params);
      if (response.data.success) {
        return response.data.data;
      }
      return rejectWithValue(response.data.error);
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || 'Nie udało się pobrać sprzedaży');
    }
  }
);

export const fetchSaleById = createAsyncThunk(
  'sales/fetchSaleById',
  async (id, { rejectWithValue }) => {
    try {
      const response = await saleService.getSaleById(id);
      if (response.data.success) {
        return response.data.data;
      }
      return rejectWithValue(response.data.error);
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || 'Nie udało się pobrać sprzedaży');
    }
  }
);

export const createSale = createAsyncThunk(
  'sales/createSale',
  async (data, { rejectWithValue }) => {
    try {
      const response = await saleService.createSale(data);
      if (response.data.success) {
        return response.data.data;
      }
      return rejectWithValue(response.data.error);
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || 'Nie udało się utworzyć sprzedaży');
    }
  }
);

export const cancelSale = createAsyncThunk(
  'sales/cancelSale',
  async ({ id, reason }, { rejectWithValue }) => {
    try {
      const response = await saleService.cancelSale(id, reason);
      if (response.data.success) {
        return { id, status: 'CANCELLED' };
      }
      return rejectWithValue(response.data.error);
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || 'Nie udało się anulować sprzedaży');
    }
  }
);

export const returnSale = createAsyncThunk(
  'sales/returnSale',
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const response = await saleService.returnSale(id, data);
      if (response.data.success) {
        return response.data.data;
      }
      return rejectWithValue(response.data.error);
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || 'Nie udało się przetworzyć zwrotu');
    }
  }
);

export const fetchSalesByLocation = createAsyncThunk(
  'sales/fetchSalesByLocation',
  async ({ locationId, params }, { rejectWithValue }) => {
    try {
      const response = await saleService.getSalesByLocation(locationId, params);
      if (response.data.success) {
        return response.data.data;
      }
      return rejectWithValue(response.data.error);
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || 'Nie udało się pobrać sprzedaży dla lokalizacji');
    }
  }
);

export const fetchSalesStats = createAsyncThunk(
  'sales/fetchSalesStats',
  async (params, { rejectWithValue }) => {
    try {
      const response = await saleService.getSalesStats(params);
      if (response.data.success) {
        return response.data.data;
      }
      return rejectWithValue(response.data.error);
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || 'Nie udało się pobrać statystyk sprzedaży');
    }
  }
);

export const fetchTodaySales = createAsyncThunk(
  'sales/fetchTodaySales',
  async (locationId, { rejectWithValue }) => {
    try {
      const response = await saleService.getTodaySales(locationId);
      if (response.data.success) {
        return response.data.data;
      }
      return rejectWithValue(response.data.error);
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || 'Nie udało się pobrać dzisiejszych sprzedaży');
    }
  }
);

export const fetchRecentSales = createAsyncThunk(
  'sales/fetchRecentSales',
  async ({ limit, locationId }, { rejectWithValue }) => {
    try {
      const response = await saleService.getRecentSales(limit, locationId);
      if (response.data.success) {
        return response.data.data;
      }
      return rejectWithValue(response.data.error);
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || 'Nie udało się pobrać ostatnich sprzedaży');
    }
  }
);

export const searchSales = createAsyncThunk(
  'sales/searchSales',
  async ({ query, params }, { rejectWithValue }) => {
    try {
      const response = await saleService.searchSales(query, params);
      if (response.data.success) {
        return response.data.data;
      }
      return rejectWithValue(response.data.error);
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || 'Nie udało się wyszukać sprzedaży');
    }
  }
);

// Slice
const salesSlice = createSlice({
  name: 'sales',
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
    clearCurrentSale: (state) => {
      state.currentSale = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Sales
      .addCase(fetchSales.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchSales.fulfilled, (state, action) => {
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
      .addCase(fetchSales.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Fetch Sale By ID
      .addCase(fetchSaleById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchSaleById.fulfilled, (state, action) => {
        state.loading = false;
        state.currentSale = action.payload;
      })
      .addCase(fetchSaleById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Create Sale
      .addCase(createSale.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createSale.fulfilled, (state, action) => {
        state.loading = false;
        state.items.unshift(action.payload);
      })
      .addCase(createSale.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Cancel Sale
      .addCase(cancelSale.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(cancelSale.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.items.findIndex(sale => sale.id === action.payload.id);
        if (index !== -1) {
          state.items[index].status = action.payload.status;
        }
        if (state.currentSale?.id === action.payload.id) {
          state.currentSale.status = action.payload.status;
        }
      })
      .addCase(cancelSale.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Return Sale
      .addCase(returnSale.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(returnSale.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.items.findIndex(sale => sale.id === action.payload.id);
        if (index !== -1) {
          state.items[index] = action.payload;
        }
        if (state.currentSale?.id === action.payload.id) {
          state.currentSale = action.payload;
        }
      })
      .addCase(returnSale.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Fetch Sales By Location
      .addCase(fetchSalesByLocation.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchSalesByLocation.fulfilled, (state, action) => {
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
      .addCase(fetchSalesByLocation.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Fetch Sales Stats
      .addCase(fetchSalesStats.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchSalesStats.fulfilled, (state, action) => {
        state.loading = false;
        state.stats = action.payload;
      })
      .addCase(fetchSalesStats.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Fetch Recent Sales
      .addCase(fetchRecentSales.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchRecentSales.fulfilled, (state, action) => {
        state.loading = false;
        state.recentSales = action.payload;
      })
      .addCase(fetchRecentSales.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Search Sales
      .addCase(searchSales.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(searchSales.fulfilled, (state, action) => {
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
      .addCase(searchSales.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

// Actions
export const { clearError, setFilters, clearFilters, clearCurrentSale } = salesSlice.actions;

// Selectors
export const selectSales = (state) => state.sales.items;
export const selectCurrentSale = (state) => state.sales.currentSale;
export const selectRecentSales = (state) => state.sales.recentSales;
export const selectSalesStats = (state) => state.sales.stats;
export const selectSalesLoading = (state) => state.sales.loading;
export const selectSalesError = (state) => state.sales.error;
export const selectSalesPagination = (state) => state.sales.pagination;
export const selectSalesFilters = (state) => state.sales.filters;

export default salesSlice.reducer;
