import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Box,
  Card,
  CardContent,
  Grid,
  Typography,
  CircularProgress,
  Paper,
  Divider,
  Button,
  Collapse,
} from '@mui/material';
import {
  Package,
  Glasses,
  Contact,
  Droplet,
  ShoppingBag,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import {
  fetchInventorySummary,
  selectInventorySummary,
  selectInventoryLoading,
} from '../inventorySlice';
import { selectCurrentLocation } from '../../locations/locationsSlice';

function SummaryTab() {
  const dispatch = useDispatch();
  const summary = useSelector(selectInventorySummary);
  const loading = useSelector(selectInventoryLoading);
  const currentLocation = useSelector(selectCurrentLocation);

  // State for expanding brand lists
  const [showAllFrames, setShowAllFrames] = useState(false);
  const [showAllLensesBrand, setShowAllLensesBrand] = useState(false);
  const [showAllLensesType, setShowAllLensesType] = useState(false);

  // Limit for initial display
  const INITIAL_DISPLAY_LIMIT = 15;

  useEffect(() => {
    const params = {};

    // Handle location filtering
    if (currentLocation?.id === 'ALL_STORES') {
      params.locationType = 'STORE';
    } else if (currentLocation?.id === 'ALL_WAREHOUSES') {
      params.locationType = 'WAREHOUSE';
    } else if (currentLocation?.id) {
      params.locationId = currentLocation.id;
    }

    dispatch(fetchInventorySummary(params));
  }, [dispatch, currentLocation]);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!summary) {
    return (
      <Box sx={{ py: 8, textAlign: 'center' }}>
        <Typography color="text.secondary">
          Brak danych podsumowania
        </Typography>
      </Box>
    );
  }

  // Map colors for icon backgrounds to match DashboardPage style
  const getCardStyles = (colorHex) => {
    // Basic mapping based on the hex colors currently used
    switch (colorHex) {
      case '#1976d2': return { bgcolor: 'primary.main', iconColor: '#fff' };
      case '#9c27b0': return { bgcolor: 'secondary.main', iconColor: '#fff' };
      case '#2e7d32': return { bgcolor: 'success.main', iconColor: '#fff' };
      case '#ed6c02': return { bgcolor: 'warning.main', iconColor: '#fff' };
      case '#d32f2f': return { bgcolor: 'error.main', iconColor: '#fff' };
      default: return { bgcolor: 'primary.main', iconColor: '#fff' };
    }
  };

  const summaryCards = [
    {
      title: 'Wszystkie produkty',
      value: summary.totalProducts || 0,
      icon: <Package size={24} color="#fff" />,
      color: '#1976d2',
    },
    {
      title: 'Oprawki',
      value: summary.totalFrames || 0,
      icon: <Glasses size={24} color="#fff" />,
      color: '#9c27b0',
    },
    {
      title: 'Soczewki kontaktowe',
      value: summary.totalContactLenses || 0,
      icon: <Contact size={24} color="#fff" />,
      color: '#2e7d32',
    },
    {
      title: 'Płyny',
      value: summary.totalSolutions || 0,
      icon: <Droplet size={24} color="#fff" />,
      color: '#ed6c02',
    },
    {
      title: 'Inne produkty',
      value: summary.totalOther || 0,
      icon: <ShoppingBag size={24} color="#fff" />,
      color: '#d32f2f',
    },
  ];

  return (
    <Box>
      {/* Summary Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {summaryCards.map((card, index) => {
          const styles = getCardStyles(card.color);
          return (
            <Grid item xs={12} sm={6} md={4} lg={2.4} key={index} sx={{ display: 'flex' }}>
              <Card sx={{ height: '100%', width: '100%', display: 'flex', flexDirection: 'column', minWidth: 160 }}>
                <CardContent sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                    <Box
                      sx={{
                        width: 48,
                        height: 48,
                        borderRadius: 2,
                        bgcolor: styles.bgcolor,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      {card.icon}
                    </Box>
                  </Box>
                  <Typography variant="h4" sx={{ fontWeight: 600, mb: 0.5 }}>
                    {card.value}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 'auto' }}>
                    {card.title}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          );
        })}
      </Grid>

      {/* Frames by Brand */}
      {summary.framesByBrand && summary.framesByBrand.length > 0 && (
        <Paper sx={{ p: 3, mb: 3 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              Oprawki według marki
            </Typography>
            {summary.framesByBrand.length > INITIAL_DISPLAY_LIMIT && (
              <Button
                size="small"
                onClick={() => setShowAllFrames(!showAllFrames)}
                endIcon={showAllFrames ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                sx={{ textTransform: 'none' }}
              >
                {showAllFrames ? 'Pokaż mniej' : `Pokaż wszystkie (${summary.framesByBrand.length})`}
              </Button>
            )}
          </Box>
          <Grid container spacing={1.5}>
            {(showAllFrames ? summary.framesByBrand : summary.framesByBrand.slice(0, INITIAL_DISPLAY_LIMIT)).map((brand, index) => (
              <Grid item xs={6} sm={4} md={3} lg={2} key={index} sx={{ display: 'flex' }}>
                <Box
                  sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    p: 1.5,
                    backgroundColor: 'background.default',
                    borderRadius: 1.5,
                    border: '1px solid',
                    borderColor: 'divider',
                    transition: 'all 0.2s',
                    width: '100%',
                    minHeight: 48,
                    '&:hover': {
                      backgroundColor: 'action.hover',
                      borderColor: 'primary.main',
                      transform: 'translateY(-2px)',
                      boxShadow: 1,
                    },
                  }}
                >
                  <Typography
                    variant="body2"
                    sx={{
                      fontWeight: 500,
                      color: 'text.primary',
                      flex: 1,
                      mr: 1.5,
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {brand.brandName}
                  </Typography>
                  <Box
                    sx={{
                      backgroundColor: 'primary.main',
                      color: 'primary.contrastText',
                      borderRadius: 1,
                      px: 1.5,
                      py: 0.25,
                      minWidth: 32,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <Typography
                      variant="body2"
                      sx={{
                        fontWeight: 'bold',
                        fontSize: '0.875rem',
                      }}
                    >
                      {brand.count}
                    </Typography>
                  </Box>
                </Box>
              </Grid>
            ))}
          </Grid>
        </Paper>
      )}

      {/* Empty state for frames */}
      {(!summary.framesByBrand || summary.framesByBrand.length === 0) && (
        <Paper sx={{ p: 4, textAlign: 'center', backgroundColor: 'background.default', mb: 3 }}>
          <Typography variant="body1" color="text.secondary">
            Brak oprawek w magazynie
          </Typography>
        </Paper>
      )}

      {/* Contact Lenses by Brand */}
      {summary.contactLensesByBrand && summary.contactLensesByBrand.length > 0 && (
        <Paper sx={{ p: 3, mb: 3 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              Soczewki kontaktowe według marki
            </Typography>
            {summary.contactLensesByBrand.length > INITIAL_DISPLAY_LIMIT && (
              <Button
                size="small"
                onClick={() => setShowAllLensesBrand(!showAllLensesBrand)}
                endIcon={showAllLensesBrand ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                sx={{ textTransform: 'none' }}
              >
                {showAllLensesBrand ? 'Pokaż mniej' : `Pokaż wszystkie (${summary.contactLensesByBrand.length})`}
              </Button>
            )}
          </Box>
          <Grid container spacing={1.5}>
            {(showAllLensesBrand ? summary.contactLensesByBrand : summary.contactLensesByBrand.slice(0, INITIAL_DISPLAY_LIMIT)).map((brand, index) => (
              <Grid item xs={6} sm={4} md={3} lg={2} key={index} sx={{ display: 'flex' }}>
                <Box
                  sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    p: 1.5,
                    backgroundColor: 'background.default',
                    borderRadius: 1.5,
                    border: '1px solid',
                    borderColor: 'divider',
                    transition: 'all 0.2s',
                    width: '100%',
                    minHeight: 48,
                    '&:hover': {
                      backgroundColor: 'action.hover',
                      borderColor: 'success.main',
                      transform: 'translateY(-2px)',
                      boxShadow: 1,
                    },
                  }}
                >
                  <Typography
                    variant="body2"
                    sx={{
                      fontWeight: 500,
                      color: 'text.primary',
                      flex: 1,
                      mr: 1.5,
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {brand.brandName}
                  </Typography>
                  <Box
                    sx={{
                      backgroundColor: 'success.main',
                      color: 'success.contrastText',
                      borderRadius: 1,
                      px: 1.5,
                      py: 0.25,
                      minWidth: 32,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <Typography
                      variant="body2"
                      sx={{
                        fontWeight: 'bold',
                        fontSize: '0.875rem',
                      }}
                    >
                      {brand.count}
                    </Typography>
                  </Box>
                </Box>
              </Grid>
            ))}
          </Grid>
        </Paper>
      )}

      {/* Contact Lenses by Type */}
      {summary.contactLensesByType && summary.contactLensesByType.length > 0 && (
        <Paper sx={{ p: 3 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              Soczewki kontaktowe według typu
            </Typography>
            {summary.contactLensesByType.length > INITIAL_DISPLAY_LIMIT && (
              <Button
                size="small"
                onClick={() => setShowAllLensesType(!showAllLensesType)}
                endIcon={showAllLensesType ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                sx={{ textTransform: 'none' }}
              >
                {showAllLensesType ? 'Pokaż mniej' : `Pokaż wszystkie (${summary.contactLensesByType.length})`}
              </Button>
            )}
          </Box>
          <Grid container spacing={1.5}>
            {(showAllLensesType ? summary.contactLensesByType : summary.contactLensesByType.slice(0, INITIAL_DISPLAY_LIMIT)).map((type, index) => {
              const lensTypeLabels = {
                'DAILY': 'Jednodniowe',
                'BI_WEEKLY': 'Dwutygodniowe',
                'MONTHLY': 'Miesięczne',
              };
              return (
                <Grid item xs={6} sm={4} md={3} lg={2} key={index} sx={{ display: 'flex' }}>
                  <Box
                    sx={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      p: 1.5,
                      backgroundColor: 'background.default',
                      borderRadius: 1.5,
                      border: '1px solid',
                      borderColor: 'divider',
                      transition: 'all 0.2s',
                      width: '100%',
                      minHeight: 48,
                      '&:hover': {
                        backgroundColor: 'action.hover',
                        borderColor: 'success.main',
                        transform: 'translateY(-2px)',
                        boxShadow: 1,
                      },
                    }}
                  >
                    <Typography
                      variant="body2"
                      sx={{
                        fontWeight: 500,
                        color: 'text.primary',
                        flex: 1,
                        mr: 1.5,
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {lensTypeLabels[type.lensType] || type.lensType}
                    </Typography>
                    <Box
                      sx={{
                        backgroundColor: 'success.main',
                        color: 'success.contrastText',
                        borderRadius: 1,
                        px: 1.5,
                        py: 0.25,
                        minWidth: 32,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <Typography
                        variant="body2"
                        sx={{
                          fontWeight: 'bold',
                          fontSize: '0.875rem',
                        }}
                      >
                        {type.count}
                      </Typography>
                    </Box>
                  </Box>
                </Grid>
              );
            })}
          </Grid>
        </Paper>
      )}

      {/* Empty state for contact lenses */}
      {(!summary.contactLensesByBrand || summary.contactLensesByBrand.length === 0) &&
        (!summary.contactLensesByType || summary.contactLensesByType.length === 0) && (
          <Paper sx={{ p: 4, textAlign: 'center', backgroundColor: 'background.default' }}>
            <Typography variant="body1" color="text.secondary">
              Brak soczewek kontaktowych w magazynie
            </Typography>
          </Paper>
        )}
    </Box>
  );
}

export default SummaryTab;
