import { useState, useEffect, useCallback, useRef } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  FormGroup,
  FormControlLabel,
  Checkbox,
  Divider,
  CircularProgress,
  IconButton,
  Grid,
  Paper,
} from '@mui/material';
import { FileText, X, Download } from 'lucide-react';
import toast from 'react-hot-toast';
import locationService from '../../../services/locationService';
import {
  generatePdfBlob,
  downloadPdf,
  DEFAULT_SELECTED_FIELDS,
} from '../utils/salePdfGenerator';

const FIELD_GROUPS = [
  {
    label: 'Naglowek',
    fields: [{ key: 'locationData', label: 'Dane lokalizacji' }],
  },
  {
    label: 'Informacje',
    fields: [
      { key: 'saleNumber', label: 'Numer sprzedazy' },
      { key: 'dateTime', label: 'Data i godzina' },
      { key: 'salesperson', label: 'Sprzedawca' },
      { key: 'customer', label: 'Klient' },
      { key: 'notes', label: 'Notatki' },
    ],
  },
  {
    label: 'Produkty',
    fields: [
      { key: 'products', label: 'Lista produktow' },
      { key: 'productBrand', label: 'Marka', dependsOn: 'products' },
      { key: 'productQuantity', label: 'Ilosc', dependsOn: 'products' },
      { key: 'productUnitPrice', label: 'Cena jednostkowa', dependsOn: 'products' },
      { key: 'productTotal', label: 'Suma za produkt', dependsOn: 'products' },
    ],
  },
  {
    label: 'Podsumowanie',
    fields: [
      { key: 'summary', label: 'Laczna ilosc' },
      { key: 'totalAmount', label: 'Suma calkowita' },
    ],
  },
];

