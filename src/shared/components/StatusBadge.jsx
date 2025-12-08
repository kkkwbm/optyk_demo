import { memo } from 'react';
import { Chip } from '@mui/material';
import {
  USER_STATUS,
  PRODUCT_STATUS,
  LOCATION_STATUS,
  BRAND_STATUS,
  SALE_STATUS,
  TRANSFER_STATUS,
} from '../../constants';

/**
 * StatusBadge Component
 * Displays status with appropriate color and styling
 *
 * @param {Object} props
 * @param {String} props.status - Status value
 * @param {String} props.type - Entity type (user, product, location, brand, sale, transfer)
 * @param {String} props.size - Badge size (small, medium)
 * @param {String} props.variant - Badge variant (filled, outlined)
 */
const StatusBadge = memo(function StatusBadge({ status, type = 'generic', size = 'small', variant = 'filled' }) {
  if (!status) return null;

  const getStatusConfig = () => {
    // User Status
    if (type === 'user') {
      switch (status) {
        case USER_STATUS.ACTIVE:
          return { label: 'Aktywny', color: 'success' };
        case USER_STATUS.INACTIVE:
          return { label: 'Nieaktywny', color: 'default' };
        default:
          return { label: status, color: 'default' };
      }
    }

    // Product Status
    if (type === 'product') {
      switch (status) {
        case PRODUCT_STATUS.ACTIVE:
          return { label: 'Aktywny', color: 'success' };
        case PRODUCT_STATUS.INACTIVE:
          return { label: 'Nieaktywny', color: 'warning' };
        case PRODUCT_STATUS.DELETED:
          return { label: 'Usunięty', color: 'error' };
        default:
          return { label: status, color: 'default' };
      }
    }

    // Location Status
    if (type === 'location') {
      switch (status) {
        case LOCATION_STATUS.ACTIVE:
          return { label: 'Aktywny', color: 'success' };
        case LOCATION_STATUS.INACTIVE:
          return { label: 'Nieaktywny', color: 'default' };
        default:
          return { label: status, color: 'default' };
      }
    }

    // Brand Status
    if (type === 'brand') {
      switch (status) {
        case BRAND_STATUS.ACTIVE:
          return { label: 'Aktywna', color: 'success' };
        case BRAND_STATUS.INACTIVE:
          return { label: 'Nieaktywna', color: 'error' };
        default:
          return { label: status, color: 'default' };
      }
    }

    // Sale Status
    if (type === 'sale') {
      switch (status) {
        case SALE_STATUS.COMPLETED:
          return { label: 'Ukończony', color: 'success' };
        case SALE_STATUS.CANCELLED:
          return { label: 'Anulowany', color: 'error' };
        case SALE_STATUS.RETURNED:
          return { label: 'Zwrócony', color: 'warning' };
        case SALE_STATUS.PARTIALLY_RETURNED:
          return { label: 'Częściowo zwrócony', color: 'warning' };
        default:
          return { label: status, color: 'default' };
      }
    }

    // Transfer Status
    if (type === 'transfer') {
      switch (status) {
        case TRANSFER_STATUS.PENDING:
          return { label: 'Oczekujący', color: 'warning' };
        case TRANSFER_STATUS.IN_TRANSIT:
          return { label: 'W transporcie', color: 'info' };
        case TRANSFER_STATUS.COMPLETED:
          return { label: 'Ukończony', color: 'success' };
        case TRANSFER_STATUS.CANCELLED:
          return { label: 'Anulowany', color: 'error' };
        default:
          return { label: status, color: 'default' };
      }
    }

    // Generic/Default
    return { label: status, color: 'default' };
  };

  const { label, color } = getStatusConfig();

  return <Chip label={label} color={color} size={size} variant={variant} />;
});

export default StatusBadge;
