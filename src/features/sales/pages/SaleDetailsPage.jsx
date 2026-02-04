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
} from '@mui/material';
import { ArrowLeft, XCircle, FileText } from 'lucide-react';
import { formatDate } from '../../../utils/dateFormat';
import toast from 'react-hot-toast';
import PageHeader from '../../../shared/components/PageHeader';
import ConfirmDialog from '../../../shared/components/ConfirmDialog';
import SalePdfModal from '../components/SalePdfModal';
import {
  fetchSaleById,
  cancelSale,
  selectCurrentSale,
  selectSalesLoading,
} from '../salesSlice';
import {
  SALE_STATUS,
  SALE_STATUS_LABELS,
  DATE_FORMATS,
} from '../../../constants';

function SaleDetailsPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { id } = useParams();

  const sale = useSelector(selectCurrentSale);
  const loading = useSelector(selectSalesLoading);

  const [confirmDialog, setConfirmDialog] = useState({ open: false });
  const [pdfModalOpen, setPdfModalOpen] = useState(false);

  useEffect(() => {
    if (id) {
      dispatch(fetchSaleById(id));
    }
  }, [dispatch, id]);

  const handleOpenConfirm = () => {
    setConfirmDialog({ open: true });
  };

  const handleCloseConfirm = () => {
    setConfirmDialog({ open: false });
  };

  const handleConfirmCancel = async () => {
    try {
      await dispatch(cancelSale({ id: sale.id })).unwrap();
      toast.success('Sprzedaż została anulowana');
      dispatch(fetchSaleById(id));
    } catch (error) {
      toast.error(error || 'Nie udało się anulować sprzedaży');
    }
    handleCloseConfirm();
  };

  if (loading || !sale) {
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
      case SALE_STATUS.COMPLETED:
        return 'success';
      case SALE_STATUS.CANCELLED:
        return 'error';
      case SALE_STATUS.RETURNED:
        return 'warning';
      case SALE_STATUS.PARTIALLY_RETURNED:
        return 'info';
      default:
        return 'default';
    }
  };

  const getSaleNumber = () => {
    return `#${sale.saleNumber || sale.id.slice(0, 8)}`;
  };

  return (
    <Container maxWidth="lg">
      <PageHeader
        title={`Sprzedaż ${getSaleNumber()}`}
        subtitle={`${SALE_STATUS_LABELS[sale.status]} - ${formatDate(sale.createdAt, DATE_FORMATS.DISPLAY_WITH_TIME)}`}
        breadcrumbs={[
          { label: 'Panel', to: '/' },
          { label: 'Sprzedaż', to: '/sales' },
          { label: getSaleNumber() },
        ]}
        actions={[
          {
            label: 'Wróć',
            icon: <ArrowLeft size={20} />,
            onClick: () => navigate('/sales'),
            variant: 'outlined',
          },
        ]}
      />

      <Paper sx={{ p: 3, mb: 3 }}>
        {/* Akcje */}
        <Box sx={{ mb: 3, display: 'flex', gap: 2 }}>
          <Button
            variant="outlined"
            color="primary"
            startIcon={<FileText size={16} />}
            onClick={() => setPdfModalOpen(true)}
          >
            Generuj PDF
          </Button>
          {sale.status === SALE_STATUS.COMPLETED && (
            <Button
              variant="outlined"
              color="error"
              startIcon={<XCircle size={16} />}
              onClick={handleOpenConfirm}
            >
              Anuluj sprzedaż
            </Button>
          )}
        </Box>

        <Divider sx={{ mb: 3 }} />

        {/* Informacje sprzedaży */}
        <Typography variant="h6" sx={{ mb: 2 }}>
          Informacje sprzedaży
        </Typography>
        <Grid container spacing={3} sx={{ mb: 3 }}>
          <Grid item xs={12} md={6}>
            <Typography variant="body2" color="text.secondary">
              Numer sprzedaży
            </Typography>
            <Typography variant="body1" sx={{ mb: 2 }}>
              {getSaleNumber()}
            </Typography>
          </Grid>

          <Grid item xs={12} md={6}>
            <Typography variant="body2" color="text.secondary">
              Status
            </Typography>
            <Box sx={{ mb: 2 }}>
              <Chip
                label={SALE_STATUS_LABELS[sale.status]}
                color={getStatusColor(sale.status)}
              />
            </Box>
          </Grid>

          <Grid item xs={12} md={6}>
            <Typography variant="body2" color="text.secondary">
              Lokalizacja
            </Typography>
            <Typography variant="body1" sx={{ mb: 2 }}>
              {sale.location?.name || '-'}
            </Typography>
          </Grid>

          <Grid item xs={12} md={6}>
            <Typography variant="body2" color="text.secondary">
              Sprzedawca
            </Typography>
            <Typography variant="body1" sx={{ mb: 2 }}>
              {sale.userFullName || '-'}
            </Typography>
          </Grid>

          <Grid item xs={12} md={6}>
            <Typography variant="body2" color="text.secondary">
              Data i godzina
            </Typography>
            <Typography variant="body1" sx={{ mb: 2 }}>
              {formatDate(sale.createdAt, DATE_FORMATS.DISPLAY_WITH_TIME)}
            </Typography>
          </Grid>

          {(sale.customerFirstName || sale.customerLastName) && (
            <Grid item xs={12} md={6}>
              <Typography variant="body2" color="text.secondary">
                Klient
              </Typography>
              <Typography variant="body1" sx={{ mb: 2 }}>
                {[sale.customerFirstName, sale.customerLastName].filter(Boolean).join(' ')}
              </Typography>
            </Grid>
          )}

          {sale.notes && (
            <Grid item xs={12}>
              <Typography variant="body2" color="text.secondary">
                Notatki
              </Typography>
              <Typography variant="body1" sx={{ mb: 2 }}>
                {sale.notes}
              </Typography>
            </Grid>
          )}
        </Grid>

        <Divider sx={{ mb: 3 }} />

        {/* Tabela produktów */}
        <Typography variant="h6" sx={{ mb: 2 }}>
          Produkty
        </Typography>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontWeight: 600 }}>Produkt</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Marka</TableCell>
                <TableCell align="right" sx={{ fontWeight: 600 }}>Ilość</TableCell>
                <TableCell align="right" sx={{ fontWeight: 600 }}>Cena jednostkowa</TableCell>
                <TableCell align="right" sx={{ fontWeight: 600 }}>Suma</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {sale.items?.map((item, index) => (
                <TableRow key={index}>
                  <TableCell>
                    <Box>
                      {item.product?.model || item.productModel || item.productName || '-'}
                      {item.isCustomEyeglassLens && item.eyeglassLensNotes && (
                        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                          {item.eyeglassLensNotes}
                        </Typography>
                      )}
                    </Box>
                  </TableCell>
                  <TableCell>{item.product?.brand?.name || item.brand?.name || '-'}</TableCell>
                  <TableCell align="right">{item.quantity}</TableCell>
                  <TableCell align="right">{item.unitPrice.toFixed(2)} zł</TableCell>
                  <TableCell align="right">
                    <strong>{(item.quantity * item.unitPrice).toFixed(2)} zł</strong>
                  </TableCell>
                </TableRow>
              ))}
              <TableRow>
                <TableCell colSpan={4} align="right">
                  <Typography variant="h6">Suma:</Typography>
                </TableCell>
                <TableCell align="right">
                  <Typography variant="h6" color="primary">
                    {sale.totalAmount?.toFixed(2)} zł
                  </Typography>
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </TableContainer>

        <Divider sx={{ my: 3 }} />

        {/* Podsumowanie */}
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6} md={4}>
            <Paper sx={{ p: 2, textAlign: 'center', bgcolor: 'primary.light', color: 'primary.contrastText' }}>
              <Typography variant="body2">Łączna ilość</Typography>
              <Typography variant="h5">
                {sale.items?.reduce((sum, item) => sum + item.quantity, 0) || 0}
              </Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <Paper sx={{ p: 2, textAlign: 'center', bgcolor: 'success.light', color: 'success.contrastText' }}>
              <Typography variant="body2">Produkty</Typography>
              <Typography variant="h5">{sale.items?.length || 0}</Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <Paper sx={{ p: 2, textAlign: 'center', bgcolor: 'secondary.light', color: 'secondary.contrastText' }}>
              <Typography variant="body2">Suma całkowita</Typography>
              <Typography variant="h5">{sale.totalAmount?.toFixed(2)} zł</Typography>
            </Paper>
          </Grid>
        </Grid>
      </Paper>

      {/* Dialog potwierdzenia */}
      <ConfirmDialog
        open={confirmDialog.open}
        onClose={handleCloseConfirm}
        onConfirm={handleConfirmCancel}
        title="Anuluj sprzedaż"
        message={`Czy na pewno chcesz anulować sprzedaż ${getSaleNumber()}? Spowoduje to zwrot wszystkich produktów do magazynu.`}
        confirmText="Anuluj sprzedaż"
        confirmColor="error"
      />

      {/* Modal generowania PDF */}
      <SalePdfModal
        open={pdfModalOpen}
        onClose={() => setPdfModalOpen(false)}
        sale={sale}
      />
    </Container>
  );
}

export default SaleDetailsPage;
