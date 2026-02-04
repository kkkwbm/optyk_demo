import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import historyService from '../../services/historyService';

// Initial state
const initialState = {
  items: [],
  currentEntry: null,
  revertibleOperations: [],
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
    operationType: null,
    entityType: null,
    userId: null,
    locationId: null,
    startDate: null,
    endDate: null,
    search: '',
  },
};

// Async thunks
export const fetchHistory = createAsyncThunk(
  'history/fetchHistory',
  async (params, { getState, rejectWithValue }) => {
    // Skip API call in demo mode
    if (getState().auth.isDemo) {
      const items = getState().history.items;
      return { content: items, totalElements: items.length, page: 0, size: 20, totalPages: 1 };
    }
    try {
      const response = await historyService.getHistory(params);
      if (response.data.success) {
        return response.data.data;
      }
      return rejectWithValue(response.data.error);
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || 'Nie udało się pobrać historii');
    }
  }
);

export const fetchHistoryById = createAsyncThunk(
  'history/fetchHistoryById',
  async (id, { getState, rejectWithValue }) => {
    // Skip API call in demo mode
    if (getState().auth.isDemo) {
      const entry = getState().history.items.find(h => h.id === id);
      return entry || null;
    }
    try {
      const response = await historyService.getHistoryById(id);
      if (response.data.success) {
        return response.data.data;
      }
      return rejectWithValue(response.data.error);
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || 'Nie udało się pobrać wpisu historii');
    }
  }
);

export const fetchEntityHistory = createAsyncThunk(
  'history/fetchEntityHistory',
  async ({ entityType, entityId, params }, { rejectWithValue }) => {
    try {
      const response = await historyService.getEntityHistory(entityType, entityId, params);
      if (response.data.success) {
        return response.data.data;
      }
      return rejectWithValue(response.data.error);
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || 'Nie udało się pobrać historii encji');
    }
  }
);

export const fetchHistoryByOperation = createAsyncThunk(
  'history/fetchHistoryByOperation',
  async ({ operationType, params }, { rejectWithValue }) => {
    try {
      const response = await historyService.getHistoryByOperation(operationType, params);
      if (response.data.success) {
        return response.data.data;
      }
      return rejectWithValue(response.data.error);
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || 'Nie udało się pobrać historii według operacji');
    }
  }
);

export const fetchUserHistory = createAsyncThunk(
  'history/fetchUserHistory',
  async ({ userId, params }, { rejectWithValue }) => {
    try {
      const response = await historyService.getUserHistory(userId, params);
      if (response.data.success) {
        return response.data.data;
      }
      return rejectWithValue(response.data.error);
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || 'Nie udało się pobrać historii użytkownika');
    }
  }
);

export const fetchLocationHistory = createAsyncThunk(
  'history/fetchLocationHistory',
  async ({ locationId, params }, { rejectWithValue }) => {
    try {
      const response = await historyService.getLocationHistory(locationId, params);
      if (response.data.success) {
        return response.data.data;
      }
      return rejectWithValue(response.data.error);
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || 'Nie udało się pobrać historii lokalizacji');
    }
  }
);

export const revertOperation = createAsyncThunk(
  'history/revertOperation',
  async ({ id, reason }, { rejectWithValue }) => {
    try {
      const response = await historyService.revertOperation(id, reason);
      if (response.data.success) {
        return response.data.data;
      }
      return rejectWithValue(response.data.error);
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || 'Nie udało się cofnąć operacji');
    }
  }
);

export const checkCanRevert = createAsyncThunk(
  'history/checkCanRevert',
  async (id, { rejectWithValue }) => {
    try {
      const response = await historyService.canRevert(id);
      if (response.data.success) {
        return response.data.data;
      }
      return rejectWithValue(response.data.error);
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || 'Nie udało się sprawdzić statusu cofnięcia');
    }
  }
);

export const fetchRevertibleOperations = createAsyncThunk(
  'history/fetchRevertibleOperations',
  async (params, { rejectWithValue }) => {
    try {
      const response = await historyService.getRevertibleOperations(params);
      if (response.data.success) {
        return response.data.data;
      }
      return rejectWithValue(response.data.error);
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || 'Nie udało się pobrać operacji możliwych do cofnięcia');
    }
  }
);

export const fetchHistoryStats = createAsyncThunk(
  'history/fetchHistoryStats',
  async (params, { rejectWithValue }) => {
    try {
      const response = await historyService.getHistoryStats(params);
      if (response.data.success) {
        return response.data.data;
      }
      return rejectWithValue(response.data.error);
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || 'Nie udało się pobrać statystyk historii');
    }
  }
);

export const fetchRecentOperations = createAsyncThunk(
  'history/fetchRecentOperations',
  async ({ limit, locationId }, { rejectWithValue }) => {
    try {
      const response = await historyService.getRecentOperations(limit, locationId);
      if (response.data.success) {
        return response.data.data;
      }
      return rejectWithValue(response.data.error);
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || 'Nie udało się pobrać ostatnich operacji');
    }
  }
);

