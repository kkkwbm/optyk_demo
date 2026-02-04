import { http, HttpResponse, delay } from 'msw';
import { locations } from './data/locations';
import { products } from './data/products';
import { brands } from './data/brands';
import { inventory } from './data/inventory';
import { users, currentUser } from './data/users';
import { sales, calculateSalesStats } from './data/sales';
import { transfers, getPendingIncomingCount } from './data/transfers';

const API_BASE = 'http://localhost:8080/api/v1';

// Mutable copies of data for write operations (demo mode)
let mutableLocations = [...locations];
let mutableProducts = [...products];
let mutableBrands = [...brands];
let mutableInventory = [...inventory];
let mutableUsers = [...users];
let mutableSales = [...sales];
let mutableTransfers = [...transfers];
let companySettings = {
  companyName: 'Optyk Demo Sp. z o.o.',
  nip: '1234567890',
  address: 'ul. Przykładowa 1, 00-001 Warszawa',
  phone: '+48 22 123 45 67',
  email: 'kontakt@optyk-demo.pl',
  logoUrl: null
};

// Counter for generating IDs
let idCounters = {
  location: 6,
  product: 51,
  brand: 16,
  inventory: 400,
  user: 6,
  sale: 16,
  transfer: 24,
  saleItem: 30,
  transferItem: 50
};

// Helper to generate unique IDs
const generateId = (prefix) => {
  const count = idCounters[prefix] || 1;
  idCounters[prefix] = count + 1;
  return `${prefix}-${String(count).padStart(3, '0')}`;
};

// Helper to add inventory (shared logic)
const handleAddInventory = (data) => {
  const { productId, locationId, quantity } = data;

  // Check if inventory record exists
  const existingIndex = mutableInventory.findIndex(
    inv => inv.productId === productId && inv.locationId === locationId
  );

  if (existingIndex >= 0) {
    // Update existing inventory
    mutableInventory[existingIndex].quantity += quantity;
    return HttpResponse.json(apiResponse(mutableInventory[existingIndex]));
  }

  // Create new inventory record
  const newInventory = {
    id: generateId('inv'),
    productId,
    locationId,
    quantity,
    reservedQuantity: 0,
    minQuantity: data.minQuantity || 1
  };
  mutableInventory.push(newInventory);
  return HttpResponse.json(apiResponse(newInventory));
};

// Helper to create paginated response
const paginate = (items, page = 0, size = 20) => {
  const start = page * size;
  const end = start + size;
  const content = items.slice(start, end);
  return {
    content,
    page,
    size,
    totalElements: items.length,
    totalPages: Math.ceil(items.length / size)
  };
};

// Helper to sort inventory items
const sortInventory = (items, sortBy, sortDirection) => {
  if (!sortBy || !sortDirection) return items;

  const direction = sortDirection === 'desc' ? -1 : 1;

  return [...items].sort((a, b) => {
    let aVal, bVal;

    if (sortBy === 'quantity') {
      aVal = a.quantity || 0;
      bVal = b.quantity || 0;
    } else if (sortBy === 'product.sellingPrice' || sortBy === 'sellingPrice') {
      aVal = a.product?.sellingPrice || 0;
      bVal = b.product?.sellingPrice || 0;
    } else {
      return 0;
    }

    return (aVal - bVal) * direction;
  });
};

// Helper to create standard API response
const apiResponse = (data, success = true, error = null) => ({
  success,
  data,
  error,
  timestamp: new Date().toISOString()
});

// Helper to create error response
const errorResponse = (message, status = 400) => {
  return HttpResponse.json(apiResponse(null, false, message), { status });
};

// Helper for demo mode restriction - blocks all mutations
const demoRestricted = (operation) => {
  return errorResponse(`${operation} jest niedostępne w wersji demo`, 403);
};

// Helper to transform product to match expected UI structure
const transformProduct = (product) => {
  if (!product) return null;
  const brand = product.brandId ? mutableBrands.find(b => b.id === product.brandId) : null;

  // Fix lensType value for contact lenses
  let lensType = product.lensType;
  if (lensType === 'BIWEEKLY') lensType = 'BI_WEEKLY';

  // Add sample power for contact lenses (demo purposes)
  const samplePowers = ['-1.00', '-1.50', '-2.00', '-2.50', '-3.00', '-3.50', '-4.00', '+1.00', '+1.50', '+2.00'];
  const power = product.type === 'CONTACT_LENS'
    ? samplePowers[Math.abs(product.id.charCodeAt(product.id.length - 1)) % samplePowers.length]
    : product.power;

  return {
    ...product,
    model: product.name,
    brand: brand ? { id: brand.id, name: brand.name } : null,
    lensType,
    power
  };
};

// Helper to get product with inventory for a location
const getInventoryWithProducts = (locationId, productType = null, searchQuery = null) => {
  let invItems = locationId
    ? mutableInventory.filter(inv => inv.locationId === locationId)
    : mutableInventory;

  return invItems.map(inv => {
    const product = mutableProducts.find(p => p.id === inv.productId);
    if (!product) return null;
    if (productType && product.type !== productType) return null;

    // Search filter - match against brand, model, name, sku
    if (searchQuery) {
      const search = searchQuery.toLowerCase();
      const brandName = (product.brandName || '').toLowerCase();
      const model = (product.model || product.name || '').toLowerCase();
      const sku = (product.sku || '').toLowerCase();
      const color = (product.color || '').toLowerCase();

      const matches = brandName.includes(search) ||
                      model.includes(search) ||
                      sku.includes(search) ||
                      color.includes(search);
      if (!matches) return null;
    }

    const location = mutableLocations.find(l => l.id === inv.locationId);
    const availableQuantity = inv.quantity - (inv.reservedQuantity || 0);

    return {
      ...inv,
      availableQuantity,
      productType: product.type,
      product: transformProduct(product),
      location: location ? { id: location.id, name: location.name, type: location.type } : null
    };
  }).filter(Boolean);
};

