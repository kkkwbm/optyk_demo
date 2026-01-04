import { Box, Paper, Skeleton } from '@mui/material';

function StoreComparisonTabSkeleton() {
  return (
    <Box>
      {/* Charts Row */}
      <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 3, mb: 3 }}>
        <Paper sx={{ p: 3, flex: 1 }}>
          <Skeleton variant="text" width={200} height={32} sx={{ mb: 2 }} />
          <Skeleton variant="rectangular" height={450} sx={{ borderRadius: 1 }} />
        </Paper>

        <Paper sx={{ p: 3, flex: 1 }}>
          <Skeleton variant="text" width={200} height={32} sx={{ mb: 2 }} />
          <Skeleton variant="rectangular" height={450} sx={{ borderRadius: 1 }} />
        </Paper>
      </Box>

      {/* Product Type Filter */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Skeleton variant="text" width={250} height={32} />
          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
            {[1, 2, 3, 4, 5].map((item) => (
              <Skeleton
                key={item}
                variant="rectangular"
                width={120}
                height={40}
                sx={{ borderRadius: 1 }}
              />
            ))}
          </Box>
        </Box>
        <Skeleton variant="rectangular" height={450} sx={{ borderRadius: 1 }} />
      </Paper>
    </Box>
  );
}

export default StoreComparisonTabSkeleton;
