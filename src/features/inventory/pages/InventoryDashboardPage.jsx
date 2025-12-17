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
  Paper,
  Typography,
} from '@mui/material';
import { Plus, MoreVertical, Edit } from 'lucide-react';
import toast from 'react-hot-toast';
import PageHeader from '../../../shared/components/PageHeader';
import DataTable from '../../../shared/components/DataTable';
import StatusBadge from '../../../shared/components/StatusBadge';
import ConfirmDialog from '../../../shared/components/ConfirmDialog';
import { useDebounce } from '../../../hooks/useDebounce';
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
import { selectUser } from '../../auth/authSlice';
import EditProductModal from '../components/EditProductModal';
import SummaryTab from '../components/SummaryTab';
import { PRODUCT_TYPES, PRODUCT_TYPE_LABELS, PRODUCT_STATUS, PERMISSIONS, USER_ROLES } from '../../../constants';

function InventoryDashboardPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  // Global State
  const currentLocation = useSelector(selectCurrentLocation);
  const currentType = useSelector(selectCurrentType);
  const currentUser = useSelector(selectUser);

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
  const debouncedSearchTerm = useDebounce(searchTerm, 300);

  // Derived State
  const isLocationView = !!currentLocation && currentLocation.id !== 'ALL_STORES' && currentLocation.id !== 'ALL_WAREHOUSES';
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
        id: item.product?.id || item.productId, // Use product ID as the primary ID for editing
        productId: item.product?.id || item.productId, // Keep product ID separately for backwards compatibility
        type: item.product?.type || item.productType, // Add type field for consistency
        location: item.location, // Add location for display
      }));
  }, [inventoryItems, currentType]);

  useEffect(() => {
    // Skip fetching inventory for Summary tab
    if (currentType === 'SUMMARY') {
      return;
    }

    const params = {
      page: 0,
      size: pagination.size,
      productType: currentType,
    };

    // Only add search if it has a value
    if (debouncedSearchTerm && debouncedSearchTerm.trim()) {
      params.search = debouncedSearchTerm.trim();
    }

    // Handle "All Stores" and "All Warehouses" special cases
    if (currentLocation?.id === 'ALL_STORES') {
      dispatch(fetchInventory({
        locationId: null,
        params: {
          ...params,
          locationType: 'STORE',
        }
      }));
    } else if (currentLocation?.id === 'ALL_WAREHOUSES') {
      dispatch(fetchInventory({
        locationId: null,
        params: {
          ...params,
          locationType: 'WAREHOUSE',
        }
      }));
    } else {
      dispatch(fetchInventory({
        locationId: currentLocation?.id || null,
        params
      }));
    }
  }, [dispatch, currentType, pagination.size, currentLocation, isLocationView, debouncedSearchTerm]);

  const hasPermission = (permission) => {
    return PERMISSIONS[permission]?.includes(currentUser?.role);
  };

  // Check if user can view warehouse/inventory:
  // 1. ADMIN/OWNER can view all inventory
  // 2. EMPLOYEE can view inventory if they have WAREHOUSE tab access for the current location
  const canViewWarehouse = useMemo(() => {
    // ADMIN and OWNER have full access
    if (currentUser?.role === USER_ROLES.ADMIN || currentUser?.role === USER_ROLES.OWNER) {
      return true;
    }

    // EMPLOYEE: check permissions based on current location
    if (currentUser?.userLocations && currentUser.userLocations.length > 0) {
      // If "All Stores" is selected, check if user has WAREHOUSE access in at least one location
      if (!currentLocation || currentLocation.id === 'ALL_STORES') {
        return currentUser.userLocations.some(
          (userLocation) =>
            // Empty/null allowedTabs means full access to all tabs
            !userLocation.allowedTabs ||
            userLocation.allowedTabs.length === 0 ||
            userLocation.allowedTabs.includes('WAREHOUSE')
        );
      }

      // If specific location is selected, check if user has WAREHOUSE access for THAT location
      return currentUser.userLocations.some(
        (userLocation) =>
          userLocation.location.id === currentLocation.id &&
          // Empty/null allowedTabs means full access to all tabs
          (!userLocation.allowedTabs ||
            userLocation.allowedTabs.length === 0 ||
            userLocation.allowedTabs.includes('WAREHOUSE'))
      );
    }

    return false;
  }, [currentUser, currentLocation]);

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
    const { product, action} = confirmDialog;
    try {
      // Determine the product type
      // For inventory items: use productType field
      // For nested product objects: use the product field's type or current tab type as fallback
      let actualProductType = product.productType || product.product?.productType || currentType;

      // Handle backend's OTHER_PRODUCT vs frontend's OTHER mapping
      if (actualProductType === 'OTHER_PRODUCT') {
        actualProductType = 'OTHER';
      }

      // Get the correct product ID (inventory items have productId, products have id)
      const productId = product.productId || product.id;

      if (action === 'delete') {
        await dispatch(deleteProduct({ type: actualProductType, id: productId })).unwrap();
        toast.success('Produkt został usunięty');
      } else if (action === 'restore') {
        await dispatch(restoreProduct({ type: actualProductType, id: productId })).unwrap();
        toast.success('Produkt został przywrócony');
      }

      // Refresh data
      const refreshParams = {
        page: 0,
        size: pagination.size,
        productType: currentType,
      };
      if (debouncedSearchTerm && debouncedSearchTerm.trim()) {
        refreshParams.search = debouncedSearchTerm.trim();
      }
      dispatch(fetchInventory({
        locationId: currentLocation?.id || null,
        params: refreshParams
      }));
    } catch (error) {
      toast.error(error || `Nie udało się ${action} produktu`);
    }
    handleCloseConfirm();
  };

  const handlePageChange = (newPage) => {
    const params = {
      page: newPage,
      size: pagination.size,
      productType: currentType,
    };

    if (debouncedSearchTerm && debouncedSearchTerm.trim()) {
      params.search = debouncedSearchTerm.trim();
    }

    if (currentLocation?.id === 'ALL_STORES') {
      dispatch(fetchInventory({
        locationId: null,
        params: {
          ...params,
          locationType: 'STORE',
        }
      }));
    } else if (currentLocation?.id === 'ALL_WAREHOUSES') {
      dispatch(fetchInventory({
        locationId: null,
        params: {
          ...params,
          locationType: 'WAREHOUSE',
        }
      }));
    } else {
      dispatch(fetchInventory({ locationId: currentLocation?.id || null, params }));
    }
  };

  const handleRowsPerPageChange = (newSize) => {
    const params = {
      page: 0,
      size: newSize,
      productType: currentType,
    };

    if (debouncedSearchTerm && debouncedSearchTerm.trim()) {
      params.search = debouncedSearchTerm.trim();
    }

    if (currentLocation?.id === 'ALL_STORES') {
      dispatch(fetchInventory({
        locationId: null,
        params: {
          ...params,
          locationType: 'STORE',
        }
      }));
    } else if (currentLocation?.id === 'ALL_WAREHOUSES') {
      dispatch(fetchInventory({
        locationId: null,
        params: {
          ...params,
          locationType: 'WAREHOUSE',
        }
      }));
    } else {
      dispatch(fetchInventory({ locationId: currentLocation?.id || null, params }));
    }
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
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
    const refreshParams = {
      page: 0,
      size: pagination.size,
      productType: currentType,
    };
    if (debouncedSearchTerm && debouncedSearchTerm.trim()) {
      refreshParams.search = debouncedSearchTerm.trim();
    }
    dispatch(fetchInventory({
      locationId: currentLocation?.id || null,
      params: refreshParams
    }));
  };

  // Define columns based on product type
  const getColumns = () => {
    // Only show brand column for products that have brands (not OTHER)
    const baseColumns = currentType !== PRODUCT_TYPES.OTHER ? [
      {
        id: 'brand',
        label: 'Marka',
        sortable: true,
        render: (row) => row.brand?.name || '-',
      },
    ] : [];

    const typeSpecificColumns = {
      [PRODUCT_TYPES.FRAME]: [
        { id: 'model', label: 'Model', sortable: true },
        { id: 'color', label: 'Kolor', sortable: true },
        { id: 'size', label: 'Rozmiar', sortable: true },
        {
          id: 'sellingPrice',
          label: 'Cena sprzedaży',
          sortable: true,
          render: (row) => row.sellingPrice ? `${row.sellingPrice.toFixed(2)} zł` : '-',
        },
      ],
      [PRODUCT_TYPES.CONTACT_LENS]: [
        { id: 'model', label: 'Model', sortable: true },
        { id: 'power', label: 'Moc', sortable: true },
        {
          id: 'lensType',
          label: 'Typ',
          sortable: true,
          render: (row) => {
            const lensTypeLabels = {
              'DAILY': 'Jednodniowe',
              'BI_WEEKLY': 'Dwutygodniowe',
              'MONTHLY': 'Miesięczne',
            };
            return lensTypeLabels[row.lensType] || row.lensType || '-';
          },
        },
        {
          id: 'sellingPrice',
          label: 'Cena sprzedaży',
          sortable: true,
          render: (row) => row.sellingPrice ? `${row.sellingPrice.toFixed(2)} zł` : '-',
        },
      ],
      [PRODUCT_TYPES.SOLUTION]: [
        { id: 'volume', label: 'Pojemność', sortable: true },
        {
          id: 'sellingPrice',
          label: 'Cena sprzedaży',
          sortable: true,
          render: (row) => row.sellingPrice ? `${row.sellingPrice.toFixed(2)} zł` : '-',
        },
      ],
      [PRODUCT_TYPES.OTHER]: [
        { id: 'name', label: 'Nazwa', sortable: true },
        { id: 'description', label: 'Opis', sortable: false },
      ],
      [PRODUCT_TYPES.SUNGLASSES]: [
        { id: 'model', label: 'Model', sortable: true },
        { id: 'color', label: 'Kolor', sortable: true },
        { id: 'size', label: 'Rozmiar', sortable: true },
        {
          id: 'sellingPrice',
          label: 'Cena sprzedaży',
          sortable: true,
          render: (row) => row.sellingPrice ? `${row.sellingPrice.toFixed(2)} zł` : '-',
        },
      ],
    };

    // Add Quantity column if in location view, or Location column if in global view
    const extraColumns = isLocationView ? [{
      id: 'inventoryQuantity',
      label: 'Ilość',
      sortable: true,
      render: (row) => row.inventoryQuantity !== undefined ? row.inventoryQuantity : '-',
    }] : [{
      id: 'location',
      label: 'Lokalizacja',
      sortable: true,
      render: (row) => row.location?.name || '-',
    }, {
      id: 'inventoryQuantity',
      label: 'Ilość',
      sortable: true,
      render: (row) => row.inventoryQuantity !== undefined ? row.inventoryQuantity : '-',
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
        render: (row) => (
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
    if (currentLocation.id === 'ALL_WAREHOUSES') return "Wszystkie magazyny";
    return `Magazyn - ${currentLocation.name}`;
  };

  const getPageSubtitle = () => {
    if (!currentLocation) return "Przeglądaj produkty ze wszystkich lokalizacji";
    if (currentLocation.id === 'ALL_STORES') return "Przeglądaj produkty ze wszystkich salonów";
    if (currentLocation.id === 'ALL_WAREHOUSES') return "Przeglądaj produkty ze wszystkich magazynów";
    return `Zarządzaj produktami w: ${currentLocation.name}`;
  };

  if (!canViewWarehouse) {
    return (
      <Container maxWidth="xl">
        <Paper sx={{ p: 3, textAlign: 'center' }}>
          <Typography variant="h6" color="error">
            Dostęp odmówiony
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Nie masz uprawnień do przeglądania magazynu.
          </Typography>
        </Paper>
      </Container>
    );
  }

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
            disabled: !isLocationView,
            disabledTooltip: 'Wybierz konkretną lokalizację, aby dodać produkt',
          },
        ]}
      />

      {/* Product Type Tabs */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs value={currentType} onChange={handleTabChange}>
          <Tab label={PRODUCT_TYPE_LABELS[PRODUCT_TYPES.FRAME]} value={PRODUCT_TYPES.FRAME} />
          <Tab label={PRODUCT_TYPE_LABELS[PRODUCT_TYPES.SUNGLASSES]} value={PRODUCT_TYPES.SUNGLASSES} />
          <Tab label={PRODUCT_TYPE_LABELS[PRODUCT_TYPES.CONTACT_LENS]} value={PRODUCT_TYPES.CONTACT_LENS} />
          <Tab label={PRODUCT_TYPE_LABELS[PRODUCT_TYPES.SOLUTION]} value={PRODUCT_TYPES.SOLUTION} />
          <Tab label={PRODUCT_TYPE_LABELS[PRODUCT_TYPES.OTHER]} value={PRODUCT_TYPES.OTHER} />
          <Tab label="Podsumowanie" value="SUMMARY" />
        </Tabs>
      </Box>

      {/* Conditional rendering based on tab */}
      {currentType === 'SUMMARY' ? (
        <SummaryTab />
      ) : (
        <>
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
        </>
      )}

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
            ? 'Czy na pewno chcesz usunąć ten produkt?'
            : `Czy na pewno chcesz przywrócić ten produkt?`
        }
        confirmText={confirmDialog.action === 'delete' ? 'Usuń' : 'Przywróć'}
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
