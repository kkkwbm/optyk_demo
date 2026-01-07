import { useState, useEffect, useRef } from 'react';
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
  CircularProgress,
  Checkbox,
  FormGroup,
} from '@mui/material';
import { Settings, Moon, Sun, MapPin, Plus, Trash2, User, Shield, Mail, Phone, Edit, FileText, Upload, Image, X } from 'lucide-react';
import { useForm, Controller } from 'react-hook-form';
import toast from 'react-hot-toast';
import PageHeader from '../../../shared/components/PageHeader';
import FormField from '../../../shared/components/FormField';
import ConfirmDialog from '../../../shared/components/ConfirmDialog';
import { selectTheme, setTheme } from '../../../app/uiSlice';
import { selectUser } from '../../auth/authSlice';
import { createLocation, deleteLocation, fetchActiveLocations, selectActiveLocations, updateLocation } from '../../locations/locationsSlice';
import {
  fetchCompanySettings,
  updateCompanySettings,
  uploadCompanyLogo,
  deleteCompanyLogo,
  selectCompanySettings,
  selectCompanySettingsLoading,
} from '../companySettingsSlice';
import { LOCATION_TYPES, LOCATION_TYPE_LABELS, VALIDATION, USER_ROLES } from '../../../constants';
import userService from '../../../services/userService';

const PDF_FIELD_GROUPS = [
  {
    label: 'Nagłówek',
    fields: [{ key: 'locationData', label: 'Dane lokalizacji (adres, telefon)' }],
  },
  {
    label: 'Informacje o sprzedaży',
    fields: [
      { key: 'saleNumber', label: 'Numer sprzedaży' },
      { key: 'dateTime', label: 'Data i godzina' },
      { key: 'salesperson', label: 'Sprzedawca' },
      { key: 'customer', label: 'Klient' },
      { key: 'notes', label: 'Notatki' },
    ],
  },
  {
    label: 'Produkty',
    fields: [
      { key: 'products', label: 'Lista produktów' },
      { key: 'productBrand', label: 'Marka produktu' },
      { key: 'productQuantity', label: 'Ilość' },
      { key: 'productUnitPrice', label: 'Cena jednostkowa' },
      { key: 'productTotal', label: 'Suma za produkt' },
    ],
  },
  {
    label: 'Podsumowanie',
    fields: [{ key: 'totalAmount', label: 'Suma całkowita' }],
  },
];

const DEFAULT_PDF_FIELDS = {
  locationData: true,
  saleNumber: true,
  dateTime: true,
  salesperson: true,
  customer: true,
  notes: true,
  products: true,
  productBrand: true,
  productQuantity: true,
  productUnitPrice: true,
  productTotal: true,
  totalAmount: true,
};

