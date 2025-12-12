import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import statisticsService from '../../services/statisticsService';

// Initial state
const initialState = {
  dashboardStats: null,
  salesStats: null,
  salesTrend: null,
  inventoryStats: null,
  topProducts: [],
  salesByLocation: [],
  salesByProductType: null,
  revenueStats: null,
  comparisonStats: null,
  userPerformance: null,
  stockLevels: null,
  transferStats: null,
  brandPerformance: [],
  loading: false,
  error: null,
  filters: {
    locationId: null,
    startDate: null,
    endDate: null,
    period: 'month',
  },
};

// Async thunks
export const fetchDashboardStats = createAsyncThunk(
  'statistics/fetchDashboardStats',
  async (params, { rejectWithValue }) => {
    try {
      const response = await statisticsService.getDashboardStats(params);
      if (response.data.success) {
        return response.data.data;
      }
      return rejectWithValue(response.data.error);
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || 'Nie udało się pobrać statystyk pulpitu');
    }
  }
);

export const fetchSalesStats = createAsyncThunk(
  'statistics/fetchSalesStats',
  async (params, { rejectWithValue }) => {
    try {
      const response = await statisticsService.getSalesStats(params);
      if (response.data.success) {
        return response.data.data;
      }
      return rejectWithValue(response.data.error);
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || 'Nie udało się pobrać statystyk sprzedaży');
    }
  }
);

export const fetchSalesTrend = createAsyncThunk(
  'statistics/fetchSalesTrend',
  async (params, { rejectWithValue }) => {
    try {
      const response = await statisticsService.getSalesTrend(params);
      if (response.data.success) {
        return response.data.data;
      }
      return rejectWithValue(response.data.error);
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || 'Nie udało się pobrać trendu sprzedaży');
    }
  }
);

export const fetchInventoryStats = createAsyncThunk(
  'statistics/fetchInventoryStats',
  async (params, { rejectWithValue }) => {
    try {
      const response = await statisticsService.getInventoryStats(params);
      if (response.data.success) {
        return response.data.data;
      }
      return rejectWithValue(response.data.error);
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || 'Nie udało się pobrać statystyk magazynu');
    }
  }
);

export const fetchTopProducts = createAsyncThunk(
  'statistics/fetchTopProducts',
  async (params, { rejectWithValue }) => {
    try {
      const response = await statisticsService.getTopProducts(params);
      if (response.data.success) {
        return response.data.data;
      }
      return rejectWithValue(response.data.error);
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || 'Nie udało się pobrać najpopularniejszych produktów');
    }
  }
);

export const fetchSalesByLocation = createAsyncThunk(
  'statistics/fetchSalesByLocation',
  async (params, { rejectWithValue }) => {
    try {
      const response = await statisticsService.getSalesByLocation(params);
      if (response.data.success) {
        return response.data.data;
      }
      return rejectWithValue(response.data.error);
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || 'Nie udało się pobrać sprzedaży według lokalizacji');
    }
  }
);

export const fetchSalesByProductType = createAsyncThunk(
  'statistics/fetchSalesByProductType',
  async (params, { rejectWithValue }) => {
    try {
      const response = await statisticsService.getSalesByProductType(params);
      if (response.data.success) {
        return response.data.data;
      }
      return rejectWithValue(response.data.error);
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || 'Nie udało się pobrać sprzedaży według typu produktu');
    }
  }
);

export const fetchRevenueStats = createAsyncThunk(
  'statistics/fetchRevenueStats',
  async (params, { rejectWithValue }) => {
    try {
      const response = await statisticsService.getRevenueStats(params);
      if (response.data.success) {
        return response.data.data;
      }
      return rejectWithValue(response.data.error);
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || 'Nie udało się pobrać statystyk przychodów');
    }
  }
);

export const fetchComparisonStats = createAsyncThunk(
  'statistics/fetchComparisonStats',
  async (params, { rejectWithValue }) => {
    try {
      const response = await statisticsService.getComparisonStats(params);
      if (response.data.success) {
        return response.data.data;
      }
      return rejectWithValue(response.data.error);
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || 'Nie udało się pobrać statystyk porównania');
    }
  }
);

export const fetchUserPerformance = createAsyncThunk(
  'statistics/fetchUserPerformance',
  async ({ userId, params }, { rejectWithValue }) => {
    try {
      const response = await statisticsService.getUserPerformance(userId, params);
      if (response.data.success) {
        return response.data.data;
      }
      return rejectWithValue(response.data.error);
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || 'Nie udało się pobrać wydajności użytkownika');
    }
  }
);

export const fetchStockLevels = createAsyncThunk(
  'statistics/fetchStockLevels',
  async (params, { rejectWithValue }) => {
    try {
      const response = await statisticsService.getStockLevels(params);
      if (response.data.success) {
        return response.data.data;
      }
      return rejectWithValue(response.data.error);
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || 'Nie udało się pobrać poziomów stanów');
    }
  }
);

export const fetchTransferStats = createAsyncThunk(
  'statistics/fetchTransferStats',
  async (params, { rejectWithValue }) => {
    try {
      const response = await statisticsService.getTransferStats(params);
      if (response.data.success) {
        return response.data.data;
      }
      return rejectWithValue(response.data.error);
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || 'Nie udało się pobrać statystyk transferów');
    }
  }
);

