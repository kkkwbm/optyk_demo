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
  Grid,
  Typography,
} from '@mui/material';
import { Plus, Eye, XCircle, Warehouse, Store } from 'lucide-react';
import { format } from 'date-fns';
import toast from 'react-hot-toast';
import PageHeader from '../../../shared/components/PageHeader';
import DataTable from '../../../shared/components/DataTable';
import ConfirmDialog from '../../../shared/components/ConfirmDialog';
import TransferStatusChip from '../components/TransferStatusChip';
import {
  fetchTransfers,
  fetchTransfersByLocation,
  cancelTransfer,
  selectTransfers,
  selectTransfersLoading,
  selectTransfersPagination,
} from '../transfersSlice';
import { fetchActiveLocations, selectActiveLocations, selectCurrentLocation } from '../../locations/locationsSlice';
import { usePagination } from '../../../hooks/usePagination';
import {
  TRANSFER_STATUS,
  TRANSFER_STATUS_LABELS,
  DATE_FORMATS,
  LOCATION_TYPES,
} from '../../../constants';

function TransfersListPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const transfers = useSelector(selectTransfers);
  const loading = useSelector(selectTransfersLoading);
  const paginationData = useSelector(selectTransfersPagination);
  const locations = useSelector(selectActiveLocations);
  const currentLocation = useSelector(selectCurrentLocation);

  const [fromLocationFilters, setFromLocationFilters] = useState([]); // Array of selected source locations
  const [toLocationFilters, setToLocationFilters] = useState([]); // Array of selected destination locations
  const [statusFilter, setStatusFilter] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [confirmDialog, setConfirmDialog] = useState({ open: false, transfer: null });

  const pagination = usePagination({
    total: paginationData?.totalElements || 0,
    defaultSize: 20,
  });

  useEffect(() => {
    dispatch(fetchActiveLocations());
  }, [dispatch]);

  useEffect(() => {
    const params = {
      page: pagination.page,
      size: pagination.size,
      fromLocationIds: fromLocationFilters.length > 0 ? fromLocationFilters.join(',') : undefined,
      toLocationIds: toLocationFilters.length > 0 ? toLocationFilters.join(',') : undefined,
      status: statusFilter || undefined,
      startDate: startDate || undefined,
      endDate: endDate || undefined,
    };

    if (currentLocation) {
      dispatch(fetchTransfersByLocation({ locationId: currentLocation.id, params }));
    } else {
      dispatch(fetchTransfers(params));
    }
  }, [dispatch, pagination.page, pagination.size, fromLocationFilters, toLocationFilters, statusFilter, startDate, endDate, currentLocation]);

  const handleOpenConfirm = (transfer) => {
    setConfirmDialog({ open: true, transfer });
  };

  const handleCloseConfirm = () => {
    setConfirmDialog({ open: false, transfer: null });
  };

  const handleConfirmCancel = async () => {
    const { transfer } = confirmDialog;
    try {
      await dispatch(cancelTransfer(transfer.id)).unwrap();
      toast.success('Transfer anulowany pomyślnie');
      dispatch(fetchTransfers({ page: pagination.page, size: pagination.size }));
    } catch (error) {
      toast.error(error || 'Nie udało się anulować transferu');
    }
    handleCloseConfirm();
  };

  const handleClearFilters = () => {
    setFromLocationFilters([]);
    setToLocationFilters([]);
    setStatusFilter('');
    setStartDate('');
    setEndDate('');
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

  const getStatusColor = (status) => {
    switch (status) {
      case TRANSFER_STATUS.PENDING:
        return 'warning';
      case TRANSFER_STATUS.IN_TRANSIT:
        return 'info';
      case TRANSFER_STATUS.COMPLETED:
        return 'success';
      case TRANSFER_STATUS.CANCELLED:
        return 'error';
      default:
        return 'default';
    }
  };

  const columns = [
    {
      id: 'transferNumber',
      label: 'Transfer #',
      sortable: true,
      render: (row) => `#${row.transferNumber || row.id.slice(0, 8)}`,
    },
    {
      id: 'date',
      label: 'Data',
      sortable: true,
      render: (row) => format(new Date(row.createdAt), DATE_FORMATS.DISPLAY_WITH_TIME),
    },
    {
      id: 'from',
      label: 'Z',
      sortable: true,
      render: (row) => row.fromLocation?.name || '-',
    },
    {
      id: 'to',
      label: 'Do',
      sortable: true,
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
      sortable: true,
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
            startIcon={<Eye size={14} />}
            onClick={(e) => {
              e.stopPropagation();
              navigate(`/transfers/${row.id}`);
            }}
          >
            Wyświetl
          </Button>
          {(row.status === TRANSFER_STATUS.PENDING || row.status === TRANSFER_STATUS.IN_TRANSIT) && (
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
              Anuluj
            </Button>
          )}
        </Box>
      ),
    },
  ];

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

      <Paper sx={{ p: 3 }}>
        {/* Location Filters in Two Columns */}
        <Grid container spacing={3} sx={{ mb: 3 }}>
          {/* Source Locations Column */}
          <Grid item xs={12} md={6}>
            <Typography variant="subtitle2" sx={{ mb: 1.5, fontWeight: 600 }}>
              Lokalizacja źródłowa
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              {locations.map((location) => (
                <Button
                  key={`from-${location.id}`}
                  variant={fromLocationFilters.includes(location.id) ? 'contained' : 'outlined'}
                  size="small"
                  startIcon={getLocationIcon(location)}
                  onClick={() => toggleFromLocationFilter(location.id)}
                  sx={{
                    textTransform: 'none',
                    justifyContent: 'flex-start',
                  }}
                >
                  {location.name}
                </Button>
              ))}
            </Box>
          </Grid>

          {/* Destination Locations Column */}
          <Grid item xs={12} md={6}>
            <Typography variant="subtitle2" sx={{ mb: 1.5, fontWeight: 600 }}>
              Lokalizacja docelowa
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              {locations.map((location) => (
                <Button
                  key={`to-${location.id}`}
                  variant={toLocationFilters.includes(location.id) ? 'contained' : 'outlined'}
                  size="small"
                  startIcon={getLocationIcon(location)}
                  onClick={() => toggleToLocationFilter(location.id)}
                  sx={{
                    textTransform: 'none',
                    justifyContent: 'flex-start',
                  }}
                >
                  {location.name}
                </Button>
              ))}
            </Box>
          </Grid>
        </Grid>

        {/* Status and Date Filters */}
        <Box sx={{ mb: 3, display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'center' }}>
          <TextField
            select
            label="Status"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            size="small"
            sx={{ minWidth: 150 }}
          >
            <MenuItem value="">Wszystkie statusy</MenuItem>
            {Object.values(TRANSFER_STATUS).map((status) => (
              <MenuItem key={status} value={status}>
                {TRANSFER_STATUS_LABELS[status]}
              </MenuItem>
            ))}
          </TextField>
          <TextField
            label="Data rozpoczęcia"
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            size="small"
            InputLabelProps={{ shrink: true }}
            sx={{ minWidth: 150 }}
          />
          <TextField
            label="Data zakończenia"
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            size="small"
            InputLabelProps={{ shrink: true }}
            sx={{ minWidth: 150 }}
          />
          {(fromLocationFilters.length > 0 || toLocationFilters.length > 0 || statusFilter || startDate || endDate) && (
            <Button variant="outlined" onClick={handleClearFilters}>
              Wyczyść filtry
            </Button>
          )}
        </Box>

        {/* Tabela transferów */}
        <DataTable
          columns={columns}
          data={transfers}
          loading={loading}
          pagination={{
            page: pagination.page,
            total: paginationData?.totalElements || 0,
            size: pagination.size,
          }}
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
        onConfirm={handleConfirmCancel}
        title="Anuluj transfer"
        message={`Czy na pewno chcesz anulować transfer #${confirmDialog.transfer?.transferNumber || confirmDialog.transfer?.id.slice(0, 8)}? Ta operacja nie może zostać cofnięta.`}
        confirmText="Anuluj transfer"
        confirmColor="error"
      />
    </Container>
  );
}

export default TransfersListPage;
