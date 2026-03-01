# STRF - Technical Analysis & Architecture Notes

## 📋 Project Overview
**STRF (Strategic Reserve Fund)** is a full-stack web application built for organizational management with role-based access control, user management, and advisory services.

### 🏗️ Architecture Stack
- **Frontend**: React 18 + TypeScript
- **Backend**: Express.js (Node.js)
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT + bcrypt
- **Containerization**: Docker + Docker Compose
- **File Upload**: Multer + GridFS

---

## 🗂️ Project Structure

```
strf/
├── client/                 # React TypeScript Frontend
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── pages/         # Page components
│   │   │   └── superadmin/ # Super admin specific pages
│   │   ├── theme/         # UI theme configuration
│   │   └── utils/         # Utility functions
│   ├── public/            # Static assets
│   └── Dockerfile         # Client container config
├── server/                # Express.js Backend
│   ├── controllers/       # Business logic handlers
│   ├── middleware/        # Authentication & validation
│   ├── models/           # MongoDB schemas
│   ├── routes/           # API endpoints
│   ├── services/         # External services
│   ├── uploads/          # File storage
│   └── migrations/       # Database migrations
└── docker-compose.yml    # Multi-container orchestration
```

---

## 🔐 Authentication & Authorization System

### User Roles Hierarchy
1. **Super Admin** - System-wide access
2. **Primary Roles** - Organization level
3. **Secondary Roles** - Department level  
4. **Members** - Individual contributors

### Authentication Flow
```typescript
Login → JWT Token → Role Validation → Permission Check → Route Access
```

### Key Features
- **JWT Authentication** with 30-day expiry
- **OTP Verification** for new registrations
- **Master OTP**: `233412` (bypass for testing)
- **Role-based Navigation** dynamically generated
- **Company Profile** creation workflow

---

## 📊 Database Schema

### User Model
```javascript
{
  firstName, lastName, email, designation, phone, password,
  address: { zipCode, state, city, address1, address2 },
  companyType, roleId, role, roleType, status,
  isSuperAdmin, orgId, level,
  verificationToken, verificationTokenExpiry,
  otp, otpExpiry, isVerified,
  createdBy,
  companyProfile: {
    companyName, description, phone, email, contactPerson,
    linkedinUrl, websiteLink, address, logoId
  }
}
```

### Role Model (Hierarchical)
```javascript
{
  name, type, description, icon, status,
  permissions: {}, canEditPermissions: {},
  childRoles: [grandChildRoleSchema],
  nextSteps: [{ title, description, icon, completed }],
  video: [{}],
  createdBy
}
```

---

## 🛠️ API Endpoints

### Authentication Routes (`/api/auth`)
- `POST /login` - User authentication
- `POST /register` - New user registration
- `POST /verify-otp` - OTP verification
- `POST /resend-otp` - Resend OTP
- `POST /create-company-profile` - Company setup
- `POST /invite-advisory` - Invite advisory members
- `GET /verify-advisory/:token` - Advisory verification

### User Management (`/api/users`)
- User CRUD operations
- Role assignments
- Status management

### Role Management (`/api/roles`)
- `GET /user-permissions` - User navigation menu
- `GET /user-nextsteps` - Dashboard next steps
- `GET /user-videos` - Role-specific videos
- `GET /child-roles` - Available child roles

### Library & Content (`/api/library`)
- Document management
- Video content
- File uploads

---

## 🎨 Frontend Architecture

### State Management
- **Local State**: React hooks (useState, useEffect)
- **Persistent State**: localStorage for auth tokens
- **Signup Flow**: Custom utility (`signupState.ts`)

### Key Components
- **AuthSidebar**: Login/signup sidebar
- **DashboardLayout**: Main app layout with navigation
- **SuperAdminLayout**: Admin-specific layout
- **AddressForm**: Reusable address input component

### Routing Structure
```typescript
/login → /signup → /create-profile → /verify-otp → /company-profile → /dashboard
                                                                   → /admin/*
```

### Navigation System
- **Dynamic Menu**: Generated from user permissions
- **Role-based Access**: Routes protected by user role
- **Breadcrumb**: Navigation tracking

