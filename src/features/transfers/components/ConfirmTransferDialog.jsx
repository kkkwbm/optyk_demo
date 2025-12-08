import { useState, useEffect, useMemo } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Typography,
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Alert,
  Chip,
} from '@mui/material';
import { CheckCircle, AlertTriangle, Package } from 'lucide-react';

/**
 * Dialog for confirming a pending transfer with partial acceptance support
 * Destination location action
 * User can specify how many of each item to accept
 */
const ConfirmTransferDialog = ({ open, onClose, onConfirm, transfer, loading }) => {
  const [notes, setNotes] = useState('');
  const [acceptedQuantities, setAcceptedQuantities] = useState({});

  // Initialize accepted quantities when transfer changes
  useEffect(() => {
    if (transfer?.items) {
      const initial = {};
      transfer.items.forEach((item) => {
        initial[item.id] = item.quantity;
      });
      setAcceptedQuantities(initial);
    }
  }, [transfer]);

  // Calculate summary stats
  const summary = useMemo(() => {
    if (!transfer?.items) return { total: 0, accepted: 0, rejected: 0, isPartial: false };

    let totalRequested = 0;
    let totalAccepted = 0;

    transfer.items.forEach((item) => {
      totalRequested += item.quantity;
      totalAccepted += acceptedQuantities[item.id] ?? item.quantity;
    });

    return {
      total: totalRequested,
      accepted: totalAccepted,
      rejected: totalRequested - totalAccepted,
      isPartial: totalAccepted > 0 && totalAccepted < totalRequested,
    };
  }, [transfer, acceptedQuantities]);

  const handleQuantityChange = (itemId, value) => {
    const item = transfer?.items?.find((i) => i.id === itemId);
    if (!item) return;

    // Clamp value between 0 and requested quantity
    const numValue = parseInt(value, 10);
    const clampedValue = Math.max(0, Math.min(isNaN(numValue) ? 0 : numValue, item.quantity));

    setAcceptedQuantities((prev) => ({
      ...prev,
      [itemId]: clampedValue,
    }));
  };

  const handleConfirm = () => {
    // Build accepted items array for partial acceptance
    const acceptedItems = transfer?.items?.map((item) => ({
      transferItemId: item.id,
      acceptedQuantity: acceptedQuantities[item.id] ?? item.quantity,
    }));

    onConfirm({
      notes: notes.trim() || undefined,
      acceptedItems: summary.isPartial || summary.rejected > 0 ? acceptedItems : undefined,
    });
  };

  const handleClose = () => {
    setNotes('');
    setAcceptedQuantities({});
    onClose();
  };

  const handleAcceptAll = () => {
    if (!transfer?.items) return;
    const all = {};
    transfer.items.forEach((item) => {
      all[item.id] = item.quantity;
    });
    setAcceptedQuantities(all);
  };

  const handleRejectAll = () => {
    if (!transfer?.items) return;
    const none = {};
    transfer.items.forEach((item) => {
      none[item.id] = 0;
    });
    setAcceptedQuantities(none);
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
      <DialogTitle>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <CheckCircle size={24} color="green" />
          Potwierdź odbiór transferu
        </Box>
      </DialogTitle>
      <DialogContent>
        {transfer && (
          <>
            {/* Transfer Info */}
            <Box sx={{ mb: 2, p: 2, bgcolor: 'background.default', borderRadius: 1 }}>
              <Typography variant="body2" color="text.secondary">
                <strong>Z:</strong> {transfer.fromLocation?.name || 'N/A'}
              </Typography>
              {transfer.reason && (
                <Typography variant="body2" color="text.secondary">
                  <strong>Powód:</strong> {transfer.reason}
                </Typography>
              )}
            </Box>

            {/* Instructions */}
            <Alert severity="info" sx={{ mb: 2 }}>
              Określ ilość każdego produktu, którą chcesz przyjąć. Produkty, których nie przyjmiesz, zostaną automatycznie zwrócone do sklepu źródłowego.
            </Alert>

            {/* Quick Actions */}
            <Box sx={{ mb: 2, display: 'flex', gap: 1 }}>
              <Button size="small" variant="outlined" onClick={handleAcceptAll}>
                Przyjmij wszystko
              </Button>
              <Button size="small" variant="outlined" color="error" onClick={handleRejectAll}>
                Odrzuć wszystko
              </Button>
            </Box>

            {/* Items Table */}
            <TableContainer component={Paper} variant="outlined" sx={{ mb: 2 }}>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Produkt</TableCell>
                    <TableCell>Marka</TableCell>
                    <TableCell align="center">Wysłano</TableCell>
                    <TableCell align="center">Przyjmuję</TableCell>
                    <TableCell align="center">Do zwrotu</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {transfer.items?.map((item) => {
                    const accepted = acceptedQuantities[item.id] ?? item.quantity;
                    const rejected = item.quantity - accepted;
                    return (
                      <TableRow key={item.id}>
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Package size={16} />
                            {item.productName || item.productModel}
                          </Box>
                        </TableCell>
                        <TableCell>{item.brand?.name || '-'}</TableCell>
                        <TableCell align="center">
                          <Chip label={item.quantity} size="small" />
                        </TableCell>
                        <TableCell align="center">
                          <TextField
                            type="number"
                            size="small"
                            value={accepted}
                            onChange={(e) => handleQuantityChange(item.id, e.target.value)}
                            inputProps={{
                              min: 0,
                              max: item.quantity,
                              style: { textAlign: 'center', width: 60 },
                            }}
                            sx={{ width: 80 }}
                          />
                        </TableCell>
                        <TableCell align="center">
                          {rejected > 0 ? (
                            <Chip label={rejected} size="small" color="warning" />
                          ) : (
                            <Chip label="0" size="small" variant="outlined" />
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </TableContainer>

            {/* Summary */}
            <Box sx={{ mb: 2, p: 2, bgcolor: summary.isPartial ? 'warning.lighter' : 'success.lighter', borderRadius: 1 }}>
              <Typography variant="subtitle2" sx={{ mb: 1 }}>
                Podsumowanie:
              </Typography>
              <Box sx={{ display: 'flex', gap: 2 }}>
                <Typography variant="body2">
                  <strong>Łącznie wysłano:</strong> {summary.total}
                </Typography>
                <Typography variant="body2" color="success.main">
                  <strong>Przyjmuję:</strong> {summary.accepted}
                </Typography>
                {summary.rejected > 0 && (
                  <Typography variant="body2" color="warning.main">
                    <strong>Do zwrotu:</strong> {summary.rejected}
                  </Typography>
                )}
              </Box>
            </Box>

            {/* Partial Acceptance Warning */}
            {summary.rejected > 0 && (
              <Alert severity="warning" icon={<AlertTriangle size={20} />} sx={{ mb: 2 }}>
                {summary.rejected} produktów zostanie automatycznie zwróconych do {transfer.fromLocation?.name}. Zostanie utworzony transfer zwrotny wymagający potwierdzenia.
              </Alert>
            )}

            {/* Notes */}
            <TextField
              label="Notatki (opcjonalnie)"
              multiline
              rows={2}
              fullWidth
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Dodaj uwagi do tego potwierdzenia..."
            />
          </>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} disabled={loading}>
          Anuluj
        </Button>
        <Button
          onClick={handleConfirm}
          variant="contained"
          color={summary.rejected > 0 ? 'warning' : 'success'}
          disabled={loading || summary.accepted === 0}
        >
          {loading
            ? 'Potwierdzanie...'
            : summary.rejected > 0
              ? `Potwierdź i zwróć ${summary.rejected}`
              : 'Potwierdź odbiór'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ConfirmTransferDialog;
