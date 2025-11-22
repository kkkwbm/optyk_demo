import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Container,
  Paper,
  Box,
  Button,
  Typography,
  Grid,
  Divider,
  CircularProgress,
  Chip,
} from '@mui/material';
import { ArrowLeft, Edit, UserCheck, UserX, KeyRound } from 'lucide-react';
import { format } from 'date-fns';
import toast from 'react-hot-toast';
import PageHeader from '../../../shared/components/PageHeader';
import StatusBadge from '../../../shared/components/StatusBadge';
import ConfirmDialog from '../../../shared/components/ConfirmDialog';
import {
  fetchUserById,
  activateUser,
  deactivateUser,
  selectCurrentUser as selectCurrentUserDetails,
  selectUsersLoading,
} from '../usersSlice';
import { selectUser } from '../../auth/authSlice';
import { USER_ROLES, USER_ROLE_LABELS, USER_STATUS, DATE_FORMATS, PERMISSIONS } from '../../../constants';

function UserDetailsPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { id } = useParams();

  const user = useSelector(selectCurrentUserDetails);
  const loading = useSelector(selectUsersLoading);
  const currentUser = useSelector(selectUser);

  const [confirmDialog, setConfirmDialog] = useState({ open: false, action: null });

  useEffect(() => {
    if (id) {
      dispatch(fetchUserById(id));
    }
  }, [dispatch, id]);

  const hasPermission = (permission) => {
    return PERMISSIONS[permission]?.includes(currentUser?.role);
  };

  const canManageUsers = hasPermission('MANAGE_USERS');
  const canResetPassword = hasPermission('RESET_PASSWORD');

  const handleOpenConfirm = (action) => {
    setConfirmDialog({ open: true, action });
  };

  const handleCloseConfirm = () => {
    setConfirmDialog({ open: false, action: null });
  };

  const handleConfirmAction = async () => {
    const { action } = confirmDialog;
    try {
      if (action === 'activate') {
        await dispatch(activateUser(user.id)).unwrap();
        toast.success('Użytkownik został aktywowany');
        dispatch(fetchUserById(id));
      } else if (action === 'deactivate') {
        await dispatch(deactivateUser(user.id)).unwrap();
        toast.success('Użytkownik został dezaktywowany');
        dispatch(fetchUserById(id));
      }
    } catch (error) {
      toast.error(error || `Nie udało się ${action === 'activate' ? 'aktywować' : 'dezaktywować'} użytkownika`);
    }
    handleCloseConfirm();
  };

  const handleResetPassword = () => {
    navigate(`/users/${id}/reset-password`);
  };

  if (loading || !user) {
    return (
      <Container maxWidth="lg">
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 400 }}>
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  const getUserName = () => {
    return `${user.firstName} ${user.lastName}`;
  };

  return (
    <Container maxWidth="lg">
      <PageHeader
        title={getUserName()}
        subtitle={USER_ROLE_LABELS[user.role]}
        breadcrumbs={[
          { label: 'Pulpit', to: '/' },
          { label: 'Użytkownicy', to: '/users' },
          { label: getUserName() },
        ]}
        actions={[
          {
            label: 'Wróć',
            icon: <ArrowLeft size={20} />,
            onClick: () => navigate('/users'),
            variant: 'outlined',
          },
        ]}
      />

      <Paper sx={{ p: 3 }}>
        {/* Actions */}
        <Box sx={{ mb: 3, display: 'flex', gap: 2, flexWrap: 'wrap' }}>
          {canManageUsers && (
            <Button
              variant="outlined"
              startIcon={<Edit size={16} />}
              onClick={() => navigate(`/users/${id}/edit`)}
              disabled={user.status === USER_STATUS.INACTIVE}
            >
              Edytuj
            </Button>
          )}
          {canManageUsers && user.status === USER_STATUS.ACTIVE && (
            <Button
              variant="outlined"
              color="warning"
              startIcon={<UserX size={16} />}
              onClick={() => handleOpenConfirm('deactivate')}
            >
              Dezaktywuj
            </Button>
          )}
          {canManageUsers && user.status === USER_STATUS.INACTIVE && (
            <Button
              variant="outlined"
              color="success"
              startIcon={<UserCheck size={16} />}
              onClick={() => handleOpenConfirm('activate')}
            >
              Aktywuj
            </Button>
          )}
          {canResetPassword && (
            <Button
              variant="outlined"
              color="primary"
              startIcon={<KeyRound size={16} />}
              onClick={handleResetPassword}
            >
              Resetuj hasło
            </Button>
          )}
        </Box>

        <Divider sx={{ mb: 3 }} />

        {/* User Details */}
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Typography variant="body2" color="text.secondary">
              Email
            </Typography>
            <Typography variant="body1" sx={{ mb: 2 }}>
              {user.email}
            </Typography>
          </Grid>

          <Grid item xs={12} md={6}>
            <Typography variant="body2" color="text.secondary">
              Imię
            </Typography>
            <Typography variant="body1" sx={{ mb: 2 }}>
              {user.firstName}
            </Typography>
          </Grid>

          <Grid item xs={12} md={6}>
            <Typography variant="body2" color="text.secondary">
              Nazwisko
            </Typography>
            <Typography variant="body1" sx={{ mb: 2 }}>
              {user.lastName}
            </Typography>
          </Grid>

          <Grid item xs={12} md={6}>
            <Typography variant="body2" color="text.secondary">
              Telefon
            </Typography>
            <Typography variant="body1" sx={{ mb: 2 }}>
              {user.phone || '-'}
            </Typography>
          </Grid>

          <Grid item xs={12} md={6}>
            <Typography variant="body2" color="text.secondary">
              Rola
            </Typography>
            <Box sx={{ mb: 2 }}>
              <Chip
                label={USER_ROLE_LABELS[user.role]}
                color={
                  user.role === USER_ROLES.ADMIN
                    ? 'error'
                    : user.role === USER_ROLES.OWNER
                    ? 'primary'
                    : 'default'
                }
              />
            </Box>
          </Grid>

          <Grid item xs={12} md={6}>
            <Typography variant="body2" color="text.secondary">
              Lokalizacja
            </Typography>
            <Typography variant="body1" sx={{ mb: 2 }}>
              {user.location?.name || '-'}
            </Typography>
          </Grid>

          <Grid item xs={12} md={6}>
            <Typography variant="body2" color="text.secondary">
              Status
            </Typography>
            <Box sx={{ mb: 2 }}>
              <StatusBadge status={user.status} type="user" />
            </Box>
          </Grid>

          <Grid item xs={12} md={6}>
            <Typography variant="body2" color="text.secondary">
              Utworzono
            </Typography>
            <Typography variant="body1" sx={{ mb: 2 }}>
              {format(new Date(user.createdAt), DATE_FORMATS.DISPLAY_WITH_TIME)}
            </Typography>
          </Grid>

          {user.updatedAt && (
            <Grid item xs={12} md={6}>
              <Typography variant="body2" color="text.secondary">
                Ostatnia aktualizacja
              </Typography>
              <Typography variant="body1" sx={{ mb: 2 }}>
                {format(new Date(user.updatedAt), DATE_FORMATS.DISPLAY_WITH_TIME)}
              </Typography>
            </Grid>
          )}

          {user.lastLogin && (
            <Grid item xs={12} md={6}>
              <Typography variant="body2" color="text.secondary">
                Ostatnie logowanie
              </Typography>
              <Typography variant="body1" sx={{ mb: 2 }}>
                {format(new Date(user.lastLogin), DATE_FORMATS.DISPLAY_WITH_TIME)}
              </Typography>
            </Grid>
          )}
        </Grid>
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
            ? `Czy na pewno chcesz aktywować użytkownika "${user?.email}"?`
            : `Czy na pewno chcesz dezaktywować użytkownika "${user?.email}"?`
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

export default UserDetailsPage;
