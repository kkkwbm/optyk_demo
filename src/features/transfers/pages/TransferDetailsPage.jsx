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
  TextField,
  IconButton,
  Autocomplete,
} from '@mui/material';
import { ArrowLeft, XCircle, ArrowRight, CheckCircle, Edit, Save, X, Trash2, Plus } from 'lucide-react';
import { formatDate } from '../../../utils/dateFormat';
import toast from 'react-hot-toast';
import PageHeader from '../../../shared/components/PageHeader';
import ConfirmDialog from '../../../shared/components/ConfirmDialog';
import transferService from '../../../services/transferService';
import productService from '../../../services/productService';
import locationService from '../../../services/locationService';
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
  const [isEditing, setIsEditing] = useState(false);
  const [editedReason, setEditedReason] = useState('');
  const [editedNotes, setEditedNotes] = useState('');
  const [editedItems, setEditedItems] = useState([]);
  const [editedFromLocationId, setEditedFromLocationId] = useState(null);
  const [editedToLocationId, setEditedToLocationId] = useState(null);
  const [availableProducts, setAvailableProducts] = useState([]);
  const [availableLocations, setAvailableLocations] = useState([]);

  useEffect(() => {
    if (id) {
      dispatch(fetchTransferById(id));
    }
  }, [dispatch, id]);

  useEffect(() => {
    if (transfer) {
      setEditedReason(transfer.reason || '');
      setEditedNotes(transfer.notes || '');
      setEditedFromLocationId(transfer.fromLocation?.id || null);
      setEditedToLocationId(transfer.toLocation?.id || null);

      // Initialize edited items from transfer - mark as original (read-only)
      const items = transfer.items?.map(item => ({
        productId: item.productId || item.product?.id,
        productName: item.productModel || item.productName || item.product?.model,
        brand: item.brand,
        productType: item.productType,
        quantity: item.quantity,
        isOriginal: true, // Mark existing items as original
      })) || [];
      setEditedItems(items);
    }
  }, [transfer]);

  // Fetch available products and locations when entering edit mode
  useEffect(() => {
    if (isEditing && transfer) {
      fetchProducts();
      fetchLocations();
    }
  }, [isEditing, transfer]);

  // Refresh products when fromLocation changes in edit mode
  useEffect(() => {
    if (isEditing && editedFromLocationId) {
      fetchProducts();
    }
  }, [editedFromLocationId]);

  const fetchProducts = async () => {
    try {
      // Fetch all products from source location (fromLocation)
      const response = await productService.getAllProducts({
        page: 0,
        size: 1000,
        locationId: editedFromLocationId,
      });
      setAvailableProducts(response.data.content || []);
    } catch (error) {
      console.error('Failed to fetch products:', error);
      toast.error('Nie udało się pobrać listy produktów');
    }
  };

  const fetchLocations = async () => {
    try {
      const response = await locationService.getLocations({
        page: 0,
        size: 1000,
        status: 'ACTIVE'
      });

      console.log('Locations response:', response);

      // Handle different response structures
      const locations = response.data?.content || response.data?.data || response.data || [];
      console.log('Extracted locations:', locations);

      setAvailableLocations(locations);
    } catch (error) {
      console.error('Failed to fetch locations:', error);
      toast.error('Nie udało się pobrać listy lokalizacji');
    }
  };

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

  const handleEditToggle = () => {
    if (isEditing) {
      // Cancel editing - reset values
      setEditedReason(transfer.reason || '');
      setEditedNotes(transfer.notes || '');
      setEditedFromLocationId(transfer.fromLocation?.id || null);
      setEditedToLocationId(transfer.toLocation?.id || null);

      const items = transfer.items?.map(item => ({
        productId: item.productId || item.product?.id,
        productName: item.productModel || item.productName || item.product?.model,
        brand: item.brand,
        productType: item.productType,
        quantity: item.quantity,
        isOriginal: true,
      })) || [];
      setEditedItems(items);
    }
    setIsEditing(!isEditing);
  };

  const handleSaveEdit = async () => {
    // Validate locations
    if (!editedFromLocationId || !editedToLocationId) {
      toast.error('Wybierz lokalizację źródłową i docelową');
      return;
    }

    if (editedFromLocationId === editedToLocationId) {
      toast.error('Lokalizacja źródłowa i docelowa muszą być różne');
      return;
    }

    // Validate items
    if (editedItems.length === 0) {
      toast.error('Transfer musi zawierać przynajmniej jeden produkt');
      return;
    }

    for (let item of editedItems) {
      if (!item.productId || !item.quantity || item.quantity <= 0) {
        toast.error('Wszystkie produkty muszą mieć wybraną nazwę i dodatnią ilość');
        return;
      }
    }

    try {
      await transferService.updateTransfer(transfer.id, {
        fromLocationId: editedFromLocationId,
        toLocationId: editedToLocationId,
        reason: editedReason,
        notes: editedNotes,
        items: editedItems.map(item => ({
          productId: item.productId,
          quantity: parseInt(item.quantity, 10)
        }))
      });

      // Refresh transfer data
      dispatch(fetchTransferById(id));

      setIsEditing(false);
      toast.success('Transfer zaktualizowany pomyślnie');
    } catch (error) {
      console.error('Failed to update transfer:', error);
      toast.error(error.response?.data?.error || 'Nie udało się zaktualizować transferu');
    }
  };

  const handleAddItem = () => {
    setEditedItems([...editedItems, { productId: null, productName: '', quantity: 1, isOriginal: false }]);
  };

  const handleRemoveItem = (index) => {
    setEditedItems(editedItems.filter((_, i) => i !== index));
  };

  const handleItemChange = (index, field, value) => {
    const newItems = [...editedItems];

    if (field === 'product') {
      // When product is selected from autocomplete
      newItems[index] = {
        ...newItems[index],
        productId: value?.id,
        productName: value?.model,
        brand: value?.brand,
        productType: value?.productType,
      };
    } else if (field === 'quantity') {
      newItems[index].quantity = value;
    }

    setEditedItems(newItems);
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
      case TRANSFER_STATUS.COMPLETED:
        return 'success';
      case TRANSFER_STATUS.CANCELLED:
        return 'error';
      case TRANSFER_STATUS.REJECTED:
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
      case TRANSFER_STATUS.COMPLETED:
        return 1;
      case TRANSFER_STATUS.CANCELLED:
        return -1;
      case TRANSFER_STATUS.REJECTED:
        return -1;
      default:
        return 0;
    }
  };

  const steps = ['Oczekujący', 'Ukończony'];

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
          ...(transfer.status === TRANSFER_STATUS.COMPLETED ? [{
            label: isEditing ? 'Zapisz' : 'Edytuj',
            icon: isEditing ? <Save size={20} /> : <Edit size={20} />,
            onClick: isEditing ? handleSaveEdit : handleEditToggle,
            variant: 'contained',
            color: 'primary',
          }] : []),
          ...(isEditing ? [{
            label: 'Anuluj',
            icon: <X size={20} />,
            onClick: handleEditToggle,
            variant: 'outlined',
          }] : []),
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
                variant="contained"
                color="success"
                startIcon={<CheckCircle size={16} />}
                onClick={() => handleOpenConfirm('complete')}
              >
                Odbierz transfer
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
        <Typography variant="h6" sx={{ mb: 3 }}>
          Informacje o transferze
        </Typography>

        {/* Row 1: Transfer number, Status, Created by, Created */}
        <Box sx={{ mb: 3 }}>
          <Grid container spacing={2}>
            <Grid item xs={6} sm={3}>
              <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 0.5 }}>
                Numer transferu
              </Typography>
              <Typography variant="body1" sx={{ fontWeight: 600 }}>
                {getTransferNumber()}
              </Typography>
            </Grid>

            <Grid item xs={6} sm={3}>
              <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 0.5 }}>
                Status
              </Typography>
              <Chip
                label={TRANSFER_STATUS_LABELS[transfer.status]}
                color={getStatusColor(transfer.status)}
                size="small"
              />
            </Grid>

            <Grid item xs={6} sm={3}>
              <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 0.5 }}>
                Utworzony przez
              </Typography>
              <Typography variant="body1" sx={{ fontWeight: 600 }}>
                {`${transfer.user?.firstName || ''} ${transfer.user?.lastName || ''}`.trim() || '-'}
              </Typography>
            </Grid>

            <Grid item xs={6} sm={3}>
              <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 0.5 }}>
                Utworzono
              </Typography>
              <Typography variant="body1" sx={{ fontWeight: 600 }}>
                {formatDate(transfer.createdAt, DATE_FORMATS.DISPLAY_WITH_TIME)}
              </Typography>
            </Grid>
          </Grid>
        </Box>

        {/* Row 2: Source location, Destination location */}
        <Box sx={{ mb: 3 }}>
          <Box sx={{ mb: 2, width: '40%' }}>
            <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 0.5 }}>
              Lokalizacja źródłowa
            </Typography>
            {isEditing ? (
              <Autocomplete
                options={availableLocations}
                getOptionLabel={(option) => option.name || ''}
                value={availableLocations.find(l => l.id === editedFromLocationId) || null}
                onChange={(e, newValue) => {
                  setEditedFromLocationId(newValue?.id || null);
                  // Clear products when location changes
                  setEditedItems([]);
                }}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    placeholder="Wybierz lokalizację"
                    error={!editedFromLocationId}
                  />
                )}
                fullWidth
              />
            ) : (
              <Typography variant="body1" sx={{ fontWeight: 600, fontSize: '1rem' }}>
                {transfer.fromLocation?.name || '-'}
              </Typography>
            )}
          </Box>

          <Box sx={{ width: '40%' }}>
            <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 0.5 }}>
              Lokalizacja docelowa
            </Typography>
            {isEditing ? (
              <Autocomplete
                options={availableLocations}
                getOptionLabel={(option) => option.name || ''}
                value={availableLocations.find(l => l.id === editedToLocationId) || null}
                onChange={(e, newValue) => setEditedToLocationId(newValue?.id || null)}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    placeholder="Wybierz lokalizację"
                    error={!editedToLocationId}
                  />
                )}
                fullWidth
              />
            ) : (
              <Typography variant="body1" sx={{ fontWeight: 600, fontSize: '1rem' }}>
                {transfer.toLocation?.name || '-'}
              </Typography>
            )}
          </Box>
        </Box>

        {/* Row 3: Reason, Notes */}
        <Box sx={{ mb: 3, display: 'flex', gap: 2 }}>
          <Box sx={{ width: '50%' }}>
            <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 0.5 }}>
              Powód
            </Typography>
            {isEditing ? (
              <TextField
                fullWidth
                value={editedReason}
                onChange={(e) => setEditedReason(e.target.value)}
                size="small"
                placeholder="Wprowadź powód transferu"
                multiline
                rows={2}
              />
            ) : (
              <Typography variant="body1" sx={{ fontWeight: 600 }}>
                {transfer.reason || '-'}
              </Typography>
            )}
          </Box>

          <Box sx={{ width: '50%' }}>
            <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 0.5 }}>
              Notatki
            </Typography>
            {isEditing ? (
              <TextField
                fullWidth
                multiline
                rows={2}
                value={editedNotes}
                onChange={(e) => setEditedNotes(e.target.value)}
                size="small"
                placeholder="Wprowadź notatki"
              />
            ) : (
              <Typography variant="body1" sx={{ fontWeight: 600 }}>
                {transfer.notes || '-'}
              </Typography>
            )}
          </Box>
        </Box>

        <Divider sx={{ mb: 3 }} />

        {/* Tabela produktów */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6">
            Produkty transferu
          </Typography>
          {isEditing && (
            <Button
              variant="outlined"
              size="small"
              startIcon={<Plus size={16} />}
              onClick={handleAddItem}
            >
              Dodaj produkt
            </Button>
          )}
        </Box>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontWeight: 600 }}>Produkt</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Marka</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Typ</TableCell>
                <TableCell align="right" sx={{ fontWeight: 600 }}>Ilość</TableCell>
                {isEditing && <TableCell align="center" sx={{ fontWeight: 600 }}>Akcje</TableCell>}
              </TableRow>
            </TableHead>
            <TableBody>
              {isEditing ? (
                <>
                  {/* Current transfer items - read-only, can only be deleted */}
                  {editedItems.filter(item => item.isOriginal).map((item, index) => (
                    <TableRow key={`original-${index}`}>
                      <TableCell>
                        {item.productName}
                      </TableCell>
                      <TableCell>{item.brand?.name || '-'}</TableCell>
                      <TableCell>
                        {item.productType && (
                          <Chip
                            label={item.productType}
                            size="small"
                            variant="outlined"
                          />
                        )}
                      </TableCell>
                      <TableCell align="right">
                        <strong>{item.quantity}</strong>
                      </TableCell>
                      <TableCell align="center">
                        <IconButton
                          size="small"
                          color="error"
                          onClick={() => handleRemoveItem(index)}
                          disabled={editedItems.length === 1}
                        >
                          <Trash2 size={16} />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}

                  {/* New items - fully editable */}
                  {editedItems.filter(item => !item.isOriginal).map((item, originalIndex) => {
                    const index = editedItems.indexOf(item);
                    return (
                      <TableRow key={`new-${originalIndex}`}>
                        <TableCell>
                          <Autocomplete
                            options={availableProducts}
                            getOptionLabel={(option) => option.model || ''}
                            value={availableProducts.find(p => p.id === item.productId) || null}
                            onChange={(e, newValue) => handleItemChange(index, 'product', newValue)}
                            renderInput={(params) => (
                              <TextField
                                {...params}
                                size="small"
                                placeholder="Wybierz produkt"
                                error={!item.productId}
                              />
                            )}
                            sx={{ minWidth: 250 }}
                          />
                        </TableCell>
                        <TableCell>{item.brand?.name || '-'}</TableCell>
                        <TableCell>
                          {item.productType && (
                            <Chip
                              label={item.productType}
                              size="small"
                              variant="outlined"
                            />
                          )}
                        </TableCell>
                        <TableCell align="right">
                          <TextField
                            type="number"
                            value={item.quantity}
                            onChange={(e) => handleItemChange(index, 'quantity', e.target.value)}
                            size="small"
                            inputProps={{ min: 1, max: 1000 }}
                            sx={{ width: 100 }}
                            error={!item.quantity || item.quantity <= 0}
                          />
                        </TableCell>
                        <TableCell align="center">
                          <IconButton
                            size="small"
                            color="error"
                            onClick={() => handleRemoveItem(index)}
                          >
                            <Trash2 size={16} />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                  <TableRow>
                    <TableCell colSpan={3} align="right">
                      <Typography variant="h6">Razem:</Typography>
                    </TableCell>
                    <TableCell align="right">
                      <Typography variant="h6" color="primary">
                        {editedItems.reduce((sum, item) => sum + (parseInt(item.quantity, 10) || 0), 0)}
                      </Typography>
                    </TableCell>
                    <TableCell />
                  </TableRow>
                </>
              ) : (
                <>
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
                </>
              )}
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