export const handlers = [
  // ========== AUTH ENDPOINTS ==========
  http.post(`${API_BASE}/auth/login`, async () => {
    await delay(100);
    return HttpResponse.json(apiResponse({
      accessToken: 'demo-access-token',
      user: currentUser
    }));
  }),

  http.post(`${API_BASE}/auth/logout`, async () => {
    await delay(50);
    return HttpResponse.json(apiResponse({ message: 'Logged out successfully' }));
  }),

  http.post(`${API_BASE}/auth/refresh`, async () => {
    await delay(50);
    return HttpResponse.json(apiResponse({
      accessToken: 'demo-access-token-refreshed',
      user: currentUser
    }));
  }),

  http.get(`${API_BASE}/auth/me`, async () => {
    await delay(50);
    return HttpResponse.json(apiResponse(currentUser));
  }),

  http.get(`${API_BASE}/auth/csrf`, async () => {
    await delay(20);
    return HttpResponse.json(apiResponse({ token: 'demo-csrf-token' }));
  }),

  // ========== LOCATIONS ENDPOINTS ==========
  http.get(`${API_BASE}/locations`, async ({ request }) => {
    await delay(100);
    const url = new URL(request.url);
    const status = url.searchParams.get('status');
    const type = url.searchParams.get('type');
    const page = url.searchParams.get('page');
    const size = parseInt(url.searchParams.get('size') || '20');

    let filtered = [...mutableLocations];
    if (status) filtered = filtered.filter(l => l.status === status);
    if (type) filtered = filtered.filter(l => l.type === type);

    // If no pagination params, return array directly (for getActiveLocations)
    if (page === null) {
      return HttpResponse.json(apiResponse(filtered));
    }

    return HttpResponse.json(apiResponse(paginate(filtered, parseInt(page), size)));
  }),

  http.get(`${API_BASE}/locations/my-locations`, async () => {
    await delay(50);
    const activeLocations = mutableLocations.filter(l => l.status === 'ACTIVE');
    return HttpResponse.json(apiResponse(activeLocations));
  }),

  http.get(`${API_BASE}/locations/:id`, async ({ params }) => {
    await delay(50);
    const location = mutableLocations.find(l => l.id === params.id);
    if (!location) {
      return HttpResponse.json(apiResponse(null, false), { status: 404 });
    }
    return HttpResponse.json(apiResponse(location));
  }),

  http.get(`${API_BASE}/locations/:id/stats`, async ({ params }) => {
    await delay(100);
    const locationInv = mutableInventory.filter(inv => inv.locationId === params.id);
    const totalItems = locationInv.reduce((sum, inv) => sum + inv.quantity, 0);
    const totalValue = locationInv.reduce((sum, inv) => {
      const product = mutableProducts.find(p => p.id === inv.productId);
      return sum + (product ? product.sellingPrice * inv.quantity : 0);
    }, 0);

    return HttpResponse.json(apiResponse({
      totalProducts: locationInv.length,
      totalItems,
      totalValue,
      lowStockCount: locationInv.filter(inv => inv.quantity <= inv.minQuantity).length
    }));
  }),

  // Location mutations (create disabled in demo mode)
  http.post(`${API_BASE}/locations`, async () => {
    await delay(100);
    return errorResponse('Dodawanie lokalizacji jest niedostępne w wersji demo', 403);
  }),

  http.put(`${API_BASE}/locations/:id`, async ({ params, request }) => {
    await delay(100);
    const data = await request.json();
    const index = mutableLocations.findIndex(l => l.id === params.id);
    if (index === -1) {
      return errorResponse('Location not found', 404);
    }
    mutableLocations[index] = {
      ...mutableLocations[index],
      ...data,
      updatedAt: new Date().toISOString()
    };
    return HttpResponse.json(apiResponse(mutableLocations[index]));
  }),

  http.patch(`${API_BASE}/locations/:id/activate`, async ({ params }) => {
    await delay(50);
    const index = mutableLocations.findIndex(l => l.id === params.id);
    if (index === -1) {
      return errorResponse('Location not found', 404);
    }
    mutableLocations[index].status = 'ACTIVE';
    mutableLocations[index].updatedAt = new Date().toISOString();
    return HttpResponse.json(apiResponse(mutableLocations[index]));
  }),

  http.patch(`${API_BASE}/locations/:id/deactivate`, async ({ params }) => {
    await delay(50);
    const index = mutableLocations.findIndex(l => l.id === params.id);
    if (index === -1) {
      return errorResponse('Location not found', 404);
    }
    mutableLocations[index].status = 'INACTIVE';
    mutableLocations[index].updatedAt = new Date().toISOString();
    return HttpResponse.json(apiResponse(mutableLocations[index]));
  }),

  http.delete(`${API_BASE}/locations/:id`, async ({ params }) => {
    await delay(50);
    const index = mutableLocations.findIndex(l => l.id === params.id);
    if (index === -1) {
      return errorResponse('Location not found', 404);
    }
    mutableLocations.splice(index, 1);
    return HttpResponse.json(apiResponse({ message: 'Location deleted successfully' }));
  }),

  // ========== INVENTORY ENDPOINTS ==========
  http.get(`${API_BASE}/inventory`, async ({ request }) => {
    await delay(150);
    const url = new URL(request.url);
    const productType = url.searchParams.get('productType');
    const search = url.searchParams.get('search');
    const sortBy = url.searchParams.get('sortBy');
    const sortDirection = url.searchParams.get('sortDirection');
    const page = parseInt(url.searchParams.get('page') || '0');
    const size = parseInt(url.searchParams.get('size') || '20');

    let items = getInventoryWithProducts(null, productType, search);
    items = sortInventory(items, sortBy, sortDirection);
    return HttpResponse.json(apiResponse(paginate(items, page, size)));
  }),

  http.get(`${API_BASE}/inventory/location/:locationId`, async ({ params, request }) => {
    await delay(150);
    const url = new URL(request.url);
    const productType = url.searchParams.get('productType');
    const search = url.searchParams.get('search');
    const sortBy = url.searchParams.get('sortBy');
    const sortDirection = url.searchParams.get('sortDirection');
    const page = parseInt(url.searchParams.get('page') || '0');
    const size = parseInt(url.searchParams.get('size') || '20');

    let items = getInventoryWithProducts(params.locationId, productType, search);
    items = sortInventory(items, sortBy, sortDirection);
    return HttpResponse.json(apiResponse(paginate(items, page, size)));
  }),

  http.get(`${API_BASE}/inventory/summary`, async ({ request }) => {
    await delay(100);
    const url = new URL(request.url);
    const locationId = url.searchParams.get('locationId');
    const locationType = url.searchParams.get('locationType');

    let invItems = [...mutableInventory];

    // Filter by specific location
    if (locationId) {
      invItems = invItems.filter(inv => inv.locationId === locationId);
    }

    // Filter by location type (STORE or WAREHOUSE)
    if (locationType) {
      const locationIds = mutableLocations
        .filter(l => l.type === locationType && l.status === 'ACTIVE')
        .map(l => l.id);
      invItems = invItems.filter(inv => locationIds.includes(inv.locationId));
    }

    // Count by product type
    const counts = { FRAME: 0, SUNGLASSES: 0, CONTACT_LENS: 0, SOLUTION: 0, OTHER: 0 };
    const byBrand = { FRAME: {}, SUNGLASSES: {}, CONTACT_LENS: {} };
    const byLensType = {};

    invItems.forEach(inv => {
      const product = mutableProducts.find(p => p.id === inv.productId);
      if (product) {
        counts[product.type] = (counts[product.type] || 0) + inv.quantity;

        // Group by brand for frames, sunglasses, contact lenses
        if (['FRAME', 'SUNGLASSES', 'CONTACT_LENS'].includes(product.type) && product.brandName) {
          if (!byBrand[product.type][product.brandName]) {
            byBrand[product.type][product.brandName] = 0;
          }
          byBrand[product.type][product.brandName] += inv.quantity;
        }

        // Group contact lenses by type
        if (product.type === 'CONTACT_LENS' && product.lensType) {
          if (!byLensType[product.lensType]) {
            byLensType[product.lensType] = 0;
          }
          byLensType[product.lensType] += inv.quantity;
        }
      }
    });

    // Convert brand objects to arrays
    const framesByBrand = Object.entries(byBrand.FRAME).map(([brandName, count]) => ({ brandName, count }));
    const sunglassesByBrand = Object.entries(byBrand.SUNGLASSES).map(([brandName, count]) => ({ brandName, count }));
    const contactLensesByBrand = Object.entries(byBrand.CONTACT_LENS).map(([brandName, count]) => ({ brandName, count }));
    const contactLensesByType = Object.entries(byLensType).map(([lensType, count]) => ({ lensType, count }));

    const totalProducts = counts.FRAME + counts.SUNGLASSES + counts.CONTACT_LENS + counts.SOLUTION + counts.OTHER;

    return HttpResponse.json(apiResponse({
      totalProducts,
      totalFrames: counts.FRAME,
      totalSunglasses: counts.SUNGLASSES,
      totalContactLenses: counts.CONTACT_LENS,
      totalSolutions: counts.SOLUTION,
      totalOther: counts.OTHER,
      framesByBrand,
      sunglassesByBrand,
      contactLensesByBrand,
      contactLensesByType
    }));
  }),

  // Inventory mutations (all blocked in demo mode)
  http.post(`${API_BASE}/inventory`, async () => {
    await delay(50);
    return demoRestricted('Dodawanie do magazynu');
  }),

  http.post(`${API_BASE}/inventory/reserve`, async () => {
    await delay(50);
    return demoRestricted('Rezerwacja produktów');
  }),

  http.post(`${API_BASE}/inventory/release`, async () => {
    await delay(50);
    return demoRestricted('Zwalnianie rezerwacji');
  }),

  http.patch(`${API_BASE}/inventory/products/:productId/locations/:locationId/min-stock`, async () => {
    await delay(50);
    return demoRestricted('Zmiana minimalnego stanu');
  }),

  http.post(`${API_BASE}/inventory/batch-adjust`, async () => {
    await delay(50);
    return demoRestricted('Korekta magazynowa');
  }),

  // ========== PRODUCTS ENDPOINTS ==========
  // Frames
  http.get(`${API_BASE}/frames`, async ({ request }) => {
    await delay(100);
    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get('page') || '0');
    const size = parseInt(url.searchParams.get('size') || '20');
    const brandId = url.searchParams.get('brandId');

    let filtered = mutableProducts.filter(p => p.type === 'FRAME' && p.status === 'ACTIVE');
    if (brandId) filtered = filtered.filter(p => p.brandId === brandId);

    const transformed = filtered.map(transformProduct);
    return HttpResponse.json(apiResponse(paginate(transformed, page, size)));
  }),

  http.get(`${API_BASE}/frames/:id`, async ({ params }) => {
    await delay(50);
    const product = mutableProducts.find(p => p.id === params.id && p.type === 'FRAME');
    if (!product) {
      return HttpResponse.json(apiResponse(null, false), { status: 404 });
    }
    return HttpResponse.json(apiResponse(transformProduct(product)));
  }),

  // Contact Lenses
  http.get(`${API_BASE}/contact-lenses`, async ({ request }) => {
    await delay(100);
    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get('page') || '0');
    const size = parseInt(url.searchParams.get('size') || '20');

    const filtered = mutableProducts.filter(p => p.type === 'CONTACT_LENS' && p.status === 'ACTIVE');
    const transformed = filtered.map(transformProduct);
    return HttpResponse.json(apiResponse(paginate(transformed, page, size)));
  }),

  http.get(`${API_BASE}/contact-lenses/:id`, async ({ params }) => {
    await delay(50);
    const product = mutableProducts.find(p => p.id === params.id && p.type === 'CONTACT_LENS');
    if (!product) {
      return HttpResponse.json(apiResponse(null, false), { status: 404 });
    }
    return HttpResponse.json(apiResponse(transformProduct(product)));
  }),

  // Solutions
  http.get(`${API_BASE}/solutions`, async ({ request }) => {
    await delay(100);
    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get('page') || '0');
    const size = parseInt(url.searchParams.get('size') || '20');

    const filtered = mutableProducts.filter(p => p.type === 'SOLUTION' && p.status === 'ACTIVE');
    const transformed = filtered.map(transformProduct);
    return HttpResponse.json(apiResponse(paginate(transformed, page, size)));
  }),

  http.get(`${API_BASE}/solutions/:id`, async ({ params }) => {
    await delay(50);
    const product = mutableProducts.find(p => p.id === params.id && p.type === 'SOLUTION');
    if (!product) {
      return HttpResponse.json(apiResponse(null, false), { status: 404 });
    }
    return HttpResponse.json(apiResponse(transformProduct(product)));
  }),

  // Sunglasses
  http.get(`${API_BASE}/sunglasses`, async ({ request }) => {
    await delay(100);
    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get('page') || '0');
    const size = parseInt(url.searchParams.get('size') || '20');

    const filtered = mutableProducts.filter(p => p.type === 'SUNGLASSES' && p.status === 'ACTIVE');
    const transformed = filtered.map(transformProduct);
    return HttpResponse.json(apiResponse(paginate(transformed, page, size)));
  }),

  http.get(`${API_BASE}/sunglasses/:id`, async ({ params }) => {
    await delay(50);
    const product = mutableProducts.find(p => p.id === params.id && p.type === 'SUNGLASSES');
    if (!product) {
      return HttpResponse.json(apiResponse(null, false), { status: 404 });
    }
    return HttpResponse.json(apiResponse(transformProduct(product)));
  }),

  // Other products
  http.get(`${API_BASE}/other-products`, async ({ request }) => {
    await delay(100);
    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get('page') || '0');
    const size = parseInt(url.searchParams.get('size') || '20');

    const filtered = mutableProducts.filter(p => p.type === 'OTHER' && p.status === 'ACTIVE');
    const transformed = filtered.map(transformProduct);
    return HttpResponse.json(apiResponse(paginate(transformed, page, size)));
  }),

  http.get(`${API_BASE}/other-products/:id`, async ({ params }) => {
    await delay(50);
    const product = mutableProducts.find(p => p.id === params.id && p.type === 'OTHER');
    if (!product) {
      return HttpResponse.json(apiResponse(null, false), { status: 404 });
    }
    return HttpResponse.json(apiResponse(transformProduct(product)));
  }),

  // All products
  http.get(`${API_BASE}/products`, async ({ request }) => {
    await delay(100);
    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get('page') || '0');
    const size = parseInt(url.searchParams.get('size') || '20');
    const type = url.searchParams.get('type');

    let filtered = mutableProducts.filter(p => p.status === 'ACTIVE');
    if (type) filtered = filtered.filter(p => p.type === type);

    const transformed = filtered.map(transformProduct);
    return HttpResponse.json(apiResponse(paginate(transformed, page, size)));
  }),

  http.get(`${API_BASE}/products/search`, async ({ request }) => {
    await delay(100);
    const url = new URL(request.url);
    const query = (url.searchParams.get('query') || '').toLowerCase();
    const page = parseInt(url.searchParams.get('page') || '0');
    const size = parseInt(url.searchParams.get('size') || '20');

    const filtered = mutableProducts.filter(p =>
      p.status === 'ACTIVE' && (
        p.name.toLowerCase().includes(query) ||
        p.sku.toLowerCase().includes(query) ||
        (p.brandName && p.brandName.toLowerCase().includes(query))
      )
    );

    const transformed = filtered.map(transformProduct);
    return HttpResponse.json(apiResponse(paginate(transformed, page, size)));
  }),

  // Product mutations (all blocked in demo mode)
  http.post(`${API_BASE}/frames`, async () => {
    await delay(50);
    return demoRestricted('Dodawanie produktów');
  }),

  http.post(`${API_BASE}/contact-lenses`, async () => {
    await delay(50);
    return demoRestricted('Dodawanie produktów');
  }),

  http.post(`${API_BASE}/solutions`, async () => {
    await delay(50);
    return demoRestricted('Dodawanie produktów');
  }),

  http.post(`${API_BASE}/sunglasses`, async () => {
    await delay(50);
    return demoRestricted('Dodawanie produktów');
  }),

  http.post(`${API_BASE}/other-products`, async () => {
    await delay(50);
    return demoRestricted('Dodawanie produktów');
  }),

  // Update product endpoints (all blocked in demo mode)
  http.put(`${API_BASE}/frames/:id`, async () => {
    await delay(50);
    return demoRestricted('Edycja produktów');
  }),

  http.put(`${API_BASE}/contact-lenses/:id`, async () => {
    await delay(50);
    return demoRestricted('Edycja produktów');
  }),

  http.put(`${API_BASE}/solutions/:id`, async () => {
    await delay(50);
    return demoRestricted('Edycja produktów');
  }),

  http.put(`${API_BASE}/sunglasses/:id`, async () => {
    await delay(50);
    return demoRestricted('Edycja produktów');
  }),

  http.put(`${API_BASE}/other-products/:id`, async () => {
    await delay(50);
    return demoRestricted('Edycja produktów');
  }),

  // Delete product endpoints (all blocked in demo mode)
  http.delete(`${API_BASE}/frames/:id`, async () => {
    await delay(50);
    return demoRestricted('Usuwanie produktów');
  }),

  http.delete(`${API_BASE}/contact-lenses/:id`, async () => {
    await delay(50);
    return demoRestricted('Usuwanie produktów');
  }),

  http.delete(`${API_BASE}/solutions/:id`, async () => {
    await delay(50);
    return demoRestricted('Usuwanie produktów');
  }),

  http.delete(`${API_BASE}/sunglasses/:id`, async () => {
    await delay(50);
    return demoRestricted('Usuwanie produktów');
  }),

  http.delete(`${API_BASE}/other-products/:id`, async () => {
    await delay(50);
    return demoRestricted('Usuwanie produktów');
  }),

  // Restore product endpoints (all blocked in demo mode)
  http.patch(`${API_BASE}/frames/:id/restore`, async () => {
    await delay(50);
    return demoRestricted('Przywracanie produktów');
  }),

  http.patch(`${API_BASE}/contact-lenses/:id/restore`, async () => {
    await delay(50);
    return demoRestricted('Przywracanie produktów');
  }),

  http.patch(`${API_BASE}/solutions/:id/restore`, async () => {
    await delay(50);
    return demoRestricted('Przywracanie produktów');
  }),

  http.patch(`${API_BASE}/sunglasses/:id/restore`, async () => {
    await delay(50);
    return demoRestricted('Przywracanie produktów');
  }),

  http.patch(`${API_BASE}/other-products/:id/restore`, async () => {
    await delay(50);
    return demoRestricted('Przywracanie produktów');
  }),

  // Bulk operations (all blocked in demo mode)
  http.post(`${API_BASE}/frames/bulk-delete`, async () => {
    await delay(50);
    return demoRestricted('Masowe usuwanie produktów');
  }),

  http.post(`${API_BASE}/frames/bulk-restore`, async () => {
    await delay(50);
    return demoRestricted('Masowe przywracanie produktów');
  }),

  // Product search (POST variant)
  http.post(`${API_BASE}/frames/search`, async ({ request }) => {
    await delay(100);
    const filters = await request.json();
    let filtered = mutableProducts.filter(p => p.type === 'FRAME' && p.status === 'ACTIVE');
    if (filters.brandId) filtered = filtered.filter(p => p.brandId === filters.brandId);
    if (filters.color) filtered = filtered.filter(p => p.color?.toLowerCase().includes(filters.color.toLowerCase()));
    const transformed = filtered.map(transformProduct);
    return HttpResponse.json(apiResponse(paginate(transformed, filters.page || 0, filters.size || 20)));
  }),

  // ========== BRANDS ENDPOINTS ==========
  http.get(`${API_BASE}/brands`, async ({ request }) => {
    await delay(80);
    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get('page') || '0');
    const size = parseInt(url.searchParams.get('size') || '50');
    const active = url.searchParams.get('isActive');

    let filtered = [...mutableBrands];
    if (active === 'true') filtered = filtered.filter(b => b.isActive);

    return HttpResponse.json(apiResponse(paginate(filtered, page, size)));
  }),

  http.get(`${API_BASE}/brands/:id`, async ({ params }) => {
    await delay(50);
    const brand = mutableBrands.find(b => b.id === params.id);
    if (!brand) {
      return HttpResponse.json(apiResponse(null, false), { status: 404 });
    }
    return HttpResponse.json(apiResponse(brand));
  }),

  // Brand mutations (disabled in demo mode)
  http.post(`${API_BASE}/brands`, async () => {
    await delay(100);
    return errorResponse('Dodawanie marek jest niedostępne w wersji demo', 403);
  }),

  http.put(`${API_BASE}/brands/:id`, async () => {
    await delay(100);
    return errorResponse('Edycja marek jest niedostępna w wersji demo', 403);
  }),

  http.patch(`${API_BASE}/brands/:id/activate`, async () => {
    await delay(50);
    return errorResponse('Aktywacja marek jest niedostępna w wersji demo', 403);
  }),

  http.patch(`${API_BASE}/brands/:id/deactivate`, async () => {
    await delay(50);
    return errorResponse('Dezaktywacja marek jest niedostępna w wersji demo', 403);
  }),

  http.delete(`${API_BASE}/brands/:id`, async () => {
    await delay(50);
    return errorResponse('Usuwanie marek jest niedostępne w wersji demo', 403);
  }),

  // ========== USERS ENDPOINTS ==========
  http.get(`${API_BASE}/users`, async ({ request }) => {
    await delay(100);
    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get('page') || '0');
    const size = parseInt(url.searchParams.get('size') || '20');

    return HttpResponse.json(apiResponse(paginate(mutableUsers, page, size)));
  }),

  http.get(`${API_BASE}/users/:id`, async ({ params }) => {
    await delay(50);
    const user = mutableUsers.find(u => u.id === params.id);
    if (!user) {
      return HttpResponse.json(apiResponse(null, false), { status: 404 });
    }
    return HttpResponse.json(apiResponse(user));
  }),

  // User mutations (disabled in demo mode)
  http.post(`${API_BASE}/users`, async () => {
    await delay(100);
    return errorResponse('Tworzenie użytkowników jest niedostępne w wersji demo', 403);
  }),

  http.put(`${API_BASE}/users/:id`, async () => {
    await delay(100);
    return errorResponse('Edycja użytkowników jest niedostępna w wersji demo', 403);
  }),

  http.patch(`${API_BASE}/users/:id/activate`, async () => {
    await delay(50);
    return errorResponse('Aktywacja użytkowników jest niedostępna w wersji demo', 403);
  }),

  http.patch(`${API_BASE}/users/:id/deactivate`, async () => {
    await delay(50);
    return errorResponse('Dezaktywacja użytkowników jest niedostępna w wersji demo', 403);
  }),

  http.delete(`${API_BASE}/users/:id`, async () => {
    await delay(50);
    return errorResponse('Usuwanie użytkowników jest niedostępne w wersji demo', 403);
  }),

  http.patch(`${API_BASE}/users/:id/reset-password`, async () => {
    await delay(100);
    return errorResponse('Resetowanie hasła jest niedostępne w wersji demo', 403);
  }),

  http.delete(`${API_BASE}/users/:userId/locations/:locationId`, async ({ params }) => {
    await delay(50);
    const index = mutableUsers.findIndex(u => u.id === params.userId);
    if (index === -1) {
      return errorResponse('User not found', 404);
    }
    mutableUsers[index].locations = mutableUsers[index].locations.filter(
      l => l !== params.locationId
    );
    return HttpResponse.json(apiResponse(mutableUsers[index]));
  }),

  http.put(`${API_BASE}/users/:userId/locations/:locationId/permissions`, async ({ params, request }) => {
    await delay(50);
    const { allowedTabs } = await request.json();
    // In demo mode, just acknowledge the update
    return HttpResponse.json(apiResponse({ message: 'Permissions updated successfully', allowedTabs }));
  }),

  http.post(`${API_BASE}/users/:userId/locations`, async ({ params, request }) => {
    await delay(50);
    const data = await request.json();
    const index = mutableUsers.findIndex(u => u.id === params.userId);
    if (index === -1) {
      return errorResponse('User not found', 404);
    }
    if (!mutableUsers[index].locations.includes(data.locationId)) {
      mutableUsers[index].locations.push(data.locationId);
    }
    return HttpResponse.json(apiResponse(mutableUsers[index]));
  }),

  http.patch(`${API_BASE}/users/me/theme`, async ({ request }) => {
    await delay(50);
    const { themePreference } = await request.json();
    // Update the current user's theme
    mutableUsers[0].themePreference = themePreference;
    return HttpResponse.json(apiResponse({ themePreference }));
  }),

  http.patch(`${API_BASE}/users/me/password`, async () => {
    await delay(100);
    // In demo mode, just acknowledge the password change
    return HttpResponse.json(apiResponse({ message: 'Password changed successfully' }));
  }),

  // ========== TRANSFERS ENDPOINTS ==========
  http.get(`${API_BASE}/transfers`, async ({ request }) => {
    await delay(100);
    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get('page') || '0');
    const size = parseInt(url.searchParams.get('size') || '20');
    const status = url.searchParams.get('status');
    const fromLocationId = url.searchParams.get('fromLocationId');
    const toLocationId = url.searchParams.get('toLocationId');
    const fromLocationIds = url.searchParams.get('fromLocationIds'); // Multiple, comma-separated
    const toLocationIds = url.searchParams.get('toLocationIds'); // Multiple, comma-separated
    const locationId = url.searchParams.get('locationId');
    const startDate = url.searchParams.get('startDate');
    const endDate = url.searchParams.get('endDate');
    const search = url.searchParams.get('search');

    let filtered = [...mutableTransfers];

    // Filter by status
    if (status) filtered = filtered.filter(t => t.status === status);

    // Filter by single fromLocationId
    if (fromLocationId) filtered = filtered.filter(t => t.fromLocationId === fromLocationId);

    // Filter by multiple fromLocationIds (comma-separated)
    if (fromLocationIds) {
      const fromIds = fromLocationIds.split(',').map(id => id.trim());
      filtered = filtered.filter(t => fromIds.includes(t.fromLocationId));
    }

    // Filter by single toLocationId
    if (toLocationId) filtered = filtered.filter(t => t.toLocationId === toLocationId);

    // Filter by multiple toLocationIds (comma-separated)
    if (toLocationIds) {
      const toIds = toLocationIds.split(',').map(id => id.trim());
      filtered = filtered.filter(t => toIds.includes(t.toLocationId));
    }

    // Filter by locationId (matches either from or to)
    if (locationId && locationId !== 'ALL_STORES') {
      filtered = filtered.filter(t => t.fromLocationId === locationId || t.toLocationId === locationId);
    }

    // Filter by date range
    if (startDate) {
      filtered = filtered.filter(t => t.createdAt >= startDate);
    }
    if (endDate) {
      const endDateTime = endDate + 'T23:59:59Z';
      filtered = filtered.filter(t => t.createdAt <= endDateTime);
    }

    // Search filter (by transfer number, location names, user name)
    if (search) {
      const searchLower = search.toLowerCase();
      filtered = filtered.filter(t => {
        const transferNumber = (t.transferNumber || '').toLowerCase();
        const fromLocationName = (t.fromLocation?.name || '').toLowerCase();
        const toLocationName = (t.toLocation?.name || '').toLowerCase();
        const createdByName = `${t.createdBy?.firstName || ''} ${t.createdBy?.lastName || ''}`.toLowerCase();

        return transferNumber.includes(searchLower) ||
               fromLocationName.includes(searchLower) ||
               toLocationName.includes(searchLower) ||
               createdByName.includes(searchLower);
      });
    }

    // Sort by date descending
    filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    // Transform products in items and add user field for display
    const transformed = filtered.map(t => ({
      ...t,
      user: t.createdBy, // Map createdBy to user for display
      items: t.items.map(item => ({
        ...item,
        product: transformProduct(item.product)
      }))
    }));

    return HttpResponse.json(apiResponse(paginate(transformed, page, size)));
  }),

  http.get(`${API_BASE}/transfers/:id`, async ({ params }) => {
    await delay(50);
    const transfer = mutableTransfers.find(t => t.id === params.id);
    if (!transfer) {
      return HttpResponse.json(apiResponse(null, false), { status: 404 });
    }
    const transformed = {
      ...transfer,
      user: transfer.createdBy,
      items: transfer.items.map(item => ({
        ...item,
        product: transformProduct(item.product)
      }))
    };
    return HttpResponse.json(apiResponse(transformed));
  }),

  http.get(`${API_BASE}/transfers/incoming`, async ({ request }) => {
    await delay(100);
    const url = new URL(request.url);
    const locationId = url.searchParams.get('locationId');
    const status = url.searchParams.get('status');

    let filtered = mutableTransfers.filter(t => t.toLocationId === locationId);
    if (status) filtered = filtered.filter(t => t.status === status);

    filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    const transformed = filtered.map(t => ({
      ...t,
      user: t.createdBy,
      items: t.items.map(item => ({
        ...item,
        product: transformProduct(item.product)
      }))
    }));

    return HttpResponse.json(apiResponse(transformed));
  }),

  http.get(`${API_BASE}/transfers/outgoing`, async ({ request }) => {
    await delay(100);
    const url = new URL(request.url);
    const locationId = url.searchParams.get('locationId');
    const status = url.searchParams.get('status');

    let filtered = mutableTransfers.filter(t => t.fromLocationId === locationId);
    if (status) filtered = filtered.filter(t => t.status === status);

    filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    const transformed = filtered.map(t => ({
      ...t,
      user: t.createdBy,
      items: t.items.map(item => ({
        ...item,
        product: transformProduct(item.product)
      }))
    }));

    return HttpResponse.json(apiResponse(transformed));
  }),

  http.get(`${API_BASE}/transfers/incoming/pending/count`, async ({ request }) => {
    await delay(50);
    const url = new URL(request.url);
    const locationId = url.searchParams.get('locationId');
    const count = mutableTransfers.filter(t => t.toLocationId === locationId && t.status === 'PENDING').length;
    return HttpResponse.json(apiResponse({ count }));
  }),

  http.get(`${API_BASE}/transfers/recent`, async ({ request }) => {
    await delay(100);
    const url = new URL(request.url);
    const limit = parseInt(url.searchParams.get('limit') || '10');
    const locationId = url.searchParams.get('locationId');

    let filtered = [...mutableTransfers];
    if (locationId) {
      filtered = filtered.filter(t => t.fromLocationId === locationId || t.toLocationId === locationId);
    }

    filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    filtered = filtered.slice(0, limit);

    const transformed = filtered.map(t => ({
      ...t,
      user: t.createdBy,
      items: t.items.map(item => ({
        ...item,
        product: transformProduct(item.product)
      }))
    }));

    return HttpResponse.json(apiResponse(transformed));
  }),

  // Transfer mutations (all blocked in demo mode)
  http.post(`${API_BASE}/transfers`, async () => {
    await delay(50);
    return demoRestricted('Tworzenie transferów');
  }),

  http.put(`${API_BASE}/transfers/:id/confirm`, async () => {
    await delay(50);
    return demoRestricted('Potwierdzanie transferów');
  }),

  http.put(`${API_BASE}/transfers/:id/reject`, async () => {
    await delay(50);
    return demoRestricted('Odrzucanie transferów');
  }),

  http.put(`${API_BASE}/transfers/:id/cancel`, async () => {
    await delay(50);
    return demoRestricted('Anulowanie transferów');
  }),

  http.post(`${API_BASE}/transfers/validate`, async ({ request }) => {
    await delay(50);
    const data = await request.json();
    // Validation is read-only, so it's allowed in demo mode
    const issues = [];
    for (const item of data.items) {
      const inv = mutableInventory.find(
        i => i.productId === item.productId && i.locationId === data.fromLocationId
      );
      if (!inv) {
        issues.push({ productId: item.productId, message: 'Product not found in source location' });
      } else {
        const available = inv.quantity - (inv.reservedQuantity || 0);
        if (item.quantity > available) {
          issues.push({ productId: item.productId, message: `Insufficient stock. Available: ${available}` });
        }
      }
    }
    return HttpResponse.json(apiResponse({ valid: issues.length === 0, issues }));
  }),

  http.patch(`${API_BASE}/transfers/:id`, async () => {
    await delay(50);
    return demoRestricted('Edycja transferów');
  }),

  http.delete(`${API_BASE}/transfers/:id`, async () => {
    await delay(50);
    return demoRestricted('Usuwanie transferów');
  }),

  // ========== SALES ENDPOINTS ==========
  http.get(`${API_BASE}/sales`, async ({ request }) => {
    await delay(100);
    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get('page') || '0');
    const size = parseInt(url.searchParams.get('size') || '20');
    const locationId = url.searchParams.get('locationId');
    const status = url.searchParams.get('status');
    const statuses = url.searchParams.get('statuses'); // Multiple statuses comma-separated
    const productTypes = url.searchParams.get('productTypes'); // Multiple types comma-separated
    const startDate = url.searchParams.get('startDate');
    const endDate = url.searchParams.get('endDate');
    const search = url.searchParams.get('search');

    let filtered = [...mutableSales];

    // Filter by location
    if (locationId) filtered = filtered.filter(s => s.locationId === locationId);

    // Filter by status (single or multiple)
    if (statuses) {
      const statusList = statuses.split(',').map(s => s.trim());
      filtered = filtered.filter(s => statusList.includes(s.status));
    } else if (status) {
      filtered = filtered.filter(s => s.status === status);
    }

    // Filter by product types (check if any sale item matches the product type)
    if (productTypes) {
      const typeList = productTypes.split(',').map(t => t.trim());
      filtered = filtered.filter(s =>
        s.items.some(item => {
          const product = item.product || mutableProducts.find(p => p.id === item.productId);
          return product && typeList.includes(product.type);
        })
      );
    }

    // Filter by date range
    if (startDate) {
      filtered = filtered.filter(s => s.createdAt >= startDate);
    }
    if (endDate) {
      // Add time to include the whole end date day
      const endDateTime = endDate + 'T23:59:59Z';
      filtered = filtered.filter(s => s.createdAt <= endDateTime);
    }

    // Search filter (by sale number, customer name, salesperson name, location name)
    if (search) {
      const searchLower = search.toLowerCase();
      filtered = filtered.filter(s => {
        const saleNumber = (s.saleNumber || '').toLowerCase();
        const customerName = `${s.customerFirstName || ''} ${s.customerLastName || ''}`.toLowerCase();
        const userFullName = (s.userFullName || '').toLowerCase();
        const locationName = (s.location?.name || '').toLowerCase();

        return saleNumber.includes(searchLower) ||
               customerName.includes(searchLower) ||
               userFullName.includes(searchLower) ||
               locationName.includes(searchLower);
      });
    }

    // Sort by date descending
    filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    // Transform products in items
    const transformed = filtered.map(s => ({
      ...s,
      items: s.items.map(item => ({
        ...item,
        product: transformProduct(item.product)
      }))
    }));

    return HttpResponse.json(apiResponse(paginate(transformed, page, size)));
  }),

  http.get(`${API_BASE}/sales/:id`, async ({ params }) => {
    await delay(50);
    const sale = mutableSales.find(s => s.id === params.id);
    if (!sale) {
      return HttpResponse.json(apiResponse(null, false), { status: 404 });
    }
    const transformed = {
      ...sale,
      items: sale.items.map(item => ({
        ...item,
        product: transformProduct(item.product)
      }))
    };
    return HttpResponse.json(apiResponse(transformed));
  }),

  http.get(`${API_BASE}/sales/stats`, async ({ request }) => {
    await delay(100);
    const url = new URL(request.url);
    const locationId = url.searchParams.get('locationId');
    const stats = calculateSalesStats(mutableSales, locationId);
    return HttpResponse.json(apiResponse(stats));
  }),

  http.get(`${API_BASE}/sales/recent`, async ({ request }) => {
    await delay(100);
    const url = new URL(request.url);
    const limit = parseInt(url.searchParams.get('limit') || '10');
    const locationId = url.searchParams.get('locationId');

    let filtered = [...mutableSales];
    if (locationId) filtered = filtered.filter(s => s.locationId === locationId);

    filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    filtered = filtered.slice(0, limit);

    const transformed = filtered.map(s => ({
      ...s,
      items: s.items.map(item => ({
        ...item,
        product: transformProduct(item.product)
      }))
    }));

    return HttpResponse.json(apiResponse(transformed));
  }),

  http.get(`${API_BASE}/sales/today`, async ({ request }) => {
    await delay(100);
    const url = new URL(request.url);
    const locationId = url.searchParams.get('locationId');

    const today = new Date().toISOString().split('T')[0];
    let filtered = mutableSales.filter(s => s.createdAt.startsWith(today));
    if (locationId) filtered = filtered.filter(s => s.locationId === locationId);

    const transformed = filtered.map(s => ({
      ...s,
      items: s.items.map(item => ({
        ...item,
        product: transformProduct(item.product)
      }))
    }));

    return HttpResponse.json(apiResponse(transformed));
  }),

  // Sales mutations (all blocked in demo mode)
  http.post(`${API_BASE}/sales`, async () => {
    await delay(50);
    return demoRestricted('Rejestrowanie sprzedaży');
  }),

  http.post(`${API_BASE}/sales/:id/cancel`, async () => {
    await delay(50);
    return demoRestricted('Anulowanie sprzedaży');
  }),

  http.post(`${API_BASE}/sales/:id/return`, async () => {
    await delay(50);
    return demoRestricted('Zwrot sprzedaży');
  }),

  // ========== HISTORY ENDPOINTS ==========
  http.get(`${API_BASE}/history`, async ({ request }) => {
    await delay(100);
    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get('page') || '0');
    const size = parseInt(url.searchParams.get('size') || '20');
    const locationId = url.searchParams.get('locationId');
    const locationType = url.searchParams.get('locationType');
    const operationTypes = url.searchParams.get('operationTypes');
    const entityTypes = url.searchParams.get('entityTypes');
    const startDate = url.searchParams.get('startDate');
    const endDate = url.searchParams.get('endDate');
    const search = url.searchParams.get('search');

    // Debug logging for filters
    console.log('[MSW History] Received filters:', {
      operationTypes,
      entityTypes,
      locationId,
      locationType,
      startDate,
      endDate,
      search
    });

    // Generate comprehensive mock history data
    const history = [];

    // Helper to get random date in last 30 days
    const getRandomDate = (daysAgo = 30) => {
      const date = new Date();
      date.setDate(date.getDate() - Math.floor(Math.random() * daysAgo));
      date.setHours(Math.floor(Math.random() * 14) + 8); // 8:00 - 22:00
      date.setMinutes(Math.floor(Math.random() * 60));
      return date.toISOString();
    };

    // Add product CREATE operations
    mutableProducts.slice(0, 15).forEach((product, index) => {
      const loc = mutableLocations[index % mutableLocations.length];
      history.push({
        id: `hist-create-${product.id}`,
        operationType: 'CREATE',
        entityType: product.type,
        entityId: product.id,
        reason: `Dodano nowy produkt: ${product.brandName || ''} ${product.name}`,
        locationId: loc?.id,
        location: loc,
        relatedLocationId: null,
        relatedLocation: null,
        userId: currentUser.id,
        userFullName: `${currentUser.firstName} ${currentUser.lastName}`,
        operationTimestamp: getRandomDate(25),
        canRevert: true,
        oldValues: null,
        newValues: JSON.stringify({
          name: product.name,
          brandName: product.brandName,
          sku: product.sku,
          purchasePrice: product.purchasePrice,
          sellingPrice: product.sellingPrice
        })
      });
    });

    // Add product UPDATE operations
    mutableProducts.slice(5, 12).forEach((product, index) => {
      const loc = mutableLocations[index % mutableLocations.length];
      const oldPrice = (product.sellingPrice * 0.9).toFixed(2);
      history.push({
        id: `hist-update-${product.id}`,
        operationType: 'UPDATE',
        entityType: product.type,
        entityId: product.id,
        reason: `Zaktualizowano cenę produktu ${product.brandName || ''} ${product.name}`,
        locationId: loc?.id,
        location: loc,
        relatedLocationId: null,
        relatedLocation: null,
        userId: currentUser.id,
        userFullName: `${currentUser.firstName} ${currentUser.lastName}`,
        operationTimestamp: getRandomDate(15),
        canRevert: true,
        oldValues: JSON.stringify({ sellingPrice: parseFloat(oldPrice) }),
        newValues: JSON.stringify({ sellingPrice: product.sellingPrice })
      });
    });

    // Add product DELETE operations
    mutableProducts.slice(20, 23).forEach((product, index) => {
      const loc = mutableLocations[index % mutableLocations.length];
      history.push({
        id: `hist-delete-${product.id}`,
        operationType: 'DELETE',
        entityType: product.type,
        entityId: product.id,
        reason: `Usunięto produkt: ${product.brandName || ''} ${product.name}`,
        locationId: loc?.id,
        location: loc,
        relatedLocationId: null,
        relatedLocation: null,
        userId: mutableUsers[1]?.id || currentUser.id,
        userFullName: mutableUsers[1] ? `${mutableUsers[1].firstName} ${mutableUsers[1].lastName}` : `${currentUser.firstName} ${currentUser.lastName}`,
        operationTimestamp: getRandomDate(20),
        canRevert: true,
        oldValues: JSON.stringify({
          name: product.name,
          brandName: product.brandName,
          status: 'ACTIVE'
        }),
        newValues: JSON.stringify({ status: 'DELETED' })
      });
    });

    // Add sales as history entries
    mutableSales.forEach(sale => {
      history.push({
        id: `hist-sale-${sale.id}`,
        operationType: 'SALE',
        entityType: 'SALE',
        entityId: sale.id,
        reason: `Sprzedaż ${sale.saleNumber} - ${sale.totalAmount.toFixed(2)} zł (${sale.items.length} produktów)`,
        locationId: sale.locationId,
        location: sale.location,
        relatedLocationId: null,
        relatedLocation: null,
        userId: sale.userId,
        userFullName: sale.userFullName || `${sale.user?.firstName || ''} ${sale.user?.lastName || ''}`.trim(),
        operationTimestamp: sale.createdAt,
        canRevert: sale.status === 'COMPLETED',
        oldValues: null,
        newValues: JSON.stringify({
          saleNumber: sale.saleNumber,
          totalAmount: sale.totalAmount,
          itemCount: sale.items.length,
          paymentMethod: sale.paymentMethod
        })
      });
    });

    // Add transfers as history entries
    mutableTransfers.forEach(transfer => {
      let opType = 'TRANSFER_INITIATED';
      if (transfer.status === 'COMPLETED') opType = 'TRANSFER_CONFIRMED';
      else if (transfer.status === 'REJECTED') opType = 'TRANSFER_REJECTED';
      else if (transfer.status === 'CANCELLED') opType = 'TRANSFER_CANCELLED';

      history.push({
        id: `hist-transfer-${transfer.id}`,
        operationType: opType,
        entityType: 'TRANSFER',
        entityId: transfer.id,
        reason: `Transfer ${transfer.transferNumber}: ${transfer.fromLocation?.name} → ${transfer.toLocation?.name} (${transfer.items.length} produktów)`,
        locationId: transfer.fromLocationId,
        location: transfer.fromLocation,
        relatedLocationId: transfer.toLocationId,
        relatedLocation: transfer.toLocation,
        userId: transfer.createdById,
        userFullName: `${transfer.createdBy?.firstName || ''} ${transfer.createdBy?.lastName || ''}`.trim(),
        operationTimestamp: transfer.createdAt,
        canRevert: transfer.status === 'COMPLETED',
        oldValues: null,
        newValues: JSON.stringify({
          transferNumber: transfer.transferNumber,
          status: transfer.status,
          itemCount: transfer.items.length
        })
      });
    });

    // Add brand operations
    mutableBrands.slice(0, 5).forEach((brand, index) => {
      const loc = mutableLocations[0];
      history.push({
        id: `hist-brand-create-${brand.id}`,
        operationType: 'CREATE',
        entityType: 'BRAND',
        entityId: brand.id,
        reason: `Dodano nową markę: ${brand.name}`,
        locationId: loc?.id,
        location: loc,
        relatedLocationId: null,
        relatedLocation: null,
        userId: currentUser.id,
        userFullName: `${currentUser.firstName} ${currentUser.lastName}`,
        operationTimestamp: getRandomDate(28),
        canRevert: false,
        oldValues: null,
        newValues: JSON.stringify({ name: brand.name, isActive: true })
      });
    });

    // Add inventory/stock adjustment operations
    mutableInventory.slice(0, 8).forEach((inv, index) => {
      const product = mutableProducts.find(p => p.id === inv.productId);
      const loc = mutableLocations.find(l => l.id === inv.locationId);
      if (product && loc) {
        history.push({
          id: `hist-stock-${inv.id}`,
          operationType: 'STOCK_ADJUST',
          entityType: 'INVENTORY',
          entityId: inv.id,
          reason: `Korekta stanu magazynowego: ${product.brandName || ''} ${product.name} (+${Math.floor(Math.random() * 10) + 1} szt.)`,
          locationId: loc.id,
          location: loc,
          relatedLocationId: null,
          relatedLocation: null,
          userId: mutableUsers[index % mutableUsers.length]?.id || currentUser.id,
          userFullName: mutableUsers[index % mutableUsers.length]
            ? `${mutableUsers[index % mutableUsers.length].firstName} ${mutableUsers[index % mutableUsers.length].lastName}`
            : `${currentUser.firstName} ${currentUser.lastName}`,
          operationTimestamp: getRandomDate(10),
          canRevert: true,
          oldValues: JSON.stringify({ quantity: Math.max(0, inv.quantity - 5) }),
          newValues: JSON.stringify({ quantity: inv.quantity })
        });
      }
    });

    // Add user operations
    mutableUsers.slice(1, 3).forEach((user) => {
      const loc = mutableLocations[0];
      history.push({
        id: `hist-user-create-${user.id}`,
        operationType: 'CREATE',
        entityType: 'USER',
        entityId: user.id,
        reason: `Utworzono konto użytkownika: ${user.firstName} ${user.lastName} (${user.role})`,
        locationId: loc?.id,
        location: loc,
        relatedLocationId: null,
        relatedLocation: null,
        userId: currentUser.id,
        userFullName: `${currentUser.firstName} ${currentUser.lastName}`,
        operationTimestamp: getRandomDate(29),
        canRevert: false,
        oldValues: null,
        newValues: JSON.stringify({
          email: user.email,
          role: user.role,
          status: 'ACTIVE'
        })
      });
    });

    // Filter by location
    let filtered = [...history];
    const totalBeforeFilter = filtered.length;
    console.log('[MSW History] Total records before filtering:', totalBeforeFilter);

    if (locationId) {
      filtered = filtered.filter(h => h.locationId === locationId || h.relatedLocationId === locationId);
    }

    // Filter by location type
    if (locationType) {
      const locationIds = mutableLocations
        .filter(l => l.type === locationType && l.status === 'ACTIVE')
        .map(l => l.id);
      filtered = filtered.filter(h =>
        locationIds.includes(h.locationId) || locationIds.includes(h.relatedLocationId)
      );
    }

    // Filter by operation types
    if (operationTypes) {
      const types = operationTypes.split(',').map(t => t.trim());
      const countBefore = filtered.length;
      filtered = filtered.filter(h => types.includes(h.operationType));
      console.log('[MSW History] Filtering by operationTypes:', types, '- Before:', countBefore, 'After:', filtered.length);
    }

    // Filter by entity types
    if (entityTypes) {
      const types = entityTypes.split(',').map(t => t.trim());
      const countBefore = filtered.length;
      filtered = filtered.filter(h => types.includes(h.entityType));
      console.log('[MSW History] Filtering by entityTypes:', types, '- Before:', countBefore, 'After:', filtered.length);
    }

    // Filter by date range
    if (startDate) {
      filtered = filtered.filter(h => h.operationTimestamp >= startDate);
    }
    if (endDate) {
      const endDateTime = endDate + 'T23:59:59Z';
      filtered = filtered.filter(h => h.operationTimestamp <= endDateTime);
    }

    // Search filter
    if (search) {
      const searchLower = search.toLowerCase();
      filtered = filtered.filter(h => {
        const userName = (h.userFullName || '').toLowerCase();
        const locationName = (h.location?.name || '').toLowerCase();
        const reason = (h.reason || '').toLowerCase();
        return userName.includes(searchLower) ||
               locationName.includes(searchLower) ||
               reason.includes(searchLower);
      });
    }

    // Sort by date descending
    filtered.sort((a, b) => new Date(b.operationTimestamp) - new Date(a.operationTimestamp));

    console.log('[MSW History] Total records after filtering:', filtered.length, 'of', totalBeforeFilter);

    return HttpResponse.json(apiResponse(paginate(filtered, page, size)));
  }),

  // History mutations (all blocked in demo mode)
  http.post(`${API_BASE}/history/:id/revert`, async () => {
    await delay(50);
    return demoRestricted('Cofanie operacji');
  }),

  http.delete(`${API_BASE}/history/:id`, async () => {
    await delay(50);
    return demoRestricted('Usuwanie historii');
  }),

  http.delete(`${API_BASE}/history`, async () => {
    await delay(50);
    return demoRestricted('Czyszczenie historii');
  }),

  http.delete(`${API_BASE}/history/batch`, async () => {
    await delay(50);
    return demoRestricted('Usuwanie historii');
  }),

  // ========== STATISTICS ENDPOINTS ==========
  http.get(`${API_BASE}/statistics/dashboard`, async () => {
    await delay(150);

    // Calculate inventory by product type
    const inventoryByType = { FRAME: 0, SUNGLASSES: 0, CONTACT_LENS: 0, SOLUTION: 0, OTHER: 0 };
    const uniqueFrameIds = new Set();
    let totalInventoryValue = 0;

    mutableInventory.forEach(inv => {
      const product = mutableProducts.find(p => p.id === inv.productId);
      if (product && product.status === 'ACTIVE') {
        inventoryByType[product.type] = (inventoryByType[product.type] || 0) + inv.quantity;
        totalInventoryValue += product.sellingPrice * inv.quantity;
        if (product.type === 'FRAME') {
          uniqueFrameIds.add(product.id);
        }
      }
    });

    // Calculate sales data
    const completedSales = mutableSales.filter(s => s.status === 'COMPLETED');
    const totalSales = completedSales.reduce((sum, s) => sum + s.totalAmount, 0);
    const salesCount = completedSales.length;

    // Calculate sales by brand
    const salesByBrandMap = {};
    completedSales.forEach(sale => {
      sale.items.forEach(item => {
        const product = item.product || mutableProducts.find(p => p.id === item.productId);
        if (product && product.brandName) {
          if (!salesByBrandMap[product.brandName]) {
            salesByBrandMap[product.brandName] = { brand: product.brandName, totalSales: 0, quantitySold: 0 };
          }
          salesByBrandMap[product.brandName].totalSales += item.totalPrice || (item.quantity * item.unitPrice);
          salesByBrandMap[product.brandName].quantitySold += item.quantity;
        }
      });
    });
    const salesByBrand = Object.values(salesByBrandMap).sort((a, b) => b.totalSales - a.totalSales);

    // Calculate transfer stats
    const pendingTransfers = mutableTransfers.filter(t => t.status === 'PENDING').length;
    const completedTransfers = mutableTransfers.filter(t => t.status === 'COMPLETED').length;
    const totalTransferredProducts = mutableTransfers
      .filter(t => t.status === 'COMPLETED')
      .reduce((sum, t) => sum + t.items.reduce((itemSum, item) => itemSum + item.quantity, 0), 0);

    // Count aging inventory (items older than 90 days without sales - mock random count)
    const inventoryAgingCount = Math.floor(Math.random() * 15) + 5;

    const totalProductsInStock = inventoryByType.FRAME + inventoryByType.SUNGLASSES +
      inventoryByType.CONTACT_LENS + inventoryByType.SOLUTION + inventoryByType.OTHER;

    return HttpResponse.json(apiResponse({
      // Sales stats
      totalSales,
      salesCount,
      salesByBrand,

      // Transfer stats
      pendingTransfers,
      completedTransfers,
      totalTransferredProducts,

      // Inventory stats
      totalProductsInStock,
      totalInventoryValue,
      totalFrames: inventoryByType.FRAME,
      uniqueFrameModels: uniqueFrameIds.size,
      totalSunglasses: inventoryByType.SUNGLASSES,
      totalContactLenses: inventoryByType.CONTACT_LENS,
      totalSolutions: inventoryByType.SOLUTION,
      totalOther: inventoryByType.OTHER,
      inventoryAgingCount,

      // Legacy fields
      totalProducts: mutableProducts.filter(p => p.status === 'ACTIVE').length,
      totalLocations: mutableLocations.filter(l => l.status === 'ACTIVE').length,
    }));
  }),

  // Product Analytics (top sellers, sales by product type)
  http.get(`${API_BASE}/statistics/products`, async () => {
    await delay(100);

    const completedSales = mutableSales.filter(s => s.status === 'COMPLETED');

    // Calculate sales by product type
    const salesByTypeMap = {};
    completedSales.forEach(sale => {
      sale.items.forEach(item => {
        const product = item.product || mutableProducts.find(p => p.id === item.productId);
        if (product) {
          if (!salesByTypeMap[product.type]) {
            salesByTypeMap[product.type] = {
              productType: product.type,
              totalQuantitySold: 0,
              totalRevenue: 0,
              transactionCount: 0
            };
          }
          salesByTypeMap[product.type].totalQuantitySold += item.quantity;
          salesByTypeMap[product.type].totalRevenue += item.totalPrice || (item.quantity * item.unitPrice);
          salesByTypeMap[product.type].transactionCount++;
        }
      });
    });

    const salesByProductType = Object.values(salesByTypeMap).sort((a, b) => b.totalRevenue - a.totalRevenue);

    // Calculate top sellers
    const productSalesMap = {};
    completedSales.forEach(sale => {
      sale.items.forEach(item => {
        const product = item.product || mutableProducts.find(p => p.id === item.productId);
        if (product) {
          if (!productSalesMap[product.id]) {
            productSalesMap[product.id] = {
              productId: product.id,
              productName: product.name,
              brandName: product.brandName,
              productType: product.type,
              totalQuantitySold: 0,
              totalRevenue: 0
            };
          }
          productSalesMap[product.id].totalQuantitySold += item.quantity;
          productSalesMap[product.id].totalRevenue += item.totalPrice || (item.quantity * item.unitPrice);
        }
      });
    });

    const topSellers = Object.values(productSalesMap)
      .sort((a, b) => b.totalRevenue - a.totalRevenue)
      .slice(0, 10);

    return HttpResponse.json(apiResponse({
      salesByProductType,
      topSellers,
      slowMovers: [] // Could be populated based on inventory age
    }));
  }),

  // Store Comparison
  http.get(`${API_BASE}/statistics/stores/comparison`, async () => {
    await delay(100);

    const completedSales = mutableSales.filter(s => s.status === 'COMPLETED');
    const storeStats = {};

    // Calculate sales by location
    completedSales.forEach(sale => {
      if (!storeStats[sale.locationId]) {
        const location = mutableLocations.find(l => l.id === sale.locationId);
        storeStats[sale.locationId] = {
          locationId: sale.locationId,
          locationName: location?.name || 'Nieznana lokalizacja',
          locationType: location?.type || 'STORE',
          salesCount: 0,
          totalSales: 0
        };
      }
      storeStats[sale.locationId].salesCount++;
      storeStats[sale.locationId].totalSales += sale.totalAmount;
    });

    // Calculate averages and rank
    const stores = Object.values(storeStats)
      .map(store => ({
        ...store,
        averageSaleValue: store.salesCount > 0 ? store.totalSales / store.salesCount : 0
      }))
      .sort((a, b) => b.totalSales - a.totalSales)
      .map((store, index) => ({ ...store, rank: index + 1 }));

    // Add locations with no sales
    mutableLocations
      .filter(l => l.status === 'ACTIVE' && !storeStats[l.id])
      .forEach(location => {
        stores.push({
          locationId: location.id,
          locationName: location.name,
          locationType: location.type,
          salesCount: 0,
          totalSales: 0,
          averageSaleValue: 0,
          rank: stores.length + 1
        });
      });

    return HttpResponse.json(apiResponse({
      stores,
      totalSales: stores.reduce((sum, s) => sum + s.totalSales, 0),
      totalSalesCount: stores.reduce((sum, s) => sum + s.salesCount, 0)
    }));
  }),

  // User Sales Statistics
  http.get(`${API_BASE}/statistics/users/sales`, async () => {
    await delay(100);

    const completedSales = mutableSales.filter(s => s.status === 'COMPLETED');
    const userStats = {};

    // Calculate sales by user
    completedSales.forEach(sale => {
      const userId = sale.userId || sale.user?.id;
      if (!userStats[userId]) {
        const user = mutableUsers.find(u => u.id === userId);
        userStats[userId] = {
          userId,
          userName: sale.userFullName || `${user?.firstName || ''} ${user?.lastName || ''}`.trim() || 'Nieznany użytkownik',
          userEmail: user?.email || 'brak@email.pl',
          salesCount: 0,
          totalSales: 0,
          totalOperations: 0
        };
      }
      userStats[userId].salesCount++;
      userStats[userId].totalSales += sale.totalAmount;
      userStats[userId].totalOperations++;
    });

    // Calculate averages and rank
    const userSales = Object.values(userStats)
      .map(user => ({
        ...user,
        averageSaleValue: user.salesCount > 0 ? user.totalSales / user.salesCount : 0
      }))
      .sort((a, b) => b.totalSales - a.totalSales)
      .map((user, index) => ({ ...user, rank: index + 1 }));

    return HttpResponse.json(apiResponse({
      userSales,
      totalSales: userSales.reduce((sum, u) => sum + u.totalSales, 0),
      totalSalesCount: userSales.reduce((sum, u) => sum + u.salesCount, 0)
    }));
  }),

  // Product Inventory by Location
  http.get(`${API_BASE}/statistics/products/inventory-by-location`, async ({ request }) => {
    await delay(100);
    const url = new URL(request.url);
    const productTypesParam = url.searchParams.get('productTypes');
    const productTypes = productTypesParam ? productTypesParam.split(',') : ['FRAME', 'SUNGLASSES', 'CONTACT_LENS', 'SOLUTION', 'OTHER'];

    const locationStats = {};

    mutableInventory.forEach(inv => {
      const product = mutableProducts.find(p => p.id === inv.productId);
      const location = mutableLocations.find(l => l.id === inv.locationId);

      if (product && location && product.status === 'ACTIVE' && productTypes.includes(product.type)) {
        if (!locationStats[inv.locationId]) {
          locationStats[inv.locationId] = {
            locationId: inv.locationId,
            locationName: location.name,
            locationType: location.type,
            productTypeQuantities: {}
          };
        }
        if (!locationStats[inv.locationId].productTypeQuantities[product.type]) {
          locationStats[inv.locationId].productTypeQuantities[product.type] = 0;
        }
        locationStats[inv.locationId].productTypeQuantities[product.type] += inv.quantity;
      }
    });

    const locations = Object.values(locationStats);

    return HttpResponse.json(apiResponse({
      locations,
      productTypes
    }));
  }),

  // Sales Trend
  http.get(`${API_BASE}/statistics/sales/trend`, async ({ request }) => {
    await delay(100);
    const url = new URL(request.url);
    const startDate = url.searchParams.get('startDate');
    const endDate = url.searchParams.get('endDate');
    const period = url.searchParams.get('period') || 'month';

    const completedSales = mutableSales.filter(s => s.status === 'COMPLETED');

    // Generate trend data based on period
    const trendMap = {};
    const start = startDate ? new Date(startDate) : new Date(Date.now() - 365 * 24 * 60 * 60 * 1000);
    const end = endDate ? new Date(endDate) : new Date();

    completedSales.forEach(sale => {
      const saleDate = new Date(sale.createdAt);
      if (saleDate >= start && saleDate <= end) {
        let key;
        if (period === 'day') {
          key = sale.createdAt.substring(0, 10);
        } else if (period === 'week') {
          const weekStart = new Date(saleDate);
          weekStart.setDate(saleDate.getDate() - saleDate.getDay());
          key = weekStart.toISOString().substring(0, 10);
        } else {
          key = sale.createdAt.substring(0, 7);
        }

        if (!trendMap[key]) {
          trendMap[key] = { period: key, totalSales: 0, salesCount: 0, averageValue: 0 };
        }
        trendMap[key].totalSales += sale.totalAmount;
        trendMap[key].salesCount++;
      }
    });

    // Fill in missing periods and calculate averages
    const trendData = Object.values(trendMap)
      .map(item => ({
        ...item,
        averageValue: item.salesCount > 0 ? item.totalSales / item.salesCount : 0
      }))
      .sort((a, b) => a.period.localeCompare(b.period));

    return HttpResponse.json(apiResponse({
      trendData,
      period,
      startDate: start.toISOString(),
      endDate: end.toISOString()
    }));
  }),

  // ========== UNIQUE FRAMES ENDPOINT ==========
  http.get(`${API_BASE}/inventory/unique-frames`, async ({ request }) => {
    await delay(100);
    const url = new URL(request.url);
    const locationId = url.searchParams.get('locationId');
    const page = parseInt(url.searchParams.get('page') || '0');
    const size = parseInt(url.searchParams.get('size') || '20');

    let items = getInventoryWithProducts(locationId, 'FRAME');
    return HttpResponse.json(apiResponse(paginate(items, page, size)));
  }),

  // ========== AGING INVENTORY ENDPOINT ==========
  http.get(`${API_BASE}/inventory/aging`, async ({ request }) => {
    await delay(100);
    const url = new URL(request.url);
    const locationId = url.searchParams.get('locationId');
    const page = parseInt(url.searchParams.get('page') || '0');
    const size = parseInt(url.searchParams.get('size') || '20');

    let items = getInventoryWithProducts(locationId);
    // Add aging info (mock - all items are relatively new)
    items = items.map(item => ({
      ...item,
      daysInStock: Math.floor(Math.random() * 180),
      lastSaleDate: null
    }));

    return HttpResponse.json(apiResponse(paginate(items, page, size)));
  }),

  // Add stock to inventory (all blocked in demo mode)
  http.post(`${API_BASE}/inventory/frames`, async () => {
    await delay(50);
    return demoRestricted('Dodawanie do magazynu');
  }),

  http.post(`${API_BASE}/inventory/contact-lenses`, async () => {
    await delay(50);
    return demoRestricted('Dodawanie do magazynu');
  }),

  http.post(`${API_BASE}/inventory/solutions`, async () => {
    await delay(50);
    return demoRestricted('Dodawanie do magazynu');
  }),

  http.post(`${API_BASE}/inventory/sunglasses`, async () => {
    await delay(50);
    return demoRestricted('Dodawanie do magazynu');
  }),

  http.post(`${API_BASE}/inventory/other-products`, async () => {
    await delay(50);
    return demoRestricted('Dodawanie do magazynu');
  }),

  // ========== COMPANY SETTINGS ==========
  http.get(`${API_BASE}/settings/company`, async () => {
    await delay(50);
    return HttpResponse.json(apiResponse(companySettings));
  }),

  http.put(`${API_BASE}/company-settings`, async () => {
    await delay(100);
    return errorResponse('Zmiana ustawień firmy jest niedostępna w wersji demo', 403);
  }),

  http.post(`${API_BASE}/company-settings/logo`, async () => {
    await delay(200);
    return errorResponse('Wgrywanie logo jest niedostępne w wersji demo', 403);
  }),

  http.delete(`${API_BASE}/company-settings/logo`, async () => {
    await delay(50);
    return errorResponse('Usuwanie logo jest niedostępne w wersji demo', 403);
  }),

  // ========== ERROR LOGGING ==========
  http.post(`${API_BASE}/logs/client-errors`, async () => {
    await delay(50);
    // In demo mode, just acknowledge the error log
    return HttpResponse.json(apiResponse({ message: 'Error logged successfully' }));
  }),

  // ========== AUTH - Change Password ==========
  http.post(`${API_BASE}/auth/change-password`, async () => {
    await delay(100);
    // In demo mode, just acknowledge the password change
    return HttpResponse.json(apiResponse({ message: 'Password changed successfully' }));
  }),
];
