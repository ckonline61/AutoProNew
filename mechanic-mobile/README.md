# Auto Pro Mechanic Mobile App

Mechanic partner mobile application for the Auto Pro on-demand automotive services platform.

## Prerequisites

- Node.js (v18+)
- npm / yarn
- React Native CLI & Android Studio / Xcode configured for React Native

## Setup Instructions

1. Install dependencies:
   ```bash
   npm install
   ```

2. Copy environment file and configure variables:
   ```bash
   cp .env.example .env
   ```

3. Start Metro bundler:
   ```bash
   npm run start
   ```

4. Run on Android / iOS:
   ```bash
   npm run android
   # or
   npm run ios
   ```

## Available Scripts

- `npm run start`: Starts the React Native Metro bundler
- `npm run android`: Builds and runs the app on an Android device/emulator
- `npm run ios`: Builds and runs the app on an iOS simulator/device
- `npm run lint`: Runs ESLint
- `npm run lint:fix`: Fixes linting errors automatically
- `npm run typecheck`: Runs TypeScript compiler type checking without emitting files
- `npm run test`: Runs Jest tests
- `npm run test:watch`: Runs Jest in interactive watch mode
- `npm run test:coverage`: Generates test coverage report
- `npm run clean`: Clears the Metro cache

## Project Structure

```
mechanic-mobile/
├── src/
│   ├── __tests__/      # Test files
│   ├── constants/      # App constants and configuration
│   ├── types/          # TypeScript interfaces and type definitions
│   └── App.tsx         # Root application component
├── .env.example        # Environment variable template
├── babel.config.js     # Babel configuration
├── eslint.config.mjs   # Flat ESLint configuration
├── jest.config.js      # Jest testing configuration
├── package.json        # Project metadata and dependencies
├── tsconfig.json       # TypeScript configuration
└── README.md           # Project documentation
```
