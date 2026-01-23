# Quick Reference Guide - New Features

## Admin Property Management

### Access
- **URL**: `/dashboard/admin/properties`
- **API**: `/api/admin/properties`
- **Auth**: Admin only

### Actions Available
```
GET    /api/admin/properties              List all properties
GET    /api/admin/properties/:id          Get property details
POST   /api/admin/properties              Create new property
PUT    /api/admin/properties/:id          Update property
DELETE /api/admin/properties/:id          Delete property
GET    /api/admin/properties/stats        Get statistics
```

### Frontend Pages
- `/dashboard/admin/properties` - Property list
- `/dashboard/admin/properties/[id]` - Property detail view
- `/dashboard/admin/properties/[id]/edit` - Edit property
- `/dashboard/admin/properties/create` - Create new property

### Features
- Search by name/address
- Pagination (10 per page)
- View apartments & tenants count
- Create, edit, delete properties
- View property statistics

---

## Admin User Management

### Access
- **URL**: `/dashboard/admin/users`
- **API**: `/api/admin/users`
- **Auth**: Admin only

### Actions Available
```
GET    /api/admin/users                   List all users
GET    /api/admin/users/:id               Get user details
POST   /api/admin/users                   Create new user
PUT    /api/admin/users/:id               Update user
DELETE /api/admin/users/:id               Delete user (soft)
PATCH  /api/admin/users/:id/role          Update user role
GET    /api/admin/users/stats             Get statistics
```

### Frontend Pages
- `/dashboard/admin/users` - User list
- `/dashboard/admin/users/[id]` - User detail view
- `/dashboard/admin/users/[id]/edit` - Edit user
- `/dashboard/admin/users/create` - Create new user

### Features
- Search by name/email/phone
- Filter by role (4 types)
- Filter by status (3 states)
- Pagination (10 per page)
- View verification status
- Edit user roles
- Soft delete (mark inactive)

### Roles
- ADMIN
- FLAT_OWNER
- TENANT
- MAINTENANCE_STAFF

### Statuses
- ACTIVE
- INACTIVE
- SUSPENDED

---

## Owner Property Details

### Access
- **URL**: `/dashboard/flat-owner/properties/[id]`
- **API**: `/api/owner/properties/[id]`
- **Auth**: Owner only (verified ownership)

### Actions Available
```
GET    /api/owner/properties/:id          Get property detail
PUT    /api/owner/properties/:id          Update property
GET    /api/owner/properties/:id/units    Get units
GET    /api/owner/properties/:id/tenants  Get tenants
GET    /api/owner/properties/:id/financials Get financials
```

### Tabs Available
1. **Overview** - Property info & quick stats
2. **Units** - List all apartments
3. **Tenants** - List active tenants
4. **Financials** - Financial summary

### Features
- View property overview
- View units/apartments
- View active tenants with lease dates
- View rent, maintenance, payments
- Calculate occupancy rate
- Edit property details

---

## API Client Usage

### Admin Property API
```typescript
import adminPropertyApi from '@/lib/adminPropertyApi';

// Get all properties
const result = await adminPropertyApi.getAll(page, limit, search, ownerId);

// Get single property
const result = await adminPropertyApi.getById(propertyId);

// Create property
const result = await adminPropertyApi.create({
  name: "Royal Apartments",
  address: "123 Main St",
  ownerId: "owner-id" // optional
});

// Update property
const result = await adminPropertyApi.update(propertyId, {
  name: "New Name",
  address: "New Address"
});

// Delete property
const result = await adminPropertyApi.delete(propertyId);

// Get statistics
const result = await adminPropertyApi.getStats();
```

### Admin User API
```typescript
import adminUserApi from '@/lib/adminUserApi';

// Get all users
const result = await adminUserApi.getAll(page, limit, search, role, status);

// Get single user
const result = await adminUserApi.getById(userId);

// Create user
const result = await adminUserApi.create({
  fullName: "John Doe",
  email: "john@example.com",
  phone: "1234567890",
  password: "secure123",
  role: "TENANT"
});

// Update user
const result = await adminUserApi.update(userId, {
  fullName: "Jane Doe",
  email: "jane@example.com"
});

// Delete user
const result = await adminUserApi.delete(userId);

// Update role
const result = await adminUserApi.updateRole(userId, "ADMIN");

// Get statistics
const result = await adminUserApi.getStats();
```