export const searchHistory = createAsyncThunk(
  'history/searchHistory',
  async ({ query, params }, { rejectWithValue }) => {
    try {
      const response = await historyService.searchHistory(query, params);
      if (response.data.success) {
        return response.data.data;
      }
      return rejectWithValue(response.data.error);
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || 'Nie udało się wyszukać historii');
    }
  }
);

export const deleteHistory = createAsyncThunk(
  'history/deleteHistory',
  async (id, { rejectWithValue }) => {
    try {
      const response = await historyService.deleteHistory(id);
      if (response.data.success) {
        return id;
      }
      return rejectWithValue(response.data.error);
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || 'Nie udało się usunąć wpisu historii');
    }
  }
);

export const deleteAllHistory = createAsyncThunk(
  'history/deleteAllHistory',
  async (locationId, { rejectWithValue }) => {
    try {
      const response = await historyService.deleteAllHistory(locationId);
      if (response.data.success) {
        return { locationId, message: response.data.message };
      }
      return rejectWithValue(response.data.error);
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || 'Nie udało się usunąć wszystkich wpisów historii');
    }
  }
);

export const deleteManyHistory = createAsyncThunk(
  'history/deleteManyHistory',
  async (ids, { rejectWithValue }) => {
    try {
      const response = await historyService.deleteManyHistory(ids);
      if (response.data.success) {
        return { ids, message: response.data.message };
      }
      return rejectWithValue(response.data.error);
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || 'Nie udało się usunąć wybranych wpisów historii');
    }
  }
);

// Slice
const historySlice = createSlice({
  name: 'history',
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
    clearCurrentEntry: (state) => {
      state.currentEntry = null;
    },
    setDemoHistory: (state) => {
      // Initialize with empty history for demo mode
      // History data will be generated by MSW handlers if needed
      state.items = [];
      state.loading = false;
      state.pagination = {
        page: 0,
        size: 20,
        totalElements: 0,
        totalPages: 0,
      };
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch History
      .addCase(fetchHistory.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchHistory.fulfilled, (state, action) => {
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
      .addCase(fetchHistory.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Fetch History By ID
      .addCase(fetchHistoryById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchHistoryById.fulfilled, (state, action) => {
        state.loading = false;
        state.currentEntry = action.payload;
      })
      .addCase(fetchHistoryById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Fetch Entity History
      .addCase(fetchEntityHistory.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchEntityHistory.fulfilled, (state, action) => {
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
      .addCase(fetchEntityHistory.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Fetch History By Operation
      .addCase(fetchHistoryByOperation.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchHistoryByOperation.fulfilled, (state, action) => {
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
      .addCase(fetchHistoryByOperation.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Fetch User History
      .addCase(fetchUserHistory.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUserHistory.fulfilled, (state, action) => {
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
      .addCase(fetchUserHistory.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Fetch Location History
      .addCase(fetchLocationHistory.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchLocationHistory.fulfilled, (state, action) => {
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
      .addCase(fetchLocationHistory.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Revert Operation
      .addCase(revertOperation.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(revertOperation.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(revertOperation.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Fetch Revertible Operations
      .addCase(fetchRevertibleOperations.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchRevertibleOperations.fulfilled, (state, action) => {
        state.loading = false;
        state.revertibleOperations = action.payload;
      })
      .addCase(fetchRevertibleOperations.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Fetch History Stats
      .addCase(fetchHistoryStats.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchHistoryStats.fulfilled, (state, action) => {
        state.loading = false;
        state.stats = action.payload;
      })
      .addCase(fetchHistoryStats.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Search History
      .addCase(searchHistory.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(searchHistory.fulfilled, (state, action) => {
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
      .addCase(searchHistory.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Delete History
      .addCase(deleteHistory.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteHistory.fulfilled, (state, action) => {
        state.loading = false;
        state.items = state.items.filter(item => item.id !== action.payload);
        if (state.pagination.totalElements > 0) {
          state.pagination.totalElements -= 1;
        }
      })
      .addCase(deleteHistory.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Delete All History
      .addCase(deleteAllHistory.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteAllHistory.fulfilled, (state) => {
        state.loading = false;
        state.items = [];
        state.pagination = {
          page: 0,
          size: 20,
          totalElements: 0,
          totalPages: 0,
        };
      })
      .addCase(deleteAllHistory.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Delete Many History
      .addCase(deleteManyHistory.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteManyHistory.fulfilled, (state, action) => {
        state.loading = false;
        state.items = state.items.filter(item => !action.payload.ids.includes(item.id));
        if (state.pagination.totalElements > 0) {
          state.pagination.totalElements -= action.payload.ids.length;
        }
      })
      .addCase(deleteManyHistory.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

// Actions
export const { clearError, setFilters, clearFilters, clearCurrentEntry, setDemoHistory } = historySlice.actions;

// Selectors
export const selectHistoryItems = (state) => state.history.items;
export const selectCurrentHistoryEntry = (state) => state.history.currentEntry;
export const selectRevertibleOperations = (state) => state.history.revertibleOperations;
export const selectHistoryStats = (state) => state.history.stats;
export const selectHistoryLoading = (state) => state.history.loading;
export const selectHistoryError = (state) => state.history.error;
export const selectHistoryPagination = (state) => state.history.pagination;
export const selectHistoryFilters = (state) => state.history.filters;

export default historySlice.reducer;
