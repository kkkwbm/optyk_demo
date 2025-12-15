import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Container,
  Paper,
  Box,
  Button,
  Typography,
  Grid,
  Divider,
  CircularProgress,
  Chip,
  List,
  ListItem,
  ListItemText,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  OutlinedInput,
  Checkbox,
  ListItemIcon,
} from '@mui/material';
import { ArrowLeft, Edit, KeyRound, Trash2, MapPin } from 'lucide-react';
import { format } from 'date-fns';
import toast from 'react-hot-toast';
import PageHeader from '../../../shared/components/PageHeader';
import EditUserDialog from '../components/EditUserDialog';
import PermissionsSelector from '../../../components/PermissionsSelector';
import {
  fetchUserById,
  selectCurrentUser as selectCurrentUserDetails,
  selectUsersLoading,
} from '../usersSlice';
import { fetchActiveLocations, selectActiveLocations } from '../../locations/locationsSlice';
import { selectUser } from '../../auth/authSlice';
import { USER_ROLES, USER_ROLE_LABELS, USER_STATUS, DATE_FORMATS, PERMISSIONS, LOCATION_TAB_LABELS } from '../../../constants';
import userService from '../../../services/userService';

function UserDetailsPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { id } = useParams();

  const user = useSelector(selectCurrentUserDetails);
  const loading = useSelector(selectUsersLoading);
  const currentUser = useSelector(selectUser);
  const allLocations = useSelector(selectActiveLocations);

  const [locationDialog, setLocationDialog] = useState({ open: false, type: null });
  const [editDialog, setEditDialog] = useState(false);
  const [permissionsDialog, setPermissionsDialog] = useState({ open: false, userLocation: null });
  const [selectedLocations, setSelectedLocations] = useState([]);
  const [locationPermissions, setLocationPermissions] = useState({}); // Map of locationId -> allowedTabs array
  const [userLocations, setUserLocations] = useState([]);
  const [loadingLocations, setLoadingLocations] = useState(false);
  const [selectedPermissions, setSelectedPermissions] = useState([]);
  const [deleteDialog, setDeleteDialog] = useState(false);

  useEffect(() => {
    dispatch(fetchActiveLocations());
  }, [dispatch]);

  useEffect(() => {
    if (id) {
      dispatch(fetchUserById(id));
      loadUserLocations();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dispatch, id]);

  const loadUserLocations = async () => {
    try {
      setLoadingLocations(true);
      const response = await userService.getUserLocations(id);
      if (response.data.success) {
        setUserLocations(response.data.data || []);
      }
    } catch (error) {
      // Error handled silently
    } finally {
      setLoadingLocations(false);
    }
  };

  const hasPermission = (permission) => {
    return PERMISSIONS[permission]?.includes(currentUser?.role);
  };

  const canManageUsers = hasPermission('MANAGE_USERS');
  const canResetPassword = hasPermission('RESET_PASSWORD');

  const handleResetPassword = () => {
    navigate(`/users/${id}/reset-password`);
  };

  const handleOpenLocationDialog = () => {
    const assignedLocationIds = userLocations.map(ul => ul.location.id);
    setSelectedLocations(assignedLocationIds);

    // Initialize permissions map with existing user location permissions
    const permissionsMap = {};
    userLocations.forEach(ul => {
      permissionsMap[ul.location.id] = ul.allowedTabs || [];
    });
    setLocationPermissions(permissionsMap);

    setLocationDialog({ open: true, type: 'assign' });
  };

  const handleCloseLocationDialog = () => {
    setLocationDialog({ open: false, type: null });
    setSelectedLocations([]);
    setLocationPermissions({});
  };

  const handleLocationToggle = (locationId) => {
    setSelectedLocations(prev => {
      if (prev.includes(locationId)) {
        return prev.filter(id => id !== locationId);
      } else {
        return [...prev, locationId];
      }
    });
  };

  const handleLocationPermissionsChange = (locationId, allowedTabs) => {
    setLocationPermissions(prev => ({
      ...prev,
      [locationId]: allowedTabs
    }));
  };

  const handleSaveLocations = async () => {
    try {
      // First, remove locations that are no longer selected
      const currentLocationIds = userLocations.map(ul => ul.location.id);
      const locationsToRemove = currentLocationIds.filter(locId => !selectedLocations.includes(locId));

      for (const locationId of locationsToRemove) {
        await userService.removeLocation(id, locationId);
      }

      // Then, add or update locations with their permissions
      for (const locationId of selectedLocations) {
        const allowedTabs = locationPermissions[locationId] || [];
        const existingLocation = userLocations.find(ul => ul.location.id === locationId);

        if (existingLocation) {
          // Update permissions for existing location
          await userService.updateUserLocationPermissions(id, locationId, allowedTabs);
        } else {
          // Assign new location with permissions
          await userService.assignUserLocationWithPermissions(id, locationId, allowedTabs);
        }
      }

      toast.success('Lokalizacje i uprawnienia zostały zaktualizowane');
      await loadUserLocations();
      handleCloseLocationDialog();
    } catch (error) {
      toast.error(error.response?.data?.error || 'Nie udało się zaktualizować lokalizacji');
    }
  };

  const handleRemoveLocation = async (locationId) => {
    try {
      await userService.removeLocation(id, locationId);
      toast.success('Lokalizacja została usunięta');
      await loadUserLocations();
    } catch (error) {
      toast.error(error.response?.data?.error || 'Nie udało się usunąć lokalizacji');
    }
  };

  const handleOpenEdit = () => {
    setEditDialog(true);
  };

  const handleCloseEdit = () => {
    setEditDialog(false);
  };

  const handleEditSuccess = () => {
    dispatch(fetchUserById(id));
  };

  const handleOpenPermissionsDialog = (userLocation) => {
    setPermissionsDialog({ open: true, userLocation });
    setSelectedPermissions(userLocation.allowedTabs || []);
  };

  const handleClosePermissionsDialog = () => {
    setPermissionsDialog({ open: false, userLocation: null });
    setSelectedPermissions([]);
  };

  const handleSavePermissions = async () => {
    try {
      await userService.updateUserLocationPermissions(
        id,
        permissionsDialog.userLocation.location.id,
        selectedPermissions
      );
      toast.success('Uprawnienia zostały zaktualizowane');
      await loadUserLocations();
      handleClosePermissionsDialog();
    } catch (error) {
      toast.error(error.response?.data?.error || 'Nie udało się zaktualizować uprawnień');
    }
  };

  const handleOpenDeleteDialog = () => {
    setDeleteDialog(true);
  };

  const handleCloseDeleteDialog = () => {
    setDeleteDialog(false);
  };

  const handleDelete = async () => {
    try {
      await userService.deleteUser(id);
      toast.success('Użytkownik został usunięty');
      navigate('/users');
    } catch (error) {
      toast.error(error.response?.data?.error || 'Nie udało się usunąć użytkownika');
    }
  };

  if (loading || !user) {
    return (
      <Container maxWidth="lg">
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 400 }}>
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  const getUserName = () => {
    return `${user.firstName} ${user.lastName}`;
  };

  return (
    <Container maxWidth="lg">
      <PageHeader
        title={getUserName()}
        subtitle={USER_ROLE_LABELS[user.role]}
        breadcrumbs={[
          { label: 'Pulpit', to: '/' },
          { label: 'Użytkownicy', to: '/users' },
          { label: getUserName() },
        ]}
        actions={[
          {
            label: 'Wróć',
            icon: <ArrowLeft size={20} />,
            onClick: () => navigate('/users'),
            variant: 'outlined',
          },
        ]}
      />

      <Paper sx={{ p: 3 }}>
        {/* Actions */}
        <Box sx={{ mb: 3, display: 'flex', gap: 2, flexWrap: 'wrap' }}>
          {canManageUsers && (
            <Button
              variant="outlined"
              startIcon={<Edit size={16} />}
              onClick={handleOpenEdit}
            >
              Edytuj
            </Button>
          )}
          {canResetPassword && (
            <Button
              variant="outlined"
              color="primary"
              startIcon={<KeyRound size={16} />}
              onClick={handleResetPassword}
            >
              Resetuj hasło
            </Button>
          )}
          {canManageUsers && (
            <Button
              variant="outlined"
              color="error"
              startIcon={<Trash2 size={16} />}
              onClick={handleOpenDeleteDialog}
            >
              Usuń
            </Button>
          )}
        </Box>

        <Divider sx={{ mb: 3 }} />

        {/* User Details */}
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Typography variant="body2" color="text.secondary">
              Email
            </Typography>
            <Typography variant="body1" sx={{ mb: 2 }}>
              {user.email}
            </Typography>
          </Grid>

          <Grid item xs={12} md={6}>
            <Typography variant="body2" color="text.secondary">
              Imię
            </Typography>
            <Typography variant="body1" sx={{ mb: 2 }}>
              {user.firstName}
            </Typography>
          </Grid>

          <Grid item xs={12} md={6}>
            <Typography variant="body2" color="text.secondary">
              Nazwisko
            </Typography>
            <Typography variant="body1" sx={{ mb: 2 }}>
              {user.lastName}
            </Typography>
          </Grid>

          <Grid item xs={12} md={6}>
            <Typography variant="body2" color="text.secondary">
              Telefon
            </Typography>
            <Typography variant="body1" sx={{ mb: 2 }}>
              {user.phone || '-'}
            </Typography>
          </Grid>

          <Grid item xs={12} md={6}>
            <Typography variant="body2" color="text.secondary">
              Rola
            </Typography>
            <Box sx={{ mb: 2 }}>
              <Chip
                label={USER_ROLE_LABELS[user.role]}
                color={
                  user.role === USER_ROLES.ADMIN
                    ? 'error'
                    : user.role === USER_ROLES.OWNER
                    ? 'primary'
                    : 'default'
                }
              />
            </Box>
          </Grid>

          <Grid item xs={12} md={6}>
            <Typography variant="body2" color="text.secondary">
              Utworzono
            </Typography>
            <Typography variant="body1" sx={{ mb: 2 }}>
              {format(new Date(user.createdAt), DATE_FORMATS.DISPLAY_WITH_TIME)}
            </Typography>
          </Grid>

          {user.updatedAt && (
            <Grid item xs={12} md={6}>
              <Typography variant="body2" color="text.secondary">
                Ostatnia aktualizacja
              </Typography>
              <Typography variant="body1" sx={{ mb: 2 }}>
                {format(new Date(user.updatedAt), DATE_FORMATS.DISPLAY_WITH_TIME)}
              </Typography>
            </Grid>
          )}

          {user.lastLogin && (
            <Grid item xs={12} md={6}>
              <Typography variant="body2" color="text.secondary">
                Ostatnie logowanie
              </Typography>
              <Typography variant="body1" sx={{ mb: 2 }}>
                {format(new Date(user.lastLogin), DATE_FORMATS.DISPLAY_WITH_TIME)}
              </Typography>
            </Grid>
          )}
        </Grid>
      </Paper>

      {/* Location Permissions */}
      {canManageUsers && (
        <Paper sx={{ p: 3, mt: 3 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Typography variant="h6" sx={{ fontWeight: 600, display: 'flex', alignItems: 'center' }}>
              <MapPin size={20} style={{ marginRight: 8 }} />
              Uprawnienia do lokalizacji
            </Typography>
            {user.role === USER_ROLES.EMPLOYEE && (
              <Button
                variant="contained"
                startIcon={<Edit size={16} />}
                onClick={handleOpenLocationDialog}
              >
                Zarządzaj uprawnieniami
              </Button>
            )}
          </Box>

          <Divider sx={{ mb: 3 }} />

          {user.role === USER_ROLES.ADMIN || user.role === USER_ROLES.OWNER ? (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <Chip
                label="Dostęp do wszystkich lokalizacji"
                color="primary"
                sx={{ fontSize: '1rem', py: 2.5, px: 1 }}
              />
              <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                {user.role === USER_ROLES.ADMIN
                  ? 'Administrator ma automatyczny dostęp do wszystkich lokalizacji w systemie'
                  : 'Właściciel ma automatyczny dostęp do wszystkich lokalizacji w systemie'
                }
              </Typography>
            </Box>
          ) : loadingLocations ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
              <CircularProgress />
            </Box>
          ) : userLocations.length === 0 ? (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <Typography variant="body2" color="text.secondary">
                Użytkownik nie ma przypisanych żadnych lokalizacji
              </Typography>
            </Box>
          ) : (
            <List>
              {userLocations.map((userLocation) => (
                <ListItem
                  key={userLocation.id}
                  secondaryAction={
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <IconButton
                        edge="end"
                        aria-label="edit permissions"
                        onClick={() => handleOpenPermissionsDialog(userLocation)}
                        disabled={user.status === USER_STATUS.INACTIVE}
                      >
                        <Edit size={18} />
                      </IconButton>
                      <IconButton
                        edge="end"
                        aria-label="delete"
                        onClick={() => handleRemoveLocation(userLocation.location.id)}
                        disabled={user.status === USER_STATUS.INACTIVE}
                      >
                        <Trash2 size={18} />
                      </IconButton>
                    </Box>
                  }
                >
                  <ListItemIcon>
                    <MapPin size={20} />
                  </ListItemIcon>
                  <ListItemText
                    primary={userLocation.location.name}
                    secondary={
                      <>
                        {userLocation.assignedAt && (
                          <Typography component="span" variant="caption" display="block">
                            Przypisano: {format(new Date(userLocation.assignedAt), DATE_FORMATS.DISPLAY)}
                          </Typography>
                        )}
                        <Typography component="span" variant="caption" display="block" sx={{ mt: 0.5 }}>
                          {userLocation.allowedTabs && userLocation.allowedTabs.length > 0
                            ? `Dostęp do: ${userLocation.allowedTabs.map(tab => LOCATION_TAB_LABELS[tab]).join(', ')}`
                            : 'Dostęp do wszystkich zakładek'
                          }
                        </Typography>
                      </>
                    }
                  />
                </ListItem>
              ))}
            </List>
          )}
        </Paper>
      )}

      {/* Location Assignment Dialog */}
      <Dialog
        open={locationDialog.open}
        onClose={handleCloseLocationDialog}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Zarządzaj uprawnieniami do lokalizacji</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Wybierz lokalizacje i uprawnienia dla użytkownika. Dla każdej lokalizacji możesz określić, do jakich zakładek użytkownik ma mieć dostęp.
          </Typography>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {allLocations.map((location) => {
              const isChecked = selectedLocations.includes(location.id);
              return (
                <Paper
                  key={location.id}
                  variant="outlined"
                  sx={{
                    p: 2,
                    backgroundColor: isChecked ? 'action.selected' : 'background.paper',
                    border: isChecked ? 2 : 1,
                    borderColor: isChecked ? 'primary.main' : 'divider'
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: isChecked ? 2 : 0 }}>
                    <Checkbox
                      checked={isChecked}
                      onChange={() => handleLocationToggle(location.id)}
                    />
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="subtitle1" fontWeight="medium">
                        {location.name}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Typ: {location.type === 'STORE' ? 'Salon' : 'Magazyn'}
                      </Typography>
                    </Box>
                  </Box>

                  {isChecked && (
                    <Box sx={{ ml: 5 }}>
                      <PermissionsSelector
                        selectedTabs={locationPermissions[location.id] || []}
                        onChange={(tabs) => handleLocationPermissionsChange(location.id, tabs)}
                        locationName={null}
                      />
                    </Box>
                  )}
                </Paper>
              );
            })}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseLocationDialog}>Anuluj</Button>
          <Button onClick={handleSaveLocations} variant="contained">
            Zapisz
          </Button>
        </DialogActions>
      </Dialog>

      {/* Edit User Dialog */}
      <EditUserDialog
        open={editDialog}
        onClose={handleCloseEdit}
        userId={id}
        onSuccess={handleEditSuccess}
      />

      {/* Permissions Dialog */}
      <Dialog
        open={permissionsDialog.open}
        onClose={handleClosePermissionsDialog}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Zarządzaj uprawnieniami dostępu</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Wybierz zakładki, do których użytkownik ma mieć dostęp w tej lokalizacji.
            Jeśli nie wybierzesz żadnych zakładek, użytkownik będzie miał dostęp do wszystkich.
          </Typography>
          {permissionsDialog.userLocation && (
            <PermissionsSelector
              selectedTabs={selectedPermissions}
              onChange={setSelectedPermissions}
              locationName={permissionsDialog.userLocation.location.name}
            />
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClosePermissionsDialog}>Anuluj</Button>
          <Button onClick={handleSavePermissions} variant="contained">
            Zapisz
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete User Confirmation Dialog */}
      <Dialog
        open={deleteDialog}
        onClose={handleCloseDeleteDialog}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Usuń użytkownika</DialogTitle>
        <DialogContent>
          <Typography variant="body1">
            Czy na pewno chcesz usunąć tego użytkownika?
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            Użytkownik {getUserName()} ({user.email}) zostanie oznaczony jako nieaktywny.
            Historia operacji zostanie zachowana.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDeleteDialog}>Anuluj</Button>
          <Button onClick={handleDelete} color="error" variant="contained">
            Usuń
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}

export default UserDetailsPage;
