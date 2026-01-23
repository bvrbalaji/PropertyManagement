# Financial Management - Migration & Deployment Guide

## Pre-Deployment Checklist

- [ ] All code reviewed and approved
- [ ] Database backup taken
- [ ] Environment variables configured
- [ ] Payment gateway credentials verified
- [ ] Email service configured
- [ ] Scheduled task framework chosen
- [ ] Monitoring/alerting setup

---

## Phase 1: Database Setup

### Step 1: Create Migration File

```bash
cd server
npx prisma migrate dev --name add_financial_management
```

This creates:
- 9 new tables
- 7 new enums
- Indexes and constraints
- Prisma client types

### Step 2: Verify Schema

```bash
npx prisma db execute --stdin < verify_schema.sql
```

Verify these tables exist:
- `RentInvoice`
- `MaintenanceInvoice`
- `Payment`
- `PaymentReceipt`
- `PaymentReminder`
- `LateFee`
- `MaintenanceFeeConfig`
- `RentConfig`

### Step 3: Generate Prisma Client

```bash
npx prisma generate
```

---

## Phase 2: Backend Deployment

### Step 1: Install Dependencies

```bash
npm install
# No new dependencies needed - uses existing packages
```

### Step 2: Environment Configuration

Create/update `.env`:

```env
# Database
DATABASE_URL=postgresql://user:password@localhost:5432/property_management

# API
PORT=5000
NODE_ENV=production

# Authentication
JWT_SECRET=your_jwt_secret
SESSION_TIMEOUT=1800000

# Payment Gateways
RAZORPAY_KEY_ID=rzp_live_xxxxx
RAZORPAY_KEY_SECRET=xxxxx
STRIPE_SECRET_KEY=sk_live_xxxxx

# Email Service
SENDGRID_API_KEY=SG.xxxxx
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password

# Frontend
FRONTEND_URL=https://app.example.com
```

### Step 3: Build Server

```bash
npm run build
```

### Step 4: Start Services

```bash
# Development
npm run dev

# Production
npm start
```

### Step 5: Verify API

```bash
curl http://localhost:5000/health
# Response: {"status":"ok","timestamp":"2024-01-15T10:00:00Z"}

curl http://localhost:5000/api/finances/rent-invoices \
  -H "Authorization: Bearer YOUR_TOKEN"
# Should return authorized response
```

---

## Phase 3: Scheduled Tasks Setup

### Option A: Using node-cron (Simple)

**File**: `server/src/scheduler.ts`

```typescript
import cron from 'node-cron';
import rentInvoiceService from './services/rentInvoiceService';
import lateFeeService from './services/lateFeeService';
import paymentReminderService from './services/paymentReminderService';
import paymentReceiptService from './services/paymentReceiptService';

export function initializeScheduler() {
  // Daily at 2 AM UTC - Check overdue invoices
  cron.schedule('0 2 * * *', async () => {
    console.log('[Scheduler] Checking overdue invoices...');
    try {
      await rentInvoiceService.checkAndUpdateOverdueStatus();
      await maintenanceInvoiceService.checkAndUpdateOverdueStatus();
      console.log('[Scheduler] Overdue check completed');
    } catch (error) {
      console.error('[Scheduler] Error checking overdue:', error);
    }
  });

  // Daily at 3 AM UTC - Process late fees
  cron.schedule('0 3 * * *', async () => {
    console.log('[Scheduler] Processing late fees...');
    try {
      await lateFeeService.processPendingLateFees();
      console.log('[Scheduler] Late fees processing completed');
    } catch (error) {
      console.error('[Scheduler] Error processing late fees:', error);
    }
  });

  // Every hour - Send reminders
  cron.schedule('0 * * * *', async () => {
    console.log('[Scheduler] Sending pending reminders...');
    try {
      await paymentReminderService.sendPendingReminders();
      console.log('[Scheduler] Reminders sent');
    } catch (error) {
      console.error('[Scheduler] Error sending reminders:', error);
    }
  });

  // Every 5 minutes - Send receipts
  cron.schedule('*/5 * * * *', async () => {
    console.log('[Scheduler] Sending pending receipts...');
    try {
      await paymentReceiptService.sendPendingReceipts();
      console.log('[Scheduler] Receipts sent');
    } catch (error) {
      console.error('[Scheduler] Error sending receipts:', error);
    }
  });

  // Monthly on 1st at 1 AM UTC - Generate invoices
  cron.schedule('0 1 1 * *', async () => {
    console.log('[Scheduler] Generating monthly invoices...');
    try {
      // Get all properties and generate invoices
      const properties = await prisma.property.findMany();
      const month = new Date();
      
      for (const property of properties) {
        await rentInvoiceService.generateMonthlyInvoices(property.id, month);
        await maintenanceInvoiceService.generateMonthlyInvoices(property.id, month);
      }
      
      console.log('[Scheduler] Monthly invoices generated');
    } catch (error) {
      console.error('[Scheduler] Error generating invoices:', error);
    }
  });

  console.log('[Scheduler] All tasks scheduled');
}
```

**In index.ts**, call at startup:

```typescript
import { initializeScheduler } from './scheduler';

// After routes setup
initializeScheduler();
```

### Option B: Using Bull Queue (Recommended for Production)

**Installation**:

```bash
npm install bull redis ioredis
```

**File**: `server/src/queues/financialTasks.ts`

