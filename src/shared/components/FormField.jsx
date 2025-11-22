import { memo } from 'react';
import {
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  FormHelperText,
  Autocomplete,
  Checkbox,
  FormControlLabel,
  FormGroup,
  FormLabel,
  RadioGroup,
  Radio,
} from '@mui/material';
import { Controller } from 'react-hook-form';

/**
 * FormField Component
 * Wrapped MUI form fields with react-hook-form integration
 *
 * @param {Object} props
 * @param {String} props.name - Field name
 * @param {Object} props.control - React Hook Form control
 * @param {String} props.label - Field label
 * @param {String} props.type - Field type (text, select, autocomplete, checkbox, radio)
 * @param {Array} props.options - Options for select/autocomplete/radio
 * @param {Boolean} props.required - Required field
 * @param {Boolean} props.disabled - Disabled field
 * @param {Boolean} props.multiline - Multiline text field
 * @param {Number} props.rows - Number of rows for multiline
 * @param {Object} props.rules - Validation rules
 */
function FormField({
  name,
  control,
  label,
  type = 'text',
  options = [],
  required = false,
  disabled = false,
  multiline = false,
  rows = 4,
  placeholder = '',
  helperText = '',
  rules = {},
  ...otherProps
}) {
  // Merge required rule if specified
  const fieldRules = {
    ...rules,
    ...(required && {
      required: rules.required || `${label} is required`,
    }),
  };

  // Text Field
  if (type === 'text' || type === 'email' || type === 'number' || type === 'password') {
    return (
      <Controller
        name={name}
        control={control}
        rules={fieldRules}
        render={({ field, fieldState: { error } }) => (
          <TextField
            {...field}
            label={label}
            type={type}
            fullWidth
            required={required}
            disabled={disabled}
            multiline={multiline}
            rows={multiline ? rows : undefined}
            placeholder={placeholder}
            error={!!error}
            helperText={error?.message || helperText}
            {...otherProps}
          />
        )}
      />
    );
  }

  // Select Field
  if (type === 'select') {
    return (
      <Controller
        name={name}
        control={control}
        rules={fieldRules}
        render={({ field, fieldState: { error } }) => (
          <FormControl fullWidth error={!!error} required={required} disabled={disabled}>
            <InputLabel>{label}</InputLabel>
            <Select {...field} label={label} {...otherProps}>
              {options.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </Select>
            {(error?.message || helperText) && (
              <FormHelperText>{error?.message || helperText}</FormHelperText>
            )}
          </FormControl>
        )}
      />
    );
  }

  // Autocomplete Field
  if (type === 'autocomplete') {
    return (
      <Controller
        name={name}
        control={control}
        rules={fieldRules}
        render={({ field: { onChange, value }, fieldState: { error } }) => (
          <Autocomplete
            options={options}
            getOptionLabel={(option) => option.label || ''}
            value={options.find((opt) => opt.value === value) || null}
            onChange={(event, newValue) => onChange(newValue?.value || '')}
            disabled={disabled}
            renderInput={(params) => (
              <TextField
                {...params}
                label={label}
                required={required}
                error={!!error}
                helperText={error?.message || helperText}
                placeholder={placeholder}
              />
            )}
            {...otherProps}
          />
        )}
      />
    );
  }

  // Checkbox Field
  if (type === 'checkbox') {
    return (
      <Controller
        name={name}
        control={control}
        rules={fieldRules}
        render={({ field: { onChange, value }, fieldState: { error } }) => (
          <FormControl error={!!error} disabled={disabled}>
            <FormControlLabel
              control={<Checkbox checked={!!value} onChange={onChange} />}
              label={label}
            />
            {(error?.message || helperText) && (
              <FormHelperText>{error?.message || helperText}</FormHelperText>
            )}
          </FormControl>
        )}
      />
    );
  }

  // Multi-Checkbox Field
  if (type === 'checkbox-group') {
    return (
      <Controller
        name={name}
        control={control}
        rules={fieldRules}
        render={({ field: { onChange, value = [] }, fieldState: { error } }) => (
          <FormControl error={!!error} disabled={disabled} component="fieldset">
            <FormLabel component="legend">{label}</FormLabel>
            <FormGroup>
              {options.map((option) => (
                <FormControlLabel
                  key={option.value}
                  control={
                    <Checkbox
                      checked={value.includes(option.value)}
                      onChange={(e) => {
                        const newValue = e.target.checked
                          ? [...value, option.value]
                          : value.filter((v) => v !== option.value);
                        onChange(newValue);
                      }}
                    />
                  }
                  label={option.label}
                />
              ))}
            </FormGroup>
            {(error?.message || helperText) && (
              <FormHelperText>{error?.message || helperText}</FormHelperText>
            )}
          </FormControl>
        )}
      />
    );
  }

  // Radio Field
  if (type === 'radio') {
    return (
      <Controller
        name={name}
        control={control}
        rules={fieldRules}
        render={({ field, fieldState: { error } }) => (
          <FormControl error={!!error} disabled={disabled} component="fieldset">
            <FormLabel component="legend">{label}</FormLabel>
            <RadioGroup {...field}>
              {options.map((option) => (
                <FormControlLabel
                  key={option.value}
                  value={option.value}
                  control={<Radio />}
                  label={option.label}
                />
              ))}
            </RadioGroup>
            {(error?.message || helperText) && (
              <FormHelperText>{error?.message || helperText}</FormHelperText>
            )}
          </FormControl>
        )}
      />
    );
  }

  // Default to text field
  return (
    <Controller
      name={name}
      control={control}
      rules={fieldRules}
      render={({ field, fieldState: { error } }) => (
        <TextField
          {...field}
          label={label}
          fullWidth
          required={required}
          disabled={disabled}
          placeholder={placeholder}
          error={!!error}
          helperText={error?.message || helperText}
          {...otherProps}
        />
      )}
    />
  );
}

export default memo(FormField);
