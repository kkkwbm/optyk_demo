# OptiStore - Optical Store Management System

Frontend demo for optical store chain management with inventory tracking, sales, and transfers.

## Tech Stack

- React 19 + Vite
- Material-UI (MUI) 7
- Redux Toolkit
- React Router DOM
- React Hook Form + Yup
- MSW (Mock Service Worker) for demo mode

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn

### Installation

```bash
npm install
```

### Environment Setup

1. Copy the example environment file:
   ```bash
   cp .env.example .env.development.local
   ```

2. Edit `.env.development.local` with your local settings:
   ```env
   # API Configuration
   VITE_API_BASE_URL=http://localhost:8080/api/v1

   # Optional: Quick login credentials for development
   VITE_DEV_ADMIN_EMAIL=admin@optyk.com
   VITE_DEV_ADMIN_PASSWORD=YourDevPassword123!
   ```

> **Note:** `.env.development.local` is gitignored and will not be committed.

### Running the App

```bash
# Development mode (with MSW mocks)
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## Demo Mode

This project includes MSW (Mock Service Worker) for running without a backend. In demo mode:
- All data is mocked locally
- Write operations are disabled (returns demo restriction message)
- Authentication uses fake tokens

## Project Structure

```
src/
├── app/           # Redux store, router
├── components/    # Shared components
├── config/        # API configuration
├── constants/     # App constants
├── features/      # Feature modules
│   ├── auth/      # Authentication
│   ├── brands/    # Brand management
│   ├── history/   # Operation history
│   ├── inventory/ # Stock management
│   ├── locations/ # Store locations
│   ├── products/  # Product catalog
│   ├── sales/     # Sales transactions
│   ├── settings/  # App settings
│   ├── statistics/# Analytics dashboard
│   ├── transfers/ # Stock transfers
│   └── users/     # User management
├── mocks/         # MSW handlers and data
├── services/      # API services
├── shared/        # Shared utilities
└── utils/         # Helper functions
```

## License

This project is for demonstration purposes.