```typescript
import Queue from 'bull';
import rentInvoiceService from '../services/rentInvoiceService';
import lateFeeService from '../services/lateFeeService';

const redisConfig = {
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT || '6379'),
};

export const overdueQueue = new Queue('overdue-check', redisConfig);
export const lateFeeQueue = new Queue('late-fee-process', redisConfig);
export const reminderQueue = new Queue('payment-reminders', redisConfig);
export const receiptQueue = new Queue('payment-receipts', redisConfig);

// Process overdue check
overdueQueue.process(async () => {
  await rentInvoiceService.checkAndUpdateOverdueStatus();
  await maintenanceInvoiceService.checkAndUpdateOverdueStatus();
});

// Process late fees
lateFeeQueue.process(async () => {
  await lateFeeService.processPendingLateFees();
});

// Schedule recurring jobs
export function scheduleFinancialTasks() {
  // Run every day at 2 AM
  overdueQueue.add({}, { repeat: { cron: '0 2 * * *' } });
  
  // Run every day at 3 AM
  lateFeeQueue.add({}, { repeat: { cron: '0 3 * * *' } });
  
  // Run every hour
  reminderQueue.add({}, { repeat: { cron: '0 * * * *' } });
  
  // Run every 5 minutes
  receiptQueue.add({}, { repeat: { cron: '*/5 * * * *' } });
}
```

---

## Phase 4: Frontend Deployment

### Step 1: Update Next.js Config

**File**: `client/next.config.js`

Ensure API routes point to backend:

```javascript
const nextConfig = {
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api',
  },
};

module.exports = nextConfig;
```

### Step 2: Build Frontend

```bash
cd client
npm run build
```

### Step 3: Deploy

```bash
npm start
# or use Vercel, Netlify, etc.
```

---

## Phase 5: Verification

### Health Checks

```bash
# Server health
curl http://localhost:5000/health

# Database connection
curl http://localhost:5000/api/finances/rent-invoices \
  -H "Authorization: Bearer TEST_TOKEN"

# Payment gateway
# Verify Razorpay/Stripe credentials in logs
```

### Create Test Invoice

```bash
curl -X POST http://localhost:5000/api/finances/rent-invoices \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "tenantId": "test-tenant-1",
    "propertyId": "test-property-1",
    "apartmentId": "test-apt-1",
    "rentAmount": 50000,
    "invoiceDate": "2024-01-15T00:00:00Z",
    "dueDate": "2024-01-20T00:00:00Z",
    "description": "January 2024 Rent"
  }'
```

### Verify Invoice Created

```bash
curl http://localhost:5000/api/finances/rent-invoices?propertyId=test-property-1 \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

## Phase 6: Monitoring & Logging

### Set up Logging

```typescript
// Add to services
logger.info('Invoice created', { invoiceId, tenantId });
logger.error('Payment failed', { paymentId, error });
logger.warn('Overdue invoice detected', { invoiceId });
```

### Monitor Key Metrics

- Payment success rate
- Invoice generation time
- Reminder delivery success
- Late fee calculations
- Receipt delivery time
- API response times

### Set up Alerts

Alert when:
- Payment success rate < 90%
- Generation takes > 2 minutes
- Reminder failure rate > 5%
- API error rate > 1%

---

## Rollback Plan

If issues occur:

### Database Rollback

```bash
npx prisma migrate resolve --rolled-back add_financial_management
# Or restore from backup
```

### Code Rollback

```bash
git revert COMMIT_HASH
npm install
npm run build
npm start
```

### Data Recovery

1. Stop application
2. Restore database from backup
3. Verify data integrity
4. Restart application

---

## Post-Deployment Tasks

1. **Monitor Logs**
   - Watch for errors in first 24 hours
   - Verify all scheduled tasks running

2. **User Communication**
   - Notify tenants about new payment options
   - Send invoice to existing tenants

3. **Testing**
   - Test full payment workflow
   - Verify reminder sending
   - Check late fee calculations

4. **Documentation**
   - Update user guides
   - Train support team
   - Document API for partners

---

## Production Checklist

- [ ] Database migrated
- [ ] Environment variables set
- [ ] Payment gateway configured
- [ ] Email service tested
- [ ] Scheduled tasks running
- [ ] API endpoints tested
- [ ] Frontend deployed
- [ ] SSL certificates valid
- [ ] Monitoring active
- [ ] Backups configured
- [ ] Disaster recovery plan tested
- [ ] Team trained

---

## Support & Troubleshooting

### Common Issues

**Issue**: Migrations fail
```bash
# Solution: Reset and re-run
npx prisma migrate reset
npx prisma migrate dev
```

**Issue**: Scheduled tasks not running
```bash
# Check logs
tail -f logs/scheduler.log

# Verify Redis/Bull connection if using queue
redis-cli ping
```

**Issue**: Payment gateway errors
```bash
# Verify credentials
echo $RAZORPAY_KEY_ID
echo $RAZORPAY_KEY_SECRET

# Test API
curl https://api.razorpay.com/v1/ -u "$RAZORPAY_KEY_ID:$RAZORPAY_KEY_SECRET"
```

---

## Performance Optimization Tips

1. **Database**: Enable query logging, optimize indexes
2. **Caching**: Cache configuration objects
3. **Bulk Operations**: Batch invoice generation
4. **API**: Implement rate limiting
5. **Reminders**: Use message queue for async operations

---

**Deployment Complete! 🎉**
