import { useEffect, useState, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Box,
  IconButton,
  Menu,
  MenuItem,
  Tabs,
  Tab,
  TextField,
} from '@mui/material';
import { Plus, MoreVertical, Edit } from 'lucide-react';
import toast from 'react-hot-toast';
import PageHeader from '../../../shared/components/PageHeader';
import DataTable from '../../../shared/components/DataTable';
import StatusBadge from '../../../shared/components/StatusBadge';
import ConfirmDialog from '../../../shared/components/ConfirmDialog';
import {
  fetchProducts,
  deleteProduct,
  restoreProduct,
  selectProducts,
  selectProductsLoading,
  selectProductsPagination,
  selectCurrentType,
  setCurrentType,
} from '../../products/productsSlice';
import {
  fetchInventory,
  selectInventoryItems,
  selectInventoryLoading,
  selectInventoryPagination,
  clearInventory,
} from '../../inventory/inventorySlice';
import { selectCurrentLocation } from '../../locations/locationsSlice';
import EditProductModal from '../components/EditProductModal';
import { PRODUCT_TYPES, PRODUCT_TYPE_LABELS, PRODUCT_STATUS } from '../../../constants';

function InventoryDashboardPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  // Global State
  const currentLocation = useSelector(selectCurrentLocation);
  const currentType = useSelector(selectCurrentType);

  // Products State (Global view)
  const products = useSelector(selectProducts);
  const productsLoading = useSelector(selectProductsLoading);
  const productsPagination = useSelector(selectProductsPagination);

  // Inventory State (Location view)
  const inventoryItems = useSelector(selectInventoryItems);
  const inventoryLoading = useSelector(selectInventoryLoading);
  const inventoryPagination = useSelector(selectInventoryPagination);

  // Local State
  const [confirmDialog, setConfirmDialog] = useState({ open: false, product: null, action: null });
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  // Derived State
  const isLocationView = !!currentLocation;
  const loading = inventoryLoading;
  const pagination = inventoryPagination;

  // Normalize data for the table
  const tableData = useMemo(() => {
    // Always map inventory items to product structure, preserving inventory details
    return inventoryItems
      .filter(item => item.productType === currentType) // Filter by productType first
      .map(item => ({
        ...item.product, // Spread the full product object
        inventoryQuantity: item.quantity,
        inventoryId: item.id,
        // Ensure we have necessary fields
        id: item.product?.id || item.productId,
        type: item.product?.type || item.productType, // Add type field for consistency
        location: item.location, // Add location for display
      }));
  }, [inventoryItems, currentType]);

  useEffect(() => {
    const params = {
      page: pagination.page,
      size: pagination.size,
      search: searchTerm || undefined,
      type: currentType, // Pass type to API
    };

    // Handle "All Stores" special case
    if (currentLocation?.id === 'ALL_STORES') {
      dispatch(fetchInventory({
        locationId: null,
        params: {
          ...params,
          locationType: 'STORE',
          productType: currentType,
        }
      }));
    } else {
      dispatch(fetchInventory({
        locationId: currentLocation?.id || null,
        params: {
          ...params,
          productType: currentType,
        }
      }));
    }
  }, [dispatch, currentType, pagination.page, pagination.size, currentLocation, isLocationView, searchTerm]);

  const handleTabChange = (event, newType) => {
    dispatch(setCurrentType(newType));
    // Reset page when changing tabs
    // Reset page when changing tabs
    // For now, the useEffect will trigger a fetch with new type and current page
    // Ideally we should reset page to 0 here
  };

  const handleMenuOpen = (event, product) => {
    event.stopPropagation(); // Prevent row click event
    setAnchorEl(event.currentTarget);
    setSelectedProduct(product);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedProduct(null);
  };

  const handleOpenConfirm = (product, action) => {
    setConfirmDialog({ open: true, product, action });
  };

  const handleCloseConfirm = () => {
    setConfirmDialog({ open: false, product: null, action: null });
  };

  const handleConfirmAction = async () => {
    const { product, action } = confirmDialog;
    try {
      if (action === 'delete') {
        await dispatch(deleteProduct({ type: currentType, id: product.id })).unwrap();
        toast.success('Produkt został usunięty');
      } else if (action === 'restore') {
        await dispatch(restoreProduct({ type: currentType, id: product.id })).unwrap();
        toast.success('Produkt został przywrócony');
      }

      // Refresh data
      // Refresh data
      dispatch(fetchInventory({
        locationId: currentLocation?.id || null,
        params: {
          page: pagination.page,
          size: pagination.size,
          productType: currentType,
          search: searchTerm || undefined
        }
      }));
    } catch (error) {
      toast.error(error || `Nie udało się ${action} produktu`);
    }
    handleCloseConfirm();
  };

  const handlePageChange = (newPage) => {
    // Dispatch handled by useEffect dependency on pagination.page? 
    // No, useEffect depends on pagination.page which comes from store.
    // We need to dispatch an action to update the page in the store OR directly fetch.
    // The previous implementation dispatched fetchProducts which updated the store.
    // We should stick to that pattern.

    const params = {
      page: newPage,
      size: pagination.size,
      search: searchTerm || undefined,
      productType: currentType,
    };

    dispatch(fetchInventory({ locationId: currentLocation?.id || null, params }));
  };

  const handleRowsPerPageChange = (newSize) => {
    const params = {
      page: 0,
      size: newSize,
      search: searchTerm || undefined,
      productType: currentType,
    };

    dispatch(fetchInventory({ locationId: currentLocation?.id || null, params }));
  };

  const handleSearch = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    // Debouncing should be handled here or in useEffect, but for now we keep it simple
    // The useEffect will trigger fetch when searchTerm changes
  };

  const handleViewProduct = (product) => {
    navigate(`/inventory/${product.id}`);
  };

  const handleEditProduct = (product) => {
    setEditingProduct(product);
    setEditModalOpen(true);
  };

  const handleCloseEditModal = () => {
    setEditModalOpen(false);
    setEditingProduct(null);
    // Refresh list
    // Refresh list
    dispatch(fetchInventory({
      locationId: currentLocation?.id || null,
      params: {
        page: pagination.page,
        size: pagination.size,
        productType: currentType,
        search: searchTerm || undefined
      }
    }));
  };

  // Define columns based on product type
  const getColumns = () => {
    const baseColumns = [
      {
        id: 'brand',
        label: 'Marka',
        sortable: true,
        render: (value) => value?.name || '-',
      },
    ];

    const typeSpecificColumns = {
      [PRODUCT_TYPES.FRAME]: [
        { id: 'model', label: 'Model', sortable: true },
        { id: 'color', label: 'Kolor', sortable: true },
        { id: 'size', label: 'Rozmiar', sortable: true },
        {
          id: 'sellingPrice',
          label: 'Cena sprzedaży',
          sortable: true,
          render: (value) => value ? `${value.toFixed(2)} zł` : '-',
        },
      ],
      [PRODUCT_TYPES.CONTACT_LENS]: [
        { id: 'model', label: 'Model', sortable: true },
        { id: 'power', label: 'Moc', sortable: true },
        { id: 'lensType', label: 'Typ', sortable: true },
        {
          id: 'sellingPrice',
          label: 'Cena sprzedaży',
          sortable: true,
          render: (value) => value ? `${value.toFixed(2)} zł` : '-',
        },
      ],
      [PRODUCT_TYPES.SOLUTION]: [
        { id: 'name', label: 'Nazwa', sortable: true },
        { id: 'volume', label: 'Pojemność', sortable: true },
        {
          id: 'sellingPrice',
          label: 'Cena sprzedaży',
          sortable: true,
          render: (value) => value ? `${value.toFixed(2)} zł` : '-',
        },
      ],
      [PRODUCT_TYPES.OTHER]: [
        { id: 'name', label: 'Nazwa', sortable: true },
        { id: 'description', label: 'Opis', sortable: false },
        {
          id: 'sellingPrice',
          label: 'Cena sprzedaży',
          sortable: true,
          render: (value) => value ? `${value.toFixed(2)} zł` : '-',
        },
      ],
    };

    // Add Quantity column if in location view, or Location column if in global view
    const extraColumns = isLocationView ? [{
      id: 'inventoryQuantity',
      label: 'Ilość',
      sortable: true,
      render: (value) => value !== undefined ? value : '-',
    }] : [{
      id: 'location',
      label: 'Lokalizacja',
      sortable: true,
      render: (value) => value?.name || '-',
    }, {
      id: 'inventoryQuantity',
      label: 'Ilość',
      sortable: true,
      render: (value) => value !== undefined ? value : '-',
    }];

    return [
      ...baseColumns,
      ...(typeSpecificColumns[currentType] || []),
      ...extraColumns,
      {
        id: 'actions',
        label: 'Akcje',
        sortable: false,
        align: 'right',
        render: (value, row) => (
          <IconButton size="small" onClick={(e) => handleMenuOpen(e, row)}>
            <MoreVertical size={20} />
          </IconButton>
        ),
      },
    ];
  };

  const getPageTitle = () => {
    if (!currentLocation) return "Wszystkie produkty";
    if (currentLocation.id === 'ALL_STORES') return "Wszystkie salony";
    return `Magazyn - ${currentLocation.name}`;
  };

  const getPageSubtitle = () => {
    if (!currentLocation) return "Przeglądaj produkty ze wszystkich lokalizacji";
    if (currentLocation.id === 'ALL_STORES') return "Przeglądaj produkty ze wszystkich salonów";
    return `Zarządzaj produktami w: ${currentLocation.name}`;
  };

  return (
    <Container maxWidth="xl">
      <PageHeader
        title={getPageTitle()}
        subtitle={getPageSubtitle()}
        breadcrumbs={[
          { label: 'Magazyn' },
        ]}
        actions={[
          {
            label: 'Dodaj produkt',
            icon: <Plus size={20} />,
            onClick: () => navigate('/inventory/create'),
          },
        ]}
      />

      {/* Product Type Tabs */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs value={currentType} onChange={handleTabChange}>
          <Tab label={PRODUCT_TYPE_LABELS[PRODUCT_TYPES.FRAME]} value={PRODUCT_TYPES.FRAME} />
          <Tab label={PRODUCT_TYPE_LABELS[PRODUCT_TYPES.CONTACT_LENS]} value={PRODUCT_TYPES.CONTACT_LENS} />
          <Tab label={PRODUCT_TYPE_LABELS[PRODUCT_TYPES.SOLUTION]} value={PRODUCT_TYPES.SOLUTION} />
          <Tab label={PRODUCT_TYPE_LABELS[PRODUCT_TYPES.OTHER]} value={PRODUCT_TYPES.OTHER} />
        </Tabs>
      </Box>

      {/* Search */}
      <Box sx={{ mb: 2 }}>
        <TextField
          placeholder={`Szukaj ${PRODUCT_TYPE_LABELS[currentType].toLowerCase()}...`}
          value={searchTerm}
          onChange={handleSearch}
          size="small"
          sx={{ width: 300 }}
        />
      </Box>

      {/* Data Table */}
      <DataTable
        columns={getColumns()}
        data={tableData}
        pagination={pagination}
        onPageChange={handlePageChange}
        onRowsPerPageChange={handleRowsPerPageChange}
        loading={loading}
        emptyMessage={`Nie znaleziono ${PRODUCT_TYPE_LABELS[currentType].toLowerCase()}${currentLocation ? ` w lokalizacji ${currentLocation.name}` : ''}`}
        onRowClick={handleViewProduct}
      />

      {/* Actions Menu */}
      <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleMenuClose}>
        {selectedProduct?.status !== PRODUCT_STATUS.DELETED ? [
          <MenuItem
            key="edit"
            onClick={() => {
              handleEditProduct(selectedProduct);
              handleMenuClose();
            }}
          >
            <Edit size={16} style={{ marginRight: 8 }} />
            Edytuj
          </MenuItem>,
          <MenuItem
            key="delete"
            onClick={() => {
              handleOpenConfirm(selectedProduct, 'delete');
              handleMenuClose();
            }}
          >
            Usuń
          </MenuItem>
        ] : (
          <MenuItem
            onClick={() => {
              handleOpenConfirm(selectedProduct, 'restore');
              handleMenuClose();
            }}
          >
            Przywróć
          </MenuItem>
        )}
      </Menu>

      {/* Confirm Dialog */}
      <ConfirmDialog
        open={confirmDialog.open}
        onClose={handleCloseConfirm}
        onConfirm={handleConfirmAction}
        title={confirmDialog.action === 'delete' ? 'Usuń produkt' : 'Przywróć produkt'}
        message={
          confirmDialog.action === 'delete'
            ? (
              <>
                Czy na pewno chcesz usunąć ten produkt?
                <br />
                <strong>UWAGA: Produkt zostanie usunięty ze WSZYSTKICH lokalizacji.</strong>
              </>
            )
            : `Czy na pewno chcesz przywrócić ten produkt?`
        }
        confirmText={confirmDialog.action === 'delete' ? 'Usuń wszędzie' : 'Przywróć'}
        confirmColor={confirmDialog.action === 'delete' ? 'error' : 'primary'}
      />

      {/* Edit Product Modal */}
      <EditProductModal
        open={editModalOpen}
        onClose={handleCloseEditModal}
        product={editingProduct}
      />
    </Container>
  );
}

export default InventoryDashboardPage;
