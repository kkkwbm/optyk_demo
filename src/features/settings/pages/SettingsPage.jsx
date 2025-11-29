import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Container,
  Paper,
  Box,
  Grid,
  Typography,
  Switch,
  FormControlLabel,
  Button,
  Divider,
  Card,
  CardContent,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  Alert,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Chip,
  Stack,
  Avatar,
  useTheme,
  alpha,
} from '@mui/material';
import { Settings, Moon, Sun, MapPin, Plus, Trash2, User, Shield, Mail, Phone, Edit } from 'lucide-react';
import { useForm, Controller } from 'react-hook-form';
import toast from 'react-hot-toast';
import PageHeader from '../../../shared/components/PageHeader';
import FormField from '../../../shared/components/FormField';
import ConfirmDialog from '../../../shared/components/ConfirmDialog';
import { selectTheme, setTheme } from '../../../app/uiSlice';
import { selectUser } from '../../auth/authSlice';
import { createLocation, deleteLocation, fetchActiveLocations, selectActiveLocations, updateLocation } from '../../locations/locationsSlice';
import { LOCATION_TYPES, LOCATION_TYPE_LABELS, VALIDATION } from '../../../constants';
import userService from '../../../services/userService';

function SettingsPage() {
  const dispatch = useDispatch();
  const theme = useTheme();

  const currentTheme = useSelector(selectTheme);
  const user = useSelector(selectUser);
  const locations = useSelector(selectActiveLocations);

  const [openLocationDialog, setOpenLocationDialog] = useState(false);
  const [editingLocation, setEditingLocation] = useState(null);
  const [openPasswordDialog, setOpenPasswordDialog] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState({ open: false, location: null });

  const { control, handleSubmit, reset } = useForm({
    defaultValues: {
      name: '',
      type: LOCATION_TYPES.STORE,
      address: '',
      city: '',
      postalCode: '',
      phone: '',
      email: '',
    },
  });

  useEffect(() => {
    dispatch(fetchActiveLocations());
  }, [dispatch]);

  const handleThemeToggle = async () => {
    const newTheme = currentTheme === 'light' ? 'dark' : 'light';

    try {
      await userService.updateThemePreference(newTheme);
      dispatch(setTheme(newTheme));
      toast.success(`Zmieniono motyw na ${newTheme === 'light' ? 'jasny' : 'ciemny'}`);
    } catch (error) {
      toast.error('Nie udało się zaktualizować preferencji motywu');
      console.error('Theme update error:', error);
    }
  };

  const handleOpenLocationDialog = () => {
    setEditingLocation(null);
    setOpenLocationDialog(true);
  };

  const handleOpenEditDialog = (location) => {
    setEditingLocation(location);
    reset({
      name: location.name,
      type: location.type,
      address: location.address,
      city: location.city,
      postalCode: location.postalCode,
      phone: location.phone || '',
      email: location.email || '',
    });
    setOpenLocationDialog(true);
  };

  const handleCloseLocationDialog = () => {
    setOpenLocationDialog(false);
    setEditingLocation(null);
    reset();
  };

  const onSubmitLocation = async (data) => {
    try {
      if (editingLocation) {
        await dispatch(updateLocation({ id: editingLocation.id, data })).unwrap();
        toast.success('Lokalizacja została zaktualizowana');
      } else {
        await dispatch(createLocation(data)).unwrap();
        toast.success('Lokalizacja została utworzona');
      }
      handleCloseLocationDialog();
      dispatch(fetchActiveLocations());
    } catch (error) {
      toast.error(error || `Nie udało się ${editingLocation ? 'zaktualizować' : 'utworzyć'} lokalizacji`);
    }
  };

  const handleOpenDeleteConfirm = (location) => {
    setDeleteConfirm({ open: true, location });
  };

  const handleCloseDeleteConfirm = () => {
    setDeleteConfirm({ open: false, location: null });
  };

  const handleConfirmDelete = async () => {
    try {
      await dispatch(deleteLocation(deleteConfirm.location.id)).unwrap();
      toast.success('Lokalizacja została usunięta');
      handleCloseDeleteConfirm();
      dispatch(fetchActiveLocations());
    } catch (error) {
      const errorMessage = typeof error === 'string' ? error : error?.message || 'Nie udało się usunąć lokalizacji';
      toast.error(errorMessage);
    }
  };

  return (
    <Container maxWidth="lg" sx={{ pb: 4 }}>
      <PageHeader
        title="Ustawienia"
        subtitle="Zarządzaj ustawieniami aplikacji i preferencjami"
        breadcrumbs={[
          { label: 'Pulpit', to: '/' },
          { label: 'Ustawienia' },
        ]}
        icon={<Settings size={24} />}
      />

      <Grid container spacing={3}>
        {/* Row 1: Appearance, Account Info, Security */}

        {/* Appearance Settings (Left) */}
        <Grid item xs={12} md={4}>
          <Paper
            elevation={0}
            sx={{
              p: 3,
              border: '1px solid',
              borderColor: 'divider',
              borderRadius: 2,
              height: '100%',
            }}
          >
            <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              {currentTheme === 'light' ? <Sun size={20} /> : <Moon size={20} />}
              Wygląd
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Dostosuj wygląd aplikacji do swoich preferencji.
            </Typography>

            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                p: 2,
                bgcolor: (theme) => alpha(theme.palette.primary.main, 0.05),
                borderRadius: 1,
              }}
            >
              <Box>
                <Typography variant="subtitle2">Tryb ciemny</Typography>
                <Typography variant="caption" color="text.secondary">
                  {currentTheme === 'dark' ? 'Włączony' : 'Wyłączony'}
                </Typography>
              </Box>
              <Switch
                checked={currentTheme === 'dark'}
                onChange={handleThemeToggle}
                color="primary"
              />
            </Box>
          </Paper>
        </Grid>

        {/* User Profile (Account Information) (Center) */}
        <Grid item xs={12} md={4}>
          <Paper
            elevation={0}
            sx={{
              p: 3,
              border: '1px solid',
              borderColor: 'divider',
              borderRadius: 2,
              textAlign: 'center',
              height: '100%',
            }}
          >
            <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
              <Avatar
                sx={{
                  width: 80,
                  height: 80,
                  bgcolor: 'primary.main',
                  fontSize: '2rem',
                }}
              >
                {user?.firstName?.[0]}
                {user?.lastName?.[0]}
              </Avatar>
            </Box>
            <Typography variant="h6" gutterBottom>
              {user?.firstName} {user?.lastName}
            </Typography>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              {user?.email}
            </Typography>
            <Chip
              label={user?.role}
              size="small"
              color="primary"
              variant="outlined"
              sx={{ mt: 1 }}
            />

            <Divider sx={{ my: 2 }} />

            <Stack spacing={2} alignItems="flex-start">
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, width: '100%' }}>
                <Mail size={18} color={theme.palette.text.secondary} />
                <Typography variant="body2">{user?.email}</Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, width: '100%' }}>
                <Shield size={18} color={theme.palette.text.secondary} />
                <Typography variant="body2">
                  Status: {user?.isActive ? 'Aktywny' : 'Nieaktywny'}
                </Typography>
              </Box>
            </Stack>
          </Paper>
        </Grid>

        {/* Security Settings (Right) */}
        <Grid item xs={12} md={4}>
          <Paper
            elevation={0}
            sx={{
              p: 3,
              border: '1px solid',
              borderColor: 'divider',
              borderRadius: 2,
              height: '100%',
            }}
          >
            <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Shield size={20} />
              Bezpieczeństwo
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Zarządzaj hasłem i zabezpieczeniami konta.
            </Typography>

            <Button
              variant="outlined"
              fullWidth
              onClick={() => setOpenPasswordDialog(true)}
            >
              Zmień hasło
            </Button>
          </Paper>
        </Grid>

        {/* Row 2: Location Management */}
        <Grid item xs={12}>
          <Stack spacing={3}>
            <Paper
              elevation={0}
              sx={{
                p: 3,
                border: '1px solid',
                borderColor: 'divider',
                borderRadius: 2,
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
                <Box>
                  <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <MapPin size={20} />
                    Lokalizacje
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                    Zarządzaj salonami optycznymi i magazynami
                  </Typography>
                </Box>
                <Button
                  variant="contained"
                  startIcon={<Plus size={18} />}
                  onClick={handleOpenLocationDialog}
                  size="small"
                >
                  Dodaj lokalizację
                </Button>
              </Box>

              {locations && locations.length > 0 ? (
                <Grid container spacing={2}>
                  {locations.map((location) => (
                    <Grid item xs={12} md={6} lg={4} key={location.id}>
                      <Card
                        variant="outlined"
                        sx={{
                          transition: 'all 0.2s',
                          '&:hover': {
                            borderColor: 'primary.main',
                            bgcolor: (theme) => alpha(theme.palette.primary.main, 0.02),
                          },
                        }}
                      >
                        <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                            <Box>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                                <Typography variant="subtitle1" fontWeight="bold">
                                  {location.name}
                                </Typography>
                                <Chip
                                  label={LOCATION_TYPE_LABELS[location.type]}
                                  size="small"
                                  color={location.type === LOCATION_TYPES.STORE ? 'primary' : 'secondary'}
                                  variant="soft"
                                  sx={{ height: 20, fontSize: '0.7rem' }}
                                />
                              </Box>
                              <Typography variant="body2" color="text.secondary">
                                {location.address}, {location.postalCode} {location.city}
                              </Typography>
                              {(location.phone || location.email) && (
                                <Box sx={{ display: 'flex', gap: 2, mt: 1 }}>
                                  {location.phone && (
                                    <Typography variant="caption" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                      <Phone size={12} /> {location.phone}
                                    </Typography>
                                  )}
                                  {location.email && (
                                    <Typography variant="caption" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                      <Mail size={12} /> {location.email}
                                    </Typography>
                                  )}
                                </Box>
                              )}
                            </Box>
                            <Box sx={{ display: 'flex', gap: 0.5 }}>
                              <IconButton
                                size="small"
                                color="primary"
                                onClick={() => handleOpenEditDialog(location)}
                                sx={{ opacity: 0.7, '&:hover': { opacity: 1, bgcolor: 'primary.lighter' } }}
                              >
                                <Edit size={18} />
                              </IconButton>
                              <IconButton
                                size="small"
                                color="error"
                                onClick={() => handleOpenDeleteConfirm(location)}
                                sx={{ opacity: 0.7, '&:hover': { opacity: 1, bgcolor: 'error.lighter' } }}
                              >
                                <Trash2 size={18} />
                              </IconButton>
                            </Box>
                          </Box>
                        </CardContent>
                      </Card>
                    </Grid>
                  ))}
                </Grid>
              ) : (
                <Alert severity="info" variant="outlined">
                  Brak zdefiniowanych lokalizacji. Dodaj pierwszą lokalizację, aby rozpocząć zarządzanie inwentarzem.
                </Alert>
              )}
            </Paper>

            {/* Placeholder for Future Settings */}
            <Alert severity="info" icon={<Settings size={20} />} sx={{ borderRadius: 2 }}>
              Więcej ustawień (powiadomienia, integracje, bezpieczeństwo) będzie dostępnych wkrótce.
            </Alert>
          </Stack>
        </Grid>
      </Grid>

      {/* Create/Edit Location Dialog */}
      <Dialog
        open={openLocationDialog}
        onClose={handleCloseLocationDialog}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: { borderRadius: 2 }
        }}
      >
        <DialogTitle sx={{ pb: 1 }}>
          {editingLocation ? 'Edytuj lokalizację' : 'Dodaj nową lokalizację'}
        </DialogTitle>
        <Divider />
        <form onSubmit={handleSubmit(onSubmitLocation)}>
          <DialogContent sx={{ pt: 3 }}>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <FormField
                  name="name"
                  control={control}
                  label="Nazwa lokalizacji"
                  placeholder="np. Salon Centrum"
                  type="text"
                  required
                  rules={{
                    maxLength: {
                      value: VALIDATION.NAME_MAX_LENGTH,
                      message: `Nazwa nie może przekraczać ${VALIDATION.NAME_MAX_LENGTH} znaków`,
                    },
                  }}
                />
              </Grid>

              <Grid item xs={12}>
                <FormField
                  name="type"
                  control={control}
                  label="Typ lokalizacji"
                  type="select"
                  required
                  options={Object.values(LOCATION_TYPES).map((type) => ({
                    value: type,
                    label: LOCATION_TYPE_LABELS[type],
                  }))}
                />
              </Grid>

              <Grid item xs={12}>
                <FormField
                  name="address"
                  control={control}
                  label="Adres"
                  placeholder="np. ul. Marszałkowska 1"
                  type="text"
                  required
                  rules={{
                    maxLength: {
                      value: VALIDATION.ADDRESS_MAX_LENGTH,
                      message: `Adres nie może przekraczać ${VALIDATION.ADDRESS_MAX_LENGTH} znaków`,
                    },
                  }}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <FormField
                  name="city"
                  control={control}
                  label="Miasto"
                  placeholder="np. Warszawa"
                  type="text"
                  required
                  rules={{
                    maxLength: {
                      value: VALIDATION.CITY_MAX_LENGTH,
                      message: `Miasto nie może przekraczać ${VALIDATION.CITY_MAX_LENGTH} znaków`,
                    },
                  }}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <FormField
                  name="postalCode"
                  control={control}
                  label="Kod pocztowy"
                  placeholder="00-000"
                  type="text"
                  required
                  rules={{
                    pattern: {
                      value: /^\d{2}-\d{3}$/,
                      message: 'Kod pocztowy musi być w formacie XX-XXX',
                    },
                  }}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <FormField
                  name="phone"
                  control={control}
                  label="Telefon (opcjonalnie)"
                  placeholder="+48 000 000 000"
                  type="text"
                  rules={{
                    pattern: {
                      value: /^[0-9+\-\s()]*$/,
                      message: 'Nieprawidłowy format numeru telefonu',
                    },
                  }}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <FormField
                  name="email"
                  control={control}
                  label="Email (opcjonalnie)"
                  placeholder="biuro@example.com"
                  type="email"
                />
              </Grid>
            </Grid>
          </DialogContent>
          <Divider />
          <DialogActions sx={{ p: 2.5 }}>
            <Button onClick={handleCloseLocationDialog} color="inherit">Anuluj</Button>
            <Button type="submit" variant="contained">
              {editingLocation ? 'Zapisz zmiany' : 'Utwórz lokalizację'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        open={deleteConfirm.open}
        onClose={handleCloseDeleteConfirm}
        onConfirm={handleConfirmDelete}
        title="Potwierdź usunięcie lokalizacji"
        message={`Czy na pewno chcesz usunąć lokalizację "${deleteConfirm.location?.name}"? Ta operacja jest nieodwracalna. Upewnij się, że lokalizacja nie ma żadnego inwentarza.`}
        confirmText="Usuń lokalizację"
        confirmColor="error"
      />

      {/* Change Password Dialog */}
      <ChangePasswordDialog
        open={openPasswordDialog}
        onClose={() => setOpenPasswordDialog(false)}
      />
    </Container>
  );
}

