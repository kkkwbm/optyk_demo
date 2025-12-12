import { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Typography,
  Box,
  Alert,
} from '@mui/material';
import { XCircle } from 'lucide-react';

/**
 * Dialog for rejecting a pending transfer
 * Destination location action
 */
const RejectTransferDialog = ({ open, onClose, onReject, transfer, loading }) => {
  const [rejectionReason, setRejectionReason] = useState('');
  const [error, setError] = useState('');

  const handleReject = () => {
    const trimmedReason = rejectionReason.trim();

    if (!trimmedReason) {
      setError('Powód odrzucenia jest wymagany');
      return;
    }

    if (trimmedReason.length > 500) {
      setError('Powód odrzucenia nie może przekraczać 500 znaków');
      return;
    }

    setError('');
    onReject({ rejectionReason: trimmedReason });
  };

  const handleClose = () => {
    setRejectionReason('');
    setError('');
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <XCircle size={24} color="red" />
          Odrzuć transfer
        </Box>
      </DialogTitle>
      <DialogContent>
        <Typography variant="body1" gutterBottom>
          Czy na pewno chcesz odrzucić ten transfer?
        </Typography>

        {transfer && (
          <Box sx={{ mt: 2, p: 2, bgcolor: 'background.default', borderRadius: 1 }}>
            <Typography variant="body2" color="text.secondary">
              <strong>Z:</strong> {transfer.fromLocation?.name || 'Brak danych'}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              <strong>Produkty:</strong> {transfer.transferItems?.length || 0} pozycji
            </Typography>
            {transfer.reason && (
              <Typography variant="body2" color="text.secondary">
                <strong>Powód:</strong> {transfer.reason}
              </Typography>
            )}
          </Box>
        )}

        {error && (
          <Alert severity="error" sx={{ mt: 2 }}>
            {error}
          </Alert>
        )}

        <TextField
          label="Powód odrzucenia *"
          multiline
          rows={4}
          fullWidth
          required
          value={rejectionReason}
          onChange={(e) => {
            setRejectionReason(e.target.value);
            setError('');
          }}
          placeholder="Proszę wyjaśnić, dlaczego odrzucasz ten transfer..."
          error={!!error}
          sx={{ mt: 2 }}
        />

        <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
          Produkty zostaną zwrócone do dostępnego stanu w lokalizacji źródłowej.
        </Typography>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} disabled={loading}>
          Anuluj
        </Button>
        <Button
          onClick={handleReject}
          variant="contained"
          color="error"
          disabled={loading || !rejectionReason.trim()}
        >
          {loading ? 'Odrzucanie...' : 'Odrzuć transfer'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default RejectTransferDialog;

