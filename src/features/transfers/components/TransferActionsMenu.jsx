import { useState, memo } from 'react';
import {
  IconButton,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Divider,
} from '@mui/material';
import {
  MoreVertical,
  CheckCircle,
  XCircle,
  X,
  Eye,
  RotateCcw,
} from 'lucide-react';

/**
 * Actions menu for transfer row
 * Shows different actions based on transfer status and user permissions
 */
const TransferActionsMenu = memo(function TransferActionsMenu({
  transfer,
  canConfirm,
  canReject,
  canCancel,
  onView,
  onConfirm,
  onReject,
  onCancel,
  onCreateReturn,
}) => {
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleAction = (action) => {
    handleClose();
    action();
  };

  const isPending = transfer.status === 'PENDING';
  const isCompleted = transfer.status === 'COMPLETED';

  return (
    <>
      <IconButton
        size="small"
        onClick={handleClick}
        aria-label="transfer actions"
      >
        <MoreVertical size={20} />
      </IconButton>

      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
      >
        {[
          <MenuItem key="view" onClick={() => handleAction(onView)}>
            <ListItemIcon>
              <Eye size={20} />
            </ListItemIcon>
            <ListItemText>View Details</ListItemText>
          </MenuItem>,

          isPending && canConfirm && (
            <MenuItem key="confirm" onClick={() => handleAction(onConfirm)}>
              <ListItemIcon>
                <CheckCircle size={20} color="green" />
              </ListItemIcon>
              <ListItemText>Confirm Transfer</ListItemText>
            </MenuItem>
          ),

          isPending && canReject && (
            <MenuItem key="reject" onClick={() => handleAction(onReject)}>
              <ListItemIcon>
                <XCircle size={20} color="red" />
              </ListItemIcon>
              <ListItemText>Reject Transfer</ListItemText>
            </MenuItem>
          ),

          isPending && canCancel && (
            <Divider key="divider-cancel" />
          ),
          isPending && canCancel && (
            <MenuItem key="cancel" onClick={() => handleAction(onCancel)}>
              <ListItemIcon>
                <X size={20} />
              </ListItemIcon>
              <ListItemText>Cancel Transfer</ListItemText>
            </MenuItem>
          ),

          isCompleted && onCreateReturn && (
            <Divider key="divider-return" />
          ),
          isCompleted && onCreateReturn && (
            <MenuItem key="return" onClick={() => handleAction(onCreateReturn)}>
              <ListItemIcon>
                <RotateCcw size={20} />
              </ListItemIcon>
              <ListItemText>Create Return Transfer</ListItemText>
            </MenuItem>
          ),
        ].filter(Boolean)}
      </Menu>
    </>
  );
});

export default TransferActionsMenu;
