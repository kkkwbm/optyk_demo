import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import productService from '../../services/productService';
import { PRODUCT_TYPES } from '../../constants';

// Initial state
const initialState = {
  items: [],
  currentProduct: null,
  currentType: PRODUCT_TYPES.FRAME,
  loading: false,
  error: null,
  pagination: {
    page: 0,
    size: 20,
    totalElements: 0,
    totalPages: 0,
  },
  filters: {
    brandId: null,
    status: null,
    search: '',
  },
};

// Async thunks
export const fetchProducts = createAsyncThunk(
  'products/fetchProducts',
  async ({ type, params }, { rejectWithValue }) => {
    try {
      const response = await productService.getProducts(type, params);
      if (response.data.success) {
        return { type, data: response.data.data };
      }
      return rejectWithValue(response.data.error);
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || 'Failed to fetch products');
    }
  }
);

export const fetchProductById = createAsyncThunk(
  'products/fetchProductById',
  async ({ type, id }, { rejectWithValue }) => {
    try {
      const response = await productService.getProductById(type, id);
      if (response.data.success) {
        return response.data.data;
      }
      return rejectWithValue(response.data.error);
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || 'Failed to fetch product');
    }
  }
);

export const createProduct = createAsyncThunk(
  'products/createProduct',
  async ({ type, data }, { rejectWithValue }) => {
    try {
      const response = await productService.createProduct(type, data);
      if (response.data.success) {
        return response.data.data;
      }
      return rejectWithValue(response.data.error);
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || 'Failed to create product');
    }
  }
);

export const updateProduct = createAsyncThunk(
  'products/updateProduct',
  async ({ type, id, data }, { rejectWithValue }) => {
    try {
      const response = await productService.updateProduct(type, id, data);
      if (response.data.success) {
        return response.data.data;
      }
      return rejectWithValue(response.data.error);
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || 'Failed to update product');
    }
  }
);

export const deleteProduct = createAsyncThunk(
  'products/deleteProduct',
  async ({ type, id }, { rejectWithValue }) => {
    try {
      const response = await productService.deleteProduct(type, id);
      // Backend returns 204 No Content on success, so response.data will be empty
      if (response.status === 204 || response.data?.success) {
        return { id };
      }
      return rejectWithValue(response.data?.error || 'Failed to delete product');
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || error.message || 'Failed to delete product');
    }
  }
);

export const restoreProduct = createAsyncThunk(
  'products/restoreProduct',
  async ({ type, id }, { rejectWithValue }) => {
    try {
      const response = await productService.restoreProduct(type, id);
      if (response.data.success) {
        return response.data.data;
      }
      return rejectWithValue(response.data.error);
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || 'Failed to restore product');
    }
  }
);

export const advancedSearchProducts = createAsyncThunk(
  'products/advancedSearch',
  async ({ type, filters }, { rejectWithValue }) => {
    try {
      const response = await productService.advancedSearch(type, filters);
      if (response.data.success) {
        return response.data.data;
      }
      return rejectWithValue(response.data.error);
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || 'Failed to search products');
    }
  }
);

export const fetchProductInventory = createAsyncThunk(
  'products/fetchProductInventory',
  async ({ type, id }, { rejectWithValue }) => {
    try {
      const response = await productService.getProductInventory(type, id);
      if (response.data.success) {
        return response.data.data;
      }
      return rejectWithValue(response.data.error);
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || 'Failed to fetch product inventory');
    }
  }
);

export const fetchAllProducts = createAsyncThunk(
  'products/fetchAll',
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await productService.getAllProducts(params);
      if (response.data.success) {
        return response.data.data;
      }
      return rejectWithValue(response.data.error);
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || 'Failed to fetch all products');
    }
  }
);

export const searchAllProducts = createAsyncThunk(
  'products/searchAll',
  async ({ query, params }, { rejectWithValue }) => {
    try {
      const response = await productService.searchAllProducts(query, params);
      if (response.data.success) {
        return response.data.data;
      }
      return rejectWithValue(response.data.error);
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || 'Failed to search products');
    }
  }
);

// Slice
const productsSlice = createSlice({
  name: 'products',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setCurrentType: (state, action) => {
      state.currentType = action.payload;
    },
    setFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    clearFilters: (state) => {
      state.filters = initialState.filters;
    },
    clearCurrentProduct: (state) => {
      state.currentProduct = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Products
      .addCase(fetchProducts.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchProducts.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload.data.content || action.payload.data;
        if (action.payload.data.page !== undefined) {
          state.pagination = {
            page: action.payload.data.page,
            size: action.payload.data.size,
            totalElements: action.payload.data.totalElements,
            totalPages: action.payload.data.totalPages,
          };
        }
      })
      .addCase(fetchProducts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Fetch Product By ID
      .addCase(fetchProductById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchProductById.fulfilled, (state, action) => {
        state.loading = false;
        state.currentProduct = action.payload;
      })
      .addCase(fetchProductById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Create Product
      .addCase(createProduct.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createProduct.fulfilled, (state, action) => {
        state.loading = false;
        state.items.unshift(action.payload);
      })
      .addCase(createProduct.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Update Product
      .addCase(updateProduct.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateProduct.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.items.findIndex(product => product.id === action.payload.id);
        if (index !== -1) {
          state.items[index] = action.payload;
        }
        if (state.currentProduct?.id === action.payload.id) {
          state.currentProduct = action.payload;
        }
      })
      .addCase(updateProduct.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Delete Product
      .addCase(deleteProduct.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteProduct.fulfilled, (state, action) => {
        state.loading = false;
        state.items = state.items.filter(product => product.id !== action.payload.id);
      })
      .addCase(deleteProduct.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Restore Product
      .addCase(restoreProduct.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(restoreProduct.fulfilled, (state, action) => {
        state.loading = false;
        state.items.unshift(action.payload);
      })
      .addCase(restoreProduct.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Advanced Search
      .addCase(advancedSearchProducts.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(advancedSearchProducts.fulfilled, (state, action) => {
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
      .addCase(advancedSearchProducts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Fetch Product Inventory
      .addCase(fetchProductInventory.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchProductInventory.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(fetchProductInventory.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Fetch All Products
      .addCase(fetchAllProducts.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAllProducts.fulfilled, (state, action) => {
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
      .addCase(fetchAllProducts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Search All Products
      .addCase(searchAllProducts.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(searchAllProducts.fulfilled, (state, action) => {
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
      .addCase(searchAllProducts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

// Actions
export const { clearError, setCurrentType, setFilters, clearFilters, clearCurrentProduct } = productsSlice.actions;

// Selectors
export const selectProducts = (state) => state.products.items;
export const selectCurrentProduct = (state) => state.products.currentProduct;
export const selectCurrentType = (state) => state.products.currentType;
export const selectProductsLoading = (state) => state.products.loading;
export const selectProductsError = (state) => state.products.error;
export const selectProductsPagination = (state) => state.products.pagination;
export const selectProductsFilters = (state) => state.products.filters;

export default productsSlice.reducer;
