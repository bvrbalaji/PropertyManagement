# Financial Management - Quick Start Guide

## 🚀 Getting Started

### Step 1: Database Migration

Apply the new financial management schema to your database:

```bash
cd server
npx prisma migrate dev --name add_financial_management
```

This will:
- Create all 9 new tables (RentInvoice, MaintenanceInvoice, Payment, etc.)
- Create 7 new enums for status tracking
- Add indexes for optimal performance
- Generate Prisma client types

### Step 2: Install Dependencies (if needed)

```bash
npm install
```

The implementation uses only existing dependencies (Express, Prisma, TypeScript).

### Step 3: Configure Payment Gateways

Update your `.env` file:

```env
# Razorpay Configuration
RAZORPAY_KEY_ID=your_razorpay_key_id
RAZORPAY_KEY_SECRET=your_razorpay_key_secret

# Stripe Configuration (optional)
STRIPE_SECRET_KEY=your_stripe_secret_key
```

### Step 4: Start the Server

```bash
npm run dev
```

The API will be available at `http://localhost:5000/api/finances`

---

## 📚 API Usage Examples

### Create a Rent Invoice

```bash
curl -X POST http://localhost:5000/api/finances/rent-invoices \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "tenantId": "tenant-123",
    "propertyId": "prop-456",
    "apartmentId": "apt-789",
    "rentAmount": 50000,
    "invoiceDate": "2024-01-01",
    "dueDate": "2024-01-05"
  }'
```

### Process a Payment

```bash
curl -X POST http://localhost:5000/api/finances/payments \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "tenantId": "tenant-123",
    "propertyId": "prop-456",
    "apartmentId": "apt-789",
    "rentInvoiceId": "invoice-001",
    "amount": 50000,
    "paymentMethod": "UPI",
    "paymentGateway": "RAZORPAY"
  }'
```

### Create Rent Configuration

```bash
curl -X POST http://localhost:5000/api/finances/configurations/rent \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "propertyId": "prop-456",
    "rentAmount": 50000,
    "dueDate": 5,
    "gracePeriodDays": 5,
    "lateFeeCalculationMethod": "PERCENT_PER_DAY",
    "lateFeePercent": 0.5,
    "lateFeeMaxCap": 5000
  }'
```

---

## 🔌 Frontend Integration

### Import API Client

```typescript
import {
  rentInvoiceAPI,
  maintenanceInvoiceAPI,
  paymentAPI,
  lateFeeAPI,
  configurationAPI
} from '@/lib/financesApi';
```

### Fetch Invoices

```typescript
const invoices = await rentInvoiceAPI.list({
  propertyId: 'prop-456',
  status: 'SENT',
  skip: 0,
  take: 20
});
```

### Create Payment

```typescript
const payment = await paymentAPI.initiate({
  tenantId: 'tenant-123',
  propertyId: 'prop-456',
  apartmentId: 'apt-789',
  rentInvoiceId: 'invoice-001',
  amount: 50000,
  paymentMethod: 'UPI',
  paymentGateway: 'RAZORPAY'
});
```

### Get Payment History

```typescript
const history = await paymentAPI.getTenantHistory('tenant-123');
```

---

## ⚙️ Scheduled Tasks Setup

The system requires scheduled tasks for full functionality:

### Option 1: Using node-cron

```typescript
import cron from 'node-cron';
import rentInvoiceService from './services/rentInvoiceService';
import lateFeeService from './services/lateFeeService';
import paymentReminderService from './services/paymentReminderService';

// Check overdue invoices daily at 2 AM
cron.schedule('0 2 * * *', async () => {
  await rentInvoiceService.checkAndUpdateOverdueStatus();
});

// Process late fees daily at 3 AM
cron.schedule('0 3 * * *', async () => {
  await lateFeeService.processPendingLateFees();
});

// Send pending reminders every hour
cron.schedule('0 * * * *', async () => {
  await paymentReminderService.sendPendingReminders();
});

// Send pending receipts every 5 minutes
cron.schedule('*/5 * * * *', async () => {
  await paymentReceiptService.sendPendingReceipts();
});

// Generate monthly invoices on 1st of each month at 1 AM
cron.schedule('0 1 1 * *', async () => {
  // Call generateMonthlyInvoices for each property
});
```

