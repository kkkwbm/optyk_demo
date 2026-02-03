import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import {
  Container,
  Paper,
  Typography,
  TextField,
  Button,
  Box,
  Alert,
} from '@mui/material';
import { changePassword, selectAuthLoading, selectAuthError, clearError } from '../authSlice';
import toast from 'react-hot-toast';
import { useEffect } from 'react';

const changePasswordSchema = yup.object().shape({
  currentPassword: yup.string().required('Obecne hasło jest wymagane'),
  newPassword: yup
    .string()
    .min(8, 'Hasło musi mieć minimum 8 znaków')
    .matches(/[a-z]/, 'Hasło musi zawierać przynajmniej jedną małą literę')
    .matches(/[A-Z]/, 'Hasło musi zawierać przynajmniej jedną wielką literę')
    .matches(/[0-9]/, 'Hasło musi zawierać przynajmniej jedną cyfrę')
    .required('Nowe hasło jest wymagane'),
  confirmPassword: yup
    .string()
    .oneOf([yup.ref('newPassword'), null], 'Hasła muszą się zgadzać')
    .required('Potwierdzenie hasła jest wymagane'),
});

function ChangePasswordPage() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const loading = useSelector(selectAuthLoading);
  const error = useSelector(selectAuthError);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm({
    resolver: yupResolver(changePasswordSchema),
    defaultValues: {
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    },
  });

  useEffect(() => {
    dispatch(clearError());
  }, [dispatch]);

  const onSubmit = async (data) => {
    try {
      await dispatch(changePassword(data)).unwrap();
      toast.success('Hasło zostało zmienione pomyślnie!');
      reset();
      setTimeout(() => {
        navigate('/profile');
      }, 1500);
    } catch (err) {
      // Error handled by toast notification
    }
  };

  return (
    <Container maxWidth="sm">
      <Typography variant="h4" sx={{ mb: 3, fontWeight: 600 }}>
        Zmień hasło
      </Typography>

      <Paper sx={{ p: 4 }}>
        {error && (
          <Alert severity="error" sx={{ mb: 3 }} onClose={() => dispatch(clearError())}>
            {typeof error === 'string' ? error : 'Nie udało się zmienić hasła'}
          </Alert>
        )}

        <form onSubmit={handleSubmit(onSubmit)}>
          <TextField
            {...register('currentPassword')}
            label="Obecne hasło"
            type="password"
            fullWidth
            margin="normal"
            error={!!errors.currentPassword}
            helperText={errors.currentPassword?.message}
            autoComplete="current-password"
          />

          <TextField
            {...register('newPassword')}
            label="Nowe hasło"
            type="password"
            fullWidth
            margin="normal"
            error={!!errors.newPassword}
            helperText={
              errors.newPassword?.message ||
              'Musi zawierać minimum 8 znaków, wielką literę, małą literę i cyfrę'
            }
            autoComplete="new-password"
          />

          <TextField
            {...register('confirmPassword')}
            label="Potwierdź nowe hasło"
            type="password"
            fullWidth
            margin="normal"
            error={!!errors.confirmPassword}
            helperText={errors.confirmPassword?.message}
            autoComplete="new-password"
          />

          <Box sx={{ display: 'flex', gap: 2, mt: 3, flexDirection: 'column' }}>
            <Box sx={{ display: 'flex', gap: 2 }}>
              <Button
                type="button"
                variant="outlined"
                fullWidth
                onClick={() => navigate('/profile')}
              >
                Anuluj
              </Button>
              <Button
                type="submit"
                variant="contained"
                fullWidth
                disabled={true}
              >
                Zmień hasło
              </Button>
            </Box>
            <Typography variant="caption" color="text.secondary" sx={{ textAlign: 'center' }}>
              Zmiana hasła jest wyłączona w trybie demo
            </Typography>
          </Box>
        </form>
      </Paper>
    </Container>
  );
}

export default ChangePasswordPage;
