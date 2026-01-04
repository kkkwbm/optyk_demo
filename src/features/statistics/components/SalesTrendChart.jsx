import { Box, Typography, ToggleButtonGroup, ToggleButton } from '@mui/material';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { format } from 'date-fns';
import { pl } from 'date-fns/locale';

function SalesTrendChart({ data, period, onPeriodChange, chartType, onChartTypeChange }) {
  const formatCurrency = (value) => {
    return `${(value || 0).toLocaleString('pl-PL', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} zł`;
  };

  const formatXAxisLabel = (value) => {
    if (!value) return '';
    try {
      const date = new Date(value);
      switch (period) {
        case 'day':
          return format(date, 'dd MMM', { locale: pl });
        case 'week':
          return format(date, 'dd MMM', { locale: pl });
        case 'month':
          return format(date, 'MMM yyyy', { locale: pl });
        default:
          return format(date, 'dd MMM yyyy', { locale: pl });
      }
    } catch (error) {
      return value;
    }
  };

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <Box
          sx={{
            bgcolor: 'background.paper',
            p: 2,
            border: 1,
            borderColor: 'divider',
            borderRadius: 1,
            boxShadow: 2,
          }}
        >
          <Typography variant="body2" sx={{ fontWeight: 600, mb: 1 }}>
            {formatXAxisLabel(label)}
          </Typography>
          {payload.map((entry, index) => (
            <Box key={index} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Box
                sx={{
                  width: 12,
                  height: 12,
                  bgcolor: entry.color,
                  borderRadius: '50%',
                }}
              />
              <Typography variant="body2" color="text.secondary">
                {entry.name}:
              </Typography>
              <Typography variant="body2" sx={{ fontWeight: 600 }}>
                {entry.name === 'Liczba sprzedaży'
                  ? entry.value
                  : formatCurrency(entry.value)}
              </Typography>
            </Box>
          ))}
        </Box>
      );
    }
    return null;
  };

  return (
    <Box>
      {/* Controls */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, flexWrap: 'wrap', gap: 2 }}>
        {/* Period Selection */}
        <Box>
          <Typography variant="body2" sx={{ fontWeight: 600, mb: 1 }}>
            Grupowanie
          </Typography>
          <ToggleButtonGroup
            value={period}
            exclusive
            onChange={(event, newPeriod) => {
              if (newPeriod !== null) {
                onPeriodChange(newPeriod);
              }
            }}
            aria-label="wybór okresu"
            sx={{ gap: 1 }}
          >
            <ToggleButton
              value="day"
              aria-label="dzień"
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
              Dzień
            </ToggleButton>
            <ToggleButton
              value="week"
              aria-label="tydzień"
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
              Tydzień
            </ToggleButton>
            <ToggleButton
              value="month"
              aria-label="miesiąc"
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
              Miesiąc
            </ToggleButton>
          </ToggleButtonGroup>
        </Box>

        {/* Chart Type Selection */}
        <Box>
          <Typography variant="body2" sx={{ fontWeight: 600, mb: 1 }}>
            Typ wykresu
          </Typography>
          <ToggleButtonGroup
            value={chartType}
            exclusive
            onChange={(event, newType) => {
              if (newType !== null) {
                onChartTypeChange(newType);
              }
            }}
            aria-label="typ wykresu"
            sx={{ gap: 1 }}
          >
            <ToggleButton
              value="line"
              aria-label="liniowy"
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
              Liniowy
            </ToggleButton>
            <ToggleButton
              value="bar"
              aria-label="słupkowy"
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
              Słupkowy
            </ToggleButton>
          </ToggleButtonGroup>
        </Box>
      </Box>

      {/* Chart */}
      {data && data.length > 0 ? (
        <Box sx={{ width: '100%', height: 400 }}>
          <ResponsiveContainer width="100%" height="100%">
            {chartType === 'line' ? (
              <LineChart
                data={data}
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="period"
                  tickFormatter={formatXAxisLabel}
                  angle={-45}
                  textAnchor="end"
                  height={80}
                />
                <YAxis yAxisId="left" />
                <YAxis yAxisId="right" orientation="right" />
                <Tooltip content={<CustomTooltip />} />
                <Legend wrapperStyle={{ fontSize: '12px' }} />
                <Line
                  yAxisId="left"
                  type="monotone"
                  dataKey="totalSales"
                  stroke="#2e7d32"
                  strokeWidth={2}
                  name="Wartość sprzedaży (zł)"
                  dot={{ r: 4 }}
                  activeDot={{ r: 6 }}
                />
                <Line
                  yAxisId="right"
                  type="monotone"
                  dataKey="salesCount"
                  stroke="#1976d2"
                  strokeWidth={2}
                  name="Liczba sprzedaży"
                  dot={{ r: 4 }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            ) : (
              <BarChart
                data={data}
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="period"
                  tickFormatter={formatXAxisLabel}
                  angle={-45}
                  textAnchor="end"
                  height={80}
                />
                <YAxis yAxisId="left" />
                <YAxis yAxisId="right" orientation="right" />
                <Tooltip content={<CustomTooltip />} />
                <Legend wrapperStyle={{ fontSize: '12px' }} />
                <Bar
                  yAxisId="left"
                  dataKey="totalSales"
                  fill="#2e7d32"
                  name="Wartość sprzedaży (zł)"
                  radius={[4, 4, 0, 0]}
                />
                <Bar
                  yAxisId="right"
                  dataKey="salesCount"
                  fill="#1976d2"
                  name="Liczba sprzedaży"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            )}
          </ResponsiveContainer>
        </Box>
      ) : (
        <Box sx={{ textAlign: 'center', py: 10 }}>
          <Typography variant="body2" color="text.secondary">
            Brak danych dla wybranego zakresu dat
          </Typography>
        </Box>
      )}
    </Box>
  );
}

export default SalesTrendChart;
