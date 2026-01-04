/**
 * Application Constants
 * Central location for all business logic constants
 */

// Export API constants
export * from './api';

// User Roles
export const USER_ROLES = {
  ADMIN: 'ADMIN',
  OWNER: 'OWNER',
  EMPLOYEE: 'EMPLOYEE',
};

export const USER_ROLE_LABELS = {
  [USER_ROLES.ADMIN]: 'Administrator',
  [USER_ROLES.OWNER]: 'Właściciel',
  [USER_ROLES.EMPLOYEE]: 'Pracownik',
};

// User Status
export const USER_STATUS = {
  ACTIVE: 'ACTIVE',
  INACTIVE: 'INACTIVE',
};

export const USER_STATUS_LABELS = {
  [USER_STATUS.ACTIVE]: 'Aktywny',
  [USER_STATUS.INACTIVE]: 'Nieaktywny',
};

// Product Types
export const PRODUCT_TYPES = {
  FRAME: 'FRAME',
  CONTACT_LENS: 'CONTACT_LENS',
  SOLUTION: 'SOLUTION',
  OTHER: 'OTHER',
  SUNGLASSES: 'SUNGLASSES',
  EYEGLASS_LENS: 'EYEGLASS_LENS',
};

export const PRODUCT_TYPE_LABELS = {
  [PRODUCT_TYPES.FRAME]: 'Oprawki',
  [PRODUCT_TYPES.CONTACT_LENS]: 'Soczewki kontaktowe',
  [PRODUCT_TYPES.SOLUTION]: 'Płyny',
  [PRODUCT_TYPES.OTHER]: 'Inne produkty',
  [PRODUCT_TYPES.SUNGLASSES]: 'Okulary przeciwsłoneczne',
  [PRODUCT_TYPES.EYEGLASS_LENS]: 'Soczewki okularowe',
  'OTHER_PRODUCT': 'Inne produkty', // Backend returns OTHER_PRODUCT
};

export const PRODUCT_TYPE_SINGULAR = {
  [PRODUCT_TYPES.FRAME]: 'Oprawka',
  [PRODUCT_TYPES.CONTACT_LENS]: 'Soczewka kontaktowa',
  [PRODUCT_TYPES.SOLUTION]: 'Płyn',
  [PRODUCT_TYPES.OTHER]: 'Inny produkt',
  [PRODUCT_TYPES.SUNGLASSES]: 'Okulary przeciwsłoneczne',
  [PRODUCT_TYPES.EYEGLASS_LENS]: 'Soczewka okularowa',
};

// Eyeglass Lens Types
export const EYEGLASS_LENS_TYPES = {
  SINGLE_VISION: 'SINGLE_VISION',
  PROGRESSIVE: 'PROGRESSIVE',
  RELAXATION: 'RELAXATION',
  BIFOCAL: 'BIFOCAL',
  OFFICE: 'OFFICE',
};

export const EYEGLASS_LENS_TYPE_LABELS = {
  [EYEGLASS_LENS_TYPES.SINGLE_VISION]: 'Jednoogniskowe',
  [EYEGLASS_LENS_TYPES.PROGRESSIVE]: 'Progresywne',
  [EYEGLASS_LENS_TYPES.RELAXATION]: 'Relaksacyjne',
  [EYEGLASS_LENS_TYPES.BIFOCAL]: 'Dwuogniskowe',
  [EYEGLASS_LENS_TYPES.OFFICE]: 'Biurowe',
};

// Product Status
export const PRODUCT_STATUS = {
  ACTIVE: 'ACTIVE',
  INACTIVE: 'INACTIVE',
  DELETED: 'DELETED',
};

export const PRODUCT_STATUS_LABELS = {
  [PRODUCT_STATUS.ACTIVE]: 'Aktywny',
  [PRODUCT_STATUS.INACTIVE]: 'Nieaktywny',
  [PRODUCT_STATUS.DELETED]: 'Usunięty',
};

// Location Types
export const LOCATION_TYPES = {
  STORE: 'STORE',
  WAREHOUSE: 'WAREHOUSE',
};

export const LOCATION_TYPE_LABELS = {
  [LOCATION_TYPES.STORE]: 'Salon',
  [LOCATION_TYPES.WAREHOUSE]: 'Magazyn',
};

// Location Status
export const LOCATION_STATUS = {
  ACTIVE: 'ACTIVE',
  INACTIVE: 'INACTIVE',
};

export const LOCATION_STATUS_LABELS = {
  [LOCATION_STATUS.ACTIVE]: 'Aktywny',
  [LOCATION_STATUS.INACTIVE]: 'Nieaktywny',
};

