import { useEffect, useState, useMemo, useCallback } from 'react';
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
  Tabs,
  Tab,
  InputBase,
  FormHelperText,
  CircularProgress,
} from '@mui/material';
import { ArrowLeft, Plus, Trash2, Minus } from 'lucide-react';
import { useForm, Controller } from 'react-hook-form';
import toast from 'react-hot-toast';
import PageHeader from '../../../shared/components/PageHeader';
import FormField from '../../../shared/components/FormField';
import { createTransfer } from '../transfersSlice';
import { fetchActiveLocations, selectActiveLocations } from '../../locations/locationsSlice';
import { useInventorySearch, formatProductDetails } from '../../../hooks/useInventorySearch';
import VirtualizedListbox from '../../../shared/components/VirtualizedListbox';
import { VALIDATION, PRODUCT_TYPES, PRODUCT_TYPE_LABELS } from '../../../constants';

function CreateTransferPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const locations = useSelector(selectActiveLocations);

  const [selectedFromLocation, setSelectedFromLocation] = useState(null);
  const [selectedToLocation, setSelectedToLocation] = useState(null);
  const [transferItems, setTransferItems] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [quantity, setQuantity] = useState('1');
  const [availableStock, setAvailableStock] = useState(null);
  const [productType, setProductType] = useState(PRODUCT_TYPES.FRAME);

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

  // Use server-side search hook with debounce
  const {
    searchQuery,
    setSearchQuery,
    results: inventoryItems,
    isLoading: isLoadingProducts,
    isDebouncing,
  } = useInventorySearch({
    locationId: selectedFromLocation?.id,
    productType: productType,
    debounceDelay: 300,
    pageSize: 50,
  });

  useEffect(() => {
    dispatch(fetchActiveLocations());
  }, [dispatch]);

  // --- Helpers do formatowania nazw ---

  const getLensTypeLabel = useCallback((type) => {
    switch (type) {
      case 'DAILY': return 'jednodniowe';
      case 'BI_WEEKLY': return 'dwutygodniowe';
      case 'MONTHLY': return 'miesięczne';
      default: return type || '';
    }
  }, []);

  /**
   * Generuje nazwę do wyświetlenia w tabeli (z prefiksem kategorii)
   */
  const getTableDisplayName = useCallback((product, type) => {
    const brand = product.brand?.name || '';
    const model = product.model || product.name || '';

    switch (type) {
      case PRODUCT_TYPES.FRAME:
      case PRODUCT_TYPES.SUNGLASSES:
        return `${brand} ${model}`;

      case PRODUCT_TYPES.CONTACT_LENS:
        return `${brand} ${model}`;

      case PRODUCT_TYPES.SOLUTION:
        return brand;

      case PRODUCT_TYPES.OTHER:
      default:
        return `${brand} ${model}`;
    }
  }, []);

  /**
   * Generuje pełną etykietę do wyszukiwania (Label w Autocomplete)
   */
  const getSearchLabel = useCallback((item) => {
    const brand = item.product.brand?.name || '';
    const product = item.product;
    const stock = ` (${item.availableQuantity || 0} szt.)`;

    switch (item.productType) {
      case PRODUCT_TYPES.FRAME:
      case PRODUCT_TYPES.SUNGLASSES:
        return `${brand} ${product.model || ''} - ${product.size || ''} - ${product.color || ''}`.trim() + stock;

      case PRODUCT_TYPES.CONTACT_LENS: {
        const lensType = getLensTypeLabel(product.lensType);
        return `${brand} ${product.model || ''} - ${lensType} - ${product.power || ''}`.trim() + stock;
      }

      case PRODUCT_TYPES.SOLUTION:
        return `${brand} - ${product.volume || product.capacity || ''} ml`.trim() + stock;

      case PRODUCT_TYPES.OTHER:
      default:
        return `${brand} ${product.model || product.name || ''}`.trim() + stock;
    }
  }, [getLensTypeLabel]);

  /**
   * Formatuje szczegóły produktu dla tabeli
   */
  const formatProductDetailsLocal = useCallback((product, pType) => {
    switch (pType) {
      case PRODUCT_TYPES.FRAME:
      case PRODUCT_TYPES.SUNGLASSES:
        return `Rozmiar: ${product.size || '-'}, Kolor: ${product.color || '-'}`;

      case PRODUCT_TYPES.CONTACT_LENS: {
        const lensType = getLensTypeLabel(product.lensType);
        return `Typ: ${lensType || '-'}, Moc: ${product.power || '-'}`;
      }

      case PRODUCT_TYPES.SOLUTION:
        return `Pojemność: ${product.volume || product.capacity || '-'} (ml)`;

      case PRODUCT_TYPES.OTHER:
      default:
        return product.notes || '-';
    }
  }, [getLensTypeLabel]);

  const handleAddItem = () => {
    if (!selectedProduct) {
      toast.error('Proszę wybrać produkt');
      return;
    }
    const qtyParsed = parseInt(quantity, 10);
    if (!quantity || qtyParsed <= 0) {
      toast.error('Proszę wpisać prawidłową ilość');
      return;
    }
    if (availableStock !== null && qtyParsed > availableStock) {
      toast.error(`Dostępne tylko ${availableStock} jednostek w lokalizacji źródłowej`);
      return;
    }

    const existingItem = transferItems.find((item) => item.product.id === selectedProduct.id);
    if (existingItem) {
      toast.error('Produkt już został dodany. Usuń go najpierw, aby zmienić ilość.');
      return;
    }

    const inventoryItem = inventoryItems.find(i => i.product.id === selectedProduct.id);
    const type = inventoryItem ? inventoryItem.productType : productType;

    setTransferItems([
      ...transferItems,
      {
        product: selectedProduct,
        quantity: qtyParsed,
        availableStock,
        productType: type,
      },
    ]);

    setSelectedProduct(null);
    setQuantity('1');
    setAvailableStock(null);
  };

  const handleRemoveItem = (productId) => {
    setTransferItems(transferItems.filter((item) => item.product.id !== productId));
  };

  const handleQuantityChange = (productId, newQuantity) => {
    const qty = parseInt(newQuantity, 10);
    if (newQuantity === '' || isNaN(qty)) return;

    if (qty > 0) {
      setTransferItems(
        transferItems.map((item) => {
          if (item.product.id === productId) {
            if (qty > item.availableStock) {
              toast.error(`Dostępne tylko ${item.availableStock} jednostek`);
              return { ...item, quantity: item.availableStock };
            }
            return { ...item, quantity: qty };
          }
          return item;
        })
      );
    }
  };

  const incrementMainQuantity = () => {
    const current = parseInt(quantity || '0', 10);
    if (availableStock !== null && current >= availableStock) return;
    setQuantity((current + 1).toString());
  };

  const decrementMainQuantity = () => {
    const current = parseInt(quantity || '0', 10);
    if (current > 1) {
      setQuantity((current - 1).toString());
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
      navigate('/transfers', { state: { refresh: true } });
    } catch (error) {
      toast.error(error || 'Nie udało się utworzyć transferu');
    }
  };

  // Mapowanie produktów do opcji (memoized for performance)
  const productOptions = useMemo(() => {
    return inventoryItems
      .filter((item) => item.product && (item.availableQuantity > 0 || item.quantity > 0))
      .map((item) => ({
        id: item.product.id,
        label: getSearchLabel(item),
        product: item.product,
        productType: item.productType,
        quantity: item.availableQuantity,
        brand: item.product.brand?.name
      }));
  }, [inventoryItems, getSearchLabel]);

  const handleProductTypeChange = (event, newType) => {
    setProductType(newType);
    setSelectedProduct(null);
    setQuantity('1');
    setAvailableStock(null);
    setSearchQuery('');
  };

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

      <Paper sx={{ p: 3, mx: 'auto' }}>
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
                              '& .MuiInputBase-root': { fontSize: '1rem', minHeight: '50px', p: '8px 12px' },
                              '& .MuiInputLabel-root': { fontSize: '1rem' },
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
                              '& .MuiInputBase-root': { fontSize: '1rem', minHeight: '50px', p: '8px 12px' },
                              '& .MuiInputLabel-root': { fontSize: '1rem' },
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

            {/* SECTION 2: Product Selector */}
            <Box>
              <Typography variant="h4" sx={{ fontWeight: 600, mb: 2 }}>
                Wybór produktów
              </Typography>

              <Box sx={{ mb: 3 }}>
                <Typography variant="subtitle1" sx={{ mb: 1, fontWeight: 500 }}>
                  Wybierz typ produktu
                </Typography>
                <Tabs
                  value={productType}
                  onChange={handleProductTypeChange}
                  sx={{ borderBottom: 1, borderColor: 'divider' }}
                >
                  <Tab label={PRODUCT_TYPE_LABELS[PRODUCT_TYPES.FRAME]} value={PRODUCT_TYPES.FRAME} />
                  <Tab label={PRODUCT_TYPE_LABELS[PRODUCT_TYPES.SUNGLASSES]} value={PRODUCT_TYPES.SUNGLASSES} />
                  <Tab label={PRODUCT_TYPE_LABELS[PRODUCT_TYPES.CONTACT_LENS]} value={PRODUCT_TYPES.CONTACT_LENS} />
                  <Tab label={PRODUCT_TYPE_LABELS[PRODUCT_TYPES.SOLUTION]} value={PRODUCT_TYPES.SOLUTION} />
                  <Tab label={PRODUCT_TYPE_LABELS[PRODUCT_TYPES.OTHER]} value={PRODUCT_TYPES.OTHER} />
                </Tabs>
              </Box>

              <Grid container spacing={2} alignItems="flex-start">
                <Grid item xs={12}>
                  <Autocomplete
                    options={productOptions}
                    value={
                      selectedProduct
                        ? productOptions.find((opt) => opt.id === selectedProduct.id)
                        : null
                    }
                    inputValue={searchQuery}
                    onInputChange={(_, newInputValue, reason) => {
                      if (reason === 'input') {
                        setSearchQuery(newInputValue);
                      } else if (reason === 'clear') {
                        setSearchQuery('');
                      }
                    }}
                    onChange={(_, newValue) => {
                      setSelectedProduct(newValue?.product || null);
                      setQuantity('1');
                      if (newValue) {
                        setSearchQuery(newValue.label);
                        setAvailableStock(newValue.quantity);
                      } else {
                        setAvailableStock(null);
                      }
                    }}
                    getOptionLabel={(option) => option.label || ''}
                    filterOptions={(x) => x}
                    loading={isLoadingProducts || isDebouncing}
                    disabled={!selectedFromLocation}
                    noOptionsText={
                      !selectedFromLocation
                        ? "Wybierz lokalizację źródłową"
                        : isLoadingProducts || isDebouncing
                          ? "Wyszukiwanie..."
                          : searchQuery.length > 0
                            ? "Brak wyników"
                            : "Wpisz nazwę produktu..."
                    }
                    ListboxComponent={VirtualizedListbox}
                    sx={{ width: '100%', minWidth: { md: '600px' } }}
                    slotProps={{
                      popper: {
                        placement: 'bottom-start',
                        modifiers: [
                          {
                            name: 'flip',
                            enabled: false,
                          },
                        ],
                      },
                    }}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        label="Wyszukaj produkt"
                        placeholder={!selectedFromLocation ? "Najpierw wybierz lokalizację źródłową..." : "Wpisz markę, model lub kolor..."}
                        fullWidth
                        slotProps={{
                          input: {
                            ...params.InputProps,
                            endAdornment: (
                              <>
                                {(isLoadingProducts || isDebouncing) ? (
                                  <CircularProgress color="inherit" size={20} />
                                ) : null}
                                {params.InputProps.endAdornment}
                              </>
                            ),
                          },
                        }}
                        sx={{
                          '& .MuiInputBase-root': { fontSize: '1rem', minHeight: '50px', p: '8px 12px' },
                          '& .MuiInputLabel-root': { fontSize: '1rem' },
                        }}
                      />
                    )}
                    renderOption={(props, option) => {
                      const { key, ...otherProps } = props;

                      return (
                        <li key={key} {...otherProps} style={{ display: 'block', padding: '12px 16px' }}>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
                            <Box sx={{ flex: 1 }}>
                              <Typography variant="body1" fontWeight="600" sx={{ fontSize: '1.1rem' }}>
                                {option.brand} {option.product.model || option.product.name || ''}
                              </Typography>

                              <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                                {formatProductDetailsLocal(option.product, option.productType)}
                              </Typography>
                            </Box>

                            <Typography variant="body2" sx={{
                              bgcolor: option.quantity > 0 ? 'success.lighter' : 'error.lighter',
                              color: option.quantity > 0 ? 'success.dark' : 'error.dark',
                              px: 2,
                              py: 0.75,
                              borderRadius: 1,
                              fontWeight: 600,
                              fontSize: '1rem',
                              ml: 2
                            }}>
                              {option.quantity} szt.
                            </Typography>
                          </Box>
                        </li>
                      );
                    }}
                  />
                </Grid>

                {/* --- SELEKTOR ILOŚCI (60% SZEROKOŚCI) --- */}
                <Grid item xs={4} md={2}>
                  <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                    <Box sx={{
                      display: 'flex',
                      alignItems: 'center',
                      border: '1px solid',
                      borderColor: 'rgba(0, 0, 0, 0.23)',
                      borderRadius: 1,
                      maxWidth: '150px',
                      height: '50px',
                      '&:hover': {
                        borderColor: 'text.primary'
                      }
                    }}>
                      <IconButton
                        onClick={decrementMainQuantity}
                        disabled={!selectedProduct || parseInt(quantity, 10) <= 1}
                        sx={{ height: '100%', borderRadius: 0 }}
                      >
                        <Minus size={20} />
                      </IconButton>

                      <InputBase
                        value={quantity}
                        onChange={(e) => {
                          const val = e.target.value;
                          if (val === '' || /^\d+$/.test(val)) {
                            setQuantity(val);
                          }
                        }}
                        fullWidth
                        disabled={!selectedProduct}
                        sx={{
                          '& input': { textAlign: 'center', fontSize: '1rem' }
                        }}
                      />

                      <IconButton
                        onClick={incrementMainQuantity}
                        disabled={!selectedProduct || (availableStock !== null && parseInt(quantity, 10) >= availableStock)}
                        sx={{ height: '100%', borderRadius: 0 }}
                      >
                        <Plus size={20} />
                      </IconButton>
                    </Box>
                    <FormHelperText sx={{ ml: 0.5, whiteSpace: 'nowrap' }}>
                      {availableStock !== null && selectedProduct
                        ? `Dostępne: ${availableStock}`
                        : ' '}
                    </FormHelperText>
                  </Box>
                </Grid>

                {/* --- PRZYCISK DODAJ --- */}
                <Grid item xs={4} md={2}>
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
              </Grid>

              {/* TABELA PRODUKTÓW (WYJĘTA Z GRID, ABY BYŁA PONIŻEJ) */}
              {transferItems.length > 0 && (
                <Box sx={{ mt: 4 }}>
                  <Typography variant="h6" sx={{ mb: 2 }}>
                    Produkty transferu ({transferItems.length})
                  </Typography>
                  <TableContainer>
                    <Table>
                      <TableHead>
                        <TableRow>
                          <TableCell sx={{ fontWeight: 600 }}>Produkt</TableCell>
                          <TableCell sx={{ fontWeight: 600 }}>Szczegóły</TableCell>
                          <TableCell align="right" sx={{ fontWeight: 600 }}>Dostępne</TableCell>
                          <TableCell align="center" sx={{ fontWeight: 600 }}>Ilość</TableCell>
                          <TableCell align="right" sx={{ fontWeight: 600 }}>Akcje</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {transferItems.map((item) => (
                          <TableRow key={item.product.id}>
                            <TableCell>
                              <Typography variant="body2" sx={{ fontWeight: 500 }}>
                                {getTableDisplayName(item.product, item.productType)}
                              </Typography>
                            </TableCell>
                            <TableCell>
                              <Typography variant="body2" color="text.secondary">
                                {formatProductDetails(item.product, item.productType)}
                              </Typography>
                            </TableCell>
                            <TableCell align="right">{item.availableStock}</TableCell>
                            <TableCell align="center">
                              <Box sx={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                border: '1px solid #e0e0e0',
                                borderRadius: 1,
                                width: 'fit-content',
                                mx: 'auto'
                              }}>
                                <IconButton
                                  size="small"
                                  onClick={() => handleQuantityChange(item.product.id, item.quantity - 1)}
                                  disabled={item.quantity <= 1}
                                >
                                  <Minus size={16} />
                                </IconButton>

                                <Box sx={{ width: 40, textAlign: 'center', fontSize: '0.9rem', fontWeight: 500 }}>
                                  {item.quantity}
                                </Box>

                                <IconButton
                                  size="small"
                                  onClick={() => handleQuantityChange(item.product.id, item.quantity + 1)}
                                  disabled={item.quantity >= item.availableStock}
                                >
                                  <Plus size={16} />
                                </IconButton>
                              </Box>
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
                          <TableCell align="center">
                            <strong>
                              {transferItems.reduce((sum, item) => sum + item.quantity, 0)}
                            </strong>
                          </TableCell>
                          <TableCell />
                        </TableRow>
                      </TableBody>
                    </Table>
                  </TableContainer>
                </Box>
              )}
            </Box>

            <Divider />

            {/* SECTION 3: Transfer Details */}
            <Box>
              <Typography variant="h4" sx={{ fontWeight: 600, mb: 2 }}>
                Szczegóły
              </Typography>
              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <Box sx={{ width: '200%' }}>
                    <FormField
                      name="reason"
                      control={control}
                      label="Powód transferu (opcjonalnie)"
                      type="text"
                      multiline
                      rows={4}
                      fullWidth
                      rules={{
                        maxLength: {
                          value: VALIDATION.DESCRIPTION_MAX_LENGTH,
                          message: `Powód nie może przekraczać ${VALIDATION.DESCRIPTION_MAX_LENGTH} znaków`,
                        },
                      }}
                      sx={{
                        '& .MuiInputBase-root': { fontSize: '1rem' },
                        '& .MuiInputLabel-root': { fontSize: '1rem' }
                      }}
                    />
                  </Box>
                </Grid>

                <Grid item xs={12}>
                  <Box sx={{ width: '200%', position: 'relative', left: '200px' }}>
                    <FormField
                      name="notes"
                      control={control}
                      label="Dodatkowe uwagi (opcjonalnie)"
                      type="text"
                      multiline
                      rows={4}
                      fullWidth
                      rules={{
                        maxLength: {
                          value: VALIDATION.NOTES_MAX_LENGTH,
                          message: `Notatki nie mogą przekraczać ${VALIDATION.NOTES_MAX_LENGTH} znaków`,
                        },
                      }}
                      sx={{
                        '& .MuiInputBase-root': { fontSize: '1rem' },
                        '& .MuiInputLabel-root': { fontSize: '1rem' }
                      }}
                    />
                  </Box>
                </Grid>
              </Grid>
            </Box>

            {/* SECTION 4: Actions */}
            <Box sx={{ display: 'flex', gap: 3, justifyContent: 'flex-end', pt: 2 }}>
              <Button
                variant="outlined"
                onClick={() => navigate('/transfers')}
                size="large"
                sx={{ px: 5, py: 1.5, fontSize: '1.1rem', fontWeight: 600 }}
              >
                Anuluj
              </Button>
              <Button
                type="submit"
                variant="contained"
                disabled={transferItems.length === 0 || !fromLocationId || !toLocationId}
                size="large"
                sx={{ px: 5, py: 1.5, fontSize: '1.1rem', fontWeight: 600 }}
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