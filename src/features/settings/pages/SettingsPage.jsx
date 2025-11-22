import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
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
} from '@mui/material';
import { Settings, Moon, Sun, MapPin, Plus } from 'lucide-react';
import { useForm, Controller } from 'react-hook-form';
import toast from 'react-hot-toast';
import PageHeader from '../../../shared/components/PageHeader';
import FormField from '../../../shared/components/FormField';
import { selectTheme, setTheme } from '../../../app/uiSlice';
import { selectUser } from '../../auth/authSlice';
import { createLocation } from '../../locations/locationsSlice';
import { LOCATION_TYPES, LOCATION_TYPE_LABELS, VALIDATION } from '../../../constants';
import userService from '../../../services/userService';

function SettingsPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const currentTheme = useSelector(selectTheme);
  const user = useSelector(selectUser);

  const [openLocationDialog, setOpenLocationDialog] = useState(false);

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
    setOpenLocationDialog(true);
  };

  const handleCloseLocationDialog = () => {
    setOpenLocationDialog(false);
    reset();
  };

  const onSubmitLocation = async (data) => {
    try {
      await dispatch(createLocation(data)).unwrap();
      toast.success('Lokalizacja została utworzona');
      handleCloseLocationDialog();
    } catch (error) {
      toast.error(error || 'Nie udało się utworzyć lokalizacji');
    }
  };

  return (
    <Container maxWidth="lg">
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
        {/* Appearance Settings */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                {currentTheme === 'light' ? <Sun size={24} /> : <Moon size={24} />}
                <Typography variant="h6" sx={{ ml: 1 }}>
                  Wygląd
                </Typography>
              </Box>
              <Divider sx={{ mb: 2 }} />

              <FormControlLabel
                control={
                  <Switch
                    checked={currentTheme === 'dark'}
                    onChange={handleThemeToggle}
                    color="primary"
                  />
                }
                label={
                  <Box>
                    <Typography variant="body1">Tryb ciemny</Typography>
                    <Typography variant="body2" color="text.secondary">
                      Przełącz między jasnym a ciemnym motywem
                    </Typography>
                  </Box>
                }
              />
            </CardContent>
          </Card>
        </Grid>

        {/* Location Management */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <MapPin size={24} />
                <Typography variant="h6" sx={{ ml: 1 }}>
                  Lokalizacje
                </Typography>
              </Box>
              <Divider sx={{ mb: 2 }} />

              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Zarządzaj salonami optycznymi i magazynami
              </Typography>

              <Button
                variant="contained"
                startIcon={<Plus size={20} />}
                onClick={handleOpenLocationDialog}
                fullWidth
              >
                Dodaj nową lokalizację
              </Button>
            </CardContent>
          </Card>
        </Grid>

        {/* User Information */}
        <Grid item xs={12}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" sx={{ mb: 2 }}>
              Informacje o koncie
            </Typography>
            <Divider sx={{ mb: 2 }} />

            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <Typography variant="body2" color="text.secondary">
                  Imię i nazwisko
                </Typography>
                <Typography variant="body1">
                  {user?.firstName} {user?.lastName}
                </Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="body2" color="text.secondary">
                  Email
                </Typography>
                <Typography variant="body1">{user?.email}</Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="body2" color="text.secondary">
                  Rola
                </Typography>
                <Typography variant="body1">{user?.role}</Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="body2" color="text.secondary">
                  Status
                </Typography>
                <Typography variant="body1">
                  {user?.isActive ? 'Aktywny' : 'Nieaktywny'}
                </Typography>
              </Grid>
            </Grid>
          </Paper>
        </Grid>

        {/* Additional Settings Placeholder */}
        <Grid item xs={12}>
          <Alert severity="info">
            Więcej ustawień będzie dostępnych wkrótce
          </Alert>
        </Grid>
      </Grid>

      {/* Create Location Dialog */}
      <Dialog
        open={openLocationDialog}
        onClose={handleCloseLocationDialog}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Dodaj nową lokalizację</DialogTitle>
        <form onSubmit={handleSubmit(onSubmitLocation)}>
          <DialogContent>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <FormField
                  name="name"
                  control={control}
                  label="Nazwa lokalizacji"
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
                  type="email"
                />
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseLocationDialog}>Anuluj</Button>
            <Button type="submit" variant="contained">
              Utwórz lokalizację
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </Container>
  );
}

export default SettingsPage;
