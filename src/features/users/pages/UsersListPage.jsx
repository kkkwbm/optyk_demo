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
  Tooltip,
} from '@mui/material';
import { UserPlus, KeyRound, Edit } from 'lucide-react';
import { format } from 'date-fns';
import { pl } from 'date-fns/locale';
import PageHeader from '../../../shared/components/PageHeader';
import DataTable from '../../../shared/components/DataTable';
import EditUserDialog from '../components/EditUserDialog';
import {
  fetchUsers,
  selectUsers,
  selectUsersLoading,
  selectUsersPagination,
} from '../usersSlice';
import { selectUser } from '../../auth/authSlice';
import { usePagination } from '../../../hooks/usePagination';
import { useDebounce } from '../../../hooks/useDebounce';
import {
  USER_ROLES,
  USER_ROLE_LABELS,
  DATE_FORMATS,
  PERMISSIONS,
} from '../../../constants';

function UsersListPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const users = useSelector(selectUsers);
  const loading = useSelector(selectUsersLoading);
  const paginationData = useSelector(selectUsersPagination);
  const currentUser = useSelector(selectUser);

  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [editDialog, setEditDialog] = useState({ open: false, userId: null });

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
      role: roleFilter || undefined,
    };
    dispatch(fetchUsers(params));
  }, [dispatch, pagination.page, pagination.size, debouncedSearch, roleFilter]);

  const hasPermission = (permission) => {
    return PERMISSIONS[permission]?.includes(currentUser?.role);
  };

  const canManageUsers = hasPermission('MANAGE_USERS');
  const canResetPassword = hasPermission('RESET_PASSWORD');

  const handleResetPassword = (userId) => {
    navigate(`/users/${userId}/reset-password`);
  };

  const handleOpenEdit = (userId) => {
    setEditDialog({ open: true, userId });
  };

  const handleCloseEdit = () => {
    setEditDialog({ open: false, userId: null });
  };

  const handleEditSuccess = () => {
    dispatch(fetchUsers({ page: pagination.page, size: pagination.size }));
  };

  const handleClearFilters = () => {
    setSearchTerm('');
    setRoleFilter('');
  };

  const columns = [
    {
      id: 'email',
      label: 'Email',
      sortable: true,
      render: (row) => row.email || '-',
    },
    {
      id: 'firstName',
      label: 'Imię',
      sortable: true,
      render: (row) => row.firstName || '-',
    },
    {
      id: 'lastName',
      label: 'Nazwisko',
      sortable: true,
      render: (row) => row.lastName || '-',
    },
    {
      id: 'role',
      label: 'Rola',
      sortable: true,
      render: (row) => row.role ? (
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
      id: 'phone',
      label: 'Telefon',
      sortable: false,
      render: (row) => row.phone || '-',
    },
    {
      id: 'createdAt',
      label: 'Utworzono',
      sortable: true,
      render: (row) => row.createdAt ? format(new Date(row.createdAt), DATE_FORMATS.DISPLAY, { locale: pl }) : '-',
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
          {canManageUsers && (
            <Button
              size="small"
              variant="text"
              color="primary"
              startIcon={<Edit size={14} />}
              onClick={(e) => {
                e.stopPropagation();
                handleOpenEdit(row.id);
              }}
            >
              Edytuj
            </Button>
          )}
          {canResetPassword && (
            <Tooltip title="Resetowanie hasła jest niedostępne w wersji demo">
              <span>
                <Button
                  size="small"
                  variant="text"
                  color="primary"
                  startIcon={<KeyRound size={14} />}
                  disabled
                >
                  Resetuj hasło
                </Button>
              </span>
            </Tooltip>
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
          {(searchTerm || roleFilter) && (
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

      {/* Edit User Dialog */}
      <EditUserDialog
        open={editDialog.open}
        onClose={handleCloseEdit}
        userId={editDialog.userId}
        onSuccess={handleEditSuccess}
      />
    </Container>
  );
}

export default UsersListPage;
