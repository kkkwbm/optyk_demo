import { Box, Paper, Typography, Skeleton } from '@mui/material';

function SalesTabSkeleton() {
  return (
    <Box>
      {/* Sales Trend Chart Skeleton */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Skeleton variant="text" width={200} height={32} sx={{ mb: 3 }} />
        <Box sx={{ mb: 3 }}>
          <Skeleton variant="rectangular" height={56} sx={{ borderRadius: 1 }} />
        </Box>
        <Skeleton
          variant="rectangular"
          height={400}
          sx={{ borderRadius: 1 }}
        />
      </Paper>

      {/* Sales by Brand Skeleton */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 3 }}>
          <Box>
            <Skeleton variant="text" width={180} height={32} />
            <Skeleton variant="text" width={250} height={20} />
          </Box>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Skeleton variant="rectangular" width={70} height={32} sx={{ borderRadius: 1 }} />
            <Skeleton variant="rectangular" width={70} height={32} sx={{ borderRadius: 1 }} />
            <Skeleton variant="rectangular" width={70} height={32} sx={{ borderRadius: 1 }} />
            <Skeleton variant="rectangular" width={90} height={32} sx={{ borderRadius: 1 }} />
          </Box>
        </Box>
        <Skeleton
          variant="rectangular"
          height={500}
          sx={{ borderRadius: 1 }}
        />
      </Paper>

      {/* Sales by Product Type Skeleton */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Skeleton variant="text" width={200} height={32} sx={{ mb: 2 }} />
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {[1, 2, 3, 4, 5].map((item) => (
            <Box
              key={item}
              sx={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                p: 2,
                bgcolor: (theme) => theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'grey.50',
                borderRadius: 1,
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Skeleton variant="circular" width={20} height={20} />
                <Skeleton variant="text" width={150} height={24} />
              </Box>
              <Box sx={{ display: 'flex', gap: 3 }}>
                <Box>
                  <Skeleton variant="text" width={80} height={20} />
                  <Skeleton variant="text" width={60} height={24} />
                </Box>
                <Box>
                  <Skeleton variant="text" width={80} height={20} />
                  <Skeleton variant="text" width={100} height={24} />
                </Box>
                <Box>
                  <Skeleton variant="text" width={100} height={20} />
                  <Skeleton variant="text" width={40} height={24} />
                </Box>
              </Box>
            </Box>
          ))}
        </Box>
      </Paper>

      {/* Sales by Locations Skeleton */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Skeleton variant="text" width={180} height={32} sx={{ mb: 2 }} />
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {[1, 2, 3, 4].map((item) => (
            <Box
              key={item}
              sx={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                p: 2,
                bgcolor: (theme) => theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'grey.50',
                borderRadius: 1,
              }}
            >
              <Box>
                <Skeleton variant="text" width={150} height={24} />
                <Skeleton variant="text" width={80} height={20} />
              </Box>
              <Box sx={{ display: 'flex', gap: 3 }}>
                <Box>
                  <Skeleton variant="text" width={100} height={20} />
                  <Skeleton variant="text" width={40} height={24} />
                </Box>
                <Box>
                  <Skeleton variant="text" width={100} height={20} />
                  <Skeleton variant="text" width={100} height={24} />
                </Box>
                <Box>
                  <Skeleton variant="text" width={90} height={20} />
                  <Skeleton variant="text" width={100} height={24} />
                </Box>
              </Box>
            </Box>
          ))}
        </Box>
      </Paper>
    </Box>
  );
}

export default SalesTabSkeleton;
