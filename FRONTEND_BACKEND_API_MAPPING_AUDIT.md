# Frontend-Backend API Mapping Audit

## Current Status

### Backend Routes Defined (Server)
```
✅ /api/auth/login
✅ /api/auth/register
✅ /api/dashboard/admin
✅ /api/dashboard/flat-owner
✅ /api/dashboard/tenant
✅ /api/dashboard/maintenance
✅ /api/owner/*
✅ /api/onboarding/*
✅ /api/offboarding/*
✅ /api/parking/*
✅ /api/reports/*
✅ /api/finances/*
✅ /api/notifications/*
✅ /api/users/*
✅ /api/mfa/*
```

### Frontend Pages Defined (Client)
```
✅ /login
✅ /register
✅ /forgot-password
✅ /verify-otp
✅ /dashboard/admin
✅ /dashboard/flat-owner
✅ /dashboard/tenant
✅ /dashboard/maintenance
✅ /reports
✅ /notifications
✅ / (landing page)
```

### Frontend API Calls Made
```
✅ api.get('/dashboard/admin')          → /api/dashboard/admin
✅ api.get('/dashboard/tenant')         → /api/dashboard/tenant
✅ api.get('/dashboard/maintenance')    → /api/dashboard/maintenance
✅ ownerApi.getProfile()                → /api/owner/*
✅ ownerApi.getProperties()             → /api/owner/*
✅ reportsApi.*                         → /api/reports/*
✅ notificationsApi.*                   → /api/notifications/*
```

---

## 🔴 Issues Found

### Issue 1: Admin Dashboard Page Missing

**Problem**: 
- Frontend has AdminDashboard component at `/dashboard/admin`
- Component correctly calls `/api/dashboard/admin`
- But page doesn't exist in `/app/dashboard/admin/page.tsx` properly

**Current State**:
- File exists: `/client/src/app/dashboard/admin/page.tsx` ✓
- Component exists: `/client/src/components/Dashboard/AdminDashboard.tsx` ✓
- API route exists: `GET /api/dashboard/admin` ✓

**Status**: Should be working ✓

---

### Issue 2: Property Management Pages & API

**Problem**:
- No dedicated `/dashboard/admin/properties` page
- No dedicated property detail pages
- No property CRUD API endpoints in backend
- Admin quick action buttons link to `/dashboard/admin` (same page)

**Missing**:
- [ ] `/dashboard/admin/properties` page (list all properties)
- [ ] `/dashboard/admin/properties/:id` page (property details)
- [ ] `/dashboard/admin/properties/:id/edit` page (edit property)
- [ ] Backend `/api/properties/*` routes
- [ ] Backend property controller

**Impact**:
- Admin can't navigate to dedicated property management
- Property management is part of main dashboard only
- Limited property operations

---

### Issue 3: Owner Property Pages Mapping

**Current**:
- `ownerApi.getProperties()` → `/api/owner/properties` (works)
- `ownerApi.getProfile()` → `/api/owner/profile` (works)
- `ownerApi.getFinancialSummary()` → `/api/owner/financial-summary` (works)

**Missing**:
- [ ] Individual property detail pages for owner
- [ ] Property edit pages for owner
- [ ] Tenant assignment management pages

---

### Issue 4: Admin-Specific Pages Mapping

**Missing**:
- [ ] User management page (`/dashboard/admin/users`)
- [ ] User detail/edit page (`/dashboard/admin/users/:id`)
- [ ] Property management page (`/dashboard/admin/properties`)
- [ ] Property detail page (`/dashboard/admin/properties/:id`)
- [ ] Dashboard configuration page

**API Endpoints Needed**:
- [ ] `GET /api/admin/users` - List all users
- [ ] `GET /api/admin/users/:id` - Get user detail
- [ ] `POST /api/admin/users` - Create user
- [ ] `PUT /api/admin/users/:id` - Update user
- [ ] `DELETE /api/admin/users/:id` - Delete user
- [ ] `GET /api/admin/properties` - List all properties
- [ ] `GET /api/admin/properties/:id` - Get property detail
- [ ] `POST /api/admin/properties` - Create property
- [ ] `PUT /api/admin/properties/:id` - Update property
- [ ] `DELETE /api/admin/properties/:id` - Delete property

---

## 📊 API Endpoint Mapping Matrix

