import { useEffect, useState, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useLocation } from 'react-router-dom';
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
  Button,
  ButtonGroup,
} from '@mui/material';
import { Plus, MoreVertical, Edit, ArrowUp, ArrowDown } from 'lucide-react';
import toast from 'react-hot-toast';
import PageHeader from '../../../shared/components/PageHeader';
import DataTable from '../../../shared/components/DataTable';
import StatusBadge from '../../../shared/components/StatusBadge';
import ConfirmDialog from '../../../shared/components/ConfirmDialog';
import NotesDialog from '../../../shared/components/NotesDialog';
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
import { selectUser, selectIsDemo } from '../../auth/authSlice';
import EditProductModal from '../components/EditProductModal';
import SummaryTab from '../components/SummaryTab';
import { PRODUCT_TYPES, PRODUCT_TYPE_LABELS, PRODUCT_STATUS, PERMISSIONS, USER_ROLES, LOCATION_TABS } from '../../../constants';

function InventoryDashboardPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  // Global State
  const currentLocation = useSelector(selectCurrentLocation);
  const currentType = useSelector(selectCurrentType);
  const currentUser = useSelector(selectUser);
  const isDemo = useSelector(selectIsDemo);

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
  const [notesDialog, setNotesDialog] = useState({ open: false, title: '', content: '' });
  const [quantitySort, setQuantitySort] = useState(null); // null, 'desc', 'asc'
  const [priceSort, setPriceSort] = useState(null); // null, 'desc', 'asc'
  const debouncedSearchTerm = useDebounce(searchTerm, 300);

  // Derived State
  const isLocationView = !!currentLocation && currentLocation.id !== 'ALL_STORES' && currentLocation.id !== 'ALL_WAREHOUSES';
  const loading = inventoryLoading;
  const pagination = inventoryPagination;

  // Normalize data for the table
  const tableData = useMemo(() => {
    // Backend already filters by productType and sorts, so just map the data
    return inventoryItems.map(item => ({
      ...item.product, // Spread the full product object
      inventoryQuantity: item.quantity,
      inventoryId: item.id,
      // Ensure we have necessary fields
      id: item.product?.id || item.productId, // Use product ID as the primary ID for editing
      productId: item.product?.id || item.productId, // Keep product ID separately for backwards compatibility
      type: item.product?.type || item.productType, // Add type field for consistency
      location: item.location, // Add location for display
    }));
  }, [inventoryItems]);

  // Helper function to refresh inventory data
  const refreshInventory = (pageOverride = null, sizeOverride = null) => {
    if (currentType === 'SUMMARY' || isDemo) {
      return;
    }

    const params = {
      page: pageOverride !== null ? pageOverride : 0,
      size: sizeOverride !== null ? sizeOverride : pagination.size,
      productType: currentType,
    };

    if (debouncedSearchTerm && debouncedSearchTerm.trim()) {
      params.search = debouncedSearchTerm.trim();
    }

    // Add sorting parameters
    if (quantitySort) {
      params.sortBy = 'quantity';
      params.sortDirection = quantitySort;
    } else if (priceSort) {
      params.sortBy = 'product.sellingPrice';
      params.sortDirection = priceSort;
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
  };

  useEffect(() => {
    refreshInventory();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentType, pagination.size, currentLocation, isLocationView, debouncedSearchTerm, quantitySort, priceSort]);

  // Refresh data when navigating back with refresh state
  useEffect(() => {
    if (location.state?.refresh) {
      refreshInventory();
      // Clear the state to prevent refresh on subsequent renders
      navigate(location.pathname, { replace: true, state: {} });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.state]);

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

  // Check if user can edit products in warehouse
  const canEditProducts = useMemo(() => {
    // ADMIN and OWNER have full access
    if (currentUser?.role === USER_ROLES.ADMIN || currentUser?.role === USER_ROLES.OWNER) {
      return true;
    }

    // EMPLOYEE: check permissions based on current location
    if (currentUser?.userLocations && currentUser.userLocations.length > 0) {
      // If "All Stores" or aggregate view is selected, check if user has WAREHOUSE_EDIT in at least one location
      if (!currentLocation || currentLocation.id === 'ALL_STORES' || currentLocation.id === 'ALL_WAREHOUSES') {
        return currentUser.userLocations.some(
          (userLocation) =>
            // Empty/null allowedTabs means full access (including edit)
            !userLocation.allowedTabs ||
            userLocation.allowedTabs.length === 0 ||
            userLocation.allowedTabs.includes(LOCATION_TABS.WAREHOUSE_EDIT)
        );
      }

      // If specific location is selected, check if user has WAREHOUSE_EDIT for THAT location
      return currentUser.userLocations.some(
        (userLocation) =>
          userLocation.location.id === currentLocation.id &&
          // Empty/null allowedTabs means full access (including edit)
          (!userLocation.allowedTabs ||
            userLocation.allowedTabs.length === 0 ||
            userLocation.allowedTabs.includes(LOCATION_TABS.WAREHOUSE_EDIT))
      );
    }

    return false;
  }, [currentUser, currentLocation]);

  // Check if user can delete products in warehouse
  const canDeleteProducts = useMemo(() => {
    // ADMIN and OWNER have full access
    if (currentUser?.role === USER_ROLES.ADMIN || currentUser?.role === USER_ROLES.OWNER) {
      return true;
    }

    // EMPLOYEE: check permissions based on current location
    if (currentUser?.userLocations && currentUser.userLocations.length > 0) {
      // If "All Stores" or aggregate view is selected, check if user has WAREHOUSE_DELETE in at least one location
      if (!currentLocation || currentLocation.id === 'ALL_STORES' || currentLocation.id === 'ALL_WAREHOUSES') {
        return currentUser.userLocations.some(
          (userLocation) =>
            // Empty/null allowedTabs means full access (including delete)
            !userLocation.allowedTabs ||
            userLocation.allowedTabs.length === 0 ||
            userLocation.allowedTabs.includes(LOCATION_TABS.WAREHOUSE_DELETE)
        );
      }

      // If specific location is selected, check if user has WAREHOUSE_DELETE for THAT location
      return currentUser.userLocations.some(
        (userLocation) =>
          userLocation.location.id === currentLocation.id &&
          // Empty/null allowedTabs means full access (including delete)
          (!userLocation.allowedTabs ||
            userLocation.allowedTabs.length === 0 ||
            userLocation.allowedTabs.includes(LOCATION_TABS.WAREHOUSE_DELETE))
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
    const { product, action } = confirmDialog;
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
        // Pass locationId for history tracking (exclude special aggregate IDs)
        const locationId = currentLocation?.id && !['ALL_STORES', 'ALL_WAREHOUSES'].includes(currentLocation.id)
          ? currentLocation.id
          : null;
        await dispatch(deleteProduct({ type: actualProductType, id: productId, locationId })).unwrap();
        toast.success('Produkt został usunięty');
      } else if (action === 'restore') {
        await dispatch(restoreProduct({ type: actualProductType, id: productId })).unwrap();
        toast.success('Produkt został przywrócony');
      }

      // Refresh inventory after delete/restore
      refreshInventory();
    } catch (error) {
      toast.error(error || `Nie udało się ${action} produktu`);
    }
    handleCloseConfirm();
  };

  const handlePageChange = (newPage) => {
    refreshInventory(newPage);
  };

  const handleRowsPerPageChange = (newSize) => {
    refreshInventory(0, newSize);
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleQuantitySortToggle = () => {
    // Cycle: null -> desc -> asc -> null
    if (quantitySort === null) {
      setQuantitySort('desc');
      setPriceSort(null); // Reset price sort
    } else if (quantitySort === 'desc') {
      setQuantitySort('asc');
    } else {
      setQuantitySort(null);
    }
  };

  const handlePriceSortToggle = () => {
    // Cycle: null -> desc -> asc -> null
    if (priceSort === null) {
      setPriceSort('desc');
      setQuantitySort(null); // Reset quantity sort
    } else if (priceSort === 'desc') {
      setPriceSort('asc');
    } else {
      setPriceSort(null);
    }
  };

  const getSortIcon = (sortValue) => {
    if (sortValue === 'desc') return <ArrowDown size={16} />;
    if (sortValue === 'asc') return <ArrowUp size={16} />;
    return null;
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
    // Refresh inventory after edit
    refreshInventory();
  };

  const handleOpenNotesDialog = (product) => {
    const notes = product?.notes || product?.description || '';
    const productName = product?.model || product?.name || 'Produkt';
    setNotesDialog({
      open: true,
      title: `Notatka - ${productName}`,
      content: notes,
    });
  };

  const handleCloseNotesDialog = () => {
    setNotesDialog({ open: false, title: '', content: '' });
  };

  const truncateText = (text, maxLength = 50) => {
    if (!text) return '-';
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  // Define columns based on product type
  const getColumns = () => {
    // Only show brand column for products that have brands (not OTHER)
    const baseColumns = currentType !== PRODUCT_TYPES.OTHER ? [
      {
        id: 'brand',
        label: 'Marka',
        sortable: false,
        render: (row) => row.brand?.name || '-',
      },
    ] : [];

    const typeSpecificColumns = {
      [PRODUCT_TYPES.FRAME]: [
        { id: 'model', label: 'Model', sortable: false },
        { id: 'color', label: 'Kolor', sortable: false },
        { id: 'size', label: 'Rozmiar', sortable: false },
        {
          id: 'sellingPrice',
          label: 'Cena sprzedaży',
          sortable: false,
          render: (row) => row.sellingPrice ? `${row.sellingPrice.toFixed(2)} zł` : '-',
        },
        {
          id: 'notes',
          label: 'Notatka',
          sortable: false,
          render: (row) => {
            const notes = row.notes || '';
            const isLong = notes && notes.length > 50;
            return (
              <Box
                sx={{
                  cursor: isLong ? 'pointer' : 'default',
                  color: isLong ? 'primary.main' : 'text.primary',
                  '&:hover': isLong ? { textDecoration: 'underline' } : {},
                }}
                onClick={(e) => {
                  if (isLong) {
                    e.stopPropagation();
                    handleOpenNotesDialog(row);
                  }
                }}
              >
                {truncateText(notes)}
              </Box>
            );
          },
        },
      ],
      [PRODUCT_TYPES.CONTACT_LENS]: [
        { id: 'model', label: 'Model', sortable: false },
        { id: 'power', label: 'Moc', sortable: false },
        {
          id: 'lensType',
          label: 'Typ',
          sortable: false,
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
          sortable: false,
          render: (row) => row.sellingPrice ? `${row.sellingPrice.toFixed(2)} zł` : '-',
        },
        {
          id: 'notes',
          label: 'Notatka',
          sortable: false,
          render: (row) => {
            const notes = row.notes || '';
            const isLong = notes && notes.length > 50;
            return (
              <Box
                sx={{
                  cursor: isLong ? 'pointer' : 'default',
                  color: isLong ? 'primary.main' : 'text.primary',
                  '&:hover': isLong ? { textDecoration: 'underline' } : {},
                }}
                onClick={(e) => {
                  if (isLong) {
                    e.stopPropagation();
                    handleOpenNotesDialog(row);
                  }
                }}
              >
                {truncateText(notes)}
              </Box>
            );
          },
        },
      ],
      [PRODUCT_TYPES.SOLUTION]: [
        { id: 'volume', label: 'Pojemność (ml)', sortable: false },
        {
          id: 'sellingPrice',
          label: 'Cena sprzedaży',
          sortable: false,
          render: (row) => row.sellingPrice ? `${row.sellingPrice.toFixed(2)} zł` : '-',
        },
        {
          id: 'notes',
          label: 'Notatka',
          sortable: false,
          render: (row) => {
            const notes = row.notes || '';
            const isLong = notes && notes.length > 50;
            return (
              <Box
                sx={{
                  cursor: isLong ? 'pointer' : 'default',
                  color: isLong ? 'primary.main' : 'text.primary',
                  '&:hover': isLong ? { textDecoration: 'underline' } : {},
                }}
                onClick={(e) => {
                  if (isLong) {
                    e.stopPropagation();
                    handleOpenNotesDialog(row);
                  }
                }}
              >
                {truncateText(notes)}
              </Box>
            );
          },
        },
      ],
      [PRODUCT_TYPES.OTHER]: [
        { id: 'name', label: 'Nazwa', sortable: false },
        { id: 'description', label: 'Opis', sortable: false },
      ],
      [PRODUCT_TYPES.SUNGLASSES]: [
        { id: 'model', label: 'Model', sortable: false },
        { id: 'color', label: 'Kolor', sortable: false },
        { id: 'size', label: 'Rozmiar', sortable: false },
        {
          id: 'sellingPrice',
          label: 'Cena sprzedaży',
          sortable: false,
          render: (row) => row.sellingPrice ? `${row.sellingPrice.toFixed(2)} zł` : '-',
        },
        {
          id: 'notes',
          label: 'Notatka',
          sortable: false,
          render: (row) => {
            const notes = row.notes || '';
            const isLong = notes && notes.length > 50;
            return (
              <Box
                sx={{
                  cursor: isLong ? 'pointer' : 'default',
                  color: isLong ? 'primary.main' : 'text.primary',
                  '&:hover': isLong ? { textDecoration: 'underline' } : {},
                }}
                onClick={(e) => {
                  if (isLong) {
                    e.stopPropagation();
                    handleOpenNotesDialog(row);
                  }
                }}
              >
                {truncateText(notes)}
              </Box>
            );
          },
        },
      ],
    };

    // Add Quantity column if in location view, or Location column if in global view
    const extraColumns = isLocationView ? [{
      id: 'inventoryQuantity',
      label: 'Ilość',
      sortable: false,
      render: (row) => row.inventoryQuantity !== undefined ? row.inventoryQuantity : '-',
    }] : [{
      id: 'location',
      label: 'Lokalizacja',
      sortable: false,
      render: (row) => row.location?.name || '-',
    }, {
      id: 'inventoryQuantity',
      label: 'Ilość',
      sortable: false,
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
            onClick: () => navigate(`/inventory/create?type=${currentType}`),
            disabled: !isLocationView || currentType === 'SUMMARY',
            disabledTooltip: currentType === 'SUMMARY' ? 'Wybierz typ produktu, aby dodać produkt' : 'Wybierz konkretną lokalizację, aby dodać produkt',
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
          {/* Search and Sort */}
          <Box sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 2 }}>
            <TextField
              placeholder={`Szukaj ${PRODUCT_TYPE_LABELS[currentType].toLowerCase()}...`}
              value={searchTerm}
              onChange={handleSearch}
              size="small"
              sx={{ width: 300 }}
            />
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Typography variant="body2" color="text.secondary">
                Sortuj:
              </Typography>
              <Button
                variant={quantitySort ? 'contained' : 'outlined'}
                size="small"
                onClick={handleQuantitySortToggle}
                endIcon={<Box sx={{ width: 16, height: 16, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{getSortIcon(quantitySort)}</Box>}
                sx={{ textTransform: 'none', minWidth: 85 }}
              >
                Ilość
              </Button>
              <Button
                variant={priceSort ? 'contained' : 'outlined'}
                size="small"
                onClick={handlePriceSortToggle}
                endIcon={<Box sx={{ width: 16, height: 16, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{getSortIcon(priceSort)}</Box>}
                sx={{ textTransform: 'none', minWidth: 85 }}
              >
                Cena
              </Button>
            </Box>
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
          canEditProducts && (
            <MenuItem
              key="edit"
              onClick={() => {
                handleEditProduct(selectedProduct);
                handleMenuClose();
              }}
            >
              <Edit size={16} style={{ marginRight: 8 }} />
              Edytuj
            </MenuItem>
          ),
          canDeleteProducts && (
            <MenuItem
              key="delete"
              onClick={() => {
                handleOpenConfirm(selectedProduct, 'delete');
                handleMenuClose();
              }}
            >
              Usuń
            </MenuItem>
          ),
          !canEditProducts && !canDeleteProducts && (
            <MenuItem key="no-permission" disabled>
              Brak uprawnień do akcji
            </MenuItem>
          ),
        ].filter(Boolean) : (
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

      {/* Notes Dialog */}
      <NotesDialog
        open={notesDialog.open}
        onClose={handleCloseNotesDialog}
        title={notesDialog.title}
        content={notesDialog.content}
      />
    </Container>
  );
}

export default InventoryDashboardPage;
