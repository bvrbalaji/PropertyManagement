# Flat Owner Details - API Integration Guide

## Quick Start

### 1. Install Dependencies
```bash
# Backend
npm install prisma @prisma/client

# Frontend
npm install react-hot-toast axios
```

### 2. Update Prisma Schema
Apply the schema from `FLAT_OWNER_DETAILS_DOCUMENTATION.md` to your `prisma/schema.prisma` file.

### 3. Run Migrations
```bash
# Generate migration
npx prisma migrate dev --name add_owner_features

# Apply migration
npx prisma db push
```

### 4. Start Services
```bash
# Backend
npm run dev

# Frontend
cd client && npm run dev
```

## Implementation Checklist

### Backend Setup

#### Step 1: Database Setup
```bash
# Create the migration
npx prisma migrate dev --name flat_owner_features

# Verify schema
npx prisma studio
```

#### Step 2: Create Service Layer
- [ ] Create `src/services/ownerService.ts`
- [ ] Create `src/services/financialService.ts`
- [ ] Create `src/services/propertyTransferService.ts`
- [ ] Create `src/services/coOwnershipService.ts`
- [ ] Create `src/services/documentService.ts`
- [ ] Create `src/services/communicationService.ts`

#### Step 3: Create Controllers
- [ ] Create `src/controllers/ownerController.ts`
- [ ] Create `src/controllers/financialController.ts`
- [ ] Create `src/controllers/transferController.ts`
- [ ] Create `src/controllers/documentController.ts`

#### Step 4: Create Routes
- [ ] Create `src/routes/owners.ts`
- [ ] Create `src/routes/financial.ts`
- [ ] Create `src/routes/transfers.ts`
- [ ] Create `src/routes/documents.ts`
- [ ] Register routes in `src/index.ts`

#### Step 5: Configure Services
- [ ] Setup email service for notifications
- [ ] Configure file storage (AWS S3, local, etc.)
- [ ] Setup SMS service (optional)
- [ ] Configure logging and monitoring

### Frontend Setup

#### Step 1: Create API Client
- [ ] Create `lib/ownerApi.ts` with all endpoints
- [ ] Setup error handling and interceptors
- [ ] Configure base URL from environment

#### Step 2: Create Components
- [ ] `components/Owner/OwnerDashboard.tsx` ✓
- [ ] `components/Owner/PropertyTransfer.tsx` ✓
- [ ] `components/Owner/CoOwnerManagement.tsx` ✓
- [ ] `components/Owner/OwnershipDocuments.tsx` ✓
- [ ] `components/Owner/CommunicationPreferences.tsx` ✓

#### Step 3: Create Pages
- [ ] Update `app/dashboard/flat-owner/page.tsx` ✓
- [ ] Create navigation/routing
- [ ] Add breadcrumbs

#### Step 4: Setup State Management
- [ ] Configure React Context or Redux
- [ ] Setup global error handling
- [ ] Configure notifications

#### Step 5: Testing
- [ ] Unit tests for components
- [ ] Integration tests for API calls
- [ ] E2E tests for workflows

## Environment Variables

### Backend (.env)
```env
DATABASE_URL="postgresql://user:password@localhost:5432/propertydb"
JWT_SECRET="your-secret-key"
JWT_EXPIRY="7d"

# File Storage
STORAGE_TYPE="local" # or "s3"
STORAGE_PATH="./uploads"
AWS_REGION="us-east-1"
AWS_ACCESS_KEY_ID="your-key"
AWS_SECRET_ACCESS_KEY="your-secret"
AWS_S3_BUCKET="your-bucket"

# Email Service
MAIL_HOST="smtp.gmail.com"
MAIL_PORT="587"
MAIL_USER="your-email@gmail.com"
MAIL_PASSWORD="your-password"
MAIL_FROM="noreply@propertymanagement.com"

# SMS Service (Optional)
SMS_PROVIDER="twilio" # or "aws-sns"
SMS_ACCOUNT_SID="your-sid"
SMS_AUTH_TOKEN="your-token"

# Monitoring
LOG_LEVEL="info"
SENTRY_DSN="your-sentry-dsn"
```

### Frontend (.env.local)
```env
NEXT_PUBLIC_API_URL="http://localhost:3001/api"
NEXT_PUBLIC_APP_NAME="Property Management"
```

