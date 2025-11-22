import { Container, Grid, Skeleton, Paper, Box } from '@mui/material';

function DashboardSkeleton() {
  return (
    <Container maxWidth="xl">
      {/* Header Skeleton */}
      <Box sx={{ mb: 4 }}>
        <Skeleton variant="text" width={300} height={48} sx={{ mb: 1 }} />
        <Skeleton variant="text" width={200} height={24} />
      </Box>

      {/* Metrics Cards Skeleton */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {Array.from({ length: 4 }).map((_, index) => (
          <Grid item xs={12} sm={6} md={3} key={index}>
            <Paper sx={{ p: 3 }}>
              <Skeleton variant="text" width="60%" height={24} sx={{ mb: 1 }} />
              <Skeleton variant="text" width="80%" height={40} sx={{ mb: 1 }} />
              <Skeleton variant="text" width="40%" height={20} />
            </Paper>
          </Grid>
        ))}
      </Grid>

      {/* Charts and Tables Skeleton */}
      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 3 }}>
            <Skeleton variant="text" width={200} height={32} sx={{ mb: 2 }} />
            <Skeleton variant="rectangular" width="100%" height={300} />
          </Paper>
        </Grid>
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3 }}>
            <Skeleton variant="text" width={150} height={32} sx={{ mb: 2 }} />
            {Array.from({ length: 5 }).map((_, index) => (
              <Box key={index} sx={{ mb: 2 }}>
                <Skeleton variant="text" width="80%" />
                <Skeleton variant="text" width="60%" />
              </Box>
            ))}
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
}

export default DashboardSkeleton;
