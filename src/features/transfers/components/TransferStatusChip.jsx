import { memo } from 'react';
import { Chip } from '@mui/material';
import {
  Clock,
  CheckCircle,
  XCircle,
  X,
} from 'lucide-react';
import { TRANSFER_STATUS, TRANSFER_STATUS_LABELS } from '../../../constants';

/**
 * Status chip component for transfers
 * Shows different colors and icons based on status
 */
const TransferStatusChip = memo(function TransferStatusChip({ status, size = 'small' }) {
  const getStatusConfig = () => {
    switch (status) {
      case TRANSFER_STATUS.PENDING:
        return {
          label: TRANSFER_STATUS_LABELS[TRANSFER_STATUS.PENDING],
          color: 'warning',
          icon: <Clock size={16} />,
        };
      case TRANSFER_STATUS.COMPLETED:
        return {
          label: TRANSFER_STATUS_LABELS[TRANSFER_STATUS.COMPLETED],
          color: 'success',
          icon: <CheckCircle size={16} />,
        };
      case TRANSFER_STATUS.REJECTED:
        return {
          label: TRANSFER_STATUS_LABELS[TRANSFER_STATUS.REJECTED],
          color: 'error',
          icon: <XCircle size={16} />,
        };
      case TRANSFER_STATUS.CANCELLED:
        return {
          label: TRANSFER_STATUS_LABELS[TRANSFER_STATUS.CANCELLED],
          color: 'default',
          icon: <X size={16} />,
        };
      default:
        return {
          label: TRANSFER_STATUS_LABELS[status] || status,
          color: 'default',
          icon: null,
        };
    }
  };

  const config = getStatusConfig();

  return (
    <Chip
      label={config.label}
      color={config.color}
      size={size}
      icon={config.icon}
      sx={{
        fontWeight: 500,
        '& .MuiChip-icon': {
          marginLeft: '4px',
        },
      }}
    />
  );
});

export default TransferStatusChip;
