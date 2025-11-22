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
} from '@mui/material';
import { ArrowLeft, Plus, Trash2, ArrowRight } from 'lucide-react';
import { useForm, Controller } from 'react-hook-form';
import toast from 'react-hot-toast';
import PageHeader from '../../../shared/components/PageHeader';
import FormField from '../../../shared/components/FormField';
import { createTransfer } from '../transfersSlice';
import { fetchProducts, selectProducts } from '../../products/productsSlice';
import { fetchActiveLocations, selectActiveLocations } from '../../locations/locationsSlice';
import { fetchInventoryByProductAndLocation } from '../../inventory/inventorySlice';
import { VALIDATION } from '../../../constants';

function CreateTransferPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const products = useSelector(selectProducts);
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

  useEffect(() => {
    dispatch(fetchProducts({ page: 0, size: 1000 }));
    dispatch(fetchActiveLocations());
  }, [dispatch]);

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
        } else {
          setAvailableStock(0);
        }
      });
    } else {
      setAvailableStock(null);
    }
  }, [dispatch, selectedProduct, selectedFromLocation]);

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

  const productOptions = products.map((product) => ({
    id: product.id,
    label: `${product.brand?.name || ''} ${product.model || product.name || ''}`.trim(),
    product: product,
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

      <Paper sx={{ p: 3 }}>
        <form onSubmit={handleSubmit(onSubmit)}>
          <Grid container spacing={3}>
            {/* Wybór lokalizacji */}
            <Grid item xs={12}>
              <Typography variant="h6" sx={{ mb: 2 }}>
                Trasa transferu
              </Typography>
            </Grid>

            <Grid item xs={12} md={5}>
              <Controller
                name="fromLocationId"
                control={control}
                rules={{ required: 'Lokalizacja źródłowa jest wymagana' }}
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
                        label="Lokalizacja źródłowa"
                        required
                        error={!!error}
                        helperText={error?.message}
                      />
                    )}
                  />
                )}
              />
            </Grid>

            <Grid item xs={12} md={2} sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <ArrowRight size={32} />
            </Grid>

            <Grid item xs={12} md={5}>
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
                        label="Lokalizacja docelowa"
                        required
                        error={!!error}
                        helperText={error?.message || (!selectedFromLocation ? 'Najpierw wybierz lokalizację źródłową' : '')}
                      />
                    )}
                  />
                )}
              />
            </Grid>

            {/* Sekcja dodawania produktów */}
            {selectedFromLocation && selectedToLocation && (
              <>
                <Grid item xs={12}>
                  <Typography variant="h6" sx={{ mb: 2, mt: 2 }}>
                    Dodaj produkty do transferu
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
                      setSelectedProduct(newValue?.product || null);
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
                      availableStock !== null
                        ? `Dostępne w ${selectedFromLocation.name}: ${availableStock}`
                        : undefined
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

                {availableStock === 0 && selectedProduct && (
                  <Grid item xs={12}>
                    <Alert severity="error">
                      Ten produkt jest niedostępny w {selectedFromLocation.name}
                    </Alert>
                  </Grid>
                )}

                {/* Tabela produktów transferu */}
                {transferItems.length > 0 && (
                  <Grid item xs={12}>
                    <Typography variant="h6" sx={{ mb: 2, mt: 2 }}>
                      Produkty transferu ({transferItems.length})
                    </Typography>
                    <TableContainer>
                      <Table>
                        <TableHead>
                          <TableRow>
                            <TableCell>Produkt</TableCell>
                            <TableCell>Marka</TableCell>
                            <TableCell align="right">Dostępne</TableCell>
                            <TableCell align="right">Ilość</TableCell>
                            <TableCell align="right">Akcje</TableCell>
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
              </>
            )}

            {/* Powód i uwagi */}
            <Grid item xs={12}>
              <Typography variant="h6" sx={{ mb: 2, mt: 2 }}>
                Szczegóły transferu
              </Typography>
            </Grid>

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

            <Grid item xs={12}>
              <FormField
                name="notes"
                control={control}
                label="Notatki (opcjonalnie)"
                type="text"
                multiline
                rows={3}
                rules={{
                  maxLength: {
                    value: VALIDATION.NOTES_MAX_LENGTH,
                    message: `Notatki nie mogą przekraczać ${VALIDATION.NOTES_MAX_LENGTH} znaków`,
                  },
                }}
              />
            </Grid>
          </Grid>

          {/* Akcje formularza */}
          <Box sx={{ mt: 3, display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
            <Button variant="outlined" onClick={() => navigate('/transfers')}>
              Anuluj
            </Button>
            <Button
              type="submit"
              variant="contained"
              disabled={
                transferItems.length === 0 || !selectedFromLocation || !selectedToLocation
              }
            >
              Utwórz transfer
            </Button>
          </Box>
        </form>
      </Paper>
    </Container>
  );
}

export default CreateTransferPage;
