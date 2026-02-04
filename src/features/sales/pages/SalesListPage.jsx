import { useEffect, useState, useMemo, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useLocation } from 'react-router-dom';
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
  InputAdornment,
} from '@mui/material';
import { Plus, Eye, XCircle, Search } from 'lucide-react';
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
import { selectUser } from '../../auth/authSlice';
import { usePagination } from '../../../hooks/usePagination';
import {
  SALE_STATUS,
  SALE_STATUS_LABELS,
  DATE_FORMATS,
  LOCATION_TYPES,
  ENTITY_TYPES,
  PERMISSIONS,
  USER_ROLES,
} from '../../../constants';

function SalesListPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  const sales = useSelector(selectSales);
  const loading = useSelector(selectSalesLoading);
  const paginationData = useSelector(selectSalesPagination);
  const locations = useSelector(selectActiveLocations);
  const currentLocation = useSelector(selectCurrentLocation);
  const currentUser = useSelector(selectUser);

  const [statusFilters, setStatusFilters] = useState([]); // Array of selected statuses
  const [productTypeFilters, setProductTypeFilters] = useState([]); // Array of selected product types
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState('');
  const [confirmDialog, setConfirmDialog] = useState({ open: false, sale: null });
  const [sort, setSort] = useState({ sortBy: 'date', sortDirection: 'desc' });

  const pagination = usePagination({
    total: paginationData?.totalElements || 0,
    defaultSize: 20,
  });

  useEffect(() => {
    dispatch(fetchActiveLocations());
  }, [dispatch]);

  // Track previous debounced search to reset pagination only on actual changes
  const prevDebouncedSearchRef = useRef(debouncedSearchQuery);

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Reset pagination when debounced search query changes
  useEffect(() => {
    if (prevDebouncedSearchRef.current !== debouncedSearchQuery) {
      pagination.setPage(0);
      prevDebouncedSearchRef.current = debouncedSearchQuery;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSearchQuery]);

  // Track previous location to reset pagination only on actual changes
  const prevLocationRef = useRef(currentLocation?.id);

  // Reset pagination when location changes
  useEffect(() => {
    if (prevLocationRef.current !== currentLocation?.id) {
      pagination.setPage(0);
      prevLocationRef.current = currentLocation?.id;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentLocation?.id]);

  useEffect(() => {
    // Date validation: ensure startDate is not after endDate
    if (startDate && endDate && startDate > endDate) {
      return; // Don't fetch if dates are invalid
    }

    // Filter by location: if "ALL_STORES" is selected or no location, send undefined to get all sales
    const locationId = (currentLocation?.id === 'ALL_STORES' || !currentLocation)
      ? undefined
      : currentLocation.id;

    // Map frontend sort field to backend sort field
    const getSortField = () => {
      if (sort.sortBy === 'date') return 'saleDate';
      if (sort.sortBy === 'total') return 'totalAmount';
      return 'saleDate';
    };

    const params = {
      page: pagination.page,
      size: pagination.size,
      sort: `${getSortField()},${sort.sortDirection}`,
      locationId,
      statuses: statusFilters.length > 0 ? statusFilters.join(',') : undefined,
      productTypes: productTypeFilters.length > 0 ? productTypeFilters.join(',') : undefined,
      startDate: startDate || undefined,
      endDate: endDate || undefined,
      search: debouncedSearchQuery || undefined,
    };
    dispatch(fetchSales(params));
  }, [dispatch, pagination.page, pagination.size, currentLocation, statusFilters, productTypeFilters, startDate, endDate, debouncedSearchQuery, sort]);

  // Refresh data when navigating back with refresh state
  useEffect(() => {
    if (location.state?.refresh) {
      // Trigger refresh by dispatching fetchSales
      const locationId = (currentLocation?.id === 'ALL_STORES' || !currentLocation)
        ? undefined
        : currentLocation.id;

      const getSortField = () => {
        if (sort.sortBy === 'date') return 'saleDate';
        if (sort.sortBy === 'total') return 'totalAmount';
        return 'saleDate';
      };

      const params = {
        page: pagination.page,
        size: pagination.size,
        sort: `${getSortField()},${sort.sortDirection}`,
        locationId,
        statuses: statusFilters.length > 0 ? statusFilters.join(',') : undefined,
        productTypes: productTypeFilters.length > 0 ? productTypeFilters.join(',') : undefined,
        startDate: startDate || undefined,
        endDate: endDate || undefined,
        search: debouncedSearchQuery || undefined,
      };
      dispatch(fetchSales(params));

      // Clear the state to prevent refresh on subsequent renders
      navigate(location.pathname, { replace: true, state: {} });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.state]);

  const hasPermission = (permission) => {
    return PERMISSIONS[permission]?.includes(currentUser?.role);
  };

  // Check if user can view sales:
  // 1. ADMIN/OWNER can view all sales
  // 2. EMPLOYEE can view sales if they have SALES tab access for the current location
  const canViewSales = useMemo(() => {
    // ADMIN and OWNER have full access
    if (currentUser?.role === USER_ROLES.ADMIN || currentUser?.role === USER_ROLES.OWNER) {
      return true;
    }

    // EMPLOYEE: check permissions based on current location
    if (currentUser?.userLocations && currentUser.userLocations.length > 0) {
      // If "All Stores" is selected, check if user has SALES access in at least one location
      if (!currentLocation || currentLocation.id === 'ALL_STORES') {
        return currentUser.userLocations.some(
          (userLocation) =>
            // Empty/null allowedTabs means full access to all tabs
            !userLocation.allowedTabs ||
            userLocation.allowedTabs.length === 0 ||
            userLocation.allowedTabs.includes('SALES')
        );
      }

      // If specific location is selected, check if user has SALES access for THAT location
      return currentUser.userLocations.some(
        (userLocation) =>
          userLocation.location.id === currentLocation.id &&
          // Empty/null allowedTabs means full access to all tabs
          (!userLocation.allowedTabs ||
           userLocation.allowedTabs.length === 0 ||
           userLocation.allowedTabs.includes('SALES'))
      );
    }

    return false;
  }, [currentUser, currentLocation]);

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

      // Refetch with current filters including location and sort
      const locationId = (currentLocation?.id === 'ALL_STORES' || !currentLocation)
        ? undefined
        : currentLocation.id;

      const getSortField = () => {
        if (sort.sortBy === 'date') return 'saleDate';
        if (sort.sortBy === 'total') return 'totalAmount';
        return 'saleDate';
      };

      dispatch(fetchSales({
        page: pagination.page,
        size: pagination.size,
        sort: `${getSortField()},${sort.sortDirection}`,
        locationId,
        statuses: statusFilters.length > 0 ? statusFilters.join(',') : undefined,
        productTypes: productTypeFilters.length > 0 ? productTypeFilters.join(',') : undefined,
        startDate: startDate || undefined,
        endDate: endDate || undefined,
        search: debouncedSearchQuery || undefined,
      }));
    } catch (error) {
      toast.error(error || 'Nie udało się usunąć sprzedaży');
    }
    handleCloseConfirm();
  };

  const handleSortChange = (columnId, direction) => {
    setSort({ sortBy: columnId, sortDirection: direction });
  };

  const handleClearFilters = () => {
    setStatusFilters([]);
    setProductTypeFilters([]);
    setStartDate('');
    setEndDate('');
    setSearchQuery('');
    pagination.setPage(0);
  };

  const toggleStatusFilter = (status) => {
    setStatusFilters(prev =>
      prev.includes(status)
        ? prev.filter(s => s !== status)
        : [...prev, status]
    );
    pagination.setPage(0);
  };

  const toggleProductTypeFilter = (type) => {
    setProductTypeFilters(prev =>
      prev.includes(type)
        ? prev.filter(t => t !== type)
        : [...prev, type]
    );
    pagination.setPage(0);
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
      sortable: false,
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
      sortable: false,
      render: (row) => row.location?.name || '-',
    },
    {
      id: 'customer',
      label: 'Klient',
      sortable: false,
      render: (row) => {
        const firstName = row.customerFirstName || '';
        const lastName = row.customerLastName || '';
        const fullName = `${firstName} ${lastName}`.trim();
        return fullName || '-';
      },
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
          {(row.totalAmount || 0).toFixed(2)} zł
        </Box>
      ),
    },
    {
      id: 'status',
      label: 'Status',
      sortable: false,
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

  if (!canViewSales) {
    return (
      <Container maxWidth="xl">
        <Paper sx={{ p: 3, textAlign: 'center' }}>
          <Typography variant="h6" color="error">
            Dostęp odmówiony
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Nie masz uprawnień do przeglądania sprzedaży.
          </Typography>
        </Paper>
      </Container>
    );
  }

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
        {/* Status and Product Type Filters - same row */}
        <Box sx={{ mb: 3, display: 'flex', gap: 4, flexWrap: 'wrap' }}>
          {/* Status Filters */}
          <Box>
            <Typography variant="subtitle2" sx={{ mb: 1.5, fontWeight: 600 }}>
              Status sprzedaży
            </Typography>
            <Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap' }}>
              {Object.values(SALE_STATUS)
                .filter((status) => status !== SALE_STATUS.PARTIALLY_RETURNED)
                .map((status) => (
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
          <Box>
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
          <Box>
            <Typography variant="subtitle2" sx={{ mb: 1.5, fontWeight: 600 }}>
              Data
            </Typography>
            <Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap', alignItems: 'center' }}>
              <TextField
                label="Od"
                type="date"
                value={startDate}
                onChange={(e) => {
                  setStartDate(e.target.value);
                  pagination.setPage(0);
                }}
                size="small"
                InputLabelProps={{ shrink: true }}
                sx={{ minWidth: 150 }}
                error={startDate && endDate && startDate > endDate}
              />
              <TextField
                label="Do"
                type="date"
                value={endDate}
                onChange={(e) => {
                  setEndDate(e.target.value);
                  pagination.setPage(0);
                }}
                size="small"
                InputLabelProps={{ shrink: true }}
                sx={{ minWidth: 150 }}
                error={startDate && endDate && startDate > endDate}
              />
            </Box>
          </Box>
        </Box>

        {/* Search Bar */}
        <Box sx={{ mb: 3 }}>
          <TextField
            fullWidth
            size="small"
            placeholder="Wyszukaj po numerze sprzedaży, kliencie, sprzedawcy lub lokalizacji..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search size={20} />
                </InputAdornment>
              ),
            }}
          />
        </Box>

        {/* Clear Filters Button */}
        {(statusFilters.length > 0 || productTypeFilters.length > 0 || startDate || endDate || searchQuery) && (
          <Box sx={{ mb: 3 }}>
            <Button variant="outlined" onClick={handleClearFilters}>
              Wyczyść filtry
            </Button>
          </Box>
        )}

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
          sort={sort}
          onSortChange={handleSortChange}
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
        disabled={true}
      />
    </Container>
  );
}

export default SalesListPage;
