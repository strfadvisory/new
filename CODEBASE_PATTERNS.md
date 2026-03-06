# Codebase Patterns Analysis

## 1. React Component Patterns

### Component Structure & Conventions

**File Naming Convention:**
- PascalCase for component files: `App.tsx`, `CreateProfile.tsx`, `AuthSidebar.tsx`, `AddressForm.tsx`
- CSS files use same name: `CreateProfile.css`, `Dashboard.css`, `CompanySelection.css`
- Components stored in `/src` for main pages, `/src/components` for reusable components

**Functional Components with Hooks:**
All components are modern functional components using React hooks. Example from `App.tsx`:

```typescript
import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';

function App() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [selectedCompanyType, setSelectedCompanyType] = useState<string>('');
  const navigate = useNavigate();

  // Load persisted state on app start
  useEffect(() => {
    const handleStorageChange = () => {
      setLoading(prev => !prev && prev); // Trigger re-render
    };
    
    window.addEventListener('signupStateChanged', handleStorageChange);
    return () => window.removeEventListener('signupStateChanged', handleStorageChange);
  }, []);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    
    if (token && userData) {
      setUser(JSON.parse(userData));
    }
    setLoading(false);
  }, []);
}
```

**Key Patterns Observed:**
- `useState` for local state management
- `useEffect` for side effects and lifecycle
- `useNavigate` from react-router-dom for navigation
- `useParams` for URL parameters
- Props are typed with TypeScript interfaces

### Component Composition & Props Pattern

Components accept typed props and use composition model:

```typescript
interface CreateProfileProps {
  onBack: () => void;
  onRegister: (user: any) => void;
  onNavigate?: (step: string) => void;
}

const CreateProfile: React.FC<CreateProfileProps> = ({ onBack, onRegister, onNavigate }) => {
  // Component implementation
}
```

Reusable components like `AddressForm` follow prop-based composition:

```typescript
interface AddressData {
  zipCode: string;
  state: string;
  city: string;
  address1: string;
  address2: string;
}

interface AddressFormProps {
  addressData: AddressData;
  onAddressChange: (addressData: AddressData) => void;
  showUseMyAddress?: boolean;
  useMyAddress?: boolean;
  onUseMyAddressChange?: (checked: boolean) => void;
}

const AddressForm: React.FC<AddressFormProps> = ({
  addressData,
  onAddressChange,
  showUseMyAddress = false,
  useMyAddress = false,
  onUseMyAddressChange
}) => {
  // Component implementation
}
```

### State Management

**Local Storage for Persistent State:**
- Uses browser localStorage for authentication tokens and user data
- Custom state management via utility functions (e.g., `signupState`)
- Custom events (`signupStateChanged`) for state synchronization

```typescript
const handleLogin = async (userData: any) => {
  setUser(userData);
  localStorage.setItem('user', JSON.stringify(userData)); // Persist user
  
  if (userData.isSuperAdmin) {
    navigate('/admin/simulators');
  } else {
    // Fetch user permissions...
  }
};
```

### Import/Export Patterns

**Named Exports with Default Export:**

```typescript
// Explicit component export (default)
export default AuthSidebar;

// Or with export statement
export default App;

// Imports with path-based organization
import { updateSignupState, getSignupState, clearSignupState, getFormData } from './utils/signupState';
import { API_ENDPOINTS } from './config';
import SignupStateDebug from './components/SignupStateDebug';
```

### API Integration Pattern

Direct fetch calls with Bearer token authentication:

```typescript
const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
  setFormData({ ...formData, [e.target.name]: e.target.value });
};

const fetchUserData = async () => {
  try {
    const response = await fetch(`${API_ENDPOINTS.verifyAdvisory}/${token}`);
    const data = await response.json();
    if (response.ok) {
      setUserInfo({ firstName: data.firstName, lastName: data.lastName });
      setFormData(prev => ({
        ...prev,
        email: data.email
      }));
    } else {
      toast.error(data.message || 'Invalid verification link');
      navigate('/login');
    }
  } catch (error) {
    toast.error('Failed to verify link');
    navigate('/login');
  } finally {
    setLoading(false);
  }
};
```