### Authentication Routes ✅
| Frontend Call | Backend Route | Status |
|---|---|---|
| api.post('/auth/login') | POST /api/auth/login | ✅ |
| api.post('/auth/register') | POST /api/auth/register | ✅ |
| api.post('/auth/logout') | POST /api/auth/logout | ✅ |
| api.post('/auth/verify-otp') | POST /api/auth/verify-otp | ✅ |
| api.post('/auth/forgot-password') | POST /api/auth/forgot-password | ✅ |

### Dashboard Routes ✅
| Frontend Call | Backend Route | Status |
|---|---|---|
| api.get('/dashboard/admin') | GET /api/dashboard/admin | ✅ |
| api.get('/dashboard/flat-owner') | GET /api/dashboard/flat-owner | ✅ |
| api.get('/dashboard/tenant') | GET /api/dashboard/tenant | ✅ |
| api.get('/dashboard/maintenance') | GET /api/dashboard/maintenance | ✅ |

### Owner Routes ✅
| Frontend Call | Backend Route | Status |
|---|---|---|
| ownerApi.getProfile() | GET /api/owner/profile | ✅ |
| ownerApi.getProperties() | GET /api/owner/properties | ✅ |
| ownerApi.getFinancialSummary() | GET /api/owner/financial-summary | ✅ |
| ownerApi.getCoOwners() | GET /api/owner/co-owners | ✅ |
| ownerApi.getCommunicationPreferences() | GET /api/owner/communication-preferences | ✅ |

### Reports Routes ✅
| Frontend Call | Backend Route | Status |
|---|---|---|
| reportsApi.getFinancialHealth() | GET /api/reports/financial-health | ✅ |
| reportsApi.getCollectionSummary() | GET /api/reports/collection-summary | ✅ |
| reportsApi.getOutstandingDues() | GET /api/reports/outstanding-dues | ✅ |
| reportsApi.getCashFlow() | GET /api/reports/cash-flow | ✅ |
| reportsApi.getYearOverYearComparison() | GET /api/reports/year-over-year | ✅ |

### Notifications Routes ✅
| Frontend Call | Backend Route | Status |
|---|---|---|
| notificationsApi.getNotifications() | GET /api/notifications | ✅ |
| notificationsApi.getPreferences() | GET /api/notifications/preferences | ✅ |
| notificationsApi.getStatistics() | GET /api/notifications/statistics | ✅ |

### Admin Management Routes ❌
| Frontend Need | Backend Route | Status |
|---|---|---|
| List all users | GET /api/admin/users | ❌ Missing |
| Get user detail | GET /api/admin/users/:id | ❌ Missing |
| Create user | POST /api/admin/users | ❌ Missing |
| Update user | PUT /api/admin/users/:id | ❌ Missing |
| Delete user | DELETE /api/admin/users/:id | ❌ Missing |
| List all properties | GET /api/admin/properties | ❌ Missing |
| Get property detail | GET /api/admin/properties/:id | ❌ Missing |
| Create property | POST /api/admin/properties | ❌ Missing |
| Update property | PUT /api/admin/properties/:id | ❌ Missing |
| Delete property | DELETE /api/admin/properties/:id | ❌ Missing |

---

## 🔧 Frontend Pages That Need Creation

### Admin Section
```
/dashboard/admin/                    ✅ Exists
/dashboard/admin/properties          ❌ Missing
/dashboard/admin/properties/:id      ❌ Missing
/dashboard/admin/properties/:id/edit ❌ Missing
/dashboard/admin/users               ❌ Missing
/dashboard/admin/users/:id           ❌ Missing
/dashboard/admin/users/:id/edit      ❌ Missing
```

### Owner Section
```
/dashboard/flat-owner/               ✅ Exists
/dashboard/flat-owner/properties     ⏳ Partial (in component)
/dashboard/flat-owner/properties/:id ❌ Missing
/dashboard/flat-owner/tenants        ❌ Missing
/dashboard/flat-owner/finances       ⏳ In /finances/ folder
```

### Tenant Section
```
/dashboard/tenant/                   ✅ Exists
/dashboard/tenant/maintenance        ❌ Missing
/dashboard/tenant/payments           ❌ Missing
```

### Maintenance Section
```
/dashboard/maintenance/              ✅ Exists
/dashboard/maintenance/:id           ❌ Missing (request detail)
```

---

## 📋 Backend Routes That Need Creation