### Option 2: Using a Task Queue (Bull, RabbitMQ, etc.)

Queue jobs for:
- Daily: Check overdue status
- Daily: Process late fees
- Hourly: Send reminders
- Every 5 minutes: Send receipts
- Monthly: Generate invoices

---

## 📊 Key API Endpoints

| Feature | Endpoint | Method |
|---------|----------|--------|
| Create Invoice | `/api/finances/rent-invoices` | POST |
| List Invoices | `/api/finances/rent-invoices` | GET |
| Send Invoice | `/api/finances/rent-invoices/:id/send` | POST |
| Initiate Payment | `/api/finances/payments` | POST |
| Confirm Payment | `/api/finances/payments/:id/confirm` | POST |
| Calculate Late Fee | `/api/finances/late-fees/calculate` | POST |
| Apply Late Fee | `/api/finances/late-fees/apply` | POST |
| Get Statistics | `/api/finances/payments/statistics` | GET |
| Create Config | `/api/finances/configurations/rent` | POST |

See [API_DOCUMENTATION.md](./API_DOCUMENTATION.md) for complete reference.

---

## 🧪 Testing

### Test Invoice Creation

```typescript
describe('Rent Invoice API', () => {
  it('should create a new invoice', async () => {
    const result = await rentInvoiceService.createInvoice({
      tenantId: 'test-tenant',
      propertyId: 'test-property',
      apartmentId: 'test-apt',
      rentAmount: 50000,
      invoiceDate: new Date(),
      dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000)
    });

    expect(result.success).toBe(true);
    expect(result.data.invoiceNumber).toMatch(/^RENT-/);
  });
});
```

---

## 🐛 Troubleshooting

### Issue: Prisma schema out of sync

**Solution**: Run migration again
```bash
npx prisma migrate dev
```

### Issue: Payment gateway errors

**Solution**: Verify environment variables and credentials
```bash
echo $RAZORPAY_KEY_ID
echo $RAZORPAY_KEY_SECRET
```

### Issue: Overdue invoices not updated

**Solution**: Ensure scheduled task is running or manually call:
```bash
curl -X POST http://localhost:5000/api/finances/rent-invoices/check-overdue \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

## 📖 Additional Resources

- [API Documentation](./API_DOCUMENTATION.md) - Complete API reference
- [Prisma Docs](https://www.prisma.io/docs) - Database ORM documentation
- [Razorpay Docs](https://razorpay.com/docs) - Payment gateway setup
- [Stripe Docs](https://stripe.com/docs) - Alternative payment gateway

---

## 🎯 What's Next?

1. **Frontend Components** - Build React/Next.js UI for dashboards
2. **Testing** - Write unit and integration tests
3. **Deployment** - Deploy to production environment
4. **Monitoring** - Set up logging and monitoring
5. **Optimization** - Performance tuning and caching

---

## ✅ Verification Checklist

- [ ] Database migrated successfully
- [ ] Services are initializing without errors
- [ ] API endpoints responding correctly
- [ ] Payment gateway credentials configured
- [ ] Scheduled tasks running
- [ ] Frontend components deployed
- [ ] E2E tests passing
- [ ] Production monitoring active

---

## 💡 Key Features to Remember

✅ **Automated Invoicing** - Invoices generated monthly automatically  
✅ **Multiple Payments** - UPI, Net Banking, Cards, Wallet, Cash, Cheque  
✅ **Payment Gateways** - Razorpay and Stripe integration ready  
✅ **Partial Payments** - Support for split/partial payments  
✅ **Late Fees** - Automatic calculation with configurable rules  
✅ **Reminders** - Automated email reminders at key milestones  
✅ **Receipts** - Auto-generated receipts within 5 minutes  
✅ **Reporting** - Comprehensive statistics and analytics  

---

**Ready to launch! 🚀**
