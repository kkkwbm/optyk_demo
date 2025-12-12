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
} from '@mui/material';
import { ArrowLeft, Plus, Trash2, ShoppingCart } from 'lucide-react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import PageHeader from '../../../shared/components/PageHeader';
import FormField from '../../../shared/components/FormField';
import { createSale } from '../salesSlice';
import { selectCurrentLocation } from '../../locations/locationsSlice';
import { fetchInventory, selectInventoryItems, fetchInventoryByProductAndLocation } from '../../inventory/inventorySlice';
import {
  VALIDATION,
  LOCATION_TYPES,
  PRODUCT_TYPES,
  PRODUCT_TYPE_LABELS,
} from '../../../constants';

function CreateSalePage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const inventoryItems = useSelector(selectInventoryItems);
  const currentLocation = useSelector(selectCurrentLocation);

  const [cart, setCart] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [quantity, setQuantity] = useState('');
  const [price, setPrice] = useState('');
  const [availableStock, setAvailableStock] = useState(null);
  const [productType, setProductType] = useState(PRODUCT_TYPES.FRAME);

  const { control, handleSubmit } = useForm({
    defaultValues: {
      notes: '',
    },
  });

  // Check if current location is a warehouse
  const isWarehouseSelected = currentLocation && (currentLocation.type === LOCATION_TYPES.WAREHOUSE || currentLocation.type === 'WAREHOUSE');

  // Fetch inventory for the current location
  useEffect(() => {
    if (currentLocation && !isWarehouseSelected) {
      dispatch(fetchInventory({
        locationId: currentLocation.id,
        params: { page: 0, size: 1000 }
      }));
    }
  }, [dispatch, currentLocation, isWarehouseSelected]);

  // Clear cart and reset form when location changes
  useEffect(() => {
    setCart([]);
    setSelectedProduct(null);
    setQuantity('');
    setPrice('');
    setAvailableStock(null);
  }, [currentLocation]);

  // Update available stock when product is selected
  useEffect(() => {
    if (selectedProduct) {
      // Find the inventory item for the selected product
      const inventoryItem = inventoryItems.find(item => item.product?.id === selectedProduct.id);

      if (inventoryItem) {
        setAvailableStock(inventoryItem.availableQuantity || 0);
      } else {
        setAvailableStock(0);
      }

      // Set default price from product
      if (selectedProduct.sellingPrice) {
        setPrice(selectedProduct.sellingPrice.toString());
      }
    } else {
      setAvailableStock(null);
    }
  }, [selectedProduct, inventoryItems]);

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

  const handleRemoveFromCart = (productId) => {
    setCart(cart.filter((item) => item.product.id !== productId));
  };

  const handleQuantityChange = (productId, newQuantity) => {
    const qty = parseInt(newQuantity, 10);
    if (qty > 0) {
      setCart(
        cart.map((item) =>
          item.product.id === productId
            ? { ...item, quantity: qty, subtotal: qty * item.unitPrice }
            : item
        )
      );
    }
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
        items: cart.map((item) => ({
          productId: item.product.id,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
        })),
        totalAmount: calculateTotal(),
      };

      await dispatch(createSale(saleData)).unwrap();
      toast.success('Sprzedaż została utworzona');
      navigate('/sales');
    } catch (error) {
      toast.error(error || 'Nie udało się utworzyć sprzedaży');
    }
  };


  // Build product options from inventory items (only products with stock at current location)
  const productOptions = inventoryItems
    .filter(item => {
      // Debug: Log what we're filtering
      if (item.product) {
        console.log('Item productType:', item.productType, 'Selected productType:', productType, 'Match:', item.productType === productType);
      }
      return item.product && (item.availableQuantity > 0 || item.quantity > 0);
    })
    .filter((item) => item.productType === productType)
    .map((item) => ({
      id: item.product.id,
      label: `${item.product.brand?.name || ''} ${item.product.model || item.product.name || ''}`.trim() + ` (${item.availableQuantity || 0} szt.)`,
      product: item.product,
      availableQuantity: item.availableQuantity || 0,
    }));

  console.log('Total inventory items:', inventoryItems.length);
  console.log('Filtered product options:', productOptions.length);

  const handleProductTypeChange = (event, newType) => {
    setProductType(newType);
    setSelectedProduct(null);
    setQuantity('');
    setPrice('');
    setAvailableStock(null);
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
                >
                  <Tab label={PRODUCT_TYPE_LABELS[PRODUCT_TYPES.FRAME]} value={PRODUCT_TYPES.FRAME} />
                  <Tab label={PRODUCT_TYPE_LABELS[PRODUCT_TYPES.CONTACT_LENS]} value={PRODUCT_TYPES.CONTACT_LENS} />
                  <Tab label={PRODUCT_TYPE_LABELS[PRODUCT_TYPES.SOLUTION]} value={PRODUCT_TYPES.SOLUTION} />
                  <Tab label={PRODUCT_TYPE_LABELS[PRODUCT_TYPES.OTHER]} value={PRODUCT_TYPES.OTHER} />
                </Tabs>
              </Box>

              <Box>
                <Box sx={{ mb: 2 }}>
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
                      setPrice(newValue?.product?.sellingPrice?.toString() || '');
                    }}
                    getOptionLabel={(option) => option.label || ''}
                    fullWidth
                    disabled={!currentLocation || isWarehouseSelected}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        label="Wybierz produkt"
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
                  />
                </Box>

                <Grid container spacing={2}>
                  <Grid item xs={12} sm={4} md={3}>
                    <TextField
                      label="Ilość"
                      type="number"
                      value={quantity}
                      onChange={(e) => setQuantity(e.target.value)}
                      fullWidth
                      disabled={!currentLocation || isWarehouseSelected}
                      inputProps={{ min: 1 }}
                      helperText={
                        availableStock !== null ? `Dostępne: ${availableStock}` : undefined
                      }
                    />
                  </Grid>

                  <Grid item xs={12} sm={4} md={3}>
                    <TextField
                      label="Cena"
                      type="number"
                      value={price}
                      onChange={(e) => setPrice(e.target.value)}
                      fullWidth
                      disabled={!currentLocation || isWarehouseSelected}
                      inputProps={{ min: 0, step: 0.01 }}
                    />
                  </Grid>

                  <Grid item xs={12} sm={4} md={3}>
                    <Button
                      variant="contained"
                      startIcon={<Plus size={16} />}
                      onClick={handleAddToCart}
                      fullWidth
                      disabled={!currentLocation || isWarehouseSelected}
                      sx={{ height: '56px' }}
                    >
                      Dodaj
                    </Button>
                  </Grid>
                </Grid>
              </Box>

              {availableStock === 0 && selectedProduct && (
                <Alert severity="error" sx={{ mt: 2 }}>
                  Ten produkt jest niedostępny na wybranej lokalizacji
                </Alert>
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
                        <TableCell sx={{ fontWeight: 600 }}>Marka</TableCell>
                        <TableCell align="right" sx={{ fontWeight: 600 }}>Ilość</TableCell>
                        <TableCell align="right" sx={{ fontWeight: 600 }}>Cena</TableCell>
                        <TableCell align="right" sx={{ fontWeight: 600 }}>Suma</TableCell>
                        <TableCell align="right" sx={{ fontWeight: 600 }}>Akcje</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {cart.map((item) => (
                        <TableRow key={item.product.id}>
                          <TableCell>
                            {item.product.model || item.product.name || '-'}
                          </TableCell>
                          <TableCell>{item.product.brand?.name || '-'}</TableCell>
                          <TableCell align="right">
                            <TextField
                              type="number"
                              value={item.quantity}
                              onChange={(e) =>
                                handleQuantityChange(item.product.id, e.target.value)
                              }
                              size="small"
                              inputProps={{ min: 1 }}
                              sx={{ width: 80 }}
                            />
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
                      ))}
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
