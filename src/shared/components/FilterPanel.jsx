import { useState } from 'react';
import {
  Box,
  Paper,
  TextField,
  Button,
  IconButton,
  Collapse,
  Typography,
  Chip,
  Stack,
} from '@mui/material';
import { Filter, X, ChevronDown, ChevronUp } from 'lucide-react';

/**
 * FilterPanel Component
 * Reusable filter UI with collapsible panel
 *
 * @param {Object} props
 * @param {Array} props.filters - Filter field definitions
 * @param {Object} props.values - Current filter values
 * @param {Function} props.onChange - Filter change handler
 * @param {Function} props.onReset - Reset filters handler
 * @param {Boolean} props.defaultExpanded - Default expanded state
 * @param {Boolean} props.showActiveCount - Show active filter count
 */
function FilterPanel({
  filters = [],
  values = {},
  onChange,
  onReset,
  defaultExpanded = false,
  showActiveCount = true,
}) {
  const [expanded, setExpanded] = useState(defaultExpanded);

  const handleChange = (fieldName, value) => {
    onChange?.({ ...values, [fieldName]: value });
  };

  const handleClear = (fieldName) => {
    onChange?.({ ...values, [fieldName]: null });
  };

  const handleReset = () => {
    onReset?.();
  };

  const activeFilterCount = Object.values(values).filter((value) => {
    if (value === null || value === undefined) return false;
    if (typeof value === 'string') return value.trim() !== '';
    if (Array.isArray(value)) return value.length > 0;
    return true;
  }).length;

  const hasActiveFilters = activeFilterCount > 0;

  return (
    <Paper sx={{ mb: 3 }}>
      <Box
        sx={{
          p: 2,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          cursor: 'pointer',
        }}
        onClick={() => setExpanded(!expanded)}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Filter size={20} />
          <Typography variant="h6">Filtry</Typography>
          {showActiveCount && hasActiveFilters && (
            <Chip
              label={`${activeFilterCount} aktywne`}
              size="small"
              color="primary"
              sx={{ ml: 1 }}
            />
          )}
        </Box>
        <IconButton size="small">
          {expanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
        </IconButton>
      </Box>

      <Collapse in={expanded}>
        <Box sx={{ p: 2, pt: 0 }}>
          <Stack spacing={2}>
            {/* Active Filters Display */}
            {hasActiveFilters && (
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 1 }}>
                {filters.map((filter) => {
                  const value = values[filter.name];
                  if (!value || (typeof value === 'string' && !value.trim())) return null;

                  return (
                    <Chip
                      key={filter.name}
                      label={`${filter.label}: ${filter.formatValue ? filter.formatValue(value) : value}`}
                      onDelete={() => handleClear(filter.name)}
                      size="small"
                      variant="outlined"
                    />
                  );
                })}
              </Box>
            )}

            {/* Filter Fields */}
            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: {
                  xs: '1fr',
                  sm: 'repeat(2, 1fr)',
                  md: 'repeat(3, 1fr)',
                  lg: 'repeat(4, 1fr)',
                },
                gap: 2,
              }}
            >
              {filters.map((filter) => {
                const FilterComponent = filter.component || TextField;
                const fieldValue = values[filter.name] || '';

                return (
                  <FilterComponent
                    key={filter.name}
                    name={filter.name}
                    label={filter.label}
                    value={fieldValue}
                    onChange={(e) => handleChange(filter.name, e.target.value)}
                    size="small"
                    fullWidth
                    {...filter.props}
                  />
                );
              })}
            </Box>

            {/* Actions */}
            <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
              {hasActiveFilters && (
                <Button
                  variant="outlined"
                  size="small"
                  onClick={handleReset}
                  startIcon={<X size={16} />}
                >
                  Wyczyść wszystko
                </Button>
              )}
            </Box>
          </Stack>
        </Box>
      </Collapse>
    </Paper>
  );
}

export default FilterPanel;
