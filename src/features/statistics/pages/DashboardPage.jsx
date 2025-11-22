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
  TextField,
  MenuItem,
} from '@mui/material';
import {
  BarChart3,
  Package,
  ShoppingCart,
  ArrowLeftRight,
  TrendingUp,
  TrendingDown,
  DollarSign,
} from 'lucide-react';
import { format, subDays, startOfDay, endOfDay } from 'date-fns';
import { selectUser } from '../../auth/authSlice';
import {
  fetchDashboardStats,
  selectDashboardStats,
  selectStatisticsLoading,
} from '../statisticsSlice';
import { fetchRecentSales, selectSales } from '../../sales/salesSlice';
import { selectCurrentLocation } from '../../locations/locationsSlice';
import { DATE_FORMATS, SALE_STATUS_LABELS, PRODUCT_TYPE_LABELS } from '../../../constants';

function DashboardPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const user = useSelector(selectUser);
  const stats = useSelector(selectDashboardStats);
  const loading = useSelector(selectStatisticsLoading);
  const recentSales = useSelector(selectSales);
  const currentLocation = useSelector(selectCurrentLocation);

  const [dateRange, setDateRange] = useState('today');

  useEffect(() => {
    // Calculate date range based on selected period
    const end = endOfDay(new Date());
    let start;

    switch (dateRange) {
      case 'today':
        start = startOfDay(new Date());
        break;
      case 'week':
        start = startOfDay(subDays(new Date(), 7));
        break;
      case 'month':
        start = startOfDay(subDays(new Date(), 30));
        break;
      case 'quarter':
        start = startOfDay(subDays(new Date(), 90));
        break;
      case 'year':
        start = startOfDay(subDays(new Date(), 365));
        break;
      default:
        start = startOfDay(new Date());
    }

    const startDate = format(start, 'yyyy-MM-dd');
    const endDate = format(end, 'yyyy-MM-dd');
    const locationId = currentLocation?.id || undefined;

    dispatch(fetchDashboardStats({ startDate, endDate, locationId }));
    dispatch(fetchRecentSales({ limit: 5, locationId }));
  }, [dispatch, dateRange, currentLocation]);

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
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" sx={{ fontWeight: 600 }}>
          Statystyki
        </Typography>
        <TextField
          select
          size="small"
          value={dateRange}
          onChange={(e) => setDateRange(e.target.value)}
          sx={{ minWidth: 150 }}
        >
          <MenuItem value="today">Dziś</MenuItem>
          <MenuItem value="week">Ostatnie 7 dni</MenuItem>
          <MenuItem value="month">Ostatnie 30 dni</MenuItem>
          <MenuItem value="quarter">Ostatnie 90 dni</MenuItem>
          <MenuItem value="year">Ostatni rok</MenuItem>
        </TextField>
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
        <Grid item xs={12} sm={6} md={3}>
          <Card>
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

        {/* Total Products */}
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                <Box
                  sx={{
                    width: 48,
                    height: 48,
                    borderRadius: 2,
                    bgcolor: 'primary.light',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Package size={24} color="#fff" />
                </Box>
                {renderTrend(stats?.inventoryTrend, true)}
              </Box>
              <Typography variant="h4" sx={{ fontWeight: 600, mb: 0.5 }}>
                {stats?.totalProducts || 0}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Łącznie produktów
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* Sales Count */}
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                <Box
                  sx={{
                    width: 48,
                    height: 48,
                    borderRadius: 2,
                    bgcolor: 'info.light',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <ShoppingCart size={24} color="#fff" />
                </Box>
                {renderTrend(stats?.salesCountTrend)}
              </Box>
              <Typography variant="h4" sx={{ fontWeight: 600, mb: 0.5 }}>
                {stats?.salesCount || 0}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Transakcje sprzedaży
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* Transfers */}
        <Grid item xs={12} sm={6} md={3}>
          <Card>
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
                {stats?.transfersCount || 0}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Transfery
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Grid container spacing={3}>
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

        {/* Top Products */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, height: '100%' }}>
            <Typography variant="h6" sx={{ mb: 2 }}>
              Najlepsze produkty
            </Typography>
            {stats?.topProducts && stats.topProducts.length > 0 ? (
              <Box>
                {stats.topProducts.map((item, index) => (
                  <Box
                    key={index}
                    sx={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      mb: 2,
                      pb: 2,
                      borderBottom: index < stats.topProducts.length - 1 ? '1px solid' : 'none',
                      borderColor: 'divider',
                    }}
                  >
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>
                        {item.productName}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {item.brand}
                      </Typography>
                    </Box>
                    <Box sx={{ textAlign: 'right' }}>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>
                        {item.quantity} sprzedane
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {formatCurrency(item.revenue)}
                      </Typography>
                    </Box>
                  </Box>
                ))}
              </Box>
            ) : (
              <Typography variant="body2" color="text.secondary">
                Brak danych produktów za ten okres
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
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Sprzedaż #</TableCell>
                    <TableCell>Data</TableCell>
                    <TableCell>Lokalizacja</TableCell>
                    <TableCell align="right">Razem</TableCell>
                    <TableCell>Status</TableCell>
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
                          {format(new Date(sale.createdAt), DATE_FORMATS.DISPLAY)}
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
    </Container>
  );
}

export default DashboardPage;
