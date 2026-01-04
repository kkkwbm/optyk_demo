import { Paper, Typography, Grid, Box, ToggleButtonGroup, ToggleButton, Button, CircularProgress, Fade } from '@mui/material';

const DATE_RANGE_OPTIONS = {
  ALL_TIME: 'all_time',
  LAST_MONTH: 'last_month',
  LAST_3_MONTHS: 'last_3_months',
  LAST_YEAR: 'last_year',
};

function StatisticsFilters({
  currentTab,
  selectedLocationIds,
  onLocationChange,
  activeLocations,
  onSelectAll,
  onSelectWarehouses,
  onSelectStores,
  selectedDateRange,
  onDateRangeChange,
  // Props for Store Comparison tab
  selectedStoreComparisonLocationIds,
  onStoreComparisonLocationChange,
  onStoreComparisonSelectAll,
  onStoreComparisonSelectWarehouses,
  onStoreComparisonSelectStores,
  // Loading state
  isLoading,
}) {
  // Use Store Comparison props when on Store Comparison tab
  const isStoreComparisonTab = currentTab === 2;
  const effectiveSelectedLocationIds = isStoreComparisonTab ? selectedStoreComparisonLocationIds : selectedLocationIds;
  const effectiveOnLocationChange = isStoreComparisonTab ? onStoreComparisonLocationChange : onLocationChange;
  const effectiveOnSelectAll = isStoreComparisonTab ? onStoreComparisonSelectAll : onSelectAll;
  const effectiveOnSelectWarehouses = isStoreComparisonTab ? onStoreComparisonSelectWarehouses : onSelectWarehouses;
  const effectiveOnSelectStores = isStoreComparisonTab ? onStoreComparisonSelectStores : onSelectStores;

  return (
    <Paper sx={{ p: 3, mb: 3, position: 'relative' }}>
      {/* Loading Indicator */}
      <Fade in={isLoading}>
        <Box
          sx={{
            position: 'absolute',
            top: 16,
            right: 16,
            display: 'flex',
            alignItems: 'center',
            gap: 1,
            bgcolor: 'background.paper',
            px: 1.5,
            py: 0.75,
            borderRadius: 1,
            boxShadow: 1,
          }}
        >
          <CircularProgress size={16} thickness={4} />
          <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 500 }}>
            Ładowanie...
          </Typography>
        </Box>
      </Fade>

      <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>
        Filtry
      </Typography>
      <Grid container spacing={3}>
        {/* Filter: Location */}
        <Grid item xs={12}>
          <Box sx={{ mb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <Box>
              <Typography variant="body2" sx={{ fontWeight: 600, mb: 1 }}>
                {isStoreComparisonTab ? 'Lokalizacje na wykresach' : 'Lokalizacje'}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {effectiveSelectedLocationIds.length === 0
                  ? 'Wszystkie lokalizacje'
                  : `Wybrano: ${effectiveSelectedLocationIds.length} lokalizacji`}
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Button
                size="small"
                variant="outlined"
                onClick={effectiveOnSelectAll}
                sx={{
                  textTransform: 'none',
                  fontSize: '0.75rem',
                  py: 0.5,
                  px: 1.5,
                }}
              >
                Wszystko
              </Button>
              <Button
                size="small"
                variant="outlined"
                onClick={effectiveOnSelectWarehouses}
                sx={{
                  textTransform: 'none',
                  fontSize: '0.75rem',
                  py: 0.5,
                  px: 1.5,
                }}
              >
                Wszystkie magazyny
              </Button>
              <Button
                size="small"
                variant="outlined"
                onClick={effectiveOnSelectStores}
                sx={{
                  textTransform: 'none',
                  fontSize: '0.75rem',
                  py: 0.5,
                  px: 1.5,
                }}
              >
                Wszystkie salony
              </Button>
            </Box>
          </Box>
          <ToggleButtonGroup
            value={effectiveSelectedLocationIds}
            onChange={effectiveOnLocationChange}
            aria-label="wybór lokalizacji"
            sx={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: 1
            }}
          >
            {activeLocations.map((location) => (
              <ToggleButton
                key={location.id}
                value={location.id}
                aria-label={location.name}
                sx={{
                  px: 2,
                  py: 1,
                  textTransform: 'none',
                  borderRadius: 2,
                  border: '1px solid',
                  borderColor: 'divider',
                  '&.Mui-selected': {
                    bgcolor: 'primary.main',
                    color: 'primary.contrastText',
                    '&:hover': {
                      bgcolor: 'primary.dark',
                    },
                  },
                }}
              >
                {location.name} ({location.type === 'STORE' ? 'Salon' : 'Magazyn'})
              </ToggleButton>
            ))}
          </ToggleButtonGroup>
        </Grid>

        {/* Filter: Date Range */}
        <Grid item xs={12}>
          <Box sx={{ mb: 2 }}>
            <Typography variant="body2" sx={{ fontWeight: 600, mb: 1 }}>
              Zakres dat
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {selectedDateRange === DATE_RANGE_OPTIONS.ALL_TIME && 'Od zawsze'}
              {selectedDateRange === DATE_RANGE_OPTIONS.LAST_MONTH && 'Ostatni miesiąc'}
              {selectedDateRange === DATE_RANGE_OPTIONS.LAST_3_MONTHS && 'Ostatnie 3 miesiące'}
              {selectedDateRange === DATE_RANGE_OPTIONS.LAST_YEAR && 'Ostatni rok'}
            </Typography>
          </Box>
          <ToggleButtonGroup
            value={selectedDateRange}
            exclusive
            onChange={onDateRangeChange}
            aria-label="zakres dat"
            sx={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: 1
            }}
          >
            <ToggleButton
              value={DATE_RANGE_OPTIONS.ALL_TIME}
              aria-label="od zawsze"
              sx={{
                px: 2,
                py: 1,
                textTransform: 'none',
                borderRadius: 2,
                border: '1px solid',
                borderColor: 'divider',
                '&.Mui-selected': {
                  bgcolor: 'primary.main',
                  color: 'primary.contrastText',
                  '&:hover': {
                    bgcolor: 'primary.dark',
                  },
                },
              }}
            >
              Od zawsze
            </ToggleButton>
            <ToggleButton
              value={DATE_RANGE_OPTIONS.LAST_MONTH}
              aria-label="ostatni miesiąc"
              sx={{
                px: 2,
                py: 1,
                textTransform: 'none',
                borderRadius: 2,
                border: '1px solid',
                borderColor: 'divider',
                '&.Mui-selected': {
                  bgcolor: 'primary.main',
                  color: 'primary.contrastText',
                  '&:hover': {
                    bgcolor: 'primary.dark',
                  },
                },
              }}
            >
              Ostatni miesiąc
            </ToggleButton>
            <ToggleButton
              value={DATE_RANGE_OPTIONS.LAST_3_MONTHS}
              aria-label="ostatnie 3 miesiące"
              sx={{
                px: 2,
                py: 1,
                textTransform: 'none',
                borderRadius: 2,
                border: '1px solid',
                borderColor: 'divider',
                '&.Mui-selected': {
                  bgcolor: 'primary.main',
                  color: 'primary.contrastText',
                  '&:hover': {
                    bgcolor: 'primary.dark',
                  },
                },
              }}
            >
              Ostatnie 3 miesiące
            </ToggleButton>
            <ToggleButton
              value={DATE_RANGE_OPTIONS.LAST_YEAR}
              aria-label="ostatni rok"
              sx={{
                px: 2,
                py: 1,
                textTransform: 'none',
                borderRadius: 2,
                border: '1px solid',
                borderColor: 'divider',
                '&.Mui-selected': {
                  bgcolor: 'primary.main',
                  color: 'primary.contrastText',
                  '&:hover': {
                    bgcolor: 'primary.dark',
                  },
                },
              }}
            >
              Ostatni rok
            </ToggleButton>
          </ToggleButtonGroup>
        </Grid>
      </Grid>
    </Paper>
  );
}

export default StatisticsFilters;
