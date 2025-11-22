import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { Container, Paper, Box, Button, Grid } from '@mui/material';
import { ArrowLeft } from 'lucide-react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import PageHeader from '../../../shared/components/PageHeader';
import FormField from '../../../shared/components/FormField';
import { createUser } from '../usersSlice';
import { fetchActiveLocations, selectActiveLocations } from '../../locations/locationsSlice';
import { USER_ROLES, USER_ROLE_LABELS, VALIDATION } from '../../../constants';

function CreateUserPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const locations = useSelector(selectActiveLocations);

  const { control, handleSubmit, reset } = useForm({
    defaultValues: {
      email: '',
      firstName: '',
      lastName: '',
      phone: '',
      role: USER_ROLES.EMPLOYEE,
      locationId: '',
      password: '',
      confirmPassword: '',
    },
  });

  useEffect(() => {
    dispatch(fetchActiveLocations());
  }, [dispatch]);

  const onSubmit = async (data) => {
    try {
      // Validate passwords match
      if (data.password !== data.confirmPassword) {
        toast.error('Hasła się nie zgadzają');
        return;
      }

      // Remove confirmPassword from data
      const { confirmPassword, ...userData } = data;

      await dispatch(createUser(userData)).unwrap();
      toast.success('Użytkownik został utworzony');
      navigate('/users');
    } catch (error) {
      toast.error(error || 'Nie udało się utworzyć użytkownika');
    }
  };

  const roleOptions = Object.values(USER_ROLES).map((role) => ({
    value: role,
    label: USER_ROLE_LABELS[role],
  }));

  const locationOptions = locations.map((location) => ({
    value: location.id,
    label: location.name,
  }));

  return (
    <Container maxWidth="lg">
      <PageHeader
        title="Dodaj nowego użytkownika"
        subtitle="Stwórz nowe konto użytkownika"
        breadcrumbs={[
          { label: 'Pulpit', to: '/' },
          { label: 'Użytkownicy', to: '/users' },
          { label: 'Dodaj nowego użytkownika' },
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
        <form onSubmit={handleSubmit(onSubmit)}>
          <Grid container spacing={3}>
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

            {/* Location */}
            <Grid item xs={12} md={6}>
              <FormField
                name="locationId"
                control={control}
                label="Lokalizacja"
                type="select"
                options={locationOptions}
                required
              />
            </Grid>

            {/* Password */}
            <Grid item xs={12} md={6}>
              <FormField
                name="password"
                control={control}
                label="Hasło"
                type="password"
                required
                rules={{
                  minLength: {
                    value: VALIDATION.PASSWORD_MIN_LENGTH,
                    message: `Hasło musi mieć co najmniej ${VALIDATION.PASSWORD_MIN_LENGTH} znaków`,
                  },
                  maxLength: {
                    value: VALIDATION.PASSWORD_MAX_LENGTH,
                    message: `Hasło nie może przekraczać ${VALIDATION.PASSWORD_MAX_LENGTH} znaków`,
                  },
                  pattern: {
                    value: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).+$/,
                    message: 'Hasło musi zawierać co najmniej jedną wielką literę, małą literę i cyfrę',
                  },
                }}
              />
            </Grid>

            {/* Confirm Password */}
            <Grid item xs={12} md={6}>
              <FormField
                name="confirmPassword"
                control={control}
                label="Potwierdź hasło"
                type="password"
                required
                rules={{
                  minLength: {
                    value: VALIDATION.PASSWORD_MIN_LENGTH,
                    message: `Hasło musi mieć co najmniej ${VALIDATION.PASSWORD_MIN_LENGTH} znaków`,
                  },
                }}
              />
            </Grid>
          </Grid>

          {/* Form Actions */}
          <Box sx={{ mt: 3, display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
            <Button variant="outlined" onClick={() => navigate('/users')}>
              Anuluj
            </Button>
            <Button type="submit" variant="contained">
              Stwórz użytkownika
            </Button>
          </Box>
        </form>
      </Paper>
    </Container>
  );
}

export default CreateUserPage;
