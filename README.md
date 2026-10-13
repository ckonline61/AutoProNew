# AUTO PRO

Professional Automotive Service, Roadside Assistance & Marketplace Platform

## 🏗️ Project Structure

```
AUTO-PRO/
├── backend/           → Node.js + Express + TypeScript API
├── customer-mobile/   → React Native Customer App
├── mechanic-mobile/   → React Native Mechanic App
├── admin/             → React.js Admin Dashboard
├── web/               → React.js Public Website
├── docs/              → Architecture & Design Documentation
└── prompts/           → Phase Execution Prompts
```

## 🚀 Quick Start

### Backend API
```bash
cd backend
cp .env.example .env     # Configure environment
npm install
npm run dev              # Start development server
```

### Customer Mobile App
```bash
cd customer-mobile
cp .env.example .env
npm install
npm start                # Start Metro bundler
npm run android          # Run on Android
npm run ios              # Run on iOS
```

### Mechanic Mobile App
```bash
cd mechanic-mobile
cp .env.example .env
npm install
npm start
npm run android
npm run ios
```

### Admin Dashboard
```bash
cd admin
cp .env.example .env
npm install
npm run dev              # Start dev server (http://localhost:5173)
```

### Public Website
```bash
cd web
cp .env.example .env
npm install
npm run dev              # Start dev server (http://localhost:5174)
```

## 🛠️ Technology Stack

| Component | Technology |
|-----------|-----------|
| Customer App | React Native + TypeScript |
| Mechanic App | React Native + TypeScript |
| Admin Dashboard | React.js + Vite + TypeScript |
| Public Website | React.js + Vite + TypeScript |
| Backend API | Node.js + Express + TypeScript |
| Database | MongoDB |
| Maps | Google Maps Platform |
| Payments | Razorpay |
| Notifications | Firebase Cloud Messaging |
| Auth | JWT + Refresh Token |

## 📋 Available Scripts (per app)

| Script | Description |
|--------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Production build |
| `npm run lint` | Run ESLint |
| `npm run typecheck` | TypeScript type checking |
| `npm test` | Run tests |

## 📖 Documentation

- [Architecture](docs/ARCHITECTURE.md)
- [Database Design](docs/DATABASE-DESIGN.md)
- [API Plan](docs/API-PLAN.md)
- [Roadmap](docs/ROADMAP.md)
- [Master Spec](MASTER_SPEC.md)
- [Agent Rules](AGENT_RULES.md)
- [Project State](PROJECT_STATE.md)

## 🔒 Security

- Never commit `.env` files
- Use `.env.example` as template
- All secrets managed via environment variables
- See [AGENT_RULES.md](AGENT_RULES.md) for full security guidelines

## 📄 License

UNLICENSED - Private Project

## Verified local preview

Run `powershell -ExecutionPolicy Bypass -File .\START_PREVIEW.ps1` after dependency installation and MongoDB startup. Website: http://127.0.0.1:5174/ — Admin: http://127.0.0.1:5173/login.

See [current audit and limitations](docs/PROJECT_AUDIT.md). Several frontend flows are still previews; passing builds do not establish production readiness.