// Location Tabs (for user permissions)
export const LOCATION_TABS = {
  WAREHOUSE: 'WAREHOUSE',
  WAREHOUSE_EDIT: 'WAREHOUSE_EDIT',
  WAREHOUSE_DELETE: 'WAREHOUSE_DELETE',
  SALES: 'SALES',
  TRANSFERS: 'TRANSFERS',
  STATISTICS: 'STATISTICS',
  HISTORY: 'HISTORY',
};

export const LOCATION_TAB_LABELS = {
  [LOCATION_TABS.WAREHOUSE]: 'Magazyn',
  [LOCATION_TABS.WAREHOUSE_EDIT]: 'Edytowanie',
  [LOCATION_TABS.WAREHOUSE_DELETE]: 'Usuwanie',
  [LOCATION_TABS.SALES]: 'Sprzedaż',
  [LOCATION_TABS.TRANSFERS]: 'Transfery',
  [LOCATION_TABS.STATISTICS]: 'Statystyki',
  [LOCATION_TABS.HISTORY]: 'Historia',
};

export const LOCATION_TAB_DESCRIPTIONS = {
  [LOCATION_TABS.WAREHOUSE]: 'Przeglądanie magazynu i stanu towaru',
  [LOCATION_TABS.WAREHOUSE_EDIT]: 'Edytowanie produktów w magazynie',
  [LOCATION_TABS.WAREHOUSE_DELETE]: 'Usuwanie produktów z magazynu',
  [LOCATION_TABS.SALES]: 'Rejestrowanie i przeglądanie sprzedaży',
  [LOCATION_TABS.TRANSFERS]: 'Zarządzanie transferami produktów',
  [LOCATION_TABS.STATISTICS]: 'Przeglądanie statystyk i analiz',
  [LOCATION_TABS.HISTORY]: 'Historia operacji i zmian',
};

// Warehouse sub-permissions (for nested display in PermissionsSelector)
export const WAREHOUSE_SUB_PERMISSIONS = [
  LOCATION_TABS.WAREHOUSE_EDIT,
  LOCATION_TABS.WAREHOUSE_DELETE,
];

// Brand Status
export const BRAND_STATUS = {
  ACTIVE: 'ACTIVE',
  INACTIVE: 'INACTIVE',
};

export const BRAND_STATUS_LABELS = {
  [BRAND_STATUS.ACTIVE]: 'Aktywna',
  [BRAND_STATUS.INACTIVE]: 'Nieaktywna',
};

// Operation Types (for History)
export const OPERATION_TYPES = {
  CREATE: 'CREATE',
  UPDATE: 'UPDATE',
  DELETE: 'DELETE',
  RESTORE: 'RESTORE',
  TRANSFER: 'TRANSFER',
  TRANSFER_INITIATED: 'TRANSFER_INITIATED',
  TRANSFER_CONFIRMED: 'TRANSFER_CONFIRMED',
  TRANSFER_REJECTED: 'TRANSFER_REJECTED',
  TRANSFER_CANCELLED: 'TRANSFER_CANCELLED',
  SALE: 'SALE',
  RETURN: 'RETURN',
  REVERT: 'REVERT',
  STOCK_ADJUST: 'STOCK_ADJUST',
  ACTIVATE: 'ACTIVATE',
  DEACTIVATE: 'DEACTIVATE',
  PASSWORD_RESET: 'PASSWORD_RESET',
  PASSWORD_CHANGE: 'PASSWORD_CHANGE',
};

export const OPERATION_TYPE_LABELS = {
  [OPERATION_TYPES.CREATE]: 'Utworzenie',
  [OPERATION_TYPES.UPDATE]: 'Aktualizacja',
  [OPERATION_TYPES.DELETE]: 'Usunięcie',
  [OPERATION_TYPES.RESTORE]: 'Przywrócenie',
  [OPERATION_TYPES.TRANSFER]: 'Transfer',
  [OPERATION_TYPES.TRANSFER_INITIATED]: 'Inicjacja transferu',
  [OPERATION_TYPES.TRANSFER_CONFIRMED]: 'Potwierdzenie transferu',
  [OPERATION_TYPES.TRANSFER_REJECTED]: 'Odrzucenie transferu',
  [OPERATION_TYPES.TRANSFER_CANCELLED]: 'Anulowanie transferu',
  [OPERATION_TYPES.SALE]: 'Sprzedaż',
  [OPERATION_TYPES.RETURN]: 'Zwrot',
  [OPERATION_TYPES.REVERT]: 'Cofnięcie',
  [OPERATION_TYPES.STOCK_ADJUST]: 'Korekta stanu',
  [OPERATION_TYPES.ACTIVATE]: 'Aktywacja',
  [OPERATION_TYPES.DEACTIVATE]: 'Dezaktywacja',
  [OPERATION_TYPES.PASSWORD_RESET]: 'Reset hasła',
  [OPERATION_TYPES.PASSWORD_CHANGE]: 'Zmiana hasła',
};

