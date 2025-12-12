import { memo } from 'react';
import { Grid } from '@mui/material';
import FormField from '../../../shared/components/FormField';

const ContactLensForm = memo(function ContactLensForm({ control, brands = [] }) {
  const brandOptions = brands.map((brand) => ({ value: brand.id, label: brand.name }));

  return (
    <Grid container spacing={3}>
      <Grid size={{ xs: 12, md: 6 }}>
        <FormField
          name="brandId"
          control={control}
          label="Marka"
          type="autocomplete"
          options={brandOptions}
          required
        />
      </Grid>
      <Grid size={{ xs: 12, md: 6 }}>
        <FormField name="model" control={control} label="Model" type="text" required />
      </Grid>
      <Grid size={{ xs: 12, md: 6 }}>
        <FormField
          name="lensType"
          control={control}
          label="Typ soczewki"
          type="select"
          options={[
            { value: 'DAILY', label: 'Jednorazowe' },
            { value: 'MONTHLY', label: 'Miesięczne' },
            { value: 'YEARLY', label: 'Roczne' },
          ]}
          required
        />
      </Grid>
      <Grid size={{ xs: 12, md: 6 }}>
        <FormField name="power" control={control} label="Moc" type="text" />
      </Grid>
      <Grid size={{ xs: 12, md: 6 }}>
        <FormField
          name="sellingPrice"
          control={control}
          label="Cena"
          type="number"
          required
          rules={{
            min: { value: 0, message: 'Cena musi być dodatnia' },
          }}
        />
      </Grid>
      <Grid size={{ xs: 12, md: 6 }}>
        <FormField
          name="quantity"
          control={control}
          label="Ilość"
          type="number"
          required
          rules={{
            min: { value: 0, message: 'Ilość nie może być ujemna' },
          }}
        />
      </Grid>
      <Grid size={{ xs: 12 }}>
        <FormField
          name="notes"
          control={control}
          label="Opis"
          type="text"
          multiline
          rows={2}
        />
      </Grid>
    </Grid>
  );
});

export default ContactLensForm;