### Toast/Notification Pattern

Uses react-toastify for notifications:

```typescript
import { toast } from 'react-toastify';

toast.error(data.message || 'Invalid verification link');
toast.success('Profile created successfully');
```

---

## 2. Backend API Patterns

### Route Structure & Organization

**File Naming Convention:**
- Routes suffixed with `Routes`: `authRoutes.js`, `userRoutes.js`, `roleRoutes.js`
- Controllers suffixed with `Controller`: `authController.js`, `userController.js`
- Central routing in `index.jsx` with `/api/` prefix

**Route File Example** (`authRoutes.js`):

```javascript
const express = require('express');
const { register, login, verifyOTP, resendOTP, createCompanyProfile, inviteAdvisory, verifyAdvisoryToken, completeAdvisoryProfile } = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware.jsx');
const upload = require('../middleware/upload.jsx');
const { uploadToGridFS } = require('../middleware/upload.jsx');

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.post('/verify-otp', verifyOTP);
router.post('/resend-otp', resendOTP);
router.post('/company-profile', protect, upload.single('logo'), uploadToGridFS, createCompanyProfile);
router.post('/invite-advisory', protect, inviteAdvisory);
router.get('/verify-advisory/:token', verifyAdvisoryToken);
router.post('/complete-advisory-profile/:token', completeAdvisoryProfile);
router.get('/me', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password -otp -otpExpiry');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json({
      _id: user._id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      isSuperAdmin: user.isSuperAdmin || false,
      companyType: user.companyType,
      role: user.role
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching user info' });
  }
});

module.exports = router;
```

**Key Patterns:**
- RESTful naming conventions (POST for create, GET for fetch, PUT for update)
- Optional middleware chaining (e.g., `protect`, `upload.single()`, `uploadToGridFS`)
- Inline route handlers for simple operations
- Explicit controller imports for complex operations

### Controller Patterns

**Controller File Example** (`authController.js`):

```javascript
const register = async (req, res) => {
  try {
    const { firstName, lastName, email, designation, phone, password, address, level, roleId, roleName } = req.body;
    
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Use the selected role from frontend
    let selectedRole;
    if (roleId) {
      selectedRole = await Role.findById(roleId);
      if (!selectedRole) {
        return res.status(400).json({ message: 'Selected role not found.' });
      }
    } else {
      // Fallback to ADMIN role if no role selected
      selectedRole = await Role.findOne({ name: 'ADMIN', status: true });
      if (!selectedRole) {
        return res.status(400).json({ message: 'ADMIN role not found. Please contact administrator.' });
      }
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000);

    // Generate orgId
    const lastUser = await User.findOne({ orgId: { $exists: true } }).sort({ orgId: -1 }).limit(1);
    let orgId = 'ORG-0001';
    if (lastUser && lastUser.orgId) {
      const lastNumber = parseInt(lastUser.orgId.split('-')[1]);
      orgId = `ORG-${String(lastNumber + 1).padStart(4, '0')}`;
    }

    const user = await User.create({
      firstName,
      lastName,
      email,
      designation,
      phone,
      password,
      address,
      companyType: roleName || selectedRole.name,
      roleId: selectedRole._id,
      role: 'ADMIN', // Set role to ADMIN for signup users
      orgId,
      level,
      otp,
      otpExpiry,
      isVerified: false
    });

    try {
      await sendOTPEmail(email, otp);
    } catch (emailError) {
      console.log('Email send failed, but user created. OTP:', otp);
    }

    const token = generateToken(user._id);
    
    res.status(201).json({
      _id: user._id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      companyType: user.companyType,
      orgId: user.orgId,
      token
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(400).json({ message: error.message });
  }
};
```

**Controller Function Pattern Example** (`userController.js`):

