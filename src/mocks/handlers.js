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

  // Location mutations
  http.post(`${API_BASE}/locations`, async ({ request }) => {
    await delay(100);
    const data = await request.json();
    const newLocation = {
      id: generateId('loc'),
      ...data,
      status: 'ACTIVE',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    mutableLocations.push(newLocation);
    return HttpResponse.json(apiResponse(newLocation));
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
    const page = parseInt(url.searchParams.get('page') || '0');
    const size = parseInt(url.searchParams.get('size') || '20');

    let items = getInventoryWithProducts(null, productType);
    return HttpResponse.json(apiResponse(paginate(items, page, size)));
  }),

  http.get(`${API_BASE}/inventory/location/:locationId`, async ({ params, request }) => {
    await delay(150);
    const url = new URL(request.url);
    const productType = url.searchParams.get('productType');
    const search = url.searchParams.get('search');
    const page = parseInt(url.searchParams.get('page') || '0');
    const size = parseInt(url.searchParams.get('size') || '20');

    let items = getInventoryWithProducts(params.locationId, productType, search);
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

  // Inventory mutations
  http.post(`${API_BASE}/inventory`, async ({ request }) => {
    await delay(100);
    const data = await request.json();
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
  }),

  http.post(`${API_BASE}/inventory/reserve`, async ({ request }) => {
    await delay(50);
    const data = await request.json();
    const { productId, locationId, quantity } = data;

    const index = mutableInventory.findIndex(
      inv => inv.productId === productId && inv.locationId === locationId
    );

    if (index === -1) {
      return errorResponse('Inventory not found', 404);
    }

    const inv = mutableInventory[index];
    const available = inv.quantity - (inv.reservedQuantity || 0);

    if (quantity > available) {
      return errorResponse('Insufficient available quantity', 400);
    }

    mutableInventory[index].reservedQuantity = (inv.reservedQuantity || 0) + quantity;
    return HttpResponse.json(apiResponse(mutableInventory[index]));
  }),

  http.post(`${API_BASE}/inventory/release`, async ({ request }) => {
    await delay(50);
    const data = await request.json();
    const { productId, locationId, quantity } = data;

    const index = mutableInventory.findIndex(
      inv => inv.productId === productId && inv.locationId === locationId
    );

    if (index === -1) {
      return errorResponse('Inventory not found', 404);
    }

    mutableInventory[index].reservedQuantity = Math.max(
      0,
      (mutableInventory[index].reservedQuantity || 0) - quantity
    );
    return HttpResponse.json(apiResponse(mutableInventory[index]));
  }),

  http.patch(`${API_BASE}/inventory/products/:productId/locations/:locationId/min-stock`, async ({ params, request }) => {
    await delay(50);
    const data = await request.json();

    const index = mutableInventory.findIndex(
      inv => inv.productId === params.productId && inv.locationId === params.locationId
    );

    if (index === -1) {
      return errorResponse('Inventory not found', 404);
    }

    mutableInventory[index].minQuantity = data.minQuantity;
    return HttpResponse.json(apiResponse(mutableInventory[index]));
  }),

  http.post(`${API_BASE}/inventory/batch-adjust`, async ({ request }) => {
    await delay(100);
    const data = await request.json();
    const { adjustments } = data;

    const results = [];
    for (const adj of adjustments) {
      const index = mutableInventory.findIndex(
        inv => inv.productId === adj.productId && inv.locationId === adj.locationId
      );

      if (index >= 0) {
        mutableInventory[index].quantity = Math.max(0, mutableInventory[index].quantity + adj.adjustment);
        results.push(mutableInventory[index]);
      }
    }

    return HttpResponse.json(apiResponse(results));
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

  // Product mutations (generic endpoints for all product types)
  http.post(`${API_BASE}/frames`, async ({ request }) => {
    await delay(100);
    const data = await request.json();
    const brand = data.brandId ? mutableBrands.find(b => b.id === data.brandId) : null;
    const newProduct = {
      id: generateId('prd'),
      type: 'FRAME',
      ...data,
      brandName: brand?.name || null,
      status: 'ACTIVE',
      deletedAt: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    mutableProducts.push(newProduct);
    return HttpResponse.json(apiResponse(transformProduct(newProduct)));
  }),

  http.post(`${API_BASE}/contact-lenses`, async ({ request }) => {
    await delay(100);
    const data = await request.json();
    const brand = data.brandId ? mutableBrands.find(b => b.id === data.brandId) : null;
    const newProduct = {
      id: generateId('prd'),
      type: 'CONTACT_LENS',
      ...data,
      brandName: brand?.name || null,
      status: 'ACTIVE',
      deletedAt: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    mutableProducts.push(newProduct);
    return HttpResponse.json(apiResponse(transformProduct(newProduct)));
  }),

  http.post(`${API_BASE}/solutions`, async ({ request }) => {
    await delay(100);
    const data = await request.json();
    const brand = data.brandId ? mutableBrands.find(b => b.id === data.brandId) : null;
    const newProduct = {
      id: generateId('prd'),
      type: 'SOLUTION',
      ...data,
      brandName: brand?.name || null,
      status: 'ACTIVE',
      deletedAt: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    mutableProducts.push(newProduct);
    return HttpResponse.json(apiResponse(transformProduct(newProduct)));
  }),

  http.post(`${API_BASE}/sunglasses`, async ({ request }) => {
    await delay(100);
    const data = await request.json();
    const brand = data.brandId ? mutableBrands.find(b => b.id === data.brandId) : null;
    const newProduct = {
      id: generateId('prd'),
      type: 'SUNGLASSES',
      ...data,
      brandName: brand?.name || null,
      status: 'ACTIVE',
      deletedAt: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    mutableProducts.push(newProduct);
    return HttpResponse.json(apiResponse(transformProduct(newProduct)));
  }),

  http.post(`${API_BASE}/other-products`, async ({ request }) => {
    await delay(100);
    const data = await request.json();
    const newProduct = {
      id: generateId('prd'),
      type: 'OTHER',
      ...data,
      brandId: null,
      brandName: null,
      status: 'ACTIVE',
      deletedAt: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    mutableProducts.push(newProduct);
    return HttpResponse.json(apiResponse(transformProduct(newProduct)));
  }),

  // Update product endpoints
  http.put(`${API_BASE}/frames/:id`, async ({ params, request }) => {
    await delay(100);
    const data = await request.json();
    const index = mutableProducts.findIndex(p => p.id === params.id);
    if (index === -1) {
      return errorResponse('Product not found', 404);
    }
    const brand = data.brandId ? mutableBrands.find(b => b.id === data.brandId) : null;
    mutableProducts[index] = {
      ...mutableProducts[index],
      ...data,
      brandName: brand?.name || mutableProducts[index].brandName,
      updatedAt: new Date().toISOString()
    };
    return HttpResponse.json(apiResponse(transformProduct(mutableProducts[index])));
  }),

  http.put(`${API_BASE}/contact-lenses/:id`, async ({ params, request }) => {
    await delay(100);
    const data = await request.json();
    const index = mutableProducts.findIndex(p => p.id === params.id);
    if (index === -1) {
      return errorResponse('Product not found', 404);
    }
    const brand = data.brandId ? mutableBrands.find(b => b.id === data.brandId) : null;
    mutableProducts[index] = {
      ...mutableProducts[index],
      ...data,
      brandName: brand?.name || mutableProducts[index].brandName,
      updatedAt: new Date().toISOString()
    };
    return HttpResponse.json(apiResponse(transformProduct(mutableProducts[index])));
  }),

  http.put(`${API_BASE}/solutions/:id`, async ({ params, request }) => {
    await delay(100);
    const data = await request.json();
    const index = mutableProducts.findIndex(p => p.id === params.id);
    if (index === -1) {
      return errorResponse('Product not found', 404);
    }
    const brand = data.brandId ? mutableBrands.find(b => b.id === data.brandId) : null;
    mutableProducts[index] = {
      ...mutableProducts[index],
      ...data,
      brandName: brand?.name || mutableProducts[index].brandName,
      updatedAt: new Date().toISOString()
    };
    return HttpResponse.json(apiResponse(transformProduct(mutableProducts[index])));
  }),

  http.put(`${API_BASE}/sunglasses/:id`, async ({ params, request }) => {
    await delay(100);
    const data = await request.json();
    const index = mutableProducts.findIndex(p => p.id === params.id);
    if (index === -1) {
      return errorResponse('Product not found', 404);
    }
    const brand = data.brandId ? mutableBrands.find(b => b.id === data.brandId) : null;
    mutableProducts[index] = {
      ...mutableProducts[index],
      ...data,
      brandName: brand?.name || mutableProducts[index].brandName,
      updatedAt: new Date().toISOString()
    };
    return HttpResponse.json(apiResponse(transformProduct(mutableProducts[index])));
  }),

  http.put(`${API_BASE}/other-products/:id`, async ({ params, request }) => {
    await delay(100);
    const data = await request.json();
    const index = mutableProducts.findIndex(p => p.id === params.id);
    if (index === -1) {
      return errorResponse('Product not found', 404);
    }
    mutableProducts[index] = {
      ...mutableProducts[index],
      ...data,
      updatedAt: new Date().toISOString()
    };
    return HttpResponse.json(apiResponse(transformProduct(mutableProducts[index])));
  }),

  // Delete product endpoints (soft delete)
  http.delete(`${API_BASE}/frames/:id`, async ({ params }) => {
    await delay(50);
    const index = mutableProducts.findIndex(p => p.id === params.id);
    if (index === -1) {
      return errorResponse('Product not found', 404);
    }
    mutableProducts[index].status = 'DELETED';
    mutableProducts[index].deletedAt = new Date().toISOString();
    return HttpResponse.json(apiResponse({ message: 'Product deleted successfully' }));
  }),

  http.delete(`${API_BASE}/contact-lenses/:id`, async ({ params }) => {
    await delay(50);
    const index = mutableProducts.findIndex(p => p.id === params.id);
    if (index === -1) {
      return errorResponse('Product not found', 404);
    }
    mutableProducts[index].status = 'DELETED';
    mutableProducts[index].deletedAt = new Date().toISOString();
    return HttpResponse.json(apiResponse({ message: 'Product deleted successfully' }));
  }),

  http.delete(`${API_BASE}/solutions/:id`, async ({ params }) => {
    await delay(50);
    const index = mutableProducts.findIndex(p => p.id === params.id);
    if (index === -1) {
      return errorResponse('Product not found', 404);
    }
    mutableProducts[index].status = 'DELETED';
    mutableProducts[index].deletedAt = new Date().toISOString();
    return HttpResponse.json(apiResponse({ message: 'Product deleted successfully' }));
  }),

  http.delete(`${API_BASE}/sunglasses/:id`, async ({ params }) => {
    await delay(50);
    const index = mutableProducts.findIndex(p => p.id === params.id);
    if (index === -1) {
      return errorResponse('Product not found', 404);
    }
    mutableProducts[index].status = 'DELETED';
    mutableProducts[index].deletedAt = new Date().toISOString();
    return HttpResponse.json(apiResponse({ message: 'Product deleted successfully' }));
  }),

  http.delete(`${API_BASE}/other-products/:id`, async ({ params }) => {
    await delay(50);
    const index = mutableProducts.findIndex(p => p.id === params.id);
    if (index === -1) {
      return errorResponse('Product not found', 404);
    }
    mutableProducts[index].status = 'DELETED';
    mutableProducts[index].deletedAt = new Date().toISOString();
    return HttpResponse.json(apiResponse({ message: 'Product deleted successfully' }));
  }),

  // Restore product endpoints
  http.patch(`${API_BASE}/frames/:id/restore`, async ({ params }) => {
    await delay(50);
    const index = mutableProducts.findIndex(p => p.id === params.id);
    if (index === -1) {
      return errorResponse('Product not found', 404);
    }
    mutableProducts[index].status = 'ACTIVE';
    mutableProducts[index].deletedAt = null;
    return HttpResponse.json(apiResponse(transformProduct(mutableProducts[index])));
  }),

  http.patch(`${API_BASE}/contact-lenses/:id/restore`, async ({ params }) => {
    await delay(50);
    const index = mutableProducts.findIndex(p => p.id === params.id);
    if (index === -1) {
      return errorResponse('Product not found', 404);
    }
    mutableProducts[index].status = 'ACTIVE';
    mutableProducts[index].deletedAt = null;
    return HttpResponse.json(apiResponse(transformProduct(mutableProducts[index])));
  }),

  http.patch(`${API_BASE}/solutions/:id/restore`, async ({ params }) => {
    await delay(50);
    const index = mutableProducts.findIndex(p => p.id === params.id);
    if (index === -1) {
      return errorResponse('Product not found', 404);
    }
    mutableProducts[index].status = 'ACTIVE';
    mutableProducts[index].deletedAt = null;
    return HttpResponse.json(apiResponse(transformProduct(mutableProducts[index])));
  }),

  http.patch(`${API_BASE}/sunglasses/:id/restore`, async ({ params }) => {
    await delay(50);
    const index = mutableProducts.findIndex(p => p.id === params.id);
    if (index === -1) {
      return errorResponse('Product not found', 404);
    }
    mutableProducts[index].status = 'ACTIVE';
    mutableProducts[index].deletedAt = null;
    return HttpResponse.json(apiResponse(transformProduct(mutableProducts[index])));
  }),

  http.patch(`${API_BASE}/other-products/:id/restore`, async ({ params }) => {
    await delay(50);
    const index = mutableProducts.findIndex(p => p.id === params.id);
    if (index === -1) {
      return errorResponse('Product not found', 404);
    }
    mutableProducts[index].status = 'ACTIVE';
    mutableProducts[index].deletedAt = null;
    return HttpResponse.json(apiResponse(transformProduct(mutableProducts[index])));
  }),

  // Bulk operations
  http.post(`${API_BASE}/frames/bulk-delete`, async ({ request }) => {
    await delay(100);
    const { ids } = await request.json();
    ids.forEach(id => {
      const index = mutableProducts.findIndex(p => p.id === id);
      if (index >= 0) {
        mutableProducts[index].status = 'DELETED';
        mutableProducts[index].deletedAt = new Date().toISOString();
      }
    });
    return HttpResponse.json(apiResponse({ deletedCount: ids.length }));
  }),

  http.post(`${API_BASE}/frames/bulk-restore`, async ({ request }) => {
    await delay(100);
    const { ids } = await request.json();
    ids.forEach(id => {
      const index = mutableProducts.findIndex(p => p.id === id);
      if (index >= 0) {
        mutableProducts[index].status = 'ACTIVE';
        mutableProducts[index].deletedAt = null;
      }
    });
    return HttpResponse.json(apiResponse({ restoredCount: ids.length }));
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

  // Brand mutations
  http.post(`${API_BASE}/brands`, async ({ request }) => {
    await delay(100);
    const data = await request.json();
    const newBrand = {
      id: generateId('brd'),
      ...data,
      logoUrl: null,
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    mutableBrands.push(newBrand);
    return HttpResponse.json(apiResponse(newBrand));
  }),

  http.put(`${API_BASE}/brands/:id`, async ({ params, request }) => {
    await delay(100);
    const data = await request.json();
    const index = mutableBrands.findIndex(b => b.id === params.id);
    if (index === -1) {
      return errorResponse('Brand not found', 404);
    }
    mutableBrands[index] = {
      ...mutableBrands[index],
      ...data,
      updatedAt: new Date().toISOString()
    };
    return HttpResponse.json(apiResponse(mutableBrands[index]));
  }),

  http.patch(`${API_BASE}/brands/:id/activate`, async ({ params }) => {
    await delay(50);
    const index = mutableBrands.findIndex(b => b.id === params.id);
    if (index === -1) {
      return errorResponse('Brand not found', 404);
    }
    mutableBrands[index].isActive = true;
    mutableBrands[index].updatedAt = new Date().toISOString();
    return HttpResponse.json(apiResponse(mutableBrands[index]));
  }),

  http.patch(`${API_BASE}/brands/:id/deactivate`, async ({ params }) => {
    await delay(50);
    const index = mutableBrands.findIndex(b => b.id === params.id);
    if (index === -1) {
      return errorResponse('Brand not found', 404);
    }
    mutableBrands[index].isActive = false;
    mutableBrands[index].updatedAt = new Date().toISOString();
    return HttpResponse.json(apiResponse(mutableBrands[index]));
  }),

  http.delete(`${API_BASE}/brands/:id`, async ({ params }) => {
    await delay(50);
    const index = mutableBrands.findIndex(b => b.id === params.id);
    if (index === -1) {
      return errorResponse('Brand not found', 404);
    }
    mutableBrands.splice(index, 1);
    return HttpResponse.json(apiResponse({ message: 'Brand deleted successfully' }));
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

  // User mutations
  http.post(`${API_BASE}/users`, async ({ request }) => {
    await delay(100);
    const data = await request.json();
    const newUser = {
      id: generateId('usr'),
      ...data,
      status: 'ACTIVE',
      themePreference: 'LIGHT',
      locations: data.locations || [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    mutableUsers.push(newUser);
    return HttpResponse.json(apiResponse(newUser));
  }),

  http.put(`${API_BASE}/users/:id`, async ({ params, request }) => {
    await delay(100);
    const data = await request.json();
    const index = mutableUsers.findIndex(u => u.id === params.id);
    if (index === -1) {
      return errorResponse('User not found', 404);
    }
    mutableUsers[index] = {
      ...mutableUsers[index],
      ...data,
      updatedAt: new Date().toISOString()
    };
    return HttpResponse.json(apiResponse(mutableUsers[index]));
  }),

  http.patch(`${API_BASE}/users/:id/activate`, async ({ params }) => {
    await delay(50);
    const index = mutableUsers.findIndex(u => u.id === params.id);
    if (index === -1) {
      return errorResponse('User not found', 404);
    }
    mutableUsers[index].status = 'ACTIVE';
    mutableUsers[index].updatedAt = new Date().toISOString();
    return HttpResponse.json(apiResponse(mutableUsers[index]));
  }),

  http.patch(`${API_BASE}/users/:id/deactivate`, async ({ params }) => {
    await delay(50);
    const index = mutableUsers.findIndex(u => u.id === params.id);
    if (index === -1) {
      return errorResponse('User not found', 404);
    }
    mutableUsers[index].status = 'INACTIVE';
    mutableUsers[index].updatedAt = new Date().toISOString();
    return HttpResponse.json(apiResponse(mutableUsers[index]));
  }),

  http.delete(`${API_BASE}/users/:id`, async ({ params }) => {
    await delay(50);
    const index = mutableUsers.findIndex(u => u.id === params.id);
    if (index === -1) {
      return errorResponse('User not found', 404);
    }
    mutableUsers.splice(index, 1);
    return HttpResponse.json(apiResponse({ message: 'User deleted successfully' }));
  }),

  http.patch(`${API_BASE}/users/:id/reset-password`, async ({ params }) => {
    await delay(100);
    const index = mutableUsers.findIndex(u => u.id === params.id);
    if (index === -1) {
      return errorResponse('User not found', 404);
    }
    // In demo mode, just acknowledge the password reset
    return HttpResponse.json(apiResponse({ message: 'Password reset successfully' }));
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

  // Transfer mutations
  http.post(`${API_BASE}/transfers`, async ({ request }) => {
    await delay(100);
    const data = await request.json();

    const fromLocation = mutableLocations.find(l => l.id === data.fromLocationId);
    const toLocation = mutableLocations.find(l => l.id === data.toLocationId);

    const transferItems = data.items.map((item, idx) => ({
      id: `ti-${Date.now()}-${idx}`,
      productId: item.productId,
      product: mutableProducts.find(p => p.id === item.productId),
      quantity: item.quantity
    }));

    const newTransfer = {
      id: generateId('trf'),
      transferNumber: `TRF-${new Date().getFullYear()}-${String(mutableTransfers.length + 1).padStart(4, '0')}`,
      fromLocationId: data.fromLocationId,
      fromLocation,
      toLocationId: data.toLocationId,
      toLocation,
      items: transferItems,
      status: 'PENDING',
      reason: data.reason || 'STOCK_REPLENISHMENT',
      notes: data.notes || null,
      createdById: currentUser.id,
      createdBy: currentUser,
      confirmedById: null,
      confirmedBy: null,
      parentTransferId: data.parentTransferId || null,
      createdAt: new Date().toISOString(),
      confirmedAt: null
    };

    // Reserve the products in source location
    transferItems.forEach(item => {
      const invIndex = mutableInventory.findIndex(
        inv => inv.productId === item.productId && inv.locationId === data.fromLocationId
      );
      if (invIndex >= 0) {
        mutableInventory[invIndex].reservedQuantity =
          (mutableInventory[invIndex].reservedQuantity || 0) + item.quantity;
      }
    });

    mutableTransfers.push(newTransfer);
    return HttpResponse.json(apiResponse(newTransfer));
  }),

  http.put(`${API_BASE}/transfers/:id/confirm`, async ({ params, request }) => {
    await delay(100);
    const index = mutableTransfers.findIndex(t => t.id === params.id);
    if (index === -1) {
      return errorResponse('Transfer not found', 404);
    }

    const transfer = mutableTransfers[index];
    if (transfer.status !== 'PENDING') {
      return errorResponse('Transfer is not pending', 400);
    }

    // Move items from source to destination
    transfer.items.forEach(item => {
      // Deduct from source
      const sourceIndex = mutableInventory.findIndex(
        inv => inv.productId === item.productId && inv.locationId === transfer.fromLocationId
      );
      if (sourceIndex >= 0) {
        mutableInventory[sourceIndex].quantity -= item.quantity;
        mutableInventory[sourceIndex].reservedQuantity =
          Math.max(0, (mutableInventory[sourceIndex].reservedQuantity || 0) - item.quantity);
      }

      // Add to destination
      const destIndex = mutableInventory.findIndex(
        inv => inv.productId === item.productId && inv.locationId === transfer.toLocationId
      );
      if (destIndex >= 0) {
        mutableInventory[destIndex].quantity += item.quantity;
      } else {
        // Create new inventory record at destination
        mutableInventory.push({
          id: generateId('inv'),
          productId: item.productId,
          locationId: transfer.toLocationId,
          quantity: item.quantity,
          reservedQuantity: 0,
          minQuantity: 1
        });
      }
    });

    mutableTransfers[index] = {
      ...transfer,
      status: 'COMPLETED',
      confirmedById: currentUser.id,
      confirmedBy: currentUser,
      confirmedAt: new Date().toISOString()
    };

    return HttpResponse.json(apiResponse(mutableTransfers[index]));
  }),

  http.put(`${API_BASE}/transfers/:id/reject`, async ({ params, request }) => {
    await delay(100);
    const data = await request.json();
    const index = mutableTransfers.findIndex(t => t.id === params.id);
    if (index === -1) {
      return errorResponse('Transfer not found', 404);
    }

    const transfer = mutableTransfers[index];
    if (transfer.status !== 'PENDING') {
      return errorResponse('Transfer is not pending', 400);
    }

    // Release reserved items in source location
    transfer.items.forEach(item => {
      const invIndex = mutableInventory.findIndex(
        inv => inv.productId === item.productId && inv.locationId === transfer.fromLocationId
      );
      if (invIndex >= 0) {
        mutableInventory[invIndex].reservedQuantity =
          Math.max(0, (mutableInventory[invIndex].reservedQuantity || 0) - item.quantity);
      }
    });

    mutableTransfers[index] = {
      ...transfer,
      status: 'REJECTED',
      rejectionReason: data.reason || 'No reason provided',
      rejectedById: currentUser.id,
      rejectedBy: currentUser,
      rejectedAt: new Date().toISOString()
    };

    return HttpResponse.json(apiResponse(mutableTransfers[index]));
  }),

  http.put(`${API_BASE}/transfers/:id/cancel`, async ({ params, request }) => {
    await delay(100);
    const data = await request.json();
    const index = mutableTransfers.findIndex(t => t.id === params.id);
    if (index === -1) {
      return errorResponse('Transfer not found', 404);
    }

    const transfer = mutableTransfers[index];
    if (transfer.status !== 'PENDING') {
      return errorResponse('Transfer is not pending', 400);
    }

    // Release reserved items in source location
    transfer.items.forEach(item => {
      const invIndex = mutableInventory.findIndex(
        inv => inv.productId === item.productId && inv.locationId === transfer.fromLocationId
      );
      if (invIndex >= 0) {
        mutableInventory[invIndex].reservedQuantity =
          Math.max(0, (mutableInventory[invIndex].reservedQuantity || 0) - item.quantity);
      }
    });

    mutableTransfers[index] = {
      ...transfer,
      status: 'CANCELLED',
      cancellationReason: data.reason || 'No reason provided',
      cancelledById: currentUser.id,
      cancelledBy: currentUser,
      cancelledAt: new Date().toISOString()
    };

    return HttpResponse.json(apiResponse(mutableTransfers[index]));
  }),

  http.post(`${API_BASE}/transfers/validate`, async ({ request }) => {
    await delay(50);
    const data = await request.json();
    // Validate that source has enough stock
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

  http.patch(`${API_BASE}/transfers/:id`, async ({ params, request }) => {
    await delay(50);
    const data = await request.json();
    const index = mutableTransfers.findIndex(t => t.id === params.id);
    if (index === -1) {
      return errorResponse('Transfer not found', 404);
    }
    mutableTransfers[index] = { ...mutableTransfers[index], ...data };
    return HttpResponse.json(apiResponse(mutableTransfers[index]));
  }),

  http.delete(`${API_BASE}/transfers/:id`, async ({ params }) => {
    await delay(50);
    const index = mutableTransfers.findIndex(t => t.id === params.id);
    if (index === -1) {
      return errorResponse('Transfer not found', 404);
    }
    mutableTransfers.splice(index, 1);
    return HttpResponse.json(apiResponse({ message: 'Transfer deleted successfully' }));
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

  // Sales mutations
  http.post(`${API_BASE}/sales`, async ({ request }) => {
    await delay(100);
    const data = await request.json();

    const location = mutableLocations.find(l => l.id === data.locationId);

    const saleItems = data.items.map((item, idx) => {
      const product = mutableProducts.find(p => p.id === item.productId);
      return {
        id: `si-${Date.now()}-${idx}`,
        productId: item.productId,
        product,
        quantity: item.quantity,
        unitPrice: item.unitPrice || product?.sellingPrice || 0,
        totalPrice: item.quantity * (item.unitPrice || product?.sellingPrice || 0)
      };
    });

    const subtotal = saleItems.reduce((sum, item) => sum + item.totalPrice, 0);
    const totalAmount = subtotal - (data.discount || 0);

    const newSale = {
      id: generateId('sale'),
      saleNumber: `SPR-${new Date().getFullYear()}-${String(mutableSales.length + 1).padStart(4, '0')}`,
      locationId: data.locationId,
      location,
      userId: currentUser.id,
      user: currentUser,
      userFullName: `${currentUser.firstName} ${currentUser.lastName}`,
      customerFirstName: data.customerFirstName || null,
      customerLastName: data.customerLastName || null,
      customerEmail: data.customerEmail || null,
      customerPhone: data.customerPhone || null,
      items: saleItems,
      subtotal,
      discount: data.discount || 0,
      totalAmount,
      paymentMethod: data.paymentMethod || 'CASH',
      status: 'COMPLETED',
      notes: data.notes || null,
      createdAt: new Date().toISOString(),
      completedAt: new Date().toISOString()
    };

    // Deduct inventory
    saleItems.forEach(item => {
      const invIndex = mutableInventory.findIndex(
        inv => inv.productId === item.productId && inv.locationId === data.locationId
      );
      if (invIndex >= 0) {
        mutableInventory[invIndex].quantity = Math.max(0, mutableInventory[invIndex].quantity - item.quantity);
      }
    });

    mutableSales.push(newSale);
    return HttpResponse.json(apiResponse(newSale));
  }),

  http.post(`${API_BASE}/sales/:id/cancel`, async ({ params, request }) => {
    await delay(100);
    const data = await request.json();
    const index = mutableSales.findIndex(s => s.id === params.id);
    if (index === -1) {
      return errorResponse('Sale not found', 404);
    }

    const sale = mutableSales[index];

    // Restore inventory
    sale.items.forEach(item => {
      const invIndex = mutableInventory.findIndex(
        inv => inv.productId === item.productId && inv.locationId === sale.locationId
      );
      if (invIndex >= 0) {
        mutableInventory[invIndex].quantity += item.quantity;
      }
    });

    mutableSales[index] = {
      ...sale,
      status: 'CANCELLED',
      cancellationReason: data.reason || 'No reason provided',
      cancelledAt: new Date().toISOString()
    };

    return HttpResponse.json(apiResponse(mutableSales[index]));
  }),

  http.post(`${API_BASE}/sales/:id/return`, async ({ params, request }) => {
    await delay(100);
    const data = await request.json();
    const index = mutableSales.findIndex(s => s.id === params.id);
    if (index === -1) {
      return errorResponse('Sale not found', 404);
    }

    const sale = mutableSales[index];

    // Restore inventory for returned items
    const returnedItems = data.items || sale.items;
    returnedItems.forEach(item => {
      const invIndex = mutableInventory.findIndex(
        inv => inv.productId === item.productId && inv.locationId === sale.locationId
      );
      if (invIndex >= 0) {
        mutableInventory[invIndex].quantity += item.quantity;
      }
    });

    mutableSales[index] = {
      ...sale,
      status: 'RETURNED',
      returnReason: data.reason || 'No reason provided',
      returnedAt: new Date().toISOString()
    };

    return HttpResponse.json(apiResponse(mutableSales[index]));
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

  // History mutations
  http.post(`${API_BASE}/history/:id/revert`, async ({ params, request }) => {
    await delay(100);
    const data = await request.json();
    // In demo mode, just acknowledge the revert
    return HttpResponse.json(apiResponse({
      message: 'Operation reverted successfully',
      reason: data.reason
    }));
  }),

  http.delete(`${API_BASE}/history/:id`, async ({ params }) => {
    await delay(50);
    return HttpResponse.json(apiResponse({ message: 'History entry deleted successfully' }));
  }),

  http.delete(`${API_BASE}/history`, async () => {
    await delay(100);
    return HttpResponse.json(apiResponse({ message: 'History cleared successfully' }));
  }),

  http.delete(`${API_BASE}/history/batch`, async ({ request }) => {
    await delay(100);
    const ids = await request.json();
    return HttpResponse.json(apiResponse({ deletedCount: ids.length }));
  }),

  // ========== STATISTICS ENDPOINTS ==========
  http.get(`${API_BASE}/statistics/dashboard`, async () => {
    await delay(150);
    const totalValue = mutableInventory.reduce((sum, inv) => {
      const product = mutableProducts.find(p => p.id === inv.productId);
      return sum + (product ? product.sellingPrice * inv.quantity : 0);
    }, 0);

    const completedSales = mutableSales.filter(s => s.status === 'COMPLETED');
    const thisMonth = new Date().toISOString().slice(0, 7); // YYYY-MM
    const salesThisMonth = completedSales.filter(s => s.createdAt.startsWith(thisMonth));
    const salesRevenue = salesThisMonth.reduce((sum, s) => sum + s.totalAmount, 0);

    const pendingTransfers = mutableTransfers.filter(t => t.status === 'PENDING').length;

    return HttpResponse.json(apiResponse({
      totalProducts: mutableProducts.filter(p => p.status === 'ACTIVE').length,
      totalLocations: mutableLocations.filter(l => l.status === 'ACTIVE').length,
      totalInventoryValue: totalValue,
      salesThisMonth: salesThisMonth.length,
      salesRevenueThisMonth: salesRevenue,
      transfersPending: pendingTransfers
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

  // Add stock to inventory (POST variant used by some services)
  http.post(`${API_BASE}/inventory/frames`, async ({ request }) => {
    await delay(100);
    const data = await request.json();
    return handleAddInventory(data);
  }),

  http.post(`${API_BASE}/inventory/contact-lenses`, async ({ request }) => {
    await delay(100);
    const data = await request.json();
    return handleAddInventory(data);
  }),

  http.post(`${API_BASE}/inventory/solutions`, async ({ request }) => {
    await delay(100);
    const data = await request.json();
    return handleAddInventory(data);
  }),

  http.post(`${API_BASE}/inventory/sunglasses`, async ({ request }) => {
    await delay(100);
    const data = await request.json();
    return handleAddInventory(data);
  }),

  http.post(`${API_BASE}/inventory/other-products`, async ({ request }) => {
    await delay(100);
    const data = await request.json();
    return handleAddInventory(data);
  }),

  // ========== COMPANY SETTINGS ==========
  http.get(`${API_BASE}/settings/company`, async () => {
    await delay(50);
    return HttpResponse.json(apiResponse(companySettings));
  }),

  http.put(`${API_BASE}/company-settings`, async ({ request }) => {
    await delay(100);
    const data = await request.json();
    companySettings = { ...companySettings, ...data };
    return HttpResponse.json(apiResponse(companySettings));
  }),

  http.post(`${API_BASE}/company-settings/logo`, async () => {
    await delay(200);
    // In demo mode, just acknowledge the upload
    companySettings.logoUrl = '/demo-logo.png';
    return HttpResponse.json(apiResponse({ logoUrl: companySettings.logoUrl }));
  }),

  http.delete(`${API_BASE}/company-settings/logo`, async () => {
    await delay(50);
    companySettings.logoUrl = null;
    return HttpResponse.json(apiResponse({ message: 'Logo deleted successfully' }));
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
