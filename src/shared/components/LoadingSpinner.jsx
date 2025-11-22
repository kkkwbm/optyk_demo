import { Box, CircularProgress } from '@mui/material';

function LoadingSpinner({ size = 40 }) {
  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '200px',
        width: '100%',
      }}
    >
      <CircularProgress size={size} />
    </Box>
  );
}

export default LoadingSpinner;
