# Frontend Utilities Guide

This guide documents the utility functions and helpers available in the frontend application.

## Validation Utilities (`src/utils/validation.js`)

### Email, Phone, and Password Patterns
```javascript
import { EMAIL_PATTERN, PHONE_PATTERN, PASSWORD_PATTERN } from '@/utils/validation';

// Use in React Hook Form
<FormField
  name="email"
  control={control}
  rules={{ pattern: EMAIL_PATTERN }}
/>
```

### Price and Quantity Validation
```javascript
import { priceValidation, quantityValidation } from '@/utils/validation';

<FormField
  name="price"
  control={control}
  rules={priceValidation}
/>
```

### Helper Functions
```javascript
import { maxLength, minLength, required, range } from '@/utils/validation';

// Max length with custom message
rules={{ ...maxLength(100, 'Product name') }}

// Range validation
rules={{ ...range(1, 999, 'Quantity') }}

// Custom validators
import { validatePositive, validateFutureDate } from '@/utils/validation';
```

## Accessibility Utilities (`src/utils/accessibility.js`)

### Keyboard Navigation
```javascript
import { Keys, isActionKey, handleKeyboardClick } from '@/utils/accessibility';

// Handle Enter/Space as click
<div
  role="button"
  tabIndex={0}
  onKeyDown={handleKeyboardClick(() => handleAction())}
>
  Click me
</div>
```

### ARIA Live Announcements
```javascript
import { announce } from '@/utils/accessibility';

// Announce to screen readers
announce('Item added to cart', 'polite');
announce('Error occurred', 'assertive');
```

### Focus Management
```javascript
import { createFocusTrap, scrollToAndFocus } from '@/utils/accessibility';

// Trap focus in modal
useEffect(() => {
  const cleanup = createFocusTrap(modalRef.current);
  return cleanup;
}, []);

// Scroll to element and focus
scrollToAndFocus(errorElement, { smooth: true });
```

### Role Props
```javascript
import { roleProps } from '@/utils/accessibility';

// Button props
<div {...roleProps.button()} onClick={handleClick}>
  Button
</div>

// Dialog props
<div {...roleProps.dialog('dialog-title', 'dialog-desc')}>
  Dialog content
</div>
```

## Performance Utilities (`src/utils/performance.js`)

### Debounce and Throttle
```javascript
import { debounce, throttle } from '@/utils/performance';

// Debounce search (waits for user to stop typing)
const handleSearch = debounce((query) => {
  searchAPI(query);
}, 300);

// Throttle scroll handler (limits execution frequency)
const handleScroll = throttle(() => {
  updateScrollPosition();
}, 100);
```

### Storage Helpers
```javascript
import { storage, sessionStorage } from '@/utils/performance';

// Local storage with JSON serialization
storage.set('user-preferences', { theme: 'dark', lang: 'en' });
const prefs = storage.get('user-preferences', {});
storage.remove('old-key');
console.log(storage.getSize()); // "12.5 KB"

// Session storage
sessionStorage.set('temp-data', { value: 123 });
```

### Performance Measurement
```javascript
import { measurePerformance } from '@/utils/performance';

// Measure function execution time
const { result, duration } = await measurePerformance(
  'Fetch Products',
  () => fetchProducts()
);
// Console: [Performance] Fetch Products: 234.56ms
```

### Memoization
```javascript
import { memoize } from '@/utils/performance';

// Cache expensive calculations
const calculateTotal = memoize((items) => {
  return items.reduce((sum, item) => sum + item.price, 0);
});

// First call: calculates
const total1 = calculateTotal(items);
// Second call with same items: returns cached result
const total2 = calculateTotal(items);
```

### Visibility Observer
```javascript
import { observeVisibility } from '@/utils/performance';

// Lazy load when element is visible
useEffect(() => {
  const cleanup = observeVisibility(
    imageRef.current,
    (isVisible) => {
      if (isVisible) {
        loadImage();
      }
    },
    { threshold: 0.5 }
  );

  return cleanup;
}, []);
```

## Usage in Components

### Example: Accessible Button with Validation
```javascript
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import FormField from '@/shared/components/FormField';
import { EMAIL_PATTERN, required } from '@/utils/validation';
import { announce } from '@/utils/accessibility';
import { debounce } from '@/utils/performance';

function ContactForm() {
  const { control, handleSubmit } = useForm();

  const checkEmailAvailability = debounce(async (email) => {
    const available = await api.checkEmail(email);
    if (!available) {
      announce('Email is already taken', 'polite');
    }
  }, 500);

  const onSubmit = async (data) => {
    try {
      await api.submitContact(data);
      announce('Form submitted successfully', 'polite');
    } catch (error) {
      announce('Submission failed', 'assertive');
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <FormField
        name="email"
        control={control}
        label="Email"
        type="email"
        rules={{
          ...required('Email'),
          pattern: EMAIL_PATTERN,
        }}
        onChange={(e) => checkEmailAvailability(e.target.value)}
      />
      <button type="submit">Submit</button>
    </form>
  );
}
```

### Example: Performance Optimized Table
```javascript
import { memo, useCallback, useMemo } from 'react';
import DataTable from '@/shared/components/DataTable';
import { debounce } from '@/utils/performance';

const ProductsTable = memo(({ products, onSearch }) => {
  const handleSearch = useCallback(
    debounce((query) => onSearch(query), 300),
    [onSearch]
  );

  const columns = useMemo(
    () => [
      { id: 'name', label: 'Name', sortable: true },
      { id: 'price', label: 'Price', sortable: true },
      { id: 'stock', label: 'Stock', sortable: true },
    ],
    []
  );

  return <DataTable columns={columns} data={products} />;
});
```

## Best Practices

1. **Validation**: Always use validation utilities for consistent error messages
2. **Accessibility**: Add ARIA labels and keyboard support to interactive elements
3. **Performance**: Debounce search inputs and throttle scroll handlers
4. **Memoization**: Use React.memo, useMemo, and useCallback for expensive operations
5. **Storage**: Use the storage wrappers for safe JSON serialization
6. **Focus Management**: Trap focus in modals and dialogs
7. **Announcements**: Use ARIA live regions for dynamic content changes

## Integration with Existing Code

The utilities are designed to work with:
- **React Hook Form**: Validation rules integrate seamlessly
- **Material-UI**: ARIA props work with MUI components
- **Redux**: Performance utilities help with selector memoization
- **React Router**: Accessibility helpers improve navigation

## Browser Support

All utilities include fallbacks for older browsers:
- `requestIdleCallback` has setTimeout fallback
- `IntersectionObserver` checks for existence
- Storage wrappers have try-catch error handling
- ARIA features degrade gracefully
