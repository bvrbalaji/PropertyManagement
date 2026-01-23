# Financial Management API Documentation

## Overview

This document describes the Financial Management API endpoints for handling Rent Collections and Maintenance Collections features.

## Base URL

```
/api/finances
```

## Authentication

All endpoints require authentication via JWT token in the `Authorization` header:

```
Authorization: Bearer <token>
```

---

## Rent Invoice Endpoints

### 1. Create Rent Invoice

**POST** `/rent-invoices`

Create a new rent invoice for a tenant.

**Request Body:**
```json
{
  "tenantId": "string (required)",
  "propertyId": "string (required)",
  "apartmentId": "string (required)",
  "rentAmount": "number (required)",
  "invoiceDate": "ISO Date string (required)",
  "dueDate": "ISO Date string (required)",
  "description": "string (optional)",
  "notes": "string (optional)"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "string",
    "invoiceNumber": "RENT-202401-00001",
    "status": "DRAFT",
    "rentAmount": 50000,
    "paidAmount": 0,
    "remainingAmount": 50000,
    "isOverdue": false,
    "createdAt": "ISO Date string"
  }
}
```

### 2. List Rent Invoices

**GET** `/rent-invoices`

List rent invoices with optional filters.

**Query Parameters:**
- `tenantId` (optional): Filter by tenant
- `propertyId` (optional): Filter by property
- `apartmentId` (optional): Filter by apartment
- `status` (optional): Filter by status (DRAFT, SENT, VIEWED, PARTIALLY_PAID, PAID, OVERDUE, CANCELLED)
- `startDate` (optional): Start date filter
- `endDate` (optional): End date filter
- `isOverdue` (optional): Filter overdue invoices (true/false)
- `skip` (optional, default: 0): Pagination skip
- `take` (optional, default: 20): Pagination take

**Response:**
```json
{
  "success": true,
  "data": {
    "invoices": [...],
    "total": 150,
    "page": 1,
    "pages": 8
  }
}
```

### 3. Get Rent Invoice

**GET** `/rent-invoices/:invoiceId`

Retrieve a specific rent invoice with full details.

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "string",
    "invoiceNumber": "string",
    "tenantId": "string",
    "propertyId": "string",
    "apartmentId": "string",
    "rentAmount": 50000,
    "paidAmount": 0,
    "remainingAmount": 50000,
    "lateFeeApplied": 0,
    "status": "SENT",
    "isOverdue": false,
    "invoiceDate": "ISO Date",
    "dueDate": "ISO Date",
    "sentDate": "ISO Date",
    "tenant": {...},
    "property": {...},
    "apartment": {...},
    "payments": [...],
    "reminders": [...],
    "lateFees": [...],
    "receipts": [...]
  }
}
```

### 4. Update Rent Invoice

**PATCH** `/rent-invoices/:invoiceId`

Update an existing rent invoice.

**Request Body:**
```json
{
  "rentAmount": "number (optional)",
  "dueDate": "ISO Date string (optional)",
  "description": "string (optional)",
  "notes": "string (optional)",
  "status": "string (optional)"
}
```

### 5. Send Rent Invoice

**POST** `/rent-invoices/:invoiceId/send`

Send invoice to tenant via email.

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "string",
    "status": "SENT",
    "sentDate": "ISO Date"
  }
}
```

### 6. Mark Invoice as Viewed

**POST** `/rent-invoices/:invoiceId/mark-viewed`

