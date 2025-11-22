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
  ButtonGroup,
  Typography,
  IconButton,
  Menu,
} from '@mui/material';
import { Eye, RotateCcw, MoreVertical, Pencil, Trash2 } from 'lucide-react';
import { format } from 'date-fns';
import { pl } from 'date-fns/locale';
import toast from 'react-hot-toast';
import PageHeader from '../../../shared/components/PageHeader';
import DataTable from '../../../shared/components/DataTable';
import ConfirmDialog from '../../../shared/components/ConfirmDialog';
import {
  fetchHistory,
  revertOperation,
  selectHistoryItems,
  selectHistoryLoading,
  selectHistoryPagination,
} from '../historySlice';
import { fetchActiveLocations, selectActiveLocations, selectCurrentLocation } from '../../locations/locationsSlice';
import { selectUser } from '../../auth/authSlice';
import { usePagination } from '../../../hooks/usePagination';
import {
  OPERATION_TYPES,
  OPERATION_TYPE_LABELS,
  ENTITY_TYPES,
  ENTITY_TYPE_LABELS,
  DATE_FORMATS,
  PERMISSIONS,
  LOCATION_TYPES,
} from '../../../constants';

function HistoryListPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const historyItems = useSelector(selectHistoryItems);
  const loading = useSelector(selectHistoryLoading);
  const paginationData = useSelector(selectHistoryPagination);
  const currentLocation = useSelector(selectCurrentLocation);
  const currentUser = useSelector(selectUser);

  const [operationFilters, setOperationFilters] = useState([]); // Array of selected operation types
  const [entityFilters, setEntityFilters] = useState([]); // Array of selected entity types
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [confirmDialog, setConfirmDialog] = useState({ open: false, item: null });
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedRow, setSelectedRow] = useState(null);

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
      operationTypes: operationFilters.length > 0 ? operationFilters.join(',') : undefined,
      entityTypes: entityFilters.length > 0 ? entityFilters.join(',') : undefined,
      locationId: currentLocation?.id || undefined,
      startDate: startDate || undefined,
      endDate: endDate || undefined,
    };
    dispatch(fetchHistory(params));
  }, [dispatch, pagination.page, pagination.size, operationFilters, entityFilters, currentLocation, startDate, endDate]);

  const hasPermission = (permission) => {
    return PERMISSIONS[permission]?.includes(currentUser?.role);
  };

  const canViewHistory = hasPermission('VIEW_HISTORY_ALL');

  const handleOpenConfirm = (item) => {
    setConfirmDialog({ open: true, item });
  };

  const handleCloseConfirm = () => {
    setConfirmDialog({ open: false, item: null });
  };

  const handleConfirmRevert = async () => {
    const { item } = confirmDialog;
    try {
      await dispatch(revertOperation(item.id)).unwrap();
      toast.success('Operacja została cofnięta');
      dispatch(fetchHistory({ page: pagination.page, size: pagination.size }));
    } catch (error) {
      toast.error(error || 'Nie udało się cofnąć operacji');
    }
    handleCloseConfirm();
  };

  const handleClearFilters = () => {
    setOperationFilters([]);
    setEntityFilters([]);
    setStartDate('');
    setEndDate('');
  };

  const handleMenuClick = (event, row) => {
    event.stopPropagation();
    setAnchorEl(event.currentTarget);
    setSelectedRow(row);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedRow(null);
  };

  const handleEdit = () => {
    if (selectedRow) {
      navigate(`/history/${selectedRow.id}`);
    }
    handleMenuClose();
  };

  const handleDelete = () => {
    if (selectedRow) {
      handleOpenConfirm(selectedRow);
    }
    handleMenuClose();
  };

  const toggleOperationFilter = (operation) => {
    setOperationFilters(prev =>
      prev.includes(operation)
        ? prev.filter(op => op !== operation)
        : [...prev, operation]
    );
  };

  const toggleEntityFilter = (entity) => {
    setEntityFilters(prev =>
      prev.includes(entity)
        ? prev.filter(ent => ent !== entity)
        : [...prev, entity]
    );
  };

  // Relevant operation types for history page
  const relevantOperations = [
    { value: OPERATION_TYPES.CREATE, label: 'Dodanie' },
    { value: OPERATION_TYPES.UPDATE, label: 'Edycja' },
    { value: OPERATION_TYPES.DELETE, label: 'Usunięcie' },
    { value: OPERATION_TYPES.SALE, label: 'Sprzedaż' },
    { value: OPERATION_TYPES.RETURN, label: 'Zwrot' },
    { value: OPERATION_TYPES.TRANSFER, label: 'Transfer' },
  ];

  // Product entity types
  const productEntityTypes = [
    { value: ENTITY_TYPES.FRAME, label: 'Oprawki' },
    { value: ENTITY_TYPES.CONTACT_LENS, label: 'Szkła kontaktowe' },
    { value: ENTITY_TYPES.SOLUTION, label: 'Płyny' },
    { value: ENTITY_TYPES.OTHER, label: 'Inne' },
  ];

  const getOperationColor = (type) => {
    switch (type) {
      case OPERATION_TYPES.CREATE:
        return 'success';
      case OPERATION_TYPES.UPDATE:
        return 'info';
      case OPERATION_TYPES.DELETE:
      case OPERATION_TYPES.DEACTIVATE:
        return 'error';
      case OPERATION_TYPES.RESTORE:
      case OPERATION_TYPES.ACTIVATE:
        return 'success';
      case OPERATION_TYPES.TRANSFER:
      case OPERATION_TYPES.SALE:
        return 'primary';
      default:
        return 'default';
    }
  };

  const columns = [
    {
      id: 'operation',
      label: 'Operacja',
      sortable: true,
      render: (value, row) => (
        <Chip
          label={OPERATION_TYPE_LABELS[row.operationType]}
          size="small"
          color={getOperationColor(row.operationType)}
        />
      ),
    },
    {
      id: 'entity',
      label: 'Encja',
      sortable: true,
      render: (value, row) => (
        <Chip
          label={ENTITY_TYPE_LABELS[row.entityType] || row.entityType}
          size="small"
          variant="outlined"
        />
      ),
    },
    {
      id: 'userFullName',
      label: 'Użytkownik',
      sortable: false,
      render: (value) => value || '-',
    },
    {
      id: 'operationTimestamp',
      label: 'Data i godzina',
      sortable: true,
      render: (value) => {
        try {
          if (!value) return '-';
          const date = new Date(value);
          if (isNaN(date.getTime())) return '-';
          return format(date, DATE_FORMATS.DISPLAY_WITH_TIME, { locale: pl });
        } catch (error) {
          console.error('Error formatting date:', value, error);
          return '-';
        }
      },
    },
    {
      id: 'location',
      label: 'Lokalizacja',
      sortable: false,
      render: (value, row) => row.location?.name || '-',
    },
    {
      id: 'actions',
      label: 'Akcje',
      sortable: false,
      render: (value, row) => (
        <IconButton
          size="small"
          onClick={(e) => handleMenuClick(e, row)}
        >
          <MoreVertical size={18} />
        </IconButton>
      ),
    },
  ];

  if (!canViewHistory) {
    return (
      <Container maxWidth="xl">
        <Paper sx={{ p: 3, textAlign: 'center' }}>
          <Typography variant="h6" color="error">
            Dostęp odmówiony
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Nie masz uprawnień do przeglądania historii operacji.
          </Typography>
        </Paper>
      </Container>
    );
  }

  return (
    <Container maxWidth="xl">
      <PageHeader
        title="Historia operacji"
        subtitle="Przeglądaj i zarządzaj wszystkimi operacjami systemu"
        breadcrumbs={[
          { label: 'Pulpit', to: '/' },
          { label: 'Historia' },
        ]}
      />

      <Paper sx={{ p: 3 }}>
        {/* Operation Type Filters */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="subtitle2" sx={{ mb: 1.5, fontWeight: 600 }}>
            Typ operacji
          </Typography>
          <Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap' }}>
            {relevantOperations.map((operation) => (
              <Button
                key={operation.value}
                variant={operationFilters.includes(operation.value) ? 'contained' : 'outlined'}
                size="small"
                onClick={() => toggleOperationFilter(operation.value)}
                sx={{ textTransform: 'none' }}
              >
                {operation.label}
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
                variant={entityFilters.includes(entity.value) ? 'contained' : 'outlined'}
                size="small"
                onClick={() => toggleEntityFilter(entity.value)}
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
          {(operationFilters.length > 0 || entityFilters.length > 0 || startDate || endDate) && (
            <Button variant="outlined" onClick={handleClearFilters}>
              Wyczyść filtry
            </Button>
          )}
        </Box>

        {/* History Table */}
        <DataTable
          columns={columns}
          data={historyItems}
          loading={loading}
          pagination={{
            page: pagination.page,
            total: paginationData?.totalElements || 0,
            size: pagination.size,
          }}
          onPageChange={pagination.handlePageChange}
          onRowsPerPageChange={pagination.handleRowsPerPageChange}
          onRowClick={(row) => navigate(`/history/${row.id}`)}
          emptyMessage="Nie znaleziono rekordów historii. Spróbuj dostosować filtry."
        />
      </Paper>

      {/* Confirm Dialog */}
      <ConfirmDialog
        open={confirmDialog.open}
        onClose={handleCloseConfirm}
        onConfirm={handleConfirmRevert}
        title="Potwierdź cofnięcie"
        message={`Czy na pewno chcesz cofnąć tę operację ${confirmDialog.item?.operationType?.toLowerCase()}? To cofnie zmiany.`}
        confirmText="Cofnij"
        confirmColor="warning"
      />

      {/* Actions Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
      >
        <MenuItem onClick={handleEdit}>
          <Pencil size={16} style={{ marginRight: 8 }} />
          Edit
        </MenuItem>
        <MenuItem onClick={handleDelete} sx={{ color: 'error.main' }}>
          <Trash2 size={16} style={{ marginRight: 8 }} />
          Delete
        </MenuItem>
      </Menu>
    </Container>
  );
}

export default HistoryListPage;
