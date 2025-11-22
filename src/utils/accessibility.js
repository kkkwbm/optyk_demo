/**
 * Accessibility utilities
 * ARIA helpers and keyboard navigation support
 */

// Keyboard key codes
export const Keys = {
  ENTER: 'Enter',
  SPACE: ' ',
  ESCAPE: 'Escape',
  ARROW_UP: 'ArrowUp',
  ARROW_DOWN: 'ArrowDown',
  ARROW_LEFT: 'ArrowLeft',
  ARROW_RIGHT: 'ArrowRight',
  TAB: 'Tab',
  HOME: 'Home',
  END: 'End',
  PAGE_UP: 'PageUp',
  PAGE_DOWN: 'PageDown',
};

// Check if key is actionable (Enter or Space)
export const isActionKey = (event) => {
  return event.key === Keys.ENTER || event.key === Keys.SPACE;
};

// Handle keyboard click (Enter or Space triggers click)
export const handleKeyboardClick = (callback) => (event) => {
  if (isActionKey(event)) {
    event.preventDefault();
    callback(event);
  }
};

// Create keyboard navigation handler
export const createKeyboardNavigator = (items, options = {}) => {
  const { onSelect, loop = true, orientation = 'vertical' } = options;

  return (event, currentIndex) => {
    const nextKey = orientation === 'vertical' ? Keys.ARROW_DOWN : Keys.ARROW_RIGHT;
    const prevKey = orientation === 'vertical' ? Keys.ARROW_UP : Keys.ARROW_LEFT;

    let newIndex = currentIndex;

    switch (event.key) {
      case nextKey:
        event.preventDefault();
        newIndex = currentIndex + 1;
        if (newIndex >= items.length) {
          newIndex = loop ? 0 : items.length - 1;
        }
        break;

      case prevKey:
        event.preventDefault();
        newIndex = currentIndex - 1;
        if (newIndex < 0) {
          newIndex = loop ? items.length - 1 : 0;
        }
        break;

      case Keys.HOME:
        event.preventDefault();
        newIndex = 0;
        break;

      case Keys.END:
        event.preventDefault();
        newIndex = items.length - 1;
        break;

      case Keys.ENTER:
      case Keys.SPACE:
        event.preventDefault();
        if (onSelect) {
          onSelect(items[currentIndex], currentIndex);
        }
        return currentIndex;

      default:
        return currentIndex;
    }

    return newIndex;
  };
};

// Generate unique ID for ARIA relationships
let idCounter = 0;
export const generateId = (prefix = 'id') => {
  idCounter += 1;
  return `${prefix}-${idCounter}-${Date.now()}`;
};

// ARIA live region announcer
export const announce = (message, politeness = 'polite') => {
  const announcer = document.getElementById('aria-live-announcer');

  if (announcer) {
    announcer.setAttribute('aria-live', politeness);
    announcer.textContent = message;

    // Clear after announcement
    setTimeout(() => {
      announcer.textContent = '';
    }, 1000);
  }
};

// Create ARIA live announcer element (call once in app initialization)
export const createAriaLiveAnnouncer = () => {
  if (!document.getElementById('aria-live-announcer')) {
    const announcer = document.createElement('div');
    announcer.id = 'aria-live-announcer';
    announcer.setAttribute('role', 'status');
    announcer.setAttribute('aria-live', 'polite');
    announcer.setAttribute('aria-atomic', 'true');
    announcer.style.position = 'absolute';
    announcer.style.left = '-10000px';
    announcer.style.width = '1px';
    announcer.style.height = '1px';
    announcer.style.overflow = 'hidden';
    document.body.appendChild(announcer);
  }
};

// Focus trap for modals/dialogs
export const createFocusTrap = (element) => {
  const focusableElements = element.querySelectorAll(
    'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
  );

  const firstElement = focusableElements[0];
  const lastElement = focusableElements[focusableElements.length - 1];

  const handleTabKey = (event) => {
    if (event.key !== Keys.TAB) return;

    if (event.shiftKey) {
      // Shift + Tab
      if (document.activeElement === firstElement) {
        event.preventDefault();
        lastElement.focus();
      }
    } else {
      // Tab
      if (document.activeElement === lastElement) {
        event.preventDefault();
        firstElement.focus();
      }
    }
  };

  element.addEventListener('keydown', handleTabKey);

  return () => {
    element.removeEventListener('keydown', handleTabKey);
  };
};

// Skip to content link helper
export const skipToContent = (contentId) => {
  const content = document.getElementById(contentId);
  if (content) {
    content.setAttribute('tabindex', '-1');
    content.focus();
    content.removeAttribute('tabindex');
  }
};

// ARIA label helpers
export const ariaLabel = {
  // For buttons
  button: (action, target) => `${action} ${target}`,

  // For links
  link: (text, external = false) =>
    external ? `${text} (opens in new tab)` : text,

  // For images
  image: (description) => description,

  // For form fields with error
  fieldWithError: (label, error) => `${label}, ${error}`,

  // For loading states
  loading: (context = 'content') => `Loading ${context}`,

  // For pagination
  pagination: (page, totalPages) => `Page ${page} of ${totalPages}`,

  // For sorting
  sort: (column, direction) =>
    direction ? `Sorted by ${column}, ${direction}ending` : `Sort by ${column}`,
};

// Screen reader only text helper (returns CSS-in-JS style object)
export const visuallyHidden = {
  position: 'absolute',
  width: '1px',
  height: '1px',
  padding: 0,
  margin: '-1px',
  overflow: 'hidden',
  clip: 'rect(0, 0, 0, 0)',
  whiteSpace: 'nowrap',
  border: 0,
};

// Check if element is in viewport (for lazy loading/focus management)
export const isInViewport = (element) => {
  const rect = element.getBoundingClientRect();
  return (
    rect.top >= 0 &&
    rect.left >= 0 &&
    rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
    rect.right <= (window.innerWidth || document.documentElement.clientWidth)
  );
};

// Scroll element into view with focus
export const scrollToAndFocus = (element, options = {}) => {
  const { smooth = true, block = 'center' } = options;

  element.scrollIntoView({
    behavior: smooth ? 'smooth' : 'auto',
    block,
  });

  // Focus after scroll
  setTimeout(() => {
    element.focus();
  }, smooth ? 300 : 0);
};

// Role-based props helper
export const roleProps = {
  button: (pressed = undefined) => ({
    role: 'button',
    tabIndex: 0,
    'aria-pressed': pressed,
  }),

  link: () => ({
    role: 'link',
    tabIndex: 0,
  }),

  dialog: (labelledBy, describedBy) => ({
    role: 'dialog',
    'aria-modal': true,
    'aria-labelledby': labelledBy,
    'aria-describedby': describedBy,
  }),

  menu: (labelledBy) => ({
    role: 'menu',
    'aria-labelledby': labelledBy,
  }),

  menuItem: () => ({
    role: 'menuitem',
    tabIndex: -1,
  }),

  tab: (selected, controls) => ({
    role: 'tab',
    'aria-selected': selected,
    'aria-controls': controls,
    tabIndex: selected ? 0 : -1,
  }),

  tabPanel: (labelledBy, hidden) => ({
    role: 'tabpanel',
    'aria-labelledby': labelledBy,
    hidden,
  }),
};

export default {
  Keys,
  isActionKey,
  handleKeyboardClick,
  createKeyboardNavigator,
  generateId,
  announce,
  createAriaLiveAnnouncer,
  createFocusTrap,
  skipToContent,
  ariaLabel,
  visuallyHidden,
  isInViewport,
  scrollToAndFocus,
  roleProps,
};
