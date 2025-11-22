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
      setError('Rejection reason is required');
      return;
    }

    if (trimmedReason.length > 500) {
      setError('Rejection reason must not exceed 500 characters');
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
          Reject Transfer
        </Box>
      </DialogTitle>
      <DialogContent>
        <Typography variant="body1" gutterBottom>
          Are you sure you want to reject this transfer?
        </Typography>

        {transfer && (
          <Box sx={{ mt: 2, p: 2, bgcolor: 'background.default', borderRadius: 1 }}>
            <Typography variant="body2" color="text.secondary">
              <strong>From:</strong> {transfer.fromLocation?.name || 'N/A'}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              <strong>Products:</strong> {transfer.transferItems?.length || 0} items
            </Typography>
            {transfer.reason && (
              <Typography variant="body2" color="text.secondary">
                <strong>Reason:</strong> {transfer.reason}
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
          label="Rejection Reason *"
          multiline
          rows={4}
          fullWidth
          required
          value={rejectionReason}
          onChange={(e) => {
            setRejectionReason(e.target.value);
            setError('');
          }}
          placeholder="Please explain why you are rejecting this transfer..."
          error={!!error}
          sx={{ mt: 2 }}
        />

        <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
          Products will be returned to the source location's available stock.
        </Typography>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} disabled={loading}>
          Cancel
        </Button>
        <Button
          onClick={handleReject}
          variant="contained"
          color="error"
          disabled={loading || !rejectionReason.trim()}
        >
          {loading ? 'Rejecting...' : 'Reject Transfer'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default RejectTransferDialog;