```javascript
const getAllUsers = async (req, res) => {
  try {
    const users = await User.find()
      .populate('roleId', 'name type')
      .select('-password')
      .sort({ createdAt: -1 });
    
    const formattedUsers = users.map(user => ({
      _id: user._id,
      name: `${user.firstName} ${user.lastName}`,
      email: user.email,
      company: user.companyProfile?.companyName || user.companyType || 'N/A',
      role: user.roleId?.name || user.role || 'No Role',
      status: user.status || 'Active',
      createdAt: user.createdAt
    }));
    
    res.json(formattedUsers);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ message: error.message });
  }
};

const updateUserStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    
    const user = await User.findByIdAndUpdate(
      id,
      { status },
      { new: true }
    ).select('-password');
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    res.json({ message: 'User status updated successfully', user });
  } catch (error) {
    console.error('Error updating user status:', error);
    res.status(500).json({ message: error.message });
  }
};
```

**Key Patterns:**
- Try-catch wrapping all async operations
- Explicit error responses with status codes
- Data transformation/formatting before response
- Destructuring request parameters
- Data validation before operations

### Middleware Usage

**Authentication Middleware** (`authMiddleware.jsx`):

```javascript
const protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret');
      
      // Get user with role data
      const user = await User.findById(decoded.id)
        .populate('roleId')
        .select('-password');
      
      if (!user) {
        return res.status(401).json({ message: 'User not found' });
      }
      
      req.user = user;
      next();
    } catch (error) {
      res.status(401).json({ message: 'Not authorized' });
    }
  } else {
    res.status(401).json({ message: 'Not authorized, no token' });
  }
};

module.exports = { protect };
```

**Role-Based Middleware** (`roleManagementMiddleware.js`):

```javascript
const roleManagementPermission = (req, res, next) => {
  try {
    const user = req.user;
    
    // Allow super admin
    if (user.isSuperAdmin) {
      return next();
    }
    
    // Check if user has role management permissions
    if (!user.rolePermissions) {
      return res.status(403).json({ message: 'Access denied. Role management permissions required.' });
    }
    
    // Check for specific role management permissions
    const hasCreateRole = user.rolePermissions['ROLE_MANAGEMENT.CREATE_ROLE'];
    const hasEditRole = user.rolePermissions['ROLE_MANAGEMENT.EDIT_ROLE'];
    const hasDeleteRole = user.rolePermissions['ROLE_MANAGEMENT.DELETE_ROLE'];
    
    if (!hasCreateRole && !hasEditRole && !hasDeleteRole) {
      return res.status(403).json({ message: 'Access denied. Role management permissions required.' });
    }
    
    next();
  } catch (error) {
    return res.status(403).json({ message: 'Access denied. Invalid permissions.' });
  }
};

module.exports = { roleManagementPermission };
```

**Middleware Chaining Pattern:**

```javascript
router.put('/:id', protect, superAdminOnly, updateUser);
router.post('/company-profile', protect, upload.single('logo'), uploadToGridFS, createCompanyProfile);
```

### Error Handling

**Global Error Handler** (in `index.jsx`):

```javascript
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({ message: 'Internal server error', error: err.message });
});
```

**Per-Route Error Handling:**
- Try-catch blocks in all async functions
- Explicit error status codes (400, 401, 403, 404, 500)
- Meaningful error messages returned to client
- Console logging with context (e.g., 'Register error:')

### Request/Response Pattern

**Request:**
- JSON body with explicit destructuring
- Bearer token in Authorization header
- Optional middleware for validation

**Response Pattern:**
- Success: `res.status(200/201).json({ data })` or just `res.json(data)`
- Error: `res.status(code).json({ message: 'Error description' })`
- For operations: Include operation result and message
- For data fetch: Return formatted/transformed data

---

## 3. Testing Setup

**Current Status:** No test files found in the repository

**Test Configuration:**
- No Jest configuration found in `package.json`
- No Vitest setup detected
- No test directories (`__tests__`, `tests/` etc.) with actual tests
- Server has empty `/tests` directory

**Implications:**
- Manual testing likely used
- No automated test pipeline currently in place
- Opportunity to add testing infrastructure

---

## 4. Database Patterns

### Model Structure

**File Naming Convention:**
- PascalCase singular names: `User.js`, `Role.js`, `Library.js`
- Located in `/server/models/`
- Each file exports a single Mongoose model

