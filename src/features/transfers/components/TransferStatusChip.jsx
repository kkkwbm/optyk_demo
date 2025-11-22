import { Chip } from '@mui/material';
import {
  Clock,
  CheckCircle,
  XCircle,
  X,
} from 'lucide-react';

/**
 * Status chip component for transfers
 * Shows different colors and icons based on status
 */
const TransferStatusChip = ({ status, size = 'small' }) => {
  const getStatusConfig = () => {
    switch (status) {
      case 'PENDING':
        return {
          label: 'Pending',
          color: 'warning',
          icon: <Clock size={16} />,
        };
      case 'COMPLETED':
        return {
          label: 'Completed',
          color: 'success',
          icon: <CheckCircle size={16} />,
        };
      case 'REJECTED':
        return {
          label: 'Rejected',
          color: 'error',
          icon: <XCircle size={16} />,
        };
      case 'CANCELLED':
        return {
          label: 'Cancelled',
          color: 'default',
          icon: <X size={16} />,
        };
      default:
        return {
          label: status,
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
};

export default TransferStatusChip;
