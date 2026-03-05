# Enterprise Reserve Management System

A full-stack application for managing reserve funds and advisory services.

## Quick Start

### Default Admin Credentials
- Email: admin@reservefundadvisory.com
- Password: Admin@123

## Setup Instructions

### Prerequisites
- Node.js 18+
- MongoDB (local or cloud)
- Docker (optional)

### Development Setup

1. **Clone and Install Dependencies**
   ```bash
   # Install client dependencies
   cd client
   npm install
   
   # Install server dependencies
   cd ../server
   npm install
   ```

2. **Environment Configuration**
   ```bash
   # Copy environment files
   cp .env.example .env
   cp server/.env.example server/.env
   ```

3. **Database Setup**
   ```bash
   # Run migrations
   cd server
   npm run migrate
   
   # Seed super admin
   npm run seed:superadmin
   ```

4. **Start Development Servers**
   ```bash
   # Terminal 1 - Start backend
   cd server
   npm run dev
   
   # Terminal 2 - Start frontend
   cd client
   npm start
   ```

### Docker Setup

1. **Development with Docker**
   ```bash
   docker-compose up
   ```

2. **Production with Docker**
   ```bash
   docker-compose -f docker-compose.prod.yml up
   ```

## Project Structure

```
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/    # Reusable components
│   │   ├── pages/         # Page components
│   │   ├── services/      # API services
│   │   └── utils/         # Utility functions
│   └── public/
├── server/                # Node.js backend
│   ├── controllers/       # Route controllers
│   ├── models/           # Database models
│   ├── routes/           # API routes
│   ├── middleware/       # Custom middleware
│   ├── services/         # Business logic
│   └── migrations/       # Database migrations
└── docker-compose.yml    # Docker configuration
```

## Features

- User authentication and authorization
- Role-based access control
- Company profile management
- Advisory invitation system
- Library management
- Super admin dashboard
- Responsive design

## API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration
- `POST /api/auth/verify-otp` - OTP verification

### Users
- `GET /api/users` - Get all users
- `PUT /api/users/:id/status` - Update user status

### Roles
- `GET /api/roles` - Get all roles
- `POST /api/roles` - Create new role

### Library
- `GET /api/library` - Get library items
- `POST /api/library` - Create library item

## Troubleshooting

### Common Issues

1. **MongoDB Connection Error**
   - Check MONGO_URI in environment variables
   - Ensure MongoDB is running
   - Verify network connectivity

2. **Missing Dependencies**
   - Run `npm install` in both client and server directories
   - Clear node_modules and reinstall if needed

3. **Port Conflicts**
   - Client runs on port 3000
   - Server runs on port 5000
   - Change ports in environment variables if needed

4. **Docker Issues**
   - Ensure Docker is running
   - Check for port conflicts
   - Rebuild containers: `docker-compose build --no-cache`

## Scripts

### Server Scripts
- `npm start` - Start production server
- `npm run dev` - Start development server
- `npm run migrate` - Run database migrations
- `npm run seed:superadmin` - Create super admin user

### Client Scripts
- `npm start` - Start development server
- `npm run build` - Build for production

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests
5. Submit a pull request

## License

Private - All rights reserved