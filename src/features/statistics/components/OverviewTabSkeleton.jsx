import { Box, Paper, Typography, Grid, Skeleton } from '@mui/material';

function OverviewTabSkeleton() {
  return (
    <Box>
      {/* Sales Section Skeleton */}
      <Paper
        sx={{
          mb: 3,
          overflow: 'hidden',
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        }}
      >
        <Box sx={{ p: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
            <Skeleton
              variant="rectangular"
              width={56}
              height={56}
              sx={{ borderRadius: 2, bgcolor: 'rgba(255,255,255,0.2)' }}
            />
            <Box sx={{ flex: 1 }}>
              <Skeleton
                variant="text"
                width={120}
                height={32}
                sx={{ bgcolor: 'rgba(255,255,255,0.3)' }}
              />
              <Skeleton
                variant="text"
                width={250}
                height={20}
                sx={{ bgcolor: 'rgba(255,255,255,0.2)' }}
              />
            </Box>
          </Box>

          <Grid container spacing={3}>
            {[1, 2, 3].map((item) => (
              <Grid item xs={12} sm={4} key={item}>
                <Box
                  sx={{
                    p: 2.5,
                    borderRadius: 2,
                    bgcolor: 'rgba(255,255,255,0.15)',
                  }}
                >
                  <Skeleton
                    variant="text"
                    width={100}
                    height={24}
                    sx={{ bgcolor: 'rgba(255,255,255,0.3)', mb: 1 }}
                  />
                  <Skeleton
                    variant="text"
                    width="80%"
                    height={48}
                    sx={{ bgcolor: 'rgba(255,255,255,0.4)' }}
                  />
                </Box>
              </Grid>
            ))}
          </Grid>
        </Box>

        {/* Product Type Breakdown Skeleton */}
        <Box sx={{ bgcolor: 'background.paper', p: 3 }}>
          <Skeleton variant="text" width={200} height={24} sx={{ mb: 2 }} />
          <Grid container spacing={2}>
            {[1, 2, 3, 4, 5].map((item) => (
              <Grid item xs={12} sm={6} md={2.4} key={item}>
                <Paper
                  variant="outlined"
                  sx={{
                    p: 3,
                    borderRadius: 2,
                    height: 200,
                    width: 180,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Skeleton
                    variant="rectangular"
                    width={56}
                    height={56}
                    sx={{ borderRadius: 2, mb: 2 }}
                  />
                  <Skeleton variant="text" width={100} height={24} sx={{ mb: 2 }} />
                  <Skeleton variant="text" width={80} height={32} sx={{ mb: 0.5 }} />
                  <Skeleton variant="text" width={100} height={28} />
                </Paper>
              </Grid>
            ))}
          </Grid>
        </Box>
      </Paper>

      {/* Transfers Section Skeleton */}
      <Paper
        sx={{
          mb: 3,
          overflow: 'hidden',
          background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
        }}
      >
        <Box sx={{ p: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
            <Skeleton
              variant="rectangular"
              width={56}
              height={56}
              sx={{ borderRadius: 2, bgcolor: 'rgba(255,255,255,0.2)' }}
            />
            <Box sx={{ flex: 1 }}>
              <Skeleton
                variant="text"
                width={120}
                height={32}
                sx={{ bgcolor: 'rgba(255,255,255,0.3)' }}
              />
              <Skeleton
                variant="text"
                width={300}
                height={20}
                sx={{ bgcolor: 'rgba(255,255,255,0.2)' }}
              />
            </Box>
          </Box>
        </Box>

        <Box sx={{ bgcolor: 'background.paper', p: 3 }}>
          <Skeleton variant="text" width={180} height={24} sx={{ mb: 2 }} />
          <Grid container spacing={2}>
            {[1, 2, 3].map((item) => (
              <Grid item xs={12} sm={6} md={4} key={item}>
                <Paper
                  variant="outlined"
                  sx={{
                    p: 2,
                    borderRadius: 2,
                    height: 120,
                    width: 180,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Skeleton
                    variant="rectangular"
                    width={36}
                    height={36}
                    sx={{ borderRadius: 1.5, mb: 1 }}
                  />
                  <Skeleton variant="text" width={60} height={32} sx={{ mb: 0.5 }} />
                  <Skeleton variant="text" width={100} height={20} />
                </Paper>
              </Grid>
            ))}
          </Grid>
        </Box>
      </Paper>

      {/* Products Section Skeleton */}
      <Paper
        sx={{
          mb: 3,
          overflow: 'hidden',
          background: 'linear-gradient(135deg, #90a4ae 0%, #b0bec5 100%)',
        }}
      >
        <Box sx={{ p: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
            <Skeleton
              variant="rectangular"
              width={56}
              height={56}
              sx={{ borderRadius: 2, bgcolor: 'rgba(255,255,255,0.2)' }}
            />
            <Box sx={{ flex: 1 }}>
              <Skeleton
                variant="text"
                width={150}
                height={32}
                sx={{ bgcolor: 'rgba(255,255,255,0.3)' }}
              />
              <Skeleton
                variant="text"
                width={250}
                height={20}
                sx={{ bgcolor: 'rgba(255,255,255,0.2)' }}
              />
            </Box>
          </Box>

          <Grid container spacing={3}>
            {[1, 2].map((item) => (
              <Grid item xs={12} sm={6} key={item}>
                <Box
                  sx={{
                    p: 2,
                    borderRadius: 2,
                    bgcolor: 'rgba(255,255,255,0.1)',
                  }}
                >
                  <Skeleton
                    variant="text"
                    width={120}
                    height={48}
                    sx={{ bgcolor: 'rgba(255,255,255,0.4)' }}
                  />
                  <Skeleton
                    variant="text"
                    width={150}
                    height={20}
                    sx={{ bgcolor: 'rgba(255,255,255,0.3)' }}
                  />
                </Box>
              </Grid>
            ))}
          </Grid>
        </Box>

        <Box sx={{ bgcolor: 'background.paper', p: 3 }}>
          <Skeleton variant="text" width={180} height={24} sx={{ mb: 2 }} />
          <Grid container spacing={2}>
            {[1, 2, 3, 4, 5, 6].map((item) => (
              <Grid item xs={6} sm={4} md={2} key={item}>
                <Paper
                  variant="outlined"
                  sx={{
                    p: 2,
                    borderRadius: 2,
                    height: 120,
                    width: 180,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Skeleton
                    variant="rectangular"
                    width={36}
                    height={36}
                    sx={{ borderRadius: 1.5, mb: 1 }}
                  />
                  <Skeleton variant="text" width={60} height={32} sx={{ mb: 0.5 }} />
                  <Skeleton variant="text" width={80} height={20} />
                </Paper>
              </Grid>
            ))}
          </Grid>
        </Box>
      </Paper>
    </Box>
  );
}

export default OverviewTabSkeleton;