function SettingsPage() {
  const dispatch = useDispatch();
  const theme = useTheme();

  const currentTheme = useSelector(selectTheme);
  const user = useSelector(selectUser);
  const locations = useSelector(selectActiveLocations);
  const companySettings = useSelector(selectCompanySettings);
  const companySettingsLoading = useSelector(selectCompanySettingsLoading);

  const [openLocationDialog, setOpenLocationDialog] = useState(false);
  const [editingLocation, setEditingLocation] = useState(null);
  const [openPasswordDialog, setOpenPasswordDialog] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState({ open: false, location: null });

  // Company settings state
  const [companyName, setCompanyName] = useState('');
  const [savingCompanyName, setSavingCompanyName] = useState(false);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [pdfSelectedFields, setPdfSelectedFields] = useState(DEFAULT_PDF_FIELDS);
  const [savingPdfFields, setSavingPdfFields] = useState(false);
  const fileInputRef = useRef(null);

  const isAdmin = user?.role === USER_ROLES.ADMIN;

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
    if (isAdmin) {
      dispatch(fetchCompanySettings());
    }
  }, [dispatch, isAdmin]);

  useEffect(() => {
    if (companySettings?.companyName) {
      setCompanyName(companySettings.companyName);
    }
    if (companySettings?.pdfSelectedFields) {
      setPdfSelectedFields(companySettings.pdfSelectedFields);
    }
  }, [companySettings]);

  const handleThemeToggle = async () => {
    const newTheme = currentTheme === 'light' ? 'dark' : 'light';

    try {
      await userService.updateThemePreference(newTheme);
      dispatch(setTheme(newTheme));
      toast.success(`Zmieniono motyw na ${newTheme === 'light' ? 'jasny' : 'ciemny'}`);
    } catch (error) {
      toast.error('Nie udało się zaktualizować preferencji motywu');
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

  // Company settings handlers
  const handleSaveCompanyName = async () => {
    if (!companyName.trim()) {
      toast.error('Nazwa firmy nie może być pusta');
      return;
    }
    setSavingCompanyName(true);
    try {
      await dispatch(updateCompanySettings({ companyName: companyName.trim() })).unwrap();
      toast.success('Nazwa firmy została zaktualizowana');
    } catch (error) {
      toast.error(error || 'Nie udało się zaktualizować nazwy firmy');
    } finally {
      setSavingCompanyName(false);
    }
  };

  const handleLogoUpload = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif'];
    if (!allowedTypes.includes(file.type)) {
      toast.error('Dozwolone formaty: JPEG, PNG, GIF');
      return;
    }

    // Validate file size (2MB)
    if (file.size > 2 * 1024 * 1024) {
      toast.error('Maksymalny rozmiar pliku to 2MB');
      return;
    }

    setUploadingLogo(true);
    try {
      await dispatch(uploadCompanyLogo(file)).unwrap();
      toast.success('Logo zostało zaktualizowane');
    } catch (error) {
      toast.error(error || 'Nie udało się wgrać logo');
    } finally {
      setUploadingLogo(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleDeleteLogo = async () => {
    try {
      await dispatch(deleteCompanyLogo()).unwrap();
      toast.success('Logo zostało usunięte');
    } catch (error) {
      toast.error(error || 'Nie udało się usunąć logo');
    }
  };

  const handlePdfFieldToggle = (fieldKey) => {
    setPdfSelectedFields((prev) => ({
      ...prev,
      [fieldKey]: !prev[fieldKey],
    }));
  };

  const handleSavePdfFields = async () => {
    setSavingPdfFields(true);
    try {
      await dispatch(updateCompanySettings({ pdfSelectedFields })).unwrap();
      toast.success('Ustawienia pól PDF zostały zapisane');
    } catch (error) {
      toast.error(error || 'Nie udało się zapisać ustawień pól PDF');
    } finally {
      setSavingPdfFields(false);
    }
  };

  const isPdfFieldsChanged = JSON.stringify(pdfSelectedFields) !== JSON.stringify(companySettings?.pdfSelectedFields || DEFAULT_PDF_FIELDS);

  return (
    <Container maxWidth="lg" sx={{ pb: 4 }}>
      <PageHeader
        title="Ustawienia"
        subtitle="Zarządzaj ustawieniami aplikacji i preferencjami"
        breadcrumbs={[
          { label: 'Pulpit', to: '/' },
          { label: 'Ustawienia' },
        ]}
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

        {/* Row 2: PDF Settings (Admin Only) */}
        {isAdmin && (
          <Grid item xs={12}>
            <Paper
              elevation={0}
              sx={{
                p: 3,
                border: '1px solid',
                borderColor: 'divider',
                borderRadius: 2,
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
                <FileText size={20} />
                <Box>
                  <Typography variant="h6">Ustawienia PDF</Typography>
                  <Typography variant="body2" color="text.secondary">
                    Konfiguruj dane firmy wyświetlane w dokumentach PDF
                  </Typography>
                </Box>
              </Box>

              {companySettingsLoading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                  <CircularProgress />
                </Box>
              ) : (
                <Grid container spacing={3}>
                  {/* Company Name */}
                  <Grid item xs={12} md={6}>
                    <Box
                      sx={{
                        p: 2.5,
                        border: '1px solid',
                        borderColor: 'divider',
                        borderRadius: 1.5,
                        height: '100%',
                        display: 'flex',
                        flexDirection: 'column',
                      }}
                    >
                      <Typography variant="subtitle2" fontWeight={600} gutterBottom>
                        Nazwa firmy
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                        Nazwa wyświetlana w nagłówku dokumentów PDF
                      </Typography>
                      <Box sx={{ display: 'flex', gap: 1, mt: 'auto' }}>
                        <TextField
                          fullWidth
                          size="small"
                          value={companyName}
                          onChange={(e) => setCompanyName(e.target.value)}
                          placeholder="np. Salon Optyczny Family"
                          inputProps={{ maxLength: 255 }}
                        />
                        <Button
                          variant="contained"
                          onClick={handleSaveCompanyName}
                          disabled={savingCompanyName || companyName === companySettings?.companyName}
                          sx={{ minWidth: 100 }}
                        >
                          {savingCompanyName ? <CircularProgress size={20} /> : 'Zapisz'}
                        </Button>
                      </Box>
                    </Box>
                  </Grid>

                  {/* Logo Upload */}
                  <Grid item xs={12} md={6}>
                    <Box
                      sx={{
                        p: 2.5,
                        border: '1px solid',
                        borderColor: 'divider',
                        borderRadius: 1.5,
                        height: '100%',
                        display: 'flex',
                        flexDirection: 'column',
                      }}
                    >
                      <Typography variant="subtitle2" fontWeight={600} gutterBottom>
                        Logo firmy
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                        Logo wyświetlane w nagłówku dokumentów PDF (max 2MB, JPEG/PNG/GIF)
                      </Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mt: 'auto' }}>
                        {companySettings?.logoBase64 ? (
                          <Box
                            sx={{
                              position: 'relative',
                              width: 64,
                              height: 64,
                              border: '1px solid',
                              borderColor: 'divider',
                              borderRadius: 1,
                              overflow: 'hidden',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              bgcolor: 'background.default',
                              flexShrink: 0,
                            }}
                          >
                            <img
                              src={`data:${companySettings.logoContentType || 'image/jpeg'};base64,${companySettings.logoBase64}`}
                              alt="Logo firmy"
                              style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }}
                            />
                            <IconButton
                              size="small"
                              onClick={handleDeleteLogo}
                              sx={{
                                position: 'absolute',
                                top: 2,
                                right: 2,
                                bgcolor: 'error.main',
                                color: 'white',
                                '&:hover': { bgcolor: 'error.dark' },
                                width: 18,
                                height: 18,
                              }}
                            >
                              <X size={10} />
                            </IconButton>
                          </Box>
                        ) : (
                          <Box
                            sx={{
                              width: 64,
                              height: 64,
                              border: '2px dashed',
                              borderColor: 'divider',
                              borderRadius: 1,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              bgcolor: 'background.default',
                              flexShrink: 0,
                            }}
                          >
                            <Image size={28} color={theme.palette.text.disabled} />
                          </Box>
                        )}
                        <Box>
                          <input
                            type="file"
                            ref={fileInputRef}
                            onChange={handleLogoUpload}
                            accept="image/jpeg,image/png,image/gif"
                            style={{ display: 'none' }}
                          />
                          <Button
                            variant="outlined"
                            size="small"
                            startIcon={uploadingLogo ? <CircularProgress size={14} /> : <Upload size={14} />}
                            onClick={() => fileInputRef.current?.click()}
                            disabled={uploadingLogo}
                          >
                            {uploadingLogo ? 'Wgrywanie...' : 'Wgraj logo'}
                          </Button>
                        </Box>
                      </Box>
                    </Box>
                  </Grid>

                  {/* PDF Fields Configuration */}
                  <Grid item xs={12}>
                    <Divider sx={{ my: 2 }} />
                    <Typography variant="subtitle2" gutterBottom>
                      Pola wyświetlane w PDF
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                      Wybierz, które informacje mają być widoczne w dokumentach PDF sprzedaży
                    </Typography>
                    <Grid container spacing={2}>
                      {PDF_FIELD_GROUPS.map((group) => (
                        <Grid item xs={12} sm={6} md={3} key={group.label}>
                          <Paper
                            variant="outlined"
                            sx={{ p: 2, height: '100%' }}
                          >
                            <Typography variant="subtitle2" color="primary" gutterBottom>
                              {group.label}
                            </Typography>
                            <FormGroup>
                              {group.fields.map((field) => (
                                <FormControlLabel
                                  key={field.key}
                                  control={
                                    <Checkbox
                                      size="small"
                                      checked={pdfSelectedFields[field.key] || false}
                                      onChange={() => handlePdfFieldToggle(field.key)}
                                    />
                                  }
                                  label={
                                    <Typography variant="body2">
                                      {field.label}
                                    </Typography>
                                  }
                                />
                              ))}
                            </FormGroup>
                          </Paper>
                        </Grid>
                      ))}
                    </Grid>
                    <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end' }}>
                      <Button
                        variant="contained"
                        onClick={handleSavePdfFields}
                        disabled={savingPdfFields || !isPdfFieldsChanged}
                      >
                        {savingPdfFields ? <CircularProgress size={20} /> : 'Zapisz ustawienia pól'}
                      </Button>
                    </Box>
                  </Grid>
                </Grid>
              )}
            </Paper>
          </Grid>
        )}

        {/* Row 3: Location Management */}
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
