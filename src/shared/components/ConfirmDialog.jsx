import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  DialogContentText,
  Button,
  TextField,
  Box,
  Alert,
} from '@mui/material';
import { AlertTriangle } from 'lucide-react';
import { useState } from 'react';

/**
 * ConfirmDialog Component
 * Reusable confirmation modal with optional reason input
 *
 * @param {Object} props
 * @param {Boolean} props.open - Dialog open state
 * @param {Function} props.onClose - Close handler
 * @param {Function} props.onConfirm - Confirm handler
 * @param {String} props.title - Dialog title
 * @param {String} props.message - Dialog message
 * @param {String} props.confirmText - Confirm button text
 * @param {String} props.cancelText - Cancel button text
 * @param {String} props.confirmColor - Confirm button color
 * @param {Boolean} props.requireReason - Require reason input
 * @param {String} props.reasonLabel - Reason field label
 * @param {Boolean} props.loading - Loading state
 * @param {String} props.severity - Dialog severity (warning, error, info)
 * @param {Boolean} props.disabled - Disable confirm button
 * @param {String} props.disabledMessage - Message to show when disabled
 */
function ConfirmDialog({
  open = false,
  onClose,
  onConfirm,
  title = 'Potwierdź akcję',
  message = 'Czy jesteś pewny, że chcesz kontynuować?',
  confirmText = 'Potwierdź',
  cancelText = 'Anuluj',
  confirmColor = 'error',
  requireReason = false,
  reasonLabel = 'Powód',
  reasonPlaceholder = 'Proszę podaj powód...',
  loading = false,
  severity = 'warning',
  disabled = false,
  disabledMessage = '',
}) {
  const [reason, setReason] = useState('');
  const [error, setError] = useState('');

  const handleClose = () => {
    if (!loading) {
      setReason('');
      setError('');
      onClose?.();
    }
  };

  const handleConfirm = () => {
    if (requireReason && !reason.trim()) {
      setError('Powód jest wymagany');
      return;
    }

    onConfirm?.(reason.trim());
  };

  const handleReasonChange = (e) => {
    setReason(e.target.value);
    if (error) setError('');
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="sm"
      fullWidth
      aria-labelledby="confirm-dialog-title"
    >
      <DialogTitle id="confirm-dialog-title">
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          {severity === 'warning' && (
            <AlertTriangle size={24} color="#ed6c02" />
          )}
          {severity === 'error' && (
            <AlertTriangle size={24} color="#d32f2f" />
          )}
          {title}
        </Box>
      </DialogTitle>
      <DialogContent>
        <DialogContentText sx={{ mb: requireReason ? 2 : 0 }}>
          {message}
        </DialogContentText>
        {requireReason && (
          <TextField
            autoFocus
            fullWidth
            multiline
            rows={3}
            label={reasonLabel}
            placeholder={reasonPlaceholder}
            value={reason}
            onChange={handleReasonChange}
            error={!!error}
            helperText={error}
            disabled={loading || disabled}
          />
        )}
        {disabled && disabledMessage && (
          <Alert severity="info" sx={{ mt: 2 }}>
            {disabledMessage}
          </Alert>
        )}
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={handleClose} disabled={loading}>
          {cancelText}
        </Button>
        <Button
          onClick={handleConfirm}
          color={confirmColor}
          variant="contained"
          disabled={disabled || loading || (requireReason && !reason.trim())}
          autoFocus={!requireReason}
        >
          {loading ? 'Przetwarzanie...' : confirmText}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default ConfirmDialog;
