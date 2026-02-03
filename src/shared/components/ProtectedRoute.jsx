import { Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { selectIsAuthenticated, selectUser, selectAuthInitializing } from '../../features/auth/authSlice';
import LoadingSpinner from './LoadingSpinner';

/**
 * ProtectedRoute component - Wraps routes that require authentication
 *
 * @param {Object} props
 * @param {React.ReactNode} props.children - Child components to render if authenticated
 * @param {string[]} props.allowedRoles - Array of roles allowed to access this route (optional)
 * @param {string} props.redirectTo - Path to redirect to if not authenticated (default: '/login')
 */
function ProtectedRoute({ children, allowedRoles = null, redirectTo = '/inventory' }) {
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const user = useSelector(selectUser);
  const initializing = useSelector(selectAuthInitializing);

  // Show loading spinner while checking authentication
  if (initializing) {
    return <LoadingSpinner />;
  }

  // Check authentication
  if (!isAuthenticated) {
    return <Navigate to={redirectTo} replace />;
  }

  // Check role-based authorization if roles are specified
  if (allowedRoles && user) {
    const hasAllowedRole = allowedRoles.includes(user.role);

    if (!hasAllowedRole) {
      // User is authenticated but doesn't have required role
      return <Navigate to="/unauthorized" replace />;
    }
  }

  return children;
}

export default ProtectedRoute;