// Entity Types (for History)
export const ENTITY_TYPES = {
  FRAME: 'FRAME',
  CONTACT_LENS: 'CONTACT_LENS',
  SOLUTION: 'SOLUTION',
  OTHER: 'OTHER',
  OTHER_PRODUCT: 'OTHER_PRODUCT',
  SUNGLASSES: 'SUNGLASSES',
  EYEGLASS_LENS: 'EYEGLASS_LENS',
  USER: 'USER',
  LOCATION: 'LOCATION',
  BRAND: 'BRAND',
  SALE: 'SALE',
  TRANSFER: 'TRANSFER',
  INVENTORY: 'INVENTORY',
};

export const ENTITY_TYPE_LABELS = {
  [ENTITY_TYPES.FRAME]: 'Oprawka',
  [ENTITY_TYPES.CONTACT_LENS]: 'Soczewka kontaktowa',
  [ENTITY_TYPES.SOLUTION]: 'Płyn',
  [ENTITY_TYPES.OTHER]: 'Inny produkt',
  [ENTITY_TYPES.OTHER_PRODUCT]: 'Inny produkt',
  [ENTITY_TYPES.SUNGLASSES]: 'Okulary przeciwsłoneczne',
  [ENTITY_TYPES.EYEGLASS_LENS]: 'Soczewka okularowa',
  [ENTITY_TYPES.USER]: 'Użytkownik',
  [ENTITY_TYPES.LOCATION]: 'Lokalizacja',
  [ENTITY_TYPES.BRAND]: 'Marka',
  [ENTITY_TYPES.SALE]: 'Sprzedaż',
  [ENTITY_TYPES.TRANSFER]: 'Transfer',
  [ENTITY_TYPES.INVENTORY]: 'Magazyn',
};

// Sale Status
export const SALE_STATUS = {
  COMPLETED: 'COMPLETED',
  CANCELLED: 'CANCELLED',
  RETURNED: 'RETURNED',
  PARTIALLY_RETURNED: 'PARTIALLY_RETURNED',
};

export const SALE_STATUS_LABELS = {
  [SALE_STATUS.COMPLETED]: 'Zakończona',
  [SALE_STATUS.CANCELLED]: 'Anulowana',
  [SALE_STATUS.RETURNED]: 'Zwrócona',
  [SALE_STATUS.PARTIALLY_RETURNED]: 'Częściowo zwrócona',
};

// Payment Methods
export const PAYMENT_METHODS = {
  CASH: 'CASH',
  CARD: 'CARD',
  TRANSFER: 'TRANSFER',
  MIXED: 'MIXED',
};

export const PAYMENT_METHOD_LABELS = {
  [PAYMENT_METHODS.CASH]: 'Cash',
  [PAYMENT_METHODS.CARD]: 'Card',
  [PAYMENT_METHODS.TRANSFER]: 'Bank Transfer',
  [PAYMENT_METHODS.MIXED]: 'Mixed Payment',
};

// Transfer Status
export const TRANSFER_STATUS = {
  PENDING: 'PENDING',
  COMPLETED: 'COMPLETED',
  CANCELLED: 'CANCELLED',
  REJECTED: 'REJECTED',
};

export const TRANSFER_STATUS_LABELS = {
  [TRANSFER_STATUS.PENDING]: 'Oczekujący',
  [TRANSFER_STATUS.COMPLETED]: 'Zakończony',
  [TRANSFER_STATUS.CANCELLED]: 'Anulowany',
  [TRANSFER_STATUS.REJECTED]: 'Odrzucony',
};

// Stock Adjustment Types
export const STOCK_ADJUSTMENT_TYPES = {
  ADD: 'ADD',
  REMOVE: 'REMOVE',
};

export const STOCK_ADJUSTMENT_TYPE_LABELS = {
  [STOCK_ADJUSTMENT_TYPES.ADD]: 'Dodaj stan',
  [STOCK_ADJUSTMENT_TYPES.REMOVE]: 'Usuń stan',
};

// Pagination Defaults
export const PAGINATION = {
  DEFAULT_PAGE: 0,
  DEFAULT_SIZE: 20,
  SIZE_OPTIONS: [10, 20, 50, 100],
};

// Date Formats
export const DATE_FORMATS = {
  DISPLAY: 'dd.MM.yyyy',
  DISPLAY_LONG: 'dd MMMM yyyy',
  DISPLAY_WITH_TIME: 'dd.MM.yyyy HH:mm',
  DISPLAY_TIME: 'HH:mm',
  API: 'yyyy-MM-dd',
  API_WITH_TIME: "yyyy-MM-dd'T'HH:mm:ss",
};

