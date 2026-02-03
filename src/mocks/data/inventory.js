// Demo inventory data - products distributed across locations
// loc-001: Magazyn Centralny
// loc-002: Salon Optyczny Centrum
// loc-003: Salon Optyczny Mokotów
// loc-004: Salon Optyczny Wola

export const inventory = [
  // Warehouse (loc-001) - main stock
  { id: 'inv-001', productId: 'prd-001', locationId: 'loc-001', quantity: 15, reservedQuantity: 2, minQuantity: 5 },
  { id: 'inv-002', productId: 'prd-002', locationId: 'loc-001', quantity: 12, reservedQuantity: 0, minQuantity: 5 },
  { id: 'inv-003', productId: 'prd-003', locationId: 'loc-001', quantity: 8, reservedQuantity: 1, minQuantity: 3 },
  { id: 'inv-004', productId: 'prd-004', locationId: 'loc-001', quantity: 6, reservedQuantity: 0, minQuantity: 2 },
  { id: 'inv-005', productId: 'prd-005', locationId: 'loc-001', quantity: 4, reservedQuantity: 0, minQuantity: 2 },
  { id: 'inv-006', productId: 'prd-006', locationId: 'loc-001', quantity: 5, reservedQuantity: 0, minQuantity: 2 },
  { id: 'inv-007', productId: 'prd-007', locationId: 'loc-001', quantity: 10, reservedQuantity: 0, minQuantity: 4 },
  { id: 'inv-008', productId: 'prd-008', locationId: 'loc-001', quantity: 7, reservedQuantity: 0, minQuantity: 3 },
  { id: 'inv-009', productId: 'prd-009', locationId: 'loc-001', quantity: 14, reservedQuantity: 0, minQuantity: 5 },
  { id: 'inv-010', productId: 'prd-010', locationId: 'loc-001', quantity: 9, reservedQuantity: 0, minQuantity: 4 },
  { id: 'inv-011', productId: 'prd-011', locationId: 'loc-001', quantity: 11, reservedQuantity: 0, minQuantity: 4 },
  { id: 'inv-012', productId: 'prd-012', locationId: 'loc-001', quantity: 8, reservedQuantity: 0, minQuantity: 3 },
  { id: 'inv-013', productId: 'prd-013', locationId: 'loc-001', quantity: 6, reservedQuantity: 0, minQuantity: 2 },
  { id: 'inv-014', productId: 'prd-014', locationId: 'loc-001', quantity: 5, reservedQuantity: 0, minQuantity: 2 },
  { id: 'inv-015', productId: 'prd-015', locationId: 'loc-001', quantity: 4, reservedQuantity: 0, minQuantity: 2 },
  { id: 'inv-016', productId: 'prd-016', locationId: 'loc-001', quantity: 3, reservedQuantity: 0, minQuantity: 2 },
  { id: 'inv-017', productId: 'prd-017', locationId: 'loc-001', quantity: 12, reservedQuantity: 0, minQuantity: 5 },
  { id: 'inv-018', productId: 'prd-018', locationId: 'loc-001', quantity: 6, reservedQuantity: 0, minQuantity: 2 },
  { id: 'inv-019', productId: 'prd-019', locationId: 'loc-001', quantity: 10, reservedQuantity: 0, minQuantity: 4 },
  { id: 'inv-020', productId: 'prd-020', locationId: 'loc-001', quantity: 8, reservedQuantity: 0, minQuantity: 3 },
  // Contact lenses - larger quantities
  { id: 'inv-021', productId: 'prd-021', locationId: 'loc-001', quantity: 50, reservedQuantity: 5, minQuantity: 20 },
  { id: 'inv-022', productId: 'prd-022', locationId: 'loc-001', quantity: 30, reservedQuantity: 0, minQuantity: 10 },
  { id: 'inv-023', productId: 'prd-023', locationId: 'loc-001', quantity: 40, reservedQuantity: 0, minQuantity: 15 },
  { id: 'inv-024', productId: 'prd-024', locationId: 'loc-001', quantity: 25, reservedQuantity: 0, minQuantity: 10 },
  { id: 'inv-025', productId: 'prd-025', locationId: 'loc-001', quantity: 45, reservedQuantity: 0, minQuantity: 15 },
  { id: 'inv-026', productId: 'prd-026', locationId: 'loc-001', quantity: 20, reservedQuantity: 0, minQuantity: 8 },
  { id: 'inv-027', productId: 'prd-027', locationId: 'loc-001', quantity: 35, reservedQuantity: 0, minQuantity: 12 },
  { id: 'inv-028', productId: 'prd-028', locationId: 'loc-001', quantity: 40, reservedQuantity: 0, minQuantity: 15 },
  { id: 'inv-029', productId: 'prd-029', locationId: 'loc-001', quantity: 30, reservedQuantity: 0, minQuantity: 10 },
  { id: 'inv-030', productId: 'prd-030', locationId: 'loc-001', quantity: 20, reservedQuantity: 0, minQuantity: 8 },
  // Solutions
  { id: 'inv-031', productId: 'prd-031', locationId: 'loc-001', quantity: 60, reservedQuantity: 0, minQuantity: 20 },
  { id: 'inv-032', productId: 'prd-032', locationId: 'loc-001', quantity: 50, reservedQuantity: 0, minQuantity: 15 },
  { id: 'inv-033', productId: 'prd-033', locationId: 'loc-001', quantity: 55, reservedQuantity: 0, minQuantity: 18 },
  { id: 'inv-034', productId: 'prd-034', locationId: 'loc-001', quantity: 40, reservedQuantity: 0, minQuantity: 12 },
  { id: 'inv-035', productId: 'prd-035', locationId: 'loc-001', quantity: 80, reservedQuantity: 0, minQuantity: 30 },
  { id: 'inv-036', productId: 'prd-036', locationId: 'loc-001', quantity: 45, reservedQuantity: 0, minQuantity: 15 },
  { id: 'inv-037', productId: 'prd-037', locationId: 'loc-001', quantity: 50, reservedQuantity: 0, minQuantity: 15 },
  { id: 'inv-038', productId: 'prd-038', locationId: 'loc-001', quantity: 35, reservedQuantity: 0, minQuantity: 12 },
  // Sunglasses
  { id: 'inv-039', productId: 'prd-039', locationId: 'loc-001', quantity: 10, reservedQuantity: 0, minQuantity: 4 },
  { id: 'inv-040', productId: 'prd-040', locationId: 'loc-001', quantity: 8, reservedQuantity: 0, minQuantity: 3 },
  { id: 'inv-041', productId: 'prd-041', locationId: 'loc-001', quantity: 6, reservedQuantity: 0, minQuantity: 2 },
  { id: 'inv-042', productId: 'prd-042', locationId: 'loc-001', quantity: 4, reservedQuantity: 0, minQuantity: 2 },
  { id: 'inv-043', productId: 'prd-043', locationId: 'loc-001', quantity: 3, reservedQuantity: 0, minQuantity: 2 },
  { id: 'inv-044', productId: 'prd-044', locationId: 'loc-001', quantity: 4, reservedQuantity: 0, minQuantity: 2 },
  { id: 'inv-045', productId: 'prd-045', locationId: 'loc-001', quantity: 5, reservedQuantity: 0, minQuantity: 2 },
  { id: 'inv-046', productId: 'prd-046', locationId: 'loc-001', quantity: 7, reservedQuantity: 0, minQuantity: 3 },
  // Other/Accessories
  { id: 'inv-047', productId: 'prd-047', locationId: 'loc-001', quantity: 25, reservedQuantity: 0, minQuantity: 10 },
  { id: 'inv-048', productId: 'prd-048', locationId: 'loc-001', quantity: 100, reservedQuantity: 0, minQuantity: 40 },
  { id: 'inv-049', productId: 'prd-049', locationId: 'loc-001', quantity: 60, reservedQuantity: 0, minQuantity: 20 },
  { id: 'inv-050', productId: 'prd-050', locationId: 'loc-001', quantity: 30, reservedQuantity: 0, minQuantity: 10 },

  // Salon Centrum (loc-002) - retail stock
  { id: 'inv-101', productId: 'prd-001', locationId: 'loc-002', quantity: 3, reservedQuantity: 0, minQuantity: 2 },
  { id: 'inv-102', productId: 'prd-002', locationId: 'loc-002', quantity: 2, reservedQuantity: 0, minQuantity: 2 },
  { id: 'inv-103', productId: 'prd-003', locationId: 'loc-002', quantity: 2, reservedQuantity: 0, minQuantity: 1 },
  { id: 'inv-104', productId: 'prd-004', locationId: 'loc-002', quantity: 1, reservedQuantity: 0, minQuantity: 1 },
  { id: 'inv-105', productId: 'prd-005', locationId: 'loc-002', quantity: 1, reservedQuantity: 0, minQuantity: 1 },
  { id: 'inv-106', productId: 'prd-007', locationId: 'loc-002', quantity: 2, reservedQuantity: 0, minQuantity: 1 },
  { id: 'inv-107', productId: 'prd-009', locationId: 'loc-002', quantity: 3, reservedQuantity: 0, minQuantity: 2 },
  { id: 'inv-108', productId: 'prd-010', locationId: 'loc-002', quantity: 2, reservedQuantity: 0, minQuantity: 1 },
  { id: 'inv-109', productId: 'prd-012', locationId: 'loc-002', quantity: 2, reservedQuantity: 0, minQuantity: 1 },
  { id: 'inv-110', productId: 'prd-017', locationId: 'loc-002', quantity: 3, reservedQuantity: 0, minQuantity: 2 },
  // Contact lenses
  { id: 'inv-111', productId: 'prd-021', locationId: 'loc-002', quantity: 15, reservedQuantity: 0, minQuantity: 5 },
  { id: 'inv-112', productId: 'prd-022', locationId: 'loc-002', quantity: 8, reservedQuantity: 0, minQuantity: 3 },
  { id: 'inv-113', productId: 'prd-023', locationId: 'loc-002', quantity: 12, reservedQuantity: 0, minQuantity: 5 },
  { id: 'inv-114', productId: 'prd-025', locationId: 'loc-002', quantity: 10, reservedQuantity: 0, minQuantity: 4 },
  { id: 'inv-115', productId: 'prd-028', locationId: 'loc-002', quantity: 12, reservedQuantity: 0, minQuantity: 5 },
  // Solutions
  { id: 'inv-116', productId: 'prd-031', locationId: 'loc-002', quantity: 15, reservedQuantity: 0, minQuantity: 5 },
  { id: 'inv-117', productId: 'prd-032', locationId: 'loc-002', quantity: 12, reservedQuantity: 0, minQuantity: 4 },
  { id: 'inv-118', productId: 'prd-033', locationId: 'loc-002', quantity: 10, reservedQuantity: 0, minQuantity: 4 },
  { id: 'inv-119', productId: 'prd-036', locationId: 'loc-002', quantity: 8, reservedQuantity: 0, minQuantity: 3 },
  // Sunglasses
  { id: 'inv-120', productId: 'prd-039', locationId: 'loc-002', quantity: 2, reservedQuantity: 0, minQuantity: 1 },
  { id: 'inv-121', productId: 'prd-040', locationId: 'loc-002', quantity: 2, reservedQuantity: 0, minQuantity: 1 },
  { id: 'inv-122', productId: 'prd-042', locationId: 'loc-002', quantity: 1, reservedQuantity: 0, minQuantity: 1 },
  // Other
  { id: 'inv-123', productId: 'prd-047', locationId: 'loc-002', quantity: 5, reservedQuantity: 0, minQuantity: 2 },
  { id: 'inv-124', productId: 'prd-048', locationId: 'loc-002', quantity: 20, reservedQuantity: 0, minQuantity: 10 },
  { id: 'inv-125', productId: 'prd-049', locationId: 'loc-002', quantity: 15, reservedQuantity: 0, minQuantity: 5 },

  // Salon Mokotów (loc-003)
  { id: 'inv-201', productId: 'prd-001', locationId: 'loc-003', quantity: 2, reservedQuantity: 0, minQuantity: 1 },
  { id: 'inv-202', productId: 'prd-002', locationId: 'loc-003', quantity: 3, reservedQuantity: 0, minQuantity: 2 },
  { id: 'inv-203', productId: 'prd-004', locationId: 'loc-003', quantity: 2, reservedQuantity: 0, minQuantity: 1 },
  { id: 'inv-204', productId: 'prd-006', locationId: 'loc-003', quantity: 1, reservedQuantity: 0, minQuantity: 1 },
  { id: 'inv-205', productId: 'prd-008', locationId: 'loc-003', quantity: 2, reservedQuantity: 0, minQuantity: 1 },
  { id: 'inv-206', productId: 'prd-009', locationId: 'loc-003', quantity: 2, reservedQuantity: 0, minQuantity: 1 },
  { id: 'inv-207', productId: 'prd-011', locationId: 'loc-003', quantity: 2, reservedQuantity: 0, minQuantity: 1 },
  { id: 'inv-208', productId: 'prd-014', locationId: 'loc-003', quantity: 1, reservedQuantity: 0, minQuantity: 1 },
  { id: 'inv-209', productId: 'prd-015', locationId: 'loc-003', quantity: 1, reservedQuantity: 0, minQuantity: 1 },
  { id: 'inv-210', productId: 'prd-018', locationId: 'loc-003', quantity: 2, reservedQuantity: 0, minQuantity: 1 },
  // Contact lenses
  { id: 'inv-211', productId: 'prd-021', locationId: 'loc-003', quantity: 10, reservedQuantity: 0, minQuantity: 4 },
  { id: 'inv-212', productId: 'prd-023', locationId: 'loc-003', quantity: 8, reservedQuantity: 0, minQuantity: 3 },
  { id: 'inv-213', productId: 'prd-024', locationId: 'loc-003', quantity: 6, reservedQuantity: 0, minQuantity: 2 },
  { id: 'inv-214', productId: 'prd-025', locationId: 'loc-003', quantity: 8, reservedQuantity: 0, minQuantity: 3 },
  { id: 'inv-215', productId: 'prd-029', locationId: 'loc-003', quantity: 10, reservedQuantity: 0, minQuantity: 4 },
  // Solutions
  { id: 'inv-216', productId: 'prd-031', locationId: 'loc-003', quantity: 12, reservedQuantity: 0, minQuantity: 4 },
  { id: 'inv-217', productId: 'prd-033', locationId: 'loc-003', quantity: 10, reservedQuantity: 0, minQuantity: 4 },
  { id: 'inv-218', productId: 'prd-034', locationId: 'loc-003', quantity: 8, reservedQuantity: 0, minQuantity: 3 },
  { id: 'inv-219', productId: 'prd-037', locationId: 'loc-003', quantity: 10, reservedQuantity: 0, minQuantity: 4 },
  // Sunglasses
  { id: 'inv-220', productId: 'prd-039', locationId: 'loc-003', quantity: 2, reservedQuantity: 0, minQuantity: 1 },
  { id: 'inv-221', productId: 'prd-041', locationId: 'loc-003', quantity: 1, reservedQuantity: 0, minQuantity: 1 },
  { id: 'inv-222', productId: 'prd-043', locationId: 'loc-003', quantity: 1, reservedQuantity: 0, minQuantity: 1 },
  { id: 'inv-223', productId: 'prd-045', locationId: 'loc-003', quantity: 2, reservedQuantity: 0, minQuantity: 1 },
  // Other
  { id: 'inv-224', productId: 'prd-047', locationId: 'loc-003', quantity: 4, reservedQuantity: 0, minQuantity: 2 },
  { id: 'inv-225', productId: 'prd-048', locationId: 'loc-003', quantity: 15, reservedQuantity: 0, minQuantity: 8 },
  { id: 'inv-226', productId: 'prd-049', locationId: 'loc-003', quantity: 12, reservedQuantity: 0, minQuantity: 5 },

  // Salon Wola (loc-004)
  { id: 'inv-301', productId: 'prd-001', locationId: 'loc-004', quantity: 2, reservedQuantity: 0, minQuantity: 1 },
  { id: 'inv-302', productId: 'prd-003', locationId: 'loc-004', quantity: 1, reservedQuantity: 0, minQuantity: 1 },
  { id: 'inv-303', productId: 'prd-007', locationId: 'loc-004', quantity: 2, reservedQuantity: 0, minQuantity: 1 },
  { id: 'inv-304', productId: 'prd-009', locationId: 'loc-004', quantity: 3, reservedQuantity: 0, minQuantity: 2 },
  { id: 'inv-305', productId: 'prd-010', locationId: 'loc-004', quantity: 2, reservedQuantity: 0, minQuantity: 1 },
  { id: 'inv-306', productId: 'prd-011', locationId: 'loc-004', quantity: 3, reservedQuantity: 0, minQuantity: 2 },
  { id: 'inv-307', productId: 'prd-013', locationId: 'loc-004', quantity: 1, reservedQuantity: 0, minQuantity: 1 },
  { id: 'inv-308', productId: 'prd-017', locationId: 'loc-004', quantity: 2, reservedQuantity: 0, minQuantity: 1 },
  { id: 'inv-309', productId: 'prd-019', locationId: 'loc-004', quantity: 2, reservedQuantity: 0, minQuantity: 1 },
  { id: 'inv-310', productId: 'prd-020', locationId: 'loc-004', quantity: 2, reservedQuantity: 0, minQuantity: 1 },
  // Contact lenses
  { id: 'inv-311', productId: 'prd-021', locationId: 'loc-004', quantity: 8, reservedQuantity: 0, minQuantity: 3 },
  { id: 'inv-312', productId: 'prd-022', locationId: 'loc-004', quantity: 5, reservedQuantity: 0, minQuantity: 2 },
  { id: 'inv-313', productId: 'prd-023', locationId: 'loc-004', quantity: 10, reservedQuantity: 0, minQuantity: 4 },
  { id: 'inv-314', productId: 'prd-027', locationId: 'loc-004', quantity: 6, reservedQuantity: 0, minQuantity: 2 },
  { id: 'inv-315', productId: 'prd-028', locationId: 'loc-004', quantity: 8, reservedQuantity: 0, minQuantity: 3 },
  // Solutions
  { id: 'inv-316', productId: 'prd-031', locationId: 'loc-004', quantity: 10, reservedQuantity: 0, minQuantity: 4 },
  { id: 'inv-317', productId: 'prd-032', locationId: 'loc-004', quantity: 8, reservedQuantity: 0, minQuantity: 3 },
  { id: 'inv-318', productId: 'prd-035', locationId: 'loc-004', quantity: 15, reservedQuantity: 0, minQuantity: 6 },
  { id: 'inv-319', productId: 'prd-036', locationId: 'loc-004', quantity: 6, reservedQuantity: 0, minQuantity: 2 },
  // Sunglasses
  { id: 'inv-320', productId: 'prd-040', locationId: 'loc-004', quantity: 2, reservedQuantity: 0, minQuantity: 1 },
  { id: 'inv-321', productId: 'prd-041', locationId: 'loc-004', quantity: 1, reservedQuantity: 0, minQuantity: 1 },
  { id: 'inv-322', productId: 'prd-044', locationId: 'loc-004', quantity: 1, reservedQuantity: 0, minQuantity: 1 },
  { id: 'inv-323', productId: 'prd-046', locationId: 'loc-004', quantity: 2, reservedQuantity: 0, minQuantity: 1 },
  // Other
  { id: 'inv-324', productId: 'prd-047', locationId: 'loc-004', quantity: 3, reservedQuantity: 0, minQuantity: 2 },
  { id: 'inv-325', productId: 'prd-048', locationId: 'loc-004', quantity: 18, reservedQuantity: 0, minQuantity: 8 },
  { id: 'inv-326', productId: 'prd-050', locationId: 'loc-004', quantity: 8, reservedQuantity: 0, minQuantity: 3 }
]
