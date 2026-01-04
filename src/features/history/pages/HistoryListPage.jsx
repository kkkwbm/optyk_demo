import { useEffect, useState, useMemo } from 'react';
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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  InputAdornment,
  Checkbox,
} from '@mui/material';
import { RotateCcw, MoreVertical, Trash2, ArrowRight, Search, CheckSquare, X } from 'lucide-react';
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
  deleteManyHistory,
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
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState('');
  const [confirmDialog, setConfirmDialog] = useState({ open: false, item: null, action: null });
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedRow, setSelectedRow] = useState(null);
  const [descriptionDialog, setDescriptionDialog] = useState({ open: false, description: '' });
  const [selectionMode, setSelectionMode] = useState(false);
  const [selectedItems, setSelectedItems] = useState([]);

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

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  useEffect(() => {
    // Date validation: ensure startDate is not after endDate
    if (startDate && endDate && startDate > endDate) {
      return; // Don't fetch if dates are invalid
    }

    // Determine locationId and locationType based on current location selection
    // - ALL_STORES: only stores (locationType: STORE)
    // - ALL_WAREHOUSES: only warehouses (locationType: WAREHOUSE)
    // - Specific location ID: filter by that location
    // - null/undefined: all locations (no filter)
    let locationId = undefined;
    let locationType = undefined;

    if (currentLocation?.id) {
      if (currentLocation.id === 'ALL_STORES') {
        locationType = 'STORE';
      } else if (currentLocation.id === 'ALL_WAREHOUSES') {
        locationType = 'WAREHOUSE';
      } else {
        locationId = currentLocation.id;
      }
    }

    const params = {
      page: pagination.page,
      size: pagination.size,
      operationTypes: operationFilters.length > 0 ? operationFilters.join(',') : undefined,
      entityTypes: entityFilters.length > 0 ? entityFilters.join(',') : undefined,
      locationId,
      locationType,
      startDate: startDate || undefined,
      endDate: endDate || undefined,
      search: debouncedSearchQuery || undefined,
    };
    dispatch(fetchHistory(params));
  }, [dispatch, pagination.page, pagination.size, operationFilters, entityFilters, currentLocation, startDate, endDate, debouncedSearchQuery]);

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

  const handleConfirmAction = async (reason) => {
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
      } else if (action === 'deleteMany') {
        const result = await dispatch(deleteManyHistory(selectedItems)).unwrap();
        toast.success(result.message || `Usunięto ${selectedItems.length} wybranych wpisów`);
        setSelectedItems([]);
        setSelectionMode(false);
      } else if (action === 'revert') {
        await dispatch(revertOperation({ id: item.id, reason })).unwrap();
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
    setSearchQuery('');
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

  const handleGoTo = () => {
    if (selectedRow) {
      const path = getEntityNavigationPath(selectedRow.entityType, selectedRow.entityId);
      if (path) {
        navigate(path);
      } else {
        toast.error('Nie można przejść do tego elementu');
      }
    }
    handleMenuClose();
  };

  const getEntityNavigationPath = (entityType, entityId) => {
    // Map entity types to navigation paths
    switch (entityType) {
      case ENTITY_TYPES.FRAME:
      case ENTITY_TYPES.CONTACT_LENS:
      case ENTITY_TYPES.SOLUTION:
      case ENTITY_TYPES.OTHER:
      case ENTITY_TYPES.OTHER_PRODUCT:
      case ENTITY_TYPES.SUNGLASSES:
        return `/inventory/${entityId}?type=${entityType}`;
      case ENTITY_TYPES.SALE:
        return `/sales/${entityId}`;
      case ENTITY_TYPES.TRANSFER:
        return `/transfers/${entityId}`;
      case ENTITY_TYPES.USER:
        return `/users/${entityId}`;
      case ENTITY_TYPES.BRAND:
      case ENTITY_TYPES.LOCATION:
      case ENTITY_TYPES.INVENTORY:
      default:
        return null;
    }
  };

  const handleDeleteAll = () => {
    handleOpenConfirm(null, 'deleteAll');
  };

  const handleToggleSelectionMode = () => {
    setSelectionMode(!selectionMode);
    setSelectedItems([]);
  };

  const handleSelectItem = (itemId) => {
    setSelectedItems(prev =>
      prev.includes(itemId)
        ? prev.filter(id => id !== itemId)
        : [...prev, itemId]
    );
  };

  const handleSelectAll = () => {
    if (selectedItems.length === historyItems.length) {
      setSelectedItems([]);
    } else {
      setSelectedItems(historyItems.map(item => item.id));
    }
  };

  const handleDeleteMany = () => {
    handleOpenConfirm(null, 'deleteMany');
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
    { value: OPERATION_TYPES.TRANSFER_INITIATED, label: 'Inicjacja transferu' },
    { value: OPERATION_TYPES.TRANSFER_CONFIRMED, label: 'Potwierdzenie transferu' },
    { value: OPERATION_TYPES.TRANSFER_REJECTED, label: 'Odrzucenie transferu' },
    { value: OPERATION_TYPES.TRANSFER_CANCELLED, label: 'Anulowanie transferu' },
    { value: OPERATION_TYPES.REVERT, label: 'Cofnięcie' },
    { value: OPERATION_TYPES.STOCK_ADJUST, label: 'Korekta stanu' },
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
    // Selection checkbox column (only in selection mode)
    ...(selectionMode ? [{
      id: 'select',
      label: (
        <Checkbox
          checked={selectedItems.length === historyItems.length && historyItems.length > 0}
          indeterminate={selectedItems.length > 0 && selectedItems.length < historyItems.length}
          onChange={handleSelectAll}
          size="small"
        />
      ),
      sortable: false,
      width: 50,
      render: (row) => (
        <Checkbox
          checked={selectedItems.includes(row.id)}
          onChange={() => handleSelectItem(row.id)}
          size="small"
          onClick={(e) => e.stopPropagation()}
        />
      ),
    }] : []),
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
            error={startDate && endDate && startDate > endDate}
            helperText={startDate && endDate && startDate > endDate ? 'Data początkowa musi być przed końcową' : ''}
          />
          <TextField
            label="Data końcowa"
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            size="small"
            InputLabelProps={{ shrink: true }}
            sx={{ minWidth: 150 }}
            error={startDate && endDate && startDate > endDate}
          />
          {(operationFilters.length > 0 || entityFilters.length > 0 || startDate || endDate || searchQuery) && (
            <Button variant="outlined" onClick={handleClearFilters}>
              Wyczyść filtry
            </Button>
          )}
          <Box sx={{ marginLeft: 'auto', display: 'flex', gap: 1 }}>
            {selectionMode ? (
              <>
                <Button
                  variant="outlined"
                  onClick={handleSelectAll}
                  size="small"
                >
                  {selectedItems.length === historyItems.length ? 'Odznacz wszystkie' : 'Zaznacz wszystkie'}
                </Button>
                <Button
                  variant="contained"
                  color="error"
                  onClick={handleDeleteMany}
                  disabled={selectedItems.length === 0}
                  startIcon={<Trash2 size={18} />}
                >
                  Usuń zaznaczone ({selectedItems.length})
                </Button>
                <Button
                  variant="outlined"
                  onClick={handleToggleSelectionMode}
                  startIcon={<X size={18} />}
                >
                  Anuluj
                </Button>
              </>
            ) : (
              <>
                <Button
                  variant="outlined"
                  color="primary"
                  onClick={handleToggleSelectionMode}
                  startIcon={<CheckSquare size={18} />}
                >
                  Usuń wiele
                </Button>
                <Button
                  variant="contained"
                  color="error"
                  onClick={handleDeleteAll}
                  startIcon={<Trash2 size={18} />}
                >
                  {currentLocation ? `Usuń całą historię z ${currentLocation.name}` : 'Usuń całą historię'}
                </Button>
              </>
            )}
          </Box>
        </Box>

        {/* Search Bar */}
        <Box sx={{ mb: 3 }}>
          <TextField
            fullWidth
            size="small"
            placeholder="Wyszukaj po użytkowniku, lokalizacji lub opisie operacji..."
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
            : confirmDialog.action === 'deleteMany'
            ? 'Potwierdź usunięcie wybranych wpisów'
            : confirmDialog.action === 'delete'
            ? 'Potwierdź usunięcie'
            : 'Potwierdź cofnięcie operacji'
        }
        message={
          confirmDialog.action === 'deleteAll'
            ? currentLocation
              ? `Czy na pewno chcesz usunąć CAŁĄ historię z lokalizacji "${currentLocation.name}"? Ta operacja jest NIEODWRACALNA i usunie wszystkie wpisy historii z tej lokalizacji.`
              : 'Czy na pewno chcesz usunąć CAŁĄ historię ze WSZYSTKICH lokalizacji? Ta operacja jest NIEODWRACALNA i usunie wszystkie wpisy historii w systemie.'
            : confirmDialog.action === 'deleteMany'
            ? `Czy na pewno chcesz usunąć ${selectedItems.length} wybranych wpisów z historii? Ta operacja jest nieodwracalna.`
            : confirmDialog.action === 'delete'
            ? 'Czy na pewno chcesz usunąć ten wpis z historii? Ta operacja jest nieodwracalna.'
            : 'Czy na pewno chcesz cofnąć tę operację? To utworzy wpis kompensujący, który odwróci zmiany. Oryginalny wpis pozostanie w historii dla celów audytu.'
        }
        confirmText={
          confirmDialog.action === 'deleteAll'
            ? 'Usuń całą historię'
            : confirmDialog.action === 'deleteMany'
            ? `Usuń ${selectedItems.length} wpisów`
            : confirmDialog.action === 'delete'
            ? 'Usuń'
            : 'Cofnij operację'
        }
        confirmColor={confirmDialog.action === 'deleteAll' || confirmDialog.action === 'delete' || confirmDialog.action === 'deleteMany' ? 'error' : 'warning'}
        requireReason={confirmDialog.action === 'revert'}
        reasonLabel="Powód cofnięcia operacji *"
        reasonPlaceholder="Proszę wyjaśnić, dlaczego cofasz tę operację (min. 10 znaków)..."
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
        {selectedRow && getEntityNavigationPath(selectedRow.entityType, selectedRow.entityId) && (
          <MenuItem onClick={handleGoTo} sx={{ color: 'primary.main' }}>
            <ArrowRight size={16} style={{ marginRight: 8 }} />
            Przejdź do
          </MenuItem>
        )}
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
