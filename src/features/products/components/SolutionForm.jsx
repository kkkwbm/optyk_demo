import { Grid } from '@mui/material';
import FormField from '../../../shared/components/FormField';

function SolutionForm({ control, brands = [] }) {
  const brandOptions = brands.map((brand) => ({ value: brand.id, label: brand.name }));

  return (
    <Grid container spacing={3}>
      <Grid size={{ xs: 12, md: 6 }}>
        <FormField
          name="brandId"
          control={control}
          label="Marka"
          type="select"
          options={brandOptions}
          required
        />
      </Grid>
      <Grid size={{ xs: 12, md: 6 }}>
        <FormField name="model" control={control} label="Model" type="text" required />
      </Grid>
      <Grid size={{ xs: 12, md: 4 }}>
        <FormField name="color" control={control} label="Kolor" type="text" required />
      </Grid>
      <Grid size={{ xs: 12, md: 4 }}>
        <FormField name="size" control={control} label="Rozmiar" type="text" required />
      </Grid>
      <Grid size={{ xs: 12, md: 4 }}>
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
      <Grid size={{ xs: 12 }}>
        <FormField
          name="notes"
          control={control}
          label="Opis"
          type="text"
          multiline
          rows={3}
        />
      </Grid>
    </Grid>
  );
}

export default SolutionForm;