**User Model Example** (`User.js`):

```javascript
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  designation: { type: String },
  phone: { type: String },
  password: { type: String, required: true },
  address: {
    zipCode: String,
    state: String,
    city: String,
    address1: String,
    address2: String
  },
  companyType: String,
  roleId: { type: mongoose.Schema.Types.ObjectId, ref: 'Role' },
  role: { type: String, default: 'USER' },
  roleType: { type: String },
  status: { type: String, enum: ['Active', 'Inactive', 'Suspended'], default: 'Active' },
  isSuperAdmin: { type: Boolean, default: false },
  orgId: { type: String },
  level: { type: String },
  verificationToken: String,
  verificationTokenExpiry: Date,
  otp: String,
  otpExpiry: Date,
  isVerified: { type: Boolean, default: false },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  companyProfile: {
    companyName: String,
    description: String,
    phone: String,
    email: String,
    contactPerson: String,
    linkedinUrl: String,
    websiteLink: String,
    zipCode: String,
    state: String,
    city: String,
    address1: String,
    address2: String,
    logoId: String
  }
}, { timestamps: true });

userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

userSchema.methods.comparePassword = async function(password) {
  return await bcrypt.compare(password, this.password);
};

module.exports = mongoose.model('User', userSchema);
```

**Role Model Example** (`Role.js`):

```javascript
const mongoose = require('mongoose');

const roleSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String, required: true },
  icon: { type: String, required: true },
  type: { type: String, enum: ['Master', 'User'], required: true },
  status: { type: Boolean, default: true },
  permissions: [{ type: String }],
  nextSteps: [{ type: String }],
  videos: [{ type: String }],
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

roleSchema.index({ createdBy: 1 });

module.exports = mongoose.model('Role', roleSchema);
```

**Library Model Example** (`Library.js`):

```javascript
const mongoose = require('mongoose');

const librarySchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true,
    trim: true
  },
  thumbnail: {
    type: String,
    required: false
  },
  videoUrl: {
    type: String,
    required: true
  },
  isActive: {
    type: Boolean,
    default: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

librarySchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('Library', librarySchema);
```

### Validation Patterns

**Schema-Level Validation:**
- Type validation via `type: String`, `type: Number`, etc.
- Required fields via `required: true`
- Default values via `default: value`
- Enum validation via `enum: ['value1', 'value2']`
- Unique constraints via `unique: true`
- String trimming via `trim: true`

**Nested Object Validation:**
```javascript
address: {
  zipCode: String,
  state: String,
  city: String,
  address1: String,
  address2: String
}
```

### Relations Between Models

**Reference Relations (Foreign Keys):**

```javascript
roleId: { type: mongoose.Schema.Types.ObjectId, ref: 'Role' }
createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
```

**Usage in Queries:**
- Population: `.populate('roleId', 'name type')`
- Selects specific fields from referenced document
- Used in controllers to fetch related data

**Hierarchical Relations:**
- User references Role (many users can have one role)
- User references createdBy (user created another user)
- Role references createdBy (user created role)

### Pre/Post Hooks

**Pre-save Hooks for Data Processing:**

```javascript
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

librarySchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});
```

### Indexing

**Index Examples:**
```javascript
roleSchema.index({ createdBy: 1 });  // Index on createdBy field
email: { type: String, required: true, unique: true }  // Unique index
```

---

## 5. Project Structure & Organization

### Overall Folder Organization

```
Root/
├── client/              # React TypeScript frontend
│   ├── public/
│   ├── src/
│   │   ├── components/  # Reusable components
│   │   ├── pages/       # Page components
│   │   ├── services/    # API utilities
│   │   ├── utils/       # Helper functions
│   │   ├── config.ts    # Configuration & API endpoints
│   │   └── *.tsx        # Main page components
│   ├── package.json
│   └── tsconfig.json
│
├── server/              # Node.js Express backend
│   ├── controllers/     # Business logic
│   ├── models/          # Mongoose schemas
│   ├── routes/          # Route definitions
│   ├── middleware/      # Express middleware
│   ├── services/        # Business services
│   ├── migrations/      # Database migrations
│   ├── uploads/         # File uploads directory
│   ├── scripts.json     # Seed & migration scripts
│   ├── seedDefaultRoles.js
│   ├── seedSuperAdmin.js
│   ├── index.jsx        # Express app entry point
│   └── package.json
│
├── docker-compose.yml   # Local development
├── docker-compose.prod.yml
├── package.json         # Root package.json
└── README.md
```