function ChangePasswordDialog({ open, onClose }) {
  const { control, handleSubmit, reset, watch, formState: { isSubmitting } } = useForm({
    defaultValues: {
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    },
  });

  const newPassword = watch('newPassword');

  const onSubmit = async (data) => {
    try {
      await userService.changePassword(data);
      toast.success('Hasło zostało zmienione pomyślnie');
      onClose();
      reset();
    } catch (error) {
      const errorMessage = error.response?.data?.error || 'Nie udało się zmienić hasła';
      toast.error(errorMessage);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: 2 } }}>
      <DialogTitle>Zmiana hasła</DialogTitle>
      <Divider />
      <form onSubmit={handleSubmit(onSubmit)}>
        <DialogContent sx={{ pt: 3 }}>
          <Stack spacing={2}>
            <FormField
              name="currentPassword"
              control={control}
              label="Obecne hasło"
              type="password"
              required
            />
            <FormField
              name="newPassword"
              control={control}
              label="Nowe hasło"
              type="password"
              required
              rules={{
                minLength: {
                  value: 8,
                  message: 'Hasło musi mieć co najmniej 8 znaków',
                },
                pattern: {
                  value: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=[\]{}|;:,.<>?]).*$/,
                  message: 'Hasło musi zawierać małą i dużą literę, cyfrę oraz znak specjalny',
                },
              }}
            />
            <FormField
              name="confirmPassword"
              control={control}
              label="Potwierdź nowe hasło"
              type="password"
              required
              rules={{
                validate: (value) => value === newPassword || 'Hasła nie są identyczne',
              }}
            />
          </Stack>
        </DialogContent>
        <Divider />
        <DialogActions sx={{ p: 2.5 }}>
          <Button onClick={onClose} color="inherit" disabled={isSubmitting}>
            Anuluj
          </Button>
          <Button type="submit" variant="contained" disabled={isSubmitting}>
            Zmień hasło
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}

export default SettingsPage;
