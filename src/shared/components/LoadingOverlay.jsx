import { Box, CircularProgress, Typography, Backdrop } from '@mui/material';

function LoadingOverlay({ open = true, message = 'Loading...', fullScreen = false }) {
  if (fullScreen) {
    return (
      <Backdrop
        open={open}
        sx={{
          color: '#fff',
          zIndex: (theme) => theme.zIndex.drawer + 1,
          flexDirection: 'column',
          gap: 2,
        }}
      >
        <CircularProgress color="inherit" size={60} />
        {message && (
          <Typography variant="h6" color="inherit">
            {message}
          </Typography>
        )}
      </Backdrop>
    );
  }

  if (!open) return null;

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: 300,
        gap: 2,
      }}
    >
      <CircularProgress size={50} />
      {message && (
        <Typography variant="body1" color="text.secondary">
          {message}
        </Typography>
      )}
    </Box>
  );
}

export default LoadingOverlay;
