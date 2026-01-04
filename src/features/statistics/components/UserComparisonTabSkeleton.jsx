import { Box, Paper, Skeleton } from '@mui/material';

function UserComparisonTabSkeleton() {
  return (
    <Box>
      <Paper sx={{ p: 3, mb: 3 }}>
        <Skeleton variant="text" width={200} height={32} sx={{ mb: 2 }} />
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {[1, 2, 3, 4, 5, 6].map((item) => (
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
                <Skeleton variant="text" width={180} height={20} />
              </Box>
              <Box sx={{ display: 'flex', gap: 3 }}>
                <Box>
                  <Skeleton variant="text" width={100} height={20} />
                  <Skeleton variant="text" width={40} height={24} />
                </Box>
                <Box>
                  <Skeleton variant="text" width={120} height={20} />
                  <Skeleton variant="text" width={100} height={24} />
                </Box>
                <Box>
                  <Skeleton variant="text" width={120} height={20} />
                  <Skeleton variant="text" width={100} height={24} />
                </Box>
                <Box>
                  <Skeleton variant="text" width={120} height={20} />
                  <Skeleton variant="text" width={40} height={24} />
                </Box>
              </Box>
            </Box>
          ))}
        </Box>
      </Paper>
    </Box>
  );
}

export default UserComparisonTabSkeleton;
