import { useEffect, useState, useMemo, useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';
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
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Divider,
  Card,
  CardContent,
  Alert,
  Chip,
  Tabs,
  Tab,
  CircularProgress,
  MenuItem,
} from '@mui/material';
import { ArrowLeft, Plus, Minus, Trash2, ShoppingCart } from 'lucide-react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import PageHeader from '../../../shared/components/PageHeader';
import FormField from '../../../shared/components/FormField';
import { createSale } from '../salesSlice';
import { selectCurrentLocation } from '../../locations/locationsSlice';
import { useInventorySearch, formatProductDetails } from '../../../hooks/useInventorySearch';
import VirtualizedListbox from '../../../shared/components/VirtualizedListbox';
import {
  VALIDATION,
  LOCATION_TYPES,
  PRODUCT_TYPES,
  PRODUCT_TYPE_LABELS,
  EYEGLASS_LENS_TYPES,
  EYEGLASS_LENS_TYPE_LABELS,
} from '../../../constants';

function CreateSalePage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const currentLocation = useSelector(selectCurrentLocation);

  const [cart, setCart] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [quantity, setQuantity] = useState('');
  const [price, setPrice] = useState('');
  const [availableStock, setAvailableStock] = useState(null);
  const [productType, setProductType] = useState(PRODUCT_TYPES.FRAME);

  // State for eyeglass lens (custom product, not from inventory)
  const [eyeglassLensType, setEyeglassLensType] = useState('');
  const [eyeglassLensNotes, setEyeglassLensNotes] = useState('');
  const [eyeglassLensPrice, setEyeglassLensPrice] = useState('');

  const { control, handleSubmit } = useForm({
    defaultValues: {
      notes: '',
      customerFirstName: '',
      customerLastName: '',
    },
  });

  // Check if current location is a warehouse
  const isWarehouseSelected = currentLocation && (currentLocation.type === LOCATION_TYPES.WAREHOUSE || currentLocation.type === 'WAREHOUSE');

  // Use server-side search hook with debounce
  const {
    searchQuery,
    setSearchQuery,
    results: inventoryItems,
    isLoading: isLoadingProducts,
    isDebouncing,
  } = useInventorySearch({
    locationId: currentLocation?.id,
    productType: productType,
    debounceDelay: 300,
    pageSize: 50,
  });

  // Clear cart and reset form when location changes
  useEffect(() => {
    setCart([]);
    setSelectedProduct(null);
    setQuantity('');
    setPrice('');
    setAvailableStock(null);
  }, [currentLocation]);

  // Set default price when product is selected
  useEffect(() => {
    if (selectedProduct) {
      // Set default price from product
      if (selectedProduct.sellingPrice) {
        setPrice(selectedProduct.sellingPrice.toString());
      }
    } else {
      // Reset available stock when product is deselected
      setAvailableStock(null);
    }
  }, [selectedProduct]);

  const handleAddToCart = () => {
    if (!selectedProduct) {
      toast.error('Proszę wybrać produkt');
      return;
    }
    if (!quantity || parseInt(quantity, 10) <= 0) {
      toast.error('Proszę wpisać prawidłową ilość');
      return;
    }
    if (!price || parseFloat(price) <= 0) {
      toast.error('Proszę wpisać prawidłową cenę');
      return;
    }
    if (availableStock !== null && parseInt(quantity, 10) > availableStock) {
      toast.error(`Dostępne tylko ${availableStock} sztuk`);
      return;
    }

    const existingItem = cart.find((item) => item.product.id === selectedProduct.id);
    if (existingItem) {
      toast.error('Produkt jest już w koszyku. Usuń go najpierw, aby zmienić ilość.');
      return;
    }

    const newItem = {
      product: selectedProduct,
      productType: productType, // Store product type for cart display
      quantity: parseInt(quantity, 10),
      unitPrice: parseFloat(price),
      subtotal: parseInt(quantity, 10) * parseFloat(price),
    };

    setCart([...cart, newItem]);
    setSelectedProduct(null);
    setQuantity('');
    setPrice('');
    setAvailableStock(null);
  };

  // Handler for adding eyeglass lens (custom product, not from inventory)
  const handleAddEyeglassLens = () => {
    if (!eyeglassLensType) {
      toast.error('Proszę wybrać typ soczewki');
      return;
    }
    if (!eyeglassLensPrice || parseFloat(eyeglassLensPrice) <= 0) {
      toast.error('Proszę wpisać prawidłową cenę');
      return;
    }

    // Generate a unique ID for this custom product
    const customId = `eyeglass-lens-${Date.now()}`;

    const newItem = {
      product: {
        id: customId,
        isCustomProduct: true, // Flag to identify custom products
        lensType: eyeglassLensType,
        notes: eyeglassLensNotes,
      },
      productType: PRODUCT_TYPES.EYEGLASS_LENS,
      quantity: 1, // Always 1 for custom eyeglass lenses
      unitPrice: parseFloat(eyeglassLensPrice),
      subtotal: parseFloat(eyeglassLensPrice),
    };

    setCart([...cart, newItem]);
    setEyeglassLensType('');
    setEyeglassLensNotes('');
    setEyeglassLensPrice('');
  };

  const handleRemoveFromCart = (productId) => {
    setCart(cart.filter((item) => item.product.id !== productId));
  };

  const calculateTotal = () => {
    return cart.reduce((sum, item) => sum + item.subtotal, 0);
  };

  const onSubmit = async (data) => {
    try {
      if (!currentLocation || isWarehouseSelected) {
        toast.error('Proszę wybrać prawidłową lokalizację (nie magazyn)');
        return;
      }

      if (cart.length === 0) {
        toast.error('Proszę dodać co najmniej jeden produkt do koszyka');
        return;
      }

      const saleData = {
        locationId: currentLocation.id,
        notes: data.notes || undefined,
        customerFirstName: data.customerFirstName || undefined,
        customerLastName: data.customerLastName || undefined,
        items: cart.map((item) => {
          // Handle custom eyeglass lens items (not from inventory)
          if (item.product.isCustomProduct && item.productType === PRODUCT_TYPES.EYEGLASS_LENS) {
            return {
              isCustomEyeglassLens: true,
              eyeglassLensType: item.product.lensType,
              eyeglassLensNotes: item.product.notes || null,
              quantity: item.quantity,
              unitPrice: item.unitPrice,
            };
          }
          // Regular products from inventory
          return {
            productId: item.product.id,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
          };
        }),
      };

      const result = await dispatch(createSale(saleData)).unwrap();
      toast.success('Sprzedaż została utworzona');
      navigate(`/sales/${result.id}`);
    } catch (error) {
      toast.error(error || 'Nie udało się utworzyć sprzedaży');
    }
  };


  // Helper function to build product name without stock info (for display in input field)
  const buildProductName = useCallback((product, type) => {
    const brand = product.brand?.name || '';

    switch (type) {
      case PRODUCT_TYPES.FRAME:
        return `${brand} ${product.model || ''} - ${product.size || ''} - ${product.color || ''}`.trim();

      case PRODUCT_TYPES.CONTACT_LENS: {
        const lensTypeLabels = {
          DAILY: 'Jednodniowe',
          BI_WEEKLY: 'Dwutygodniowe',
          MONTHLY: 'Miesięczne',
        };
        const lensType = lensTypeLabels[product.lensType] || product.lensType || '';
        return `${brand} ${product.model || ''} - ${lensType} - ${product.power || ''}`.trim();
      }

      case PRODUCT_TYPES.EYEGLASS_LENS: {
        const lensType = EYEGLASS_LENS_TYPE_LABELS[product.lensType] || product.lensType || '';
        return `${brand} ${product.model || ''} - ${lensType}`.trim();
      }

      case PRODUCT_TYPES.SOLUTION:
        return `${brand} - ${product.volume || ''} ml`.trim();

      case PRODUCT_TYPES.OTHER:
      default:
        return `${brand} ${product.model || product.name || ''}`.trim();
    }
  }, []);

  // Helper function to build product label with stock info (for dropdown options)
  const buildProductLabel = useCallback((item) => {
    const name = buildProductName(item.product, item.productType);
    const stock = ` (${item.availableQuantity || 0} szt.)`;
    return name + stock;
  }, [buildProductName]);

  // Build product options from inventory items (memoized for performance)
  // Only show products with availableQuantity > 0 (products that can actually be sold)
  const productOptions = useMemo(() => {
    return inventoryItems
      .filter(item => item.product && item.availableQuantity > 0)
      .map((item) => {
        const displayName = buildProductName(item.product, item.productType);
        return {
          id: item.product.id,
          label: buildProductLabel(item),
          displayName: displayName,
          product: item.product,
          productType: item.productType,
          availableQuantity: item.availableQuantity,
          brand: item.product.brand?.name || '',
        };
      });
  }, [inventoryItems, buildProductLabel, buildProductName]);

  const handleProductTypeChange = (event, newType) => {
    setProductType(newType);
    setSelectedProduct(null);
    setQuantity('');
    setPrice('');
    setAvailableStock(null);
    setSearchQuery('');
    // Reset eyeglass lens state
    setEyeglassLensType('');
    setEyeglassLensNotes('');
    setEyeglassLensPrice('');
  };

  // Helper function to get lens type label
  const getLensTypeLabel = (type) => {
    switch (type) {
      case 'DAILY': return 'Jednodniowe';
      case 'BI_WEEKLY': return 'Dwutygodniowe';
      case 'MONTHLY': return 'Miesięczne';
      default: return type || '';
    }
  };

  // Helper function to format product details (similar to transfer page)
  const formatProductDetails = (product, productType) => {
    switch (productType) {
      case PRODUCT_TYPES.FRAME:
      case PRODUCT_TYPES.SUNGLASSES:
        return `Rozmiar: ${product.size || '-'}, Kolor: ${product.color || '-'}`;

      case PRODUCT_TYPES.CONTACT_LENS:
        const lensType = getLensTypeLabel(product.lensType);
        return `Typ: ${lensType || '-'}, Moc: ${product.power || '-'}`;

      case PRODUCT_TYPES.SOLUTION:
        return `Pojemność: ${product.volume || product.capacity || '-'} (ml)`;

      case PRODUCT_TYPES.OTHER:
      default:
        return product.notes || '-';
    }
  };

  // Helper function to format product display in cart
  const formatProductForCart = (product, productType) => {
    // Handle custom eyeglass lens products (not from inventory)
    if (product.isCustomProduct && productType === PRODUCT_TYPES.EYEGLASS_LENS) {
      const lensTypeLabel = EYEGLASS_LENS_TYPE_LABELS[product.lensType] || product.lensType || '';
      return {
        main: `Soczewka okularowa - ${lensTypeLabel}`,
        details: product.notes || 'Brak notatki',
      };
    }

    const brand = product.brand?.name || '';
    const model = product.model || product.name || '';

    switch (productType) {
      case PRODUCT_TYPES.FRAME:
      case PRODUCT_TYPES.SUNGLASSES:
        return {
          main: `${brand} ${model}`,
          details: `Rozmiar: ${product.size || '-'}, Kolor: ${product.color || '-'}`,
        };

      case PRODUCT_TYPES.CONTACT_LENS:
        const lensType = getLensTypeLabel(product.lensType);
        return {
          main: `${brand} ${model}`,
          details: `Typ: ${lensType}, Moc: ${product.power || '-'}`,
        };

      case PRODUCT_TYPES.SOLUTION:
        return {
          main: brand,
          details: `Pojemność: ${product.volume || '-'}`,
        };

      case PRODUCT_TYPES.OTHER:
      default:
        return {
          main: `${brand} ${model}`,
          details: product.notes || '-',
        };
    }
  };

  return (
    <Container maxWidth="xl">
      <PageHeader
        title="Nowa sprzedaż"
        subtitle="Utwórz nową transakcję sprzedaży"
        breadcrumbs={[
          { label: 'Panel', to: '/' },
          { label: 'Sprzedaż', to: '/sales' },
          { label: 'Nowa sprzedaż' },
        ]}
        actions={[
          {
            label: 'Wróć',
            icon: <ArrowLeft size={20} />,
            onClick: () => navigate('/sales'),
            variant: 'outlined',
          },
        ]}
      />

      {isWarehouseSelected && (
        <Alert severity="warning" sx={{ mb: 3 }}>
          <Typography variant="body1" sx={{ fontWeight: 600 }}>
            Magazyn nie obsługuje sprzedaży
          </Typography>
          <Typography variant="body2">
            Wybierz salon z listy lokalizacji po lewej stronie, aby utworzyć sprzedaż.
          </Typography>
        </Alert>
      )}

      <form onSubmit={handleSubmit(onSubmit)}>
        <Grid container spacing={3}>
          {/* Lewa kolumna - Wybór produktu */}
          <Grid item xs={12} lg={8}>
            <Paper sx={{ p: 4, mb: 3 }}>
              <Typography variant="h5" sx={{ mb: 3, fontWeight: 600 }}>
                Informacje sprzedaży
              </Typography>

              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Typography variant="body1" color="text.secondary" sx={{ fontWeight: 500 }}>
                  Lokalizacja:
                </Typography>
                <Chip
                  label={currentLocation?.name || 'Brak lokalizacji'}
                  color={currentLocation && !isWarehouseSelected ? 'primary' : 'default'}
                  size="medium"
                  sx={{ fontSize: '1rem', fontWeight: 600, py: 2.5 }}
                />
              </Box>
            </Paper>

            <Paper sx={{ p: 4, mb: 3 }}>
              <Typography variant="h5" sx={{ mb: 3, fontWeight: 600, display: 'flex', alignItems: 'center' }}>
                <ShoppingCart size={24} style={{ marginRight: 8 }} />
                Dodaj produkty
              </Typography>

              {(!currentLocation || isWarehouseSelected) && (
                <Alert severity="info" sx={{ mb: 3 }}>
                  Proszę wybrać prawidłową lokalizację (nie magazyn) z selektora po lewej stronie, aby dodać produkty do sprzedaży.
                </Alert>
              )}


              {/* Product Type Selector */}
              <Box sx={{ mb: 3 }}>
                <Typography variant="subtitle1" sx={{ mb: 1, fontWeight: 500 }}>
                  Wybierz typ produktu
                </Typography>
                <Tabs
                  value={productType}
                  onChange={handleProductTypeChange}
                  sx={{ borderBottom: 1, borderColor: 'divider' }}
                  variant="scrollable"
                  scrollButtons="auto"
                >
                  <Tab label={PRODUCT_TYPE_LABELS[PRODUCT_TYPES.FRAME]} value={PRODUCT_TYPES.FRAME} />
                  <Tab label={PRODUCT_TYPE_LABELS[PRODUCT_TYPES.SUNGLASSES]} value={PRODUCT_TYPES.SUNGLASSES} />
                  <Tab label={PRODUCT_TYPE_LABELS[PRODUCT_TYPES.CONTACT_LENS]} value={PRODUCT_TYPES.CONTACT_LENS} />
                  <Tab label={PRODUCT_TYPE_LABELS[PRODUCT_TYPES.EYEGLASS_LENS]} value={PRODUCT_TYPES.EYEGLASS_LENS} />
                  <Tab label={PRODUCT_TYPE_LABELS[PRODUCT_TYPES.SOLUTION]} value={PRODUCT_TYPES.SOLUTION} />
                  <Tab label={PRODUCT_TYPE_LABELS[PRODUCT_TYPES.OTHER]} value={PRODUCT_TYPES.OTHER} />
                </Tabs>
              </Box>

              {/* Form for regular products (from inventory) */}
              {productType !== PRODUCT_TYPES.EYEGLASS_LENS && (
              <Box>
                <Box sx={{ mb: 2 }}>
                  <Autocomplete
                    options={productOptions}
                    value={
                      selectedProduct
                        ? (productOptions.find((opt) => opt.id === selectedProduct.id) ?? null)
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
                      setPrice(newValue?.product?.sellingPrice?.toString() || '');
                      // Store availableQuantity directly from the selected option
                      // to avoid race condition with inventory refresh
                      setAvailableStock(newValue?.availableQuantity ?? null);
                      // Set display name (without stock count) to keep it visible in input
                      if (newValue?.displayName) {
                        setSearchQuery(newValue.displayName);
                      }
                    }}
                    getOptionLabel={(option) => option.label || ''}
                    filterOptions={(x) => x}
                    loading={isLoadingProducts || isDebouncing}
                    fullWidth
                    disabled={!currentLocation || isWarehouseSelected}
                    noOptionsText={
                      isLoadingProducts || isDebouncing
                        ? 'Wyszukiwanie...'
                        : searchQuery.length > 0
                          ? 'Brak wyników'
                          : 'Wpisz nazwę produktu...'
                    }
                    ListboxComponent={VirtualizedListbox}
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
                        placeholder="Wpisz markę, model lub kolor..."
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
                          '& .MuiInputBase-root': {
                            fontSize: '1rem',
                          },
                          '& .MuiInputLabel-root': {
                            fontSize: '1rem',
                          },
                        }}
                      />
                    )}
                    renderOption={(props, option) => {
                      const { key, ...otherProps } = props;

                      return (
                        <li key={key} {...otherProps} style={{ display: 'block', padding: '12px 16px' }}>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
                            <Box sx={{ flex: 1 }}>
                              {/* MARKA I MODEL */}
                              <Typography variant="body1" fontWeight="600" sx={{ fontSize: '1.1rem' }}>
                                {option.brand} {option.product.model || option.product.name || ''}
                              </Typography>

                              {/* SZCZEGÓŁY (KOLOR, ROZMIAR, ITP.) */}
                              <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                                {formatProductDetails(option.product, option.productType)}
                              </Typography>
                            </Box>

                            <Typography variant="body2" sx={{
                              bgcolor: option.availableQuantity > 0 ? 'success.lighter' : 'error.lighter',
                              color: option.availableQuantity > 0 ? 'success.dark' : 'error.dark',
                              px: 2,
                              py: 0.75,
                              borderRadius: 1,
                              fontWeight: 600,
                              fontSize: '1rem',
                              ml: 2
                            }}>
                              {option.availableQuantity} szt.
                            </Typography>
                          </Box>
                        </li>
                      );
                    }}
                  />
                </Box>

                <Grid container spacing={2} alignItems="flex-end">
                  <Grid item xs="auto">
                    <Box>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                        Ilość {availableStock !== null && <Typography component="span" variant="caption" color="text.secondary">(max: {availableStock})</Typography>}
                      </Typography>
                      <Box
                        sx={{
                          display: 'flex',
                          alignItems: 'center',
                          border: '1px solid',
                          borderColor: 'divider',
                          borderRadius: 1,
                          height: 40,
                          width: 120,
                        }}
                      >
                        <IconButton
                          onClick={() => {
                            const current = parseInt(quantity, 10) || 0;
                            if (current > 1) setQuantity((current - 1).toString());
                          }}
                          disabled={!currentLocation || isWarehouseSelected || isLoadingProducts || !quantity || parseInt(quantity, 10) <= 1}
                          sx={{ borderRadius: 0, height: '100%', px: 1.5 }}
                        >
                          <Minus size={18} />
                        </IconButton>
                        <TextField
                          type="number"
                          value={quantity}
                          onChange={(e) => setQuantity(e.target.value)}
                          disabled={!currentLocation || isWarehouseSelected || isLoadingProducts}
                          size="small"
                          inputProps={{
                            min: 1,
                            style: { textAlign: 'center', padding: '4px 0' },
                          }}
                          sx={{
                            flex: 1,
                            minWidth: 40,
                            '& .MuiOutlinedInput-notchedOutline': { border: 'none' },
                            '& input::-webkit-outer-spin-button, & input::-webkit-inner-spin-button': {
                              display: 'none',
                            },
                            '& input[type=number]': {
                              MozAppearance: 'textfield',
                            },
                          }}
                        />
                        <IconButton
                          onClick={() => {
                            const current = parseInt(quantity, 10) || 0;
                            const max = availableStock ?? Infinity;
                            if (current < max) setQuantity((current + 1).toString());
                          }}
                          disabled={!currentLocation || isWarehouseSelected || isLoadingProducts || (availableStock !== null && parseInt(quantity, 10) >= availableStock)}
                          sx={{ borderRadius: 0, height: '100%', px: 1.5 }}
                        >
                          <Plus size={18} />
                        </IconButton>
                      </Box>
                    </Box>
                  </Grid>

                  <Grid item xs="auto">
                    <Box>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                        Cena (zł)
                      </Typography>
                      <Box
                        sx={{
                          display: 'flex',
                          alignItems: 'center',
                          border: '1px solid',
                          borderColor: 'divider',
                          borderRadius: 1,
                          height: 40,
                          width: 220,
                        }}
                      >
                        <IconButton
                          onClick={() => {
                            const current = parseFloat(price) || 0;
                            if (current > 1) setPrice((current - 1).toFixed(2));
                          }}
                          disabled={!currentLocation || isWarehouseSelected || isLoadingProducts || !price || parseFloat(price) <= 0}
                          sx={{ borderRadius: 0, height: '100%', px: 1.5 }}
                        >
                          <Minus size={18} />
                        </IconButton>
                        <TextField
                          type="number"
                          value={price}
                          onChange={(e) => setPrice(e.target.value)}
                          disabled={!currentLocation || isWarehouseSelected || isLoadingProducts}
                          size="small"
                          inputProps={{
                            min: 0,
                            step: 0.01,
                            style: { textAlign: 'center', padding: '4px 0' },
                          }}
                          sx={{
                            flex: 1,
                            minWidth: 50,
                            '& .MuiOutlinedInput-notchedOutline': { border: 'none' },
                            '& input::-webkit-outer-spin-button, & input::-webkit-inner-spin-button': {
                              display: 'none',
                            },
                            '& input[type=number]': {
                              MozAppearance: 'textfield',
                            },
                          }}
                        />
                        <IconButton
                          onClick={() => {
                            const current = parseFloat(price) || 0;
                            setPrice((current + 1).toFixed(2));
                          }}
                          disabled={!currentLocation || isWarehouseSelected || isLoadingProducts}
                          sx={{ borderRadius: 0, height: '100%', px: 1.5 }}
                        >
                          <Plus size={18} />
                        </IconButton>
                      </Box>
                    </Box>
                  </Grid>

                  <Grid item xs="auto">
                    <Button
                      variant="contained"
                      startIcon={<Plus size={16} />}
                      onClick={handleAddToCart}
                      disabled={!currentLocation || isWarehouseSelected || isLoadingProducts}
                      sx={{ height: 40 }}
                    >
                      Dodaj
                    </Button>
                  </Grid>
                </Grid>

                {availableStock === 0 && selectedProduct && (
                  <Alert severity="error" sx={{ mt: 2 }}>
                    Ten produkt jest niedostępny na wybranej lokalizacji
                  </Alert>
                )}
              </Box>
              )}

              {/* Form for eyeglass lenses (custom product, not from inventory) */}
              {productType === PRODUCT_TYPES.EYEGLASS_LENS && (
              <Box>
                <Grid container spacing={2} alignItems="flex-end">
                  <Grid item xs="auto">
                    <TextField
                      select
                      label="Typ soczewki"
                      value={eyeglassLensType}
                      onChange={(e) => setEyeglassLensType(e.target.value)}
                      disabled={!currentLocation || isWarehouseSelected}
                      sx={{ minWidth: 280 }}
                    >
                      {Object.entries(EYEGLASS_LENS_TYPES).map(([key, value]) => (
                        <MenuItem key={key} value={value}>
                          {EYEGLASS_LENS_TYPE_LABELS[value]}
                        </MenuItem>
                      ))}
                    </TextField>
                  </Grid>

                  <Grid item xs="auto">
                    <Box>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                        Cena (zł)
                      </Typography>
                      <Box
                        sx={{
                          display: 'flex',
                          alignItems: 'center',
                          border: '1px solid',
                          borderColor: 'divider',
                          borderRadius: 1,
                          height: 56,
                          width: 200,
                        }}
                      >
                        <IconButton
                          onClick={() => {
                            const current = parseFloat(eyeglassLensPrice) || 0;
                            if (current > 1) setEyeglassLensPrice((current - 1).toFixed(2));
                          }}
                          disabled={!currentLocation || isWarehouseSelected || !eyeglassLensPrice || parseFloat(eyeglassLensPrice) <= 0}
                          sx={{ borderRadius: 0, height: '100%', px: 1.5 }}
                        >
                          <Minus size={18} />
                        </IconButton>
                        <TextField
                          type="number"
                          value={eyeglassLensPrice}
                          onChange={(e) => setEyeglassLensPrice(e.target.value)}
                          disabled={!currentLocation || isWarehouseSelected}
                          size="small"
                          inputProps={{
                            min: 0,
                            step: 0.01,
                            style: { textAlign: 'center', padding: '4px 0' },
                          }}
                          sx={{
                            flex: 1,
                            minWidth: 50,
                            '& .MuiOutlinedInput-notchedOutline': { border: 'none' },
                            '& input::-webkit-outer-spin-button, & input::-webkit-inner-spin-button': {
                              display: 'none',
                            },
                            '& input[type=number]': {
                              MozAppearance: 'textfield',
                            },
                          }}
                        />
                        <IconButton
                          onClick={() => {
                            const current = parseFloat(eyeglassLensPrice) || 0;
                            setEyeglassLensPrice((current + 1).toFixed(2));
                          }}
                          disabled={!currentLocation || isWarehouseSelected}
                          sx={{ borderRadius: 0, height: '100%', px: 1.5 }}
                        >
                          <Plus size={18} />
                        </IconButton>
                      </Box>
                    </Box>
                  </Grid>

                  <Grid item xs="auto">
                    <Button
                      variant="contained"
                      startIcon={<Plus size={16} />}
                      onClick={handleAddEyeglassLens}
                      disabled={!currentLocation || isWarehouseSelected}
                      sx={{ height: 56 }}
                    >
                      Dodaj
                    </Button>
                  </Grid>
                </Grid>

                <Box sx={{ mt: 2 }}>
                  <TextField
                    label="Notatka (opcjonalnie)"
                    value={eyeglassLensNotes}
                    onChange={(e) => setEyeglassLensNotes(e.target.value)}
                    fullWidth
                    multiline
                    rows={2}
                    disabled={!currentLocation || isWarehouseSelected}
                    placeholder="np. parametry soczewki, indeks, powłoki..."
                  />
                </Box>
              </Box>
              )}
            </Paper>

            {/* Tabela koszyka */}
            <Paper sx={{ p: 4 }}>
              <Typography variant="h5" sx={{ mb: 3, fontWeight: 600 }}>
                Koszyk ({cart.length} produktów)
              </Typography>

              {cart.length === 0 ? (
                <Box sx={{ textAlign: 'center', py: 4 }}>
                  <Typography variant="body1" color="text.secondary">
                    Brak produktów w koszyku. Dodaj produkty powyżej.
                  </Typography>
                </Box>
              ) : (
                <TableContainer>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell sx={{ fontWeight: 600 }}>Produkt</TableCell>
                        <TableCell sx={{ fontWeight: 600 }}>Szczegóły</TableCell>
                        <TableCell align="right" sx={{ fontWeight: 600 }}>Ilość</TableCell>
                        <TableCell align="right" sx={{ fontWeight: 600 }}>Cena</TableCell>
                        <TableCell align="right" sx={{ fontWeight: 600 }}>Suma</TableCell>
                        <TableCell align="right" sx={{ fontWeight: 600 }}>Akcje</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {cart.map((item) => {
                        const formattedProduct = formatProductForCart(item.product, item.productType);
                        return (
                          <TableRow key={item.product.id}>
                            <TableCell>
                              <Typography variant="body2" sx={{ fontWeight: 500 }}>
                                {formattedProduct.main}
                              </Typography>
                            </TableCell>
                            <TableCell>
                              <Typography variant="body2" color="text.secondary">
                                {formattedProduct.details}
                              </Typography>
                            </TableCell>
                            <TableCell align="right">
                              <Typography sx={{ fontWeight: 500 }}>
                                {item.quantity}
                              </Typography>
                            </TableCell>
                            <TableCell align="right">{item.unitPrice.toFixed(2)} zł</TableCell>
                            <TableCell align="right">
                              <strong>{item.subtotal.toFixed(2)} zł</strong>
                            </TableCell>
                            <TableCell align="right">
                              <IconButton
                                size="small"
                                color="error"
                                onClick={() => handleRemoveFromCart(item.product.id)}
                              >
                                <Trash2 size={16} />
                              </IconButton>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </TableContainer>
              )}
            </Paper>
          </Grid>

          {/* Prawa kolumna - Podsumowanie */}
          <Grid item xs={12} lg={4}>
            <Card sx={{ position: 'sticky', top: 16 }}>
              <CardContent sx={{ p: 4 }}>
                <Typography variant="h5" sx={{ mb: 4, fontWeight: 600 }}>
                  Podsumowanie sprzedaży
                </Typography>

                <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 2 }}>
                  Dane klienta (opcjonalne)
                </Typography>

                <Grid container spacing={2} sx={{ mb: 3 }}>
                  <Grid item xs={12} sm={6}>
                    <FormField
                      name="customerFirstName"
                      control={control}
                      label="Imię klienta"
                      type="text"
                      rules={{
                        maxLength: {
                          value: 100,
                          message: 'Imię nie może przekroczyć 100 znaków',
                        },
                      }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <FormField
                      name="customerLastName"
                      control={control}
                      label="Nazwisko klienta"
                      type="text"
                      rules={{
                        maxLength: {
                          value: 100,
                          message: 'Nazwisko nie może przekroczyć 100 znaków',
                        },
                      }}
                    />
                  </Grid>
                </Grid>

                <Box sx={{ mb: 4 }}>
                  <FormField
                    name="notes"
                    control={control}
                    label="Notatki (Opcjonalne)"
                    type="text"
                    multiline
                    rows={4}
                    rules={{
                      maxLength: {
                        value: VALIDATION.NOTES_MAX_LENGTH,
                        message: `Notatki nie mogą przekroczyć ${VALIDATION.NOTES_MAX_LENGTH} znaków`,
                      },
                    }}
                  />
                </Box>

                <Divider sx={{ my: 3 }} />

                <Box sx={{ mb: 3 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                    <Typography variant="body1" color="text.secondary">
                      Produkty:
                    </Typography>
                    <Typography variant="body1" sx={{ fontWeight: 500 }}>
                      {cart.length}
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                    <Typography variant="body1" color="text.secondary">
                      Łączna ilość:
                    </Typography>
                    <Typography variant="body1" sx={{ fontWeight: 500 }}>
                      {cart.reduce((sum, item) => sum + item.quantity, 0)}
                    </Typography>
                  </Box>
                </Box>

                <Divider sx={{ my: 3 }} />

                <Box sx={{ mb: 4 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="h5" sx={{ fontWeight: 600 }}>
                      Suma:
                    </Typography>
                    <Typography variant="h4" color="primary" sx={{ fontWeight: 700 }}>
                      {calculateTotal().toFixed(2)} zł
                    </Typography>
                  </Box>
                </Box>

                <Button
                  type="submit"
                  variant="contained"
                  fullWidth
                  size="large"
                  disabled={cart.length === 0 || !currentLocation || isWarehouseSelected}
                  sx={{
                    py: 1.5,
                    fontSize: '1.1rem',
                    fontWeight: 600,
                  }}
                >
                  Zakończ sprzedaż
                </Button>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </form>
    </Container>
  );
}

export default CreateSalePage;
