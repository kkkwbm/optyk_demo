// Demo users
export const users = [
  {
    id: 'usr-001',
    email: 'admin@demo.optyk.pl',
    firstName: 'Anna',
    lastName: 'Kowalska',
    role: 'ADMIN',
    status: 'ACTIVE',
    phone: '+48 500 100 200',
    themePreference: 'LIGHT',
    locations: [], // Admin has access to all locations
    createdAt: '2024-01-15T10:00:00Z',
    updatedAt: '2024-01-15T10:00:00Z'
  },
  {
    id: 'usr-002',
    email: 'wlasciciel@demo.optyk.pl',
    firstName: 'Marek',
    lastName: 'Nowak',
    role: 'OWNER',
    status: 'ACTIVE',
    phone: '+48 600 200 300',
    themePreference: 'LIGHT',
    locations: [],
    createdAt: '2024-02-01T09:00:00Z',
    updatedAt: '2024-02-01T09:00:00Z'
  },
  {
    id: 'usr-003',
    email: 'pracownik@demo.optyk.pl',
    firstName: 'Katarzyna',
    lastName: 'Wiśniewska',
    role: 'EMPLOYEE',
    status: 'ACTIVE',
    phone: '+48 700 300 400',
    themePreference: 'LIGHT',
    locations: ['loc-002', 'loc-003'], // Access to Centrum and Mokotów stores
    createdAt: '2024-03-10T08:00:00Z',
    updatedAt: '2024-03-10T08:00:00Z'
  },
  {
    id: 'usr-004',
    email: 'jan.zielinski@demo.optyk.pl',
    firstName: 'Jan',
    lastName: 'Zieliński',
    role: 'EMPLOYEE',
    status: 'ACTIVE',
    phone: '+48 800 400 500',
    themePreference: 'DARK',
    locations: ['loc-004'], // Access to Wola store only
    createdAt: '2024-04-05T11:00:00Z',
    updatedAt: '2024-04-05T11:00:00Z'
  },
  {
    id: 'usr-005',
    email: 'ewa.dabrowska@demo.optyk.pl',
    firstName: 'Ewa',
    lastName: 'Dąbrowska',
    role: 'EMPLOYEE',
    status: 'INACTIVE',
    phone: '+48 900 500 600',
    themePreference: 'LIGHT',
    locations: ['loc-002'],
    createdAt: '2024-01-20T14:00:00Z',
    updatedAt: '2024-06-01T10:00:00Z'
  }
]

// Currently logged in user (Admin Demo)
export const currentUser = users[0]

// Demo access token (fake JWT)
export const demoAccessToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJ1c3ItMDAxIiwiZW1haWwiOiJhZG1pbkBkZW1vLm9wdHlrLnBsIiwicm9sZSI6IkFETUlOIiwiZXhwIjo5OTk5OTk5OTk5fQ.demo_token_signature'
