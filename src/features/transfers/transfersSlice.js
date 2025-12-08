import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import transferService from '../../services/transferService';

// Initial state
const initialState = {
  items: [],
  currentTransfer: null,
  incomingTransfers: [],
  outgoingTransfers: [],
  pendingIncomingCount: 0,
  returnTransfer: null,
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
    fromLocationId: null,
    toLocationId: null,
    status: null,
    startDate: null,
    endDate: null,
    search: '',
  },
};

// Async thunks
export const fetchTransfers = createAsyncThunk(
  'transfers/fetchTransfers',
  async (params, { rejectWithValue }) => {
    try {
      const response = await transferService.getTransfers(params);
      if (response.data.success) {
        return response.data.data;
      }
      return rejectWithValue(response.data.error);
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || 'Failed to fetch transfers');
    }
  }
);

export const fetchTransferById = createAsyncThunk(
  'transfers/fetchTransferById',
  async (id, { rejectWithValue }) => {
    try {
      const response = await transferService.getTransferById(id);
      if (response.data.success) {
        return response.data.data;
      }
      return rejectWithValue(response.data.error);
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || 'Failed to fetch transfer');
    }
  }
);

export const createTransfer = createAsyncThunk(
  'transfers/createTransfer',
  async (data, { rejectWithValue }) => {
    try {
      const response = await transferService.createTransfer(data);
      if (response.data.success) {
        return response.data.data;
      }
      return rejectWithValue(response.data.error);
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || 'Failed to create transfer');
    }
  }
);

export const confirmTransfer = createAsyncThunk(
  'transfers/confirmTransfer',
  async ({ id, notes, acceptedItems }, { rejectWithValue }) => {
    try {
      const response = await transferService.confirmTransfer(id, { notes, acceptedItems });
      if (response.data.success) {
        return response.data.data;
      }
      return rejectWithValue(response.data.error);
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || 'Failed to confirm transfer');
    }
  }
);

export const rejectTransfer = createAsyncThunk(
  'transfers/rejectTransfer',
  async ({ id, rejectionReason }, { rejectWithValue }) => {
    try {
      const response = await transferService.rejectTransfer(id, { rejectionReason });
      if (response.data.success) {
        return response.data.data;
      }
      return rejectWithValue(response.data.error);
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || 'Failed to reject transfer');
    }
  }
);

export const cancelTransfer = createAsyncThunk(
  'transfers/cancelTransfer',
  async ({ id, cancellationReason }, { rejectWithValue }) => {
    try {
      const response = await transferService.cancelTransfer(id, { cancellationReason });
      if (response.data.success) {
        return response.data.data;
      }
      return rejectWithValue(response.data.error);
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || 'Failed to cancel transfer');
    }
  }
);

export const fetchIncomingTransfers = createAsyncThunk(
  'transfers/fetchIncomingTransfers',
  async ({ locationId, status }, { rejectWithValue }) => {
    try {
      const response = await transferService.getIncomingTransfers(locationId, status);
      if (response.data.success) {
        return response.data.data;
      }
      return rejectWithValue(response.data.error);
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || 'Failed to fetch incoming transfers');
    }
  }
);

export const fetchOutgoingTransfers = createAsyncThunk(
  'transfers/fetchOutgoingTransfers',
  async ({ locationId, status }, { rejectWithValue }) => {
    try {
      const response = await transferService.getOutgoingTransfers(locationId, status);
      if (response.data.success) {
        return response.data.data;
      }
      return rejectWithValue(response.data.error);
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || 'Failed to fetch outgoing transfers');
    }
  }
);

export const fetchPendingIncomingCount = createAsyncThunk(
  'transfers/fetchPendingIncomingCount',
  async (locationId, { rejectWithValue }) => {
    try {
      const response = await transferService.getPendingIncomingCount(locationId);
      if (response.data.success) {
        return response.data.data;
      }
      return rejectWithValue(response.data.error);
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || 'Failed to fetch pending count');
    }
  }
);

