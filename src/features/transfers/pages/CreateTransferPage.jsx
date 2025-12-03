import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Paper,
  Box,
  Button,
  Grid,
  Typography,
  Autocomplete,
  TextField,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Alert,
  Divider,
  Stack,
} from '@mui/material';
import { ArrowLeft, Plus, Trash2 } from 'lucide-react';
import { useForm, Controller } from 'react-hook-form';
import toast from 'react-hot-toast';
import PageHeader from '../../../shared/components/PageHeader';
import FormField from '../../../shared/components/FormField';
import { createTransfer } from '../transfersSlice';
import { fetchActiveLocations, selectActiveLocations } from '../../locations/locationsSlice';
import { fetchInventory, selectInventoryItems, clearInventory } from '../../inventory/inventorySlice';
import { VALIDATION } from '../../../constants';

function CreateTransferPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const inventoryItems = useSelector(selectInventoryItems);
  const locations = useSelector(selectActiveLocations);

  const [selectedFromLocation, setSelectedFromLocation] = useState(null);
  const [selectedToLocation, setSelectedToLocation] = useState(null);
  const [transferItems, setTransferItems] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [quantity, setQuantity] = useState('');
  const [availableStock, setAvailableStock] = useState(null);

  const { control, handleSubmit, watch } = useForm({
    defaultValues: {
      fromLocationId: '',
      toLocationId: '',
      reason: '',
      notes: '',
    },
  });

  const fromLocationId = watch('fromLocationId');
  const toLocationId = watch('toLocationId');

  useEffect(() => {
    dispatch(fetchActiveLocations());
    return () => {
      dispatch(clearInventory());
    };
  }, [dispatch]);

  // Fetch inventory when source location changes
  useEffect(() => {
    if (selectedFromLocation) {
      dispatch(fetchInventory({ locationId: selectedFromLocation.id, params: { size: 1000 } }));
    } else {
      dispatch(clearInventory());
    }
  }, [dispatch, selectedFromLocation]);

  // Update available stock when product is selected
  useEffect(() => {
    if (selectedProduct) {
      const item = inventoryItems.find(i => i.product.id === selectedProduct.id);
      if (item) {
        setAvailableStock(item.quantity);
      } else {
        setAvailableStock(0);
      }
    } else {
      setAvailableStock(null);
    }
  }, [selectedProduct, inventoryItems]);

  const handleAddItem = () => {
    if (!selectedProduct) {
      toast.error('Proszę wybrać produkt');
      return;
    }
    if (!quantity || parseInt(quantity, 10) <= 0) {
      toast.error('Proszę wpisać prawidłową ilość');
      return;
    }
    if (availableStock !== null && parseInt(quantity, 10) > availableStock) {
      toast.error(`Dostępne tylko ${availableStock} jednostek w lokalizacji źródłowej`);
      return;
    }

    const existingItem = transferItems.find((item) => item.product.id === selectedProduct.id);
    if (existingItem) {
      toast.error('Produkt już został dodany. Usuń go najpierw, aby zmienić ilość.');
      return;
    }

    setTransferItems([
      ...transferItems,
      {
        product: selectedProduct,
        quantity: parseInt(quantity, 10),
        availableStock,
      },
    ]);

    setSelectedProduct(null);
    setQuantity('');
    setAvailableStock(null);
  };

  const handleRemoveItem = (productId) => {
    setTransferItems(transferItems.filter((item) => item.product.id !== productId));
  };

  const handleQuantityChange = (productId, newQuantity) => {
    const qty = parseInt(newQuantity, 10);
    if (qty > 0) {
      setTransferItems(
        transferItems.map((item) => {
          if (item.product.id === productId) {
            if (qty > item.availableStock) {
              toast.error(`Dostępne tylko ${item.availableStock} jednostek`);
              return item;
            }
            return { ...item, quantity: qty };
          }
          return item;
        })
      );
    }
  };

  const onSubmit = async (data) => {
    try {
      if (!selectedFromLocation || !selectedToLocation) {
        toast.error('Proszę wybrać lokalizację źródłową i docelową');
        return;
      }

      if (selectedFromLocation.id === selectedToLocation.id) {
        toast.error('Lokalizacja źródłowa i docelowa muszą być różne');
        return;
      }

      if (transferItems.length === 0) {
        toast.error('Proszę dodać co najmniej jeden produkt');
        return;
      }

      const transferData = {
        fromLocationId: selectedFromLocation.id,
        toLocationId: selectedToLocation.id,
        items: transferItems.map((item) => ({
          productId: item.product.id,
          quantity: item.quantity,
        })),
        reason: data.reason,
        notes: data.notes || undefined,
      };

      await dispatch(createTransfer(transferData)).unwrap();
      toast.success('Transfer utworzony pomyślnie');
      navigate('/transfers');
    } catch (error) {
      toast.error(error || 'Nie udało się utworzyć transferu');
    }
  };

  // Map inventory items to options
  const productOptions = inventoryItems.map((item) => ({
    id: item.product.id,
    label: `${item.product.brand?.name || ''} ${item.product.model || item.product.name || ''}`,
    product: item.product,
    quantity: item.quantity,
    brand: item.product.brand?.name
  }));

  const locationOptions = locations.map((location) => ({
    id: location.id,
    label: location.name,
    type: location.type
  }));

  const filteredToLocations = locationOptions.filter(
    (loc) => loc.id !== selectedFromLocation?.id
  );

  return (
    <Container maxWidth={false} sx={{ px: { xs: 2, sm: 4, md: 6, lg: 8 } }}>
      <PageHeader
        title="Nowy transfer"
        subtitle="Transferuj towar między lokalizacjami"
        breadcrumbs={[
          { label: 'Panel', to: '/' },
          { label: 'Transfery', to: '/transfers' },
          { label: 'Nowy transfer' },
        ]}
        actions={[
          {
            label: 'Wróć',
            icon: <ArrowLeft size={20} />,
            onClick: () => navigate('/transfers'),
            variant: 'outlined',
          },
        ]}
      />

      <Paper sx={{ p: 3, mx: 'auto', maxWidth: '100%' }}>
        <form onSubmit={handleSubmit(onSubmit)}>
          <Stack spacing={3}>

            {/* SECTION 1: Transfer Route */}
            <Box>
              <Typography variant="h4" sx={{ fontWeight: 600, mb: 2 }}>
                Trasa transferu
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <Controller
                    name="fromLocationId"
                    control={control}
                    rules={{ required: 'Lokalizacja źródłowa jest wymagana' }}
                    render={({ field, fieldState: { error } }) => (
                      <Autocomplete
                        {...field}
                        fullWidth
                        disableClearable
                        options={locationOptions}
                        value={locationOptions.find((opt) => opt.id === field.value) || null}
                        onChange={(_, newValue) => {
                          field.onChange(newValue?.id || '');
                          if (newValue) {
                            const location = locations.find((l) => l.id === newValue.id);
                            setSelectedFromLocation(location || null);
                          } else {
                            setSelectedFromLocation(null);
                          }
                          setTransferItems([]);
                          setSelectedProduct(null);
                        }}
                        getOptionLabel={(option) => option.label || ''}
                        sx={{ width: '100%', minWidth: { md: '600px' } }}
                        renderInput={(params) => (
                          <TextField
                            {...params}
                            label="Lokalizacja źródłowa"
                            required
                            error={!!error}
                            helperText={error?.message}
                            fullWidth
                            sx={{
                              '& .MuiInputBase-root': {
                                fontSize: '1rem',
                                minHeight: '50px',
                                padding: '8px 12px',
                                width: '100%'
                              },
                              '& .MuiInputLabel-root': {
                                fontSize: '1rem',
                              },
                              '& .MuiInputBase-input': {
                                minWidth: '200px'
                              }
                            }}
                          />
                        )}
                      />
                    )}
                  />
                </Grid>

                <Grid item xs={12} md={6}>
                  <Controller
                    name="toLocationId"
                    control={control}
                    rules={{ required: 'Lokalizacja docelowa jest wymagana' }}
                    render={({ field, fieldState: { error } }) => (
                      <Autocomplete
                        {...field}
                        fullWidth
                        disableClearable
                        options={filteredToLocations}
                        value={filteredToLocations.find((opt) => opt.id === field.value) || null}
                        onChange={(_, newValue) => {
                          field.onChange(newValue?.id || '');
                          if (newValue) {
                            const location = locations.find((l) => l.id === newValue.id);
                            setSelectedToLocation(location || null);
                          } else {
                            setSelectedToLocation(null);
                          }
                        }}
                        getOptionLabel={(option) => option.label || ''}
                        disabled={!selectedFromLocation}
                        sx={{ width: '100%', minWidth: { md: '600px' } }}
                        renderInput={(params) => (
                          <TextField
                            {...params}
                            label="Lokalizacja docelowa"
                            required
                            error={!!error}
                            helperText={error?.message || (!selectedFromLocation ? 'Najpierw wybierz lokalizację źródłową' : '')}
                            fullWidth
                            sx={{
                              '& .MuiInputBase-root': {
                                fontSize: '1rem',
                                minHeight: '50px',
                                padding: '8px 12px',
                                width: '100%'
                              },
                              '& .MuiInputLabel-root': {
                                fontSize: '1rem',
                              },
                              '& .MuiInputBase-input': {
                                minWidth: '200px'
                              }
                            }}
                          />
                        )}
                      />
                    )}
                  />
                </Grid>
              </Grid>
            </Box>

            <Divider />

            {/* SECTION 2: Product Selector (Always Visible) */}
            <Box>
              <Typography variant="h4" sx={{ fontWeight: 600, mb: 2 }}>
                Wybór produktów
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <Autocomplete
                    options={productOptions}
                    value={
                      selectedProduct
                        ? productOptions.find((opt) => opt.id === selectedProduct.id)
                        : null
                    }
                    onChange={(_, newValue) => {
                      setSelectedProduct(newValue?.product || null);
                      setQuantity('');
                    }}
                    getOptionLabel={(option) => option.label || ''}
                    disabled={!selectedFromLocation}
                    noOptionsText={
                      !selectedFromLocation
                        ? "Wybierz lokalizację źródłową"
                        : inventoryItems.length === 0
                          ? "Brak produktów w tej lokalizacji"
                          : "Brak wyników"
                    }
                    sx={{ width: '100%', minWidth: { md: '600px' } }}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        label="Wybierz produkt"
                        placeholder={!selectedFromLocation ? "Najpierw wybierz lokalizację źródłową..." : "Wpisz nazwę, model lub markę..."}
                        fullWidth
                        sx={{
                          '& .MuiInputBase-root': {
                            fontSize: '1rem',
                            minHeight: '50px',
                            padding: '8px 12px',
                            width: '100%'
                          },
                          '& .MuiInputLabel-root': {
                            fontSize: '1rem',
                          }
                        }}
                      />
                    )}
                    renderOption={(props, option) => {
                      const { key, ...otherProps } = props;
                      return (
                        <li key={key} {...otherProps} style={{ display: 'block', padding: '12px 16px' }}>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
                            <Box>
                              <Typography variant="body1" fontWeight="600" sx={{ fontSize: '1.1rem' }}>
                                {option.label}
                              </Typography>
                              <Typography variant="body2" color="text.secondary">
                                {option.brand}
                              </Typography>
                            </Box>
                            <Typography variant="body2" sx={{
                              bgcolor: option.quantity > 0 ? 'success.lighter' : 'error.lighter',
                              color: option.quantity > 0 ? 'success.dark' : 'error.dark',
                              px: 2,
                              py: 0.75,
                              borderRadius: 1,
                              fontWeight: 600,
                              fontSize: '1rem'
                            }}>
                              {option.quantity} szt.
                            </Typography>
                          </Box>
                        </li>
                      );
                    }}
                  />
                </Grid>

                <Grid item xs={12} md={6}>
                  <TextField
                    label="Ilość"
                    type="number"
                    value={quantity}
                    onChange={(e) => setQuantity(e.target.value)}
                    fullWidth
                    disabled={!selectedProduct}
                    inputProps={{ min: 1 }}
                    helperText={
                      availableStock !== null
                        ? `Dostępne w ${selectedFromLocation.name}: ${availableStock}`
                        : undefined
                    }
                    sx={{
                      '& .MuiInputBase-root': {
                        fontSize: '1rem',
                        minHeight: '50px'
                      },
                      '& .MuiInputLabel-root': {
                        fontSize: '1rem'
                      }
                    }}
                  />
                </Grid>

                <Grid item xs={12} md={6}>
                  <Button
                    variant="contained"
                    startIcon={<Plus size={20} />}
                    onClick={handleAddItem}
                    fullWidth
                    disabled={!selectedProduct}
                    sx={{
                      height: '50px',
                      fontSize: '1rem',
                      fontWeight: 600
                    }}
                  >
                    Dodaj do listy
                  </Button>
                </Grid>

                {availableStock === 0 && selectedProduct && (
                  <Grid item xs={12}>
                    <Alert severity="error">
                      Ten produkt jest niedostępny w {selectedFromLocation.name}
                    </Alert>
                  </Grid>
                )}

                {transferItems.length > 0 && (
                  <Grid item xs={12}>
                    <Typography variant="h6" sx={{ mb: 2, mt: 2 }}>
                      Produkty transferu ({transferItems.length})
                    </Typography>
                    <TableContainer>
                      <Table>
                        <TableHead>
                          <TableRow>
                            <TableCell sx={{ fontWeight: 600 }}>Produkt</TableCell>
                            <TableCell sx={{ fontWeight: 600 }}>Marka</TableCell>
                            <TableCell align="right" sx={{ fontWeight: 600 }}>Dostępne</TableCell>
                            <TableCell align="right" sx={{ fontWeight: 600 }}>Ilość</TableCell>
                            <TableCell align="right" sx={{ fontWeight: 600 }}>Akcje</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {transferItems.map((item) => (
                            <TableRow key={item.product.id}>
                              <TableCell>
                                {item.product.model || item.product.name || '-'}
                              </TableCell>
                              <TableCell>{item.product.brand?.name || '-'}</TableCell>
                              <TableCell align="right">{item.availableStock}</TableCell>
                              <TableCell align="right">
                                <TextField
                                  type="number"
                                  value={item.quantity}
                                  onChange={(e) =>
                                    handleQuantityChange(item.product.id, e.target.value)
                                  }
                                  size="small"
                                  inputProps={{ min: 1, max: item.availableStock }}
                                  sx={{ width: 100 }}
                                />
                              </TableCell>
                              <TableCell align="right">
                                <IconButton
                                  size="small"
                                  color="error"
                                  onClick={() => handleRemoveItem(item.product.id)}
                                >
                                  <Trash2 size={16} />
                                </IconButton>
                              </TableCell>
                            </TableRow>
                          ))}
                          <TableRow>
                            <TableCell colSpan={3} align="right">
                              <strong>Razem produktów:</strong>
                            </TableCell>
                            <TableCell align="right">
                              <strong>
                                {transferItems.reduce((sum, item) => sum + item.quantity, 0)}
                              </strong>
                            </TableCell>
                            <TableCell />
                          </TableRow>
                        </TableBody>
                      </Table>
                    </TableContainer>
                  </Grid>
                )}
              </Grid>
            </Box>

            <Divider />

            {/* SECTION 3: Transfer Details (Moved Down) */}
            <Box>
              <Typography variant="h4" sx={{ fontWeight: 600, mb: 2 }}>
                Szczegóły
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <FormField
                    name="reason"
                    control={control}
                    label="Powód transferu (opcjonalnie)"
                    type="text"
                    rules={{
                      maxLength: {
                        value: VALIDATION.DESCRIPTION_MAX_LENGTH,
                        message: `Powód nie może przekraczać ${VALIDATION.DESCRIPTION_MAX_LENGTH} znaków`,
                      },
                    }}
                    sx={{
                      '& .MuiInputBase-root': {
                        fontSize: '1rem',
                        minHeight: '50px'
                      },
                      '& .MuiInputLabel-root': {
                        fontSize: '1rem'
                      }
                    }}
                  />
                </Grid>

                <Grid item xs={12} md={6}>
                  <FormField
                    name="notes"
                    control={control}
                    label="Dodatkowe uwagi (opcjonalnie)"
                    type="text"
                    multiline
                    rows={3}
                    rules={{
                      maxLength: {
                        value: VALIDATION.NOTES_MAX_LENGTH,
                        message: `Notatki nie mogą przekraczać ${VALIDATION.NOTES_MAX_LENGTH} znaków`,
                      },
                    }}
                    sx={{
                      '& .MuiInputBase-root': {
                        fontSize: '1rem'
                      },
                      '& .MuiInputLabel-root': {
                        fontSize: '1rem'
                      }
                    }}
                  />
                </Grid>
              </Grid>
            </Box>

            {/* SECTION 4: Actions */}
            <Box sx={{ display: 'flex', gap: 3, justifyContent: 'flex-end', pt: 2 }}>
              <Button
                variant="outlined"
                onClick={() => navigate('/transfers')}
                size="large"
                sx={{
                  px: 5,
                  py: 1.5,
                  fontSize: '1.1rem',
                  fontWeight: 600
                }}
              >
                Anuluj
              </Button>
              <Button
                type="submit"
                variant="contained"
                disabled={
                  transferItems.length === 0 || !fromLocationId || !toLocationId
                }
                size="large"
                sx={{
                  px: 5,
                  py: 1.5,
                  fontSize: '1.1rem',
                  fontWeight: 600
                }}
              >
                Utwórz transfer
              </Button>
            </Box>
          </Stack>
        </form>
      </Paper>
    </Container>
  );
}

export default CreateTransferPage;
