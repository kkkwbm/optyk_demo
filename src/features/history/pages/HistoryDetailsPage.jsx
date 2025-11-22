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
import { ArrowLeft, RotateCcw } from 'lucide-react';
import { format } from 'date-fns';
import { pl } from 'date-fns/locale';
import toast from 'react-hot-toast';
import PageHeader from '../../../shared/components/PageHeader';
import ConfirmDialog from '../../../shared/components/ConfirmDialog';
import {
  fetchHistoryById,
  revertOperation,
  selectCurrentHistoryItem,
  selectHistoryLoading,
} from '../historySlice';
import {
  OPERATION_TYPE_LABELS,
  ENTITY_TYPE_LABELS,
  DATE_FORMATS,
} from '../../../constants';

function HistoryDetailsPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { id } = useParams();

  const historyItem = useSelector(selectCurrentHistoryItem);
  const loading = useSelector(selectHistoryLoading);

  const [confirmDialog, setConfirmDialog] = useState({ open: false });

  useEffect(() => {
    if (id) {
      dispatch(fetchHistoryById(id));
    }
  }, [dispatch, id]);

  const handleOpenConfirm = () => {
    setConfirmDialog({ open: true });
  };

  const handleCloseConfirm = () => {
    setConfirmDialog({ open: false });
  };

  const handleConfirmRevert = async () => {
    try {
      await dispatch(revertOperation(historyItem.id)).unwrap();
      toast.success('Operacja została cofnięta');
      navigate('/history');
    } catch (error) {
      toast.error(error || 'Nie udało się cofnąć operacji');
    }
    handleCloseConfirm();
  };

  if (loading || !historyItem) {
    return (
      <Container maxWidth="lg">
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 400 }}>
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  const renderValue = (value) => {
    if (value === null || value === undefined) return '-';
    if (typeof value === 'boolean') return value ? 'Tak' : 'Nie';
    if (typeof value === 'object') return JSON.stringify(value, null, 2);
    return String(value);
  };

  const renderDiff = () => {
    const oldValues = historyItem.oldValues || {};
    const newValues = historyItem.newValues || {};

    const allKeys = new Set([...Object.keys(oldValues), ...Object.keys(newValues)]);
    const changes = [];

    allKeys.forEach((key) => {
      if (oldValues[key] !== newValues[key]) {
        changes.push({
          field: key,
          oldValue: oldValues[key],
          newValue: newValues[key],
        });
      }
    });

    if (changes.length === 0) {
      return (
        <Typography variant="body2" color="text.secondary">
          Nie zarejestrowano zmian w polach
        </Typography>
      );
    }

    return (
      <TableContainer>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Pole</TableCell>
              <TableCell>Stara wartość</TableCell>
              <TableCell>Nowa wartość</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {changes.map((change, index) => (
              <TableRow key={index}>
                <TableCell>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                    {change.field}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Box
                    sx={{
                      bgcolor: 'error.lighter',
                      p: 1,
                      borderRadius: 1,
                      fontFamily: 'monospace',
                      fontSize: '0.875rem',
                    }}
                  >
                    {renderValue(change.oldValue)}
                  </Box>
                </TableCell>
                <TableCell>
                  <Box
                    sx={{
                      bgcolor: 'success.lighter',
                      p: 1,
                      borderRadius: 1,
                      fontFamily: 'monospace',
                      fontSize: '0.875rem',
                    }}
                  >
                    {renderValue(change.newValue)}
                  </Box>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    );
  };

  const getOperationColor = (type) => {
    const typeUpper = type?.toUpperCase();
    if (typeUpper?.includes('CREATE') || typeUpper?.includes('ACTIVATE')) return 'success';
    if (typeUpper?.includes('UPDATE')) return 'info';
    if (typeUpper?.includes('DELETE') || typeUpper?.includes('DEACTIVATE')) return 'error';
    if (typeUpper?.includes('TRANSFER') || typeUpper?.includes('SALE')) return 'primary';
    return 'default';
  };

  return (
    <Container maxWidth="lg">
      <PageHeader
        title="Szczegóły operacji"
        subtitle={`${OPERATION_TYPE_LABELS[historyItem.operationType]} - ${ENTITY_TYPE_LABELS[historyItem.entityType]}`}
        breadcrumbs={[
          { label: 'Pulpit', to: '/' },
          { label: 'Historia', to: '/history' },
          { label: 'Szczegóły' },
        ]}
        actions={[
          {
            label: 'Wróć',
            icon: <ArrowLeft size={20} />,
            onClick: () => navigate('/history'),
            variant: 'outlined',
          },
        ]}
      />

      <Paper sx={{ p: 3 }}>
        {/* Actions */}
        {historyItem.canRevert && (
          <Box sx={{ mb: 3 }}>
            <Button
              variant="outlined"
              color="warning"
              startIcon={<RotateCcw size={16} />}
              onClick={handleOpenConfirm}
            >
              Cofnij operację
            </Button>
          </Box>
        )}

        <Divider sx={{ mb: 3 }} />

        {/* Operation Information */}
        <Typography variant="h6" sx={{ mb: 2 }}>
          Informacje o operacji
        </Typography>
        <Grid container spacing={3} sx={{ mb: 3 }}>
          <Grid item xs={12} md={6}>
            <Typography variant="body2" color="text.secondary">
              Typ operacji
            </Typography>
            <Box sx={{ mb: 2 }}>
              <Chip
                label={OPERATION_TYPE_LABELS[historyItem.operationType]}
                color={getOperationColor(historyItem.operationType)}
              />
            </Box>
          </Grid>

          <Grid item xs={12} md={6}>
            <Typography variant="body2" color="text.secondary">
              Typ encji
            </Typography>
            <Box sx={{ mb: 2 }}>
              <Chip
                label={ENTITY_TYPE_LABELS[historyItem.entityType] || historyItem.entityType}
                variant="outlined"
              />
            </Box>
          </Grid>

          <Grid item xs={12} md={6}>
            <Typography variant="body2" color="text.secondary">
              ID encji
            </Typography>
            <Typography variant="body1" sx={{ mb: 2, fontFamily: 'monospace' }}>
              {historyItem.entityId}
            </Typography>
          </Grid>

          <Grid item xs={12} md={6}>
            <Typography variant="body2" color="text.secondary">
              Nazwa encji
            </Typography>
            <Typography variant="body1" sx={{ mb: 2 }}>
              {historyItem.entityName || '-'}
            </Typography>
          </Grid>

          <Grid item xs={12} md={6}>
            <Typography variant="body2" color="text.secondary">
              Wykonane przez
            </Typography>
            <Typography variant="body1" sx={{ mb: 2 }}>
              {`${historyItem.user?.firstName || ''} ${historyItem.user?.lastName || ''}`.trim() || '-'}
            </Typography>
          </Grid>

          <Grid item xs={12} md={6}>
            <Typography variant="body2" color="text.secondary">
              Data i godzina
            </Typography>
            <Typography variant="body1" sx={{ mb: 2 }}>
              {format(new Date(historyItem.timestamp), DATE_FORMATS.DISPLAY_WITH_TIME, { locale: pl })}
            </Typography>
          </Grid>

          <Grid item xs={12} md={6}>
            <Typography variant="body2" color="text.secondary">
              Lokalizacja
            </Typography>
            <Typography variant="body1" sx={{ mb: 2 }}>
              {historyItem.location?.name || '-'}
            </Typography>
          </Grid>

          <Grid item xs={12} md={6}>
            <Typography variant="body2" color="text.secondary">
              Można cofnąć
            </Typography>
            <Box sx={{ mb: 2 }}>
              <Chip
                label={historyItem.canRevert ? 'Tak' : 'Nie'}
                color={historyItem.canRevert ? 'success' : 'default'}
                variant="outlined"
                size="small"
              />
            </Box>
          </Grid>

          {historyItem.reason && (
            <Grid item xs={12}>
              <Typography variant="body2" color="text.secondary">
                Powód
              </Typography>
              <Typography variant="body1" sx={{ mb: 2 }}>
                {historyItem.reason}
              </Typography>
            </Grid>
          )}

          {historyItem.notes && (
            <Grid item xs={12}>
              <Typography variant="body2" color="text.secondary">
                Notatki
              </Typography>
              <Typography variant="body1" sx={{ mb: 2 }}>
                {historyItem.notes}
              </Typography>
            </Grid>
          )}
        </Grid>

        <Divider sx={{ mb: 3 }} />

        {/* Changes Diff */}
        <Typography variant="h6" sx={{ mb: 2 }}>
          Zmiany
        </Typography>
        {renderDiff()}

        {/* Raw Data (for debugging) */}
        {(historyItem.oldValues || historyItem.newValues) && (
          <>
            <Divider sx={{ my: 3 }} />
            <Typography variant="h6" sx={{ mb: 2 }}>
              Surowe dane
            </Typography>
            <Grid container spacing={2}>
              {historyItem.oldValues && (
                <Grid item xs={12} md={6}>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                    Stare wartości
                  </Typography>
                  <Paper
                    sx={{
                      p: 2,
                      bgcolor: 'grey.50',
                      fontFamily: 'monospace',
                      fontSize: '0.75rem',
                      overflow: 'auto',
                      maxHeight: 300,
                    }}
                  >
                    <pre>{JSON.stringify(historyItem.oldValues, null, 2)}</pre>
                  </Paper>
                </Grid>
              )}
              {historyItem.newValues && (
                <Grid item xs={12} md={6}>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                    Nowe wartości
                  </Typography>
                  <Paper
                    sx={{
                      p: 2,
                      bgcolor: 'grey.50',
                      fontFamily: 'monospace',
                      fontSize: '0.75rem',
                      overflow: 'auto',
                      maxHeight: 300,
                    }}
                  >
                    <pre>{JSON.stringify(historyItem.newValues, null, 2)}</pre>
                  </Paper>
                </Grid>
              )}
            </Grid>
          </>
        )}
      </Paper>

      {/* Confirm Dialog */}
      <ConfirmDialog
        open={confirmDialog.open}
        onClose={handleCloseConfirm}
        onConfirm={handleConfirmRevert}
        title="Potwierdź cofnięcie"
        message={`Czy na pewno chcesz cofnąć tę operację ${historyItem.operationType?.toLowerCase()}? To cofnie zmiany i nie będzie można tego cofnąć.`}
        confirmText="Cofnij"
        confirmColor="warning"
      />
    </Container>
  );
}

export default HistoryDetailsPage;