---

## Response Format

All APIs return standardized responses:

### Success Response
```json
{
  "success": true,
  "data": { /* entity data */ },
  "message": "Operation successful"
}
```

### List Response
```json
{
  "success": true,
  "data": {
    "properties": [ /* array of entities */ ],
    "pagination": {
      "total": 100,
      "page": 1,
      "limit": 10,
      "pages": 10
    }
  }
}
```

### Error Response
```json
{
  "success": false,
  "error": "Error message",
  "errors": [ /* validation errors */ ]
}
```

---

## Status Codes

| Code | Meaning |
|------|---------|
| 200 | OK - Request successful |
| 201 | Created - Resource created successfully |
| 400 | Bad Request - Validation error |
| 401 | Unauthorized - Not authenticated |
| 403 | Forbidden - Insufficient permissions |
| 404 | Not Found - Resource doesn't exist |
| 500 | Internal Error - Server error |

---

## Common Patterns

### Handling API Calls
```typescript
try {
  setLoading(true);
  const result = await api.getSomething();
  if (result.success) {
    setData(result.data);
  } else {
    setError(result.error);
  }
} catch (error) {
  setError('An error occurred');
} finally {
  setLoading(false);
}
```

### Form Submission
```typescript
const handleSubmit = async (e) => {
  e.preventDefault();
  try {
    const result = await api.create(formData);
    if (result.success) {
      router.push('/path/to/view');
    } else {
      setError(result.error);
    }
  } catch (error) {
    setError('Submit failed');
  }
};
```

### Pagination
```typescript
const [page, setPage] = useState(1);

const handleNext = () => {
  setPage(Math.min(page + 1, totalPages));
};

const handlePrev = () => {
  setPage(Math.max(page - 1, 1));
};
```

---

## Troubleshooting

### 401 Unauthorized
- Check if user is logged in
- Verify auth token is valid
- Check cookie settings

### 403 Forbidden
- Verify user has correct role
- Check authorization middleware
- Verify resource ownership

### 404 Not Found
- Check if resource exists
- Verify ID is correct
- Check database query

### Validation Errors
- Check field requirements
- Verify data format
- Check error response

---

## File Locations

### Controllers
- `server/src/controllers/adminPropertyController.ts`
- `server/src/controllers/adminUserController.ts`
- `server/src/controllers/ownerController.ts`

### Routes
- `server/src/routes/adminProperties.ts`
- `server/src/routes/adminUsers.ts`
- `server/src/routes/owner.ts`

### Services
- `server/src/services/ownerService.ts`

### API Clients
- `client/src/lib/adminPropertyApi.ts`
- `client/src/lib/adminUserApi.ts`

### Pages
- `client/src/app/dashboard/admin/properties/**`
- `client/src/app/dashboard/admin/users/**`
- `client/src/app/dashboard/flat-owner/properties/[id]/page.tsx`

---

## Performance Tips

1. **Use pagination** for large datasets
2. **Implement search filters** to reduce data
3. **Cache property stats** if needed
4. **Use debouncing** for search inputs
5. **Load data on demand** (lazy loading)

---

## Security Checklist

- ✅ All endpoints require authentication
- ✅ Admin routes require admin role
- ✅ Owner routes verify ownership
- ✅ Passwords are hashed
- ✅ Input validation on all endpoints
- ✅ SQL injection prevention (Prisma)
- ✅ CORS configured
- ✅ Error messages don't leak info

---

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0.0 | 2026-01-23 | Initial implementation |

---

**Last Updated**: January 23, 2026  
**Status**: Complete & Ready ✅ Guide - Tenant Onboarding & Offboarding

## 🚀 Getting Started

### 1. Setup Database
```bash
cd server
npm run prisma:generate
npm run prisma:migrate
```

