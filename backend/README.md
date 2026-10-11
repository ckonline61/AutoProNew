# Auto Pro Backend

Production-grade Express + TypeScript REST API foundation for the Auto Pro automotive services platform.

## Features

- **TypeScript** with strict type checking and path aliases (`@/*`)
- **Express.js** with middleware architecture
- **Security**: Helmet, CORS, and Express Rate Limiting
- **Observability**: Morgan HTTP logging and Request ID tracking (`x-request-id`)
- **Performance**: Response compression
- **Error Handling**: Centralized error handler with structured API responses and custom `AppError` subclasses
- **Testing**: Jest and Supertest configured for unit and integration testing
- **Linting & Code Quality**: Modern ESLint flat config with `typescript-eslint`

## Getting Started

### Prerequisites

- Node.js >= 20 (tested with v24.13.0)
- npm >= 10 (tested with 11.6.2)

### Installation

```bash
cd backend
npm install
```

### Environment Configuration

Copy the example environment configuration and adjust values as needed:

```bash
cp .env.example .env
```

### Available Scripts

- `npm run dev`: Start development server with live reload (`ts-node-dev`)
- `npm run build`: Compile TypeScript to JavaScript in `dist/`
- `npm start`: Run the production build (`dist/index.js`)
- `npm run typecheck`: Run TypeScript type checking without emitting output
- `npm run lint`: Lint TypeScript files with ESLint
- `npm run lint:fix`: Automatically fix ESLint errors
- `npm test`: Run tests with Jest
- `npm run test:watch`: Run tests in watch mode
- `npm run test:coverage`: Run tests with coverage reporting
- `npm run clean`: Clean the `dist` directory

## API Endpoints

- `GET /api/v1/health`: Health check endpoint providing service status, version, uptime, and timestamp.
