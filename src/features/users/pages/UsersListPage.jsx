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
import { UserPlus, UserCheck, UserX, KeyRound } from 'lucide-react';
import { format } from 'date-fns';
import toast from 'react-hot-toast';
import PageHeader from '../../../shared/components/PageHeader';
import DataTable from '../../../shared/components/DataTable';
import StatusBadge from '../../../shared/components/StatusBadge';
import ConfirmDialog from '../../../shared/components/ConfirmDialog';
import {
  fetchUsers,
  activateUser,
  deactivateUser,
  selectUsers,
  selectUsersLoading,
  selectUsersPagination,
} from '../usersSlice';
import { fetchActiveLocations, selectActiveLocations } from '../../locations/locationsSlice';
import { selectUser } from '../../auth/authSlice';
import { usePagination } from '../../../hooks/usePagination';
import { useDebounce } from '../../../hooks/useDebounce';
import {
  USER_ROLES,
  USER_ROLE_LABELS,
  USER_STATUS,
  DATE_FORMATS,
  PERMISSIONS,
} from '../../../constants';

function UsersListPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const users = useSelector(selectUsers);
  const loading = useSelector(selectUsersLoading);
  const paginationData = useSelector(selectUsersPagination);
  const locations = useSelector(selectActiveLocations);
  const currentUser = useSelector(selectUser);

  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [locationFilter, setLocationFilter] = useState('');
  const [confirmDialog, setConfirmDialog] = useState({ open: false, action: null, user: null });

  const debouncedSearch = useDebounce(searchTerm, 300);
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
      search: debouncedSearch || undefined,
      role: roleFilter || undefined,
      status: statusFilter || undefined,
      locationId: locationFilter || undefined,
    };
    dispatch(fetchUsers(params));
  }, [dispatch, pagination.page, pagination.size, debouncedSearch, roleFilter, statusFilter, locationFilter]);

  const hasPermission = (permission) => {
    return PERMISSIONS[permission]?.includes(currentUser?.role);
  };

  const canManageUsers = hasPermission('MANAGE_USERS');
  const canResetPassword = hasPermission('RESET_PASSWORD');

  const handleOpenConfirm = (action, user) => {
    setConfirmDialog({ open: true, action, user });
  };

  const handleCloseConfirm = () => {
    setConfirmDialog({ open: false, action: null, user: null });
  };

  const handleConfirmAction = async () => {
    const { action, user } = confirmDialog;
    try {
      if (action === 'activate') {
        await dispatch(activateUser(user.id)).unwrap();
        toast.success('Użytkownik został aktywowany');
      } else if (action === 'deactivate') {
        await dispatch(deactivateUser(user.id)).unwrap();
        toast.success('Użytkownik został dezaktywowany');
      }
      dispatch(fetchUsers({ page: pagination.page, size: pagination.size }));
    } catch (error) {
      toast.error(error || `Nie udało się ${action === 'activate' ? 'aktywować' : 'dezaktywować'} użytkownika`);
    }
    handleCloseConfirm();
  };

  const handleResetPassword = (userId) => {
    navigate(`/users/${userId}/reset-password`);
  };

  const handleClearFilters = () => {
    setSearchTerm('');
    setRoleFilter('');
    setStatusFilter('');
    setLocationFilter('');
  };

  const columns = [
    {
      id: 'email',
      label: 'Email',
      sortable: true,
      render: (row) => row?.email || '-',
    },
    {
      id: 'firstName',
      label: 'Imię',
      sortable: true,
      render: (row) => row?.firstName || '-',
    },
    {
      id: 'lastName',
      label: 'Nazwisko',
      sortable: true,
      render: (row) => row?.lastName || '-',
    },
    {
      id: 'role',
      label: 'Rola',
      sortable: true,
      render: (row) => row ? (
        <Chip
          label={USER_ROLE_LABELS[row.role]}
          size="small"
          color={
            row.role === USER_ROLES.ADMIN
              ? 'error'
              : row.role === USER_ROLES.OWNER
              ? 'primary'
              : 'default'
          }
        />
      ) : '-',
    },
    {
      id: 'location',
      label: 'Lokalizacja',
      sortable: false,
      render: (row) => row?.location?.name || '-',
    },
    {
      id: 'phone',
      label: 'Telefon',
      sortable: false,
      render: (row) => row?.phone || '-',
    },
    {
      id: 'status',
      label: 'Status',
      sortable: true,
      render: (row) => row ? <StatusBadge status={row.status} type="user" /> : '-',
    },
    {
      id: 'createdAt',
      label: 'Utworzono',
      sortable: true,
      render: (row) => row?.createdAt ? format(new Date(row.createdAt), DATE_FORMATS.DISPLAY) : '-',
    },
    {
      id: 'actions',
      label: 'Akcje',
      sortable: false,
      render: (row) => row ? (
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button
            size="small"
            variant="text"
            onClick={(e) => {
              e.stopPropagation();
              navigate(`/users/${row.id}`);
            }}
          >
            Szczegóły
          </Button>
          {canManageUsers && row.status === USER_STATUS.ACTIVE && (
            <Button
              size="small"
              variant="text"
              color="warning"
              startIcon={<UserX size={14} />}
              onClick={(e) => {
                e.stopPropagation();
                handleOpenConfirm('deactivate', row);
              }}
            >
              Dezaktywuj
            </Button>
          )}
          {canManageUsers && row.status === USER_STATUS.INACTIVE && (
            <Button
              size="small"
              variant="text"
              color="success"
              startIcon={<UserCheck size={14} />}
              onClick={(e) => {
                e.stopPropagation();
                handleOpenConfirm('activate', row);
              }}
            >
              Aktywuj
            </Button>
          )}
          {canResetPassword && (
            <Button
              size="small"
              variant="text"
              color="primary"
              startIcon={<KeyRound size={14} />}
              onClick={(e) => {
                e.stopPropagation();
                handleResetPassword(row.id);
              }}
            >
              Resetuj hasło
            </Button>
          )}
        </Box>
      ) : null,
    },
  ];

  return (
    <Container maxWidth="xl">
      <PageHeader
        title="Użytkownicy"
        subtitle="Zarządzaj użytkownikami systemu i uprawnieniami"
        breadcrumbs={[
          { label: 'Pulpit', to: '/' },
          { label: 'Użytkownicy' },
        ]}
        actions={
          canManageUsers
            ? [
                {
                  label: 'Dodaj użytkownika',
                  icon: <UserPlus size={20} />,
                  onClick: () => navigate('/users/create'),
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
            placeholder="Szukaj po emailu, nazwie..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            size="small"
            sx={{ minWidth: 250 }}
          />
          <TextField
            select
            label="Rola"
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            size="small"
            sx={{ minWidth: 150 }}
          >
            <MenuItem value="">Wszystkie role</MenuItem>
            {Object.values(USER_ROLES).map((role) => (
              <MenuItem key={role} value={role}>
                {USER_ROLE_LABELS[role]}
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
            {Object.values(USER_STATUS).map((status) => (
              <MenuItem key={status} value={status}>
                {status}
              </MenuItem>
            ))}
          </TextField>
          <TextField
            select
            label="Lokalizacja"
            value={locationFilter}
            onChange={(e) => setLocationFilter(e.target.value)}
            size="small"
            sx={{ minWidth: 200 }}
          >
            <MenuItem value="">Wszystkie lokalizacje</MenuItem>
            {locations.map((location) => (
              <MenuItem key={location.id} value={location.id}>
                {location.name}
              </MenuItem>
            ))}
          </TextField>
          {(searchTerm || roleFilter || statusFilter || locationFilter) && (
            <Button variant="outlined" onClick={handleClearFilters}>
              Wyczyść filtry
            </Button>
          )}
        </Box>

        {/* Users Table */}
        <DataTable
          columns={columns}
          data={users}
          loading={loading}
          pagination={{
            page: pagination.page,
            total: paginationData?.totalElements || 0,
            size: pagination.size,
          }}
          onPageChange={pagination.handlePageChange}
          onRowsPerPageChange={pagination.handleRowsPerPageChange}
          onRowClick={(row) => navigate(`/users/${row.id}`)}
          emptyMessage="Nie znaleziono użytkowników. Spróbuj zmienić filtry."
        />
      </Paper>

      {/* Confirm Dialog */}
      <ConfirmDialog
        open={confirmDialog.open}
        onClose={handleCloseConfirm}
        onConfirm={handleConfirmAction}
        title={
          confirmDialog.action === 'activate'
            ? 'Aktywuj użytkownika'
            : 'Dezaktywuj użytkownika'
        }
        message={
          confirmDialog.action === 'activate'
            ? `Czy na pewno chcesz aktywować użytkownika "${confirmDialog.user?.email}"?`
            : `Czy na pewno chcesz dezaktywować użytkownika "${confirmDialog.user?.email}"?`
        }
        confirmText={
          confirmDialog.action === 'activate'
            ? 'Aktywuj'
            : 'Dezaktywuj'
        }
        confirmColor={confirmDialog.action === 'deactivate' ? 'warning' : 'primary'}
      />
    </Container>
  );
}

export default UsersListPage;