Mark invoice as viewed by tenant.

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "string",
    "status": "VIEWED",
    "viewedAt": "ISO Date"
  }
}
```

### 7. Cancel Invoice

**POST** `/rent-invoices/:invoiceId/cancel`

Cancel a rent invoice.

**Request Body:**
```json
{
  "reason": "string (optional)"
}
```

### 8. Generate Monthly Invoices

**POST** `/rent-invoices/generate-monthly`

Generate rent invoices for all tenants in a property for a specific month.

**Request Body:**
```json
{
  "propertyId": "string (required)",
  "month": "ISO Date string (required)"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "generatedCount": 25,
    "invoices": [...]
  }
}
```

### 9. Get Property Invoice Summary

**GET** `/rent-invoices/property/:propertyId/summary`

Get summary statistics for rent invoices in a property.

**Response:**
```json
{
  "success": true,
  "data": {
    "totalInvoices": 150,
    "totalRent": 7500000,
    "totalPaid": 5000000,
    "totalLateFees": 50000,
    "pendingAmount": 2500000,
    "byStatus": [...]
  }
}
```

### 10. Check Overdue Invoices

**POST** `/rent-invoices/check-overdue`

Check and update overdue status for all invoices.

**Response:**
```json
{
  "success": true,
  "data": {
    "updatedCount": 12
  }
}
```

---

## Maintenance Invoice Endpoints

### 1. Create Maintenance Invoice

**POST** `/maintenance-invoices`

Create a new maintenance invoice.

**Request Body:**
```json
{
  "tenantId": "string (required)",
  "propertyId": "string (required)",
  "apartmentId": "string (required)",
  "invoiceDate": "ISO Date string (required)",
  "dueDate": "ISO Date string (required)",
  "water": "number (optional)",
  "electricity": "number (optional)",
  "security": "number (optional)",
  "cleaning": "number (optional)",
  "other": "number (optional)",
  "otherDescription": "string (optional)",
  "isCombinedWithRent": "boolean (optional)",
  "linkedRentInvoiceId": "string (optional)",
  "notes": "string (optional)"
}
```

### 2. List Maintenance Invoices

**GET** `/maintenance-invoices`

List maintenance invoices with filters (same query parameters as rent invoices).

### 3. Get Maintenance Invoice

**GET** `/maintenance-invoices/:invoiceId`

Retrieve a specific maintenance invoice.

### 4. Update Maintenance Invoice

**PATCH** `/maintenance-invoices/:invoiceId`

Update maintenance invoice charges.

**Request Body:**
```json
{
  "water": "number (optional)",
  "electricity": "number (optional)",
  "security": "number (optional)",
  "cleaning": "number (optional)",
  "other": "number (optional)",
  "otherDescription": "string (optional)",
  "dueDate": "ISO Date string (optional)",
  "status": "string (optional)"
}
```

### 5. Send Maintenance Invoice

**POST** `/maintenance-invoices/:invoiceId/send`

Send maintenance invoice to tenant.

### 6. Generate Monthly Invoices

**POST** `/maintenance-invoices/generate-monthly`

Generate monthly maintenance invoices for a property.

---

## Payment Endpoints

### 1. Initiate Payment

**POST** `/payments`

Initiate a payment for an invoice.

**Request Body:**
```json
{
  "tenantId": "string (required)",
  "propertyId": "string (required)",
  "apartmentId": "string (required)",
  "rentInvoiceId": "string (optional, required if no maintenanceInvoiceId)",
  "maintenanceInvoiceId": "string (optional, required if no rentInvoiceId)",
  "amount": "number (required)",
  "paymentMethod": "string (required: UPI, NET_BANKING, CREDIT_CARD, DEBIT_CARD, WALLET, CASH, CHEQUE)",
  "paymentGateway": "string (optional: RAZORPAY, STRIPE, MANUAL)",
  "transactionId": "string (optional)"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "string",
    "amount": 50000,
    "status": "PENDING",
    "paymentMethod": "UPI",
    "paymentGateway": "RAZORPAY",
    "createdAt": "ISO Date"
  },
  "gatewayResponse": {...}
}
```

### 2. Confirm Payment

**POST** `/payments/:paymentId/confirm`

Confirm payment after gateway verification (typically called from webhook).

**Request Body:**
```json
{
  "verified": "boolean (required)",
  "failureReason": "string (optional, if verified=false)"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "string",
    "status": "SUCCESS",
    "successDate": "ISO Date"
  },
  "receipt": {...}
}
```

### 3. Get Payment

**GET** `/payments/:paymentId`

Retrieve payment details.

### 4. List Payments

**GET** `/payments`

List payments with filters.

**Query Parameters:**
- `tenantId` (optional)
- `propertyId` (optional)
- `status` (optional: PENDING, SUCCESS, FAILED, REFUNDED, CANCELLED)
- `paymentMethod` (optional)
- `startDate` (optional)
- `endDate` (optional)
- `skip` (optional, default: 0)
- `take` (optional, default: 20)

### 5. Process Refund

**POST** `/payments/:paymentId/refund`

Process a refund for a successful payment.

**Request Body:**
```json
{
  "refundAmount": "number (required)",
  "reason": "string (required)"
}
```

### 6. Get Payment Statistics

**GET** `/payments/statistics`

Get payment statistics for a property.

**Query Parameters:**
- `propertyId` (required)
- `startDate` (optional)
- `endDate` (optional)

**Response:**
```json
{
  "success": true,
  "data": {
    "totalTransactions": 450,
    "totalAmount": 22500000,
    "totalRefunds": 50000,
    "byStatus": [...],
    "byMethod": [...]
  }
}
```

### 7. Get Tenant Payment History

**GET** `/payments/tenant/:tenantId/history`

Get complete payment history for a tenant.

---

## Late Fee Endpoints

### 1. Calculate Late Fee

**POST** `/late-fees/calculate`

Calculate late fee for an overdue invoice.

**Request Body:**
```json
{
  "invoiceId": "string (required)",
  "invoiceType": "string (required: RENT or MAINTENANCE)",
  "daysOverdue": "number (required)"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "lateFeeAmount": 500,
    "daysOverdue": 10,
    "calculationMethod": "FLAT",
    "config": {...}
  }
}
```

### 2. Apply Late Fee

**POST** `/late-fees/apply`

Apply calculated late fee to an invoice.

**Request Body:**
```json
{
  "invoiceId": "string (required)",
  "invoiceType": "string (required: RENT or MAINTENANCE)",
  "lateFeeAmount": "number (required)",
  "reason": "string (optional)"
}
```

### 3. Waive Late Fee

**POST** `/late-fees/:lateFeeId/waive`

Waive an applied late fee.

**Request Body:**
```json
{
  "reason": "string (required)",
  "waivedBy": "string (required: admin user ID)"
}
```

### 4. Get Tenant Late Fees

**GET** `/late-fees/tenant/:tenantId`

Get all late fees for a tenant.

### 5. Get Property Late Fees Summary

**GET** `/late-fees/property/:propertyId/summary`

Get late fee summary for a property.

**Response:**
```json
{
  "success": true,
  "data": {
    "activeLateFees": 15,
    "activeLateFeesAmount": 7500,
    "waivedLateFees": 3,
    "waivedLateFeeAmount": 1500,
    "totalOverdueInvoices": 18
  }
}
```

---

## Configuration Endpoints

### 1. Create Rent Configuration

**POST** `/configurations/rent`

Create rent configuration for a property or apartment.

**Request Body:**
```json
{
  "propertyId": "string (required)",
  "apartmentId": "string (optional, if property-level)",
  "rentAmount": "number (required)",
  "dueDate": "number (required, 1-31)",
  "gracePeriodDays": "number (optional, default: 5)",
  "lateFeeCalculationMethod": "string (optional: FLAT, PERCENT_PER_DAY, PERCENT_PER_MONTH)",
  "lateFeeAmount": "number (optional)",
  "lateFeePercent": "number (optional)",
  "lateFeeMaxCap": "number (optional)",
  "allowPartialPayments": "boolean (optional, default: true)",
  "annualEscalationPercent": "number (optional)",
  "nextEscalationDate": "ISO Date string (optional)"
}
```

### 2. Create Maintenance Fee Configuration

**POST** `/configurations/maintenance`

Create maintenance fee configuration.

**Request Body:**
```json
{
  "propertyId": "string (required)",
  "apartmentId": "string (optional)",
  "feeType": "string (optional: FIXED or VARIABLE)",
  "fixedAmount": "number (optional)",
  "billingCycle": "string (optional: MONTHLY, QUARTERLY, YEARLY)",
  "lateFeeCalculationMethod": "string (optional)",
  "lateFeeAmount": "number (optional)",
  "lateFeePercent": "number (optional)",
  "lateFeeMaxCap": "number (optional)",
  "excludeVacantUnits": "boolean (optional)",
  "annualEscalationPercent": "number (optional)",
  "nextEscalationDate": "ISO Date string (optional)"
}
```

### 3. Get Rent Configuration

**GET** `/configurations/rent/:configId`

Retrieve rent configuration details.

### 4. Get Maintenance Configuration

**GET** `/configurations/maintenance/:configId`

Retrieve maintenance fee configuration details.

### 5. List Rent Configurations

**GET** `/configurations/rent/property/:propertyId`

List all rent configurations for a property.

### 6. List Maintenance Configurations

**GET** `/configurations/maintenance/property/:propertyId`

List all maintenance configurations for a property.

### 7. Update Rent Configuration

**PATCH** `/configurations/rent/:configId`

Update rent configuration.

### 8. Update Maintenance Configuration

**PATCH** `/configurations/maintenance/:configId`

Update maintenance configuration.

### 9. Delete Rent Configuration

**DELETE** `/configurations/rent/:configId`

Delete rent configuration.

### 10. Delete Maintenance Configuration

**DELETE** `/configurations/maintenance/:configId`

Delete maintenance configuration.

---

## Error Responses

All error responses follow this format:

```json
{
  "success": false,
  "error": "Error message describing what went wrong"
}
```

Common HTTP Status Codes:
- `200`: Success
- `201`: Created
- `400`: Bad Request
- `404`: Not Found
- `500`: Internal Server Error

---

## Pagination

Endpoints that return lists support pagination via `skip` and `take` query parameters:

```
GET /api/finances/payments?skip=0&take=20
```

Responses include pagination metadata:

```json
{
  "data": {
    "payments": [...],
    "total": 150,
    "page": 1,
    "pages": 8
  }
}
```

---

## Integration Guide

### Setting up Payment Gateway

1. Configure environment variables:
```
RAZORPAY_KEY_ID=your_key_id
RAZORPAY_KEY_SECRET=your_key_secret
```

2. When initiating payment, specify the payment gateway:
```json
{
  "paymentGateway": "RAZORPAY",
  ...
}
```

### Automated Tasks

The system includes several automated tasks that should be scheduled:

1. **Check Overdue Invoices** - Run daily to mark invoices as overdue
2. **Process Late Fees** - Run daily to calculate and apply late fees
3. **Send Payment Reminders** - Run hourly to send scheduled reminders
4. **Send Receipts** - Run every 5 minutes to send pending receipts

These can be implemented using node-cron or a task queue like Bull.

---

## Best Practices

1. **Invoice Generation**: Use the monthly invoice generation endpoint to create invoices at the start of each month
2. **Payment Gateway**: Always validate webhook signatures from payment gateways
3. **Reminders**: Configure reminder schedules based on your property's late payment patterns
4. **Late Fees**: Set appropriate late fee rules to encourage timely payments
5. **Reports**: Regularly pull statistics to monitor collection rates and outstanding amounts
