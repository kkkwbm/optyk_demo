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
} from '@mui/material';
import { Plus, Edit, CheckCircle, XCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import PageHeader from '../../../shared/components/PageHeader';
import DataTable from '../../../shared/components/DataTable';
import StatusBadge from '../../../shared/components/StatusBadge';
import ConfirmDialog from '../../../shared/components/ConfirmDialog';
import {
  fetchLocations,
  activateLocation,
  deactivateLocation,
  selectLocations,
  selectLocationsLoading,
  selectLocationsPagination,
} from '../locationsSlice';
import { selectUser } from '../../auth/authSlice';
import { usePagination } from '../../../hooks/usePagination';
import { useDebounce } from '../../../hooks/useDebounce';
import {
  LOCATION_TYPES,
  LOCATION_TYPE_LABELS,
  LOCATION_STATUS,
  PERMISSIONS,
} from '../../../constants';

function LocationsListPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const locations = useSelector(selectLocations);
  const loading = useSelector(selectLocationsLoading);
  const paginationData = useSelector(selectLocationsPagination);
  const currentUser = useSelector(selectUser);

  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [confirmDialog, setConfirmDialog] = useState({ open: false, action: null, location: null });

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
      type: typeFilter || undefined,
      status: statusFilter || undefined,
    };
    dispatch(fetchLocations(params));
  }, [dispatch, pagination.page, pagination.size, debouncedSearch, typeFilter, statusFilter]);

  const hasPermission = (permission) => {
    return PERMISSIONS[permission]?.includes(currentUser?.role);
  };

  const canManageLocations = hasPermission('ADD_LOCATIONS');

  const handleOpenConfirm = (action, location) => {
    setConfirmDialog({ open: true, action, location });
  };

  const handleCloseConfirm = () => {
    setConfirmDialog({ open: false, action: null, location: null });
  };

  const handleConfirmAction = async () => {
    const { action, location } = confirmDialog;
    try {
      if (action === 'activate') {
        await dispatch(activateLocation(location.id)).unwrap();
        toast.success('Lokalizacja została aktywowana');
      } else if (action === 'deactivate') {
        await dispatch(deactivateLocation(location.id)).unwrap();
        toast.success('Lokalizacja została deaktywowana');
      }
      dispatch(fetchLocations({ page: pagination.page, size: pagination.size }));
    } catch (error) {
      toast.error(error || `Nie udało się ${action} lokalizacji`);
    }
    handleCloseConfirm();
  };

  const handleClearFilters = () => {
    setSearchTerm('');
    setTypeFilter('');
    setStatusFilter('');
  };

  const columns = [
    {
      id: 'name',
      label: 'Nazwa',
      sortable: true,
      render: (row) => row.name,
    },
    {
      id: 'type',
      label: 'Typ',
      sortable: true,
      render: (row) => (
        <Chip
          label={LOCATION_TYPE_LABELS[row.type]}
          size="small"
          color={row.type === LOCATION_TYPES.WAREHOUSE ? 'primary' : 'default'}
        />
      ),
    },
    {
      id: 'city',
      label: 'Miasto',
      sortable: true,
      render: (row) => row.city || '-',
    },
    {
      id: 'address',
      label: 'Adres',
      sortable: false,
      render: (row) => row.address || '-',
    },
    {
      id: 'phone',
      label: 'Telefon',
      sortable: false,
      render: (row) => row.phone || '-',
    },
    {
      id: 'status',
      label: 'Status',
      sortable: true,
      render: (row) => <StatusBadge status={row.status} type="location" />,
    },
    {
      id: 'actions',
      label: 'Akcje',
      sortable: false,
      render: (row) => (
        <Box sx={{ display: 'flex', gap: 1 }}>
          {canManageLocations && (
            <Button
              size="small"
              variant="text"
              startIcon={<Edit size={14} />}
              onClick={(e) => {
                e.stopPropagation();
                navigate(`/locations/${row.id}/edit`);
              }}
              disabled={row.status === LOCATION_STATUS.INACTIVE}
            >
              Edytuj
            </Button>
          )}
          {canManageLocations && row.status === LOCATION_STATUS.ACTIVE && (
            <Button
              size="small"
              variant="text"
              color="warning"
              startIcon={<XCircle size={14} />}
              onClick={(e) => {
                e.stopPropagation();
                handleOpenConfirm('deactivate', row);
              }}
            >
              Deaktywuj
            </Button>
          )}
          {canManageLocations && row.status === LOCATION_STATUS.INACTIVE && (
            <Button
              size="small"
              variant="text"
              color="success"
              startIcon={<CheckCircle size={14} />}
              onClick={(e) => {
                e.stopPropagation();
                handleOpenConfirm('activate', row);
              }}
            >
              Aktywuj
            </Button>
          )}
        </Box>
      ),
    },
  ];

  return (
    <Container maxWidth="xl">
      <PageHeader
        title="Lokalizacje"
        subtitle="Zarządzaj salonami i magazynami"
        breadcrumbs={[
          { label: 'Pulpit', to: '/' },
          { label: 'Lokalizacje' },
        ]}
        actions={
          canManageLocations
            ? [
                {
                  label: 'Utwórz lokalizację',
                  icon: <Plus size={20} />,
                  onClick: () => navigate('/locations/create'),
                  variant: 'contained',
                },
              ]
            : []
        }
      />

      <Paper sx={{ p: 3 }}>
        {/* Filters */}
        <Box sx={{ mb: 3, display: 'flex', gap: 2, flexWrap: 'wrap' }}>
          <TextField
            label="Szukaj"
            placeholder="Szukaj po nazwie, mieście..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            size="small"
            sx={{ minWidth: 250 }}
          />
          <TextField
            select
            label="Typ"
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            size="small"
            sx={{ minWidth: 150 }}
          >
            <MenuItem value="">Wszystkie typy</MenuItem>
            {Object.values(LOCATION_TYPES).map((type) => (
              <MenuItem key={type} value={type}>
                {LOCATION_TYPE_LABELS[type]}
              </MenuItem>
            ))}
          </TextField>
          <TextField
            select
            label="Status"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            size="small"
            sx={{ minWidth: 150 }}
          >
            <MenuItem value="">Wszystkie statusy</MenuItem>
            {Object.values(LOCATION_STATUS).map((status) => (
              <MenuItem key={status} value={status}>
                {status}
              </MenuItem>
            ))}
          </TextField>
          {(searchTerm || typeFilter || statusFilter) && (
            <Button variant="outlined" onClick={handleClearFilters}>
              Wyczyść filtry
            </Button>
          )}
        </Box>

        {/* Locations Table */}
        <DataTable
          columns={columns}
          data={locations}
          loading={loading}
          pagination={{
            page: pagination.page,
            total: paginationData?.totalElements || 0,
            size: pagination.size,
          }}
          onPageChange={pagination.handlePageChange}
          onRowsPerPageChange={pagination.handleRowsPerPageChange}
          emptyMessage="Nie znaleziono lokalizacji. Spróbuj dostosować filtry."
        />
      </Paper>

      {/* Confirm Dialog */}
      <ConfirmDialog
        open={confirmDialog.open}
        onClose={handleCloseConfirm}
        onConfirm={handleConfirmAction}
        title={confirmDialog.action === 'activate' ? 'Aktywuj lokalizację' : 'Deaktywuj lokalizację'}
        message={
          confirmDialog.action === 'activate'
            ? `Czy na pewno chcesz aktywować "${confirmDialog.location?.name}"?`
            : `Czy na pewno chcesz deaktywować "${confirmDialog.location?.name}"? Ta lokalizacja nie będzie już dostępna do operacji.`
        }
        confirmText={confirmDialog.action === 'activate' ? 'Aktywuj' : 'Deaktywuj'}
        confirmColor={confirmDialog.action === 'activate' ? 'success' : 'warning'}
      />
    </Container>
  );
}

export default LocationsListPage;
