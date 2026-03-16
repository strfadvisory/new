---
description: Workspace instructions for STRF - Enterprise Reserve Management System (full-stack MERN + Docker)
applyTo: '**/{client,server}/**'
---

# STRF Workspace Instructions

## Project Overview
**STRF** is a full-stack **MERN application** (MongoDB, Express, React, Node.js) for managing reserve funds and advisory services. The system includes:
- User authentication & authorization (JWT-based)
- Role-based access control (RBAC) with granular permissions
- Company profile management with multi-tenant support
- Advisory invitation system
- Library and video content management
- Super admin dashboard for system management
- Docker containerization for development and production

**Tech Stack**: React 18.2 + TypeScript | Express.js | MongoDB 8.0 | Docker Compose

---

## Quick Dev Commands

```bash
# Install and Setup
cd client && npm install    # Frontend deps
cd ../server && npm install # Backend deps
npm run migrate             # Database migrations
npm run seed:superadmin    # Create default admin

# Development
cd server && npm run dev    # Backend @ localhost:5000
cd client && npm start      # Frontend @ localhost:3000

# Docker
docker-compose up           # Dev: full stack
docker-compose -f docker-compose.prod.yml up  # Production
```

---

## Frontend Conventions (React + TypeScript)

### Component Structure
- **Location**: `client/src/components/` (reusable) or `client/src/pages/` (page-level)
- **Style**: All **functional components** with React hooks
- **Props**: Define TypeScript **interfaces** for all props
- **State Management**: `useState` for local state, `useContext`/custom hooks for shared state
- **Async Operations**: `useEffect` for initialization, `fetch()` or axios with Bearer token in Authorization header

### Authentication & Storage
```typescript
// Token stored in localStorage
localStorage.setItem('token', jwtToken);
const token = localStorage.getItem('token');

// API calls include bearer token
const headers = { Authorization: `Bearer ${token}` };
axios.get('/api/endpoint', { headers });
```

### API Configuration
- **Base URL**: Defined in `client/src/config.ts`
- **API_BASE_URL**: `http://localhost:5000` (dev) or production domain
- **All API responses**: Destructure `{ message, data }` from response.data

### Styling
- **Bootstrap 5.3.8** for component library
- **CSS files**: Co-located with components (e.g., `Component.css`)
- **No Tailwind/CSS-in-JS**: Use vanilla CSS or Bootstrap classes

### Notifications
- **react-toastify** for user feedback
- Pattern: `toast.success(msg)`, `toast.error(msg)`, `toast.info(msg)`

---

## Backend Conventions (Node.js + Express)

### Architecture
- **Three-layer pattern**: Routes → Controllers → Services → Models
- **Routes**: Define endpoints and chain middleware
- **Controllers**: Handle request/response, call services
- **Services**: Encapsulate business logic
- **Models**: Mongoose schemas with timestamps

### Request/Response Pattern
```javascript
// Controllers always follow:
try {
  const result = await serviceCall();
  res.status(200).json({ message: 'Success', data: result });
} catch (err) {
  res.status(400).json({ message: err.message });
}

// Status codes: 200 (success), 400 (validation), 401 (auth), 403 (forbidden), 404 (not found), 500 (server error)
```

### Middleware Chaining
- Use **middleware composition** for auth, permissions, file uploads
- Common middleware: `authMiddleware.jsx` (verify JWT), `superAdminMiddleware.js`, `roleManagementMiddleware.js`, `upload.jsx` (Multer)
- Pattern: `router.post('/endpoint', authMiddleware, roleCheck, controller)`

### Role-Based Access Control (RBAC)
- **User model** has `role` (string) and `rolePermissions` (object with boolean flags)
- **Roles**: 'superadmin', 'admin', 'user', 'advisor', 'associate', etc.
- **Permission checks**: Access `user.rolePermissions['feature.action']`
- Common permissions: `canCreateCompany`, `canManageUsers`, `canEditLibrary`, etc.

### Database & Models
- **Mongoose defaults**: `{ timestamps: true }` (adds createdAt, updatedAt)
- **Relations**: Use ObjectId refs + `.populate()` for joins
- **Status fields**: Use enums: `'Active'`, `'Inactive'`, `'Suspended'`
- **Pre-hooks**: Leverage Mongoose pre-save for password hashing, data transformation
- **Nested objects**: Group related data (e.g., `companyProfile: { name, country, ... }`)

### Migrations
- **Location**: `server/migrations/`
- **Pattern**: Each migration is a self-contained script with try-catch
- **Usage**: `npm run migrate` (runs all) or individual scripts
- **Naming**: `fixMemberForStructure.js`, `migrateRoleSchema.js`, etc.

---

## Common Development Patterns

