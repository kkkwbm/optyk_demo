import { Paper, Box, Skeleton, Grid } from '@mui/material';

function FormSkeleton({ fields = 6 }) {
  return (
    <Paper sx={{ p: 3 }}>
      <Grid container spacing={3}>
        {Array.from({ length: fields }).map((_, index) => (
          <Grid item xs={12} md={6} key={index}>
            <Skeleton variant="text" width="30%" height={24} sx={{ mb: 1 }} />
            <Skeleton variant="rectangular" width="100%" height={56} />
          </Grid>
        ))}
      </Grid>
      <Box sx={{ mt: 3, display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
        <Skeleton variant="rectangular" width={100} height={42} />
        <Skeleton variant="rectangular" width={120} height={42} />
      </Box>
    </Paper>
  );
}

export default FormSkeleton;
