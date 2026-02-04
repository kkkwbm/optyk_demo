# OptiStore

**Optical Store Management System** - A modern web application for managing optical store chains, inventory, sales, and stock transfers.

![React](https://img.shields.io/badge/React-19-61DAFB?logo=react)
![Vite](https://img.shields.io/badge/Vite-7-646CFF?logo=vite)
![MUI](https://img.shields.io/badge/MUI-7-007FFF?logo=mui)
![License](https://img.shields.io/badge/License-Demo-gray)

## Overview

OptiStore is a comprehensive management system designed for optical retail chains. It provides tools for inventory management, sales tracking, inter-store transfers, and business analytics.

### Key Features

- **Multi-location Management** - Manage multiple stores and warehouses from a single dashboard
- **Inventory Tracking** - Track frames, sunglasses, contact lenses, solutions, and accessories
- **Sales Management** - Record sales with PDF receipt generation
- **Stock Transfers** - Transfer products between locations with approval workflow
- **Analytics Dashboard** - Sales trends, store comparisons, and inventory insights
- **Operation History** - Full audit trail of all operations with revert capability
- **User Management** - Role-based access control (Admin, Owner, Employee)
- **Dark/Light Theme** - User-selectable interface theme

## Demo

This repository contains a **frontend demo** that runs entirely in the browser using Mock Service Worker (MSW). No backend required.

**Demo limitations:**
- All data is mocked and stored in memory
- Write operations show "not available in demo" messages
- Data resets on page refresh

## Tech Stack

| Category | Technologies |
|----------|-------------|
| Framework | React 19, Vite 7 |
| UI | Material-UI 7, Lucide Icons |
| State | Redux Toolkit, React Redux |
| Routing | React Router DOM 7 |
| Forms | React Hook Form, Yup |
| Tables | TanStack Table 8 |
| Mocking | MSW (Mock Service Worker) |
| Utils | date-fns, Axios, jsPDF |

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn

### Installation

```bash
# Clone the repository
git clone https://github.com/your-username/optyk-demo.git
cd optyk-demo

# Install dependencies
npm install

# Start development server
npm run dev
```

The app will be available at `http://localhost:5173`

### Environment Setup (Optional)

For local development with a real backend:

```bash
# Copy the example environment file
cp .env.example .env.development.local

# Edit with your settings
nano .env.development.local
```

```env
VITE_API_BASE_URL=http://localhost:8080/api/v1
VITE_GOOGLE_MAPS_API_KEY=your-api-key
```

## Project Structure

```
src/
├── app/                 # Redux store configuration, routing
├── components/          # Shared components
├── config/              # API client configuration
├── constants/           # Application constants
├── features/            # Feature modules
│   ├── auth/            # Authentication & user profile
│   ├── brands/          # Brand management
│   ├── history/         # Operation audit log
│   ├── inventory/       # Stock management
│   ├── locations/       # Store/warehouse management
│   ├── products/        # Product catalog
│   ├── sales/           # Sales transactions
│   ├── settings/        # Application settings
│   ├── statistics/      # Analytics & reports
│   ├── transfers/       # Stock transfers
│   └── users/           # User management
├── mocks/               # MSW handlers and mock data
├── services/            # API service layer
├── shared/              # Shared utilities & components
└── utils/               # Helper functions
```

## Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server with HMR |
| `npm run build` | Build for production |
| `npm run preview` | Preview production build locally |
| `npm run lint` | Run ESLint |

## Screenshots

<details>
<summary>Click to expand</summary>

*Screenshots coming soon*

</details>

## Backend

This demo runs without a backend. For the full application, the backend is built with:

- Spring Boot 3.5
- PostgreSQL
- Spring Security with JWT
- RESTful API

## Contributing

This is a demo project. For issues or suggestions, please open an issue.

## License

This project is for demonstration purposes only.

---

Built with React and Material-UI
