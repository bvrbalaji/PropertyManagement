# Financial Reports & Analytics - Complete Integration Map

## System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                          CLIENT (Next.js)                       │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  Reports Hub                          ┌──────────────────────┐ │
│  │                                    │ API Client           │ │
│  ├─ Collection Summary ─────────────>│ (reportsApi.ts)      │ │
│  ├─ Outstanding Dues ─────────────────>│ - TypeScript Types   │ │
│  ├─ YoY Comparison ──────────────────>│ - Axios Integration  │ │
│  ├─ Cash Flow Statement ────────────>│ - Error Handling     │ │
│  └─ Health Dashboard ────────────────>│ - Auth Tokens        │ │
│                                        └──────────────────────┘ │
│                                               ↓                  │
│                                        HTTP GET/POST            │
│                                                                   │
└──────────────────────────────────────────────────────────────────┘
                                      ↓
┌──────────────────────────────────────────────────────────────────┐
│                    SERVER (Express.js)                           │
├──────────────────────────────────────────────────────────────────┤
│                                                                   │
│  /api/reports Routes                                             │
│  ├─ GET /collection-summary ─→ reportsController.getMonthly...  │
│  ├─ GET /outstanding-dues ──→ reportsController.getOutstanding..│
│  ├─ GET /yoy-comparison ────→ reportsController.getYearOver...  │
│  ├─ GET /cash-flow ─────────→ reportsController.getCashFlow...  │
│  ├─ GET /health ────────────→ reportsController.getFinancial...│
│  └─ POST /export ──────────→ reportsController.exportReport...  │
│                                                                   │
│  middleware/auth.ts                                              │
│  └─ Authentication checks on all routes                          │
│                                                                   │
│  reportsController.ts (6 handlers)                               │
│  ├─ Parameter extraction & validation                            │
│  ├─ Service method calls                                        │
│  ├─ Error handling & response formatting                        │
│  └─ HTTP status code management                                 │
│                                                                   │
│  reportService.ts (5 core methods)                               │
│  ├─ getMonthlyCollectionSummary()                                │
│  │  └─ Aggregates rent, maintenance, utilities                  │
│  │                                                               │
│  ├─ getOutstandingDuesReport()                                   │
│  │  ├─ Calculates days overdue                                   │
│  │  ├─ Creates aging buckets                                    │
│  │  └─ Property-wise breakdown                                  │
│  │                                                               │
│  ├─ getYearOverYearComparison()                                  │
│  │  ├─ Compares current vs previous year                        │
│  │  ├─ Calculates growth percentages                            │
│  │  └─ Monthly comparison data                                  │
│  │                                                               │
│  ├─ getCashFlowStatement()                                       │
│  │  ├─ Calculates inflows & outflows                            │
│  │  ├─ Net cash flow per period                                │
│  │  └─ Opening/closing balances                                │
│  │                                                               │
│  └─ getFinancialHealth()                                         │
│     ├─ Health score calculation                                  │
│     └─ Status determination                                      │
│                                                                   │
│  [Prisma ORM]                                                     │
│  └─ Database abstraction & type-safety                           │
│                                                                   │
└──────────────────────────────────────────────────────────────────┘
                                      ↓
