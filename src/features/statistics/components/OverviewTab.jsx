import { useNavigate } from 'react-router-dom';
import { Box, Paper, Typography, Grid } from '@mui/material';
import {
  Package,
  ShoppingCart,
  ArrowLeftRight,
  DollarSign,
  Glasses,
  Sun,
  Contact,
  Droplet,
  ShoppingBag,
} from 'lucide-react';

function OverviewTab({ stats, productAnalytics }) {
  const navigate = useNavigate();

  const formatCurrency = (value) => {
    return `${(value || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} zł`;
  };

  const getProductTypeLabel = (type) => {
    const config = {
      'FRAME': 'Oprawki',
      'SUNGLASSES': 'Okulary przeciwsłoneczne',
      'CONTACT_LENS': 'Soczewki',
      'SOLUTION': 'Płyny',
      'OTHER': 'Inne produkty',
    };
    return config[type] || type;
  };

  const getProductTypeIcon = (type) => {
    const icons = {
      'FRAME': <Glasses size={18} />,
      'SUNGLASSES': <Sun size={18} />,
      'CONTACT_LENS': <Contact size={18} />,
      'SOLUTION': <Droplet size={18} />,
      'OTHER': <ShoppingBag size={18} />,
    };
    return icons[type] || <Package size={18} />;
  };

  const getProductTypeColor = (type) => {
    const colors = {
      'FRAME': '#9c27b0',
      'SUNGLASSES': '#ff6f00',
      'CONTACT_LENS': '#2e7d32',
      'SOLUTION': '#ed6c02',
      'OTHER': '#757575',
    };
    return colors[type] || '#1976d2';
  };

  const allProductTypes = ['FRAME', 'SUNGLASSES', 'CONTACT_LENS', 'SOLUTION', 'OTHER'];

  return (
    <Box>
      {/* Sales Hierarchy - Total Sales and Sales by Product Type */}
      <Paper
        sx={{
          mb: 3,
          overflow: 'hidden',
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        }}
      >
        {/* Sales Header Section */}
        <Box sx={{ p: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
            <Box
              sx={{
                width: 56,
                height: 56,
                borderRadius: 2,
                bgcolor: 'rgba(255,255,255,0.2)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <ShoppingCart size={28} color="#fff" />
            </Box>
            <Box>
              <Typography variant="h5" sx={{ color: 'white', fontWeight: 600 }}>
                Sprzedaż
              </Typography>
              <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)' }}>
                Podsumowanie i podział według typu produktu
              </Typography>
            </Box>
          </Box>

          {/* Main Stats Row */}
          <Grid container spacing={3}>
            <Grid item xs={12} sm={4}>
              <Box
                sx={{
                  p: 2.5,
                  borderRadius: 2,
                  bgcolor: 'rgba(255,255,255,0.15)',
                  backdropFilter: 'blur(10px)',
                  cursor: 'pointer',
                  transition: 'all 0.3s',
                  '&:hover': {
                    bgcolor: 'rgba(255,255,255,0.25)',
                    transform: 'translateY(-4px)',
                  },
                }}
                onClick={() => navigate('/sales')}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                  <DollarSign size={20} color="#fff" />
                  <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.9)' }}>
                    Łączna sprzedaż
                  </Typography>
                </Box>
                <Typography variant="h3" sx={{ color: 'white', fontWeight: 700 }}>
                  {formatCurrency(stats?.totalSales)}
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={12} sm={4}>
              <Box
                sx={{
                  p: 2.5,
                  borderRadius: 2,
                  bgcolor: 'rgba(255,255,255,0.15)',
                  backdropFilter: 'blur(10px)',
                  cursor: 'pointer',
                  transition: 'all 0.3s',
                  '&:hover': {
                    bgcolor: 'rgba(255,255,255,0.25)',
                    transform: 'translateY(-4px)',
                  },
                }}
                onClick={() => navigate('/sales')}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                  <ShoppingCart size={20} color="#fff" />
                  <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.9)' }}>
                    Liczba sprzedaży
                  </Typography>
                </Box>
                <Typography variant="h3" sx={{ color: 'white', fontWeight: 700 }}>
                  {stats?.salesCount || 0}
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={12} sm={4}>
              <Box
                sx={{
                  p: 2.5,
                  borderRadius: 2,
                  bgcolor: 'rgba(255,255,255,0.15)',
                  backdropFilter: 'blur(10px)',
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                  <ShoppingCart size={20} color="#fff" />
                  <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.9)' }}>
                    Średnia wartość
                  </Typography>
                </Box>
                <Typography variant="h3" sx={{ color: 'white', fontWeight: 700 }}>
                  {formatCurrency((stats?.salesCount && stats?.totalSales) ? (stats.totalSales / stats.salesCount) : 0)}
                </Typography>
              </Box>
            </Grid>
          </Grid>
        </Box>

        {/* Product Type Breakdown - Nested Section */}
        <Box sx={{ bgcolor: 'background.paper', p: 3 }}>
          <Typography variant="subtitle2" sx={{ mb: 2, fontWeight: 600, color: 'text.secondary', textTransform: 'uppercase', letterSpacing: 1 }}>
            Podział według typu produktu
          </Typography>

          <Grid container spacing={2} sx={{ justifyContent: 'stretch' }}>
            {allProductTypes.map((productType) => {
              const typeData = productAnalytics?.salesByProductType?.find(
                item => item.productType === productType
              ) || {
                productType: productType,
                totalQuantitySold: 0,
                totalRevenue: 0,
              };

              const color = getProductTypeColor(productType);

              return (
                <Grid item xs={12} sm={6} md={2.4} key={productType} sx={{ display: 'flex' }}>
                  <Paper
                    variant="outlined"
                    sx={{
                      p: 3,
                      borderRadius: 2,
                      height: 200,
                      width: 180,
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      borderColor: color,
                      bgcolor: `${color}08`,
                    }}
                  >
                    <Box
                      sx={{
                        width: 56,
                        height: 56,
                        borderRadius: 2,
                        bgcolor: color,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        mb: 2,
                      }}
                    >
                      {getProductTypeIcon(productType)}
                    </Box>
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      align="center"
                      sx={{
                        mb: 2,
                        minHeight: 40,
                        display: 'flex',
                        alignItems: 'center',
                        fontWeight: 500,
                        fontSize: '0.95rem',
                      }}
                    >
                      {getProductTypeLabel(productType)}
                    </Typography>
                    <Typography variant="h5" sx={{ fontWeight: 700, color, mb: 0.5 }}>
                      {typeData.totalQuantitySold || 0} szt.
                    </Typography>
                    <Typography variant="h6" sx={{ fontWeight: 600, color }}>
                      {formatCurrency(typeData.totalRevenue || 0)}
                    </Typography>
                  </Paper>
                </Grid>
              );
            })}
          </Grid>
        </Box>
      </Paper>

      {/* Transfers Summary - Hierarchical Layout */}
      <Paper
        sx={{
          mb: 3,
          overflow: 'hidden',
          background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
        }}
      >
        {/* Transfers Header Section */}
        <Box sx={{ p: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
            <Box
              sx={{
                width: 56,
                height: 56,
                borderRadius: 2,
                bgcolor: 'rgba(255,255,255,0.2)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <ArrowLeftRight size={28} color="#fff" />
            </Box>
            <Box>
              <Typography variant="h5" sx={{ color: 'white', fontWeight: 600 }}>
                Transfery
              </Typography>
              <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)' }}>
                Podsumowanie przepływu produktów między lokalizacjami
              </Typography>
            </Box>
          </Box>
        </Box>

        {/* Transfers Breakdown - Nested Section */}
        <Box sx={{ bgcolor: 'background.paper', p: 3 }}>
          <Typography variant="subtitle2" sx={{ mb: 2, fontWeight: 600, color: 'text.secondary', textTransform: 'uppercase', letterSpacing: 1 }}>
            Statystyki transferów
          </Typography>

          <Grid container spacing={2}>
            {/* Active Transfers */}
            <Grid item xs={12} sm={6} md={4}>
              <Paper
                variant="outlined"
                sx={{
                  p: 2,
                  borderRadius: 2,
                  height: 120,
                  width: 180,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderColor: '#ed6c02',
                  bgcolor: 'rgba(237, 108, 2, 0.04)',
                  cursor: 'pointer',
                  transition: 'all 0.3s',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: 2,
                  },
                }}
                onClick={() => navigate('/inventory/transfers')}
              >
                <Box
                  sx={{
                    width: 36,
                    height: 36,
                    borderRadius: 1.5,
                    bgcolor: '#ed6c02',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    mb: 1,
                  }}
                >
                  <ArrowLeftRight size={18} color="#fff" />
                </Box>
                <Typography variant="h5" sx={{ fontWeight: 700, color: '#ed6c02' }}>
                  {stats?.pendingTransfers || 0}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.9rem', fontWeight: 500 }}>
                  Aktywne transfery
                </Typography>
              </Paper>
            </Grid>

            {/* Completed Transfers */}
            <Grid item xs={12} sm={6} md={4}>
              <Paper
                variant="outlined"
                sx={{
                  p: 2,
                  borderRadius: 2,
                  height: 120,
                  width: 180,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderColor: '#2e7d32',
                  bgcolor: 'rgba(46, 125, 50, 0.04)',
                  cursor: 'pointer',
                  transition: 'all 0.3s',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: 2,
                  },
                }}
                onClick={() => navigate('/inventory/transfers')}
              >
                <Box
                  sx={{
                    width: 36,
                    height: 36,
                    borderRadius: 1.5,
                    bgcolor: '#2e7d32',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    mb: 1,
                  }}
                >
                  <ArrowLeftRight size={18} color="#fff" />
                </Box>
                <Typography variant="h5" sx={{ fontWeight: 700, color: '#2e7d32' }}>
                  {stats?.completedTransfers || 0}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.9rem', fontWeight: 500 }}>
                  Wykonane transfery
                </Typography>
              </Paper>
            </Grid>

            {/* Transferred Products */}
            <Grid item xs={12} sm={6} md={4}>
              <Paper
                variant="outlined"
                sx={{
                  p: 2,
                  borderRadius: 2,
                  height: 120,
                  width: 180,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderColor: '#1976d2',
                  bgcolor: 'rgba(25, 118, 210, 0.04)',
                }}
              >
                <Box
                  sx={{
                    width: 36,
                    height: 36,
                    borderRadius: 1.5,
                    bgcolor: '#1976d2',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    mb: 1,
                  }}
                >
                  <Package size={18} color="#fff" />
                </Box>
                <Typography variant="h5" sx={{ fontWeight: 700, color: '#1976d2' }}>
                  {stats?.totalTransferredProducts || 0}
                </Typography>
                <Typography variant="body2" color="text.secondary" align="center" sx={{ fontSize: '0.9rem', fontWeight: 500 }}>
                  Przeniesione produkty
                </Typography>
              </Paper>
            </Grid>
          </Grid>
        </Box>
      </Paper>

      {/* Products Summary - Grouped Hierarchical Layout */}
      <Paper
        sx={{
          mb: 3,
          overflow: 'hidden',
          background: 'linear-gradient(135deg, #90a4ae 0%, #b0bec5 100%)',
        }}
      >
        {/* Products Header Section */}
        <Box sx={{ p: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
            <Box
              sx={{
                width: 56,
                height: 56,
                borderRadius: 2,
                bgcolor: 'rgba(255,255,255,0.2)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Package size={28} color="#fff" />
            </Box>
            <Box>
              <Typography variant="h5" sx={{ color: 'white', fontWeight: 600 }}>
                Wszystkie produkty
              </Typography>
              <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)' }}>
                Podsumowanie asortymentu w magazynie
              </Typography>
            </Box>
          </Box>

          {/* Main Stats Row */}
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6}>
              <Box sx={{
                p: 2,
                borderRadius: 2,
                bgcolor: 'rgba(255,255,255,0.1)',
                backdropFilter: 'blur(10px)',
              }}>
                <Typography variant="h3" sx={{ color: 'white', fontWeight: 700 }}>
                  {stats?.totalProductsInStock || 0}
                </Typography>
                <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.8)' }}>
                  Łączna liczba produktów
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Box sx={{
                p: 2,
                borderRadius: 2,
                bgcolor: 'rgba(255,255,255,0.1)',
                backdropFilter: 'blur(10px)',
              }}>
                <Typography variant="h3" sx={{ color: 'white', fontWeight: 700 }}>
                  {formatCurrency(stats?.totalInventoryValue)}
                </Typography>
                <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.8)' }}>
                  Wartość magazynu
                </Typography>
              </Box>
            </Grid>
          </Grid>
        </Box>

        {/* Product Categories - Nested Section */}
        <Box sx={{ bgcolor: 'background.paper', p: 3 }}>
          <Typography variant="subtitle2" sx={{ mb: 2, fontWeight: 600, color: 'text.secondary', textTransform: 'uppercase', letterSpacing: 1 }}>
            Podział według kategorii
          </Typography>

          <Grid container spacing={2}>
            {/* Oprawki - Liczba */}
            <Grid item xs={6} sm={4} md={2}>
              <Paper
                variant="outlined"
                sx={{
                  p: 2,
                  borderRadius: 2,
                  height: 120,
                  width: 180,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderColor: '#9c27b0',
                  bgcolor: 'rgba(156, 39, 176, 0.04)',
                }}
              >
                <Box
                  sx={{
                    width: 36,
                    height: 36,
                    borderRadius: 1.5,
                    bgcolor: '#9c27b0',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    mb: 1,
                  }}
                >
                  <Glasses size={18} color="#fff" />
                </Box>
                <Typography variant="h5" sx={{ fontWeight: 700, color: '#9c27b0' }}>
                  {stats?.totalFrames || 0}
                </Typography>
                <Typography variant="body2" color="text.secondary" align="center" sx={{ fontSize: '0.9rem', fontWeight: 500 }}>
                  Oprawki
                </Typography>
              </Paper>
            </Grid>

            {/* Oprawki - Unikalne */}
            <Grid item xs={6} sm={4} md={2}>
              <Paper
                variant="outlined"
                sx={{
                  p: 2,
                  borderRadius: 2,
                  height: 120,
                  width: 180,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderColor: 'secondary.main',
                  bgcolor: 'rgba(156, 39, 176, 0.04)',
                }}
              >
                <Box
                  sx={{
                    width: 36,
                    height: 36,
                    borderRadius: 1.5,
                    bgcolor: 'secondary.main',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    mb: 1,
                  }}
                >
                  <Glasses size={18} color="#fff" />
                </Box>
                <Typography variant="h5" sx={{ fontWeight: 700, color: 'secondary.main' }}>
                  {stats?.uniqueFrameModels || 0}
                </Typography>
                <Typography variant="body2" color="text.secondary" align="center" sx={{ fontSize: '0.9rem', fontWeight: 500 }}>
                  Unikalne oprawki
                </Typography>
              </Paper>
            </Grid>

            {/* Sunglasses */}
            <Grid item xs={6} sm={4} md={2}>
              <Paper
                variant="outlined"
                sx={{
                  p: 2,
                  borderRadius: 2,
                  height: 120,
                  width: 180,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderColor: '#ff6f00',
                  bgcolor: 'rgba(255, 111, 0, 0.04)',
                }}
              >
                <Box
                  sx={{
                    width: 36,
                    height: 36,
                    borderRadius: 1.5,
                    bgcolor: '#ff6f00',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    mb: 1,
                  }}
                >
                  <Sun size={18} color="#fff" />
                </Box>
                <Typography variant="h5" sx={{ fontWeight: 700, color: '#ff6f00' }}>
                  {stats?.totalSunglasses || 0}
                </Typography>
                <Typography variant="body2" color="text.secondary" align="center" sx={{ fontSize: '0.9rem', fontWeight: 500 }}>
                  Okulary przeciwsłoneczne
                </Typography>
              </Paper>
            </Grid>

            {/* Contact Lenses */}
            <Grid item xs={6} sm={4} md={2}>
              <Paper
                variant="outlined"
                sx={{
                  p: 2,
                  borderRadius: 2,
                  height: 120,
                  width: 180,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderColor: '#2e7d32',
                  bgcolor: 'rgba(46, 125, 50, 0.04)',
                }}
              >
                <Box
                  sx={{
                    width: 36,
                    height: 36,
                    borderRadius: 1.5,
                    bgcolor: '#2e7d32',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    mb: 1,
                  }}
                >
                  <Contact size={18} color="#fff" />
                </Box>
                <Typography variant="h5" sx={{ fontWeight: 700, color: '#2e7d32' }}>
                  {stats?.totalContactLenses || 0}
                </Typography>
                <Typography variant="body2" color="text.secondary" align="center" sx={{ fontSize: '0.9rem', fontWeight: 500 }}>
                  Soczewki kontaktowe
                </Typography>
              </Paper>
            </Grid>

            {/* Solutions */}
            <Grid item xs={6} sm={4} md={2}>
              <Paper
                variant="outlined"
                sx={{
                  p: 2,
                  borderRadius: 2,
                  height: 120,
                  width: 180,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderColor: '#ed6c02',
                  bgcolor: 'rgba(237, 108, 2, 0.04)',
                }}
              >
                <Box
                  sx={{
                    width: 36,
                    height: 36,
                    borderRadius: 1.5,
                    bgcolor: '#ed6c02',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    mb: 1,
                  }}
                >
                  <Droplet size={18} color="#fff" />
                </Box>
                <Typography variant="h5" sx={{ fontWeight: 700, color: '#ed6c02' }}>
                  {stats?.totalSolutions || 0}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.9rem', fontWeight: 500 }}>
                  Płyny
                </Typography>
              </Paper>
            </Grid>

            {/* Other Products */}
            <Grid item xs={6} sm={4} md={2}>
              <Paper
                variant="outlined"
                sx={{
                  p: 2,
                  borderRadius: 2,
                  height: 120,
                  width: 180,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderColor: '#757575',
                  bgcolor: 'rgba(117, 117, 117, 0.04)',
                }}
              >
                <Box
                  sx={{
                    width: 36,
                    height: 36,
                    borderRadius: 1.5,
                    bgcolor: '#757575',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    mb: 1,
                  }}
                >
                  <ShoppingBag size={18} color="#fff" />
                </Box>
                <Typography variant="h5" sx={{ fontWeight: 700, color: '#757575' }}>
                  {stats?.totalOther || 0}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.9rem', fontWeight: 500 }}>
                  Inne produkty
                </Typography>
              </Paper>
            </Grid>

            {/* Aging Inventory */}
            <Grid item xs={6} sm={4} md={2}>
              <Paper
                variant="outlined"
                sx={{
                  p: 2,
                  borderRadius: 2,
                  height: 120,
                  width: 180,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderColor: (stats?.inventoryAgingCount || 0) > 0 ? '#ed6c02' : '#2e7d32',
                  bgcolor: (stats?.inventoryAgingCount || 0) > 0 ? 'rgba(237, 108, 2, 0.04)' : 'rgba(46, 125, 50, 0.04)',
                }}
              >
                <Box
                  sx={{
                    width: 36,
                    height: 36,
                    borderRadius: 1.5,
                    bgcolor: (stats?.inventoryAgingCount || 0) > 0 ? '#ed6c02' : '#2e7d32',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    mb: 1,
                  }}
                >
                  <Package size={18} color="#fff" />
                </Box>
                <Typography
                  variant="h5"
                  sx={{
                    fontWeight: 700,
                    color: (stats?.inventoryAgingCount || 0) > 0 ? '#ed6c02' : '#2e7d32'
                  }}
                >
                  {stats?.inventoryAgingCount || 0}
                </Typography>
                <Typography variant="body2" color="text.secondary" align="center" sx={{ fontSize: '0.9rem', fontWeight: 500 }}>
                  Zalegający towar
                </Typography>
              </Paper>
            </Grid>
          </Grid>
        </Box>
      </Paper>
    </Box>
  );
}

export default OverviewTab;
