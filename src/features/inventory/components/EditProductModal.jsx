import { forwardRef, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  IconButton,
  Typography,
  Slide,
  useTheme,
  alpha,
} from '@mui/material';
import { X, Save, Edit3 } from 'lucide-react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { PRODUCT_TYPES, PRODUCT_TYPE_SINGULAR } from '../../../constants';
import FrameForm from '../../products/components/FrameForm';
import ContactLensForm from '../../products/components/ContactLensForm';
import SolutionForm from '../../products/components/SolutionForm';
import OtherProductForm from '../../products/components/OtherProductForm';
import { updateProduct } from '../../products/productsSlice';
import { fetchActiveBrands, selectActiveBrands } from '../../brands/brandsSlice';
import inventoryService from '../../../services/inventoryService';
import { selectCurrentLocation } from '../../locations/locationsSlice';

const Transition = forwardRef(function Transition(props, ref) {
  return <Slide direction="up" ref={ref} {...props} />;
});

function EditProductModal({ open, onClose, product }) {
  const dispatch = useDispatch();
  const theme = useTheme();
  const activeBrands = useSelector(selectActiveBrands);
  const currentLocation = useSelector(selectCurrentLocation);

  const { control, handleSubmit, reset } = useForm({
    defaultValues: {
      brandId: '',
      model: '',
      color: '',
      size: '',
      power: '',
      lensType: '',
      name: '',
      volume: '',
      notes: '',
      purchasePrice: '',
      sellingPrice: '',
      quantity: 0,
    },
  });

  useEffect(() => {
    if (open) {
      dispatch(fetchActiveBrands());
    }
  }, [dispatch, open]);

  useEffect(() => {
    if (product) {
      reset({
        ...product,
        brandId: product.brand?.id || product.brandId || '',
        quantity: product.inventoryQuantity || 0,
      });
    }
  }, [product, reset]);

  const onSubmit = async (data) => {
    try {
      const cleanedData = { ...data };

      // Ensure numeric fields are numbers
      if (cleanedData.purchasePrice) cleanedData.purchasePrice = parseFloat(cleanedData.purchasePrice);
      if (cleanedData.sellingPrice) cleanedData.sellingPrice = parseFloat(cleanedData.sellingPrice);

      // Handle quantity change
      const newQuantity = parseInt(data.quantity, 10);
      const oldQuantity = product.inventoryQuantity || 0;
      const quantityDiff = newQuantity - oldQuantity;

      if (quantityDiff !== 0) {
        const locationId = product.location?.id || currentLocation?.id;
        if (locationId) {
          await inventoryService.adjustStock({
            productId: product.id,
            locationId: locationId,
            quantity: Math.abs(quantityDiff),
            reason: 'Manual adjustment during edit',
            type: quantityDiff > 0 ? 'ADD' : 'REMOVE'
          });
        }
      }

      // Remove nested objects that shouldn't be sent back
      delete cleanedData.brand;
      delete cleanedData.quantity; // Don't send quantity to updateProduct

      // Preserve locationId if it exists on the product but not in the form data
      if (product.locationId && !cleanedData.locationId) {
        cleanedData.locationId = product.locationId;
      }

      await dispatch(updateProduct({
        type: product.type,
        id: product.id,
        data: cleanedData
      })).unwrap();

      toast.success('Produkt został zaktualizowany');
      onClose();
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.error || 'Nie udało się zaktualizować produktu');
    }
  };

  const renderForm = () => {
    if (!product) return null;

    const currentBrandId = product.brand?.id || product.brandId;
    const isBrandInList = activeBrands.some(b => b.id === currentBrandId);

    let formBrands = activeBrands;
    if (currentBrandId && !isBrandInList && product.brand) {
      formBrands = [...activeBrands, product.brand];
    }

    const formProps = { control, brands: formBrands };

    switch (product.type) {
      case PRODUCT_TYPES.FRAME:
        return <FrameForm {...formProps} />;
      case PRODUCT_TYPES.CONTACT_LENS:
        return <ContactLensForm {...formProps} />;
      case PRODUCT_TYPES.SOLUTION:
        return <SolutionForm {...formProps} />;
      case PRODUCT_TYPES.OTHER:
        return <OtherProductForm {...formProps} />;
      default:
        return <FrameForm {...formProps} />;
    }
  };

  if (!product) return null;

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      TransitionComponent={Transition}
      PaperProps={{
        sx: {
          borderRadius: 2,
          overflow: 'hidden',
        }
      }}
    >
      <DialogTitle
        sx={{
          m: 0,
          p: 3,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          bgcolor: alpha(theme.palette.primary.main, 0.05),
          borderBottom: `1px solid ${theme.palette.divider}`
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Box
            sx={{
              bgcolor: alpha(theme.palette.primary.main, 0.1),
              p: 1,
              borderRadius: 1,
              display: 'flex',
              color: 'primary.main'
            }}
          >
            <Edit3 size={20} />
          </Box>
          <Box>
            <Typography variant="h6" component="div" sx={{ fontWeight: 600, lineHeight: 1.2 }}>
              Edytuj {PRODUCT_TYPE_SINGULAR[product.type]?.toLowerCase() || 'produkt'}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Wprowadź zmiany w formularzu poniżej
            </Typography>
          </Box>
        </Box>
        <IconButton
          aria-label="close"
          onClick={onClose}
          sx={{
            color: (theme) => theme.palette.grey[500],
            '&:hover': {
              bgcolor: alpha(theme.palette.error.main, 0.1),
              color: 'error.main'
            }
          }}
        >
          <X size={20} />
        </IconButton>
      </DialogTitle>

      <form onSubmit={handleSubmit(onSubmit)}>
        <DialogContent sx={{ p: 3 }}>
          <Box sx={{ py: 1 }}>
            {renderForm()}
          </Box>
        </DialogContent>

        <DialogActions sx={{ p: 3, pt: 2, borderTop: `1px solid ${theme.palette.divider}` }}>
          <Button
            onClick={onClose}
            variant="outlined"
            color="inherit"
            sx={{ borderRadius: 2 }}
          >
            Anuluj
          </Button>
          <Button
            type="submit"
            variant="contained"
            startIcon={<Save size={18} />}
            sx={{
              borderRadius: 2,
              px: 3,
              boxShadow: 2
            }}
          >
            Zapisz zmiany
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}

export default EditProductModal;