export const fetchReturnTransfer = createAsyncThunk(
  'transfers/fetchReturnTransfer',
  async (originalTransferId, { rejectWithValue }) => {
    try {
      const response = await transferService.getReturnTransfer(originalTransferId);
      if (response.data.success) {
        return response.data.data;
      }
      return rejectWithValue(response.data.error);
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || 'Failed to fetch return transfer');
    }
  }
);

export const fetchTransfersByLocation = createAsyncThunk(
  'transfers/fetchTransfersByLocation',
  async ({ locationId, params }, { rejectWithValue }) => {
    try {
      const response = await transferService.getTransfersByLocation(locationId, params);
      if (response.data.success) {
        return response.data.data;
      }
      return rejectWithValue(response.data.error);
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || 'Failed to fetch transfers by location');
    }
  }
);

export const fetchTransferStats = createAsyncThunk(
  'transfers/fetchTransferStats',
  async (params, { rejectWithValue }) => {
    try {
      const response = await transferService.getTransferStats(params);
      if (response.data.success) {
        return response.data.data;
      }
      return rejectWithValue(response.data.error);
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || 'Failed to fetch transfer stats');
    }
  }
);

export const validateTransfer = createAsyncThunk(
  'transfers/validateTransfer',
  async (data, { rejectWithValue }) => {
    try {
      const response = await transferService.validateTransfer(data);
      if (response.data.success) {
        return response.data.data;
      }
      return rejectWithValue(response.data.error);
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || 'Failed to validate transfer');
    }
  }
);

export const searchTransfers = createAsyncThunk(
  'transfers/searchTransfers',
  async ({ query, params }, { rejectWithValue }) => {
    try {
      const response = await transferService.searchTransfers(query, params);
      if (response.data.success) {
        return response.data.data;
      }
      return rejectWithValue(response.data.error);
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || 'Failed to search transfers');
    }
  }
);

export const deleteTransfer = createAsyncThunk(
  'transfers/deleteTransfer',
  async (id, { rejectWithValue }) => {
    try {
      const response = await transferService.deleteTransfer(id);
      if (response.data.success) {
        return id;
      }
      return rejectWithValue(response.data.error);
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || 'Failed to delete transfer');
    }
  }
);

