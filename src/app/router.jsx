import { createBrowserRouter, Navigate } from 'react-router-dom';
import { lazy, Suspense } from 'react';
import ProtectedRoute from '../shared/components/ProtectedRoute';
import LoadingSpinner from '../shared/components/LoadingSpinner';
import AppLayout from '../shared/layouts/AppLayout';

// Lazy load pages for code splitting
const LoginPage = lazy(() => import('../features/auth/pages/LoginPage'));
const UnauthorizedPage = lazy(() => import('../shared/pages/UnauthorizedPage'));
const NotFoundPage = lazy(() => import('../shared/pages/NotFoundPage'));

// Statistics (ADMIN, OWNER only)
const StatisticsPage = lazy(() => import('../features/statistics/pages/DashboardPage'));

// Users Management (ADMIN, OWNER)
const UsersListPage = lazy(() => import('../features/users/pages/UsersListPage'));
const UserDetailsPage = lazy(() => import('../features/users/pages/UserDetailsPage'));
const CreateUserPage = lazy(() => import('../features/users/pages/CreateUserPage'));

// Products Management
const ProductsListPage = lazy(() => import('../features/products/pages/ProductsListPage'));
const ProductDetailsPage = lazy(() => import('../features/products/pages/ProductDetailsPage'));
const CreateProductPage = lazy(() => import('../features/products/pages/CreateProductPage'));

// Inventory Management
const InventoryPage = lazy(() => import('../features/inventory/pages/InventoryDashboardPage'));

// Sales Management
const SalesListPage = lazy(() => import('../features/sales/pages/SalesListPage'));
const CreateSalePage = lazy(() => import('../features/sales/pages/CreateSalePage'));
const SaleDetailsPage = lazy(() => import('../features/sales/pages/SaleDetailsPage'));

// Transfer Management
const TransfersListPage = lazy(() => import('../features/transfers/pages/TransfersListPage'));
const PendingTransfersPage = lazy(() => import('../features/transfers/pages/PendingTransfersPage'));
const CreateTransferPage = lazy(() => import('../features/transfers/pages/CreateTransferPage'));
const TransferDetailsPage = lazy(() => import('../features/transfers/pages/TransferDetailsPage'));

// Operation History
const HistoryPage = lazy(() => import('../features/history/pages/HistoryListPage'));

// Brand Management
const BrandsPage = lazy(() => import('../features/brands/pages/BrandsPage'));

// Profile & Settings
const ProfilePage = lazy(() => import('../features/auth/pages/ProfilePage'));
const ChangePasswordPage = lazy(() => import('../features/auth/pages/ChangePasswordPage'));
const SettingsPage = lazy(() => import('../features/settings/pages/SettingsPage'));

// Wrapper component for Suspense
const SuspenseWrapper = ({ children }) => (
  <Suspense fallback={<LoadingSpinner />}>
    {children}
  </Suspense>
);

const router = createBrowserRouter([
  // Public routes
  {
    path: '/login',
    element: (
      <SuspenseWrapper>
        <LoginPage />
      </SuspenseWrapper>
    ),
  },
  {
    path: '/unauthorized',
    element: (
      <SuspenseWrapper>
        <UnauthorizedPage />
      </SuspenseWrapper>
    ),
  },

  // Protected routes with AppLayout
  {
    path: '/',
    element: (
      <ProtectedRoute>
        <AppLayout />
      </ProtectedRoute>
    ),
    children: [
      // Redirect root to inventory
      {
        index: true,
        element: <Navigate to="/inventory" replace />,
      },

      // Statistics (All roles)
      {
        path: 'statistics',
        element: (
          <SuspenseWrapper>
            <StatisticsPage />
          </SuspenseWrapper>
        ),
      },

      // Users Management (ADMIN, OWNER only)
      {
        path: 'users',
        children: [
          {
            index: true,
            element: (
              <ProtectedRoute allowedRoles={['ADMIN', 'OWNER']}>
                <SuspenseWrapper>
                  <UsersListPage />
                </SuspenseWrapper>
              </ProtectedRoute>
            ),
          },
          {
            path: 'create',
            element: (
              <ProtectedRoute allowedRoles={['ADMIN']}>
                <SuspenseWrapper>
                  <CreateUserPage />
                </SuspenseWrapper>
              </ProtectedRoute>
            ),
          },
          {
            path: ':id',
            element: (
              <ProtectedRoute allowedRoles={['ADMIN', 'OWNER']}>
                <SuspenseWrapper>
                  <UserDetailsPage />
                </SuspenseWrapper>
              </ProtectedRoute>
            ),
          },
        ],
      },

      // Redirect old products route to inventory
      {
        path: 'products',
        element: <Navigate to="/inventory" replace />,
      },
      {
        path: 'products/*',
        element: <Navigate to="/inventory" replace />,
      },

      // Inventory Management (All roles) - now includes product management
      {
        path: 'inventory',
        children: [
          {
            index: true,
            element: (
              <SuspenseWrapper>
                <InventoryPage />
              </SuspenseWrapper>
            ),
          },
          {
            path: 'create',
            element: (
              <SuspenseWrapper>
                <CreateProductPage />
              </SuspenseWrapper>
            ),
          },
          {
            path: ':id',
            element: (
              <SuspenseWrapper>
                <ProductDetailsPage />
              </SuspenseWrapper>
            ),
          },
        ],
      },

      // Sales Management (All roles)
      {
        path: 'sales',
        children: [
          {
            index: true,
            element: (
              <SuspenseWrapper>
                <SalesListPage />
              </SuspenseWrapper>
            ),
          },
          {
            path: 'create',
            element: (
              <SuspenseWrapper>
                <CreateSalePage />
              </SuspenseWrapper>
            ),
          },
          {
            path: ':id',
            element: (
              <SuspenseWrapper>
                <SaleDetailsPage />
              </SuspenseWrapper>
            ),
          },
        ],
      },

      // Transfer Management (All roles)
      {
        path: 'transfers',
        children: [
          {
            index: true,
            element: (
              <SuspenseWrapper>
                <TransfersListPage />
              </SuspenseWrapper>
            ),
          },
          {
            path: 'pending',
            element: (
              <SuspenseWrapper>
                <PendingTransfersPage />
              </SuspenseWrapper>
            ),
          },
          {
            path: 'create',
            element: (
              <SuspenseWrapper>
                <CreateTransferPage />
              </SuspenseWrapper>
            ),
          },
          {
            path: ':id',
            element: (
              <SuspenseWrapper>
                <TransferDetailsPage />
              </SuspenseWrapper>
            ),
          },
        ],
      },

      // Operation History (All roles)
      {
        path: 'history',
        element: (
          <SuspenseWrapper>
            <HistoryPage />
          </SuspenseWrapper>
        ),
      },

      // Brand Management (All roles)
      {
        path: 'brands',
        element: (
          <SuspenseWrapper>
            <BrandsPage />
          </SuspenseWrapper>
        ),
      },

      // Profile & Settings
      {
        path: 'profile',
        element: (
          <SuspenseWrapper>
            <ProfilePage />
          </SuspenseWrapper>
        ),
      },
      {
        path: 'change-password',
        element: (
          <SuspenseWrapper>
            <ChangePasswordPage />
          </SuspenseWrapper>
        ),
      },
      {
        path: 'settings',
        element: (
          <SuspenseWrapper>
            <SettingsPage />
          </SuspenseWrapper>
        ),
      },
    ],
  },

  // 404 Not Found
  {
    path: '*',
    element: (
      <SuspenseWrapper>
        <NotFoundPage />
      </SuspenseWrapper>
    ),
  },
]);

export default router;
