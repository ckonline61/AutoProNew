# Auto Pro Public Website

Public website customer-facing application for Auto Pro built with React 18, TypeScript, and Vite.

## Tech Stack
- **Framework:** React 18
- **Language:** TypeScript (strict mode)
- **Bundler:** Vite
- **Routing:** React Router DOM
- **Linter:** ESLint (flat config)

## Getting Started

### Prerequisites
- Node.js (v18 or higher recommended)
- npm

### Installation
```bash
# Navigate to web directory
cd web

# Install dependencies
npm install
```

### Environment Setup
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```

Configure environment variables:
- `VITE_API_BASE_URL`: Auto Pro backend API URL (defaults to `http://localhost:5000/api/v1`)
- `VITE_APP_NAME`: Application name

### Available Scripts
- `npm run dev` - Start local development server on http://localhost:5173
- `npm run build` - Typecheck with TypeScript and build production bundle
- `npm run lint` - Run ESLint checks
- `npm run preview` - Preview production build locally
