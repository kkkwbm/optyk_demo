import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';
import { Container, Paper, Box, Button, Grid, CircularProgress } from '@mui/material';
import { ArrowLeft } from 'lucide-react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import PageHeader from '../../../shared/components/PageHeader';
import FormField from '../../../shared/components/FormField';
import { fetchUserById, updateUser, selectCurrentUser, selectUsersLoading } from '../usersSlice';
import { fetchActiveLocations, selectActiveLocations } from '../../locations/locationsSlice';
import { USER_ROLES, USER_ROLE_LABELS, VALIDATION } from '../../../constants';

function EditUserPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { id } = useParams();

  const user = useSelector(selectCurrentUser);
  const loading = useSelector(selectUsersLoading);
  const locations = useSelector(selectActiveLocations);

  const { control, handleSubmit, reset } = useForm({
    defaultValues: {
      email: '',
      firstName: '',
      lastName: '',
      phone: '',
      role: USER_ROLES.EMPLOYEE,
      locationId: '',
    },
  });

  useEffect(() => {
    dispatch(fetchActiveLocations());
    if (id) {
      dispatch(fetchUserById(id));
    }
  }, [dispatch, id]);

  useEffect(() => {
    if (user) {
      reset({
        email: user.email || '',
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        phone: user.phone || '',
        role: user.role || USER_ROLES.EMPLOYEE,
        locationId: user.location?.id || '',
      });
    }
  }, [user, reset]);

  const onSubmit = async (data) => {
    try {
      await dispatch(updateUser({ id, data })).unwrap();
      toast.success('Użytkownik został zaktualizowany');
      navigate(`/users/${id}`);
    } catch (error) {
      toast.error(error || 'Nie udało się zaktualizować użytkownika');
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

  if (loading || !user) {
    return (
      <Container maxWidth="lg">
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 400 }}>
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg">
      <PageHeader
        title="Edytuj użytkownika"
        subtitle={`Aktualizuj dane dla ${user.firstName} ${user.lastName}`}
        breadcrumbs={[
          { label: 'Pulpit', to: '/' },
          { label: 'Użytkownicy', to: '/users' },
          { label: `${user.firstName} ${user.lastName}`, to: `/users/${id}` },
          { label: 'Edytuj' },
        ]}
        actions={[
          {
            label: 'Wróć',
            icon: <ArrowLeft size={20} />,
            onClick: () => navigate(`/users/${id}`),
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
          </Grid>

          {/* Form Actions */}
          <Box sx={{ mt: 3, display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
            <Button variant="outlined" onClick={() => navigate(`/users/${id}`)}>
              Anuluj
            </Button>
            <Button type="submit" variant="contained">
              Zaktualizuj użytkownika
            </Button>
          </Box>
        </form>
      </Paper>
    </Container>
  );
}

export default EditUserPage;
