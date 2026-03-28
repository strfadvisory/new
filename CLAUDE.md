# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**STRF** is a full-stack MERN application for managing reserve funds and advisory services. It supports multi-tenant company profiles, role-based access control (RBAC), a financial projection simulator, document management, and a super-admin dashboard.

## Development Commands

```bash
# Frontend (runs on port 3000)
cd client && npm install
cd client && npm start

# Backend (runs on port 5000)
cd server && npm install
cd server && npm run dev

# Database setup (run once after install)
cd server && npm run migrate         # Run all database migrations
cd server && npm run seed:superadmin # Create default super admin
cd server && npm run seed:roles      # Seed default roles

# Docker (full stack)
docker-compose up                                      # Development (hot reload)
docker-compose -f docker-compose.prod.yml up           # Production

# Backend test scripts
cd server && npm run test:memberfor      # Validate MemberFor structure
cd server && npm run test:company-switch # Test company switching logic
```

## Architecture

### Layers

- **Frontend**: `client/` — React 18 + TypeScript, Bootstrap 5, Axios, React Query (TanStack)
- **Backend**: `server/` — Express.js, Mongoose, JWT auth, Multer + GridFS
- **Database**: MongoDB Atlas (`simulator-dev` database)

The backend follows a strict **Routes → Controllers → Services → Models** pattern. Keep controllers lean and push business logic into service files.

### Key Frontend Files

- `client/src/config.ts` — All API endpoint URLs; `API_BASE_URL` defaults to `http://localhost:5001/api` in dev
- `client/src/App.tsx` — Route definitions split across public routes, auth routes, DashboardLayout (regular users), and SuperAdminLayout
- `client/src/utils/simulatorStateManager.ts` — Centralized state for the financial simulator
- `client/src/utils/financialCalculations.ts` — Core financial math (13KB+); most calculator logic lives here
- `client/src/utils/yearPriorityCalculations.ts` — Year-based priority calculations for the simulator

### Key Backend Files

- `server/index.jsx` — Entry point; mounts all routes under `/api`, serves static `uploads/`, exposes `/health`
- `server/middleware/authMiddleware.jsx` — JWT verification; apply to all protected routes
- `server/models/User.js` — Core entity; handles multi-company via `memberfor` array and pending requests via `reqorg`

### Multi-Tenancy

Users belong to multiple companies via `user.memberfor` (array of `{company: ObjectId, role}`). The active company is tracked in `localStorage` on the frontend. When a user switches companies, the frontend updates localStorage and re-fetches data. All backend queries must filter by both `userId` and `companyId`.

### Authentication Flow

JWT tokens stored in `localStorage`. All authenticated API calls include `Authorization: Bearer <token>`. No token refresh — expired tokens require re-login. OTP email verification is required on registration.

### RBAC Pattern

```typescript
// Frontend: read permissions from stored user object
const user = JSON.parse(localStorage.getItem('user'));
user.rolePermissions['feature.action'] // boolean

// Backend: chain middleware on protected routes
router.post('/endpoint', authMiddleware, roleManagementMiddleware, controller);
```

### API Response Pattern

Backend always responds with `{ message, data }`. Frontend destructures from `response.data`:
```typescript
const { message, data } = response.data;
```

Status codes: `200` success, `400` validation, `401` unauthenticated, `403` forbidden, `404` not found, `500` server error.

### File Uploads

Multer + GridFS stores uploaded files in MongoDB. The `server/uploads/` directory is served as static. File references use `fileId` (GridFS ObjectId) on documents like `ReserveStudy`.

### Simulator Components

The active development focus is the financial simulator:
- `CalculatorPage.tsx` — Main calculator UI
- `FundGraph.tsx` — Financial visualization
- `LeftPanel.tsx` — Sidebar with controls
- `YearPriorityPopup.tsx` — Year priority management modal

Changes to year priorities flow through `yearPriorityCalculations.ts` → `simulatorStateManager.ts` → `financialCalculations.ts`.

## Important Gotchas

- **API base URL mismatch**: `config.ts` uses port `5001` in dev but the server runs on `5000`; check `REACT_APP_API_URL` env var or Docker config when requests fail
- **Migrations are idempotent** — safe to re-run; use `npm run migrate` after pulling changes that include new migration files
- **Password hashing** is done in the User model pre-save hook — never hash manually before saving
- **Populate refs** before returning responses; un-populated ObjectIds will break the frontend
- **CORS** is currently open (`origin: '*'`) — don't change this without checking all clients
- **Email** requires `EMAIL_USER` and `EMAIL_PASS` env vars (Gmail SMTP); registration OTP will fail without them
- **Bootstrap + scoped CSS**: Use co-located `.css` files (e.g., `Component.css`) when Bootstrap classes conflict
