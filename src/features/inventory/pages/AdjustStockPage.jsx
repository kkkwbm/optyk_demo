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
} from '@mui/material';
import { ArrowLeft } from 'lucide-react';
import { useForm, Controller } from 'react-hook-form';
import toast from 'react-hot-toast';
import PageHeader from '../../../shared/components/PageHeader';
import FormField from '../../../shared/components/FormField';
import { adjustStock, fetchInventoryByProductAndLocation } from '../inventorySlice';
import { fetchProducts, selectProducts } from '../../products/productsSlice';
import { fetchActiveLocations, selectActiveLocations, selectCurrentLocation } from '../../locations/locationsSlice';
import { STOCK_ADJUSTMENT_TYPES, STOCK_ADJUSTMENT_TYPE_LABELS, VALIDATION } from '../../../constants';

function AdjustStockPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const products = useSelector(selectProducts);
  const locations = useSelector(selectActiveLocations);
  const currentLocation = useSelector(selectCurrentLocation);

  const [selectedProduct, setSelectedProduct] = useState(null);
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [currentStock, setCurrentStock] = useState(null);

  const { control, handleSubmit, watch, setValue } = useForm({
    defaultValues: {
      productId: '',
      locationId: '',
      adjustmentType: STOCK_ADJUSTMENT_TYPES.ADD,
      quantity: '',
      reason: '',
      notes: '',
    },
  });

  const adjustmentType = watch('adjustmentType');
  const quantity = watch('quantity');

  useEffect(() => {
    dispatch(fetchProducts({ page: 0, size: 1000 }));
    dispatch(fetchActiveLocations());
  }, [dispatch]);

  useEffect(() => {
    const productId = searchParams.get('product');
    const locationId = searchParams.get('location');

    if (productId && products.length > 0) {
      const product = products.find((p) => p.id === productId);
      if (product) {
        setSelectedProduct(product);
        setValue('productId', product.id);
      }
    }

    // Priority: URL param > Current Location > None
    const targetLocationId = locationId || currentLocation?.id;

    if (targetLocationId && locations.length > 0) {
      const location = locations.find((l) => l.id === targetLocationId);
      if (location) {
        setSelectedLocation(location);
        setValue('locationId', location.id);
      }
    }
  }, [searchParams, products, locations, setValue, currentLocation]);

  useEffect(() => {
    if (selectedProduct && selectedLocation) {
      dispatch(
        fetchInventoryByProductAndLocation({
          productId: selectedProduct.id,
          locationId: selectedLocation.id,
        })
      ).then((result) => {
        if (result.payload) {
          setCurrentStock(result.payload);
        }
      });
    }
  }, [dispatch, selectedProduct, selectedLocation]);

  const onSubmit = async (data) => {
    try {
      if (!selectedProduct || !selectedLocation) {
        toast.error('Wybierz produkt i lokalizację');
        return;
      }

      const adjustmentData = {
        productId: selectedProduct.id,
        locationId: selectedLocation.id,
        adjustmentType: data.adjustmentType,
        quantity: parseInt(data.quantity, 10),
        reason: data.reason,
        notes: data.notes || undefined,
      };

      await dispatch(adjustStock(adjustmentData)).unwrap();
      toast.success('Stan zapasów został dostosowany');
      navigate('/inventory/stock');
    } catch (error) {
      toast.error(error || 'Nie udało się dostosować stanu zapasów');
    }
  };

  const getNewStockLevel = () => {
    if (!currentStock || !quantity) return null;
    const change = parseInt(quantity, 10) || 0;
    const current = currentStock.availableQuantity || 0;
    return adjustmentType === STOCK_ADJUSTMENT_TYPES.ADD ? current + change : current - change;
  };

  const adjustmentTypeOptions = Object.values(STOCK_ADJUSTMENT_TYPES).map((type) => ({
    value: type,
    label: STOCK_ADJUSTMENT_TYPE_LABELS[type],
  }));

  const productOptions = products.map((product) => ({
    id: product.id,
    label: `${product.brand?.name || ''} ${product.model || product.name || ''}`.trim(),
  }));

  const locationOptions = locations.map((location) => ({
    id: location.id,
    label: location.name,
  }));

  return (
    <Container maxWidth="lg">
      <PageHeader
        title="Dostosuj stan"
        subtitle="Dodaj lub usuń zapasy z magazynu"
        breadcrumbs={[
          { label: 'Pulpit', to: '/' },
          { label: 'Magazyn', to: '/inventory' },
          { label: 'Lista zapasów', to: '/inventory/stock' },
          { label: 'Dostosuj stan' },
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
            {/* Product Selector */}
            <Grid item xs={12}>
              <Controller
                name="productId"
                control={control}
                rules={{ required: 'Product is required' }}
                render={({ field, fieldState: { error } }) => (
                  <Autocomplete
                    {...field}
                    options={productOptions}
                    value={productOptions.find((opt) => opt.id === field.value) || null}
                    onChange={(_, newValue) => {
                      field.onChange(newValue?.id || '');
                      const product = products.find((p) => p.id === newValue?.id);
                      setSelectedProduct(product || null);
                    }}
                    getOptionLabel={(option) => option.label || ''}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        label="Produkt"
                        required
                        error={!!error}
                        helperText={error?.message}
                      />
                    )}
                  />
                )}
              />
            </Grid>

            {/* Location Selector */}
            <Grid item xs={12}>
              <Controller
                name="locationId"
                control={control}
                rules={{ required: 'Location is required' }}
                render={({ field, fieldState: { error } }) => (
                  <Autocomplete
                    {...field}
                    options={locationOptions}
                    value={locationOptions.find((opt) => opt.id === field.value) || null}
                    onChange={(_, newValue) => {
                      field.onChange(newValue?.id || '');
                      const location = locations.find((l) => l.id === newValue?.id);
                      setSelectedLocation(location || null);
                    }}
                    getOptionLabel={(option) => option.label || ''}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        label="Lokalizacja"
                        required
                        error={!!error}
                        helperText={error?.message}
                      />
                    )}
                  />
                )}
              />
            </Grid>

            {/* Current Stock Info */}
            {currentStock && (
              <Grid item xs={12}>
                <Alert severity="info">
                  <Typography variant="body2">
                    Obecny stan: <strong>{currentStock.availableQuantity}</strong> dostępne
                  </Typography>
                </Alert>
              </Grid>
            )}

            {/* Adjustment Type */}
            <Grid item xs={12} md={6}>
              <FormField
                name="adjustmentType"
                control={control}
                label="Typ dostosowania"
                type="select"
                options={adjustmentTypeOptions}
                required
              />
            </Grid>

            {/* Quantity */}
            <Grid item xs={12} md={6}>
              <FormField
                name="quantity"
                control={control}
                label="Ilość"
                type="number"
                required
                rules={{
                  min: { value: 1, message: 'Ilość musi wynosić co najmniej 1' },
                  validate: (value) => {
                    if (adjustmentType === STOCK_ADJUSTMENT_TYPES.REMOVE && currentStock) {
                      const quantity = parseInt(value, 10);
                      if (quantity > currentStock.availableQuantity) {
                        return `Nie można usunąć więcej niż ${currentStock.availableQuantity} artykułów`;
                      }
                    }
                    return true;
                  },
                }}
              />
            </Grid>

            {/* New Stock Level Preview */}
            {getNewStockLevel() !== null && (
              <Grid item xs={12}>
                <Alert
                  severity={
                    getNewStockLevel() < 0
                      ? 'error'
                      : getNewStockLevel() <= 10
                        ? 'warning'
                        : 'success'
                  }
                >
                  <Typography variant="body2">
                    Nowy stan zapasów: <strong>{getNewStockLevel()}</strong>
                  </Typography>
                </Alert>
              </Grid>
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
            <Button
              type="submit"
              variant="contained"
              disabled={getNewStockLevel() !== null && getNewStockLevel() < 0}
            >
              Dostosuj stan
            </Button>
          </Box>
        </form>
      </Paper>
    </Container>
  );
}

export default AdjustStockPage;
