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
import {
  fetchUserById,
  assignLocationsToUser,
  selectCurrentUser as selectCurrentUserDetails,
  selectUsersLoading,
} from '../usersSlice';
import { fetchActiveLocations, selectActiveLocations } from '../../locations/locationsSlice';
import { selectUser } from '../../auth/authSlice';
import { USER_ROLES, USER_ROLE_LABELS, USER_STATUS, DATE_FORMATS, PERMISSIONS } from '../../../constants';
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
  const [selectedLocations, setSelectedLocations] = useState([]);
  const [userLocations, setUserLocations] = useState([]);
  const [loadingLocations, setLoadingLocations] = useState(false);

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
      console.error('Failed to load user locations:', error);
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
    setLocationDialog({ open: true, type: 'assign' });
  };

  const handleCloseLocationDialog = () => {
    setLocationDialog({ open: false, type: null });
    setSelectedLocations([]);
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

  const handleSaveLocations = async () => {
    try {
      await dispatch(assignLocationsToUser({ id, locationIds: selectedLocations })).unwrap();
      toast.success('Lokalizacje zostały zaktualizowane');
      await loadUserLocations();
      handleCloseLocationDialog();
    } catch (error) {
      toast.error(error || 'Nie udało się zaktualizować lokalizacji');
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
                    <IconButton
                      edge="end"
                      aria-label="delete"
                      onClick={() => handleRemoveLocation(userLocation.location.id)}
                      disabled={user.status === USER_STATUS.INACTIVE}
                    >
                      <Trash2 size={18} />
                    </IconButton>
                  }
                >
                  <ListItemIcon>
                    <MapPin size={20} />
                  </ListItemIcon>
                  <ListItemText
                    primary={userLocation.location.name}
                    secondary={
                      userLocation.assignedAt
                        ? `Przypisano: ${format(new Date(userLocation.assignedAt), DATE_FORMATS.DISPLAY)}`
                        : null
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
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Zarządzaj uprawnieniami do lokalizacji</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Wybierz lokalizacje, do których użytkownik ma mieć dostęp. Użytkownik będzie mógł przeglądać i zarządzać danymi tylko z wybranych lokalizacji.
          </Typography>
          <List>
            {allLocations.map((location) => {
              const isChecked = selectedLocations.includes(location.id);
              return (
                <ListItem
                  key={location.id}
                  button
                  onClick={() => handleLocationToggle(location.id)}
                >
                  <ListItemIcon>
                    <Checkbox
                      edge="start"
                      checked={isChecked}
                      tabIndex={-1}
                      disableRipple
                    />
                  </ListItemIcon>
                  <ListItemText
                    primary={location.name}
                    secondary={`Typ: ${location.type === 'STORE' ? 'Salon' : 'Magazyn'}`}
                  />
                </ListItem>
              );
            })}
          </List>
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
    </Container>
  );
}

export default UserDetailsPage;
