import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Container,
  Paper,
  Box,
  Button,
  Typography,
  Grid,
  Divider,
  CircularProgress,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Stepper,
  Step,
  StepLabel,
} from '@mui/material';
import { ArrowLeft, XCircle, ArrowRight, CheckCircle } from 'lucide-react';
import { formatDate } from '../../../utils/dateFormat';
import toast from 'react-hot-toast';
import PageHeader from '../../../shared/components/PageHeader';
import ConfirmDialog from '../../../shared/components/ConfirmDialog';
import {
  fetchTransferById,
  cancelTransfer,
  confirmTransfer,
  selectCurrentTransfer,
  selectTransfersLoading,
} from '../transfersSlice';
import {
  TRANSFER_STATUS,
  TRANSFER_STATUS_LABELS,
  DATE_FORMATS,
} from '../../../constants';

function TransferDetailsPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { id } = useParams();

  const transfer = useSelector(selectCurrentTransfer);
  const loading = useSelector(selectTransfersLoading);

  const [confirmDialog, setConfirmDialog] = useState({ open: false, action: null });

  useEffect(() => {
    if (id) {
      dispatch(fetchTransferById(id));
    }
  }, [dispatch, id]);

  const handleOpenConfirm = (action) => {
    setConfirmDialog({ open: true, action });
  };

  const handleCloseConfirm = () => {
    setConfirmDialog({ open: false, action: null });
  };

  const handleConfirmAction = async () => {
    const { action } = confirmDialog;
    try {
      if (action === 'cancel') {
        await dispatch(cancelTransfer({ id: transfer.id, cancellationReason: 'Cancelled by user' })).unwrap();
        toast.success('Transfer anulowany pomyślnie');
      } else if (action === 'complete') {
        await dispatch(
          confirmTransfer({ id: transfer.id, notes: 'Transfer completed' })
        ).unwrap();
        toast.success('Transfer ukończony pomyślnie');
      }
      dispatch(fetchTransferById(id));
    } catch (error) {
      toast.error(error || `Nie udało się ${action} transfer`);
    }
    handleCloseConfirm();
  };

  if (loading || !transfer) {
    return (
      <Container maxWidth="lg">
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 400 }}>
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  const getStatusColor = (status) => {
    switch (status) {
      case TRANSFER_STATUS.PENDING:
        return 'warning';
      case TRANSFER_STATUS.IN_TRANSIT:
        return 'info';
      case TRANSFER_STATUS.COMPLETED:
        return 'success';
      case TRANSFER_STATUS.CANCELLED:
        return 'error';
      default:
        return 'default';
    }
  };

  const getTransferNumber = () => {
    return `#${transfer.transferNumber || transfer.id.slice(0, 8)}`;
  };

  const getActiveStep = () => {
    switch (transfer.status) {
      case TRANSFER_STATUS.PENDING:
        return 0;
      case TRANSFER_STATUS.IN_TRANSIT:
        return 1;
      case TRANSFER_STATUS.COMPLETED:
        return 2;
      case TRANSFER_STATUS.CANCELLED:
        return -1;
      default:
        return 0;
    }
  };

  const steps = ['Oczekujący', 'W transporcie', 'Ukończony'];

  return (
    <Container maxWidth="lg">
      <PageHeader
        title={`Transfer ${getTransferNumber()}`}
        subtitle={`${transfer.fromLocation?.name} → ${transfer.toLocation?.name}`}
        breadcrumbs={[
          { label: 'Panel', to: '/' },
          { label: 'Transfery', to: '/transfers' },
          { label: getTransferNumber() },
        ]}
        actions={[
          {
            label: 'Wróć',
            icon: <ArrowLeft size={20} />,
            onClick: () => navigate('/transfers'),
            variant: 'outlined',
          },
        ]}
      />

      <Paper sx={{ p: 3, mb: 3 }}>
        {/* Status Indicator */}
        <Box sx={{ mb: 3 }}>
          <Chip
            label={TRANSFER_STATUS_LABELS[transfer.status]}
            color={getStatusColor(transfer.status)}
            size="large"
          />
        </Box>

        {/* Status Stepper */}
        {transfer.status !== TRANSFER_STATUS.CANCELLED && (
          <Box sx={{ mb: 3 }}>
            <Stepper activeStep={getActiveStep()}>
              {steps.map((label) => (
                <Step key={label}>
                  <StepLabel>{label}</StepLabel>
                </Step>
              ))}
            </Stepper>
          </Box>
        )}

        {/* Akcje */}
        <Box sx={{ mb: 3, display: 'flex', gap: 2 }}>
          {transfer.status === TRANSFER_STATUS.PENDING && (
            <>
              <Button
                variant="outlined"
                startIcon={<ArrowRight size={16} />}
                onClick={() => handleOpenConfirm('in_transit')}
              >
                Oznacz jako w transporcie
              </Button>
              <Button
                variant="outlined"
                color="error"
                startIcon={<XCircle size={16} />}
                onClick={() => handleOpenConfirm('cancel')}
              >
                Anuluj transfer
              </Button>
            </>
          )}
          {transfer.status === TRANSFER_STATUS.IN_TRANSIT && (
            <>
              <Button
                variant="contained"
                startIcon={<CheckCircle size={16} />}
                onClick={() => handleOpenConfirm('complete')}
              >
                Ukończ transfer
              </Button>
              <Button
                variant="outlined"
                color="error"
                startIcon={<XCircle size={16} />}
                onClick={() => handleOpenConfirm('cancel')}
              >
                Anuluj transfer
              </Button>
            </>
          )}
        </Box>

        <Divider sx={{ mb: 3 }} />

        {/* Informacje o transferze */}
        <Typography variant="h6" sx={{ mb: 2 }}>
          Informacje o transferze
        </Typography>
        <Grid container spacing={3} sx={{ mb: 3 }}>
          <Grid item xs={12} md={6}>
            <Typography variant="body2" color="text.secondary">
              Numer transferu
            </Typography>
            <Typography variant="body1" sx={{ mb: 2 }}>
              {getTransferNumber()}
            </Typography>
          </Grid>

          <Grid item xs={12} md={6}>
            <Typography variant="body2" color="text.secondary">
              Status
            </Typography>
            <Box sx={{ mb: 2 }}>
              <Chip
                label={TRANSFER_STATUS_LABELS[transfer.status]}
                color={getStatusColor(transfer.status)}
              />
            </Box>
          </Grid>

          <Grid item xs={12} md={6}>
            <Typography variant="body2" color="text.secondary">
              Lokalizacja źródłowa
            </Typography>
            <Typography variant="body1" sx={{ mb: 2 }}>
              {transfer.fromLocation?.name || '-'}
            </Typography>
          </Grid>

          <Grid item xs={12} md={6}>
            <Typography variant="body2" color="text.secondary">
              Lokalizacja docelowa
            </Typography>
            <Typography variant="body1" sx={{ mb: 2 }}>
              {transfer.toLocation?.name || '-'}
            </Typography>
          </Grid>

          <Grid item xs={12} md={6}>
            <Typography variant="body2" color="text.secondary">
              Utworzony przez
            </Typography>
            <Typography variant="body1" sx={{ mb: 2 }}>
              {`${transfer.user?.firstName || ''} ${transfer.user?.lastName || ''}`.trim() || '-'}
            </Typography>
          </Grid>

          <Grid item xs={12} md={6}>
            <Typography variant="body2" color="text.secondary">
              Utworzono
            </Typography>
            <Typography variant="body1" sx={{ mb: 2 }}>
              {formatDate(transfer.createdAt, DATE_FORMATS.DISPLAY_WITH_TIME)}
            </Typography>
          </Grid>

          <Grid item xs={12} md={6}>
            <Typography variant="body2" color="text.secondary">
              Powód
            </Typography>
            <Typography variant="body1" sx={{ mb: 2 }}>
              {transfer.reason || '-'}
            </Typography>
          </Grid>

          {transfer.notes && (
            <Grid item xs={12}>
              <Typography variant="body2" color="text.secondary">
                Notatki
              </Typography>
              <Typography variant="body1" sx={{ mb: 2 }}>
                {transfer.notes}
              </Typography>
            </Grid>
          )}
        </Grid>

        <Divider sx={{ mb: 3 }} />

        {/* Tabela produktów */}
        <Typography variant="h6" sx={{ mb: 2 }}>
          Produkty transferu
        </Typography>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontWeight: 600 }}>Produkt</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Marka</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Typ</TableCell>
                <TableCell align="right" sx={{ fontWeight: 600 }}>Ilość</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {transfer.items?.map((item, index) => (
                <TableRow key={index}>
                  <TableCell>
                    {item.productModel || item.productName || '-'}
                  </TableCell>
                  <TableCell>{item.brand?.name || '-'}</TableCell>
                  <TableCell>
                    <Chip
                      label={item.productType || 'Nieznany'}
                      size="small"
                      variant="outlined"
                    />
                  </TableCell>
                  <TableCell align="right">
                    <strong>{item.quantity}</strong>
                  </TableCell>
                </TableRow>
              ))}
              <TableRow>
                <TableCell colSpan={3} align="right">
                  <Typography variant="h6">Razem:</Typography>
                </TableCell>
                <TableCell align="right">
                  <Typography variant="h6" color="primary">
                    {transfer.items?.reduce((sum, item) => sum + item.quantity, 0) || 0}
                  </Typography>
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </TableContainer>

        <Divider sx={{ my: 3 }} />

        {/* Karty podsumowania */}
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6} md={4}>
            <Paper sx={{ p: 2, textAlign: 'center', bgcolor: 'primary.light', color: 'primary.contrastText' }}>
              <Typography variant="body2">Razem jednostek</Typography>
              <Typography variant="h5">
                {transfer.items?.reduce((sum, item) => sum + item.quantity, 0) || 0}
              </Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <Paper sx={{ p: 2, textAlign: 'center', bgcolor: 'success.light', color: 'success.contrastText' }}>
              <Typography variant="body2">Produkty</Typography>
              <Typography variant="h5">{transfer.items?.length || 0}</Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <Paper sx={{ p: 2, textAlign: 'center', bgcolor: 'info.light', color: 'info.contrastText' }}>
              <Typography variant="body2">Status</Typography>
              <Typography variant="h6">
                {TRANSFER_STATUS_LABELS[transfer.status]}
              </Typography>
            </Paper>
          </Grid>
        </Grid>
      </Paper>

      {/* Dialog potwierdzenia */}
      <ConfirmDialog
        open={confirmDialog.open}
        onClose={handleCloseConfirm}
        onConfirm={handleConfirmAction}
        title={
          confirmDialog.action === 'cancel'
            ? 'Anuluj transfer'
            : confirmDialog.action === 'complete'
            ? 'Ukończ transfer'
            : 'Zaktualizuj status transferu'
        }
        message={
          confirmDialog.action === 'cancel'
            ? `Czy na pewno chcesz anulować transfer ${getTransferNumber()}? Ta operacja nie może zostać cofnięta.`
            : confirmDialog.action === 'complete'
            ? `Czy na pewno chcesz oznaczyć transfer ${getTransferNumber()} jako ukończony? Spowoduje to aktualizację zapasów w obu lokalizacjach.`
            : `Czy na pewno chcesz oznaczyć transfer ${getTransferNumber()} jako w transporcie?`
        }
        confirmText={
          confirmDialog.action === 'cancel'
            ? 'Anuluj transfer'
            : confirmDialog.action === 'complete'
            ? 'Ukończ transfer'
            : 'Zaktualizuj status'
        }
        confirmColor={confirmDialog.action === 'cancel' ? 'error' : 'primary'}
      />
    </Container>
  );
}

export default TransferDetailsPage;