// Slice
const transfersSlice = createSlice({
  name: 'transfers',
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
    clearCurrentTransfer: (state) => {
      state.currentTransfer = null;
    },
    clearReturnTransfer: (state) => {
      state.returnTransfer = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Transfers
      .addCase(fetchTransfers.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchTransfers.fulfilled, (state, action) => {
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
      .addCase(fetchTransfers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Fetch Transfer By ID
      .addCase(fetchTransferById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchTransferById.fulfilled, (state, action) => {
        state.loading = false;
        state.currentTransfer = action.payload;
      })
      .addCase(fetchTransferById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Create Transfer
      .addCase(createTransfer.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createTransfer.fulfilled, (state, action) => {
        state.loading = false;
        state.items.unshift(action.payload);
      })
      .addCase(createTransfer.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Confirm Transfer
      .addCase(confirmTransfer.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(confirmTransfer.fulfilled, (state, action) => {
        state.loading = false;
        // Update in list
        const index = state.items.findIndex(t => t.id === action.payload.id);
        if (index !== -1) {
          state.items[index] = action.payload;
        }
        // Update current transfer
        if (state.currentTransfer?.id === action.payload.id) {
          state.currentTransfer = action.payload;
        }
        // Remove from incoming transfers
        state.incomingTransfers = state.incomingTransfers.filter(t => t.id !== action.payload.id);
      })
      .addCase(confirmTransfer.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Reject Transfer
      .addCase(rejectTransfer.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(rejectTransfer.fulfilled, (state, action) => {
        state.loading = false;
        // Update in list
        const index = state.items.findIndex(t => t.id === action.payload.id);
        if (index !== -1) {
          state.items[index] = action.payload;
        }
        // Update current transfer
        if (state.currentTransfer?.id === action.payload.id) {
          state.currentTransfer = action.payload;
        }
        // Remove from incoming transfers
        state.incomingTransfers = state.incomingTransfers.filter(t => t.id !== action.payload.id);
      })
      .addCase(rejectTransfer.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Cancel Transfer
      .addCase(cancelTransfer.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(cancelTransfer.fulfilled, (state, action) => {
        state.loading = false;
        // Update in list
        const index = state.items.findIndex(t => t.id === action.payload.id);
        if (index !== -1) {
          state.items[index] = action.payload;
        }
        // Update current transfer
        if (state.currentTransfer?.id === action.payload.id) {
          state.currentTransfer = action.payload;
        }
        // Remove from outgoing transfers
        state.outgoingTransfers = state.outgoingTransfers.filter(t => t.id !== action.payload.id);
      })
      .addCase(cancelTransfer.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Fetch Incoming Transfers
      .addCase(fetchIncomingTransfers.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchIncomingTransfers.fulfilled, (state, action) => {
        state.loading = false;
        state.incomingTransfers = action.payload;
      })
      .addCase(fetchIncomingTransfers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Fetch Outgoing Transfers
      .addCase(fetchOutgoingTransfers.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchOutgoingTransfers.fulfilled, (state, action) => {
        state.loading = false;
        state.outgoingTransfers = action.payload;
      })
      .addCase(fetchOutgoingTransfers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Fetch Pending Incoming Count
      .addCase(fetchPendingIncomingCount.pending, (state) => {
        state.error = null;
      })
      .addCase(fetchPendingIncomingCount.fulfilled, (state, action) => {
        state.pendingIncomingCount = action.payload;
      })
      .addCase(fetchPendingIncomingCount.rejected, (state, action) => {
        state.error = action.payload;
      })
      // Fetch Return Transfer
      .addCase(fetchReturnTransfer.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchReturnTransfer.fulfilled, (state, action) => {
        state.loading = false;
        state.returnTransfer = action.payload;
      })
      .addCase(fetchReturnTransfer.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Fetch Transfers By Location
      .addCase(fetchTransfersByLocation.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchTransfersByLocation.fulfilled, (state, action) => {
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
      .addCase(fetchTransfersByLocation.rejected, (state, action) => {
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
        state.stats = action.payload;
      })
      .addCase(fetchTransferStats.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Validate Transfer
      .addCase(validateTransfer.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(validateTransfer.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(validateTransfer.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Search Transfers
      .addCase(searchTransfers.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(searchTransfers.fulfilled, (state, action) => {
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
      .addCase(searchTransfers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Delete Transfer
      .addCase(deleteTransfer.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteTransfer.fulfilled, (state, action) => {
        state.loading = false;
        // Remove from list
        state.items = state.items.filter(t => t.id !== action.payload);
        // Remove from incoming/outgoing transfers
        state.incomingTransfers = state.incomingTransfers.filter(t => t.id !== action.payload);
        state.outgoingTransfers = state.outgoingTransfers.filter(t => t.id !== action.payload);
      })
      .addCase(deleteTransfer.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

// Actions
export const { clearError, setFilters, clearFilters, clearCurrentTransfer, clearReturnTransfer } = transfersSlice.actions;

// Selectors
export const selectTransfers = (state) => state.transfers.items;
export const selectCurrentTransfer = (state) => state.transfers.currentTransfer;
export const selectIncomingTransfers = (state) => state.transfers.incomingTransfers;
export const selectOutgoingTransfers = (state) => state.transfers.outgoingTransfers;
export const selectPendingIncomingCount = (state) => state.transfers.pendingIncomingCount;
export const selectReturnTransfer = (state) => state.transfers.returnTransfer;
export const selectTransferStats = (state) => state.transfers.stats;
export const selectTransfersLoading = (state) => state.transfers.loading;
export const selectTransfersError = (state) => state.transfers.error;
export const selectTransfersPagination = (state) => state.transfers.pagination;
export const selectTransfersFilters = (state) => state.transfers.filters;

export default transfersSlice.reducer;
