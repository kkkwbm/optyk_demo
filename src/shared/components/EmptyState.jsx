import { memo } from 'react';
import { Box, Paper, Typography, Button } from '@mui/material';
import { Package, Plus } from 'lucide-react';

const EmptyState = memo(function EmptyState({
  icon: Icon = Package,
  title = 'Brak danych',
  description = 'Zacznij od utworzenia nowego elementu',
  actionLabel,
  onAction,
  compact = false,
}) {
  if (compact) {
    return (
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          p: 4,
          textAlign: 'center',
        }}
      >
        <Icon size={40} color="#9e9e9e" style={{ marginBottom: 16 }} />
        <Typography variant="body1" color="text.secondary" gutterBottom>
          {title}
        </Typography>
        {description && (
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            {description}
          </Typography>
        )}
        {actionLabel && onAction && (
          <Button
            variant="contained"
            size="small"
            startIcon={<Plus size={16} />}
            onClick={onAction}
          >
            {actionLabel}
          </Button>
        )}
      </Box>
    );
  }

  return (
    <Paper
      sx={{
        p: 6,
        textAlign: 'center',
        bgcolor: 'grey.50',
        border: '1px dashed',
        borderColor: 'grey.300',
      }}
    >
      <Box sx={{ mb: 2 }}>
        <Icon size={64} color="#9e9e9e" />
      </Box>
      <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
        {title}
      </Typography>
      {description && (
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3, maxWidth: 500, mx: 'auto' }}>
          {description}
        </Typography>
      )}
      {actionLabel && onAction && (
        <Button variant="contained" startIcon={<Plus size={20} />} onClick={onAction}>
          {actionLabel}
        </Button>
      )}
    </Paper>
  );
});

export default EmptyState;
