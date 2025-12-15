import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Grid,
  CircularProgress,
  Box,
} from '@mui/material';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import FormField from '../../../shared/components/FormField';
import { updateUser } from '../usersSlice';
import { USER_ROLES, USER_ROLE_LABELS, VALIDATION } from '../../../constants';
import userService from '../../../services/userService';

function EditUserDialog({ open, onClose, userId, onSuccess }) {
  const dispatch = useDispatch();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const { control, handleSubmit, reset } = useForm({
    defaultValues: {
      email: '',
      firstName: '',
      lastName: '',
      phone: '',
      role: USER_ROLES.EMPLOYEE,
    },
  });

  useEffect(() => {
    const loadUserData = async () => {
      if (open && userId) {
        try {
          setLoading(true);
          const response = await userService.getUserById(userId);
          if (response.data.success) {
            const userData = response.data.data;
            setUser(userData);
            reset({
              email: userData.email || '',
              firstName: userData.firstName || '',
              lastName: userData.lastName || '',
              phone: userData.phone || '',
              role: userData.role || USER_ROLES.EMPLOYEE,
            });
          }
        } catch (error) {
          toast.error('Nie udało się załadować danych użytkownika');
        } finally {
          setLoading(false);
        }
      }
    };

    loadUserData();
  }, [open, userId, reset]);

  const onSubmit = async (data) => {
    try {
      setSubmitting(true);
      await dispatch(updateUser({ id: userId, data })).unwrap();
      toast.success('Użytkownik został zaktualizowany');
      handleClose();
      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      toast.error(error || 'Nie udało się zaktualizować użytkownika');
    } finally {
      setSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!submitting) {
      setUser(null);
      reset();
      onClose();
    }
  };

  const roleOptions = Object.values(USER_ROLES).map((role) => ({
    value: role,
    label: USER_ROLE_LABELS[role],
  }));

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
      <DialogTitle>Edytuj użytkownika</DialogTitle>
      <DialogContent>
        {loading && !user ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 300 }}>
            <CircularProgress />
          </Box>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)} id="edit-user-form">
            <Grid container spacing={3} sx={{ mt: 1 }}>
              {/* Email */}
              <Grid item xs={12} md={6}>
                <FormField
                  name="email"
                  control={control}
                  label="Email"
                  type="email"
                  required
                  rules={{
                    pattern: {
                      value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                      message: 'Nieprawidłowy adres email',
                    },
                    maxLength: {
                      value: VALIDATION.EMAIL_MAX_LENGTH,
                      message: `Email nie może przekraczać ${VALIDATION.EMAIL_MAX_LENGTH} znaków`,
                    },
                  }}
                />
              </Grid>

              {/* First Name */}
              <Grid item xs={12} md={6}>
                <FormField
                  name="firstName"
                  control={control}
                  label="Imię"
                  type="text"
                  required
                  rules={{
                    maxLength: {
                      value: VALIDATION.NAME_MAX_LENGTH,
                      message: `Imię nie może przekraczać ${VALIDATION.NAME_MAX_LENGTH} znaków`,
                    },
                  }}
                />
              </Grid>

              {/* Last Name */}
              <Grid item xs={12} md={6}>
                <FormField
                  name="lastName"
                  control={control}
                  label="Nazwisko"
                  type="text"
                  required
                  rules={{
                    maxLength: {
                      value: VALIDATION.NAME_MAX_LENGTH,
                      message: `Nazwisko nie może przekraczać ${VALIDATION.NAME_MAX_LENGTH} znaków`,
                    },
                  }}
                />
              </Grid>

              {/* Phone */}
              <Grid item xs={12} md={6}>
                <FormField
                  name="phone"
                  control={control}
                  label="Telefon"
                  type="tel"
                  rules={{
                    maxLength: {
                      value: VALIDATION.PHONE_MAX_LENGTH,
                      message: `Telefon nie może przekraczać ${VALIDATION.PHONE_MAX_LENGTH} znaków`,
                    },
                  }}
                />
              </Grid>

              {/* Role */}
              <Grid item xs={12} md={6}>
                <FormField
                  name="role"
                  control={control}
                  label="Rola"
                  type="select"
                  options={roleOptions}
                  required
                />
              </Grid>
            </Grid>
          </form>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} disabled={submitting}>Anuluj</Button>
        <Button
          type="submit"
          form="edit-user-form"
          variant="contained"
          disabled={loading || submitting}
        >
          {submitting ? 'Zapisywanie...' : 'Zaktualizuj'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default EditUserDialog;