### Separation of Concerns

**Frontend (Client):**
- **components/**: Reusable UI components with clear prop interfaces
- **pages/**: Full-page components (Simulator, Companies, Users, etc.)
- **services/**: API communication and data fetching
- **utils/**: Helper functions and utilities
- **config.ts**: Centralized API endpoint configuration

**Backend (Server):**
- **models/**: Data schema definitions (User, Role, Library, etc.)
- **controllers/**: Business logic for each domain
- **routes/**: HTTP endpoint definitions
- **middleware/**: Authentication, authorization, file upload
- **services/**: Reusable business logic (email, permissions, etc.)
- **migrations/**: Database schema evolution scripts

### Configuration Management

**API Configuration** (`config.ts`):

```typescript
export const API_BASE_URL = process.env.REACT_APP_API_URL || 
  (process.env.NODE_ENV === 'production' ? '/api' : 'http://localhost:5000');

export const API_ENDPOINTS = {
  // Auth endpoints
  login: `${API_BASE_URL}/api/auth/login`,
  register: `${API_BASE_URL}/api/auth/register`,
  // ... all endpoints centralized
};
```

**Server Entry Point** (`index.jsx`):

```javascript
require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 5000;

// CORS and middleware setup
app.use(cors({ origin: '*', credentials: true }));
app.use(express.json({ limit: '50mb' }));

// MongoDB connection with retry
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, { /* options */ });
    console.log('✅ MongoDB connected successfully');
  } catch (err) {
    console.error('❌ MongoDB connection error:', err.message);
    setTimeout(connectDB, 5000);  // Retry after 5s
  }
};

// Mount all routes
app.use('/api/auth', authRoutes);
app.use('/api/roles', roleRoutes);
app.use('/api/users', userRoutes);
// ... other routes

// Global error handler
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({ message: 'Internal server error', error: err.message });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
```

### Package Management

**Frontend Dependencies** (`client/package.json`):
- React 18.2.0, React Router v6
- TypeScript for type safety
- Axios for HTTP requests
- React Toastify for notifications
- React Query (TanStack) for data fetching

**Backend Dependencies** (`server/package.json`):
- Express 4.18.2 for API framework
- Mongoose 8.0.0 for MongoDB ODM
- JWT for authentication
- Bcryptjs for password hashing
- Nodemailer for email
- Multer + GridFS for file upload
- Nodemon for development

---

## Summary of Key Patterns

### Frontend Patterns
✅ Functional components with TypeScript  
✅ Props-based composition  
✅ localStorage for state persistence  
✅ Custom events for state sync  
✅ Direct fetch for API calls with Bearer tokens  
✅ Try-catch error handling with toast notifications  
✅ Centralized API endpoint configuration

### Backend Patterns
✅ Layer separation: Routes → Controllers → Models  
✅ Middleware chaining for authentication/authorization  
✅ Try-catch with explicit error status codes  
✅ Schema validation in Mongoose models  
✅ Pre-hooks for data transformation (password hashing, timestamps)  
✅ Population/reference for relational data  
✅ Role-based access control middleware

### Database Patterns
✅ Timestamps by default (`{ timestamps: true }`)  
✅ Reference relations via ObjectId  
✅ Pre-save hooks for data processing  
✅ Strategic indexing  
✅ Nested objects for grouped data  
✅ Status enums for state management

### Organization Patterns
✅ Clear separation of concerns (components, pages, services, utils)  
✅ Centralized configuration  
✅ Middleware-first architecture  
✅ Service layer for complex logic  
✅ Migration scripts for schema evolution
