# Property Management - User Management & Authentication System

A comprehensive user management and authentication system with role-based access control (RBAC) for property management.

## Features

### User Management and Authentication
- ✅ Four distinct user roles: Admin/Property Manager, Flat Owner, Tenant, Maintenance Staff/Vendor
- ✅ Role-based access control (RBAC) with granular permissions
- ✅ Multi-factor authentication (MFA) for admin accounts
- ✅ Email/phone verification during registration
- ✅ Support for multiple properties per admin account
- ✅ Ability for admins to create and manage user accounts
- ✅ Self-service password reset functionality
- ✅ Session management with automatic timeout after 30 minutes of inactivity

## Tech Stack

### Frontend
- **Next.js 14** - React framework with App Router
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **React Hook Form** - Form management
- **Zod** - Schema validation
- **Axios** - HTTP client

### Backend
- **Node.js** - Runtime
- **Express** - Web framework
- **TypeScript** - Type safety
- **PostgreSQL** - Database
- **Prisma** - ORM
- **JWT** - Authentication tokens
- **bcrypt** - Password hashing
- **nodemailer** - Email service
- **twilio** - SMS service
- **speakeasy** - MFA/TOTP

## Getting Started

### Prerequisites
- Node.js 18+ and npm
- PostgreSQL 14+
- Git

### Installation

1. **Install all dependencies**
   ```bash
   npm run install:all
   ```

2. **Set up environment variables**
   
   Create `server/.env`:
   ```env
   DATABASE_URL="postgresql://user:password@localhost:5432/property_management"
   JWT_SECRET="your-super-secret-jwt-key"
   JWT_REFRESH_SECRET="your-super-secret-refresh-key"
   NODE_ENV="development"
   PORT=5000
   SESSION_TIMEOUT=1800000
   SMTP_HOST="smtp.gmail.com"
   SMTP_PORT=587
   SMTP_USER="your-email@gmail.com"
   SMTP_PASS="your-app-password"
   TWILIO_ACCOUNT_SID="your-twilio-sid"
   TWILIO_AUTH_TOKEN="your-twilio-token"
   TWILIO_PHONE_NUMBER="+1234567890"
   FRONTEND_URL="http://localhost:3000"
   ```
   
   Create `client/.env.local`:
   ```env
   NEXT_PUBLIC_API_URL="http://localhost:5000/api"
   ```

3. **Set up the database**
   ```bash
   cd server
   npx prisma migrate dev
   npx prisma generate
   ```

4. **Start the development servers**
   ```bash
   npm run dev
   ```

   This will start:
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:5000

## Project Structure

```
property-management-auth/
├── client/                 # Next.js frontend
│   ├── src/
│   │   ├── app/            # Next.js App Router pages
│   │   ├── components/     # React components
│   │   └── lib/            # Utilities
│   └── public/             # Static assets
│
├── server/                  # Express backend API
│   ├── src/
│   │   ├── routes/         # API routes
│   │   ├── controllers/    # Route controllers
│   │   ├── middleware/     # Express middleware
│   │   └── config/         # Configuration
│   └── prisma/             # Prisma schema
│
└── shared/                  # Shared types
    └── types/              # TypeScript types
```

## License

MIT