function SalePdfModal({ open, onClose, sale }) {
  const [selectedFields, setSelectedFields] = useState(DEFAULT_SELECTED_FIELDS);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [loading, setLoading] = useState(false);
  const [locationData, setLocationData] = useState(null);
  const [loadingLocation, setLoadingLocation] = useState(false);
  const debounceRef = useRef(null);

  // Fetch full location data when modal opens
  useEffect(() => {
    if (open && sale?.location?.id) {
      setLoadingLocation(true);
      locationService
        .getLocationById(sale.location.id)
        .then((response) => {
          setLocationData(response.data?.data || response.data);
        })
        .catch((error) => {
          console.error('Failed to fetch location:', error);
          // Fallback to sale location data
          setLocationData(sale.location);
        })
        .finally(() => {
          setLoadingLocation(false);
        });
    }
  }, [open, sale?.location?.id]);

  // Generate preview with debounce
  const generatePreview = useCallback(async () => {
    if (!sale) return;

    setLoading(true);
    try {
      const blob = await generatePdfBlob(sale, locationData || sale.location, selectedFields);
      const url = URL.createObjectURL(blob);

      // Revoke previous URL
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }

      setPreviewUrl(url);
    } catch (error) {
      console.error('PDF generation failed:', error);
      toast.error('Nie udalo sie wygenerowac podgladu PDF');
    } finally {
      setLoading(false);
    }
  }, [sale, locationData, selectedFields, previewUrl]);

  // Debounced preview regeneration
  useEffect(() => {
    if (!open || !sale || loadingLocation) return;

    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    debounceRef.current = setTimeout(() => {
      generatePreview();
    }, 300);

    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, [open, sale, selectedFields, locationData, loadingLocation]);

  // Cleanup on unmount or close
  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, []);

  const handleClose = () => {
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
      setPreviewUrl(null);
    }
    setSelectedFields(DEFAULT_SELECTED_FIELDS);
    onClose();
  };

  const handleFieldChange = (fieldKey) => {
    setSelectedFields((prev) => {
      const newFields = { ...prev, [fieldKey]: !prev[fieldKey] };

      // If disabling 'products', disable all dependent fields
      if (fieldKey === 'products' && !newFields.products) {
        newFields.productBrand = false;
        newFields.productQuantity = false;
        newFields.productUnitPrice = false;
        newFields.productTotal = false;
      }

      return newFields;
    });
  };

  const handleDownload = async () => {
    if (!sale) return;

    try {
      await downloadPdf(sale, locationData || sale.location, selectedFields);
      toast.success('PDF zostal pobrany');
    } catch (error) {
      console.error('PDF download failed:', error);
      toast.error('Nie udalo sie pobrac PDF');
    }
  };

  const handleSelectAll = () => {
    setSelectedFields(DEFAULT_SELECTED_FIELDS);
  };

  const handleDeselectAll = () => {
    const allFalse = {};
    Object.keys(DEFAULT_SELECTED_FIELDS).forEach((key) => {
      allFalse[key] = false;
    });
    setSelectedFields(allFalse);
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="lg"
      fullWidth
      aria-labelledby="pdf-modal-title"
    >
      <DialogTitle id="pdf-modal-title">
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <FileText size={24} />
            <Typography variant="h6">Generuj PDF sprzedazy</Typography>
          </Box>
          <IconButton onClick={handleClose} size="small">
            <X size={20} />
          </IconButton>
        </Box>
      </DialogTitle>

      <DialogContent dividers>
        <Grid container spacing={3}>
          {/* Left column - Field selection */}
          <Grid size={{ xs: 12, md: 4 }}>
            <Box sx={{ mb: 2, display: 'flex', gap: 1 }}>
              <Button size="small" variant="outlined" onClick={handleSelectAll}>
                Zaznacz wszystko
              </Button>
              <Button size="small" variant="outlined" onClick={handleDeselectAll}>
                Odznacz wszystko
              </Button>
            </Box>

            {FIELD_GROUPS.map((group, groupIndex) => (
              <Box key={group.label} sx={{ mb: 2 }}>
                <Typography
                  variant="subtitle2"
                  sx={{ fontWeight: 600, mb: 1, color: 'text.secondary' }}
                >
                  {group.label}
                </Typography>
                <FormGroup>
                  {group.fields.map((field) => {
                    const isDisabled =
                      field.dependsOn && !selectedFields[field.dependsOn];
                    return (
                      <FormControlLabel
                        key={field.key}
                        control={
                          <Checkbox
                            checked={selectedFields[field.key]}
                            onChange={() => handleFieldChange(field.key)}
                            disabled={isDisabled}
                            size="small"
                          />
                        }
                        label={
                          <Typography
                            variant="body2"
                            sx={{ color: isDisabled ? 'text.disabled' : 'text.primary' }}
                          >
                            {field.label}
                          </Typography>
                        }
                        sx={{ ml: field.dependsOn ? 2 : 0 }}
                      />
                    );
                  })}
                </FormGroup>
                {groupIndex < FIELD_GROUPS.length - 1 && <Divider sx={{ mt: 1 }} />}
              </Box>
            ))}
          </Grid>

          {/* Right column - PDF Preview */}
          <Grid size={{ xs: 12, md: 8 }}>
            <Paper
              variant="outlined"
              sx={{
                height: 500,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                bgcolor: 'grey.100',
                overflow: 'hidden',
              }}
            >
              {loading || loadingLocation ? (
                <Box sx={{ textAlign: 'center' }}>
                  <CircularProgress size={40} />
                  <Typography variant="body2" sx={{ mt: 2, color: 'text.secondary' }}>
                    Generowanie podgladu...
                  </Typography>
                </Box>
              ) : previewUrl ? (
                <iframe
                  src={previewUrl}
                  title="PDF Preview"
                  style={{
                    width: '100%',
                    height: '100%',
                    border: 'none',
                  }}
                />
              ) : (
                <Typography variant="body2" color="text.secondary">
                  Podglad PDF pojawi sie tutaj
                </Typography>
              )}
            </Paper>
          </Grid>
        </Grid>
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={handleClose}>Anuluj</Button>
        <Button
          variant="contained"
          color="primary"
          startIcon={<Download size={18} />}
          onClick={handleDownload}
          disabled={loading || loadingLocation}
        >
          Pobierz PDF
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default SalePdfModal;