### 2. Configure Environment Variables
```env
# .env file in server/
RAZORPAY_KEY_ID=xxx
RAZORPAY_KEY_SECRET=xxx
EMAIL_SERVICE=gmail
EMAIL_USER=xxx@gmail.com
```

### 3. Start Services
```bash
# Terminal 1 - Backend
cd server && npm run dev

# Terminal 2 - Frontend
cd client && npm run dev
```

## 📋 Onboarding Flow (6 Steps)

| Step | Action | Time | Status |
|------|--------|------|--------|
| 1 | Fill flat details & vehicle info | 2 min | INQUIRY |
| 2 | Upload lease & vehicle doc | 3 min | FORM_SUBMITTED |
| 3 | Sign lease digitally | 2 min | LEASE_SIGNED |
| 4 | Process security deposit | 5 min | DEPOSIT_PENDING |
| 5 | Auto-assign parking | 1 min | PARKING_ASSIGNED |
| 6 | Complete & receive credentials | 1 min | COMPLETED |
| **TOTAL** | **Complete Process** | **<20 min** | ✓ |

## 📤 Offboarding Flow (6 Steps)

| Step | Action | Time | Status |
|------|--------|------|--------|
| 1 | Submit move-out request (30+ days) | 2 min | REQUESTED |
| 2 | Schedule move-out inspection | 1 min | INSPECTION_SCHEDULED |
| 3 | Record inspection with photos | 5 min | INSPECTION_COMPLETED |
| 4 | Calculate final settlement | 1 min | SETTLEMENT_PENDING |
| 5 | Process refund | 2 min | REFUND_PROCESSED |
| 6 | Issue clearance certificate | 1 min | COMPLETED |
| **TOTAL** | **Complete Process** | **<7 days** | ✓ |

## 🔌 API Quick Reference

### Onboarding
```bash
# Create inquiry
POST /api/onboarding/
  { apartmentId, propertyId, moveInDate, securityDeposit, vehicleType }

# Upload lease
POST /api/onboarding/:id/lease-agreement
  { fileUrl, fileName }

# Sign lease
POST /api/onboarding/:id/sign-lease
  { signature }

# Payment
POST /api/onboarding/:id/initiate-payment
  { amount, customerEmail, customerPhone }

POST /api/onboarding/:id/verify-payment
  { orderId, paymentId, signature, amount }

# Parking
POST /api/onboarding/:id/assign-parking
  { vehicleType }

# Complete
POST /api/onboarding/:id/complete
```

### Offboarding
```bash
# Request
POST /api/offboarding/
  { apartmentId, propertyId, onboardingId, moveOutDate }

# Inspection
POST /api/offboarding/:id/schedule-inspection
  { checklistId, inspectionDate }

POST /api/offboarding/:id/move-out-inspection
  { items, photos, damageAssessment }

# Settlement
POST /api/offboarding/:id/calculate-settlement
  { damageCharges, description }

# Refund
POST /api/offboarding/:id/process-refund
  { paymentGateway, refundDetails }

# Complete
POST /api/offboarding/:id/complete
```

## 🏗️ Frontend Components

### Using Onboarding Form
```tsx
import TenantOnboardingForm from '@/components/Onboarding/TenantOnboardingForm';

<TenantOnboardingForm
  apartmentId="apt123"
  propertyId="prop456"
  onSuccess={(id) => navigate('/confirmation')}
/>
```

### Using Offboarding Form
```tsx
import TenantOffboardingForm from '@/components/Offboarding/TenantOffboardingForm';

<TenantOffboardingForm
  apartmentId="apt123"
  propertyId="prop456"
  onboardingId="onboard789"
  onSuccess={(id) => navigate('/completion')}
/>
```

## 🎯 Key Endpoints Summary

### Properties
- `GET /api/properties` - List properties
- `GET /api/properties/:id` - Get property details
- `GET /api/properties/:id/apartments` - List apartments in property

### Apartments
- `GET /api/apartments/:id` - Get apartment details
- `GET /api/apartments/:id/status` - Check availability

