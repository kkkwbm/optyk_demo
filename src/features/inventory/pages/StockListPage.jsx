import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  Container,
  Paper,
  Box,
  Button,
  TextField,
  MenuItem,
  Chip,
} from '@mui/material';
import { Package, Plus, Repeat, Edit, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import PageHeader from '../../../shared/components/PageHeader';
import DataTable from '../../../shared/components/DataTable';
import ConfirmDialog from '../../../shared/components/ConfirmDialog';
import {
  fetchInventoryStock,
  selectInventoryItems,
  selectInventoryLoading,
  selectInventoryPagination,
} from '../inventorySlice';
import { selectCurrentLocation } from '../../locations/locationsSlice';
import { deleteProduct } from '../../products/productsSlice';
import { usePagination } from '../../../hooks/usePagination';
import { useDebounce } from '../../../hooks/useDebounce';
import {
  PRODUCT_TYPES,
  PRODUCT_TYPE_LABELS,
  STOCK_THRESHOLDS,
} from '../../../constants';

function StockListPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const inventoryItems = useSelector(selectInventoryItems);
  const loading = useSelector(selectInventoryLoading);
  const paginationData = useSelector(selectInventoryPagination);
  const currentLocation = useSelector(selectCurrentLocation);

  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [stockLevelFilter, setStockLevelFilter] = useState(searchParams.get('filter') || '');
  const [confirmDialog, setConfirmDialog] = useState({ open: false, product: null });

  const debouncedSearch = useDebounce(searchTerm, 300);
  const pagination = usePagination({
    total: paginationData?.totalElements || 0,
    defaultSize: 20,
  });

  useEffect(() => {
    const params = {
      page: pagination.page,
      size: pagination.size,
      search: debouncedSearch || undefined,
      locationId: currentLocation?.id || undefined,
      productType: typeFilter || undefined,
      stockLevel: stockLevelFilter || undefined,
    };
    dispatch(fetchInventoryStock(params));
  }, [dispatch, pagination.page, pagination.size, debouncedSearch, typeFilter, stockLevelFilter, currentLocation]);

  const handleClearFilters = () => {
    setSearchTerm('');
    setTypeFilter('');
    setStockLevelFilter('');
  };

  const handleOpenDeleteDialog = (product) => {
    setConfirmDialog({ open: true, product });
  };

  const handleCloseDeleteDialog = () => {
    setConfirmDialog({ open: false, product: null });
  };

  const handleConfirmDelete = async () => {
    const { product } = confirmDialog;
    try {
      // Use productType field and handle backend's OTHER_PRODUCT vs frontend's OTHER mapping
      const productType = product.productType || product.type;
      const actualProductType = productType === 'OTHER_PRODUCT' ? 'OTHER' : productType;

      await dispatch(deleteProduct({ type: actualProductType, id: product.id })).unwrap();
      toast.success('Produkt został usunięty');
      // Refresh inventory list
      const params = {
        page: pagination.page,
        size: pagination.size,
        search: debouncedSearch || undefined,
        locationId: currentLocation?.id || undefined,
        productType: typeFilter || undefined,
        stockLevel: stockLevelFilter || undefined,
      };
      dispatch(fetchInventoryStock(params));
    } catch (error) {
      const errorMessage = typeof error === 'string' ? error : error?.message || 'Nie udało się usunąć produktu';
      toast.error(errorMessage);
    }
    handleCloseDeleteDialog();
  };

  const getStockStatusColor = (quantity) => {
    if (quantity <= STOCK_THRESHOLDS.OUT_OF_STOCK) return 'error';
    if (quantity <= STOCK_THRESHOLDS.CRITICAL_STOCK) return 'error';
    if (quantity <= STOCK_THRESHOLDS.LOW_STOCK) return 'warning';
    return 'success';
  };

  const getStockStatusLabel = (quantity) => {
    if (quantity <= STOCK_THRESHOLDS.OUT_OF_STOCK) return 'Brak w magazynie';
    if (quantity <= STOCK_THRESHOLDS.CRITICAL_STOCK) return 'Krytyczny';
    if (quantity <= STOCK_THRESHOLDS.LOW_STOCK) return 'Niski stan';
    return 'W magazynie';
  };

  const columns = [
    {
      id: 'product',
      label: 'Produkt',
      sortable: true,
      render: (row) => row.product?.model || row.product?.name || '-',
    },
    {
      id: 'brand',
      label: 'Marka',
      sortable: true,
      render: (row) => row.product?.brand?.name || '-',
    },
    {
      id: 'type',
      label: 'Typ',
      sortable: true,
      render: (row) => (
        <Chip
          label={PRODUCT_TYPE_LABELS[row.product?.type] || 'Nieznany'}
          size="small"
        />
      ),
    },
    {
      id: 'location',
      label: 'Lokalizacja',
      sortable: true,
      render: (row) => row.location?.name || '-',
    },
    {
      id: 'available',
      label: 'Dostępne',
      sortable: true,
      render: (row) => (
        <Box sx={{ fontWeight: 600 }}>
          {row.availableQuantity}
        </Box>
      ),
    },
    {
      id: 'status',
      label: 'Status',
      sortable: false,
      render: (row) => (
        <Chip
          label={getStockStatusLabel(row.availableQuantity)}
          size="small"
          color={getStockStatusColor(row.availableQuantity)}
        />
      ),
    },
    {
      id: 'actions',
      label: 'Akcje',
      sortable: false,
      render: (row) => (
        <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
          <Button
            size="small"
            variant="text"
            startIcon={<Edit size={14} />}
            onClick={(e) => {
              e.stopPropagation();
              navigate(`/products/${row.product?.id}/edit`);
            }}
          >
            Edytuj
          </Button>
          <Button
            size="small"
            variant="text"
            color="error"
            startIcon={<Trash2 size={14} />}
            onClick={(e) => {
              e.stopPropagation();
              handleOpenDeleteDialog(row.product);
            }}
          >
            Usuń
          </Button>
          <Button
            size="small"
            variant="text"
            startIcon={<Plus size={14} />}
            onClick={(e) => {
              e.stopPropagation();
              navigate(`/inventory/adjust?product=${row.product?.id}&location=${row.location?.id}`);
            }}
          >
            Dostosuj
          </Button>
          <Button
            size="small"
            variant="text"
            startIcon={<Repeat size={14} />}
            onClick={(e) => {
              e.stopPropagation();
              navigate(`/inventory/transfer?product=${row.product?.id}&from=${row.location?.id}`);
            }}
          >
            Transfer
          </Button>
        </Box>
      ),
    },
  ];

  return (
    <Container maxWidth="xl">
      <PageHeader
        title={currentLocation ? `Lista zapasów - ${currentLocation.name}` : "Lista zapasów"}
        subtitle={currentLocation ? `Zarządzaj zapasami w: ${currentLocation.name}` : "Wyświetl i zarządzaj poziomami zapasów magazynowych"}
        breadcrumbs={[
          { label: 'Pulpit', to: '/' },
          { label: 'Magazyn', to: '/inventory' },
          { label: 'Lista zapasów' },
        ]}
        actions={[
          {
            label: 'Dodaj produkt',
            icon: <Package size={20} />,
            onClick: () => navigate('/inventory/create'),
            variant: 'contained',
          },
          {
            label: 'Dostosuj stan',
            icon: <Plus size={20} />,
            onClick: () => navigate('/inventory/adjust'),
            variant: 'outlined',
          },
          {
            label: 'Transfer magazynowy',
            icon: <Repeat size={20} />,
            onClick: () => navigate('/inventory/transfer'),
            variant: 'outlined',
          },
        ]}
      />

      <Paper sx={{ p: 3 }}>
        {/* Filters */}
        <Box sx={{ mb: 3, display: 'flex', gap: 2, flexWrap: 'wrap' }}>
          <TextField
            label="Szukaj"
            placeholder="Szukaj po nazwie produktu..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            size="small"
            sx={{ minWidth: 250 }}
          />
          <TextField
            select
            label="Typ produktu"
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            size="small"
            sx={{ minWidth: 150 }}
          >
            <MenuItem value="">Wszystkie typy</MenuItem>
            {Object.values(PRODUCT_TYPES).map((type) => (
              <MenuItem key={type} value={type}>
                {PRODUCT_TYPE_LABELS[type]}
              </MenuItem>
            ))}
          </TextField>
          <TextField
            select
            label="Poziom zapasów"
            value={stockLevelFilter}
            onChange={(e) => setStockLevelFilter(e.target.value)}
            size="small"
            sx={{ minWidth: 150 }}
          >
            <MenuItem value="">Wszystkie poziomy</MenuItem>
            <MenuItem value="low">Niski stan</MenuItem>
            <MenuItem value="critical">Krytyczny</MenuItem>
            <MenuItem value="out">Brak w magazynie</MenuItem>
            <MenuItem value="normal">W magazynie</MenuItem>
          </TextField>
          {(searchTerm || typeFilter || stockLevelFilter) && (
            <Button variant="outlined" onClick={handleClearFilters}>
              Wyczyść filtry
            </Button>
          )}
        </Box>

        {/* Stock Table */}
        <DataTable
          columns={columns}
          data={inventoryItems}
          loading={loading}
          pagination={{
            page: pagination.page,
            total: paginationData?.totalElements || 0,
            size: pagination.size,
          }}
          onPageChange={pagination.handlePageChange}
          onRowsPerPageChange={pagination.handleRowsPerPageChange}
          emptyMessage="Nie znaleziono artykułów magazynowych. Spróbuj dostosować filtry."
        />
      </Paper>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        open={confirmDialog.open}
        onClose={handleCloseDeleteDialog}
        onConfirm={handleConfirmDelete}
        title="Usuń produkt"
        message={`Czy na pewno chcesz usunąć produkt "${confirmDialog.product?.model || confirmDialog.product?.name || ''}"? Ta operacja jest nieodwracalna.`}
        confirmText="Usuń"
        confirmColor="error"
      />
    </Container>
  );
}

export default StockListPage;
