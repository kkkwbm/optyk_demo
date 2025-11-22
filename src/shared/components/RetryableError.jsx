import { Box, Paper, Typography, Button } from '@mui/material';
import { AlertCircle, RefreshCw } from 'lucide-react';

function RetryableError({ message = 'Nie udało się załadować danych', onRetry, compact = false }) {
  if (compact) {
    return (
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 2,
          p: 2,
          bgcolor: 'error.lighter',
          borderRadius: 1,
        }}
      >
        <AlertCircle size={24} color="#d32f2f" />
        <Typography variant="body2" color="error.main" sx={{ flex: 1 }}>
          {message}
        </Typography>
        {onRetry && (
          <Button
            size="small"
            variant="outlined"
            color="error"
            startIcon={<RefreshCw size={16} />}
            onClick={onRetry}
          >
            Ponów
          </Button>
        )}
      </Box>
    );
  }

  return (
    <Paper
      sx={{
        p: 4,
        textAlign: 'center',
        bgcolor: 'error.lighter',
        border: '1px solid',
        borderColor: 'error.light',
      }}
    >
      <Box sx={{ mb: 2 }}>
        <AlertCircle size={48} color="#d32f2f" />
      </Box>
      <Typography variant="h6" color="error.main" gutterBottom>
        {message}
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Coś poszło nie tak podczas ładowania danych. Spróbuj ponownie.
      </Typography>
      {onRetry && (
        <Button
          variant="contained"
          color="error"
          startIcon={<RefreshCw size={20} />}
          onClick={onRetry}
        >
          Ponów
        </Button>
      )}
    </Paper>
  );
}

export default RetryableError;
