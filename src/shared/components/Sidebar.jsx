import { useEffect, useMemo } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import {
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Divider,
  Box,
  Typography,
} from '@mui/material';
import {
  MapPin,
  Store,
  Glasses,
  Building2,
  Warehouse,
  LayoutGrid,
} from 'lucide-react';
import {
  fetchActiveLocations,
  selectActiveLocations,
  selectCurrentLocation,
  setCurrentLocation,
} from '../../features/locations/locationsSlice';
import { LOCATION_TYPES } from '../../constants';

function Sidebar({ drawerWidth, open, onClose, variant }) {
  const dispatch = useDispatch();
  const activeLocations = useSelector(selectActiveLocations);
  const currentLocation = useSelector(selectCurrentLocation);

  useEffect(() => {
    dispatch(fetchActiveLocations());
  }, [dispatch]);

  const handleLocationClick = (location) => {
    dispatch(setCurrentLocation(location));
    if (variant === 'temporary') {
      onClose();
    }
  };

  const isSelected = (locationId) => {
    return currentLocation?.id === locationId;
  };

  // Sort locations: Warehouses first, then Stores
  const sortedLocations = useMemo(() => {
    if (!activeLocations) return { warehouses: [], stores: [] };

    const warehouses = activeLocations
      .filter(loc => loc.type === LOCATION_TYPES.WAREHOUSE)
      .sort((a, b) => a.name.localeCompare(b.name));

    const stores = activeLocations
      .filter(loc => loc.type === LOCATION_TYPES.STORE)
      .sort((a, b) => a.name.localeCompare(b.name));

    return { warehouses, stores };
  }, [activeLocations]);

  const renderLocationItem = (loc) => (
    <ListItem key={loc.id} disablePadding sx={{ mb: 0.5 }}>
      <ListItemButton
        onClick={() => handleLocationClick(loc)}
        selected={isSelected(loc.id)}
        sx={{
          borderRadius: 2,
          '&.Mui-selected': {
            backgroundColor: 'primary.main',
            color: 'white',
            '&:hover': {
              backgroundColor: 'primary.dark',
            },
            '& .MuiListItemIcon-root': {
              color: 'white',
            },
          },
        }}
      >
        <ListItemIcon
          sx={{
            minWidth: 40,
            color: isSelected(loc.id) ? 'white' : 'text.secondary',
          }}
        >
          {loc.type === LOCATION_TYPES.WAREHOUSE ? <Warehouse size={20} /> : <Store size={20} />}
        </ListItemIcon>
        <ListItemText
          primary={loc.name}
          primaryTypographyProps={{
            fontSize: '0.95rem',
            fontWeight: isSelected(loc.id) ? 600 : 400,
          }}
        />
      </ListItemButton>
    </ListItem>
  );
  const drawerContent = (
    <Box>
      <Box sx={{ p: 2, display: 'flex', alignItems: 'center', gap: 2 }}>
        <Box
          sx={{
            width: 40,
            height: 40,
            borderRadius: 1,
            backgroundColor: 'primary.main',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
          }}
        >
          <Glasses size={24} />
        </Box>
        <Typography variant="h6" fontWeight="bold" color="primary">
          Optyk
        </Typography>
      </Box>

      <Divider />

      <List sx={{ px: 2, py: 2 }}>
        {/* All Locations (Everything) */}
        <ListItem disablePadding sx={{ mb: 0.5 }}>
          <ListItemButton
            onClick={() => handleLocationClick(null)}
            selected={currentLocation === null}
            sx={{
              borderRadius: 2,
              '&.Mui-selected': {
                backgroundColor: 'primary.main',
                color: 'white',
                '&:hover': {
                  backgroundColor: 'primary.dark',
                },
                '& .MuiListItemIcon-root': {
                  color: 'white',
                },
              },
            }}
          >
            <ListItemIcon
              sx={{
                minWidth: 40,
                color: currentLocation === null ? 'white' : 'text.secondary',
              }}
            >
              <LayoutGrid size={20} />
            </ListItemIcon>
            <ListItemText
              primary="Wszystko"
              primaryTypographyProps={{
                fontSize: '0.95rem',
                fontWeight: currentLocation === null ? 600 : 400,
              }}
            />
          </ListItemButton>
        </ListItem>

        {/* Warehouses Section */}
        {sortedLocations.warehouses.length > 0 && (
          <>
            <Typography variant="overline" sx={{ px: 2, mt: 2, mb: 1, display: 'block', color: 'text.secondary' }}>
              Magazyny
            </Typography>
            {sortedLocations.warehouses.map(renderLocationItem)}
          </>
        )}

        <Divider sx={{ my: 2 }} />

        {/* All Stores Option */}
        <ListItem disablePadding sx={{ mb: 0.5 }}>
          <ListItemButton
            onClick={() => handleLocationClick({ id: 'ALL_STORES', type: 'ALL_STORES', name: 'Wszystkie salony' })}
            selected={currentLocation?.id === 'ALL_STORES'}
            sx={{
              borderRadius: 2,
              '&.Mui-selected': {
                backgroundColor: 'primary.main',
                color: 'white',
                '&:hover': {
                  backgroundColor: 'primary.dark',
                },
                '& .MuiListItemIcon-root': {
                  color: 'white',
                },
              },
            }}
          >
            <ListItemIcon
              sx={{
                minWidth: 40,
                color: currentLocation?.id === 'ALL_STORES' ? 'white' : 'text.secondary',
              }}
            >
              <Building2 size={20} />
            </ListItemIcon>
            <ListItemText
              primary="Wszystkie salony"
              primaryTypographyProps={{
                fontSize: '0.95rem',
                fontWeight: currentLocation?.id === 'ALL_STORES' ? 600 : 400,
              }}
            />
          </ListItemButton>
        </ListItem>

        {/* Individual Stores */}
        {sortedLocations.stores.map(renderLocationItem)}
      </List>
    </Box>
  );

  return (
    <Drawer
      variant={variant}
      open={open}
      onClose={onClose}
      sx={{
        width: drawerWidth,
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width: drawerWidth,
          boxSizing: 'border-box',
          borderRight: '1px solid rgba(0, 0, 0, 0.12)',
        },
      }}
      ModalProps={{
        keepMounted: true, // Better mobile performance
      }}
    >
      {drawerContent}
    </Drawer>
  );
}

export default Sidebar;
