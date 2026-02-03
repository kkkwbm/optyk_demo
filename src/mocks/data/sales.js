import { users } from './users';
import { locations } from './locations';
import { products } from './products';

// Helper to get user full name
const getUserFullName = (user) => user ? `${user.firstName} ${user.lastName}` : '-';

// Demo sales data
export const sales = [
  {
    id: 'sale-001',
    saleNumber: 'SPR-2024-0001',
    locationId: 'loc-002',
    location: locations.find(l => l.id === 'loc-002'),
    userId: 'usr-003',
    user: users.find(u => u.id === 'usr-003'),
    userFullName: getUserFullName(users.find(u => u.id === 'usr-003')),
    customerFirstName: 'Jan',
    customerLastName: 'Kowalski',
    customerEmail: 'jan.kowalski@email.pl',
    customerPhone: '+48 600 100 200',
    items: [
      {
        id: 'si-001',
        productId: 'prd-001',
        product: products.find(p => p.id === 'prd-001'),
        quantity: 1,
        unitPrice: 590.00,
        totalPrice: 590.00
      },
      {
        id: 'si-002',
        productId: 'prd-048',
        product: products.find(p => p.id === 'prd-048'),
        quantity: 1,
        unitPrice: 15.00,
        totalPrice: 15.00
      }
    ],
    subtotal: 605.00,
    discount: 0,
    totalAmount: 605.00,
    paymentMethod: 'CARD',
    status: 'COMPLETED',
    notes: 'Klient zadowolony z wyboru',
    createdAt: '2024-12-15T10:30:00Z',
    completedAt: '2024-12-15T10:35:00Z'
  },
  {
    id: 'sale-002',
    saleNumber: 'SPR-2024-0002',
    locationId: 'loc-002',
    location: locations.find(l => l.id === 'loc-002'),
    userId: 'usr-003',
    user: users.find(u => u.id === 'usr-003'),
    userFullName: getUserFullName(users.find(u => u.id === 'usr-003')),
    customerFirstName: 'Maria',
    customerLastName: 'Nowak',
    customerEmail: 'maria.nowak@email.pl',
    customerPhone: '+48 601 200 300',
    items: [
      {
        id: 'si-003',
        productId: 'prd-021',
        product: products.find(p => p.id === 'prd-021'),
        quantity: 2,
        unitPrice: 145.00,
        totalPrice: 290.00
      },
      {
        id: 'si-004',
        productId: 'prd-031',
        product: products.find(p => p.id === 'prd-031'),
        quantity: 1,
        unitPrice: 48.00,
        totalPrice: 48.00
      }
    ],
    subtotal: 338.00,
    discount: 0,
    totalAmount: 338.00,
    paymentMethod: 'CASH',
    status: 'COMPLETED',
    notes: null,
    createdAt: '2024-12-15T14:20:00Z',
    completedAt: '2024-12-15T14:25:00Z'
  },
  {
    id: 'sale-003',
    saleNumber: 'SPR-2024-0003',
    locationId: 'loc-003',
    location: locations.find(l => l.id === 'loc-003'),
    userId: 'usr-003',
    user: users.find(u => u.id === 'usr-003'),
    userFullName: getUserFullName(users.find(u => u.id === 'usr-003')),
    customerFirstName: 'Piotr',
    customerLastName: 'Wiśniewski',
    customerEmail: 'piotr.wisniewski@email.pl',
    customerPhone: '+48 602 300 400',
    items: [
      {
        id: 'si-005',
        productId: 'prd-004',
        product: products.find(p => p.id === 'prd-004'),
        quantity: 1,
        unitPrice: 1190.00,
        totalPrice: 1190.00
      }
    ],
    subtotal: 1190.00,
    discount: 100.00,
    totalAmount: 1090.00,
    paymentMethod: 'CARD',
    status: 'COMPLETED',
    notes: 'Rabat dla stałego klienta',
    createdAt: '2024-12-16T11:00:00Z',
    completedAt: '2024-12-16T11:10:00Z'
  },
  {
    id: 'sale-004',
    saleNumber: 'SPR-2024-0004',
    locationId: 'loc-004',
    location: locations.find(l => l.id === 'loc-004'),
    userId: 'usr-004',
    user: users.find(u => u.id === 'usr-004'),
    userFullName: getUserFullName(users.find(u => u.id === 'usr-004')),
    customerFirstName: 'Anna',
    customerLastName: 'Zielińska',
    customerEmail: 'anna.zielinska@email.pl',
    customerPhone: '+48 603 400 500',
    items: [
      {
        id: 'si-006',
        productId: 'prd-039',
        product: products.find(p => p.id === 'prd-039'),
        quantity: 1,
        unitPrice: 650.00,
        totalPrice: 650.00
      }
    ],
    subtotal: 650.00,
    discount: 0,
    totalAmount: 650.00,
    paymentMethod: 'CARD',
    status: 'COMPLETED',
    notes: null,
    createdAt: '2024-12-17T09:45:00Z',
    completedAt: '2024-12-17T09:50:00Z'
  },
  {
    id: 'sale-005',
    saleNumber: 'SPR-2024-0005',
    locationId: 'loc-002',
    location: locations.find(l => l.id === 'loc-002'),
    userId: 'usr-003',
    user: users.find(u => u.id === 'usr-003'),
    userFullName: getUserFullName(users.find(u => u.id === 'usr-003')),
    customerFirstName: 'Tomasz',
    customerLastName: 'Lewandowski',
    customerEmail: 'tomasz.lewandowski@email.pl',
    customerPhone: '+48 604 500 600',
    items: [
      {
        id: 'si-007',
        productId: 'prd-005',
        product: products.find(p => p.id === 'prd-005'),
        quantity: 1,
        unitPrice: 1490.00,
        totalPrice: 1490.00
      },
      {
        id: 'si-008',
        productId: 'prd-047',
        product: products.find(p => p.id === 'prd-047'),
        quantity: 1,
        unitPrice: 89.00,
        totalPrice: 89.00
      },
      {
        id: 'si-009',
        productId: 'prd-049',
        product: products.find(p => p.id === 'prd-049'),
        quantity: 1,
        unitPrice: 28.00,
        totalPrice: 28.00
      }
    ],
    subtotal: 1607.00,
    discount: 50.00,
    totalAmount: 1557.00,
    paymentMethod: 'CARD',
    status: 'COMPLETED',
    notes: 'Zestaw prezentowy',
    createdAt: '2024-12-18T15:30:00Z',
    completedAt: '2024-12-18T15:40:00Z'
  },
  {
    id: 'sale-006',
    saleNumber: 'SPR-2024-0006',
    locationId: 'loc-003',
    location: locations.find(l => l.id === 'loc-003'),
    userId: 'usr-003',
    user: users.find(u => u.id === 'usr-003'),
    userFullName: getUserFullName(users.find(u => u.id === 'usr-003')),
    customerFirstName: 'Katarzyna',
    customerLastName: 'Dąbrowska',
    customerEmail: 'katarzyna.dabrowska@email.pl',
    customerPhone: '+48 605 600 700',
    items: [
      {
        id: 'si-010',
        productId: 'prd-025',
        product: products.find(p => p.id === 'prd-025'),
        quantity: 3,
        unitPrice: 165.00,
        totalPrice: 495.00
      }
    ],
    subtotal: 495.00,
    discount: 0,
    totalAmount: 495.00,
    paymentMethod: 'CASH',
    status: 'COMPLETED',
    notes: 'Zapas soczewek na 3 miesiące',
    createdAt: '2024-12-19T10:15:00Z',
    completedAt: '2024-12-19T10:20:00Z'
  },
  {
    id: 'sale-007',
    saleNumber: 'SPR-2024-0007',
    locationId: 'loc-004',
    location: locations.find(l => l.id === 'loc-004'),
    userId: 'usr-004',
    user: users.find(u => u.id === 'usr-004'),
    userFullName: getUserFullName(users.find(u => u.id === 'usr-004')),
    customerFirstName: 'Michał',
    customerLastName: 'Wójcik',
    customerEmail: 'michal.wojcik@email.pl',
    customerPhone: '+48 606 700 800',
    items: [
      {
        id: 'si-011',
        productId: 'prd-002',
        product: products.find(p => p.id === 'prd-002'),
        quantity: 1,
        unitPrice: 540.00,
        totalPrice: 540.00
      }
    ],
    subtotal: 540.00,
    discount: 0,
    totalAmount: 540.00,
    paymentMethod: 'CARD',
    status: 'COMPLETED',
    notes: null,
    createdAt: '2024-12-20T13:00:00Z',
    completedAt: '2024-12-20T13:05:00Z'
  },
  {
    id: 'sale-008',
    saleNumber: 'SPR-2024-0008',
    locationId: 'loc-002',
    location: locations.find(l => l.id === 'loc-002'),
    userId: 'usr-003',
    user: users.find(u => u.id === 'usr-003'),
    userFullName: getUserFullName(users.find(u => u.id === 'usr-003')),
    customerFirstName: 'Agnieszka',
    customerLastName: 'Kamińska',
    customerEmail: 'agnieszka.kaminska@email.pl',
    customerPhone: '+48 607 800 900',
    items: [
      {
        id: 'si-012',
        productId: 'prd-041',
        product: products.find(p => p.id === 'prd-041'),
        quantity: 1,
        unitPrice: 820.00,
        totalPrice: 820.00
      }
    ],
    subtotal: 820.00,
    discount: 0,
    totalAmount: 820.00,
    paymentMethod: 'CARD',
    status: 'COMPLETED',
    notes: 'Oakley Holbrook Prizm - polaryzacja',
    createdAt: '2024-12-21T11:30:00Z',
    completedAt: '2024-12-21T11:35:00Z'
  },
  {
    id: 'sale-009',
    saleNumber: 'SPR-2024-0009',
    locationId: 'loc-003',
    location: locations.find(l => l.id === 'loc-003'),
    userId: 'usr-003',
    user: users.find(u => u.id === 'usr-003'),
    userFullName: getUserFullName(users.find(u => u.id === 'usr-003')),
    customerFirstName: 'Robert',
    customerLastName: 'Szymański',
    customerEmail: 'robert.szymanski@email.pl',
    customerPhone: '+48 608 900 100',
    items: [
      {
        id: 'si-013',
        productId: 'prd-023',
        product: products.find(p => p.id === 'prd-023'),
        quantity: 2,
        unitPrice: 115.00,
        totalPrice: 230.00
      },
      {
        id: 'si-014',
        productId: 'prd-033',
        product: products.find(p => p.id === 'prd-033'),
        quantity: 2,
        unitPrice: 54.00,
        totalPrice: 108.00
      }
    ],
    subtotal: 338.00,
    discount: 0,
    totalAmount: 338.00,
    paymentMethod: 'CASH',
    status: 'COMPLETED',
    notes: null,
    createdAt: '2024-12-22T16:45:00Z',
    completedAt: '2024-12-22T16:50:00Z'
  },
  {
    id: 'sale-010',
    saleNumber: 'SPR-2024-0010',
    locationId: 'loc-002',
    location: locations.find(l => l.id === 'loc-002'),
    userId: 'usr-003',
    user: users.find(u => u.id === 'usr-003'),
    userFullName: getUserFullName(users.find(u => u.id === 'usr-003')),
    customerFirstName: 'Ewa',
    customerLastName: 'Woźniak',
    customerEmail: 'ewa.wozniak@email.pl',
    customerPhone: '+48 609 100 200',
    items: [
      {
        id: 'si-015',
        productId: 'prd-006',
        product: products.find(p => p.id === 'prd-006'),
        quantity: 1,
        unitPrice: 1290.00,
        totalPrice: 1290.00
      }
    ],
    subtotal: 1290.00,
    discount: 0,
    totalAmount: 1290.00,
    paymentMethod: 'CARD',
    status: 'COMPLETED',
    notes: 'Tom Ford - klient VIP',
    createdAt: '2024-12-23T12:00:00Z',
    completedAt: '2024-12-23T12:15:00Z'
  },
  {
    id: 'sale-011',
    saleNumber: 'SPR-2025-0001',
    locationId: 'loc-002',
    location: locations.find(l => l.id === 'loc-002'),
    userId: 'usr-003',
    user: users.find(u => u.id === 'usr-003'),
    userFullName: getUserFullName(users.find(u => u.id === 'usr-003')),
    customerFirstName: 'Paweł',
    customerLastName: 'Kozłowski',
    customerEmail: 'pawel.kozlowski@email.pl',
    customerPhone: '+48 610 200 300',
    items: [
      {
        id: 'si-016',
        productId: 'prd-012',
        product: products.find(p => p.id === 'prd-012'),
        quantity: 1,
        unitPrice: 650.00,
        totalPrice: 650.00
      },
      {
        id: 'si-017',
        productId: 'prd-048',
        product: products.find(p => p.id === 'prd-048'),
        quantity: 2,
        unitPrice: 15.00,
        totalPrice: 30.00
      }
    ],
    subtotal: 680.00,
    discount: 0,
    totalAmount: 680.00,
    paymentMethod: 'CARD',
    status: 'COMPLETED',
    notes: null,
    createdAt: '2025-01-02T10:00:00Z',
    completedAt: '2025-01-02T10:10:00Z'
  },
  {
    id: 'sale-012',
    saleNumber: 'SPR-2025-0002',
    locationId: 'loc-004',
    location: locations.find(l => l.id === 'loc-004'),
    userId: 'usr-004',
    user: users.find(u => u.id === 'usr-004'),
    userFullName: getUserFullName(users.find(u => u.id === 'usr-004')),
    customerFirstName: 'Monika',
    customerLastName: 'Jankowska',
    customerEmail: 'monika.jankowska@email.pl',
    customerPhone: '+48 611 300 400',
    items: [
      {
        id: 'si-018',
        productId: 'prd-028',
        product: products.find(p => p.id === 'prd-028'),
        quantity: 1,
        unitPrice: 120.00,
        totalPrice: 120.00
      }
    ],
    subtotal: 120.00,
    discount: 0,
    totalAmount: 120.00,
    paymentMethod: 'CASH',
    status: 'COMPLETED',
    notes: null,
    createdAt: '2025-01-03T14:30:00Z',
    completedAt: '2025-01-03T14:35:00Z'
  },
  {
    id: 'sale-013',
    saleNumber: 'SPR-2025-0003',
    locationId: 'loc-003',
    location: locations.find(l => l.id === 'loc-003'),
    userId: 'usr-003',
    user: users.find(u => u.id === 'usr-003'),
    userFullName: getUserFullName(users.find(u => u.id === 'usr-003')),
    customerFirstName: 'Krzysztof',
    customerLastName: 'Mazur',
    customerEmail: 'krzysztof.mazur@email.pl',
    customerPhone: '+48 612 400 500',
    items: [
      {
        id: 'si-019',
        productId: 'prd-015',
        product: products.find(p => p.id === 'prd-015'),
        quantity: 1,
        unitPrice: 1390.00,
        totalPrice: 1390.00
      }
    ],
    subtotal: 1390.00,
    discount: 139.00,
    totalAmount: 1251.00,
    paymentMethod: 'CARD',
    status: 'COMPLETED',
    notes: 'Gucci Classic - 10% rabatu',
    createdAt: '2025-01-05T11:20:00Z',
    completedAt: '2025-01-05T11:30:00Z'
  },
  {
    id: 'sale-014',
    saleNumber: 'SPR-2025-0004',
    locationId: 'loc-002',
    location: locations.find(l => l.id === 'loc-002'),
    userId: 'usr-003',
    user: users.find(u => u.id === 'usr-003'),
    userFullName: getUserFullName(users.find(u => u.id === 'usr-003')),
    customerFirstName: 'Magdalena',
    customerLastName: 'Krawczyk',
    customerEmail: 'magdalena.krawczyk@email.pl',
    customerPhone: '+48 613 500 600',
    items: [
      {
        id: 'si-020',
        productId: 'prd-022',
        product: products.find(p => p.id === 'prd-022'),
        quantity: 1,
        unitPrice: 350.00,
        totalPrice: 350.00
      },
      {
        id: 'si-021',
        productId: 'prd-036',
        product: products.find(p => p.id === 'prd-036'),
        quantity: 1,
        unitPrice: 48.00,
        totalPrice: 48.00
      }
    ],
    subtotal: 398.00,
    discount: 0,
    totalAmount: 398.00,
    paymentMethod: 'CARD',
    status: 'COMPLETED',
    notes: null,
    createdAt: '2025-01-08T09:15:00Z',
    completedAt: '2025-01-08T09:20:00Z'
  },
  {
    id: 'sale-015',
    saleNumber: 'SPR-2025-0005',
    locationId: 'loc-003',
    location: locations.find(l => l.id === 'loc-003'),
    userId: 'usr-003',
    user: users.find(u => u.id === 'usr-003'),
    userFullName: getUserFullName(users.find(u => u.id === 'usr-003')),
    customerFirstName: 'Jakub',
    customerLastName: 'Piotrowski',
    customerEmail: 'jakub.piotrowski@email.pl',
    customerPhone: '+48 614 600 700',
    items: [
      {
        id: 'si-022',
        productId: 'prd-043',
        product: products.find(p => p.id === 'prd-043'),
        quantity: 1,
        unitPrice: 1590.00,
        totalPrice: 1590.00
      }
    ],
    subtotal: 1590.00,
    discount: 0,
    totalAmount: 1590.00,
    paymentMethod: 'CARD',
    status: 'COMPLETED',
    notes: 'Gucci Oversized - zakup prezentowy',
    createdAt: '2025-01-10T15:00:00Z',
    completedAt: '2025-01-10T15:10:00Z'
  },
  {
    id: 'sale-016',
    saleNumber: 'SPR-2025-0006',
    locationId: 'loc-002',
    location: locations.find(l => l.id === 'loc-002'),
    userId: 'usr-003',
    user: users.find(u => u.id === 'usr-003'),
    userFullName: getUserFullName(users.find(u => u.id === 'usr-003')),
    customerFirstName: 'Andrzej',
    customerLastName: 'Nowicki',
    customerEmail: 'andrzej.nowicki@email.pl',
    customerPhone: '+48 615 700 800',
    items: [
      {
        id: 'si-023',
        productId: 'prd-003',
        product: products.find(p => p.id === 'prd-003'),
        quantity: 1,
        unitPrice: 720.00,
        totalPrice: 720.00
      }
    ],
    subtotal: 720.00,
    discount: 0,
    totalAmount: 720.00,
    paymentMethod: 'CARD',
    status: 'CANCELLED',
    notes: 'Klient zrezygnował z zakupu',
    createdAt: '2025-01-12T11:00:00Z',
    cancelledAt: '2025-01-12T11:30:00Z'
  },
  {
    id: 'sale-017',
    saleNumber: 'SPR-2025-0007',
    locationId: 'loc-003',
    location: locations.find(l => l.id === 'loc-003'),
    userId: 'usr-003',
    user: users.find(u => u.id === 'usr-003'),
    userFullName: getUserFullName(users.find(u => u.id === 'usr-003')),
    customerFirstName: 'Barbara',
    customerLastName: 'Kowalczyk',
    customerEmail: 'barbara.kowalczyk@email.pl',
    customerPhone: '+48 616 800 900',
    items: [
      {
        id: 'si-024',
        productId: 'prd-021',
        product: products.find(p => p.id === 'prd-021'),
        quantity: 1,
        unitPrice: 145.00,
        totalPrice: 145.00
      }
    ],
    subtotal: 145.00,
    discount: 0,
    totalAmount: 145.00,
    paymentMethod: 'CASH',
    status: 'RETURNED',
    notes: 'Zwrot - produkt nie odpowiadał klientowi',
    createdAt: '2025-01-14T14:00:00Z',
    completedAt: '2025-01-14T14:10:00Z',
    returnedAt: '2025-01-15T10:00:00Z'
  },
  {
    id: 'sale-018',
    saleNumber: 'SPR-2025-0008',
    locationId: 'loc-004',
    location: locations.find(l => l.id === 'loc-004'),
    userId: 'usr-004',
    user: users.find(u => u.id === 'usr-004'),
    userFullName: getUserFullName(users.find(u => u.id === 'usr-004')),
    customerFirstName: 'Marek',
    customerLastName: 'Zieliński',
    customerEmail: 'marek.zielinski@email.pl',
    customerPhone: '+48 617 900 100',
    items: [
      {
        id: 'si-025',
        productId: 'prd-007',
        product: products.find(p => p.id === 'prd-007'),
        quantity: 1,
        unitPrice: 890.00,
        totalPrice: 890.00
      }
    ],
    subtotal: 890.00,
    discount: 0,
    totalAmount: 890.00,
    paymentMethod: 'CARD',
    status: 'CANCELLED',
    notes: 'Anulowano - klient zmienił zdanie',
    createdAt: '2025-01-16T09:30:00Z',
    cancelledAt: '2025-01-16T10:00:00Z'
  }
];

// Calculate totals for statistics
export const calculateSalesStats = (salesList, locationId = null) => {
  let filtered = salesList.filter(s => s.status === 'COMPLETED');
  if (locationId) {
    filtered = filtered.filter(s => s.locationId === locationId);
  }

  const totalSales = filtered.length;
  const totalRevenue = filtered.reduce((sum, s) => sum + s.totalAmount, 0);
  const averageSale = totalSales > 0 ? totalRevenue / totalSales : 0;

  return {
    totalSales,
    totalRevenue,
    averageSale,
    todaySales: 0,
    todayRevenue: 0
  };
};
