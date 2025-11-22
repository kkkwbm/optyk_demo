import { memo, useCallback, useMemo } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  TableSortLabel,
  Paper,
  Checkbox,
  Box,
  Typography,
  CircularProgress,
} from '@mui/material';
import { visuallyHidden } from '@mui/utils';
import { PAGINATION } from '../../constants';

/**
 * DataTable Component
 * Reusable table with sorting, pagination, and selection
 *
 * @param {Object} props
 * @param {Array} props.columns - Column definitions
 * @param {Array} props.data - Table data
 * @param {Object} props.pagination - Pagination state
 * @param {Function} props.onPageChange - Page change handler
 * @param {Function} props.onRowsPerPageChange - Rows per page change handler
 * @param {Object} props.sort - Sort state
 * @param {Function} props.onSortChange - Sort change handler
 * @param {Boolean} props.loading - Loading state
 * @param {Boolean} props.selectable - Enable row selection
 * @param {Array} props.selected - Selected row IDs
 * @param {Function} props.onSelectionChange - Selection change handler
 * @param {Function} props.onRowClick - Row click handler
 * @param {String} props.emptyMessage - Message when no data
 */
function DataTable({
  columns = [],
  data = [],
  pagination = {
    page: 0,
    size: PAGINATION.DEFAULT_SIZE,
    totalElements: 0,
  },
  onPageChange,
  onRowsPerPageChange,
  sort = { sortBy: null, sortDirection: 'asc' },
  onSortChange,
  loading = false,
  selectable = false,
  selected = [],
  onSelectionChange,
  onRowClick,
  emptyMessage = 'Brak dostępnych danych',
  rowIdField = 'id',
}) {
  const handleSelectAllClick = useCallback(
    (event) => {
      if (event.target.checked) {
        const newSelected = data.map((row) => row[rowIdField]);
        onSelectionChange?.(newSelected);
        return;
      }
      onSelectionChange?.([]);
    },
    [data, rowIdField, onSelectionChange]
  );

  const handleRowClick = useCallback(
    (event, row) => {
      if (selectable) {
        const rowId = row[rowIdField];
        const selectedIndex = selected.indexOf(rowId);
        let newSelected = [];

        if (selectedIndex === -1) {
          newSelected = [...selected, rowId];
        } else {
          newSelected = selected.filter((id) => id !== rowId);
        }

        onSelectionChange?.(newSelected);
      }

      onRowClick?.(row);
    },
    [selectable, rowIdField, selected, onSelectionChange, onRowClick]
  );

  const handleRequestSort = useCallback(
    (columnId) => {
      if (!onSortChange) return;

      const isAsc = sort.sortBy === columnId && sort.sortDirection === 'asc';
      onSortChange(columnId, isAsc ? 'desc' : 'asc');
    },
    [onSortChange, sort.sortBy, sort.sortDirection]
  );

  const isSelected = useCallback((rowId) => selected.indexOf(rowId) !== -1, [selected]);

  const selectedSet = useMemo(() => new Set(selected), [selected]);

  return (
    <Paper sx={{ width: '100%', overflow: 'hidden' }}>
      <TableContainer>
        <Table stickyHeader>
          <TableHead>
            <TableRow>
              {selectable && (
                <TableCell padding="checkbox">
                  <Checkbox
                    color="primary"
                    indeterminate={selected.length > 0 && selected.length < data.length}
                    checked={data.length > 0 && selected.length === data.length}
                    onChange={handleSelectAllClick}
                  />
                </TableCell>
              )}
              {columns.map((column) => (
                <TableCell
                  key={column.id}
                  align={column.align || 'left'}
                  style={{ minWidth: column.minWidth }}
                  sortDirection={sort.sortBy === column.id ? sort.sortDirection : false}
                >
                  {column.sortable !== false ? (
                    <TableSortLabel
                      active={sort.sortBy === column.id}
                      direction={sort.sortBy === column.id ? sort.sortDirection : 'asc'}
                      onClick={() => handleRequestSort(column.id)}
                    >
                      {column.label}
                      {sort.sortBy === column.id ? (
                        <Box component="span" sx={visuallyHidden}>
                          {sort.sortDirection === 'desc' ? 'sortowane malejąco' : 'sortowane rosnąco'}
                        </Box>
                      ) : null}
                    </TableSortLabel>
                  ) : (
                    column.label
                  )}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={columns.length + (selectable ? 1 : 0)} align="center">
                  <Box sx={{ py: 4 }}>
                    <CircularProgress />
                  </Box>
                </TableCell>
              </TableRow>
            ) : data.length === 0 ? (
              <TableRow>
                <TableCell colSpan={columns.length + (selectable ? 1 : 0)} align="center">
                  <Box sx={{ py: 4 }}>
                    <Typography variant="body2" color="text.secondary">
                      {emptyMessage}
                    </Typography>
                  </Box>
                </TableCell>
              </TableRow>
            ) : (
              data.map((row) => {
                const rowId = row[rowIdField];
                const isItemSelected = isSelected(rowId);

                return (
                  <TableRow
                    hover
                    onClick={(event) => handleRowClick(event, row)}
                    role="checkbox"
                    aria-checked={isItemSelected}
                    tabIndex={-1}
                    key={rowId}
                    selected={isItemSelected}
                    sx={{ cursor: onRowClick || selectable ? 'pointer' : 'default' }}
                  >
                    {selectable && (
                      <TableCell padding="checkbox">
                        <Checkbox color="primary" checked={isItemSelected} />
                      </TableCell>
                    )}
                    {columns.map((column) => {
                      const value = row[column.id];
                      return (
                        <TableCell key={column.id} align={column.align || 'left'}>
                          {column.render ? column.render(value, row) : value}
                        </TableCell>
                      );
                    })}
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </TableContainer>
      {onPageChange && (
        <TablePagination
          rowsPerPageOptions={PAGINATION.SIZE_OPTIONS}
          component="div"
          count={pagination.totalElements || 0}
          rowsPerPage={pagination.size || PAGINATION.DEFAULT_SIZE}
          page={pagination.page || 0}
          onPageChange={(event, newPage) => onPageChange(newPage)}
          onRowsPerPageChange={(event) => onRowsPerPageChange(parseInt(event.target.value, 10))}
        />
      )}
    </Paper>
  );
}

export default memo(DataTable);
