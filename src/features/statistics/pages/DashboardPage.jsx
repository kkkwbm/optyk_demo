import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Typography, Paper, Box, Tabs, Tab } from '@mui/material';
import { format, subMonths, subYears } from 'date-fns';
import {
  fetchDashboardStats,
  selectDashboardStats,
  fetchProductAnalytics,
  selectProductAnalytics,
  fetchStoreComparison,
  selectStoreComparison,
  fetchUserSalesStatistics,
  selectUserSalesStatistics,
  fetchProductInventoryByLocation,
  selectProductInventoryByLocation,
  fetchSalesTrend,
  selectSalesTrend,
  selectStatisticsLoading,
  selectProductInventoryLoading,
} from '../statisticsSlice';
import { fetchActiveLocations, selectActiveLocations } from '../../locations/locationsSlice';
import { DATE_FORMATS, DEBOUNCE_DELAYS } from '../../../constants';
import { useDebounce } from '../../../hooks/useDebounce';
import StatisticsFilters from '../components/StatisticsFilters';
import OverviewTab from '../components/OverviewTab';
import OverviewTabSkeleton from '../components/OverviewTabSkeleton';
import SalesTab from '../components/SalesTab';
import SalesTabSkeleton from '../components/SalesTabSkeleton';
import StoreComparisonTab from '../components/StoreComparisonTab';
import StoreComparisonTabSkeleton from '../components/StoreComparisonTabSkeleton';
import UserComparisonTab from '../components/UserComparisonTab';
import UserComparisonTabSkeleton from '../components/UserComparisonTabSkeleton';

const DATE_RANGE_OPTIONS = {
  ALL_TIME: 'all_time',
  LAST_MONTH: 'last_month',
  LAST_3_MONTHS: 'last_3_months',
  LAST_YEAR: 'last_year',
};

