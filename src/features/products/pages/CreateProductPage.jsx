import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Container, Paper, Box, Button, Tabs, Tab, Typography } from '@mui/material';
import { ArrowLeft } from 'lucide-react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import PageHeader from '../../../shared/components/PageHeader';
import FrameForm from '../components/FrameForm';
import ContactLensForm from '../components/ContactLensForm';
import SolutionForm from '../components/SolutionForm';
import OtherProductForm from '../components/OtherProductForm';
import SunglassesForm from '../components/SunglassesForm';
import { createProduct } from '../productsSlice';
import { fetchActiveBrands, selectActiveBrands } from '../../brands/brandsSlice';
import { selectCurrentLocation, selectActiveLocations } from '../../locations/locationsSlice';
import { PRODUCT_TYPES, PRODUCT_TYPE_LABELS, PRODUCT_TYPE_SINGULAR } from '../../../constants';
import { cleanProductData } from '../utils/productDataCleaner';

function CreateProductPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const activeBrands = useSelector(selectActiveBrands);
  const currentLocation = useSelector(selectCurrentLocation);
  const activeLocations = useSelector(selectActiveLocations);

  // Get product type from URL parameter or default to FRAME
  const typeFromUrl = searchParams.get('type');
  const initialType = typeFromUrl && Object.values(PRODUCT_TYPES).includes(typeFromUrl)
    ? typeFromUrl
    : PRODUCT_TYPES.FRAME;

  const [productType, setProductType] = useState(initialType);
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
      quantity: 1,
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
      // Clean data based on product type (removes irrelevant fields)
      let cleanedData = cleanProductData(data, productType);

      // Convert numeric fields
      if (cleanedData.purchasePrice) cleanedData.purchasePrice = parseFloat(cleanedData.purchasePrice);
      if (cleanedData.sellingPrice) cleanedData.sellingPrice = parseFloat(cleanedData.sellingPrice);

      // Track if this is a bulk operation and the target locations
      let isBulkOperation = false;
      let targetLocationType = null;

      // Handle location selection
      if (currentLocation) {
        if (currentLocation.id === 'ALL_STORES') {
          // Add to all stores
          cleanedData.addToAllOfType = 'STORE';
          isBulkOperation = true;
          targetLocationType = 'STORE';
        } else if (currentLocation.id === 'ALL_WAREHOUSES') {
          // Add to all warehouses
          cleanedData.addToAllOfType = 'WAREHOUSE';
          isBulkOperation = true;
          targetLocationType = 'WAREHOUSE';
        } else {
          // Add to specific location
          cleanedData.locationId = currentLocation.id;
        }
      }

      await dispatch(createProduct({ type: productType, data: cleanedData })).unwrap();

      // Generate detailed success message
      let successMessage = '';
      if (isBulkOperation) {
        // Filter locations by type
        const targetLocations = activeLocations.filter(loc => loc.type === targetLocationType);
        const locationNames = targetLocations.map(loc => loc.name).join(', ');
        const locationType = targetLocationType === 'STORE' ? 'salonach' : 'magazynach';

        successMessage = `${PRODUCT_TYPE_SINGULAR[productType]} został dodany do ${targetLocations.length} ${locationType}: ${locationNames}`;
      } else if (currentLocation) {
        successMessage = `${PRODUCT_TYPE_SINGULAR[productType]} został utworzony w lokalizacji: ${currentLocation.name}`;
      } else {
        successMessage = `${PRODUCT_TYPE_SINGULAR[productType]} został utworzony`;
      }

      toast.success(successMessage);
      navigate('/inventory', { state: { refresh: true } });
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
      case PRODUCT_TYPES.SUNGLASSES:
        return <SunglassesForm {...formProps} />;
      default:
        return <FrameForm {...formProps} />;
    }
  };

  return (
    <Container maxWidth="lg">
      <PageHeader
        title={currentLocation ? `Dodaj nowy produkt - ${currentLocation.name}` : "Dodaj nowy produkt"}
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
              <Tab label={PRODUCT_TYPE_LABELS[PRODUCT_TYPES.SUNGLASSES]} value={PRODUCT_TYPES.SUNGLASSES} />
              <Tab label={PRODUCT_TYPE_LABELS[PRODUCT_TYPES.CONTACT_LENS]} value={PRODUCT_TYPES.CONTACT_LENS} />
              <Tab label={PRODUCT_TYPE_LABELS[PRODUCT_TYPES.SOLUTION]} value={PRODUCT_TYPES.SOLUTION} />
              <Tab label={PRODUCT_TYPE_LABELS[PRODUCT_TYPES.OTHER]} value={PRODUCT_TYPES.OTHER} />
            </Tabs>
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
