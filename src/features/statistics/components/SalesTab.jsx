import { useState } from 'react';
import { Box, Paper, Typography, Button } from '@mui/material';
import {
  Glasses,
  Sun,
  Contact,
  Droplet,
  ShoppingBag,
  Package,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LabelList,
} from 'recharts';
import DateRangePicker from './DateRangePicker';
import SalesTrendChart from './SalesTrendChart';

function SalesTab({
  customStartDate,
  customEndDate,
  onStartDateChange,
  onEndDateChange,
  trendPeriod,
  onTrendPeriodChange,
  trendChartType,
  onTrendChartTypeChange,
  salesTrend,
  stats,
  productAnalytics,
  storeComparison,
}) {
  const [brandDisplayCount, setBrandDisplayCount] = useState(10);

  const formatCurrency = (value) => {
    return `${(value || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} zł`;
  };

  const getProductTypeLabel = (type) => {
    const config = {
      'FRAME': 'Oprawki',
      'SUNGLASSES': 'Okulary przeciwsłoneczne',
      'CONTACT_LENS': 'Soczewki kontaktowe',
      'SOLUTION': 'Płyny',
      'OTHER': 'Inne produkty',
    };
    return config[type] || type;
  };

  const getProductTypeIcon = (type) => {
    const icons = {
      'FRAME': <Glasses size={20} />,
      'SUNGLASSES': <Sun size={20} />,
      'CONTACT_LENS': <Contact size={20} />,
      'SOLUTION': <Droplet size={20} />,
      'OTHER': <ShoppingBag size={20} />,
    };
    return icons[type] || <Package size={20} />;
  };

  return (
    <Box>
      {/* Sales Trend Chart */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>
          Wykres sprzedaży w czasie
        </Typography>
        <Box sx={{ mb: 3 }}>
          <DateRangePicker
            label="Wybierz zakres dat"
            startDate={customStartDate}
            endDate={customEndDate}
            onStartDateChange={onStartDateChange}
            onEndDateChange={onEndDateChange}
          />
        </Box>
        {customStartDate && customEndDate ? (
          <SalesTrendChart
            data={salesTrend}
            period={trendPeriod}
            onPeriodChange={onTrendPeriodChange}
            chartType={trendChartType}
            onChartTypeChange={onTrendChartTypeChange}
          />
        ) : (
          <Box sx={{ textAlign: 'center', py: 10 }}>
            <Typography variant="body2" color="text.secondary">
              Wybierz zakres dat, aby zobaczyć wykres sprzedaży w czasie
            </Typography>
          </Box>
        )}
      </Paper>

      {/* Sales by Brand */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 3, flexWrap: 'wrap', gap: 2 }}>
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 0.5 }}>
              Sprzedaż według marki
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {stats?.salesByBrand?.length > 0
                ? `Łącznie ${stats.salesByBrand.length} marek | Wyświetlam top ${Math.min(brandDisplayCount, stats.salesByBrand.length)}`
                : 'Brak danych'}
            </Typography>
          </Box>
          {stats?.salesByBrand && stats.salesByBrand.length > 0 && (
            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
              <Button
                size="small"
                variant={brandDisplayCount === 5 ? 'contained' : 'outlined'}
                onClick={() => setBrandDisplayCount(5)}
                sx={{ textTransform: 'none', minWidth: 70 }}
              >
                Top 5
              </Button>
              <Button
                size="small"
                variant={brandDisplayCount === 10 ? 'contained' : 'outlined'}
                onClick={() => setBrandDisplayCount(10)}
                sx={{ textTransform: 'none', minWidth: 70 }}
              >
                Top 10
              </Button>
              <Button
                size="small"
                variant={brandDisplayCount === 20 ? 'contained' : 'outlined'}
                onClick={() => setBrandDisplayCount(20)}
                sx={{ textTransform: 'none', minWidth: 70 }}
              >
                Top 20
              </Button>
              <Button
                size="small"
                variant={brandDisplayCount === 999 ? 'contained' : 'outlined'}
                onClick={() => setBrandDisplayCount(999)}
                sx={{ textTransform: 'none', minWidth: 90 }}
              >
                Wszystkie
              </Button>
            </Box>
          )}
        </Box>
        {stats?.salesByBrand && stats.salesByBrand.length > 0 ? (
          (() => {
            const sortedBrands = [...stats.salesByBrand].sort((a, b) => b.totalSales - a.totalSales);
            const displayedBrands = sortedBrands.slice(0, brandDisplayCount);
            const totalBrandSales = sortedBrands.reduce((sum, brand) => sum + brand.totalSales, 0);

            return (
              <Box sx={{ width: '100%', height: Math.max(400, displayedBrands.length * 40 + 100) }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={displayedBrands}
                    layout="vertical"
                    margin={{ top: 5, right: 100, left: 120, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" tickFormatter={(value) => formatCurrency(value)} />
                    <YAxis
                      dataKey="brand"
                      type="category"
                      width={110}
                      tick={{ fontSize: 12 }}
                      tickFormatter={(value) => value || 'Nieznana'}
                    />
                    <Tooltip
                      formatter={(value) => formatCurrency(value)}
                      labelFormatter={(label) => label || 'Nieznana marka'}
                    />
                    <Bar
                      dataKey="totalSales"
                      fill="#9c27b0"
                      name="Wartość sprzedaży"
                      radius={[0, 4, 4, 0]}
                    >
                      <LabelList
                        dataKey="totalSales"
                        position="right"
                        formatter={(value) => {
                          const percentage = ((value / totalBrandSales) * 100).toFixed(1);
                          return `${formatCurrency(value)} (${percentage}%)`;
                        }}
                        style={{ fontSize: '11px', fontWeight: 600 }}
                      />
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </Box>
            );
          })()
        ) : (
          <Typography variant="body2" color="text.secondary">
            Brak danych sprzedażowych za ten okres
          </Typography>
        )}
      </Paper>

      {/* Sales by Product Type */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
          Sprzedaż według typów produktów
        </Typography>
        {productAnalytics?.salesByProductType && productAnalytics.salesByProductType.length > 0 ? (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {productAnalytics.salesByProductType.map((typeData, index) => (
              <Box
                key={index}
                sx={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  p: 2,
                  bgcolor: (theme) => theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'grey.50',
                  borderRadius: 1,
                }}
              >
                <Box sx={{ flex: 1, display: 'flex', alignItems: 'center', gap: 2 }}>
                  {getProductTypeIcon(typeData.productType)}
                  <Typography variant="body1" sx={{ fontWeight: 600 }}>
                    {getProductTypeLabel(typeData.productType)}
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', gap: 3, alignItems: 'center' }}>
                  <Box sx={{ textAlign: 'right' }}>
                    <Typography variant="body2" color="text.secondary">
                      Ilość sprzedana
                    </Typography>
                    <Typography variant="body1" sx={{ fontWeight: 600 }}>
                      {typeData.totalQuantitySold} szt.
                    </Typography>
                  </Box>
                  <Box sx={{ textAlign: 'right' }}>
                    <Typography variant="body2" color="text.secondary">
                      Przychód
                    </Typography>
                    <Typography variant="body1" sx={{ fontWeight: 600 }}>
                      {formatCurrency(typeData.totalRevenue)}
                    </Typography>
                  </Box>
                  <Box sx={{ textAlign: 'right' }}>
                    <Typography variant="body2" color="text.secondary">
                      Liczba transakcji
                    </Typography>
                    <Typography variant="body1" sx={{ fontWeight: 600 }}>
                      {typeData.transactionCount}
                    </Typography>
                  </Box>
                </Box>
              </Box>
            ))}
          </Box>
        ) : (
          <Typography variant="body2" color="text.secondary">
            Brak danych sprzedażowych produktów za ten okres
          </Typography>
        )}
      </Paper>

      {/* Sales by Locations */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
          Sprzedaż według salonów
        </Typography>
        {storeComparison?.stores && storeComparison.stores.length > 0 ? (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {storeComparison.stores.map((store, index) => (
              <Box
                key={index}
                sx={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  p: 2,
                  bgcolor: (theme) => theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'grey.50',
                  borderRadius: 1,
                }}
              >
                <Box sx={{ flex: 1 }}>
                  <Typography variant="body1" sx={{ fontWeight: 600 }}>
                    #{store.rank} {store.locationName}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {store.locationType === 'STORE' ? 'Salon' : 'Magazyn'}
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', gap: 3, alignItems: 'center' }}>
                  <Box sx={{ textAlign: 'right' }}>
                    <Typography variant="body2" color="text.secondary">
                      Liczba sprzedaży
                    </Typography>
                    <Typography variant="body1" sx={{ fontWeight: 600 }}>
                      {store.salesCount}
                    </Typography>
                  </Box>
                  <Box sx={{ textAlign: 'right' }}>
                    <Typography variant="body2" color="text.secondary">
                      Łączna sprzedaż
                    </Typography>
                    <Typography variant="body1" sx={{ fontWeight: 600 }}>
                      {formatCurrency(store.totalSales)}
                    </Typography>
                  </Box>
                  <Box sx={{ textAlign: 'right' }}>
                    <Typography variant="body2" color="text.secondary">
                      Średnia wartość
                    </Typography>
                    <Typography variant="body1" sx={{ fontWeight: 600 }}>
                      {formatCurrency(store.averageSaleValue)}
                    </Typography>
                  </Box>
                </Box>
              </Box>
            ))}
          </Box>
        ) : (
          <Typography variant="body2" color="text.secondary">
            Brak danych sprzedażowych salonów za ten okres
          </Typography>
        )}
      </Paper>
    </Box>
  );
}

export default SalesTab;
