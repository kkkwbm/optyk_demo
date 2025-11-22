import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { Container, Paper, Box, Button, Tabs, Tab, Typography } from '@mui/material';
import { ArrowLeft } from 'lucide-react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import PageHeader from '../../../shared/components/PageHeader';
import FrameForm from '../components/FrameForm';
import ContactLensForm from '../components/ContactLensForm';
import SolutionForm from '../components/SolutionForm';
import OtherProductForm from '../components/OtherProductForm';
import { createProduct } from '../productsSlice';
import { fetchActiveBrands, selectActiveBrands } from '../../brands/brandsSlice';
import { selectCurrentLocation } from '../../locations/locationsSlice';
import { PRODUCT_TYPES, PRODUCT_TYPE_LABELS, PRODUCT_TYPE_SINGULAR } from '../../../constants';

function CreateProductPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const activeBrands = useSelector(selectActiveBrands);
  const currentLocation = useSelector(selectCurrentLocation);

  const [productType, setProductType] = useState(PRODUCT_TYPES.FRAME);
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
    },
  });

  useEffect(() => {
    dispatch(fetchActiveBrands());
  }, [dispatch]);

  useEffect(() => {
    // Reset form when product type changes
    reset();
  }, [productType, reset]);

  const handleTypeChange = (event, newType) => {
    setProductType(newType);
  };

  const onSubmit = async (data) => {
    try {
      // Clean data based on product type
      const cleanedData = { ...data };

      // Convert numeric fields
      if (cleanedData.purchasePrice) cleanedData.purchasePrice = parseFloat(cleanedData.purchasePrice);
      if (cleanedData.sellingPrice) cleanedData.sellingPrice = parseFloat(cleanedData.sellingPrice);

      // Add location ID if selected
      if (currentLocation) {
        cleanedData.locationId = currentLocation.id;
      }

      await dispatch(createProduct({ type: productType, data: cleanedData })).unwrap();
      toast.success(`${PRODUCT_TYPE_SINGULAR[productType]} został utworzony`);
      navigate('/inventory');
    } catch (error) {
      toast.error(error || 'Nie udało się utworzyć produktu');
    }
  };

  const renderForm = () => {
    const formProps = { control, brands: activeBrands };

    switch (productType) {
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

  return (
    <Container maxWidth="lg">
      <PageHeader
        title="Dodaj nowy produkt"
        subtitle="Utwórz nowy produkt w magazynie"
        breadcrumbs={[
          { label: 'Magazyn', to: '/inventory' },
          { label: 'Dodaj nowy produkt' },
        ]}
        actions={[
          {
            label: 'Wstecz',
            icon: <ArrowLeft size={20} />,
            onClick: () => navigate('/inventory'),
            variant: 'outlined',
          },
        ]}
      />

      <Paper sx={{ p: 3 }}>
        <form onSubmit={handleSubmit(onSubmit)}>
          {/* Product Type Selector */}
          <Box sx={{ mb: 4 }}>
            <Typography variant="h6" sx={{ mb: 2 }}>
              Wybierz typ produktu
            </Typography>
            <Tabs value={productType} onChange={handleTypeChange} sx={{ borderBottom: 1, borderColor: 'divider' }}>
              <Tab label={PRODUCT_TYPE_LABELS[PRODUCT_TYPES.FRAME]} value={PRODUCT_TYPES.FRAME} />
              <Tab label={PRODUCT_TYPE_LABELS[PRODUCT_TYPES.CONTACT_LENS]} value={PRODUCT_TYPES.CONTACT_LENS} />
              <Tab label={PRODUCT_TYPE_LABELS[PRODUCT_TYPES.SOLUTION]} value={PRODUCT_TYPES.SOLUTION} />
              <Tab label={PRODUCT_TYPE_LABELS[PRODUCT_TYPES.OTHER]} value={PRODUCT_TYPES.OTHER} />
            </Tabs>
          </Box>

          {/* Quantity Input */}
          <Box sx={{ mb: 4 }}>
            <Typography variant="h6" sx={{ mb: 2 }}>
              Ilość początkowa
            </Typography>
            <TextField
              type="number"
              label="Ilość"
              defaultValue={1}
              inputProps={{ min: 1 }}
              {...control.register('quantity', {
                valueAsNumber: true,
                min: { value: 1, message: 'Ilość musi być większa od 0' }
              })}
              sx={{ width: 200 }}
            />
          </Box>

          {/* Dynamic Form */}
          <Box sx={{ mb: 3 }}>{renderForm()}</Box>

          {/* Form Actions */}
          <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
            <Button variant="outlined" onClick={() => navigate('/inventory')}>
              Anuluj
            </Button>
            <Button type="submit" variant="contained">
              Utwórz {PRODUCT_TYPE_SINGULAR[productType]}
            </Button>
          </Box>
        </form>
      </Paper>
    </Container>
  );
}

export default CreateProductPage;