---

## 🔧 Configuration & Environment

### Environment Variables
```bash
# Server
MONGO_URI=mongodb+srv://...
JWT_SECRET=secret
PORT=5000
NODE_ENV=production
CLIENT_URL=http://localhost:3000

# Client  
REACT_APP_API_URL=http://localhost:5000
```

### Docker Configuration
- **Development**: `docker-compose.yml`
- **Production**: `docker-compose.prod.yml`
- **Multi-stage builds** for optimized images
- **Volume mounting** for development

---

## 📱 Key Features Implementation

### 1. Multi-step Registration
```typescript
Company Selection → Profile Creation → OTP Verification → Company Profile → Dashboard
```

### 2. Invitation System
- **Advisory Invitations** with email verification
- **Temporary passwords** auto-generated
- **Verification links** with 7-day expiry

### 3. File Upload System
- **Multer** for file handling
- **GridFS** for MongoDB file storage
- **Company logos** and document uploads

### 4. Dashboard System
- **Role-specific content** (videos, next steps)
- **Dynamic navigation** based on permissions
- **Company management** features

---

## 🚀 Deployment & DevOps

### Docker Deployment
```bash
# Production deployment
npm run deploy:prod

# Container management
npm run logs
npm run restart
npm run status
```

### Scripts Available
- `deploy:prod` - Production deployment
- `logs` - View container logs
- `check` - Backend health check
- `seed:superadmin` - Create super admin user

---

## 🔍 Security Implementation

### Authentication Security
- **Password hashing** with bcryptjs (12 rounds)
- **JWT tokens** with expiration
- **OTP verification** for email validation
- **Token-based** API authentication

### Authorization Security
- **Role-based permissions** system
- **Route protection** middleware
- **Super admin** privilege separation
- **CORS configuration** for cross-origin requests

---

## 📈 Performance Considerations

### Frontend Optimization
- **Code splitting** with React.lazy (potential)
- **Image optimization** for uploads
- **Bundle size** management with TypeScript

### Backend Optimization
- **MongoDB indexing** on email, orgId
- **Connection pooling** with Mongoose
- **File size limits** (50MB for uploads)
- **Request timeout** configuration

---

## 🐛 Known Issues & Technical Debt

### Current Issues
1. **Mixed file extensions** (.js, .jsx in server)
2. **Hardcoded credentials** in docker-compose
3. **Master OTP** in production code
4. **CORS wildcard** (*) in production

### Improvement Areas
1. **Error handling** standardization
2. **Input validation** enhancement  
3. **API documentation** (Swagger/OpenAPI)
4. **Unit testing** implementation
5. **Environment variable** management
6. **Logging system** implementation

---

## 🔮 Future Enhancements

### Technical Improvements
- **Redis** for session management
- **Rate limiting** for API endpoints
- **Database migrations** system
- **Automated testing** pipeline
- **API versioning** strategy

### Feature Enhancements
- **Real-time notifications** (WebSocket)
- **Advanced analytics** dashboard
- **Multi-language support**
- **Mobile responsive** improvements
- **Advanced search** functionality

---

## 📚 Dependencies Analysis

### Frontend Dependencies
```json
{
  "react": "^18.2.0",
  "typescript": "^4.9.5", 
  "axios": "^1.13.5",
  "react-router-dom": "^6.20.0",
  "react-toastify": "^11.0.5",
  "bootstrap": "^5.3.8"
}
```

### Backend Dependencies
```json
{
  "express": "^4.18.2",
  "mongoose": "^8.0.0",
  "bcryptjs": "^3.0.3",
  "jsonwebtoken": "^9.0.3",
  "multer": "^1.4.4",
  "nodemailer": "^6.9.7",
  "cors": "^2.8.5"
}
```

---

## 🎯 Development Guidelines

### Code Standards
- **TypeScript** for frontend type safety
- **ESLint** configuration for code quality
- **Consistent naming** conventions
- **Component-based** architecture

### Git Workflow
- **Feature branches** for development
- **Environment-specific** configurations
- **Docker-based** development environment

---

*Last Updated: January 2025*
*Version: 1.0.0*