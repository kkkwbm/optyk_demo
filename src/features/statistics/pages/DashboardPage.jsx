import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Typography,
  Paper,
  Box,
  Grid,
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  Chip,
} from '@mui/material';
import {
  BarChart3,
  Package,
  ShoppingCart,
  ArrowLeftRight,
  DollarSign,
  Glasses,
} from 'lucide-react';
import {
  fetchDashboardStats,
  selectDashboardStats,
} from '../statisticsSlice';
import locationService from '../../../services/locationService';
import { selectCurrentLocation } from '../../locations/locationsSlice';
import { PRODUCT_TYPE_LABELS } from '../../../constants';

function DashboardPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const stats = useSelector(selectDashboardStats);
  const currentLocation = useSelector(selectCurrentLocation);

  const [storeComparison, setStoreComparison] = useState([]);

  useEffect(() => {
    // Fetch all-time statistics (no date range filter)
    // Handle "All Stores" by sending undefined (which becomes null in backend)
    // If currentLocation is null (Global view), it's also undefined
    const locationId = (currentLocation?.id === 'ALL_STORES' || !currentLocation)
      ? undefined
      : currentLocation.id;

    dispatch(fetchDashboardStats({ locationId }));
  }, [dispatch, currentLocation]);

  // Fetch store comparison data
  useEffect(() => {
    const fetchStoreComparison = async () => {
      try {
        const response = await locationService.getLocations({
          page: 0,
          size: 1000,
          status: 'ACTIVE'
        });
        const locations = response.data?.content || response.data?.data || response.data || [];

        // Filter only stores (exclude warehouses)
        const storesOnly = locations.filter(location => location.type === 'STORE');

        // Fetch stats for each store
        const comparisonData = await Promise.all(
          storesOnly.map(async (location) => {
            try {
              const statsResponse = await dispatch(fetchDashboardStats({ locationId: location.id })).unwrap();
              return {
                id: location.id,
                name: location.name,
                type: location.type,
                totalSales: statsResponse?.totalSales || 0,
                salesCount: statsResponse?.salesCount || 0,
                totalProducts: statsResponse?.totalProductsInStock || 0,
              };
            } catch (error) {
              console.error(`Failed to fetch stats for location ${location.id}:`, error);
              return {
                id: location.id,
                name: location.name,
                type: location.type,
                totalSales: 0,
                salesCount: 0,
                totalProducts: 0,
              };
            }
          })
        );

        setStoreComparison(comparisonData.sort((a, b) => b.totalSales - a.totalSales));
      } catch (error) {
        console.error('Failed to fetch store comparison:', error);
      }
    };

    fetchStoreComparison();
  }, [dispatch]);

  const formatCurrency = (value) => {
    return `${(value || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} zł`;
  };

  return (
    <Container maxWidth="xl">
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" sx={{ fontWeight: 600 }}>
          Statystyki
        </Typography>
      </Box>

      {/* Welcome Message */}
      <Paper sx={{ p: 3, mb: 3, background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
        <Typography variant="h5" sx={{ mb: 1, color: 'white', fontWeight: 600 }}>
          Przegląd statystyk
        </Typography>
        <Typography variant="body1" sx={{ color: 'rgba(255,255,255,0.9)' }}>
          Analizuj wydajność sprzedaży i zapasów w sieci salonów optycznych.
        </Typography>
      </Paper>

      {/* Main Statistics Cards */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        {/* Total Sales */}
        <Grid item xs={12} sm={6} md={4} lg={2}>
          <Card sx={{ cursor: 'pointer', height: '100%' }} onClick={() => navigate('/sales')}>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                <Box
                  sx={{
                    width: 48,
                    height: 48,
                    borderRadius: 2,
                    bgcolor: 'success.light',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <DollarSign size={24} color="#fff" />
                </Box>
              </Box>
              <Typography variant="h4" sx={{ fontWeight: 600, mb: 0.5 }}>
                {formatCurrency(stats?.totalSales)}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Łączna sprzedaż
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* Number of Sales */}
        <Grid item xs={12} sm={6} md={4} lg={2}>
          <Card sx={{ cursor: 'pointer', height: '100%' }} onClick={() => navigate('/sales')}>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                <Box
                  sx={{
                    width: 48,
                    height: 48,
                    borderRadius: 2,
                    bgcolor: 'info.main',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <ShoppingCart size={24} color="#fff" />
                </Box>
              </Box>
              <Typography variant="h4" sx={{ fontWeight: 600, mb: 0.5 }}>
                {stats?.salesCount || 0}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Liczba sprzedaży
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* Transfers */}
        <Grid item xs={12} sm={6} md={4} lg={2}>
          <Card sx={{ cursor: 'pointer', height: '100%' }} onClick={() => navigate('/inventory/transfers')}>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                <Box
                  sx={{
                    width: 48,
                    height: 48,
                    borderRadius: 2,
                    bgcolor: 'warning.light',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <ArrowLeftRight size={24} color="#fff" />
                </Box>
              </Box>
              <Typography variant="h4" sx={{ fontWeight: 600, mb: 0.5 }}>
                {stats?.pendingTransfers || 0}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Aktywne transfery
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* Total Products */}
        <Grid item xs={12} sm={6} md={4} lg={2}>
          <Card sx={{ cursor: 'pointer', height: '100%' }} onClick={() => navigate('/inventory')}>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                <Box
                  sx={{
                    width: 48,
                    height: 48,
                    borderRadius: 2,
                    bgcolor: 'primary.main',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Package size={24} color="#fff" />
                </Box>
              </Box>
              <Typography variant="h4" sx={{ fontWeight: 600, mb: 0.5 }}>
                {stats?.totalProductsInStock || 0}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Wszystkie produkty
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* Unique Frame Models */}
        <Grid item xs={12} sm={6} md={4} lg={2}>
          <Card sx={{ cursor: 'pointer', height: '100%' }} onClick={() => navigate('/inventory/frames/unique')}>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                <Box
                  sx={{
                    width: 48,
                    height: 48,
                    borderRadius: 2,
                    bgcolor: 'secondary.main',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Glasses size={24} color="#fff" />
                </Box>
              </Box>
              <Typography variant="h4" sx={{ fontWeight: 600, mb: 0.5 }}>
                {stats?.uniqueFrameModels || 0}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Unikalne modele opraw
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* Inventory Aging */}
        <Grid item xs={12} sm={6} md={4} lg={2}>
          <Card sx={{ cursor: 'pointer', height: '100%' }} onClick={() => navigate('/inventory/aging')}>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                <Box
                  sx={{
                    width: 48,
                    height: 48,
                    borderRadius: 2,
                    bgcolor: 'error.main',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Package size={24} color="#fff" />
                </Box>
              </Box>
              <Typography variant="h4" sx={{ fontWeight: 600, mb: 0.5 }}>
                {stats?.inventoryAgingCount || 0}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Zalegający towar (&gt;2 lata)
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid >

      {/* Sales by Product Type */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
          Sprzedaż wg typu produktu
        </Typography>
        {stats?.salesByType && stats.salesByType.length > 0 ? (
          <Box sx={{ display: 'flex', gap: 3, flexWrap: 'wrap' }}>
            {stats.salesByType.map((item) => (
              <Box key={item.type} sx={{ flex: '1 1 200px', minWidth: 200 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="body2" sx={{ fontWeight: 500 }}>
                    {PRODUCT_TYPE_LABELS[item.type] || item.type}
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                    {formatCurrency(item.total)}
                  </Typography>
                </Box>
                <Box
                  sx={{
                    width: '100%',
                    height: 10,
                    bgcolor: 'grey.200',
                    borderRadius: 1,
                    overflow: 'hidden',
                  }}
                >
                  <Box
                    sx={{
                      width: `${(item.total / (stats.totalSales || 1)) * 100}%`,
                      height: '100%',
                      bgcolor: 'primary.main',
                      borderRadius: 1,
                    }}
                  />
                </Box>
              </Box>
            ))}
          </Box>
        ) : (
          <Typography variant="body2" color="text.secondary">
            Brak danych sprzedażowych za ten okres
          </Typography>
        )}
      </Paper>

      {/* Sales by Brand */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
          Sprzedaż wg marki
        </Typography>
        {stats?.salesByBrand && stats.salesByBrand.length > 0 ? (
          <Box sx={{ display: 'flex', gap: 3, flexWrap: 'wrap' }}>
            {stats.salesByBrand.slice(0, 10).map((item, index) => (
              <Box key={index} sx={{ flex: '1 1 200px', minWidth: 200 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="body2" sx={{ fontWeight: 500 }}>
                    {item.brand || 'Nieznana marka'}
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                    {formatCurrency(item.totalSales)}
                  </Typography>
                </Box>
                <Box
                  sx={{
                    width: '100%',
                    height: 10,
                    bgcolor: 'grey.200',
                    borderRadius: 1,
                    overflow: 'hidden',
                  }}
                >
                  <Box
                    sx={{
                      width: `${(item.totalSales / (stats.totalSales || 1)) * 100}%`,
                      height: '100%',
                      bgcolor: 'secondary.main',
                      borderRadius: 1,
                    }}
                  />
                </Box>
              </Box>
            ))}
          </Box>
        ) : (
          <Typography variant="body2" color="text.secondary">
            Brak danych sprzedażowych za ten okres
          </Typography>
        )}
      </Paper>

      {/* Store Comparison */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>
          Porównanie salonów
        </Typography>
        {storeComparison.length > 0 ? (
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell sx={{ fontWeight: 600 }}>Salon</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 600 }}>Łączna sprzedaż</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 600 }}>Liczba sprzedaży</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 600 }}>Produkty w magazynie</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Udział w sprzedaży</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {storeComparison.map((store) => {
                  const totalRevenue = storeComparison.reduce((sum, s) => sum + s.totalSales, 0);
                  const salesPercentage = totalRevenue > 0 ? (store.totalSales / totalRevenue) * 100 : 0;

                  return (
                    <TableRow key={store.id} hover>
                      <TableCell>
                        <Typography variant="body2" sx={{ fontWeight: 500 }}>
                          {store.name}
                        </Typography>
                      </TableCell>
                      <TableCell align="right">
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                          {formatCurrency(store.totalSales)}
                        </Typography>
                      </TableCell>
                      <TableCell align="right">
                        <Typography variant="body2">
                          {store.salesCount}
                        </Typography>
                      </TableCell>
                      <TableCell align="right">
                        <Typography variant="body2">
                          {store.totalProducts}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Box
                            sx={{
                              flex: 1,
                              height: 8,
                              bgcolor: 'grey.200',
                              borderRadius: 1,
                              overflow: 'hidden',
                            }}
                          >
                            <Box
                              sx={{
                                width: `${salesPercentage}%`,
                                height: '100%',
                                bgcolor: 'primary.main',
                                borderRadius: 1,
                              }}
                            />
                          </Box>
                          <Typography variant="caption" sx={{ minWidth: 45, textAlign: 'right' }}>
                            {salesPercentage.toFixed(1)}%
                          </Typography>
                        </Box>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>
        ) : (
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <Typography variant="body2" color="text.secondary">
              Brak danych do porównania
            </Typography>
          </Box>
        )}
      </Paper>
    </Container >
  );
}

export default DashboardPage;
