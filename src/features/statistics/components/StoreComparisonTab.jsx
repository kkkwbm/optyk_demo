import { Box, Paper, Typography, Button, ToggleButtonGroup, ToggleButton, CircularProgress } from '@mui/material';
import {
  Glasses,
  Sun,
  Contact,
  Droplet,
  ShoppingBag,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LabelList,
} from 'recharts';

function StoreComparisonTab({
  selectedStoreComparisonLocationIds,
  storeComparison,
  productInventoryByLocation,
  productInventoryLoading,
  selectedProductTypes,
  onProductTypesChange,
}) {
  const formatCurrency = (value) => {
    return `${(value || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} zł`;
  };

  const productTypeOptions = [
    { value: 'FRAME', label: 'Oprawki', icon: <Glasses size={20} /> },
    { value: 'SUNGLASSES', label: 'Okulary przeciwsłoneczne', icon: <Sun size={20} /> },
    { value: 'CONTACT_LENS', label: 'Soczewki kontaktowe', icon: <Contact size={20} /> },
    { value: 'SOLUTION', label: 'Płyny', icon: <Droplet size={20} /> },
    { value: 'OTHER', label: 'Inne produkty', icon: <ShoppingBag size={20} /> },
  ];

  const productTypeConfig = {
    'FRAME': { color: '#9c27b0', label: 'Oprawki' },
    'SUNGLASSES': { color: '#ff6f00', label: 'Okulary przeciwsłoneczne' },
    'CONTACT_LENS': { color: '#2e7d32', label: 'Soczewki kontaktowe' },
    'SOLUTION': { color: '#ed6c02', label: 'Płyny' },
    'OTHER': { color: '#d32f2f', label: 'Inne produkty' },
  };

  const getFilteredStoreComparisonData = () => {
    if (!storeComparison?.stores) {
      return [];
    }

    if (selectedStoreComparisonLocationIds.length === 0) {
      return storeComparison.stores;
    }

    return storeComparison.stores.filter(store =>
      selectedStoreComparisonLocationIds.includes(store.locationId)
    );
  };

  const getFilteredProductInventoryData = () => {
    if (!productInventoryByLocation?.locations) {
      return [];
    }

    if (selectedStoreComparisonLocationIds.length === 0) {
      return productInventoryByLocation.locations.map(location => {
        const dataPoint = {
          locationName: location.locationName,
        };

        productInventoryByLocation.productTypes?.forEach(type => {
          const quantity = location.productTypeQuantities?.[type] || 0;
          dataPoint[type] = quantity;
        });

        return dataPoint;
      });
    }

    return productInventoryByLocation.locations
      .filter(location => selectedStoreComparisonLocationIds.includes(location.locationId))
      .map(location => {
        const dataPoint = {
          locationName: location.locationName,
        };

        productInventoryByLocation.productTypes?.forEach(type => {
          const quantity = location.productTypeQuantities?.[type] || 0;
          dataPoint[type] = quantity;
        });

        return dataPoint;
      });
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 3, width: '100%' }}>
        {/* Sales Quantity Chart */}
        <Paper sx={{ p: 3, flex: 1, minWidth: 0 }}>
          <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
            Ilość sprzedaży w salonach
          </Typography>
          {(() => {
            const filteredStores = getFilteredStoreComparisonData();
            return filteredStores && filteredStores.length > 0 ? (
              (() => {
                const totalSalesCount = filteredStores.reduce((sum, store) => sum + store.salesCount, 0);

                return (
                  <Box sx={{ width: '100%', height: 450 }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={filteredStores}
                        margin={{ top: 20, right: 20, left: 10, bottom: 50 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis
                          dataKey="locationName"
                          angle={-45}
                          textAnchor="end"
                          height={80}
                          interval={0}
                          tick={{ fontSize: 13 }}
                        />
                        <YAxis />
                        <Tooltip />
                        <Legend wrapperStyle={{ fontSize: '12px' }} />
                        <Bar
                          dataKey="salesCount"
                          fill="#1976d2"
                          name="Liczba sprzedaży"
                          radius={[4, 4, 0, 0]}
                        >
                          <LabelList
                            dataKey="salesCount"
                            position="top"
                            formatter={(value) => `${((value / totalSalesCount) * 100).toFixed(1)}%`}
                            style={{ fontSize: '12px', fontWeight: 600 }}
                          />
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </Box>
                );
              })()
            ) : (
              <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 10 }}>
                Brak danych do wyświetlenia
              </Typography>
            );
          })()}
        </Paper>

        {/* Sales Value Chart */}
        <Paper sx={{ p: 3, flex: 1, minWidth: 0 }}>
          <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
            Wartość sprzedaży w salonach
          </Typography>
          {(() => {
            const filteredStores = getFilteredStoreComparisonData();
            return filteredStores && filteredStores.length > 0 ? (
              (() => {
                const totalSalesValue = filteredStores.reduce((sum, store) => sum + store.totalSales, 0);

                return (
                  <Box sx={{ width: '100%', height: 450 }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={filteredStores}
                        margin={{ top: 20, right: 20, left: 10, bottom: 50 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis
                          dataKey="locationName"
                          angle={-45}
                          textAnchor="end"
                          height={80}
                          interval={0}
                          tick={{ fontSize: 13 }}
                        />
                        <YAxis />
                        <Tooltip
                          formatter={(value) => formatCurrency(value)}
                        />
                        <Legend wrapperStyle={{ fontSize: '12px' }} />
                        <Bar
                          dataKey="totalSales"
                          fill="#2e7d32"
                          name="Wartość sprzedaży (zł)"
                          radius={[4, 4, 0, 0]}
                        >
                          <LabelList
                            dataKey="totalSales"
                            position="top"
                            formatter={(value) => `${((value / totalSalesValue) * 100).toFixed(1)}%`}
                            style={{ fontSize: '12px', fontWeight: 600 }}
                          />
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </Box>
                );
              })()
            ) : (
              <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 10 }}>
                Brak danych do wyświetlenia
              </Typography>
            );
          })()}
        </Paper>
      </Box>

      {/* Product Type Inventory by Location Chart */}
      <Box sx={{ width: '100%', mt: 3 }}>
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>
            Ilość produktów w salonach
          </Typography>

          {/* Product Type Selection */}
          <Box sx={{ mb: 3 }}>
            <Box sx={{ mb: 2 }}>
              <Typography variant="body2" sx={{ fontWeight: 600, mb: 1 }}>
                Typy produktów
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {selectedProductTypes.length === 0
                  ? 'Wybierz typy produktów'
                  : `Wybrano: ${selectedProductTypes.length} typów`}
              </Typography>
            </Box>
            <ToggleButtonGroup
              value={selectedProductTypes}
              onChange={onProductTypesChange}
              aria-label="wybór typów produktów"
              sx={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: 1
              }}
            >
              {productTypeOptions.map((option) => (
                <ToggleButton
                  key={option.value}
                  value={option.value}
                  aria-label={option.label}
                  sx={{
                    px: 2,
                    py: 1,
                    textTransform: 'none',
                    borderRadius: 2,
                    border: '1px solid',
                    borderColor: 'divider',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1,
                    '&.Mui-selected': {
                      bgcolor: 'primary.main',
                      color: 'primary.contrastText',
                      '&:hover': {
                        bgcolor: 'primary.dark',
                      },
                    },
                  }}
                >
                  {option.icon}
                  {option.label}
                </ToggleButton>
              ))}
            </ToggleButtonGroup>
          </Box>

          {/* Chart */}
          {productInventoryLoading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', py: 10 }}>
              <CircularProgress />
            </Box>
          ) : selectedProductTypes.length > 0 ? (
            (() => {
              const filteredInventoryData = getFilteredProductInventoryData();
              return filteredInventoryData.length > 0 ? (
                <Box sx={{ width: '100%', height: 450 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={filteredInventoryData}
                      margin={{ top: 20, right: 20, left: 10, bottom: 50 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis
                        dataKey="locationName"
                        angle={-45}
                        textAnchor="end"
                        height={80}
                        interval={0}
                        tick={{ fontSize: 13 }}
                      />
                      <YAxis />
                      <Tooltip />
                      <Legend wrapperStyle={{ fontSize: '12px' }} />
                      {productInventoryByLocation?.productTypes?.map((type) => (
                        <Bar
                          key={type}
                          dataKey={type}
                          fill={productTypeConfig[type]?.color || '#1976d2'}
                          name={productTypeConfig[type]?.label || type}
                          radius={[4, 4, 0, 0]}
                        />
                      ))}
                    </BarChart>
                  </ResponsiveContainer>
                </Box>
              ) : (
                <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 10 }}>
                  Brak danych do wyświetlenia
                </Typography>
              );
            })()
          ) : (
            <Box sx={{ textAlign: 'center', py: 10 }}>
              <Typography variant="body2" color="text.secondary">
                Wybierz typy produktów powyżej, aby zobaczyć wykres ich dostępności w różnych lokalizacjach
              </Typography>
            </Box>
          )}
        </Paper>
      </Box>
    </Box>
  );
}

export default StoreComparisonTab;
