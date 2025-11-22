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
} from '@mui/material';
import { CheckCircle } from 'lucide-react';

/**
 * Dialog for confirming a pending transfer
 * Destination location action
 */
const ConfirmTransferDialog = ({ open, onClose, onConfirm, transfer, loading }) => {
  const [notes, setNotes] = useState('');

  const handleConfirm = () => {
    onConfirm({ notes: notes.trim() || undefined });
  };

  const handleClose = () => {
    setNotes('');
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <CheckCircle size={24} color="green" />
          Confirm Transfer
        </Box>
      </DialogTitle>
      <DialogContent>
        <Typography variant="body1" gutterBottom>
          Are you sure you want to confirm this transfer?
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

        <TextField
          label="Notes (optional)"
          multiline
          rows={3}
          fullWidth
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Add any notes about this confirmation..."
          sx={{ mt: 2 }}
        />

        <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
          Products will be added to your inventory after confirmation.
        </Typography>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} disabled={loading}>
          Cancel
        </Button>
        <Button
          onClick={handleConfirm}
          variant="contained"
          color="success"
          disabled={loading}
        >
          {loading ? 'Confirming...' : 'Confirm Transfer'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ConfirmTransferDialog;
