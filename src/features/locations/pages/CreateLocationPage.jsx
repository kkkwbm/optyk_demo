import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { Container, Paper, Box, Button, Grid } from '@mui/material';
import { ArrowLeft } from 'lucide-react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import PageHeader from '../../../shared/components/PageHeader';
import FormField from '../../../shared/components/FormField';
import { createLocation } from '../locationsSlice';
import { LOCATION_TYPES, LOCATION_TYPE_LABELS, VALIDATION } from '../../../constants';

function CreateLocationPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { control, handleSubmit } = useForm({
    defaultValues: {
      name: '',
      type: LOCATION_TYPES.STORE,
      address: '',
      city: '',
      postalCode: '',
      phone: '',
      email: '',
    },
  });

  const onSubmit = async (data) => {
    try {
      await dispatch(createLocation(data)).unwrap();
      toast.success('Lokalizacja została utworzona');
      navigate('/locations');
    } catch (error) {
      toast.error(error || 'Nie udało się utworzyć lokalizacji');
    }
  };

  const typeOptions = Object.values(LOCATION_TYPES).map((type) => ({
    value: type,
    label: LOCATION_TYPE_LABELS[type],
  }));

  return (
    <Container maxWidth="lg">
      <PageHeader
        title="Utwórz nową lokalizację"
        subtitle="Utwórz nowy salon lub magazyn"
        breadcrumbs={[
          { label: 'Pulpit', to: '/' },
          { label: 'Lokalizacje', to: '/locations' },
          { label: 'Utwórz nową lokalizację' },
        ]}
        actions={[
          {
            label: 'Wróć',
            icon: <ArrowLeft size={20} />,
            onClick: () => navigate('/locations'),
            variant: 'outlined',
          },
        ]}
      />

      <Paper sx={{ p: 3 }}>
        <form onSubmit={handleSubmit(onSubmit)}>
          <Grid container spacing={3}>
            {/* Name */}
            <Grid item xs={12} md={6}>
              <FormField
                name="name"
                control={control}
                label="Nazwa lokalizacji"
                type="text"
                required
                rules={{
                  maxLength: {
                    value: VALIDATION.NAME_MAX_LENGTH,
                    message: `Nazwa nie może przekroczyć ${VALIDATION.NAME_MAX_LENGTH} znaków`,
                  },
                }}
              />
            </Grid>

            {/* Type */}
            <Grid item xs={12} md={6}>
              <FormField
                name="type"
                control={control}
                label="Typ"
                type="select"
                options={typeOptions}
                required
              />
            </Grid>

            {/* Address */}
            <Grid item xs={12}>
              <FormField
                name="address"
                control={control}
                label="Adres"
                type="text"
                required
                rules={{
                  maxLength: {
                    value: 200,
                    message: 'Adres nie może przekroczyć 200 znaków',
                  },
                }}
              />
            </Grid>

            {/* City */}
            <Grid item xs={12} md={6}>
              <FormField
                name="city"
                control={control}
                label="Miasto"
                type="text"
                required
                rules={{
                  maxLength: {
                    value: VALIDATION.NAME_MAX_LENGTH,
                    message: `Miasto nie może przekroczyć ${VALIDATION.NAME_MAX_LENGTH} znaków`,
                  },
                }}
              />
            </Grid>

            {/* Postal Code */}
            <Grid item xs={12} md={6}>
              <FormField
                name="postalCode"
                control={control}
                label="Kod pocztowy"
                type="text"
                rules={{
                  maxLength: {
                    value: 20,
                    message: 'Kod pocztowy nie może przekroczyć 20 znaków',
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
                    message: `Telefon nie może przekroczyć ${VALIDATION.PHONE_MAX_LENGTH} znaków`,
                  },
                }}
              />
            </Grid>

            {/* Email */}
            <Grid item xs={12} md={6}>
              <FormField
                name="email"
                control={control}
                label="Email"
                type="email"
                rules={{
                  pattern: {
                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                    message: 'Nieprawidłowy adres email',
                  },
                  maxLength: {
                    value: VALIDATION.EMAIL_MAX_LENGTH,
                    message: `Email nie może przekroczyć ${VALIDATION.EMAIL_MAX_LENGTH} znaków`,
                  },
                }}
              />
            </Grid>
          </Grid>

          {/* Form Actions */}
          <Box sx={{ mt: 3, display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
            <Button variant="outlined" onClick={() => navigate('/locations')}>
              Anuluj
            </Button>
            <Button type="submit" variant="contained">
              Utwórz lokalizację
            </Button>
          </Box>
        </form>
      </Paper>
    </Container>
  );
}

export default CreateLocationPage;
