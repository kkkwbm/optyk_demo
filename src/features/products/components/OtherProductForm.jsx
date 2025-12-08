import { memo } from 'react';
import { Grid } from '@mui/material';
import FormField from '../../../shared/components/FormField';

const OtherProductForm = memo(function OtherProductForm({ control }) {
  return (
    <Grid container spacing={3}>
      <Grid size={{ xs: 12, md: 6 }}>
        <FormField name="name" control={control} label="Nazwa" type="text" required />
      </Grid>
      <Grid size={{ xs: 12, md: 6 }}>
        <FormField
          name="quantity"
          control={control}
          label="Ilość"
          type="number"
          required
          rules={{
            min: { value: 1, message: 'Ilość musi być większa niż 0' },
          }}
        />
      </Grid>
      <Grid size={{ xs: 12 }}>
        <FormField
          name="description"
          control={control}
          label="Opis"
          type="text"
          multiline
          rows={4}
        />
      </Grid>
    </Grid>
  );
});

export default OtherProductForm;
