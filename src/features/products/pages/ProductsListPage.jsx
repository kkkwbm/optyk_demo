import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Button,
  Box,
  IconButton,
  Menu,
  MenuItem,
  Tabs,
  Tab,
  TextField,
} from '@mui/material';
import { Plus, MoreVertical, Eye } from 'lucide-react';
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
} from '../productsSlice';
import { PRODUCT_TYPES, PRODUCT_TYPE_LABELS, PRODUCT_STATUS } from '../../../constants';

function ProductsListPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const products = useSelector(selectProducts);
  const loading = useSelector(selectProductsLoading);
  const pagination = useSelector(selectProductsPagination);
  const currentType = useSelector(selectCurrentType);

  const [confirmDialog, setConfirmDialog] = useState({ open: false, product: null, action: null });
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    dispatch(fetchProducts({ type: currentType, params: { page: pagination.page, size: pagination.size } }));
  }, [dispatch, currentType, pagination.page, pagination.size]);

  const handleTabChange = (event, newType) => {
    dispatch(setCurrentType(newType));
  };

  const handleMenuOpen = (event, product) => {
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
      dispatch(fetchProducts({ type: currentType, params: { page: pagination.page, size: pagination.size } }));
    } catch (error) {
      toast.error(error || `Nie udało się ${action} produktu`);
    }
    handleCloseConfirm();
  };

  const handlePageChange = (newPage) => {
    dispatch(fetchProducts({ type: currentType, params: { page: newPage, size: pagination.size } }));
  };

  const handleRowsPerPageChange = (newSize) => {
    dispatch(fetchProducts({ type: currentType, params: { page: 0, size: newSize } }));
  };

  const handleSearch = (e) => {
    const value = e.target.value;
    setSearchTerm(value);

    if (value.trim()) {
      dispatch(fetchProducts({ type: currentType, params: { page: 0, size: pagination.size, search: value } }));
    } else {
      dispatch(fetchProducts({ type: currentType, params: { page: 0, size: pagination.size } }));
    }
  };

  const handleViewProduct = (product) => {
    navigate(`/products/${product.id}`);
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
          id: 'purchasePrice',
          label: 'Cena zakupu',
          sortable: true,
          render: (value) => value ? `$${value.toFixed(2)}` : '-',
        },
        {
          id: 'sellingPrice',
          label: 'Cena sprzedaży',
          sortable: true,
          render: (value) => value ? `$${value.toFixed(2)}` : '-',
        },
      ],
      [PRODUCT_TYPES.CONTACT_LENS]: [
        { id: 'model', label: 'Model', sortable: true },
        { id: 'power', label: 'Moc', sortable: true },
        { id: 'lensType', label: 'Typ', sortable: true },
        {
          id: 'purchasePrice',
          label: 'Cena zakupu',
          sortable: true,
          render: (value) => value ? `$${value.toFixed(2)}` : '-',
        },
        {
          id: 'sellingPrice',
          label: 'Cena sprzedaży',
          sortable: true,
          render: (value) => value ? `$${value.toFixed(2)}` : '-',
        },
      ],
      [PRODUCT_TYPES.SOLUTION]: [
        { id: 'name', label: 'Nazwa', sortable: true },
        { id: 'volume', label: 'Pojemność', sortable: true },
        {
          id: 'purchasePrice',
          label: 'Cena zakupu',
          sortable: true,
          render: (value) => value ? `$${value.toFixed(2)}` : '-',
        },
        {
          id: 'sellingPrice',
          label: 'Cena sprzedaży',
          sortable: true,
          render: (value) => value ? `$${value.toFixed(2)}` : '-',
        },
      ],
      [PRODUCT_TYPES.OTHER]: [
        { id: 'name', label: 'Nazwa', sortable: true },
        { id: 'description', label: 'Opis', sortable: false },
        {
          id: 'purchasePrice',
          label: 'Cena zakupu',
          sortable: true,
          render: (value) => value ? `$${value.toFixed(2)}` : '-',
        },
        {
          id: 'sellingPrice',
          label: 'Cena sprzedaży',
          sortable: true,
          render: (value) => value ? `$${value.toFixed(2)}` : '-',
        },
      ],
    };

    return [
      ...baseColumns,
      ...(typeSpecificColumns[currentType] || []),
      {
        id: 'status',
        label: 'Status',
        sortable: true,
        render: (value) => <StatusBadge status={value} type="product" />,
      },
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

  return (
    <Container maxWidth="xl">
      <PageHeader
        title="Produkty"
        subtitle="Zarządzaj produktami w magazynie"
        breadcrumbs={[
          { label: 'Dashboard', to: '/' },
          { label: 'Produkty' },
        ]}
        actions={[
          {
            label: 'Dodaj produkt',
            icon: <Plus size={20} />,
            onClick: () => navigate('/products/create'),
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
        data={products}
        pagination={pagination}
        onPageChange={handlePageChange}
        onRowsPerPageChange={handleRowsPerPageChange}
        loading={loading}
        emptyMessage={`Nie znaleziono ${PRODUCT_TYPE_LABELS[currentType].toLowerCase()}`}
        onRowClick={handleViewProduct}
      />

      {/* Actions Menu */}
      <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleMenuClose}>
        <MenuItem
          onClick={() => {
            handleViewProduct(selectedProduct);
            handleMenuClose();
          }}
        >
          <Eye size={16} style={{ marginRight: 8 }} />
          Podgląd szczegółów
        </MenuItem>
        {selectedProduct?.status !== PRODUCT_STATUS.DELETED && (
          <MenuItem
            onClick={() => {
              handleOpenConfirm(selectedProduct, 'delete');
              handleMenuClose();
            }}
          >
            Usuń
          </MenuItem>
        )}
        {selectedProduct?.status === PRODUCT_STATUS.DELETED && (
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
            ? `Czy na pewno chcesz usunąć ten produkt? Tę akcję można cofnąć później.`
            : `Czy na pewno chcesz przywrócić ten produkt?`
        }
        confirmText={confirmDialog.action === 'delete' ? 'Usuń' : 'Przywróć'}
        confirmColor={confirmDialog.action === 'delete' ? 'error' : 'primary'}
      />
    </Container>
  );
}

export default ProductsListPage;
