import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
} from '@mui/material';
import { FileText } from 'lucide-react';

/**
 * NotesDialog Component
 * Displays full product notes/description in a dialog
 *
 * @param {Object} props
 * @param {Boolean} props.open - Dialog open state
 * @param {Function} props.onClose - Close handler
 * @param {String} props.title - Dialog title
 * @param {String} props.content - Full notes/description content
 */
function NotesDialog({
  open = false,
  onClose,
  title = 'Notatka',
  content = '',
}) {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      aria-labelledby="notes-dialog-title"
    >
      <DialogTitle id="notes-dialog-title">
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <FileText size={24} />
          {title}
        </Box>
      </DialogTitle>
      <DialogContent>
        <Typography
          variant="body1"
          sx={{
            whiteSpace: 'pre-wrap',
            wordBreak: 'break-word',
            mt: 1,
          }}
        >
          {content || 'Brak notatki'}
        </Typography>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={onClose} variant="contained">
          Zamknij
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default NotesDialog;
