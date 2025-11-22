import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Container,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Box,
  IconButton,
  Menu,
  MenuItem,
} from '@mui/material';
import { Plus, MoreVertical } from 'lucide-react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import PageHeader from '../../../shared/components/PageHeader';
import DataTable from '../../../shared/components/DataTable';
import StatusBadge from '../../../shared/components/StatusBadge';
import ConfirmDialog from '../../../shared/components/ConfirmDialog';
import {
  fetchBrands,
  createBrand,
  updateBrand,
  activateBrand,
  deactivateBrand,
  selectBrands,
  selectBrandsLoading,
  selectBrandsPagination,
  clearError,
} from '../brandsSlice';
import { BRAND_STATUS } from '../../../constants';

function BrandsPage() {
  const dispatch = useDispatch();
  const brands = useSelector(selectBrands);
  const loading = useSelector(selectBrandsLoading);
  const pagination = useSelector(selectBrandsPagination);

  const [openDialog, setOpenDialog] = useState(false);
  const [editingBrand, setEditingBrand] = useState(null);
  const [confirmDialog, setConfirmDialog] = useState({ open: false, brand: null, action: null });
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedBrand, setSelectedBrand] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  const { register, handleSubmit, reset, formState: { errors } } = useForm();

  useEffect(() => {
    dispatch(fetchBrands({ page: pagination.page, size: pagination.size }));
  }, [dispatch, pagination.page, pagination.size]);

  const handleOpenDialog = (brand = null) => {
    setEditingBrand(brand);
    if (brand) {
      reset({ name: brand.name });
    } else {
      reset({ name: '' });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingBrand(null);
    reset();
  };

  const handleSaveBrand = async (data) => {
    try {
      if (editingBrand) {
        await dispatch(updateBrand({ id: editingBrand.id, data })).unwrap();
        toast.success('Markę zaktualizowano pomyślnie');
      } else {
        await dispatch(createBrand(data)).unwrap();
        toast.success('Markę utworzono pomyślnie');
      }
      handleCloseDialog();
      dispatch(fetchBrands({ page: pagination.page, size: pagination.size }));
    } catch (error) {
      toast.error(error || 'Nie udało się zapisać marki');
    }
  };

  const handleToggleStatus = async (brand) => {
    try {
      if (brand.status === BRAND_STATUS.ACTIVE) {
        await dispatch(deactivateBrand(brand.id)).unwrap();
        toast.success('Markę dezaktywowano pomyślnie');
      } else {
        await dispatch(activateBrand(brand.id)).unwrap();
        toast.success('Markę aktywowano pomyślnie');
      }
      dispatch(fetchBrands({ page: pagination.page, size: pagination.size }));
    } catch (error) {
      toast.error(error || 'Nie udało się zaktualizować statusu marki');
    }
    handleCloseConfirm();
  };

  const handleOpenConfirm = (brand, action) => {
    setConfirmDialog({ open: true, brand, action });
  };

  const handleCloseConfirm = () => {
    setConfirmDialog({ open: false, brand: null, action: null });
  };

  const handleConfirmAction = () => {
    const { brand, action } = confirmDialog;
    if (action === 'toggle') {
      handleToggleStatus(brand);
    }
  };

  const handleMenuOpen = (event, brand) => {
    setAnchorEl(event.currentTarget);
    setSelectedBrand(brand);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedBrand(null);
  };

  const handlePageChange = (newPage) => {
    dispatch(fetchBrands({ page: newPage, size: pagination.size }));
  };

  const handleRowsPerPageChange = (newSize) => {
    dispatch(fetchBrands({ page: 0, size: newSize }));
  };

  const handleSearch = (e) => {
    const value = e.target.value;
    setSearchTerm(value);

    if (value.trim()) {
      dispatch(fetchBrands({ page: 0, size: pagination.size, search: value }));
    } else {
      dispatch(fetchBrands({ page: 0, size: pagination.size }));
    }
  };

  const columns = [
    {
      id: 'name',
      label: 'Nazwa marki',
      sortable: true,
      render: (value, row) => (
        <span style={{
          opacity: row.status === BRAND_STATUS.INACTIVE ? 0.5 : 1,
          fontSize: '0.95rem',
          fontWeight: 500
        }}>
          {value}
        </span>
      ),
    },
    {
      id: 'status',
      label: 'Status',
      sortable: true,
      render: (value) => <StatusBadge status={value} type="brand" />,
    },
    {
      id: 'createdAt',
      label: 'Data utworzenia',
      sortable: true,
      render: (value) => value ? new Date(value).toLocaleDateString('pl-PL', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      }) : '-',
    },
    {
      id: 'updatedAt',
      label: 'Ostatnia aktualizacja',
      sortable: true,
      render: (value) => value ? new Date(value).toLocaleDateString('pl-PL', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      }) : '-',
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

  return (
    <Container maxWidth={false} sx={{ maxWidth: '1600px', px: { xs: 2, sm: 3, md: 4 } }}>
      <PageHeader
        title="Marki"
        subtitle="Zarządzaj markami optycznymi"
        breadcrumbs={[
          { label: 'Panel', to: '/' },
          { label: 'Marki' },
        ]}
        actions={[
          {
            label: 'Dodaj markę',
            icon: <Plus size={20} />,
            onClick: () => handleOpenDialog(),
          },
        ]}
      />

      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <TextField
          placeholder="Szukaj marek..."
          value={searchTerm}
          onChange={handleSearch}
          size="medium"
          sx={{ width: 400 }}
        />
      </Box>

      <Box sx={{ width: '100%' }}>
        <DataTable
          columns={columns}
          data={brands}
          pagination={pagination}
          onPageChange={handlePageChange}
          onRowsPerPageChange={handleRowsPerPageChange}
          loading={loading}
          emptyMessage="Nie znaleziono marek"
        />
      </Box>

      {/* Create/Edit Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <form onSubmit={handleSubmit(handleSaveBrand)}>
          <DialogTitle>{editingBrand ? 'Edytuj markę' : 'Dodaj nową markę'}</DialogTitle>
          <DialogContent>
            <Box sx={{ pt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
              <TextField
                fullWidth
                label="Nazwa marki"
                {...register('name', { required: 'Nazwa marki jest wymagana' })}
                error={!!errors.name}
                helperText={errors.name?.message}
                autoFocus
              />
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseDialog}>Anuluj</Button>
            <Button type="submit" variant="contained">
              {editingBrand ? 'Zaktualizuj' : 'Utwórz'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      {/* Actions Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem
          onClick={() => {
            handleOpenDialog(selectedBrand);
            handleMenuClose();
          }}
        >
          Edytuj
        </MenuItem>
        <MenuItem
          onClick={() => {
            handleOpenConfirm(selectedBrand, 'toggle');
            handleMenuClose();
          }}
        >
          {selectedBrand?.status === BRAND_STATUS.ACTIVE ? 'Dezaktywuj' : 'Aktywuj'}
        </MenuItem>
      </Menu>

      {/* Confirm Dialog */}
      <ConfirmDialog
        open={confirmDialog.open}
        onClose={handleCloseConfirm}
        onConfirm={handleConfirmAction}
        title={
          confirmDialog.action === 'toggle'
            ? confirmDialog.brand?.status === BRAND_STATUS.ACTIVE
              ? 'Dezaktywuj markę'
              : 'Aktywuj markę'
            : 'Potwierdź akcję'
        }
        message={
          confirmDialog.action === 'toggle'
            ? confirmDialog.brand?.status === BRAND_STATUS.ACTIVE
              ? `Czy na pewno chcesz dezaktywować "${confirmDialog.brand?.name}"?`
              : `Czy na pewno chcesz aktywować "${confirmDialog.brand?.name}"?`
            : 'Czy na pewno chcesz kontynuować?'
        }
        confirmText="Potwierdź"
        confirmColor={confirmDialog.brand?.status === BRAND_STATUS.ACTIVE ? 'warning' : 'primary'}
      />
    </Container>
  );
}

export default BrandsPage;
