import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Paper,
  Typography,
  Tabs,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  Alert,
  Chip,
} from '@mui/material';
import { ArrowRight, ArrowLeft, Package } from 'lucide-react';
import { format } from 'date-fns';
import toast from 'react-hot-toast';

import PageHeader from '../../../shared/components/PageHeader';
import LoadingSpinner from '../../../shared/components/LoadingSpinner';
import EmptyState from '../../../shared/components/EmptyState';
import ConfirmTransferDialog from '../components/ConfirmTransferDialog';
import RejectTransferDialog from '../components/RejectTransferDialog';
import TransferStatusChip from '../components/TransferStatusChip';

import transferService from '../../../services/transferService';

import {
  fetchIncomingTransfers,
  fetchOutgoingTransfers,
  confirmTransfer,
  rejectTransfer,
  cancelTransfer,
  selectIncomingTransfers,
  selectOutgoingTransfers,
  selectTransfersLoading,
  selectTransfersError,
} from '../transfersSlice';

import { selectCurrentLocationId } from '../../locations/locationsSlice';

/**
 * Page for viewing and managing pending transfers
 * Shows incoming (need confirmation) and outgoing (awaiting confirmation) transfers
 */
const PendingTransfersPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [tabValue, setTabValue] = useState(0); // 0 = incoming, 1 = outgoing
  const [confirmDialog, setConfirmDialog] = useState({ open: false, transfer: null });
  const [rejectDialog, setRejectDialog] = useState({ open: false, transfer: null });
  const [actionLoading, setActionLoading] = useState(false);

  const incomingTransfers = useSelector(selectIncomingTransfers);
  const outgoingTransfers = useSelector(selectOutgoingTransfers);
  const loading = useSelector(selectTransfersLoading);
  const error = useSelector(selectTransfersError);
  const currentLocationId = useSelector(selectCurrentLocationId);

  useEffect(() => {
    if (currentLocationId) {
      dispatch(fetchIncomingTransfers({ locationId: currentLocationId, status: 'PENDING' }));
      dispatch(fetchOutgoingTransfers({ locationId: currentLocationId, status: 'PENDING' }));
    }
  }, [dispatch, currentLocationId]);

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const handleViewDetails = (transferId) => {
    navigate(`/transfers/${transferId}`);
  };

  const handleConfirmClick = async (transfer) => {
    // Fetch full transfer details to get items for partial acceptance
    try {
      const response = await transferService.getTransferById(transfer.id);
      if (response.data.success) {
        setConfirmDialog({ open: true, transfer: response.data.data });
      } else {
        toast.error('Failed to load transfer details');
      }
    } catch (error) {
      toast.error('Failed to load transfer details');
    }
  };

  const handleConfirm = async (data) => {
    setActionLoading(true);
    try {
      const result = await dispatch(confirmTransfer({
        id: confirmDialog.transfer.id,
        notes: data.notes,
        acceptedItems: data.acceptedItems,
      })).unwrap();

      // Check if partial acceptance created a return transfer
      if (result.returnTransferId) {
        toast.success('Transfer partially confirmed - a return transfer has been created');
      } else {
        toast.success('Transfer confirmed successfully');
      }

      setConfirmDialog({ open: false, transfer: null });
      // Refresh lists
      dispatch(fetchIncomingTransfers({ locationId: currentLocationId, status: 'PENDING' }));
    } catch (error) {
      toast.error(error || 'Failed to confirm transfer');
    } finally {
      setActionLoading(false);
    }
  };

  const handleRejectClick = (transfer) => {
    setRejectDialog({ open: true, transfer });
  };

  const handleReject = async (data) => {
    setActionLoading(true);
    try {
      await dispatch(rejectTransfer({ id: rejectDialog.transfer.id, rejectionReason: data.rejectionReason })).unwrap();
      toast.success('Transfer rejected');
      setRejectDialog({ open: false, transfer: null });
      // Refresh lists
      dispatch(fetchIncomingTransfers({ locationId: currentLocationId, status: 'PENDING' }));
    } catch (error) {
      toast.error(error || 'Failed to reject transfer');
    } finally {
      setActionLoading(false);
    }
  };

  const handleCancelTransfer = async (transferId) => {
    if (!window.confirm('Are you sure you want to cancel this transfer?')) {
      return;
    }

    try {
      await dispatch(cancelTransfer({ id: transferId })).unwrap();
      toast.success('Transfer cancelled');
      // Refresh list
      dispatch(fetchOutgoingTransfers({ locationId: currentLocationId, status: 'PENDING' }));
    } catch (error) {
      toast.error(error || 'Failed to cancel transfer');
    }
  };

  if (loading && !incomingTransfers.length && !outgoingTransfers.length) {
    return <LoadingSpinner />;
  }

  const incomingPending = incomingTransfers.filter(t => t.status === 'PENDING');
  const outgoingPending = outgoingTransfers.filter(t => t.status === 'PENDING');

  return (
    <Box>
      <PageHeader
        title="Pending Transfers"
        subtitle="Manage incoming and outgoing transfers"
      />

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Paper>
        <Tabs value={tabValue} onChange={handleTabChange} sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tab
            label={
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <ArrowRight size={18} />
                Incoming ({incomingPending.length})
              </Box>
            }
          />
          <Tab
            label={
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <ArrowLeft size={18} />
                Outgoing ({outgoingPending.length})
              </Box>
            }
          />
        </Tabs>

        {/* Incoming Transfers Tab */}
        {tabValue === 0 && (
          <Box sx={{ p: 2 }}>
            {incomingPending.length === 0 ? (
              <EmptyState
                icon={<Package size={48} />}
                title="No Pending Incoming Transfers"
                description="You have no transfers awaiting confirmation"
              />
            ) : (
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 600 }}>From Location</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>Items</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>Reason</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>Initiated By</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>Date</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
                      <TableCell align="right" sx={{ fontWeight: 600 }}>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {incomingPending.map((transfer) => (
                      <TableRow key={transfer.id} hover>
                        <TableCell>{transfer.fromLocation?.name || 'N/A'}</TableCell>
                        <TableCell>
                          <Chip
                            label={`${transfer.transferItems?.length || 0} items`}
                            size="small"
                            variant="outlined"
                          />
                        </TableCell>
                        <TableCell>{transfer.reason || '-'}</TableCell>
                        <TableCell>{transfer.initiatedBy?.fullName || 'N/A'}</TableCell>
                        <TableCell>
                          {transfer.transferDate
                            ? format(new Date(transfer.transferDate), 'MMM dd, yyyy HH:mm')
                            : 'N/A'}
                        </TableCell>
                        <TableCell>
                          <TransferStatusChip status={transfer.status} />
                        </TableCell>
                        <TableCell align="right">
                          <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
                            <Button
                              size="small"
                              variant="outlined"
                              onClick={() => handleViewDetails(transfer.id)}
                            >
                              View
                            </Button>
                            <Button
                              size="small"
                              variant="contained"
                              color="success"
                              onClick={() => handleConfirmClick(transfer)}
                            >
                              Confirm
                            </Button>
                            <Button
                              size="small"
                              variant="outlined"
                              color="error"
                              onClick={() => handleRejectClick(transfer)}
                            >
                              Reject
                            </Button>
                          </Box>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </Box>
        )}

        {/* Outgoing Transfers Tab */}
        {tabValue === 1 && (
          <Box sx={{ p: 2 }}>
            {outgoingPending.length === 0 ? (
              <EmptyState
                icon={<Package size={48} />}
                title="No Pending Outgoing Transfers"
                description="You have no outgoing transfers awaiting confirmation"
              />
            ) : (
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 600 }}>To Location</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>Items</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>Reason</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>Date</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
                      <TableCell align="right" sx={{ fontWeight: 600 }}>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {outgoingPending.map((transfer) => (
                      <TableRow key={transfer.id} hover>
                        <TableCell>{transfer.toLocation?.name || 'N/A'}</TableCell>
                        <TableCell>
                          <Chip
                            label={`${transfer.transferItems?.length || 0} items`}
                            size="small"
                            variant="outlined"
                          />
                        </TableCell>
                        <TableCell>{transfer.reason || '-'}</TableCell>
                        <TableCell>
                          {transfer.transferDate
                            ? format(new Date(transfer.transferDate), 'MMM dd, yyyy HH:mm')
                            : 'N/A'}
                        </TableCell>
                        <TableCell>
                          <TransferStatusChip status={transfer.status} />
                        </TableCell>
                        <TableCell align="right">
                          <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
                            <Button
                              size="small"
                              variant="outlined"
                              onClick={() => handleViewDetails(transfer.id)}
                            >
                              View
                            </Button>
                            <Button
                              size="small"
                              variant="outlined"
                              color="error"
                              onClick={() => handleCancelTransfer(transfer.id)}
                            >
                              Cancel
                            </Button>
                          </Box>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </Box>
        )}
      </Paper>

      {/* Dialogs */}
      <ConfirmTransferDialog
        open={confirmDialog.open}
        onClose={() => setConfirmDialog({ open: false, transfer: null })}
        onConfirm={handleConfirm}
        transfer={confirmDialog.transfer}
        loading={actionLoading}
      />

      <RejectTransferDialog
        open={rejectDialog.open}
        onClose={() => setRejectDialog({ open: false, transfer: null })}
        onReject={handleReject}
        transfer={rejectDialog.transfer}
        loading={actionLoading}
      />
    </Box>
  );
};

export default PendingTransfersPage;