## API Examples

### Get Owner Profile
```typescript
import ownerApi from '@/lib/ownerApi';

// Fetch profile
const response = await ownerApi.getProfile();
const profile = response.data.data;

// Output:
// {
//   id: "profile-123",
//   userId: "user-456",
//   user: {
//     fullName: "John Doe",
//     email: "john@example.com"
//   },
//   profileCompleteness: 85,
//   verificationStatus: "pending",
//   properties: [...]
// }
```

### Initiate Property Transfer
```typescript
const transferData = {
  propertyId: "prop-123",
  newOwnerName: "Jane Smith",
  newOwnerEmail: "jane@example.com",
  newOwnerPhone: "+91-9876543210",
  reason: "Gift to daughter",
  documents: [file1, file2]
};

const response = await ownerApi.initiatePropertyTransfer(transferData);
const transfer = response.data.data;

// Output:
// {
//   id: "transfer-789",
//   status: "pending",
//   propertyId: "prop-123",
//   expiresAt: "2025-12-22T..."
// }
```

### Add Co-Owner
```typescript
const coOwnerData = {
  name: "Robert Johnson",
  email: "robert@example.com",
  phone: "+91-9876543211",
  sharePercentage: 50
};

const response = await ownerApi.addCoOwner(coOwnerData);
const coOwner = response.data.data;

// Output:
// {
//   id: "coowner-123",
//   name: "Robert Johnson",
//   email: "robert@example.com",
//   sharePercentage: 50,
//   status: "invited"
// }
```

### Upload Ownership Document
```typescript
const formData = new FormData();
formData.append('propertyId', 'prop-123');
formData.append('documentType', 'title_deed');
formData.append('file', document);

const response = await ownerApi.uploadOwnershipDocument(formData);
const document = response.data.data;

// Output:
// {
//   id: "doc-456",
//   documentName: "title_deed.pdf",
//   verificationStatus: "pending",
//   uploadedAt: "2025-12-17T..."
// }
```

### Update Communication Preferences
```typescript
const preferences = {
  emailNotifications: true,
  smsNotifications: false,
  phoneNotifications: false,
  maintenanceAlerts: true,
  financialUpdates: true,
  notificationTiming: "daily",
  preferredLanguage: "en"
};

const response = await ownerApi.updateCommunicationPreferences(preferences);
const updated = response.data.data;

// Output:
// {
//   id: "prefs-789",
//   emailNotifications: true,
//   updatedAt: "2025-12-17T..."
// }
```

## Database Queries

### Get Owner with All Data
```prisma
# Efficiently load owner with related data
query {
  owner(id: "profile-123") {
    id
    profileCompleteness
    verificationStatus
    properties {
      property {
        name
        address
        apartments { id }
      }
      sharePercentage
    }
    documents {
      id
      documentType
      verificationStatus
    }
    coOwnerships {
      id
      name
      sharePercentage
      status
    }
  }
}
```

### Get Financial Summary
```sql
SELECT
  COUNT(DISTINCT op.property_id) as total_properties,
  SUM(rent.amount) as total_income,
  SUM(expense.amount) as total_expenses,
  (SUM(rent.amount) - SUM(expense.amount)) as net_income,
  COUNT(DISTINCT t.id) as total_tenants
FROM owner_profile op
LEFT JOIN owner_property oprop ON op.id = oprop.owner_profile_id
LEFT JOIN rent rent ON oprop.property_id = rent.property_id
LEFT JOIN expense expense ON oprop.property_id = expense.property_id
LEFT JOIN tenant t ON oprop.property_id = t.property_id
WHERE op.user_id = ?
GROUP BY op.id;
```

### Get Active Co-Owners
```sql
SELECT
  c.id,
  c.name,
  c.email,
  c.share_percentage,
  c.status,
  c.accepted_at
FROM co_ownership c
WHERE c.owner_profile_id = ?
  AND c.status = 'active'
ORDER BY c.name;
```

## Error Handling

### Common Error Codes
```
200: Success
400: Bad Request - Invalid input
401: Unauthorized - Not authenticated
403: Forbidden - No permission
404: Not Found - Resource doesn't exist
409: Conflict - Transfer in progress
429: Too Many Requests - Rate limited
500: Server Error
503: Service Unavailable
```