function DashboardPage() {
  const dispatch = useDispatch();

  const stats = useSelector(selectDashboardStats);
  const activeLocations = useSelector(selectActiveLocations);
  const productAnalytics = useSelector(selectProductAnalytics);
  const storeComparison = useSelector(selectStoreComparison);
  const userSalesStatistics = useSelector(selectUserSalesStatistics);
  const productInventoryByLocation = useSelector(selectProductInventoryByLocation);
  const salesTrend = useSelector(selectSalesTrend);
  const isLoading = useSelector(selectStatisticsLoading);
  const productInventoryLoading = useSelector(selectProductInventoryLoading);

  // Filter values
  const [selectedLocationIds, setSelectedLocationIds] = useState([]);
  const [selectedDateRange, setSelectedDateRange] = useState(DATE_RANGE_OPTIONS.ALL_TIME);

  // Debounced filter values (300ms delay for better UX)
  const debouncedLocationIds = useDebounce(selectedLocationIds, DEBOUNCE_DELAYS.SEARCH);
  const debouncedDateRange = useDebounce(selectedDateRange, DEBOUNCE_DELAYS.SEARCH);

  // Tab state
  const [currentTab, setCurrentTab] = useState(0);

  // Product type inventory chart state
  const [selectedProductTypes, setSelectedProductTypes] = useState([
    'FRAME',
    'SUNGLASSES',
    'CONTACT_LENS',
    'SOLUTION',
    'OTHER'
  ]);

  // Store comparison tab state
  const [selectedStoreComparisonLocationIds, setSelectedStoreComparisonLocationIds] = useState([]);

  // Sales trend chart state - default to last year
  const [customStartDate, setCustomStartDate] = useState(() =>
    format(subYears(new Date(), 1), DATE_FORMATS.API)
  );
  const [customEndDate, setCustomEndDate] = useState(() =>
    format(new Date(), DATE_FORMATS.API)
  );
  const [trendPeriod, setTrendPeriod] = useState('month');
  const [trendChartType, setTrendChartType] = useState('line');

  // Debounced custom date range for sales trend
  const debouncedStartDate = useDebounce(customStartDate, DEBOUNCE_DELAYS.SEARCH);
  const debouncedEndDate = useDebounce(customEndDate, DEBOUNCE_DELAYS.SEARCH);

  useEffect(() => {
    // Fetch active locations
    dispatch(fetchActiveLocations());
  }, [dispatch]);

  useEffect(() => {
    // Set default store comparison locations to all locations when locations are loaded
    if (activeLocations.length > 0 && selectedStoreComparisonLocationIds.length === 0) {
      const allLocationIds = activeLocations.map(loc => loc.id);
      setSelectedStoreComparisonLocationIds(allLocationIds);
    }
  }, [activeLocations, selectedStoreComparisonLocationIds.length]);

  useEffect(() => {
    // Fetch product inventory by location when product types are selected
    if (selectedProductTypes.length > 0) {
      dispatch(fetchProductInventoryByLocation(selectedProductTypes));
    }
  }, [dispatch, selectedProductTypes]);

  useEffect(() => {
    // Fetch sales trend when on Sales tab and custom date range is set
    if (currentTab === 1 && debouncedStartDate && debouncedEndDate) {
      const params = {
        startDate: debouncedStartDate,
        endDate: debouncedEndDate,
        period: trendPeriod,
        ...(debouncedLocationIds.length > 0 && { locationIds: debouncedLocationIds }),
      };
      dispatch(fetchSalesTrend(params));
    }
  }, [dispatch, currentTab, debouncedStartDate, debouncedEndDate, trendPeriod, debouncedLocationIds]);

  useEffect(() => {
    // Fetch statistics when filters change
    const getDateRangeParams = () => {
      const today = new Date();

      switch (debouncedDateRange) {
        case DATE_RANGE_OPTIONS.LAST_MONTH:
          return {
            startDate: format(subMonths(today, 1), DATE_FORMATS.API),
            endDate: format(today, DATE_FORMATS.API),
          };
        case DATE_RANGE_OPTIONS.LAST_3_MONTHS:
          return {
            startDate: format(subMonths(today, 3), DATE_FORMATS.API),
            endDate: format(today, DATE_FORMATS.API),
          };
        case DATE_RANGE_OPTIONS.LAST_YEAR:
          return {
            startDate: format(subYears(today, 1), DATE_FORMATS.API),
            endDate: format(today, DATE_FORMATS.API),
          };
        case DATE_RANGE_OPTIONS.ALL_TIME:
        default:
          return {};
      }
    };

    const params = {
      ...(debouncedLocationIds.length > 0 && { locationIds: debouncedLocationIds }),
      ...getDateRangeParams(),
    };
    dispatch(fetchDashboardStats(params));

    // Fetch additional stats for Overview tab when on tab 0
    if (currentTab === 0) {
      const dateParams = getDateRangeParams();
      dispatch(fetchProductAnalytics(dateParams));
    }

    // Fetch additional stats for Sales tab when on tab 1
    if (currentTab === 1) {
      const dateParams = getDateRangeParams();
      dispatch(fetchProductAnalytics(dateParams));
      dispatch(fetchStoreComparison(dateParams));
      dispatch(fetchUserSalesStatistics(dateParams));
    }

    // Fetch store comparison for Store Comparison tab when on tab 2
    if (currentTab === 2) {
      const dateParams = getDateRangeParams();
      dispatch(fetchStoreComparison(dateParams));
    }

    // Fetch user sales statistics for User Comparison tab when on tab 3
    if (currentTab === 3) {
      const dateParams = getDateRangeParams();
      dispatch(fetchUserSalesStatistics(dateParams));
    }
  }, [dispatch, debouncedLocationIds, debouncedDateRange, currentTab]);

  const handleLocationChange = (event, newLocationIds) => {
    setSelectedLocationIds(newLocationIds);
  };

  const handleDateRangeChange = (event, newDateRange) => {
    if (newDateRange !== null) {
      setSelectedDateRange(newDateRange);
    }
  };

  const handleSelectAll = () => {
    if (selectedLocationIds.length === activeLocations.length) {
      setSelectedLocationIds([]);
    } else {
      setSelectedLocationIds(activeLocations.map(loc => loc.id));
    }
  };

  const handleSelectWarehouses = () => {
    setSelectedLocationIds(activeLocations.filter(loc => loc.type === 'WAREHOUSE').map(loc => loc.id));
  };

  const handleSelectStores = () => {
    setSelectedLocationIds(activeLocations.filter(loc => loc.type === 'STORE').map(loc => loc.id));
  };

  const handleTabChange = (event, newValue) => {
    setCurrentTab(newValue);
  };

  // Store comparison location handlers
  const handleStoreComparisonLocationChange = (event, newLocationIds) => {
    setSelectedStoreComparisonLocationIds(newLocationIds);
  };

  const handleStoreComparisonSelectAll = () => {
    if (selectedStoreComparisonLocationIds.length === activeLocations.length) {
      setSelectedStoreComparisonLocationIds([]);
    } else {
      setSelectedStoreComparisonLocationIds(activeLocations.map(loc => loc.id));
    }
  };

  const handleStoreComparisonSelectWarehouses = () => {
    setSelectedStoreComparisonLocationIds(activeLocations.filter(loc => loc.type === 'WAREHOUSE').map(loc => loc.id));
  };

  const handleStoreComparisonSelectStores = () => {
    setSelectedStoreComparisonLocationIds(activeLocations.filter(loc => loc.type === 'STORE').map(loc => loc.id));
  };

  const handleProductTypesChange = (event, newValue) => {
    setSelectedProductTypes(newValue);
  };

  return (
    <Box sx={{ width: '100%', maxWidth: '100vw', px: 0 }}>
      <Box sx={{ mb: 3, px: { xs: 2, md: 3 } }}>
        <Typography variant="h4" sx={{ fontWeight: 600 }}>
          Statystyki
        </Typography>
      </Box>

      {/* Welcome Message */}
      <Box sx={{ px: { xs: 2, md: 3 } }}>
        <Paper sx={{ p: 3, mb: 3, background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
          <Typography variant="h5" sx={{ mb: 1, color: 'white', fontWeight: 600 }}>
            Przegląd statystyk
          </Typography>
          <Typography variant="body1" sx={{ color: 'rgba(255,255,255,0.9)' }}>
            Analizuj wydajność sprzedaży i zapasów w sieci salonów optycznych.
          </Typography>
        </Paper>
      </Box>

      {/* Filters Section */}
      <Box sx={{ px: { xs: 2, md: 3 } }}>
        <StatisticsFilters
          currentTab={currentTab}
          selectedLocationIds={selectedLocationIds}
          onLocationChange={handleLocationChange}
          activeLocations={activeLocations}
          onSelectAll={handleSelectAll}
          onSelectWarehouses={handleSelectWarehouses}
          onSelectStores={handleSelectStores}
          selectedDateRange={selectedDateRange}
          onDateRangeChange={handleDateRangeChange}
          selectedStoreComparisonLocationIds={selectedStoreComparisonLocationIds}
          onStoreComparisonLocationChange={handleStoreComparisonLocationChange}
          onStoreComparisonSelectAll={handleStoreComparisonSelectAll}
          onStoreComparisonSelectWarehouses={handleStoreComparisonSelectWarehouses}
          onStoreComparisonSelectStores={handleStoreComparisonSelectStores}
          isLoading={isLoading}
        />
      </Box>

      {/* Tabs */}
      <Box sx={{ px: { xs: 2, md: 3 } }}>
        <Paper sx={{ mb: 3 }}>
          <Tabs
            value={currentTab}
            onChange={handleTabChange}
            aria-label="zakładki statystyk"
            sx={{
              borderBottom: 1,
              borderColor: 'divider',
              '& .MuiTab-root': {
                textTransform: 'none',
                fontSize: '1rem',
                fontWeight: 500,
                minHeight: 56,
              },
            }}
          >
            <Tab label="Przegląd" />
            <Tab label="Sprzedaż" />
            <Tab label="Porównanie salonów" />
            <Tab label="Porównanie użytkowników" />
          </Tabs>
        </Paper>
      </Box>

      {/* Tab Content */}
      <Box sx={{ px: { xs: 2, md: 3 } }}>
        {currentTab === 0 && (
          isLoading ? (
            <OverviewTabSkeleton />
          ) : (
            <OverviewTab
              stats={stats}
              productAnalytics={productAnalytics}
            />
          )
        )}

        {currentTab === 1 && (
          isLoading ? (
            <SalesTabSkeleton />
          ) : (
            <SalesTab
              customStartDate={customStartDate}
              customEndDate={customEndDate}
              onStartDateChange={setCustomStartDate}
              onEndDateChange={setCustomEndDate}
              trendPeriod={trendPeriod}
              onTrendPeriodChange={setTrendPeriod}
              trendChartType={trendChartType}
              onTrendChartTypeChange={setTrendChartType}
              salesTrend={salesTrend?.trendData}
              stats={stats}
              productAnalytics={productAnalytics}
              storeComparison={storeComparison}
            />
          )
        )}

        {currentTab === 2 && (
          isLoading ? (
            <StoreComparisonTabSkeleton />
          ) : (
            <StoreComparisonTab
              selectedStoreComparisonLocationIds={selectedStoreComparisonLocationIds}
              storeComparison={storeComparison}
              productInventoryByLocation={productInventoryByLocation}
              productInventoryLoading={productInventoryLoading}
              selectedProductTypes={selectedProductTypes}
              onProductTypesChange={handleProductTypesChange}
            />
          )
        )}

        {currentTab === 3 && (
          isLoading ? (
            <UserComparisonTabSkeleton />
          ) : (
            <UserComparisonTab
              userSalesStatistics={userSalesStatistics}
            />
          )
        )}
      </Box>
    </Box>
  );
}

export default DashboardPage;
