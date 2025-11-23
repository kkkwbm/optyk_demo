import { useState } from 'react';
import {
  AppBar,
  Toolbar,
  IconButton,
  Typography,
  Box,
  Menu,
  MenuItem,
  Avatar,
  Divider,
  ListItemIcon,
  Button,
  useTheme,
  useMediaQuery,
  Tooltip,
} from '@mui/material';
import {
  Menu as MenuIcon,
  User,
  LogOut,
  Settings,
  KeyRound,
  BarChart3,
  Users,
  Package,
  ShoppingCart,
  ArrowLeftRight,
  History,
  Award,
} from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { logout, selectUser, selectUserRole } from '../../features/auth/authSlice';
import { selectCurrentLocation } from '../../features/locations/locationsSlice';
import { PERMISSIONS, LOCATION_TYPES } from '../../constants';
import toast from 'react-hot-toast';

function Header({ drawerWidth, onMenuClick, sidebarOpen }) {
  const navigate = useNavigate();
  const routerLocation = useLocation();
  const dispatch = useDispatch();
  const user = useSelector(selectUser);
  const userRole = useSelector(selectUserRole);
  const currentLocation = useSelector(selectCurrentLocation);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [anchorEl, setAnchorEl] = useState(null);

  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleProfile = () => {
    handleMenuClose();
    navigate('/profile');
  };

  const handleChangePassword = () => {
    handleMenuClose();
    navigate('/change-password');
  };

  const handleLogout = async () => {
    handleMenuClose();
    try {
      await dispatch(logout()).unwrap();
      toast.success('Wylogowano pomyślnie');
      navigate('/login');
    } catch (error) {
      console.error('Logout error:', error);
      navigate('/login');
    }
  };

  const getUserInitials = (firstName, lastName) => {
    if (!firstName && !lastName) return 'U';
    return `${firstName?.[0] || ''}${lastName?.[0] || ''}`.toUpperCase();
  };

  // Check if user has access to a route based on permission
  const hasPermission = (permission) => {
    if (!permission) return true;
    return PERMISSIONS[permission]?.includes(userRole);
  };

  const isActive = (path) => {
    if (path === '/') {
      return routerLocation.pathname === '/';
    }
    return routerLocation.pathname.startsWith(path);
  };

  const isWarehouse = currentLocation?.type === LOCATION_TYPES.WAREHOUSE;

  // Left-aligned navigation items
  const leftNavigationItems = [
    {
      text: 'Magazyn',
      icon: <Package size={18} />,
      path: '/inventory',
      permission: null,
    },
    {
      text: 'Sprzedaż',
      icon: <ShoppingCart size={18} />,
      path: '/sales',
      permission: 'RECORD_SALE',
      disabled: isWarehouse,
      disabledReason: 'Sprzedaż nie jest dostępna w magazynie',
    },
    {
      text: 'Transfery',
      icon: <ArrowLeftRight size={18} />,
      path: '/transfers',
      permission: 'TRANSFER_PRODUCTS',
    },
    {
      text: 'Statystyki',
      icon: <BarChart3 size={18} />,
      path: '/statistics',
      permission: null,
    },
    {
      text: 'Historia',
      icon: <History size={18} />,
      path: '/history',
      permission: null,
    },
  ];

  // Right-aligned navigation items
  const rightNavigationItems = [
    {
      text: 'Użytkownicy',
      icon: <Users size={18} />,
      path: '/users',
      permission: 'MANAGE_USERS',
    },
    {
      text: 'Marki',
      icon: <Award size={18} />,
      path: '/brands',
      permission: 'MANAGE_BRANDS',
    },
    {
      text: 'Ustawienia',
      icon: <Settings size={18} />,
      path: '/settings',
      permission: null,
    },
  ];

  const renderNavButton = (item) => {
    const button = (
      <Button
        key={item.text}
        onClick={() => navigate(item.path)}
        startIcon={item.icon}
        disabled={item.disabled}
        sx={{
          color: 'white',
          textTransform: 'none',
          fontSize: '0.9rem',
          px: 2,
          py: 1,
          borderRadius: 1,
          backgroundColor: isActive(item.path) ? 'rgba(255, 255, 255, 0.15)' : 'transparent',
          '&:hover': {
            backgroundColor: isActive(item.path)
              ? 'rgba(255, 255, 255, 0.25)'
              : 'rgba(255, 255, 255, 0.1)',
          },
          '&.Mui-disabled': {
            color: 'rgba(255, 255, 255, 0.3)',
          },
          fontWeight: isActive(item.path) ? 600 : 400,
        }}
      >
        {item.text}
      </Button>
    );

    if (item.disabled && item.disabledReason) {
      return (
        <Tooltip key={item.text} title={item.disabledReason}>
          <span>{button}</span>
        </Tooltip>
      );
    }

    return button;
  };

  return (
    <AppBar
      position="fixed"
      sx={{
        width: {
          md: sidebarOpen ? `calc(100% - ${drawerWidth}px)` : '100%',
        },
        ml: {
          md: sidebarOpen ? `${drawerWidth}px` : 0,
        },
        transition: (theme) =>
          theme.transitions.create(['width', 'margin'], {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.leavingScreen,
          }),
        zIndex: (theme) => theme.zIndex.drawer + 1,
      }}
    >
      <Toolbar sx={{ minHeight: { xs: 56, sm: 64 } }}>
        {/* Menu Icon for mobile/sidebar toggle */}
        <IconButton
          color="inherit"
          aria-label="toggle drawer"
          edge="start"
          onClick={onMenuClick}
          sx={{ mr: 2 }}
        >
          <MenuIcon size={24} />
        </IconButton>

        {/* Navigation Menu - Desktop only */}
        {!isMobile && (
          <>
            {/* Left-aligned navigation */}
            <Box sx={{ display: 'flex', gap: 0.5 }}>
              {leftNavigationItems
                .filter((item) => hasPermission(item.permission))
                .map(renderNavButton)}
            </Box>

            {/* Spacer */}
            <Box sx={{ flexGrow: 1 }} />

            {/* Right-aligned navigation */}
            <Box sx={{ display: 'flex', gap: 0.5, mr: 2 }}>
              {rightNavigationItems
                .filter((item) => hasPermission(item.permission))
                .map(renderNavButton)}
            </Box>
          </>
        )}

        {/* Mobile - show app title */}
        {isMobile && (
          <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1 }}>
            OptiStore
          </Typography>
        )}

        {/* User Info */}
        {user && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Typography variant="body2" sx={{ display: { xs: 'none', sm: 'block' } }}>
              {user.firstName} {user.lastName}
            </Typography>
            <IconButton
              onClick={handleMenuOpen}
              size="small"
              sx={{ ml: 1 }}
              aria-controls={anchorEl ? 'account-menu' : undefined}
              aria-haspopup="true"
              aria-expanded={anchorEl ? 'true' : undefined}
            >
              <Avatar
                sx={{
                  width: 32,
                  height: 32,
                  bgcolor: 'secondary.main',
                }}
              >
                {getUserInitials(user.firstName, user.lastName)}
              </Avatar>
            </IconButton>
          </Box>
        )}

        {/* User Menu */}
        <Menu
          id="account-menu"
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={handleMenuClose}
          onClick={handleMenuClose}
          PaperProps={{
            elevation: 3,
            sx: {
              mt: 1.5,
              minWidth: 200,
            },
          }}
          transformOrigin={{ horizontal: 'right', vertical: 'top' }}
          anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
        >
          {user && (
            <Box sx={{ px: 2, py: 1 }}>
              <Typography variant="body2" color="text.secondary">
                {user.email}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Rola: {user.role}
              </Typography>
            </Box>
          )}
          <Divider />
          <MenuItem onClick={handleProfile}>
            <ListItemIcon>
              <User size={20} />
            </ListItemIcon>
            Profil
          </MenuItem>
          <MenuItem onClick={handleChangePassword}>
            <ListItemIcon>
              <KeyRound size={20} />
            </ListItemIcon>
            Zmień hasło
          </MenuItem>
          <Divider />
          <MenuItem onClick={handleLogout}>
            <ListItemIcon>
              <LogOut size={20} />
            </ListItemIcon>
            Wyloguj
          </MenuItem>
        </Menu>
      </Toolbar>
    </AppBar>
  );
}

export default Header;
