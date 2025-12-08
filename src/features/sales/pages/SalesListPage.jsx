import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Paper,
  Box,
  Button,
  TextField,
  MenuItem,
  Chip,
  Typography,
  Alert,
} from '@mui/material';
import { Plus, Eye, XCircle } from 'lucide-react';
import { formatDate } from '../../../utils/dateFormat';
import toast from 'react-hot-toast';
import PageHeader from '../../../shared/components/PageHeader';
import DataTable from '../../../shared/components/DataTable';
import ConfirmDialog from '../../../shared/components/ConfirmDialog';
import {
  fetchSales,
  cancelSale,
  selectSales,
  selectSalesLoading,
  selectSalesPagination,
} from '../salesSlice';
import { fetchActiveLocations, selectActiveLocations, selectCurrentLocation } from '../../locations/locationsSlice';
import { usePagination } from '../../../hooks/usePagination';
import {
  SALE_STATUS,
  SALE_STATUS_LABELS,
  DATE_FORMATS,
  LOCATION_TYPES,
  ENTITY_TYPES,
} from '../../../constants';

function SalesListPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const sales = useSelector(selectSales);
  const loading = useSelector(selectSalesLoading);
  const paginationData = useSelector(selectSalesPagination);
  const locations = useSelector(selectActiveLocations);
  const currentLocation = useSelector(selectCurrentLocation);

  const [statusFilters, setStatusFilters] = useState([]); // Array of selected statuses
  const [productTypeFilters, setProductTypeFilters] = useState([]); // Array of selected product types
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [confirmDialog, setConfirmDialog] = useState({ open: false, sale: null });

  const pagination = usePagination({
    total: paginationData?.totalElements || 0,
    defaultSize: 20,
  });

  useEffect(() => {
    dispatch(fetchActiveLocations());
  }, [dispatch]);

  useEffect(() => {
    // Filter by location: if "ALL_STORES" is selected or no location, send undefined to get all sales
    const locationId = (currentLocation?.id === 'ALL_STORES' || !currentLocation)
      ? undefined
      : currentLocation.id;

    const params = {
      page: pagination.page,
      size: pagination.size,
      locationId,
      statuses: statusFilters.length > 0 ? statusFilters.join(',') : undefined,
      productTypes: productTypeFilters.length > 0 ? productTypeFilters.join(',') : undefined,
      startDate: startDate || undefined,
      endDate: endDate || undefined,
    };
    dispatch(fetchSales(params));
  }, [dispatch, pagination.page, pagination.size, currentLocation, statusFilters, productTypeFilters, startDate, endDate]);

  const handleOpenConfirm = (sale) => {
    setConfirmDialog({ open: true, sale });
  };

  const handleCloseConfirm = () => {
    setConfirmDialog({ open: false, sale: null });
  };

  const handleConfirmCancel = async () => {
    const { sale } = confirmDialog;
    try {
      await dispatch(cancelSale({ id: sale.id })).unwrap();
      toast.success('Sprzedaż została usunięta');

      // Refetch with current filters including location
      const locationId = (currentLocation?.id === 'ALL_STORES' || !currentLocation)
        ? undefined
        : currentLocation.id;

      dispatch(fetchSales({
        page: pagination.page,
        size: pagination.size,
        locationId,
        statuses: statusFilters.length > 0 ? statusFilters.join(',') : undefined,
        productTypes: productTypeFilters.length > 0 ? productTypeFilters.join(',') : undefined,
        startDate: startDate || undefined,
        endDate: endDate || undefined,
      }));
    } catch (error) {
      toast.error(error || 'Nie udało się usunąć sprzedaży');
    }
    handleCloseConfirm();
  };

  const handleClearFilters = () => {
    setStatusFilters([]);
    setProductTypeFilters([]);
    setStartDate('');
    setEndDate('');
  };

  const toggleStatusFilter = (status) => {
    setStatusFilters(prev =>
      prev.includes(status)
        ? prev.filter(s => s !== status)
        : [...prev, status]
    );
  };

  const toggleProductTypeFilter = (type) => {
    setProductTypeFilters(prev =>
      prev.includes(type)
        ? prev.filter(t => t !== type)
        : [...prev, type]
    );
  };

  // Check if current location is a warehouse
  const isWarehouseSelected = currentLocation && (currentLocation.type === LOCATION_TYPES.WAREHOUSE || currentLocation.type === 'WAREHOUSE');

  // Product entity types
  const productEntityTypes = [
    { value: ENTITY_TYPES.FRAME, label: 'Oprawki' },
    { value: ENTITY_TYPES.CONTACT_LENS, label: 'Szkła kontaktowe' },
    { value: ENTITY_TYPES.SOLUTION, label: 'Płyny' },
    { value: ENTITY_TYPES.OTHER, label: 'Inne' },
  ];

  const getStatusColor = (status) => {
    switch (status) {
      case SALE_STATUS.COMPLETED:
        return 'success';
      case SALE_STATUS.CANCELLED:
        return 'error';
      case SALE_STATUS.RETURNED:
        return 'warning';
      case SALE_STATUS.PARTIALLY_RETURNED:
        return 'info';
      default:
        return 'default';
    }
  };

  const columns = [
    {
      id: 'saleNumber',
      label: 'Numer sprzedaży #',
      sortable: true,
      render: (row) => `#${row.saleNumber || row.id.slice(0, 8)}`,
    },
    {
      id: 'date',
      label: 'Data',
      sortable: true,
      render: (row) => formatDate(row.createdAt, DATE_FORMATS.DISPLAY_WITH_TIME),
    },
    {
      id: 'location',
      label: 'Lokalizacja',
      sortable: true,
      render: (row) => row.location?.name || '-',
    },
    {
      id: 'user',
      label: 'Sprzedawca',
      sortable: false,
      render: (row) => row.userFullName || '-',
    },
    {
      id: 'itemsCount',
      label: 'Produkty',
      sortable: false,
      render: (row) => row.items?.length || 0,
    },
    {
      id: 'total',
      label: 'Suma',
      sortable: true,
      render: (row) => (
        <Box sx={{ fontWeight: 600 }}>
          ${(row.totalAmount || 0).toFixed(2)}
        </Box>
      ),
    },
    {
      id: 'status',
      label: 'Status',
      sortable: true,
      render: (row) => (
        <Chip
          label={SALE_STATUS_LABELS[row.status]}
          size="small"
          color={getStatusColor(row.status)}
        />
      ),
    },
    {
      id: 'actions',
      label: 'Akcje',
      sortable: false,
      render: (row) => (
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button
            size="small"
            variant="text"
            startIcon={<Eye size={14} />}
            onClick={(e) => {
              e.stopPropagation();
              navigate(`/sales/${row.id}`);
            }}
          >
            Zobacz
          </Button>
          {row.status === SALE_STATUS.COMPLETED && (
            <Button
              size="small"
              variant="text"
              color="error"
              startIcon={<XCircle size={14} />}
              onClick={(e) => {
                e.stopPropagation();
                handleOpenConfirm(row);
              }}
            >
              Usuń
            </Button>
          )}
        </Box>
      ),
    },
  ];

  return (
    <Container maxWidth="xl">
      <PageHeader
        title={currentLocation ? `Sprzedaż - ${currentLocation.name}` : "Sprzedaż"}
        subtitle="Wyświetl i zarządzaj wszystkimi transakcjami sprzedaży"
        breadcrumbs={[
          { label: 'Panel', to: '/' },
          { label: 'Sprzedaż' },
        ]}
        actions={[
          {
            label: 'Nowa sprzedaż',
            icon: <Plus size={20} />,
            onClick: () => navigate('/sales/create'),
            variant: 'contained',
            disabled: isWarehouseSelected,
          },
        ]}
      />

      {isWarehouseSelected && (
        <Alert severity="info" sx={{ mb: 3 }}>
          <Typography variant="body1" sx={{ fontWeight: 600 }}>
            Magazyn nie obsługuje sprzedaży
          </Typography>
          <Typography variant="body2">
            Wybierz salon z listy lokalizacji po lewej stronie, aby przeglądać i zarządzać sprzedażą.
          </Typography>
        </Alert>
      )}

      <Paper sx={{ p: 3 }}>
        {/* Status Filters */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="subtitle2" sx={{ mb: 1.5, fontWeight: 600 }}>
            Status sprzedaży
          </Typography>
          <Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap' }}>
            {Object.values(SALE_STATUS).map((status) => (
              <Button
                key={status}
                variant={statusFilters.includes(status) ? 'contained' : 'outlined'}
                size="small"
                onClick={() => toggleStatusFilter(status)}
                sx={{ textTransform: 'none' }}
              >
                {SALE_STATUS_LABELS[status]}
              </Button>
            ))}
          </Box>
        </Box>

        {/* Product Type Filters */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="subtitle2" sx={{ mb: 1.5, fontWeight: 600 }}>
            Typ produktu
          </Typography>
          <Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap' }}>
            {productEntityTypes.map((entity) => (
              <Button
                key={entity.value}
                variant={productTypeFilters.includes(entity.value) ? 'contained' : 'outlined'}
                size="small"
                onClick={() => toggleProductTypeFilter(entity.value)}
                sx={{ textTransform: 'none' }}
              >
                {entity.label}
              </Button>
            ))}
          </Box>
        </Box>

        {/* Date Filters */}
        <Box sx={{ mb: 3, display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'center' }}>
          <TextField
            label="Data początkowa"
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            size="small"
            InputLabelProps={{ shrink: true }}
            sx={{ minWidth: 150 }}
          />
          <TextField
            label="Data końcowa"
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            size="small"
            InputLabelProps={{ shrink: true }}
            sx={{ minWidth: 150 }}
          />
          {(statusFilters.length > 0 || productTypeFilters.length > 0 || startDate || endDate) && (
            <Button variant="outlined" onClick={handleClearFilters}>
              Wyczyść filtry
            </Button>
          )}
        </Box>

        {/* Tabela sprzedaży */}
        <DataTable
          columns={columns}
          data={sales}
          loading={loading}
          pagination={{
            page: pagination.page,
            total: paginationData?.totalElements || 0,
            size: pagination.size,
          }}
          onPageChange={pagination.handlePageChange}
          onRowsPerPageChange={pagination.handleRowsPerPageChange}
          onRowClick={(row) => navigate(`/sales/${row.id}`)}
          emptyMessage="Nie znaleziono sprzedaży. Spróbuj dostosować filtry."
        />
      </Paper>

      {/* Dialog potwierdzenia */}
      <ConfirmDialog
        open={confirmDialog.open}
        onClose={handleCloseConfirm}
        onConfirm={handleConfirmCancel}
        title="Usuń sprzedaż"
        message={`Czy na pewno chcesz usunąć sprzedaż #${confirmDialog.sale?.saleNumber || confirmDialog.sale?.id?.slice(0, 8)}? Spowoduje to zwrot produktów do magazynu.`}
        confirmText="Usuń sprzedaż"
        confirmColor="error"
      />
    </Container>
  );
}

export default SalesListPage;
