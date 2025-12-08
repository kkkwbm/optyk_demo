import { memo } from 'react';
import { Box, CircularProgress } from '@mui/material';

const LoadingSpinner = memo(function LoadingSpinner({ size = 40 }) {
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
});

export default LoadingSpinner;