export const fetchBrandPerformance = createAsyncThunk(
  'statistics/fetchBrandPerformance',
  async (params, { rejectWithValue }) => {
    try {
      const response = await statisticsService.getBrandPerformance(params);
      if (response.data.success) {
        return response.data.data;
      }
      return rejectWithValue(response.data.error);
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || 'Nie udało się pobrać wydajności marki');
    }
  }
);

export const exportStatisticsReport = createAsyncThunk(
  'statistics/exportReport',
  async ({ reportType, params }, { rejectWithValue }) => {
    try {
      const response = await statisticsService.exportReport(reportType, params);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || 'Nie udało się wyeksportować raportu');
    }
  }
);

// Slice
const statisticsSlice = createSlice({
  name: 'statistics',
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
    clearStats: (state) => {
      state.dashboardStats = null;
      state.salesStats = null;
      state.salesTrend = null;
      state.inventoryStats = null;
      state.topProducts = [];
      state.salesByLocation = [];
      state.salesByProductType = null;
      state.revenueStats = null;
      state.comparisonStats = null;
      state.userPerformance = null;
      state.stockLevels = null;
      state.transferStats = null;
      state.brandPerformance = [];
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Dashboard Stats
      .addCase(fetchDashboardStats.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchDashboardStats.fulfilled, (state, action) => {
        state.loading = false;
        state.dashboardStats = action.payload;
      })
      .addCase(fetchDashboardStats.rejected, (state, action) => {
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
        state.salesStats = action.payload;
      })
      .addCase(fetchSalesStats.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Fetch Sales Trend
      .addCase(fetchSalesTrend.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchSalesTrend.fulfilled, (state, action) => {
        state.loading = false;
        state.salesTrend = action.payload;
      })
      .addCase(fetchSalesTrend.rejected, (state, action) => {
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
        state.inventoryStats = action.payload;
      })
      .addCase(fetchInventoryStats.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Fetch Top Products
      .addCase(fetchTopProducts.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchTopProducts.fulfilled, (state, action) => {
        state.loading = false;
        state.topProducts = action.payload;
      })
      .addCase(fetchTopProducts.rejected, (state, action) => {
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
        state.salesByLocation = action.payload;
      })
      .addCase(fetchSalesByLocation.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Fetch Sales By Product Type
      .addCase(fetchSalesByProductType.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchSalesByProductType.fulfilled, (state, action) => {
        state.loading = false;
        state.salesByProductType = action.payload;
      })
      .addCase(fetchSalesByProductType.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Fetch Revenue Stats
      .addCase(fetchRevenueStats.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchRevenueStats.fulfilled, (state, action) => {
        state.loading = false;
        state.revenueStats = action.payload;
      })
      .addCase(fetchRevenueStats.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Fetch Comparison Stats
      .addCase(fetchComparisonStats.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchComparisonStats.fulfilled, (state, action) => {
        state.loading = false;
        state.comparisonStats = action.payload;
      })
      .addCase(fetchComparisonStats.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Fetch User Performance
      .addCase(fetchUserPerformance.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUserPerformance.fulfilled, (state, action) => {
        state.loading = false;
        state.userPerformance = action.payload;
      })
      .addCase(fetchUserPerformance.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Fetch Stock Levels
      .addCase(fetchStockLevels.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchStockLevels.fulfilled, (state, action) => {
        state.loading = false;
        state.stockLevels = action.payload;
      })
      .addCase(fetchStockLevels.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Fetch Transfer Stats
      .addCase(fetchTransferStats.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchTransferStats.fulfilled, (state, action) => {
        state.loading = false;
        state.transferStats = action.payload;
      })
      .addCase(fetchTransferStats.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Fetch Brand Performance
      .addCase(fetchBrandPerformance.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchBrandPerformance.fulfilled, (state, action) => {
        state.loading = false;
        state.brandPerformance = action.payload;
      })
      .addCase(fetchBrandPerformance.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Export Report
      .addCase(exportStatisticsReport.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(exportStatisticsReport.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(exportStatisticsReport.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

// Actions
export const { clearError, setFilters, clearFilters, clearStats } = statisticsSlice.actions;

// Selectors
export const selectDashboardStats = (state) => state.statistics.dashboardStats;
export const selectSalesStats = (state) => state.statistics.salesStats;
export const selectSalesTrend = (state) => state.statistics.salesTrend;
export const selectInventoryStats = (state) => state.statistics.inventoryStats;
export const selectTopProducts = (state) => state.statistics.topProducts;
export const selectSalesByLocation = (state) => state.statistics.salesByLocation;
export const selectSalesByProductType = (state) => state.statistics.salesByProductType;
export const selectRevenueStats = (state) => state.statistics.revenueStats;
export const selectComparisonStats = (state) => state.statistics.comparisonStats;
export const selectUserPerformance = (state) => state.statistics.userPerformance;
export const selectStockLevels = (state) => state.statistics.stockLevels;
export const selectTransferStats = (state) => state.statistics.transferStats;
export const selectBrandPerformance = (state) => state.statistics.brandPerformance;
export const selectStatisticsLoading = (state) => state.statistics.loading;
export const selectStatisticsError = (state) => state.statistics.error;
export const selectStatisticsFilters = (state) => state.statistics.filters;

export default statisticsSlice.reducer;