### Error Response Format
```json
{
  "success": false,
  "message": "Error message",
  "code": "ERROR_CODE",
  "details": {
    "field": "fieldName",
    "error": "specific error"
  }
}
```

## Testing

### Unit Tests (Jest)
```typescript
describe('OwnerService', () => {
  test('should get owner profile', async () => {
    const profile = await ownerService.getProfile('user-123');
    expect(profile).toBeDefined();
    expect(profile.userId).toBe('user-123');
  });

  test('should calculate profile completeness', () => {
    const completeness = ownerService.calculateCompleteness({
      fullName: 'John',
      email: 'john@example.com',
      phone: '+91-9876543210'
    });
    expect(completeness).toBeGreaterThan(0);
  });
});
```

### Integration Tests
```typescript
describe('Owner API', () => {
  test('POST /api/owners/documents - upload document', async () => {
    const response = await request(app)
      .post('/api/owners/documents/upload')
      .set('Authorization', `Bearer ${token}`)
      .attach('file', 'test-document.pdf')
      .expect(200);

    expect(response.body.success).toBe(true);
    expect(response.body.data.id).toBeDefined();
  });
});
```

### Component Tests
```typescript
describe('OwnerDashboard', () => {
  test('should render dashboard with properties', async () => {
    render(<OwnerDashboard />);
    await waitFor(() => {
      expect(screen.getByText('My Properties')).toBeInTheDocument();
    });
  });

  test('should load financial summary', async () => {
    render(<OwnerDashboard />);
    await waitFor(() => {
      expect(screen.getByText(/Total Income/)).toBeInTheDocument();
    });
  });
});
```

## Monitoring & Logging

### Key Metrics to Track
- Profile load time
- Document upload success rate
- Transfer completion rate
- Co-owner acceptance rate
- Document verification time
- Notification delivery rate

### Log Events
```
owner.profile.viewed
owner.profile.updated
transfer.initiated
transfer.completed
document.uploaded
document.verified
coowner.invited
coowner.accepted
preference.updated
```

## Performance Tuning

### Database Optimization
```sql
-- Create indices
CREATE INDEX idx_owner_property ON owner_property(owner_profile_id, property_id);
CREATE INDEX idx_co_ownership_status ON co_ownership(owner_profile_id, status);
CREATE INDEX idx_document_owner ON ownership_document(owner_profile_id);
CREATE INDEX idx_transfer_status ON property_transfer(status);
```

### Caching Strategy
```typescript
// Cache financial summaries for 1 hour
const cached = await cache.get(`financial:${ownerId}`);
if (cached) return cached;

const data = await calculateFinancialSummary(ownerId);
await cache.set(`financial:${ownerId}`, data, 3600);
return data;
```

## Security Checklist

- [ ] Validate all inputs server-side
- [ ] Use HTTPS for all communications
- [ ] Implement rate limiting
- [ ] Encrypt sensitive data
- [ ] Validate file uploads
- [ ] Implement CORS properly
- [ ] Use secure session management
- [ ] Implement audit logging
- [ ] Validate ownership before operations
- [ ] Sanitize file names and paths

## Deployment Guide

### Docker Deployment
```dockerfile
FROM node:18-alpine

WORKDIR /app

# Backend
COPY server/package*.json ./
RUN npm install
COPY server/src ./src
COPY server/tsconfig.json ./

# Frontend
COPY client/package*.json ./client/
RUN cd client && npm install
COPY client ./client

EXPOSE 3000 3001

CMD ["npm", "start"]
```

### Environment Setup
```bash
# Create .env files
cp .env.example .env
cp client/.env.example client/.env.local

# Update with actual values
nano .env
nano client/.env.local

# Run migrations
npx prisma migrate deploy

# Start services
npm run start
```

## Support Resources

- Documentation: `/FLAT_OWNER_DETAILS_DOCUMENTATION.md`
- API Reference: Use Swagger/OpenAPI docs
- Issue Tracker: GitHub Issues
- Support Email: support@propertymanagement.com

## Next Steps

1. Review the main documentation
2. Follow the implementation checklist
3. Run the test suite
4. Deploy to staging
5. Run smoke tests
6. Deploy to production
7. Monitor and optimize

For questions or issues, please refer to the troubleshooting section in the main documentation.
