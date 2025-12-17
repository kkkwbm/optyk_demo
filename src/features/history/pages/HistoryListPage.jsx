import { useEffect, useState, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import { RotateCcw, MoreVertical, Trash2 } from 'lucide-react';
import { format } from 'date-fns';
import { pl } from 'date-fns/locale';
import toast from 'react-hot-toast';
import PageHeader from '../../../shared/components/PageHeader';
import DataTable from '../../../shared/components/DataTable';
import ConfirmDialog from '../../../shared/components/ConfirmDialog';
import {
  fetchHistory,
  revertOperation,
  deleteHistory,
  deleteAllHistory,
  selectHistoryItems,
  selectHistoryLoading,
  selectHistoryPagination,
} from '../historySlice';
import { fetchActiveLocations, selectCurrentLocation } from '../../locations/locationsSlice';
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

  const historyItems = useSelector(selectHistoryItems);
  const loading = useSelector(selectHistoryLoading);
  const paginationData = useSelector(selectHistoryPagination);
  const currentLocation = useSelector(selectCurrentLocation);
  const currentUser = useSelector(selectUser);

  const [operationFilters, setOperationFilters] = useState([]); // Array of selected operation types
  const [entityFilters, setEntityFilters] = useState([]); // Array of selected entity types
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [confirmDialog, setConfirmDialog] = useState({ open: false, item: null, action: null });
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedRow, setSelectedRow] = useState(null);
  const [descriptionDialog, setDescriptionDialog] = useState({ open: false, description: '' });

  const pagination = usePagination({
    defaultSize: 20,
  });

  useEffect(() => {
    if (paginationData) {
      pagination.updatePagination(paginationData);
    }
  }, [paginationData]);

  useEffect(() => {
    dispatch(fetchActiveLocations());
  }, [dispatch]);

  useEffect(() => {
    const params = {
      page: pagination.page,
      size: pagination.size,
      operationTypes: operationFilters.length > 0 ? operationFilters.join(',') : undefined,
      entityTypes: entityFilters.length > 0 ? entityFilters.join(',') : undefined,
      locationId: currentLocation?.id && currentLocation.id !== 'ALL_STORES' ? currentLocation.id : undefined,
      startDate: startDate || undefined,
      endDate: endDate || undefined,
    };
    dispatch(fetchHistory(params));
  }, [dispatch, pagination.page, pagination.size, operationFilters, entityFilters, currentLocation, startDate, endDate]);

  const hasPermission = (permission) => {
    return PERMISSIONS[permission]?.includes(currentUser?.role);
  };

  // Check if user can view history:
  // 1. ADMIN/OWNER can view all history
  // 2. EMPLOYEE can view history if they have HISTORY tab access for the current location
  const canViewHistory = useMemo(() => {
    // ADMIN and OWNER have full access
    if (hasPermission('VIEW_HISTORY_ALL')) {
      return true;
    }

    // EMPLOYEE: check permissions based on current location
    if (currentUser?.userLocations && currentUser.userLocations.length > 0) {
      // If "All Stores" is selected, check if user has HISTORY access in at least one location
      if (!currentLocation || currentLocation.id === 'ALL_STORES') {
        return currentUser.userLocations.some(
          (userLocation) =>
            // Empty/null allowedTabs means full access to all tabs
            !userLocation.allowedTabs ||
            userLocation.allowedTabs.length === 0 ||
            userLocation.allowedTabs.includes('HISTORY')
        );
      }

      // If specific location is selected, check if user has HISTORY access for THAT location
      return currentUser.userLocations.some(
        (userLocation) =>
          userLocation.location.id === currentLocation.id &&
          // Empty/null allowedTabs means full access to all tabs
          (!userLocation.allowedTabs ||
           userLocation.allowedTabs.length === 0 ||
           userLocation.allowedTabs.includes('HISTORY'))
      );
    }

    return false;
  }, [currentUser, currentLocation]);

  const handleOpenConfirm = (item, action) => {
    setConfirmDialog({ open: true, item, action });
  };

  const handleCloseConfirm = () => {
    setConfirmDialog({ open: false, item: null, action: null });
  };

  const handleOpenDescription = (description) => {
    setDescriptionDialog({ open: true, description });
  };

  const handleCloseDescription = () => {
    setDescriptionDialog({ open: false, description: '' });
  };

  const handleConfirmAction = async () => {
    const { item, action } = confirmDialog;
    try {
      if (action === 'delete') {
        await dispatch(deleteHistory(item.id)).unwrap();
        toast.success('Wpis historii został usunięty');
      } else if (action === 'deleteAll') {
        // Don't send locationId if it's ALL_STORES (backend expects UUID or null)
        const locationId = currentLocation?.id && currentLocation.id !== 'ALL_STORES'
          ? currentLocation.id
          : undefined;
        const result = await dispatch(deleteAllHistory(locationId)).unwrap();
        toast.success(result.message || 'Cała historia została usunięta');
        dispatch(fetchHistory({ page: 0, size: pagination.size, locationId }));
      } else if (action === 'revert') {
        await dispatch(revertOperation({ id: item.id, reason: 'Manual revert by user' })).unwrap();
        toast.success('Operacja została cofnięta');
        dispatch(fetchHistory({ page: pagination.page, size: pagination.size }));
      }
    } catch (error) {
      toast.error(error || 'Nie udało się wykonać operacji');
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

  const handleDelete = () => {
    if (selectedRow) {
      handleOpenConfirm(selectedRow, 'delete');
    }
    handleMenuClose();
  };

  const handleRevert = () => {
    if (selectedRow) {
      handleOpenConfirm(selectedRow, 'revert');
    }
    handleMenuClose();
  };

  const handleDeleteAll = () => {
    handleOpenConfirm(null, 'deleteAll');
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
      case OPERATION_TYPES.TRANSFER_REJECTED:
      case OPERATION_TYPES.TRANSFER_CANCELLED:
        return 'error';
      case OPERATION_TYPES.RESTORE:
      case OPERATION_TYPES.ACTIVATE:
      case OPERATION_TYPES.TRANSFER_CONFIRMED:
        return 'success';
      case OPERATION_TYPES.TRANSFER:
      case OPERATION_TYPES.TRANSFER_INITIATED:
      case OPERATION_TYPES.SALE:
        return 'primary';
      case OPERATION_TYPES.REVERT:
      case OPERATION_TYPES.RETURN:
        return 'warning';
      default:
        return 'default';
    }
  };

  const columns = [
    {
      id: 'operation',
      label: 'Operacja',
      sortable: true,
      render: (row) => (
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
      render: (row) => (
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
      render: (row) => row.userFullName || '-',
    },
    {
      id: 'operationTimestamp',
      label: 'Data i godzina',
      sortable: true,
      render: (row) => {
        try {
          const value = row.operationTimestamp;
          if (!value) return '-';
          const date = new Date(value);
          if (isNaN(date.getTime())) return '-';
          return format(date, DATE_FORMATS.DISPLAY_WITH_TIME, { locale: pl });
        } catch (error) {
          return '-';
        }
      },
    },
    {
      id: 'location',
      label: 'Lokalizacja',
      sortable: false,
      render: (row) => row.location?.name || '-',
    },
    {
      id: 'reason',
      label: 'Opis',
      sortable: false,
      render: (row) => (
        <Typography
          variant="body2"
          onClick={() => row.reason && handleOpenDescription(row.reason)}
          sx={{
            maxWidth: 300,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
            cursor: row.reason ? 'pointer' : 'default',
            '&:hover': row.reason ? { textDecoration: 'underline', color: 'primary.main' } : {}
          }}
        >
          {row.reason || '-'}
        </Typography>
      ),
    },
    {
      id: 'actions',
      label: 'Akcje',
      sortable: false,
      render: (row) => (
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
          <Box sx={{ marginLeft: 'auto' }}>
            <Button
              variant="contained"
              color="error"
              onClick={handleDeleteAll}
              startIcon={<Trash2 size={18} />}
            >
              {currentLocation ? `Usuń całą historię z ${currentLocation.name}` : 'Usuń całą historię'}
            </Button>
          </Box>
        </Box>

        {/* History Table */}
        <DataTable
          columns={columns}
          data={historyItems}
          loading={loading}
          pagination={{
            page: pagination.page,
            totalElements: pagination.totalElements,
            size: pagination.size,
          }}
          onPageChange={pagination.setPage}
          onRowsPerPageChange={pagination.setSize}
          emptyMessage="Nie znaleziono rekordów historii. Spróbuj dostosować filtry."
        />
      </Paper>

      {/* Confirm Dialog */}
      <ConfirmDialog
        open={confirmDialog.open}
        onClose={handleCloseConfirm}
        onConfirm={handleConfirmAction}
        title={
          confirmDialog.action === 'deleteAll'
            ? 'Potwierdź usunięcie całej historii'
            : confirmDialog.action === 'delete'
            ? 'Potwierdź usunięcie'
            : 'Potwierdź cofnięcie operacji'
        }
        message={
          confirmDialog.action === 'deleteAll'
            ? currentLocation
              ? `Czy na pewno chcesz usunąć CAŁĄ historię z lokalizacji "${currentLocation.name}"? Ta operacja jest NIEODWRACALNA i usunie wszystkie wpisy historii z tej lokalizacji.`
              : 'Czy na pewno chcesz usunąć CAŁĄ historię ze WSZYSTKICH lokalizacji? Ta operacja jest NIEODWRACALNA i usunie wszystkie wpisy historii w systemie.'
            : confirmDialog.action === 'delete'
            ? 'Czy na pewno chcesz usunąć ten wpis z historii? Ta operacja jest nieodwracalna.'
            : 'Czy na pewno chcesz cofnąć tę operację? To utworzy wpis kompensujący, który odwróci zmiany. Oryginalny wpis pozostanie w historii dla celów audytu.'
        }
        confirmText={
          confirmDialog.action === 'deleteAll'
            ? 'Usuń całą historię'
            : confirmDialog.action === 'delete'
            ? 'Usuń'
            : 'Cofnij operację'
        }
        confirmColor={confirmDialog.action === 'deleteAll' || confirmDialog.action === 'delete' ? 'error' : 'warning'}
      />

      {/* Description Dialog */}
      <Dialog
        open={descriptionDialog.open}
        onClose={handleCloseDescription}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Pełny opis operacji</DialogTitle>
        <DialogContent>
          <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
            {descriptionDialog.description}
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDescription} variant="contained">
            Zamknij
          </Button>
        </DialogActions>
      </Dialog>

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
        <MenuItem onClick={handleDelete} sx={{ color: 'error.main' }}>
          <Trash2 size={16} style={{ marginRight: 8 }} />
          Usuń
        </MenuItem>
        <MenuItem onClick={handleRevert} sx={{ color: 'warning.main' }}>
          <RotateCcw size={16} style={{ marginRight: 8 }} />
          Cofnij operację
        </MenuItem>
      </Menu>
    </Container>
  );
}

export default HistoryListPage;
