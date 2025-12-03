import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  Container,
  Paper,
  Box,
  Button,
  Grid,
  Typography,
  Alert,
  Autocomplete,
  TextField,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from '@mui/material';
import { ArrowLeft, Plus, Trash2 } from 'lucide-react';
import { useForm, Controller } from 'react-hook-form';
import toast from 'react-hot-toast';
import PageHeader from '../../../shared/components/PageHeader';
import FormField from '../../../shared/components/FormField';
import { createTransfer } from '../../transfers/transfersSlice';
import { fetchProducts, selectProducts } from '../../products/productsSlice';
import { fetchActiveLocations, selectActiveLocations, selectCurrentLocation } from '../../locations/locationsSlice';
import { fetchInventoryByProductAndLocation } from '../inventorySlice';
import { VALIDATION } from '../../../constants';

function StockTransferPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const products = useSelector(selectProducts);
  const locations = useSelector(selectActiveLocations);
  const currentLocation = useSelector(selectCurrentLocation);

  const [selectedFromLocation, setSelectedFromLocation] = useState(null);
  const [selectedToLocation, setSelectedToLocation] = useState(null);
  const [transferItems, setTransferItems] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [quantity, setQuantity] = useState('');
  const [availableStock, setAvailableStock] = useState(null);

  const { control, handleSubmit, watch, setValue } = useForm({
    defaultValues: {
      fromLocationId: '',
      toLocationId: '',
      reason: '',
      notes: '',
    },
  });

  const fromLocationId = watch('fromLocationId');

  useEffect(() => {
    dispatch(fetchProducts({ page: 0, size: 1000 }));
    dispatch(fetchActiveLocations());
  }, [dispatch]);

  useEffect(() => {
    const productId = searchParams.get('product');
    const fromId = searchParams.get('from');

    if (productId && products.length > 0) {
      const product = products.find((p) => p.id === productId);
      if (product) {
        setSelectedProduct(product);
      }
    }

    // Priority: URL param > Current Location > None
    const targetFromId = fromId || currentLocation?.id;

    if (targetFromId && locations.length > 0) {
      const location = locations.find((l) => l.id === targetFromId);
      if (location) {
        setSelectedFromLocation(location);
        setValue('fromLocationId', location.id);
      }
    }
  }, [searchParams, products, locations, currentLocation, setValue]);

  useEffect(() => {
    if (selectedProduct && selectedFromLocation) {
      dispatch(
        fetchInventoryByProductAndLocation({
          productId: selectedProduct.id,
          locationId: selectedFromLocation.id,
        })
      ).then((result) => {
        if (result.payload) {
          setAvailableStock(result.payload.availableQuantity);
        }
      });
    } else {
      setAvailableStock(null);
    }
  }, [dispatch, selectedProduct, selectedFromLocation]);

  const handleAddItem = () => {
    if (!selectedProduct) {
      toast.error('Wybierz produkt');
      return;
    }
    if (!quantity || parseInt(quantity, 10) <= 0) {
      toast.error('Wpisz prawidłową ilość');
      return;
    }
    if (availableStock !== null && parseInt(quantity, 10) > availableStock) {
      toast.error(`Dostępne tylko ${availableStock} artykułów`);
      return;
    }

    const existingItem = transferItems.find((item) => item.product.id === selectedProduct.id);
    if (existingItem) {
      toast.error('Produkt już dodany');
      return;
    }

    setTransferItems([
      ...transferItems,
      {
        product: selectedProduct,
        quantity: parseInt(quantity, 10),
      },
    ]);

    setSelectedProduct(null);
    setQuantity('');
    setAvailableStock(null);
  };

  const handleRemoveItem = (productId) => {
    setTransferItems(transferItems.filter((item) => item.product.id !== productId));
  };

  const onSubmit = async (data) => {
    try {
      if (!selectedFromLocation || !selectedToLocation) {
        toast.error('Wybierz lokalizacje początkową i docelową');
        return;
      }

      if (selectedFromLocation.id === selectedToLocation.id) {
        toast.error('Lokalizacje początkowa i docelowa muszą być różne');
        return;
      }

      if (transferItems.length === 0) {
        toast.error('Dodaj co najmniej jeden produkt');
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
      toast.success('Transfer został utworzony');
      navigate('/transfers');
    } catch (error) {
      toast.error(error || 'Nie udało się utworzyć transferu');
    }
  };

  const productOptions = products.map((product) => ({
    id: product.id,
    label: `${product.brand?.name || ''} ${product.model || product.name || ''}`.trim(),
  }));

  const locationOptions = locations.map((location) => ({
    id: location.id,
    label: location.name,
  }));

  const filteredToLocations = locationOptions.filter(
    (loc) => loc.id !== selectedFromLocation?.id
  );

  return (
    <Container maxWidth="lg">
      <PageHeader
        title="Transfer magazynowy"
        subtitle="Przenieś zapasy między lokalizacjami"
        breadcrumbs={[
          { label: 'Pulpit', to: '/' },
          { label: 'Magazyn', to: '/inventory' },
          { label: 'Transfer magazynowy' },
        ]}
        actions={[
          {
            label: 'Wróć',
            icon: <ArrowLeft size={20} />,
            onClick: () => navigate('/inventory/stock'),
            variant: 'outlined',
          },
        ]}
      />

      <Paper sx={{ p: 3 }}>
        <form onSubmit={handleSubmit(onSubmit)}>
          <Grid container spacing={3}>
            {/* From Location */}
            <Grid item xs={12} md={6}>
              <Controller
                name="fromLocationId"
                control={control}
                rules={{ required: 'Lokalizacja początkowa jest wymagana' }}
                render={({ field, fieldState: { error } }) => (
                  <Autocomplete
                    {...field}
                    options={locationOptions}
                    value={locationOptions.find((opt) => opt.id === field.value) || null}
                    onChange={(_, newValue) => {
                      field.onChange(newValue?.id || '');
                      const location = locations.find((l) => l.id === newValue?.id);
                      setSelectedFromLocation(location || null);
                      setTransferItems([]);
                    }}
                    getOptionLabel={(option) => option.label || ''}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        label="Z lokalizacji"
                        required
                        error={!!error}
                        helperText={error?.message}
                      />
                    )}
                  />
                )}
              />
            </Grid>

            {/* To Location */}
            <Grid item xs={12} md={6}>
              <Controller
                name="toLocationId"
                control={control}
                rules={{ required: 'Lokalizacja docelowa jest wymagana' }}
                render={({ field, fieldState: { error } }) => (
                  <Autocomplete
                    {...field}
                    options={filteredToLocations}
                    value={filteredToLocations.find((opt) => opt.id === field.value) || null}
                    onChange={(_, newValue) => {
                      field.onChange(newValue?.id || '');
                      const location = locations.find((l) => l.id === newValue?.id);
                      setSelectedToLocation(location || null);
                    }}
                    getOptionLabel={(option) => option.label || ''}
                    disabled={!selectedFromLocation}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        label="Do lokalizacji"
                        required
                        error={!!error}
                        helperText={error?.message}
                      />
                    )}
                  />
                )}
              />
            </Grid>

            {/* Add Products Section */}
            {selectedFromLocation && (
              <>
                <Grid item xs={12}>
                  <Typography variant="h6" sx={{ mb: 2 }}>
                    Dodaj produkty
                  </Typography>
                </Grid>

                <Grid item xs={12} md={6}>
                  <Autocomplete
                    options={productOptions}
                    value={
                      selectedProduct
                        ? productOptions.find((opt) => opt.id === selectedProduct.id)
                        : null
                    }
                    onChange={(_, newValue) => {
                      const product = products.find((p) => p.id === newValue?.id);
                      setSelectedProduct(product || null);
                      setQuantity('');
                    }}
                    getOptionLabel={(option) => option.label || ''}
                    renderInput={(params) => <TextField {...params} label="Wybierz produkt" />}
                  />
                </Grid>

                <Grid item xs={12} md={4}>
                  <TextField
                    label="Ilość"
                    type="number"
                    value={quantity}
                    onChange={(e) => setQuantity(e.target.value)}
                    fullWidth
                    inputProps={{ min: 1 }}
                    helperText={
                      availableStock !== null ? `Dostępne: ${availableStock}` : undefined
                    }
                  />
                </Grid>

                <Grid item xs={12} md={2}>
                  <Button
                    variant="contained"
                    startIcon={<Plus size={16} />}
                    onClick={handleAddItem}
                    fullWidth
                    sx={{ height: '56px' }}
                  >
                    Dodaj
                  </Button>
                </Grid>

                {/* Transfer Items Table */}
                {transferItems.length > 0 && (
                  <Grid item xs={12}>
                    <TableContainer>
                      <Table>
                        <TableHead>
                          <TableRow>
                            <TableCell sx={{ fontWeight: 600 }}>Produkt</TableCell>
                            <TableCell sx={{ fontWeight: 600 }}>Marka</TableCell>
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
                              <TableCell align="right">{item.quantity}</TableCell>
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
                        </TableBody>
                      </Table>
                    </TableContainer>
                  </Grid>
                )}
              </>
            )}

            {/* Reason */}
            <Grid item xs={12}>
              <FormField
                name="reason"
                control={control}
                label="Powód"
                type="text"
                required
                rules={{
                  maxLength: {
                    value: VALIDATION.DESCRIPTION_MAX_LENGTH,
                    message: `Powód nie może przekraczać ${VALIDATION.DESCRIPTION_MAX_LENGTH} znaków`,
                  },
                }}
              />
            </Grid>

            {/* Notes */}
            <Grid item xs={12}>
              <FormField
                name="notes"
                control={control}
                label="Uwagi (opcjonalnie)"
                type="text"
                multiline
                rows={3}
                rules={{
                  maxLength: {
                    value: VALIDATION.NOTES_MAX_LENGTH,
                    message: `Uwagi nie mogą przekraczać ${VALIDATION.NOTES_MAX_LENGTH} znaków`,
                  },
                }}
              />
            </Grid>
          </Grid>

          {/* Form Actions */}
          <Box sx={{ mt: 3, display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
            <Button variant="outlined" onClick={() => navigate('/inventory/stock')}>
              Anuluj
            </Button>
            <Button type="submit" variant="contained" disabled={transferItems.length === 0}>
              Utwórz transfer
            </Button>
          </Box>
        </form>
      </Paper>
    </Container>
  );
}

export default StockTransferPage;
