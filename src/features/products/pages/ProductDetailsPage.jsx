import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import {
  Container,
  Paper,
  Box,
  Button,
  Typography,
  Grid,
  Divider,
  CircularProgress,
} from '@mui/material';
import { ArrowLeft, Edit, Trash2, RefreshCw } from 'lucide-react';
import toast from 'react-hot-toast';
import PageHeader from '../../../shared/components/PageHeader';
import StatusBadge from '../../../shared/components/StatusBadge';
import ConfirmDialog from '../../../shared/components/ConfirmDialog';
import EditProductModal from '../../inventory/components/EditProductModal';
import {
  fetchProductById,
  deleteProduct,
  restoreProduct,
  selectCurrentProduct,
  selectProductsLoading,
  selectCurrentType,
} from '../productsSlice';
import { selectCurrentLocation } from '../../locations/locationsSlice';
import { PRODUCT_STATUS, PRODUCT_TYPE_SINGULAR } from '../../../constants';

function ProductDetailsPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { id } = useParams();
  const [searchParams] = useSearchParams();

  const product = useSelector(selectCurrentProduct);
  const loading = useSelector(selectProductsLoading);
  const currentType = useSelector(selectCurrentType);
  const currentLocation = useSelector(selectCurrentLocation);
  const error = useSelector((state) => state.products.error);

  const [confirmDialog, setConfirmDialog] = useState({ open: false, action: null });
  const [editModalOpen, setEditModalOpen] = useState(false);

  // Get product type from URL param if available, otherwise fall back to Redux currentType
  const productTypeParam = searchParams.get('type');
  const effectiveType = productTypeParam || currentType;

  useEffect(() => {
    if (id && effectiveType) {
      // Handle backend's OTHER_PRODUCT vs frontend's OTHER mapping
      const normalizedType = effectiveType === 'OTHER_PRODUCT' ? 'OTHER' : effectiveType;
      dispatch(fetchProductById({ type: normalizedType, id }));
    }
  }, [dispatch, id, effectiveType]);

  const handleOpenConfirm = (action) => {
    setConfirmDialog({ open: true, action });
  };

  const handleCloseConfirm = () => {
    setConfirmDialog({ open: false, action: null });
  };

  const handleConfirmAction = async () => {
    const { action } = confirmDialog;
    try {
      // Use the product's actual type from the product data, not currentType from Redux
      // Handle backend's OTHER_PRODUCT vs frontend's OTHER mapping
      const actualProductType = product.productType === 'OTHER_PRODUCT' ? 'OTHER' : product.productType;

      if (action === 'delete') {
        // Pass locationId for history tracking (exclude special aggregate IDs)
        const locationId = currentLocation?.id && !['ALL_STORES', 'ALL_WAREHOUSES'].includes(currentLocation.id)
          ? currentLocation.id
          : null;
        await dispatch(deleteProduct({ type: actualProductType, id: product.id, locationId })).unwrap();
        toast.success('Produkt został usunięty');
        navigate('/inventory');
      } else if (action === 'restore') {
        await dispatch(restoreProduct({ type: actualProductType, id: product.id })).unwrap();
        toast.success('Produkt został przywrócony');
        dispatch(fetchProductById({ type: actualProductType, id }));
      }
    } catch (error) {
      toast.error(error || `Nie udało się ${action} produktu`);
    }
    handleCloseConfirm();
  };

  const handleCloseEditModal = () => {
    setEditModalOpen(false);
    // Refresh product data after edit
    const actualProductType = product.productType === 'OTHER_PRODUCT' ? 'OTHER' : product.productType;
    dispatch(fetchProductById({ type: actualProductType, id }));
  };

  if (loading) {
    return (
      <Container maxWidth="lg">
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 400 }}>
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  if (error || !product) {
    return (
      <Container maxWidth="lg">
        <Paper sx={{ p: 3, textAlign: 'center' }}>
          <Typography variant="h6" color="error" sx={{ mb: 2 }}>
            Produkt nie został znaleziony
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            {error || 'Ten produkt może być usunięty lub nie istnieje w systemie.'}
          </Typography>
          <Button
            variant="contained"
            startIcon={<ArrowLeft size={20} />}
            onClick={() => navigate('/inventory')}
          >
            Powrót do magazynu
          </Button>
        </Paper>
      </Container>
    );
  }

  const getProductName = () => {
    if (product.model) return `${product.brand?.name || ''} ${product.model}`;
    if (product.name) return product.name;
    return 'Szczegóły produktu';
  };

  const getLensTypeLabel = (lensType) => {
    const lensTypeLabels = {
      'DAILY': 'Jednodniowe',
      'BI_WEEKLY': 'Dwutygodniowe',
      'MONTHLY': 'Miesięczne',
    };
    return lensTypeLabels[lensType] || lensType;
  };

  const renderProductDetails = () => {
    return (
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Typography variant="body2" color="text.secondary">
            Marka
          </Typography>
          <Typography variant="body1" sx={{ mb: 2 }}>
            {product.brand?.name || '-'}
          </Typography>
        </Grid>

        {product.model && (
          <Grid item xs={12} md={6}>
            <Typography variant="body2" color="text.secondary">
              Model
            </Typography>
            <Typography variant="body1" sx={{ mb: 2 }}>
              {product.model}
            </Typography>
          </Grid>
        )}

        {product.color && (
          <Grid item xs={12} md={6}>
            <Typography variant="body2" color="text.secondary">
              Kolor
            </Typography>
            <Typography variant="body1" sx={{ mb: 2 }}>
              {product.color}
            </Typography>
          </Grid>
        )}

        {product.size && (
          <Grid item xs={12} md={6}>
            <Typography variant="body2" color="text.secondary">
              Rozmiar
            </Typography>
            <Typography variant="body1" sx={{ mb: 2 }}>
              {product.size}
            </Typography>
          </Grid>
        )}

        {product.power && (
          <Grid item xs={12} md={6}>
            <Typography variant="body2" color="text.secondary">
              Moc
            </Typography>
            <Typography variant="body1" sx={{ mb: 2 }}>
              {product.power}
            </Typography>
          </Grid>
        )}

        {product.lensType && (
          <Grid item xs={12} md={6}>
            <Typography variant="body2" color="text.secondary">
              Typ szkła
            </Typography>
            <Typography variant="body1" sx={{ mb: 2 }}>
              {getLensTypeLabel(product.lensType)}
            </Typography>
          </Grid>
        )}

        {product.volume && (
          <Grid item xs={12} md={6}>
            <Typography variant="body2" color="text.secondary">
              Pojemność
            </Typography>
            <Typography variant="body1" sx={{ mb: 2 }}>
              {product.volume}
            </Typography>
          </Grid>
        )}

        {product.name && !product.model && (
          <Grid item xs={12} md={6}>
            <Typography variant="body2" color="text.secondary">
              Nazwa produktu
            </Typography>
            <Typography variant="body1" sx={{ mb: 2 }}>
              {product.name}
            </Typography>
          </Grid>
        )}

        <Grid item xs={12} md={6}>
          <Typography variant="body2" color="text.secondary">
            Cena sprzedaży
          </Typography>
          <Typography variant="body1" sx={{ mb: 2 }}>
            {product.sellingPrice?.toFixed(2) || '0.00'} zł
          </Typography>
        </Grid>

        <Grid item xs={12}>
          <Typography variant="body2" color="text.secondary">
            Opis / Notatka
          </Typography>
          <Typography variant="body1" sx={{ mb: 2 }}>
            {product.description || '-'}
          </Typography>
        </Grid>
      </Grid>
    );
  };

  return (
    <Container maxWidth="lg">
      <PageHeader
        title={getProductName()}
        subtitle={PRODUCT_TYPE_SINGULAR[currentType]}
        breadcrumbs={[
          { label: 'Magazyn', to: '/inventory' },
          { label: getProductName() },
        ]}
        actions={[
          {
            label: 'Wstecz',
            icon: <ArrowLeft size={20} />,
            onClick: () => navigate('/inventory'),
            variant: 'outlined',
          },
        ]}
      />

      <Paper sx={{ p: 3 }}>
        {/* Actions */}
        <Box sx={{ mb: 3, display: 'flex', gap: 2 }}>
          <Button
            variant="outlined"
            startIcon={<Edit size={16} />}
            onClick={() => setEditModalOpen(true)}
            disabled={product.status === PRODUCT_STATUS.DELETED}
          >
            Edytuj
          </Button>
          {product.status !== PRODUCT_STATUS.DELETED ? (
            <Button
              variant="outlined"
              color="error"
              startIcon={<Trash2 size={16} />}
              onClick={() => handleOpenConfirm('delete')}
            >
              Usuń
            </Button>
          ) : (
            <Button
              variant="outlined"
              color="primary"
              startIcon={<RefreshCw size={16} />}
              onClick={() => handleOpenConfirm('restore')}
            >
              Przywróć
            </Button>
          )}
        </Box>

        <Divider sx={{ mb: 3 }} />

        {/* Product Details */}
        {renderProductDetails()}
      </Paper>

      {/* Confirm Dialog */}
      <ConfirmDialog
        open={confirmDialog.open}
        onClose={handleCloseConfirm}
        onConfirm={handleConfirmAction}
        title={confirmDialog.action === 'delete' ? 'Usuń produkt' : 'Przywróć produkt'}
        message={
          confirmDialog.action === 'delete'
            ? 'Czy na pewno chcesz usunąć ten produkt? Tę akcję można cofnąć później.'
            : 'Czy na pewno chcesz przywrócić ten produkt?'
        }
        confirmText={confirmDialog.action === 'delete' ? 'Usuń' : 'Przywróć'}
        confirmColor={confirmDialog.action === 'delete' ? 'error' : 'primary'}
      />

      {/* Edit Product Modal */}
      <EditProductModal
        open={editModalOpen}
        onClose={handleCloseEditModal}
        product={product ? { ...product, type: currentType } : null}
      />
    </Container>
  );
}

export default ProductDetailsPage;
