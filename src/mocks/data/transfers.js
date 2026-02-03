import { users } from './users';
import { locations } from './locations';
import { products } from './products';

// Demo transfers data
export const transfers = [
  // Completed transfers
  {
    id: 'trf-001',
    transferNumber: 'TRF-2024-0001',
    fromLocationId: 'loc-001',
    fromLocation: locations.find(l => l.id === 'loc-001'),
    toLocationId: 'loc-002',
    toLocation: locations.find(l => l.id === 'loc-002'),
    items: [
      {
        id: 'ti-001',
        productId: 'prd-001',
        product: products.find(p => p.id === 'prd-001'),
        quantity: 3
      },
      {
        id: 'ti-002',
        productId: 'prd-002',
        product: products.find(p => p.id === 'prd-002'),
        quantity: 2
      }
    ],
    status: 'COMPLETED',
    reason: 'STOCK_REPLENISHMENT',
    notes: 'Uzupełnienie stanów magazynowych',
    createdById: 'usr-001',
    createdBy: users.find(u => u.id === 'usr-001'),
    confirmedById: 'usr-003',
    confirmedBy: users.find(u => u.id === 'usr-003'),
    parentTransferId: null,
    createdAt: '2024-12-10T09:00:00Z',
    confirmedAt: '2024-12-10T10:30:00Z'
  },
  {
    id: 'trf-002',
    transferNumber: 'TRF-2024-0002',
    fromLocationId: 'loc-001',
    fromLocation: locations.find(l => l.id === 'loc-001'),
    toLocationId: 'loc-003',
    toLocation: locations.find(l => l.id === 'loc-003'),
    items: [
      {
        id: 'ti-003',
        productId: 'prd-021',
        product: products.find(p => p.id === 'prd-021'),
        quantity: 10
      },
      {
        id: 'ti-004',
        productId: 'prd-023',
        product: products.find(p => p.id === 'prd-023'),
        quantity: 8
      },
      {
        id: 'ti-005',
        productId: 'prd-031',
        product: products.find(p => p.id === 'prd-031'),
        quantity: 12
      }
    ],
    status: 'COMPLETED',
    reason: 'STOCK_REPLENISHMENT',
    notes: 'Soczewki i płyny dla salonu Mokotów',
    createdById: 'usr-001',
    createdBy: users.find(u => u.id === 'usr-001'),
    confirmedById: 'usr-003',
    confirmedBy: users.find(u => u.id === 'usr-003'),
    parentTransferId: null,
    createdAt: '2024-12-12T11:00:00Z',
    confirmedAt: '2024-12-12T14:00:00Z'
  },
  {
    id: 'trf-003',
    transferNumber: 'TRF-2024-0003',
    fromLocationId: 'loc-002',
    fromLocation: locations.find(l => l.id === 'loc-002'),
    toLocationId: 'loc-003',
    toLocation: locations.find(l => l.id === 'loc-003'),
    items: [
      {
        id: 'ti-006',
        productId: 'prd-004',
        product: products.find(p => p.id === 'prd-004'),
        quantity: 1
      },
      {
        id: 'ti-007',
        productId: 'prd-005',
        product: products.find(p => p.id === 'prd-005'),
        quantity: 1
      }
    ],
    status: 'COMPLETED',
    reason: 'CUSTOMER_SELECTION',
    notes: 'Oprawki do przymiarki dla klientki',
    createdById: 'usr-003',
    createdBy: users.find(u => u.id === 'usr-003'),
    confirmedById: 'usr-003',
    confirmedBy: users.find(u => u.id === 'usr-003'),
    parentTransferId: null,
    createdAt: '2024-12-15T10:00:00Z',
    confirmedAt: '2024-12-15T11:00:00Z'
  },
  {
    id: 'trf-004',
    transferNumber: 'TRF-2024-0004',
    fromLocationId: 'loc-003',
    fromLocation: locations.find(l => l.id === 'loc-003'),
    toLocationId: 'loc-002',
    toLocation: locations.find(l => l.id === 'loc-002'),
    items: [
      {
        id: 'ti-008',
        productId: 'prd-004',
        product: products.find(p => p.id === 'prd-004'),
        quantity: 1
      }
    ],
    status: 'COMPLETED',
    reason: 'CUSTOMER_RETURN',
    notes: 'Zwrot niesprzedanej oprawy Prada',
    createdById: 'usr-003',
    createdBy: users.find(u => u.id === 'usr-003'),
    confirmedById: 'usr-003',
    confirmedBy: users.find(u => u.id === 'usr-003'),
    parentTransferId: 'trf-003',
    createdAt: '2024-12-16T14:00:00Z',
    confirmedAt: '2024-12-16T15:00:00Z'
  },
  {
    id: 'trf-005',
    transferNumber: 'TRF-2024-0005',
    fromLocationId: 'loc-001',
    fromLocation: locations.find(l => l.id === 'loc-001'),
    toLocationId: 'loc-004',
    toLocation: locations.find(l => l.id === 'loc-004'),
    items: [
      {
        id: 'ti-009',
        productId: 'prd-039',
        product: products.find(p => p.id === 'prd-039'),
        quantity: 2
      },
      {
        id: 'ti-010',
        productId: 'prd-040',
        product: products.find(p => p.id === 'prd-040'),
        quantity: 2
      }
    ],
    status: 'COMPLETED',
    reason: 'STOCK_REPLENISHMENT',
    notes: 'Okulary przeciwsłoneczne na sezon',
    createdById: 'usr-001',
    createdBy: users.find(u => u.id === 'usr-001'),
    confirmedById: 'usr-004',
    confirmedBy: users.find(u => u.id === 'usr-004'),
    parentTransferId: null,
    createdAt: '2024-12-18T09:00:00Z',
    confirmedAt: '2024-12-18T10:30:00Z'
  },
  {
    id: 'trf-006',
    transferNumber: 'TRF-2025-0001',
    fromLocationId: 'loc-001',
    fromLocation: locations.find(l => l.id === 'loc-001'),
    toLocationId: 'loc-002',
    toLocation: locations.find(l => l.id === 'loc-002'),
    items: [
      {
        id: 'ti-011',
        productId: 'prd-012',
        product: products.find(p => p.id === 'prd-012'),
        quantity: 2
      },
      {
        id: 'ti-012',
        productId: 'prd-017',
        product: products.find(p => p.id === 'prd-017'),
        quantity: 3
      }
    ],
    status: 'COMPLETED',
    reason: 'STOCK_REPLENISHMENT',
    notes: 'Ray-Ban na nowy rok',
    createdById: 'usr-001',
    createdBy: users.find(u => u.id === 'usr-001'),
    confirmedById: 'usr-003',
    confirmedBy: users.find(u => u.id === 'usr-003'),
    parentTransferId: null,
    createdAt: '2025-01-02T08:00:00Z',
    confirmedAt: '2025-01-02T09:00:00Z'
  },

  // Pending transfers
  {
    id: 'trf-007',
    transferNumber: 'TRF-2025-0002',
    fromLocationId: 'loc-001',
    fromLocation: locations.find(l => l.id === 'loc-001'),
    toLocationId: 'loc-003',
    toLocation: locations.find(l => l.id === 'loc-003'),
    items: [
      {
        id: 'ti-013',
        productId: 'prd-006',
        product: products.find(p => p.id === 'prd-006'),
        quantity: 1
      },
      {
        id: 'ti-014',
        productId: 'prd-008',
        product: products.find(p => p.id === 'prd-008'),
        quantity: 2
      }
    ],
    status: 'PENDING',
    reason: 'STOCK_REPLENISHMENT',
    notes: 'Tom Ford i Persol dla Mokotowa',
    createdById: 'usr-001',
    createdBy: users.find(u => u.id === 'usr-001'),
    confirmedById: null,
    confirmedBy: null,
    parentTransferId: null,
    createdAt: '2025-01-15T10:00:00Z',
    confirmedAt: null
  },
  {
    id: 'trf-008',
    transferNumber: 'TRF-2025-0003',
    fromLocationId: 'loc-002',
    fromLocation: locations.find(l => l.id === 'loc-002'),
    toLocationId: 'loc-004',
    toLocation: locations.find(l => l.id === 'loc-004'),
    items: [
      {
        id: 'ti-015',
        productId: 'prd-003',
        product: products.find(p => p.id === 'prd-003'),
        quantity: 1
      }
    ],
    status: 'PENDING',
    reason: 'CUSTOMER_SELECTION',
    notes: 'Oakley Airdrop do przymiarki',
    createdById: 'usr-003',
    createdBy: users.find(u => u.id === 'usr-003'),
    confirmedById: null,
    confirmedBy: null,
    parentTransferId: null,
    createdAt: '2025-01-20T14:00:00Z',
    confirmedAt: null
  },
  {
    id: 'trf-009',
    transferNumber: 'TRF-2025-0004',
    fromLocationId: 'loc-001',
    fromLocation: locations.find(l => l.id === 'loc-001'),
    toLocationId: 'loc-002',
    toLocation: locations.find(l => l.id === 'loc-002'),
    items: [
      {
        id: 'ti-016',
        productId: 'prd-025',
        product: products.find(p => p.id === 'prd-025'),
        quantity: 10
      },
      {
        id: 'ti-017',
        productId: 'prd-026',
        product: products.find(p => p.id === 'prd-026'),
        quantity: 5
      },
      {
        id: 'ti-018',
        productId: 'prd-032',
        product: products.find(p => p.id === 'prd-032'),
        quantity: 12
      }
    ],
    status: 'PENDING',
    reason: 'STOCK_REPLENISHMENT',
    notes: 'Duża dostawa soczewek Dailies Total1',
    createdById: 'usr-001',
    createdBy: users.find(u => u.id === 'usr-001'),
    confirmedById: null,
    confirmedBy: null,
    parentTransferId: null,
    createdAt: '2025-01-25T09:00:00Z',
    confirmedAt: null
  },

  // Rejected transfer
  {
    id: 'trf-010',
    transferNumber: 'TRF-2025-0005',
    fromLocationId: 'loc-003',
    fromLocation: locations.find(l => l.id === 'loc-003'),
    toLocationId: 'loc-004',
    toLocation: locations.find(l => l.id === 'loc-004'),
    items: [
      {
        id: 'ti-019',
        productId: 'prd-015',
        product: products.find(p => p.id === 'prd-015'),
        quantity: 1
      }
    ],
    status: 'REJECTED',
    reason: 'CUSTOMER_SELECTION',
    notes: 'Gucci do przymiarki',
    rejectionReason: 'Klient zrezygnował z wizyty',
    createdById: 'usr-003',
    createdBy: users.find(u => u.id === 'usr-003'),
    confirmedById: null,
    confirmedBy: null,
    rejectedById: 'usr-004',
    rejectedBy: users.find(u => u.id === 'usr-004'),
    parentTransferId: null,
    createdAt: '2025-01-10T11:00:00Z',
    confirmedAt: null,
    rejectedAt: '2025-01-10T16:00:00Z'
  },

  // Cancelled transfer
  {
    id: 'trf-011',
    transferNumber: 'TRF-2025-0006',
    fromLocationId: 'loc-001',
    fromLocation: locations.find(l => l.id === 'loc-001'),
    toLocationId: 'loc-004',
    toLocation: locations.find(l => l.id === 'loc-004'),
    items: [
      {
        id: 'ti-020',
        productId: 'prd-041',
        product: products.find(p => p.id === 'prd-041'),
        quantity: 2
      }
    ],
    status: 'CANCELLED',
    reason: 'STOCK_REPLENISHMENT',
    notes: 'Oakley Holbrook',
    cancellationReason: 'Błędnie wybrana lokalizacja docelowa',
    createdById: 'usr-001',
    createdBy: users.find(u => u.id === 'usr-001'),
    cancelledById: 'usr-001',
    cancelledBy: users.find(u => u.id === 'usr-001'),
    parentTransferId: null,
    createdAt: '2025-01-12T10:00:00Z',
    cancelledAt: '2025-01-12T10:15:00Z'
  },

  // Additional completed transfers - older history
  {
    id: 'trf-012',
    transferNumber: 'TRF-2024-0006',
    fromLocationId: 'loc-001',
    fromLocation: locations.find(l => l.id === 'loc-001'),
    toLocationId: 'loc-002',
    toLocation: locations.find(l => l.id === 'loc-002'),
    items: [
      {
        id: 'ti-021',
        productId: 'prd-007',
        product: products.find(p => p.id === 'prd-007'),
        quantity: 2
      },
      {
        id: 'ti-022',
        productId: 'prd-009',
        product: products.find(p => p.id === 'prd-009'),
        quantity: 1
      }
    ],
    status: 'COMPLETED',
    reason: 'STOCK_REPLENISHMENT',
    notes: 'Oprawki premium dla Śródmieścia',
    createdById: 'usr-001',
    createdBy: users.find(u => u.id === 'usr-001'),
    confirmedById: 'usr-003',
    confirmedBy: users.find(u => u.id === 'usr-003'),
    parentTransferId: null,
    createdAt: '2024-11-05T10:00:00Z',
    confirmedAt: '2024-11-05T11:30:00Z'
  },
  {
    id: 'trf-013',
    transferNumber: 'TRF-2024-0007',
    fromLocationId: 'loc-001',
    fromLocation: locations.find(l => l.id === 'loc-001'),
    toLocationId: 'loc-003',
    toLocation: locations.find(l => l.id === 'loc-003'),
    items: [
      {
        id: 'ti-023',
        productId: 'prd-027',
        product: products.find(p => p.id === 'prd-027'),
        quantity: 15
      },
      {
        id: 'ti-024',
        productId: 'prd-028',
        product: products.find(p => p.id === 'prd-028'),
        quantity: 10
      }
    ],
    status: 'COMPLETED',
    reason: 'STOCK_REPLENISHMENT',
    notes: 'Soczewki Acuvue dla Mokotowa',
    createdById: 'usr-001',
    createdBy: users.find(u => u.id === 'usr-001'),
    confirmedById: 'usr-003',
    confirmedBy: users.find(u => u.id === 'usr-003'),
    parentTransferId: null,
    createdAt: '2024-11-10T09:00:00Z',
    confirmedAt: '2024-11-10T10:00:00Z'
  },
  {
    id: 'trf-014',
    transferNumber: 'TRF-2024-0008',
    fromLocationId: 'loc-002',
    fromLocation: locations.find(l => l.id === 'loc-002'),
    toLocationId: 'loc-004',
    toLocation: locations.find(l => l.id === 'loc-004'),
    items: [
      {
        id: 'ti-025',
        productId: 'prd-010',
        product: products.find(p => p.id === 'prd-010'),
        quantity: 1
      }
    ],
    status: 'COMPLETED',
    reason: 'CUSTOMER_SELECTION',
    notes: 'Boss do przymiarki na Woli',
    createdById: 'usr-003',
    createdBy: users.find(u => u.id === 'usr-003'),
    confirmedById: 'usr-004',
    confirmedBy: users.find(u => u.id === 'usr-004'),
    parentTransferId: null,
    createdAt: '2024-11-15T14:00:00Z',
    confirmedAt: '2024-11-15T15:00:00Z'
  },
  {
    id: 'trf-015',
    transferNumber: 'TRF-2024-0009',
    fromLocationId: 'loc-004',
    fromLocation: locations.find(l => l.id === 'loc-004'),
    toLocationId: 'loc-002',
    toLocation: locations.find(l => l.id === 'loc-002'),
    items: [
      {
        id: 'ti-026',
        productId: 'prd-010',
        product: products.find(p => p.id === 'prd-010'),
        quantity: 1
      }
    ],
    status: 'COMPLETED',
    reason: 'CUSTOMER_RETURN',
    notes: 'Zwrot Boss - klient wybrał inny model',
    createdById: 'usr-004',
    createdBy: users.find(u => u.id === 'usr-004'),
    confirmedById: 'usr-003',
    confirmedBy: users.find(u => u.id === 'usr-003'),
    parentTransferId: 'trf-014',
    createdAt: '2024-11-17T10:00:00Z',
    confirmedAt: '2024-11-17T11:00:00Z'
  },
  {
    id: 'trf-016',
    transferNumber: 'TRF-2024-0010',
    fromLocationId: 'loc-001',
    fromLocation: locations.find(l => l.id === 'loc-001'),
    toLocationId: 'loc-004',
    toLocation: locations.find(l => l.id === 'loc-004'),
    items: [
      {
        id: 'ti-027',
        productId: 'prd-033',
        product: products.find(p => p.id === 'prd-033'),
        quantity: 20
      },
      {
        id: 'ti-028',
        productId: 'prd-034',
        product: products.find(p => p.id === 'prd-034'),
        quantity: 15
      }
    ],
    status: 'COMPLETED',
    reason: 'STOCK_REPLENISHMENT',
    notes: 'Płyny do soczewek dla salonu Wola',
    createdById: 'usr-001',
    createdBy: users.find(u => u.id === 'usr-001'),
    confirmedById: 'usr-004',
    confirmedBy: users.find(u => u.id === 'usr-004'),
    parentTransferId: null,
    createdAt: '2024-11-20T08:30:00Z',
    confirmedAt: '2024-11-20T09:30:00Z'
  },
  {
    id: 'trf-017',
    transferNumber: 'TRF-2024-0011',
    fromLocationId: 'loc-003',
    fromLocation: locations.find(l => l.id === 'loc-003'),
    toLocationId: 'loc-002',
    toLocation: locations.find(l => l.id === 'loc-002'),
    items: [
      {
        id: 'ti-029',
        productId: 'prd-042',
        product: products.find(p => p.id === 'prd-042'),
        quantity: 1
      },
      {
        id: 'ti-030',
        productId: 'prd-043',
        product: products.find(p => p.id === 'prd-043'),
        quantity: 1
      }
    ],
    status: 'COMPLETED',
    reason: 'CUSTOMER_SELECTION',
    notes: 'Okulary przeciwsłoneczne premium dla klienta VIP',
    createdById: 'usr-003',
    createdBy: users.find(u => u.id === 'usr-003'),
    confirmedById: 'usr-003',
    confirmedBy: users.find(u => u.id === 'usr-003'),
    parentTransferId: null,
    createdAt: '2024-11-25T11:00:00Z',
    confirmedAt: '2024-11-25T12:00:00Z'
  },
  {
    id: 'trf-018',
    transferNumber: 'TRF-2024-0012',
    fromLocationId: 'loc-001',
    fromLocation: locations.find(l => l.id === 'loc-001'),
    toLocationId: 'loc-002',
    toLocation: locations.find(l => l.id === 'loc-002'),
    items: [
      {
        id: 'ti-031',
        productId: 'prd-013',
        product: products.find(p => p.id === 'prd-013'),
        quantity: 3
      },
      {
        id: 'ti-032',
        productId: 'prd-014',
        product: products.find(p => p.id === 'prd-014'),
        quantity: 2
      },
      {
        id: 'ti-033',
        productId: 'prd-016',
        product: products.find(p => p.id === 'prd-016'),
        quantity: 2
      }
    ],
    status: 'COMPLETED',
    reason: 'STOCK_REPLENISHMENT',
    notes: 'Uzupełnienie oprawek przed świętami',
    createdById: 'usr-001',
    createdBy: users.find(u => u.id === 'usr-001'),
    confirmedById: 'usr-003',
    confirmedBy: users.find(u => u.id === 'usr-003'),
    parentTransferId: null,
    createdAt: '2024-12-01T09:00:00Z',
    confirmedAt: '2024-12-01T10:30:00Z'
  },
  {
    id: 'trf-019',
    transferNumber: 'TRF-2024-0013',
    fromLocationId: 'loc-001',
    fromLocation: locations.find(l => l.id === 'loc-001'),
    toLocationId: 'loc-003',
    toLocation: locations.find(l => l.id === 'loc-003'),
    items: [
      {
        id: 'ti-034',
        productId: 'prd-044',
        product: products.find(p => p.id === 'prd-044'),
        quantity: 2
      },
      {
        id: 'ti-035',
        productId: 'prd-045',
        product: products.find(p => p.id === 'prd-045'),
        quantity: 2
      }
    ],
    status: 'COMPLETED',
    reason: 'STOCK_REPLENISHMENT',
    notes: 'Okulary przeciwsłoneczne Versace i Dior',
    createdById: 'usr-001',
    createdBy: users.find(u => u.id === 'usr-001'),
    confirmedById: 'usr-003',
    confirmedBy: users.find(u => u.id === 'usr-003'),
    parentTransferId: null,
    createdAt: '2024-12-05T10:00:00Z',
    confirmedAt: '2024-12-05T11:00:00Z'
  },

  // More 2025 transfers
  {
    id: 'trf-020',
    transferNumber: 'TRF-2025-0007',
    fromLocationId: 'loc-002',
    fromLocation: locations.find(l => l.id === 'loc-002'),
    toLocationId: 'loc-003',
    toLocation: locations.find(l => l.id === 'loc-003'),
    items: [
      {
        id: 'ti-036',
        productId: 'prd-011',
        product: products.find(p => p.id === 'prd-011'),
        quantity: 1
      }
    ],
    status: 'COMPLETED',
    reason: 'CUSTOMER_SELECTION',
    notes: 'Carrera do przymiarki',
    createdById: 'usr-003',
    createdBy: users.find(u => u.id === 'usr-003'),
    confirmedById: 'usr-003',
    confirmedBy: users.find(u => u.id === 'usr-003'),
    parentTransferId: null,
    createdAt: '2025-01-05T14:00:00Z',
    confirmedAt: '2025-01-05T15:00:00Z'
  },
  {
    id: 'trf-021',
    transferNumber: 'TRF-2025-0008',
    fromLocationId: 'loc-001',
    fromLocation: locations.find(l => l.id === 'loc-001'),
    toLocationId: 'loc-004',
    toLocation: locations.find(l => l.id === 'loc-004'),
    items: [
      {
        id: 'ti-037',
        productId: 'prd-029',
        product: products.find(p => p.id === 'prd-029'),
        quantity: 8
      },
      {
        id: 'ti-038',
        productId: 'prd-030',
        product: products.find(p => p.id === 'prd-030'),
        quantity: 8
      }
    ],
    status: 'COMPLETED',
    reason: 'STOCK_REPLENISHMENT',
    notes: 'Soczewki Biofinity dla Woli',
    createdById: 'usr-001',
    createdBy: users.find(u => u.id === 'usr-001'),
    confirmedById: 'usr-004',
    confirmedBy: users.find(u => u.id === 'usr-004'),
    parentTransferId: null,
    createdAt: '2025-01-08T09:00:00Z',
    confirmedAt: '2025-01-08T10:00:00Z'
  },

  // Additional rejected transfer
  {
    id: 'trf-022',
    transferNumber: 'TRF-2025-0009',
    fromLocationId: 'loc-001',
    fromLocation: locations.find(l => l.id === 'loc-001'),
    toLocationId: 'loc-003',
    toLocation: locations.find(l => l.id === 'loc-003'),
    items: [
      {
        id: 'ti-039',
        productId: 'prd-018',
        product: products.find(p => p.id === 'prd-018'),
        quantity: 2
      }
    ],
    status: 'REJECTED',
    reason: 'STOCK_REPLENISHMENT',
    notes: 'Oprawki Emporio Armani',
    rejectionReason: 'Salon ma wystarczający zapas tego modelu',
    createdById: 'usr-001',
    createdBy: users.find(u => u.id === 'usr-001'),
    confirmedById: null,
    confirmedBy: null,
    rejectedById: 'usr-003',
    rejectedBy: users.find(u => u.id === 'usr-003'),
    parentTransferId: null,
    createdAt: '2025-01-18T11:00:00Z',
    confirmedAt: null,
    rejectedAt: '2025-01-18T14:00:00Z'
  },

  // Additional pending transfer
  {
    id: 'trf-023',
    transferNumber: 'TRF-2025-0010',
    fromLocationId: 'loc-003',
    fromLocation: locations.find(l => l.id === 'loc-003'),
    toLocationId: 'loc-004',
    toLocation: locations.find(l => l.id === 'loc-004'),
    items: [
      {
        id: 'ti-040',
        productId: 'prd-019',
        product: products.find(p => p.id === 'prd-019'),
        quantity: 1
      },
      {
        id: 'ti-041',
        productId: 'prd-020',
        product: products.find(p => p.id === 'prd-020'),
        quantity: 1
      }
    ],
    status: 'PENDING',
    reason: 'CUSTOMER_SELECTION',
    notes: 'Oprawki do przymiarki dla pana Kowalskiego',
    createdById: 'usr-003',
    createdBy: users.find(u => u.id === 'usr-003'),
    confirmedById: null,
    confirmedBy: null,
    parentTransferId: null,
    createdAt: '2025-01-28T10:00:00Z',
    confirmedAt: null
  }
];

// Helper to get pending count for a location
export const getPendingIncomingCount = (locationId) => {
  return transfers.filter(t => t.toLocationId === locationId && t.status === 'PENDING').length;
};