┌──────────────────────────────────────────────────────────────────┐
│                     DATABASE (PostgreSQL)                         │
├──────────────────────────────────────────────────────────────────┤
│                                                                   │
│  ┌─────────────────────────┐                                     │
│  │  RentInvoice            │  → Rent collection data             │
│  ├─────────────────────────┤                                     │
│  │ - id                    │                                     │
│  │ - propertyId            │  ← Used by reportService for        │
│  │ - tenantId              │    aggregation & calculations       │
│  │ - amount                │                                     │
│  │ - dueDate               │                                     │
│  │ - status (DRAFT/SENT/..│                                     │
│  │ - createdAt             │                                     │
│  └─────────────────────────┘                                     │
│                                                                   │
│  ┌─────────────────────────┐                                     │
│  │  MaintenanceInvoice     │  → Maintenance charges              │
│  ├─────────────────────────┤                                     │
│  │ - id                    │                                     │
│  │ - propertyId            │                                     │
│  │ - amount                │  ← Aggregated for collection        │
│  │ - dueDate               │    summary reports                  │
│  │ - status                │                                     │
│  │ - createdAt             │                                     │
│  └─────────────────────────┘                                     │
│                                                                   │
│  ┌─────────────────────────┐                                     │
│  │  Payment                │  → Payment transactions             │
│  ├─────────────────────────┤                                     │
│  │ - id                    │                                     │
│  │ - invoiceId             │  ← Tracked for collection           │
│  │ - amount                │    vs outstanding analysis          │
│  │ - status (PENDING/...)  │                                     │
│  │ - transactionId         │                                     │
│  │ - createdAt             │                                     │
│  └─────────────────────────┘                                     │
│                                                                   │
│  ┌─────────────────────────┐                                     │
│  │  Property               │  → Property details                 │
│  ├─────────────────────────┤                                     │
│  │ - id                    │                                     │
│  │ - name                  │  ← Used for property-wise           │
│  │ - address               │    breakdowns in reports            │
│  │ - propertyType          │                                     │
│  │ - createdAt             │                                     │
│  └─────────────────────────┘                                     │
│                                                                   │
│  ┌─────────────────────────┐                                     │
│  │  Tenant                 │  → Tenant information               │
│  ├─────────────────────────┤                                     │
│  │ - id                    │                                     │
│  │ - fullName              │  ← Used for Outstanding Dues        │
│  │ - email                 │    report tenant names              │
│  │ - propertyId            │                                     │
│  │ - createdAt             │                                     │
│  └─────────────────────────┘                                     │
│                                                                   │
└──────────────────────────────────────────────────────────────────┘
```

## Data Flow Examples

### 1. Monthly Collection Summary Flow
```
User clicks "Monthly Collection Summary" on Reports page
    ↓
React component mounts, calls useEffect
    ↓
reportsApi.getCollectionSummary(startDate, endDate)
    ↓
HTTP GET /api/reports/collection-summary?startDate=...&endDate=...
    ↓
reportsController.getMonthlyCollectionSummary(req, res)
    ↓
reportService.getMonthlyCollectionSummary(start, end)
    ↓
Prisma queries:
  - rentInvoice.findMany({ createdAt: {gte: start, lte: end} })
  - maintenanceInvoice.findMany({ createdAt: {gte: start, lte: end} })
  - payment.findMany({ createdAt: {gte: start, lte: end}, status: 'SUCCESS' })
    ↓
Calculate:
  - Total rent + maintenance
  - Total collected from payments
  - Pending = total - collected
  - Property-wise breakdown
  - Monthly trends
    ↓
Return aggregated data
    ↓
Response with JSON data
    ↓
Frontend receives response, updates state
    ↓
Component re-renders with tables/charts showing:
  - Current month summary (rent, maintenance, utilities)
  - Previous month comparison
  - Year-to-date totals
  - Property-wise breakdown
  - Monthly trend data
```

### 2. Outstanding Dues Report Flow
```
User navigates to /reports/outstanding-dues
    ↓
Component loads, calls reportsApi.getOutstandingDues(sortBy)
    ↓
HTTP GET /api/reports/outstanding-dues?sortBy=days
    ↓
reportsController.getOutstandingDuesReport(req, res)
    ↓
reportService.getOutstandingDuesReport('days', property)
    ↓
Prisma queries:
  - rentInvoice.findMany({ status: { not: 'PAID' } })
  - maintenanceInvoice.findMany({ status: { not: 'PAID' } })
    ↓
For each invoice, calculate:
  - Days overdue = Math.floor((now - dueDate) / 86400000)
  - Combine with amount and tenant info
    ↓
Create aging buckets:
  - Current (≤0 days)
  - Overdue 1-7 days
  - Overdue 8-30 days
  - Overdue 30+ days
    ↓
Sort by days overdue (or amount if requested)
    ↓
Group by property for breakdown
    ↓
Return detailed report
    ↓
Frontend displays:
  - Total outstanding vs total overdue
  - Aging analysis pie/bar chart
  - Detailed table of invoices sorted by days
  - Property-wise breakdown
  - Action buttons (send reminder, process payment)
```

### 3. Financial Health Status Flow
```
ReportsHub component mounts
    ↓
useEffect calls reportsApi.getFinancialHealth()
    ↓
HTTP GET /api/reports/health
    ↓
reportsController.getFinancialHealth(req, res)
    ↓
Fetches:
  - Outstanding dues report (total outstanding, total overdue)
  - Cash flow for 12 months (net cash flow)
    ↓
Calculates health score:
  - Start with 100
  - If overdue > 50%: -30 points
  - Else if overdue > 30%: -20 points
  - Else if overdue > 10%: -10 points
  - If net cash flow < 0: -15 points
    ↓
Determines status:
  - 80+ = EXCELLENT
  - 60-79 = GOOD
  - 40-59 = WARNING
  - <40 = CRITICAL
    ↓
Returns health score and status
    ↓
Frontend displays:
  - Large health score display
  - Status badge with color
  - Key metrics breakdown
  - Recommendations based on status
```

## Component Interaction Diagram

```
┌──────────────────────────────────┐
│      ReportsHub.tsx              │
│  (Main Reports Dashboard)        │
├──────────────────────────────────┤
│ - Loads financial health status  │
│ - Shows 5 report options         │
│ - Quick stats display            │
│ - Navigation to detail pages     │
└──────────────┬───────────────────┘
               │
      ┌────────┼────────┬──────────┬──────────┐
      ↓        ↓        ↓          ↓          ↓
┌──────────────────────────────────────────────────────┐
│ MonthlyCollectionReport | OutstandingDuesReport     │
│ ─────────────────────── | ──────────────────────── │
│ • Date range filters    │ • Sort by days/amount   │
│ • Monthly breakdown     │ • Aging analysis        │
│ • Property-wise split   │ • Property breakdown    │
│ • Export buttons        │ • Send reminder action  │
├──────────────────────────────────────────────────────┤
│ YearOverYearReport  │ CashFlowStatement          │
│ ─────────────────── | ────────────────────        │
│ • Year selector     │ • Period selection (3/6/12)│
│ • Growth %          │ • Inflows vs Outflows      │
│ • Monthly compare   │ • Net cash flow tracking   │
│ • Top/bottom months │ • Financial health        │
└──────────────────────────────────────────────────────┘
               ↑        ↑        ↑          ↑          ↑
               └────────┼────────┴──────────┴──────────┘
                        │
              ┌─────────▼──────────┐
              │ reportsApi client  │
              ├───────────────────┤
              │ - getCollection   │
              │ - getOutstanding  │
              │ - getYearOverYear │
              │ - getCashFlow     │
              │ - getHealth       │
              └─────────▲──────────┘
                        │
            ┌───────────┴───────────┐
            │   HTTP Requests       │
            │  to /api/reports/*    │
            └───────────┬───────────┘
                        │
         ┌──────────────▼──────────────┐
         │ Express Backend Routes      │
         ├─────────────────────────────┤
         │ /api/reports/               │
         │  ├─collection-summary       │
         │  ├─outstanding-dues         │
         │  ├─yoy-comparison           │
         │  ├─cash-flow                │
         │  ├─health                   │
         │  └─export                   │
         └──────────────┬──────────────┘
                        │
         ┌──────────────▼──────────────┐
         │ reportsController.ts        │
         ├─────────────────────────────┤
         │ 6 async handler methods     │
         └──────────────┬──────────────┘
                        │
         ┌──────────────▼──────────────┐
         │ reportService.ts            │
         ├─────────────────────────────┤
         │ Business logic & calcs      │
         │ - Aggregations              │
         │ - Calculations              │
         │ - Data transformations      │
         └──────────────┬──────────────┘
                        │
         ┌──────────────▼──────────────┐
         │ Prisma ORM Database Queries │
         ├─────────────────────────────┤
         │ RentInvoice.findMany()      │
         │ MaintenanceInvoice.findMany │
         │ Payment.findMany()          │
         │ Property.findMany()         │
         │ Tenant queries              │
         └──────────────┬──────────────┘
                        │
         ┌──────────────▼──────────────┐
         │ PostgreSQL/MySQL/SQLite DB  │
         ├─────────────────────────────┤
         │ Real data returned          │
         └─────────────────────────────┘
```

## Error Handling Flow

```
Frontend API Call
    ↓
Try/Catch Block
    ├─ Success ──→ Response received
    │             └─→ Parse JSON
    │                 └─→ Update component state
    │                     └─→ Render with real data
    │
    └─ Error ────→ Catch block
                   ├─ Log error to console
                   ├─ Log to error tracking (future)
                   ├─ Show toast notification
                   │  └─ "Failed to load report data"
                   └─ Component shows loading failed state

Backend API Call
    ├─ Auth check (middleware)
    │  └─ Fails? Return 401 error
    │
    ├─ Parameter validation
    │  └─ Invalid? Log and continue
    │
    ├─ Service method call (try/catch)
    │  ├─ Success ──→ Format response
    │  │              └─→ Send JSON with 200 status
    │  │
    │  └─ Error ────→ Catch block
    │                 ├─ Log error
    │                 ├─ Format error response
    │                 └─→ Send JSON with 500 status
    │                     Including error message
    │
    └─ Error handler middleware
       └─ Catches any unhandled errors
           └─→ Send generic 500 error
```

## Performance Considerations

```
Query Performance Impact:
┌────────────────────────────────────────────┐
│ Report Type      │ DB Queries │ Time Est.  │
├──────────────────────────────────────────┤
│ Current Month    │ 3 main + N │ <100ms     │
│ Collection       │ property Q │          │
├──────────────────────────────────────────┤
│ Outstanding      │ 2 main + N │ <200ms     │
│ Dues             │ aggregates │          │
├──────────────────────────────────────────┤
│ Full Year YoY    │ 24 + trend │ 1-2 sec    │
│ Comparison       │ queries    │          │
├──────────────────────────────────────────┤
│ 12-Month Cash    │ 12 + aggr. │ <500ms     │
│ Flow             │ queries    │          │
├──────────────────────────────────────────┤
│ Health Status    │ Combined   │ <300ms     │
│ (2 reports)      │ queries    │          │
└────────────────────────────────────────────┘

Caching Strategy (Future):
├─ Cache collection summaries for completed months (TTL: 24h)
├─ Cache YoY data for completed years (TTL: 7 days)
├─ Cache health status (TTL: 1 hour)
├─ Invalidate cache on new invoices/payments
└─ Use Redis for distributed caching (if scaling)
```

---

**This architecture ensures:**
✅ Type-safe data flow throughout the stack
✅ Proper error handling at each layer
✅ Real-time data from database
✅ Scalable design for future enhancements
✅ Separated concerns (service, controller, route)
✅ Easy to test and maintain