### Parking
- `GET /api/parking/:propertyId/available?vehicleType=FOUR_WHEELER`
- `GET /api/parking/:propertyId/statistics`

## 💾 Database Schema (Key Tables)

### TenantOnboarding
```sql
id | tenantId | apartmentId | propertyId | status | moveInDate | securityDeposit | ... | createdAt
```

### OnboardingPayment
```sql
id | onboardingId | amount | paymentGateway | paymentId | status | paidAt
```

### ParkingSlot
```sql
id | propertyId | slotNumber | vehicleType | status | assignedToId | assignedAt
```

### TenantOffboarding
```sql
id | tenantId | apartmentId | onboardingId | status | moveOutDate | ... | createdAt
```

### FinalSettlement
```sql
id | offboardingId | securityDeposit | damageCharges | refundAmount | refundDate
```

## 🔐 Security Checklist

- [x] JWT authentication on all routes
- [x] Document encryption with unique keys
- [x] Payment gateway integration (PCI compliant)
- [x] Role-based access control
- [x] Input validation & sanitization
- [x] Rate limiting on payment endpoints
- [x] Audit logging for all transactions
- [x] Secure file upload handling
- [x] CORS configured
- [x] Environment variables for secrets

## 📊 Monitoring & Metrics

### Critical Metrics
- **Onboarding Completion Rate**: % of inquiries → completed
- **Average Onboarding Time**: Should be < 20 minutes
- **Payment Success Rate**: % of payment attempts that succeed
- **Parking Assignment Success**: % of tenants with assigned slots
- **Refund Processing Time**: Should be < 5 business days

### Health Check
```bash
curl http://localhost:5000/health
# { "status": "ok", "timestamp": "..." }
```

## 🐛 Troubleshooting

### Payment Not Processing
1. Check Razorpay credentials in .env
2. Verify amount is in INR (multiply by 100 for paise)
3. Check payment gateway status

### Email Not Sending
1. Check email service credentials
2. Verify email templates are valid
3. Check spam/junk folder

### Parking Not Assigning
1. Verify available slots exist for vehicle type
2. Check database has parking slots created
3. Verify vehicleType matches (TWO_WHEELER, FOUR_WHEELER, etc.)

### Database Connection Issues
1. Check DATABASE_URL in .env
2. Verify PostgreSQL is running
3. Run `npm run prisma:generate` to regenerate client

## 📝 Testing Scenarios

### Test Onboarding
1. Create onboarding with valid apartment
2. Upload documents (mock files)
3. Sign lease with signature text
4. Process payment (mock payment ID)
5. Assign parking (ensure slots exist)
6. Complete onboarding
7. Verify: tenant assignment created, notifications sent

### Test Offboarding
1. Create offboarding request (30+ days out)
2. Schedule inspection
3. Record inspection with damage assessment
4. Calculate settlement
5. Process refund
6. Issue clearance certificate
7. Complete offboarding
8. Verify: parking slot released, flat marked vacant, owner notified

## 🚨 Important Notes

- **30-Day Notice**: Offboarding requires 30 days minimum notice
- **Security Deposit**: Must be paid before completion
- **Parking**: Auto-assigned based on vehicle type availability
- **Refunds**: Process within 5 business days
- **Notifications**: Sent via email within 1 hour, SMS within 5 minutes

## 📞 Support

For issues, check:
1. [DATABASE_MIGRATION.md](./DATABASE_MIGRATION.md) - Database setup
2. [TENANT_ONBOARDING_OFFBOARDING.md](./TENANT_ONBOARDING_OFFBOARDING.md) - Complete documentation
3. Server logs: `npm run dev`
4. Frontend console: Browser DevTools

## 🎓 Learning Path

1. Understand the data model (Prisma schema)
2. Review service layer (business logic)
3. Check controllers (API handlers)
4. Explore routes (endpoint mappings)
5. Use frontend components (UI implementation)
6. Test end-to-end workflow
7. Monitor metrics and logs

---

**Last Updated**: January 23, 2026  
**Version**: 1.0.0  
**Status**: Ready for Production