### Adding a New API Endpoint
1. **Create route** in `server/routes/featureRoutes.js`
2. **Create controller** in `server/controllers/featureController.js`
3. **Create/update model** in `server/models/Feature.js`
4. **Add middleware** as needed (auth, permissions)
5. **Add service layer** in `server/services/featureService.js` if complex logic
6. **Test** via curl, Postman, or custom script in `server/tests/`

### Adding a React Component
1. **Create component** in `client/src/components/` or `client/src/pages/`
2. **Define prop types** as TypeScript interface
3. **Use hooks** for state and side effects
4. **Call API** via `fetch()` or axios with Bearer token
5. **Handle errors** with try-catch and toast notifications
6. **Add CSS** alongside component (e.g., `Component.css`)

### Working with Multiple Companies (Multi-Tenancy)
- **Model**: `user.companyId` references the active company
- **API filters**: Controllers filter data by `userId` and `companyId`
- **Frontend**: User can switch companies, which updates `localStorage` and re-queries data
- **Permission boundary**: Ensure RBAC respects company isolation

---

## Important Gotchas & Notes

### Frontend
- **localStorage duplication**: Auth tokens AND user data may both be in localStorage (check `config.ts` and components)
- **CSS specificity**: Bootstrap classes may conflict; use scoped CSS files if needed
- **API error handling**: Always check `response.data.message` (not just `response.message`)
- **Token refresh**: No auto-refresh; expired tokens require re-login

### Backend
- **Password hashing**: Done in User model pre-save hook; never store plain passwords
- **Cors**: Currently allows all origins (`origin: '*'`); restrict in production
- **File uploads**: Multer + GridFS for uploaded media; stored in `server/uploads/`
- **Email**: Uses Nodemailer (gmail SMTP); requires valid `EMAIL_USER` and `EMAIL_PASS` env vars
- **Status codes**: Be explicit (400 vs 401 vs 403); impacts frontend error handling

### Database
- **ObjectId refs**: Always populate nested user/role/company refs before responding
- **MongoDB Atlas**: Connection string in `.env` (get from Docker compose or cloud dashboard)
- **Seeding**: Use provided scripts (`seedSuperAdmin.js`, `seedDefaultRoles.js`) to bootstrap data
- **Migrations**: Are idempotent; safe to run multiple times

### Docker & Deployment
- **Development**: `docker-compose.yml` mounts volumes; app reloads on file changes
- **Production**: `docker-compose.prod.yml` uses built images; no hot reload
- **Health check**: Backend exposes `/health` endpoint for container orchestration
- **Environment vars**: Loaded from `.env` in root and `server/.env` (not both at once)

---

## File Organization Reference

```
client/src/
├── components/        # Reusable UI components
├── pages/            # Page-level components (routes)
├── services/         # API service functions
├── utils/            # Helper functions, validators
├── hooks/            # Custom React hooks
├── api/              # API configuration & endpoints
├── config.ts         # App-wide config (base URL, constants)
└── App.tsx           # Root component

server/
├── routes/           # Route definitions
├── controllers/      # Endpoint handlers
├── models/           # Mongoose schemas
├── middleware/       # Auth, permissions, uploads
├── services/         # Business logic
├── migrations/       # Database migrations
├── utils/            # Server helpers
└── index.jsx         # Entry point
```

---

## Testing & Debugging

### Backend Testing Scripts
- `npm run test:memberfor` - Validate MemberFor structure
- `npm run test:company-switch` - Test company switching logic
- Custom tests in `server/tests/` (self-contained Node.js scripts)

### Debugging Tips
- **Backend**: Check Docker logs: `docker logs strf-server -f` or `npm run dev` for nodemon output
- **Frontend**: React DevTools in browser, check Network tab for API calls and responses
- **Database**: Use MongoDB Compass (connect to localhost:27017 or Atlas connection string)
- **Health check**: `curl http://localhost:5000/health` to verify backend is running

---

## Coding Standards

### General
- **TypeScript**: Prefer strict mode (enabled in `tsconfig.json`)
- **Function names**: camelCase for functions, PascalCase for components/classes
- **Error handling**: Always wrap async operations in try-catch; provide meaningful messages
- **Comments**: Document non-obvious logic; prefer clear variable names over comments

### React
- Functional components and hooks as default
- Props typed with interfaces (not inline prop types)
- Extract reusable logic into custom hooks
- Avoid deeply nested JSX; break into sub-components

### Express
- Use middleware composition for cross-cutting concerns
- Keep controllers lean; delegate logic to services
- Validate inputs before database operations
- Return consistent JSON structure: `{ message, data, error }`

---

## Getting Help
- Check migration files (`server/migrations/`) for reference implementations
- Review existing controllers/models for patterns
- Test scripts (`server/tests/*.js`) show real usage examples
- README.md has setup instructions and default credentials