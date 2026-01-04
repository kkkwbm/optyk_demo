import { Box, TextField, Typography } from '@mui/material';
import { format } from 'date-fns';
import { pl } from 'date-fns/locale';

function DateRangePicker({ startDate, endDate, onStartDateChange, onEndDateChange, label }) {
  const handleStartDateChange = (event) => {
    onStartDateChange(event.target.value);
  };

  const handleEndDateChange = (event) => {
    onEndDateChange(event.target.value);
  };

  const formatDateForInput = (date) => {
    if (!date) return '';
    return format(new Date(date), 'yyyy-MM-dd');
  };

  return (
    <Box>
      {label && (
        <Typography variant="body2" sx={{ fontWeight: 600, mb: 1 }}>
          {label}
        </Typography>
      )}
      <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
        <TextField
          label="Data początkowa"
          type="date"
          value={startDate ? formatDateForInput(startDate) : ''}
          onChange={handleStartDateChange}
          InputLabelProps={{
            shrink: true,
          }}
          sx={{ minWidth: 200 }}
          size="small"
        />
        <Typography variant="body2" color="text.secondary">
          do
        </Typography>
        <TextField
          label="Data końcowa"
          type="date"
          value={endDate ? formatDateForInput(endDate) : ''}
          onChange={handleEndDateChange}
          InputLabelProps={{
            shrink: true,
          }}
          sx={{ minWidth: 200 }}
          size="small"
        />
      </Box>
    </Box>
  );
}

export default DateRangePicker;
