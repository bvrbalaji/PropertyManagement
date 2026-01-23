# Quick Reference Guide - Tenant Onboarding & Offboarding

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
