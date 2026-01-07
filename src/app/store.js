import { configureStore } from '@reduxjs/toolkit';
import authReducer from '../features/auth/authSlice';
import uiReducer from './uiSlice';
import usersReducer from '../features/users/usersSlice';
import productsReducer from '../features/products/productsSlice';
import inventoryReducer from '../features/inventory/inventorySlice';
import salesReducer from '../features/sales/salesSlice';
import transfersReducer from '../features/transfers/transfersSlice';
import brandsReducer from '../features/brands/brandsSlice';
import locationsReducer from '../features/locations/locationsSlice';
import historyReducer from '../features/history/historySlice';
import statisticsReducer from '../features/statistics/statisticsSlice';
import companySettingsReducer from '../features/settings/companySettingsSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    ui: uiReducer,
    users: usersReducer,
    products: productsReducer,
    inventory: inventoryReducer,
    sales: salesReducer,
    transfers: transfersReducer,
    brands: brandsReducer,
    locations: locationsReducer,
    history: historyReducer,
    statistics: statisticsReducer,
    companySettings: companySettingsReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        // Ignore these action types for serializable check
        ignoredActions: ['ui/addNotification'],
      },
    }),
});

export default store;
