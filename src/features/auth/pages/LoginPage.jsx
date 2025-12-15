import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import {
  Box,
  Paper,
  TextField,
  Button,
  Typography,
  Alert,
} from '@mui/material';
import { Glasses } from 'lucide-react';
import { login, selectIsAuthenticated, selectAuthLoading, selectAuthError, clearError } from '../authSlice';
import toast from 'react-hot-toast';

const loginSchema = yup.object().shape({
  email: yup
    .string()
    .email('Nieprawidłowy adres email')
    .required('Email jest wymagany'),
  password: yup
    .string()
    .min(8, 'Hasło musi mieć minimum 8 znaków')
    .required('Hasło jest wymagane'),
});

function LoginPage() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const loading = useSelector(selectAuthLoading);
  const error = useSelector(selectAuthError);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm({
    resolver: yupResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  useEffect(() => {
    // Clear any previous errors when component mounts
    dispatch(clearError());
  }, [dispatch]);

  useEffect(() => {
    // Redirect if already authenticated
    if (isAuthenticated) {
      navigate('/');
    }
  }, [isAuthenticated, navigate]);

  const onSubmit = async (data) => {
    try {
      await dispatch(login(data)).unwrap();
      toast.success('Zalogowano pomyślnie!');
      navigate('/');
    } catch (err) {
      // Error is already in Redux state, will be displayed
      toast.error('Nie udało się zalogować, sprawdź poprawność loginu i hasła');
    }
  };

  // Quick login functions for development
  const handleQuickLogin = (email, password) => {
    setValue('email', email);
    setValue('password', password);
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      }}
    >
      <Box sx={{ width: '100%', maxWidth: '500px', px: 2, mx: 'auto' }}>
        <Paper
          elevation={6}
          sx={{
            p: 4,
            borderRadius: 3,
          }}
        >
          {/* Logo & Title */}
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              mb: 3,
            }}
          >
            <Glasses size={48} color="#1976d2" />
            <Typography variant="h4" sx={{ mt: 2, fontWeight: 600 }}>
              OptiStore
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              System Zarządzania Salonami Optycznymi
            </Typography>
          </Box>

          {/* Error Alert */}
          {error && (
            <Alert severity="error" sx={{ mb: 3 }} onClose={() => dispatch(clearError())}>
              Nie udało się zalogować, sprawdź poprawność loginu i hasła
            </Alert>
          )}

          {/* Login Form */}
          <form onSubmit={handleSubmit(onSubmit)}>
            <TextField
              {...register('email')}
              label="Email"
              type="email"
              fullWidth
              margin="normal"
              error={!!errors.email}
              helperText={errors.email?.message}
              autoComplete="email"
              autoFocus
            />

            <TextField
              {...register('password')}
              label="Password"
              type="password"
              fullWidth
              margin="normal"
              error={!!errors.password}
              helperText={errors.password?.message}
              autoComplete="current-password"
            />

            <Button
              type="submit"
              variant="contained"
              fullWidth
              size="large"
              sx={{ mt: 3, py: 1.5 }}
              disabled={loading}
            >
              {loading ? 'Logowanie...' : 'Zaloguj się'}
            </Button>
          </form>

          {/* Development Quick Login Buttons - Only in development mode */}
          {import.meta.env.MODE === 'development' && (
            <Box sx={{ mt: 3 }}>
              <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1, textAlign: 'center' }}>
                Quick Login (Development):
              </Typography>
              <Box sx={{ display: 'flex', gap: 1, flexDirection: 'column' }}>
                <Button
                  variant="outlined"
                  size="small"
                  onClick={() => handleQuickLogin('admin@optyk.com', 'Admin123!')}
                  sx={{ fontSize: '0.75rem' }}
                >
                  Admin
                </Button>
                <Button
                  variant="outlined"
                  size="small"
                  onClick={() => handleQuickLogin('employee@optyk.com', 'Employee123!')}
                  sx={{ fontSize: '0.75rem' }}
                >
                  Employee
                </Button>
                <Button
                  variant="outlined"
                  size="small"
                  onClick={() => handleQuickLogin('maintenance@optyk.com', 'Maintenance123!')}
                  sx={{ fontSize: '0.75rem' }}
                >
                  Maintenance
                </Button>
              </Box>
            </Box>
          )}

          {/* Additional Info */}
          <Box sx={{ mt: 3, textAlign: 'center' }}>
            <Typography variant="caption" color="text.secondary">
              Zapomniałeś hasła? Skontaktuj się z administratorem.
            </Typography>
          </Box>
        </Paper>
      </Box>
    </Box>
  );
}

export default LoginPage;