// Sort Directions
export const SORT_DIRECTIONS = {
  ASC: 'asc',
  DESC: 'desc',
};

// Debounce Delays (milliseconds)
export const DEBOUNCE_DELAYS = {
  SEARCH: 300,
  INPUT: 500,
  RESIZE: 150,
};

// Validation Rules
export const VALIDATION = {
  PASSWORD_MIN_LENGTH: 8,
  PASSWORD_MAX_LENGTH: 128,
  NAME_MAX_LENGTH: 100,
  EMAIL_MAX_LENGTH: 255,
  PHONE_MAX_LENGTH: 20,
  NOTES_MAX_LENGTH: 1000,
  DESCRIPTION_MAX_LENGTH: 500,
};

// Toast Notification Types
export const TOAST_TYPES = {
  SUCCESS: 'success',
  ERROR: 'error',
  WARNING: 'warning',
  INFO: 'info',
};

// Stock Alert Thresholds
export const STOCK_THRESHOLDS = {
  LOW_STOCK: 10,
  CRITICAL_STOCK: 5,
  OUT_OF_STOCK: 0,
};

// Chart Colors
export const CHART_COLORS = {
  PRIMARY: '#1976d2',
  SECONDARY: '#dc004e',
  SUCCESS: '#4caf50',
  WARNING: '#ff9800',
  ERROR: '#f44336',
  INFO: '#2196f3',
  FRAME: '#1976d2',
  CONTACT_LENS: '#9c27b0',
  SOLUTION: '#ff9800',
  OTHER: '#607d8b',
  SUNGLASSES: '#00bcd4',
  EYEGLASS_LENS: '#8bc34a',
};

// File Export Formats
export const EXPORT_FORMATS = {
  CSV: 'csv',
  EXCEL: 'xlsx',
  PDF: 'pdf',
};

// Permission Checks
export const PERMISSIONS = {
  MANAGE_USERS: [USER_ROLES.ADMIN, USER_ROLES.OWNER],
  RESET_PASSWORD: [USER_ROLES.ADMIN],
  VIEW_STATISTICS_ALL: [USER_ROLES.ADMIN],
  VIEW_HISTORY_ALL: [USER_ROLES.ADMIN, USER_ROLES.OWNER],
  MANAGE_PRODUCTS: [USER_ROLES.ADMIN, USER_ROLES.OWNER, USER_ROLES.EMPLOYEE],
  RECORD_SALE: [USER_ROLES.ADMIN, USER_ROLES.OWNER, USER_ROLES.EMPLOYEE],
  TRANSFER_PRODUCTS: [USER_ROLES.ADMIN, USER_ROLES.OWNER, USER_ROLES.EMPLOYEE],
  REVERT_OPERATIONS: [USER_ROLES.ADMIN, USER_ROLES.OWNER, USER_ROLES.EMPLOYEE],
  MANAGE_BRANDS: [USER_ROLES.ADMIN, USER_ROLES.OWNER, USER_ROLES.EMPLOYEE],
  ADD_LOCATIONS: [USER_ROLES.ADMIN, USER_ROLES.OWNER],
  ACCESS_ALL_LOCATIONS: [USER_ROLES.ADMIN, USER_ROLES.OWNER],
};

// Local Storage Keys
export const STORAGE_KEYS = {
  ACCESS_TOKEN: 'accessToken',
  REFRESH_TOKEN: 'refreshToken',
  CURRENT_LOCATION: 'currentLocation',
  THEME_MODE: 'themeMode',
  SIDEBAR_COLLAPSED: 'sidebarCollapsed',
  TABLE_PREFERENCES: 'tablePreferences',
};

// Routes
export const ROUTES = {
  LOGIN: '/login',
  DASHBOARD: '/',
  USERS: '/users',
  USER_DETAILS: (id) => `/users/${id}`,
  CREATE_USER: '/users/create',
  PRODUCTS: '/products',
  PRODUCT_DETAILS: (id) => `/products/${id}`,
  CREATE_PRODUCT: '/products/create',
  INVENTORY: '/inventory',
  SALES: '/sales',
  SALE_DETAILS: (id) => `/sales/${id}`,
  CREATE_SALE: '/sales/create',
  TRANSFERS: '/transfers',
  TRANSFER_DETAILS: (id) => `/transfers/${id}`,
  CREATE_TRANSFER: '/transfers/create',
  HISTORY: '/history',
  BRANDS: '/brands',
  PROFILE: '/profile',
  CHANGE_PASSWORD: '/change-password',
  UNAUTHORIZED: '/unauthorized',
};
