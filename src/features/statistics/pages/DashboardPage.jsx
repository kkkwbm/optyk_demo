import { useEffect } from 'react';
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
  TrendingUp,
  TrendingDown,
  DollarSign,
  Glasses,
} from 'lucide-react';
import { formatDate } from '../../../utils/dateFormat';
import {
  fetchDashboardStats,
  selectDashboardStats,
} from '../statisticsSlice';
import { fetchRecentSales, selectSales } from '../../sales/salesSlice';
import { selectCurrentLocation } from '../../locations/locationsSlice';
import { DATE_FORMATS, SALE_STATUS_LABELS, PRODUCT_TYPE_LABELS } from '../../../constants';

function DashboardPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const stats = useSelector(selectDashboardStats);
  const recentSales = useSelector(selectSales);
  const currentLocation = useSelector(selectCurrentLocation);

  useEffect(() => {
    // Fetch all-time statistics (no date range filter)
    // Handle "All Stores" by sending undefined (which becomes null in backend)
    // If currentLocation is null (Global view), it's also undefined
    const locationId = (currentLocation?.id === 'ALL_STORES' || !currentLocation)
      ? undefined
      : currentLocation.id;

    dispatch(fetchDashboardStats({ locationId }));
    dispatch(fetchRecentSales({ limit: 5, locationId }));
  }, [dispatch, currentLocation]);

  const formatCurrency = (value) => {
    return `$${(value || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const renderTrend = (value, isReversed = false) => {
    if (!value || value === 0) return null;
    const isPositive = isReversed ? value < 0 : value > 0;
    const Icon = isPositive ? TrendingUp : TrendingDown;
    const color = isPositive ? 'success.main' : 'error.main';

    return (
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, color }}>
        <Icon size={16} />
        <Typography variant="caption" sx={{ fontWeight: 600 }}>
          {Math.abs(value).toFixed(1)}%
        </Typography>
      </Box>
    );
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
                {renderTrend(stats?.salesTrend)}
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
                {stats?.activeTransfers || 0}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Aktywne przesunięcia
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
                {stats?.totalProducts || 0}
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
                {stats?.uniqueFramesCount || 0}
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

      <Grid container spacing={3}>
        {/* Revenue Trends */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, height: '100%' }}>
            <Typography variant="h6" sx={{ mb: 2 }}>
              Trend przychodów (Dzienny)
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'flex-end', height: 200, gap: 1, overflowX: 'auto', pb: 1 }}>
              {stats?.revenueTrends && stats.revenueTrends.length > 0 ? (
                stats.revenueTrends.map((item) => (
                  <Box key={item.date} sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', minWidth: 40, flex: 1 }}>
                    <Box
                      sx={{
                        width: '100%',
                        height: `${Math.max((item.revenue / (Math.max(...stats.revenueTrends.map(i => i.revenue)) || 1)) * 100, 5)}%`,
                        bgcolor: 'primary.main',
                        borderRadius: '4px 4px 0 0',
                        transition: 'height 0.3s',
                        '&:hover': { bgcolor: 'primary.dark' },
                      }}
                      title={`${item.date}: ${formatCurrency(item.revenue)}`}
                    />
                    <Typography variant="caption" sx={{ mt: 1, fontSize: '0.7rem', whiteSpace: 'nowrap', transform: 'rotate(-45deg)', transformOrigin: 'left top' }}>
                      {formatDate(new Date(item.date), 'dd.MM')}
                    </Typography>
                  </Box>
                ))
              ) : (
                <Typography variant="body2" color="text.secondary" sx={{ width: '100%', textAlign: 'center', alignSelf: 'center' }}>
                  Brak danych o przychodach
                </Typography>
              )}
            </Box>
          </Paper>
        </Grid>

        {/* Sales by Product Type */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, height: '100%' }}>
            <Typography variant="h6" sx={{ mb: 2 }}>
              Sprzedaż wg typu produktu
            </Typography>
            {stats?.salesByType && stats.salesByType.length > 0 ? (
              <Box>
                {stats.salesByType.map((item) => (
                  <Box key={item.type} sx={{ mb: 2 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Typography variant="body2">
                        {PRODUCT_TYPE_LABELS[item.type] || item.type}
                      </Typography>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>
                        {formatCurrency(item.total)}
                      </Typography>
                    </Box>
                    <Box
                      sx={{
                        width: '100%',
                        height: 8,
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
        </Grid>

        {/* Sales by Brand */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, height: '100%' }}>
            <Typography variant="h6" sx={{ mb: 2 }}>
              Sprzedaż wg marki
            </Typography>
            {stats?.salesByBrand && stats.salesByBrand.length > 0 ? (
              <Box>
                {stats.salesByBrand.slice(0, 5).map((item, index) => (
                  <Box key={index} sx={{ mb: 2 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Typography variant="body2">
                        {item.brand || 'Nieznana marka'}
                      </Typography>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>
                        {formatCurrency(item.totalSales)}
                      </Typography>
                    </Box>
                    <Box
                      sx={{
                        width: '100%',
                        height: 8,
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
        </Grid>

        {/* Recent Sales */}
        <Grid item xs={12}>
          <Paper sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6">Ostatnie sprzedaże</Typography>
              <Button size="small" onClick={() => navigate('/sales')}>
                Zobacz wszystkie
              </Button>
            </Box>
            <TableContainer sx={{ bgcolor: 'background.default' }}>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 600, bgcolor: 'background.paper' }}>Sprzedaż #</TableCell>
                    <TableCell sx={{ fontWeight: 600, bgcolor: 'background.paper' }}>Data</TableCell>
                    <TableCell sx={{ fontWeight: 600, bgcolor: 'background.paper' }}>Lokalizacja</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 600, bgcolor: 'background.paper' }}>Razem</TableCell>
                    <TableCell sx={{ fontWeight: 600, bgcolor: 'background.paper' }}>Status</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {recentSales.length > 0 ? (
                    recentSales.slice(0, 5).map((sale) => (
                      <TableRow
                        key={sale.id}
                        hover
                        sx={{ cursor: 'pointer' }}
                        onClick={() => navigate(`/sales/${sale.id}`)}
                      >
                        <TableCell>#{sale.saleNumber || sale.id.slice(0, 8)}</TableCell>
                        <TableCell>
                          {formatDate(new Date(sale.createdAt), DATE_FORMATS.DISPLAY)}
                        </TableCell>
                        <TableCell>{sale.location?.name || '-'}</TableCell>
                        <TableCell align="right">
                          {formatCurrency(sale.totalAmount)}
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={SALE_STATUS_LABELS[sale.status]}
                            size="small"
                            color="success"
                          />
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={5} align="center">
                        <Typography variant="body2" color="text.secondary">
                          Brak ostatnich sprzedaży
                        </Typography>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </Grid>
      </Grid>
    </Container >
  );
}

export default DashboardPage;