### Admin Property Management
```
GET    /api/admin/properties             ❌ Missing
GET    /api/admin/properties/:id         ❌ Missing
POST   /api/admin/properties             ❌ Missing
PUT    /api/admin/properties/:id         ❌ Missing
DELETE /api/admin/properties/:id         ❌ Missing
```

### Admin User Management
```
GET    /api/admin/users                  ❌ Missing
GET    /api/admin/users/:id              ❌ Missing
POST   /api/admin/users                  ❌ Missing
PUT    /api/admin/users/:id              ❌ Missing
DELETE /api/admin/users/:id              ❌ Missing
```

### Owner Property Details
```
GET    /api/owner/properties/:id         ❌ Missing
PUT    /api/owner/properties/:id         ❌ Missing
```

### Property Listing (Generic)
```
GET    /api/properties                   ❌ Missing
GET    /api/properties/:id               ❌ Missing
POST   /api/properties                   ❌ Missing
PUT    /api/properties/:id               ❌ Missing
DELETE /api/properties/:id               ❌ Missing
```

---

## ✅ What's Working Correctly

### Authentication ✅
- Login/Register/Logout/MFA flows properly mapped
- Token management working
- Session handling functional

### Dashboard Pages ✅
- All 4 role dashboards (Admin, Owner, Tenant, Maintenance)
- API calls correctly mapped
- Data fetching working

### Reports & Notifications ✅
- Reports page properly integrated
- Notifications center working
- All report API calls mapped

### Owner Dashboard ✅
- Profile, properties, financial data loaded correctly
- API calls working
- Data displays properly

---

## ❌ What's Missing

### Critical Gaps
1. **Admin Property Management Page** - No dedicated property list/edit
2. **Admin User Management Page** - No dedicated user list/edit
3. **Backend Admin API Routes** - No /api/admin/* endpoints
4. **Backend Property Management API** - No /api/properties/* endpoints
5. **Owner Property Detail Pages** - Can't view individual property details
6. **Property Edit Pages** - Can't edit properties

### Impact
- Limited admin functionality
- Property operations confined to dashboard summary
- No detailed property management
- No user administration interface
- Limited owner property management

---

## 📊 Implementation Requirements

### To Fix Admin Property Mapping

**Backend**:
1. Create `/api/admin/properties` endpoint
   - GET - List all properties
   - POST - Create property
2. Create `/api/admin/properties/:id` endpoint
   - GET - Get property detail
   - PUT - Update property
   - DELETE - Delete property

**Frontend**:
1. Create `/dashboard/admin/properties` page
   - List all properties
   - Search/filter
   - Quick actions (edit, delete)
2. Create `/dashboard/admin/properties/:id` page
   - Property details
   - Units list
   - Tenants assigned
   - Financial summary
3. Create `/dashboard/admin/properties/[id]/edit` page
   - Edit form for property
   - Update functionality

### To Fix Admin User Mapping

**Backend**:
1. Create `/api/admin/users` endpoint
   - GET - List all users
   - POST - Create user
2. Create `/api/admin/users/:id` endpoint
   - GET - Get user detail
   - PUT - Update user
   - DELETE - Delete user

**Frontend**:
1. Create `/dashboard/admin/users` page
   - List all users by role
   - Search/filter
   - Quick actions
2. Create `/dashboard/admin/users/:id` page
   - User profile
   - Edit user
   - Change role/permissions

---

## 🎯 Priority Fixes

### High Priority (Do First)
1. ✅ Verify existing dashboard API mappings work
2. Create `/api/properties` backend route with CRUD operations
3. Create Admin property management frontend page
4. Create Admin user management frontend page
5. Create `/api/admin` backend route with user/property endpoints

### Medium Priority (Do Next)
1. Create Owner property detail pages
2. Create property edit functionality
3. Create Owner tenant management pages
4. Add search/filter to property lists

### Low Priority (Nice to Have)
1. Add property analytics
2. Add advanced filtering
3. Add bulk operations
4. Add export functionality

---

## Summary

✅ **Working**: Dashboard pages, Reports, Notifications, Authentication, Owner dashboard
❌ **Missing**: Admin property/user management pages and APIs
⚠️ **Issue**: Property management confined to dashboard summary, no dedicated property management interface

**To resolve**: Create dedicated property and user management pages with corresponding backend APIs.

---

**Status**: Partially Functional | Needs Property Management Pages & APIs  
**Created**: 2026-01-23  
**Version**: 1.0.0
