import { useEffect } from 'react';
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
} from 'lucide-react';
import {
  fetchActiveLocations,
  selectActiveLocations,
  selectCurrentLocation,
  setCurrentLocation,
} from '../../features/locations/locationsSlice';

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

  const drawerContent = (
    <Box>
      {/* Logo/Brand Section */}
      <Box
        sx={{
          p: 2,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: 64,
        }}
      >
        <Glasses size={32} color="#1976d2" />
        <Typography
          variant="h6"
          sx={{
            ml: 1,
            fontWeight: 600,
            color: 'primary.main',
          }}
        >
          OptiStore
        </Typography>
      </Box>

      <Divider />

      {/* Locations Section */}
      <Box sx={{ px: 2, py: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2, px: 1 }}>
          <MapPin size={20} color="#666" />
          <Typography
            variant="subtitle2"
            sx={{
              ml: 1,
              fontWeight: 600,
              color: 'text.secondary',
            }}
          >
            Lokalizacje
          </Typography>
        </Box>

        <List sx={{ px: 0 }}>
          {/* All Stores Option */}
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
                <Building2 size={20} />
              </ListItemIcon>
              <ListItemText
                primary="Wszystkie salony"
                primaryTypographyProps={{
                  fontSize: '0.95rem',
                  fontWeight: currentLocation === null ? 600 : 400,
                }}
              />
            </ListItemButton>
          </ListItem>

          {/* Individual Locations */}
          {activeLocations && activeLocations.length > 0 ? (
            activeLocations.map((loc) => (
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
                    <Store size={20} />
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
            ))
          ) : (
            <Box sx={{ px: 2, py: 3 }}>
              <Typography variant="body2" color="text.secondary" align="center">
                Brak lokalizacji
              </Typography>
            </Box>
          )}
        </List>
      </Box>
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
