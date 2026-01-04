import React from 'react';
import {
  Box,
  FormControl,
  FormLabel,
  FormGroup,
  FormControlLabel,
  Checkbox,
  Typography,
  Paper,
} from '@mui/material';
import { LOCATION_TABS, LOCATION_TAB_LABELS, LOCATION_TAB_DESCRIPTIONS, WAREHOUSE_SUB_PERMISSIONS } from '../constants';

/**
 * PermissionsSelector Component
 *
 * Allows selecting tab permissions for a user at a specific location.
 * If no tabs are selected, the user will have access to ALL tabs.
 * Warehouse has sub-permissions for Edit and Delete.
 *
 * @param {Object} props
 * @param {Array} props.selectedTabs - Array of selected tab names (e.g., ['WAREHOUSE', 'SALES'])
 * @param {Function} props.onChange - Callback when selection changes: (selectedTabs) => void
 * @param {boolean} props.disabled - Whether the selector is disabled
 * @param {string} props.locationName - Name of the location (for display purposes)
 */
const PermissionsSelector = ({ selectedTabs = [], onChange, disabled = false, locationName }) => {
  // Main tabs (excluding STATISTICS which is role-based, and sub-permissions which are shown nested)
  const mainTabs = Object.values(LOCATION_TABS).filter(
    tab => tab !== LOCATION_TABS.STATISTICS && !WAREHOUSE_SUB_PERMISSIONS.includes(tab)
  );

  // All assignable tabs (for counting)
  const allTabs = Object.values(LOCATION_TABS).filter(tab => tab !== LOCATION_TABS.STATISTICS);
  const allSelected = selectedTabs.length === 0 || selectedTabs.length === allTabs.length;

  const handleToggleAll = (event) => {
    if (event.target.checked) {
      // Select all tabs (which means access to everything)
      onChange([]);
    } else {
      // Deselect all (which means no access)
      onChange([]);
    }
  };

  const handleToggleTab = (tab) => {
    const currentTabs = selectedTabs.length === 0 ? [...allTabs] : [...selectedTabs];

    if (currentTabs.includes(tab)) {
      // Remove tab from selection
      let newTabs = currentTabs.filter((t) => t !== tab);

      // If removing WAREHOUSE, also remove sub-permissions
      if (tab === LOCATION_TABS.WAREHOUSE) {
        newTabs = newTabs.filter(t => !WAREHOUSE_SUB_PERMISSIONS.includes(t));
      }

      onChange(newTabs);
    } else {
      // Add tab to selection
      onChange([...currentTabs, tab]);
    }
  };

  const handleToggleSubPermission = (subPermission) => {
    const currentTabs = selectedTabs.length === 0 ? [...allTabs] : [...selectedTabs];

    if (currentTabs.includes(subPermission)) {
      // Remove sub-permission
      const newTabs = currentTabs.filter((t) => t !== subPermission);
      onChange(newTabs);
    } else {
      // Add sub-permission (also ensure WAREHOUSE is added)
      let newTabs = [...currentTabs, subPermission];
      if (!newTabs.includes(LOCATION_TABS.WAREHOUSE)) {
        newTabs.push(LOCATION_TABS.WAREHOUSE);
      }
      onChange(newTabs);
    }
  };

  const isTabChecked = (tab) => {
    return selectedTabs.length === 0 || selectedTabs.includes(tab);
  };

  return (
    <Paper variant="outlined" sx={{ p: 2 }}>
      <FormControl component="fieldset" disabled={disabled} fullWidth>
        <FormLabel component="legend">
          <Typography variant="subtitle2" gutterBottom>
            Uprawnienia dostępu do zakładek
            {locationName && (
              <Typography component="span" color="text.secondary" sx={{ ml: 1 }}>
                ({locationName})
              </Typography>
            )}
          </Typography>
        </FormLabel>

        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          {selectedTabs.length === 0
            ? 'Użytkownik ma dostęp do wszystkich zakładek w tej lokalizacji'
            : `Użytkownik ma dostęp do ${selectedTabs.length} z ${allTabs.length} uprawnień`
          }
        </Typography>

        <FormGroup>
          {/* Select All Checkbox */}
          <FormControlLabel
            control={
              <Checkbox
                checked={allSelected}
                onChange={handleToggleAll}
                indeterminate={selectedTabs.length > 0 && selectedTabs.length < allTabs.length}
              />
            }
            label={
              <Box>
                <Typography variant="body1" fontWeight="medium">
                  Wszystkie uprawnienia
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Zaznacz aby dać dostęp do wszystkich zakładek i operacji
                </Typography>
              </Box>
            }
            sx={{ mb: 1, borderBottom: '1px solid', borderColor: 'divider', pb: 1 }}
          />

          {/* Main Tab Checkboxes */}
          {mainTabs.map((tab) => {
            const isChecked = isTabChecked(tab);
            const isWarehouse = tab === LOCATION_TABS.WAREHOUSE;

            return (
              <Box key={tab}>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={isChecked}
                      onChange={() => handleToggleTab(tab)}
                    />
                  }
                  label={
                    <Box>
                      <Typography variant="body2" fontWeight="medium">
                        {LOCATION_TAB_LABELS[tab]}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {LOCATION_TAB_DESCRIPTIONS[tab]}
                      </Typography>
                    </Box>
                  }
                  sx={{ mb: 0.5, ml: 2 }}
                />

                {/* Sub-permissions for Warehouse */}
                {isWarehouse && isChecked && (
                  <Box sx={{ ml: 6, borderLeft: '2px solid', borderColor: 'divider', pl: 2 }}>
                    {WAREHOUSE_SUB_PERMISSIONS.map((subPerm) => {
                      const isSubChecked = isTabChecked(subPerm);
                      return (
                        <FormControlLabel
                          key={subPerm}
                          control={
                            <Checkbox
                              checked={isSubChecked}
                              onChange={() => handleToggleSubPermission(subPerm)}
                              size="small"
                            />
                          }
                          label={
                            <Box>
                              <Typography variant="body2" fontWeight="medium">
                                {LOCATION_TAB_LABELS[subPerm]}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                {LOCATION_TAB_DESCRIPTIONS[subPerm]}
                              </Typography>
                            </Box>
                          }
                          sx={{ mb: 0.5 }}
                        />
                      );
                    })}
                  </Box>
                )}
              </Box>
            );
          })}
        </FormGroup>
      </FormControl>
    </Paper>
  );
};

export default PermissionsSelector;
