import { useEffect, useState, useMemo } from 'react';
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
  Grid,
  Typography,
  Divider,
  InputAdornment,
} from '@mui/material';
import { Plus, XCircle, Warehouse, Store, CheckCircle2, Trash2, Eye, Edit, Search } from 'lucide-react';
import { formatDate } from '../../../utils/dateFormat';
import toast from 'react-hot-toast';
import PageHeader from '../../../shared/components/PageHeader';
import DataTable from '../../../shared/components/DataTable';
import ConfirmDialog from '../../../shared/components/ConfirmDialog';
import ConfirmTransferDialog from '../components/ConfirmTransferDialog';
import TransferStatusChip from '../components/TransferStatusChip';
import transferService from '../../../services/transferService';
import {
  fetchTransfers,
  fetchTransfersByLocation,
  cancelTransfer,
  confirmTransfer,
  deleteTransfer,
  selectTransfers,
  selectTransfersLoading,
  selectTransfersPagination,
} from '../transfersSlice';
import { fetchActiveLocations, selectActiveLocations, selectCurrentLocation } from '../../locations/locationsSlice';
import { selectUser } from '../../auth/authSlice';
import { usePagination } from '../../../hooks/usePagination';
import {
  TRANSFER_STATUS,
  TRANSFER_STATUS_LABELS,
  DATE_FORMATS,
  LOCATION_TYPES,
  PERMISSIONS,
  USER_ROLES,
} from '../../../constants';

function TransfersListPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  const transfers = useSelector(selectTransfers);
  const loading = useSelector(selectTransfersLoading);
  const paginationData = useSelector(selectTransfersPagination);
  const locations = useSelector(selectActiveLocations);
  const currentLocation = useSelector(selectCurrentLocation);
  const currentUser = useSelector(selectUser);

  const [fromLocationFilters, setFromLocationFilters] = useState([]);
  const [toLocationFilters, setToLocationFilters] = useState([]);
  const [statusFilter, setStatusFilter] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState('');
  const [allPendingTransfers, setAllPendingTransfers] = useState([]);
  const [pendingLoading, setPendingLoading] = useState(false);
  const [sort, setSort] = useState({ sortBy: 'date', sortDirection: 'desc' });

  // Dialog state: type can be 'CANCEL' or 'DELETE'
  const [confirmDialog, setConfirmDialog] = useState({ open: false, transfer: null, type: null });

  // Confirm transfer dialog state (for partial acceptance)
  const [confirmTransferDialog, setConfirmTransferDialog] = useState({ open: false, transfer: null });

  const pagination = usePagination({
    total: paginationData?.totalElements || 0,
    defaultSize: 20,
  });

  // Fetch locations on mount
  useEffect(() => {
    dispatch(fetchActiveLocations());
  }, [dispatch]);

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Fetch all pending transfers independently (not affected by history filters)
  useEffect(() => {
    const fetchPendingTransfers = async () => {
      setPendingLoading(true);
      try {
        // Use transferService directly to avoid Redux state conflicts
        // Fetch more pending transfers to handle larger queues
        const params = {
          status: 'PENDING',
          page: 0,
          size: 500,
        };

        const response = await transferService.getTransfers(params);

        if (response.data.success) {
          const result = response.data.data;
          const pendingData = result.content || result || [];

          // If currentLocation is set AND is not "ALL_STORES", filter to show only transfers related to this location
          if (currentLocation && currentLocation.id !== 'ALL_STORES') {
            const filtered = pendingData.filter(
              (t) => t.fromLocation?.id === currentLocation.id || t.toLocation?.id === currentLocation.id
            );
            setAllPendingTransfers(filtered);
          } else {
            setAllPendingTransfers(pendingData);
          }
        } else {
          setAllPendingTransfers([]);
        }
      } catch (error) {
        setAllPendingTransfers([]);
      } finally {
        setPendingLoading(false);
      }
    };

    fetchPendingTransfers();
  }, [currentLocation]);

  // Fetch transfer history with filters
  useEffect(() => {
    // Date validation: ensure startDate is not after endDate
    if (startDate && endDate && startDate > endDate) {
      return; // Don't fetch if dates are invalid
    }

    // Map frontend sort field to backend field
    const sortFieldMap = {
      'date': 'transferDate',
    };
    const backendSortField = sortFieldMap[sort.sortBy] || 'transferDate';
    // Spring Data format: fieldName,direction (e.g., "transferDate,desc" or "transferDate,asc")
    const sortParam = `${backendSortField},${sort.sortDirection}`;

    const params = {
      page: pagination.page,
      size: pagination.size,
      sort: sortParam,
      fromLocationIds: fromLocationFilters.length > 0 ? fromLocationFilters.join(',') : undefined,
      toLocationIds: toLocationFilters.length > 0 ? toLocationFilters.join(',') : undefined,
      status: statusFilter || undefined,
      startDate: startDate || undefined,
      endDate: endDate || undefined,
      search: debouncedSearchQuery || undefined,
    };

    if (currentLocation) {
      dispatch(fetchTransfersByLocation({ locationId: currentLocation.id, params }));
    } else {
      dispatch(fetchTransfers(params));
    }
  }, [dispatch, pagination.page, pagination.size, fromLocationFilters, toLocationFilters, statusFilter, startDate, endDate, debouncedSearchQuery, currentLocation, sort]);

  // Refresh data when navigating back with refresh state
  useEffect(() => {
    if (location.state?.refresh) {
      // Trigger refresh by dispatching fetchTransfers
      const sortFieldMap = {
        'date': 'transferDate',
      };
      const backendSortField = sortFieldMap[sort.sortBy] || 'transferDate';
      const sortParam = `${backendSortField},${sort.sortDirection}`;

      const params = {
        page: pagination.page,
        size: pagination.size,
        sort: sortParam,
        fromLocationIds: fromLocationFilters.length > 0 ? fromLocationFilters.join(',') : undefined,
        toLocationIds: toLocationFilters.length > 0 ? toLocationFilters.join(',') : undefined,
        status: statusFilter || undefined,
        startDate: startDate || undefined,
        endDate: endDate || undefined,
        search: debouncedSearchQuery || undefined,
      };

      if (currentLocation) {
        dispatch(fetchTransfersByLocation({ locationId: currentLocation.id, params }));
      } else {
        dispatch(fetchTransfers(params));
      }

      // Clear the state to prevent refresh on subsequent renders
      navigate(location.pathname, { replace: true, state: {} });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.state]);

  const hasPermission = (permission) => {
    return PERMISSIONS[permission]?.includes(currentUser?.role);
  };

  // Check if user can view transfers:
  // 1. ADMIN/OWNER can view all transfers
  // 2. EMPLOYEE can view transfers if they have TRANSFERS tab access for the current location
  const canViewTransfers = useMemo(() => {
    // ADMIN and OWNER have full access
    if (currentUser?.role === USER_ROLES.ADMIN || currentUser?.role === USER_ROLES.OWNER) {
      return true;
    }

    // EMPLOYEE: check permissions based on current location
    if (currentUser?.userLocations && currentUser.userLocations.length > 0) {
      // If "All Stores" is selected, check if user has TRANSFERS access in at least one location
      if (!currentLocation || currentLocation.id === 'ALL_STORES') {
        return currentUser.userLocations.some(
          (userLocation) =>
            // Empty/null allowedTabs means full access to all tabs
            !userLocation.allowedTabs ||
            userLocation.allowedTabs.length === 0 ||
            userLocation.allowedTabs.includes('TRANSFERS')
        );
      }

      // If specific location is selected, check if user has TRANSFERS access for THAT location
      return currentUser.userLocations.some(
        (userLocation) =>
          userLocation.location.id === currentLocation.id &&
          // Empty/null allowedTabs means full access to all tabs
          (!userLocation.allowedTabs ||
           userLocation.allowedTabs.length === 0 ||
           userLocation.allowedTabs.includes('TRANSFERS'))
      );
    }

    return false;
  }, [currentUser, currentLocation]);

  const handleOpenConfirm = (transfer, type) => {
    setConfirmDialog({ open: true, transfer, type });
  };

  const handleCloseConfirm = () => {
    setConfirmDialog({ open: false, transfer: null, type: null });
  };

  const handleConfirmAction = async () => {
    const { transfer, type } = confirmDialog;
    try {
      if (type === 'CANCEL') {
        await dispatch(cancelTransfer({ id: transfer.id })).unwrap();
        toast.success('Transfer anulowany pomyślnie');
      } else if (type === 'DELETE') {
        await dispatch(deleteTransfer(transfer.id)).unwrap();
        toast.success('Transfer usunięty pomyślnie');
      }

      // Refresh pending transfers using transferService directly
      const response = await transferService.getTransfers({ status: 'PENDING', page: 0, size: 500 });
      if (response.data.success) {
        const result = response.data.data;
        const pendingData = result.content || result || [];

        if (currentLocation && currentLocation.id !== 'ALL_STORES') {
          const filtered = pendingData.filter(
            (t) => t.fromLocation?.id === currentLocation.id || t.toLocation?.id === currentLocation.id
          );
          setAllPendingTransfers(filtered);
        } else {
          setAllPendingTransfers(pendingData);
        }
      }

      // Refresh history list
      const params = {
        page: pagination.page,
        size: pagination.size,
        fromLocationIds: fromLocationFilters.length > 0 ? fromLocationFilters.join(',') : undefined,
        toLocationIds: toLocationFilters.length > 0 ? toLocationFilters.join(',') : undefined,
        status: statusFilter || undefined,
        startDate: startDate || undefined,
        endDate: endDate || undefined,
        search: debouncedSearchQuery || undefined,
      };

      if (currentLocation) {
        dispatch(fetchTransfersByLocation({ locationId: currentLocation.id, params }));
      } else {
        dispatch(fetchTransfers(params));
      }
    } catch (error) {
      toast.error(error || 'Wystąpił błąd podczas przetwarzania transferu');
    }
    handleCloseConfirm();
  };

  const handleOpenReceiveDialog = async (transfer) => {
    try {
      // Fetch full transfer details including product information
      const response = await transferService.getTransferById(transfer.id);
      if (response.data.success) {
        setConfirmTransferDialog({ open: true, transfer: response.data.data });
      } else {
        toast.error('Nie udało się pobrać szczegółów transferu');
      }
    } catch (error) {
      toast.error('Wystąpił błąd podczas pobierania szczegółów transferu');
    }
  };

  const handleCloseReceiveDialog = () => {
    setConfirmTransferDialog({ open: false, transfer: null });
  };

  const handleConfirmTransfer = async (confirmData) => {
    try {
      await dispatch(confirmTransfer({
        id: confirmTransferDialog.transfer.id,
        ...confirmData
      })).unwrap();

      const hasPartialAcceptance = confirmData.acceptedItems && confirmData.acceptedItems.some(
        item => item.acceptedQuantity < confirmTransferDialog.transfer.items.find(i => i.id === item.transferItemId)?.quantity
      );

      if (hasPartialAcceptance) {
        toast.success('Transfer częściowo przyjęty. Utworzono transfer zwrotny dla odrzuconych produktów.');
      } else {
        toast.success('Transfer odebrany pomyślnie');
      }

      // Refresh pending transfers
      const response = await transferService.getTransfers({ status: 'PENDING', page: 0, size: 500 });
      if (response.data.success) {
        const result = response.data.data;
        const pendingData = result.content || result || [];

        if (currentLocation && currentLocation.id !== 'ALL_STORES') {
          const filtered = pendingData.filter(
            (t) => t.fromLocation?.id === currentLocation.id || t.toLocation?.id === currentLocation.id
          );
          setAllPendingTransfers(filtered);
        } else {
          setAllPendingTransfers(pendingData);
        }
      }

      // Refresh history list
      const params = {
        page: pagination.page,
        size: pagination.size,
        fromLocationIds: fromLocationFilters.length > 0 ? fromLocationFilters.join(',') : undefined,
        toLocationIds: toLocationFilters.length > 0 ? toLocationFilters.join(',') : undefined,
        status: statusFilter || undefined,
        startDate: startDate || undefined,
        endDate: endDate || undefined,
        search: debouncedSearchQuery || undefined,
      };

      if (currentLocation) {
        dispatch(fetchTransfersByLocation({ locationId: currentLocation.id, params }));
      } else {
        dispatch(fetchTransfers(params));
      }

      handleCloseReceiveDialog();
    } catch (error) {
      toast.error(error || 'Wystąpił błąd podczas przyjmowania transferu');
    }
  };

  const handleClearFilters = () => {
    setFromLocationFilters([]);
    setToLocationFilters([]);
    setStatusFilter('');
    setStartDate('');
    setEndDate('');
    setSearchQuery('');
  };

  const handleSortChange = (columnId, direction) => {
    setSort({ sortBy: columnId, sortDirection: direction });
  };

  const toggleFromLocationFilter = (locationId) => {
    setFromLocationFilters(prev =>
      prev.includes(locationId)
        ? prev.filter(id => id !== locationId)
        : [...prev, locationId]
    );
  };

  const toggleToLocationFilter = (locationId) => {
    setToLocationFilters(prev =>
      prev.includes(locationId)
        ? prev.filter(id => id !== locationId)
        : [...prev, locationId]
    );
  };

  const getLocationIcon = (location) => {
    return location.type === LOCATION_TYPES.WAREHOUSE || location.type === 'WAREHOUSE' ? (
      <Warehouse size={16} />
    ) : (
      <Store size={16} />
    );
  };

  const columns = [
    {
      id: 'transferNumber',
      label: 'Transfer #',
      sortable: false,
      render: (row) => `#${row.transferNumber || row.id.slice(0, 8)}`,
    },
    {
      id: 'date',
      label: 'Data',
      sortable: true,
      render: (row) => formatDate(row.createdAt, DATE_FORMATS.DISPLAY_WITH_TIME),
    },
    {
      id: 'from',
      label: 'Z',
      sortable: false,
      render: (row) => row.fromLocation?.name || '-',
    },
    {
      id: 'to',
      label: 'Do',
      sortable: false,
      render: (row) => row.toLocation?.name || '-',
    },
    {
      id: 'itemsCount',
      label: 'Produkty',
      sortable: false,
      render: (row) => row.items?.length || 0,
    },
    {
      id: 'totalQuantity',
      label: 'Ilość',
      sortable: false,
      render: (row) => row.items?.reduce((sum, item) => sum + item.quantity, 0) || 0,
    },
    {
      id: 'createdBy',
      label: 'Utworzony przez',
      sortable: false,
      render: (row) => `${row.user?.firstName || ''} ${row.user?.lastName || ''}`.trim() || '-',
    },
    {
      id: 'status',
      label: 'Status',
      sortable: false,
      render: (row) => <TransferStatusChip status={row.status} />,
    },
    {
      id: 'actions',
      label: 'Akcje',
      sortable: false,
      render: (row) => (
        <Box sx={{ display: 'flex', gap: 1 }}>
          {row.status === TRANSFER_STATUS.PENDING && (
            <>
              <Button
                size="small"
                variant="text"
                color="success"
                startIcon={<CheckCircle2 size={14} />}
                onClick={(e) => {
                  e.stopPropagation();
                  handleOpenReceiveDialog(row);
                }}
              >
                Odbierz
              </Button>
              <Button
                size="small"
                variant="text"
                color="error"
                startIcon={<XCircle size={14} />}
                onClick={(e) => {
                  e.stopPropagation();
                  handleOpenConfirm(row, 'CANCEL');
                }}
              >
                Anuluj
              </Button>
            </>
          )}
          {row.status === TRANSFER_STATUS.COMPLETED && (
            <>
              <Button
                size="small"
                variant="text"
                color="primary"
                startIcon={<Edit size={14} />}
                onClick={(e) => {
                  e.stopPropagation();
                  navigate(`/transfers/${row.id}`);
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
                  handleOpenConfirm(row, 'DELETE');
                }}
              >
                Usuń
              </Button>
            </>
          )}
          {(row.status === TRANSFER_STATUS.CANCELLED || row.status === TRANSFER_STATUS.REJECTED) && (
            <Button
              size="small"
              variant="text"
              color="error"
              startIcon={<Trash2 size={14} />}
              onClick={(e) => {
                e.stopPropagation();
                handleOpenConfirm(row, 'DELETE');
              }}
            >
              Usuń
            </Button>
          )}
        </Box>
      ),
    },
  ];

  const getDialogTitle = () => {
    if (confirmDialog.type === 'DELETE') return 'Usuń transfer';
    return 'Anuluj transfer';
  };

  const getDialogMessage = () => {
    const transferNum = confirmDialog.transfer?.transferNumber || confirmDialog.transfer?.id.slice(0, 8);
    if (confirmDialog.type === 'DELETE') {
      return `Czy na pewno chcesz usunąć transfer #${transferNum}? Ta operacja jest NIEODWRACALNA i trwale usunie transfer z systemu.`;
    }
    return `Czy na pewno chcesz anulować transfer #${transferNum}? Ta operacja nie może zostać cofnięta.`;
  };

  const getConfirmText = () => {
    if (confirmDialog.type === 'DELETE') return 'Usuń';
    return 'Anuluj transfer';
  };

  const getConfirmColor = () => {
    return 'error';
  };

  // Get pending transfers - just use the fetched pending transfers
  const pendingTransfers = useMemo(() => {
    return allPendingTransfers.filter(
      (transfer) => transfer.status === TRANSFER_STATUS.PENDING
    );
  }, [allPendingTransfers]);

  // Filter out PENDING from history unless user specifically filtered by that status
  const historyTransfers = useMemo(() => {
    // If user has selected a specific status filter, show all matching transfers (including PENDING if selected)
    if (statusFilter) {
      return transfers;
    }
    // Otherwise, exclude PENDING from history (they're shown in the pending table)
    return transfers.filter(
      (transfer) => transfer.status !== TRANSFER_STATUS.PENDING
    );
  }, [transfers, statusFilter]);

  const pendingColumns = [
    {
      id: 'transferNumber',
      label: 'Transfer #',
      sortable: false,
      render: (row) => `#${row.transferNumber || row.id.slice(0, 8)}`,
    },
    {
      id: 'date',
      label: 'Data',
      sortable: false,
      render: (row) => formatDate(row.createdAt, DATE_FORMATS.DISPLAY_WITH_TIME),
    },
    {
      id: 'from',
      label: 'Z',
      sortable: false,
      render: (row) => row.fromLocation?.name || '-',
    },
    {
      id: 'to',
      label: 'Do',
      sortable: false,
      render: (row) => row.toLocation?.name || '-',
    },
    {
      id: 'itemsCount',
      label: 'Produkty',
      sortable: false,
      render: (row) => row.items?.length || 0,
    },
    {
      id: 'totalQuantity',
      label: 'Ilość',
      sortable: false,
      render: (row) => row.items?.reduce((sum, item) => sum + item.quantity, 0) || 0,
    },
    {
      id: 'createdBy',
      label: 'Utworzony przez',
      sortable: false,
      render: (row) => `${row.user?.firstName || ''} ${row.user?.lastName || ''}`.trim() || '-',
    },
    {
      id: 'status',
      label: 'Status',
      sortable: false,
      render: (row) => <TransferStatusChip status={row.status} />,
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
            color="success"
            startIcon={<CheckCircle2 size={14} />}
            onClick={(e) => {
              e.stopPropagation();
              handleOpenReceiveDialog(row);
            }}
          >
            Odbierz
          </Button>
          <Button
            size="small"
            variant="text"
            color="error"
            startIcon={<XCircle size={14} />}
            onClick={(e) => {
              e.stopPropagation();
              handleOpenConfirm(row, 'CANCEL');
            }}
          >
            Anuluj
          </Button>
        </Box>
      ),
    },
  ];

  if (!canViewTransfers) {
    return (
      <Container maxWidth="xl">
        <Paper sx={{ p: 3, textAlign: 'center' }}>
          <Typography variant="h6" color="error">
            Dostęp odmówiony
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Nie masz uprawnień do przeglądania transferów.
          </Typography>
        </Paper>
      </Container>
    );
  }

  return (
    <Container maxWidth="xl">
      <PageHeader
        title={currentLocation ? `Transfery - ${currentLocation.name}` : "Transfery"}
        subtitle="Zarządzaj transferami towaru między lokalizacjami"
        breadcrumbs={[
          { label: 'Panel', to: '/' },
          { label: 'Transfery' },
        ]}
        actions={[
          {
            label: 'Nowy transfer',
            icon: <Plus size={20} />,
            onClick: () => navigate('/transfers/create'),
            variant: 'contained',
          },
        ]}
      />

      {/* Pending Transfers Section */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
          Bieżące transfery oczekujące
        </Typography>
        <DataTable
          columns={pendingColumns}
          data={pendingTransfers}
          loading={pendingLoading}
          onRowClick={(row) => navigate(`/transfers/${row.id}`)}
          emptyMessage="Brak oczekujących transferów"
          pagination={null}
        />
      </Paper>

      {/* Transfer History Section */}
      <Paper sx={{ p: 3 }}>
        <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>
          Historia transferów
        </Typography>

        {/* Location, Status and Date Filters */}
        <Box sx={{ mb: 3, display: 'flex', gap: 4, flexWrap: 'wrap' }}>
          {/* Source Locations */}
          <Box>
            <Typography variant="subtitle2" sx={{ mb: 1.5, fontWeight: 600 }}>
              Lokalizacja źródłowa
            </Typography>
            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
              {locations.map((loc) => (
                <Button
                  key={`from-${loc.id}`}
                  variant={fromLocationFilters.includes(loc.id) ? 'contained' : 'outlined'}
                  size="small"
                  onClick={() => toggleFromLocationFilter(loc.id)}
                  sx={{ textTransform: 'none' }}
                >
                  {loc.name}
                </Button>
              ))}
            </Box>
          </Box>

          {/* Destination Locations */}
          <Box>
            <Typography variant="subtitle2" sx={{ mb: 1.5, fontWeight: 600 }}>
              Lokalizacja docelowa
            </Typography>
            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
              {locations.map((loc) => (
                <Button
                  key={`to-${loc.id}`}
                  variant={toLocationFilters.includes(loc.id) ? 'contained' : 'outlined'}
                  size="small"
                  onClick={() => toggleToLocationFilter(loc.id)}
                  sx={{ textTransform: 'none' }}
                >
                  {loc.name}
                </Button>
              ))}
            </Box>
          </Box>

          {/* Status Filter */}
          <Box>
            <Typography variant="subtitle2" sx={{ mb: 1.5, fontWeight: 600 }}>
              Status
            </Typography>
            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
              {Object.values(TRANSFER_STATUS).map((status) => (
                <Button
                  key={status}
                  variant={statusFilter === status ? 'contained' : 'outlined'}
                  size="small"
                  onClick={() => setStatusFilter(statusFilter === status ? '' : status)}
                  sx={{ textTransform: 'none' }}
                >
                  {TRANSFER_STATUS_LABELS[status]}
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
                onChange={(e) => setStartDate(e.target.value)}
                size="small"
                InputLabelProps={{ shrink: true }}
                sx={{ minWidth: 150 }}
                error={startDate && endDate && startDate > endDate}
              />
              <TextField
                label="Do"
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                size="small"
                InputLabelProps={{ shrink: true }}
                sx={{ minWidth: 150 }}
                error={startDate && endDate && startDate > endDate}
              />
              {(fromLocationFilters.length > 0 || toLocationFilters.length > 0 || statusFilter || startDate || endDate || searchQuery) && (
                <Button variant="outlined" size="small" onClick={handleClearFilters}>
                  Wyczyść filtry
                </Button>
              )}
            </Box>
          </Box>
        </Box>

        {/* Search Bar */}
        <Box sx={{ mb: 3 }}>
          <TextField
            fullWidth
            size="small"
            placeholder="Wyszukaj po numerze transferu, nazwie lokalizacji lub użytkowniku..."
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

        {/* Tabela transferów */}
        <DataTable
          columns={columns}
          data={historyTransfers}
          loading={loading}
          pagination={{
            page: pagination.page,
            total: paginationData?.totalElements || 0,
            size: pagination.size,
          }}
          sort={sort}
          onSortChange={handleSortChange}
          onPageChange={pagination.handlePageChange}
          onRowsPerPageChange={pagination.handleRowsPerPageChange}
          onRowClick={(row) => navigate(`/transfers/${row.id}`)}
          emptyMessage="Nie znaleziono transferów. Spróbuj dostosować filtry."
        />
      </Paper>

      {/* Dialog potwierdzenia */}
      <ConfirmDialog
        open={confirmDialog.open}
        onClose={handleCloseConfirm}
        onConfirm={handleConfirmAction}
        title={getDialogTitle()}
        message={getDialogMessage()}
        confirmText={getConfirmText()}
        confirmColor={getConfirmColor()}
      />

      {/* Dialog częściowego odbioru transferu */}
      <ConfirmTransferDialog
        open={confirmTransferDialog.open}
        onClose={handleCloseReceiveDialog}
        onConfirm={handleConfirmTransfer}
        transfer={confirmTransferDialog.transfer}
        loading={loading}
      />
    </Container>
  );
}

export default TransfersListPage;
