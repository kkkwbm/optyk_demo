import { useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { Paper, BottomNavigation, BottomNavigationAction } from '@mui/material';
import {
  Package,
  ShoppingCart,
  ArrowLeftRight,
  BarChart3,
  History,
} from 'lucide-react';
import { selectUserRole } from '../../features/auth/authSlice';
import { selectCurrentLocation } from '../../features/locations/locationsSlice';
import { PERMISSIONS, LOCATION_TYPES } from '../../constants';

function MobileBottomNavigation() {
  const navigate = useNavigate();
  const location = useLocation();
  const userRole = useSelector(selectUserRole);
  const currentLocation = useSelector(selectCurrentLocation);

  const hasPermission = (permission) => {
    if (!permission) return true;
    return PERMISSIONS[permission]?.includes(userRole);
  };

  const isWarehouse = currentLocation?.type === LOCATION_TYPES.WAREHOUSE;
  const isAllWarehouses = currentLocation?.id === 'ALL_WAREHOUSES';
  const shouldDisableSales = isWarehouse || isAllWarehouses;

  const navigationItems = useMemo(() => {
    const items = [
      {
        label: 'Magazyn',
        icon: <Package size={22} />,
        path: '/inventory',
        permission: null,
      },
      {
        label: 'Transfery',
        icon: <ArrowLeftRight size={22} />,
        path: '/transfers',
        permission: 'TRANSFER_PRODUCTS',
      },
      {
        label: 'Sprzedaż',
        icon: <ShoppingCart size={22} />,
        path: '/sales',
        permission: 'RECORD_SALE',
        disabled: shouldDisableSales,
      },
      {
        label: 'Statystyki',
        icon: <BarChart3 size={22} />,
        path: '/statistics',
        permission: 'VIEW_STATISTICS_ALL',
      },
      {
        label: 'Historia',
        icon: <History size={22} />,
        path: '/history',
        permission: null,
      },
    ];

    return items.filter((item) => hasPermission(item.permission));
  }, [userRole, shouldDisableSales]);

  const getCurrentValue = () => {
    const currentPath = location.pathname;
    const matchedItem = navigationItems.find((item) =>
      currentPath === item.path || currentPath.startsWith(item.path + '/')
    );
    return matchedItem?.path || false;
  };

  const handleChange = (event, newValue) => {
    if (newValue) {
      navigate(newValue);
    }
  };

  return (
    <Paper
      sx={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: (theme) => theme.zIndex.appBar,
        borderTop: '1px solid',
        borderColor: 'divider',
      }}
      elevation={3}
    >
      <BottomNavigation
        value={getCurrentValue()}
        onChange={handleChange}
        showLabels
        sx={{
          height: 64,
          '& .MuiBottomNavigationAction-root': {
            minWidth: 'auto',
            padding: '6px 8px',
            '&.Mui-selected': {
              color: 'primary.main',
            },
          },
          '& .MuiBottomNavigationAction-label': {
            fontSize: '0.7rem',
            '&.Mui-selected': {
              fontSize: '0.7rem',
            },
          },
        }}
      >
        {navigationItems.map((item) => (
          <BottomNavigationAction
            key={item.path}
            label={item.label}
            icon={item.icon}
            value={item.path}
            disabled={item.disabled}
          />
        ))}
      </BottomNavigation>
    </Paper>
  );
}

export default MobileBottomNavigation;
