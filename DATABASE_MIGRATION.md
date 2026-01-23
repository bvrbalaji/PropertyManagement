# Database Migration Guide

## Steps to Deploy the New Schema

### Prerequisites
- PostgreSQL database running
- Prisma CLI installed (`npm install -g prisma`)
- Connection string configured in `.env`

### Migration Steps

1. **Generate Prisma Client**
```bash
cd server
npm run prisma:generate
```

2. **Create and Run Migration**
```bash
npm run prisma:migrate
```
Follow the prompt and name the migration (e.g., "add_tenant_onboarding_offboarding")

3. **Verify Database**
```bash
npm run prisma:studio
```
This will open Prisma Studio to visualize the new schema.

## New Database Tables

### Onboarding Tables
- `TenantOnboarding` - Main onboarding records
- `OnboardingDocument` - Stored documents
- `OnboardingPayment` - Payment records
- `InspectionChecklist` - Inspection templates
- `ChecklistItem` - Template items
- `Inspection` - Inspection records
- `InspectionItem` - Item assessments
- `InspectionPhoto` - Photo storage

### Offboarding Tables
- `TenantOffboarding` - Main offboarding records
- `OffboardingDocument` - Final bills, certificates
- `FinalSettlement` - Settlement records

### Parking Tables
- `ParkingSlot` - Parking inventory

## New Enums

- `OnboardingStatus` - Inquiry, Form Submitted, Inspection Pending, Lease Signed, Deposit Pending, Parking Assigned, Completed, Cancelled
- `OffboardingStatus` - Requested, Inspection Scheduled, Inspection Completed, Settlement Pending, Refund Processed, Completed, Cancelled
- `ParkingSlotStatus` - Available, Assigned, Reserved, Maintenance
- `VehicleType` - Two Wheeler, Four Wheeler, SUV, Commercial

## Data Seeding (Optional)

Create a seed script `server/prisma/seed.ts`:

```typescript
import { PrismaClient, VehicleType } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // Create sample inspection checklist
  const checklist = await prisma.inspectionChecklist.create({
    data: {
      propertyId: 'your_property_id',
      name: 'Standard Move-In Inspection',
      isForOnboarding: true,
      items: {
        create: [
          { itemName: 'Walls', category: 'STRUCTURAL' },
          { itemName: 'Flooring', category: 'STRUCTURAL' },
          { itemName: 'Doors & Windows', category: 'STRUCTURAL' },
          { itemName: 'Refrigerator', category: 'APPLIANCES' },
          { itemName: 'Washing Machine', category: 'APPLIANCES' },
          { itemName: 'Kitchen Pipes', category: 'PLUMBING' },
          { itemName: 'Bathroom Fixtures', category: 'PLUMBING' },
        ],
      },
    },
  });

  // Create sample parking slots
  const parkingSlots = await prisma.parkingSlot.createMany({
    data: [
      {
        propertyId: 'your_property_id',
        slotNumber: 'A1',
        floor: '1',
        vehicleType: VehicleType.FOUR_WHEELER,
        status: 'AVAILABLE',
      },
      {
        propertyId: 'your_property_id',
        slotNumber: 'A2',
        floor: '1',
        vehicleType: VehicleType.FOUR_WHEELER,
        status: 'AVAILABLE',
      },
      {
        propertyId: 'your_property_id',
        slotNumber: 'B1',
        floor: '2',
        vehicleType: VehicleType.TWO_WHEELER,
        status: 'AVAILABLE',
      },
    ],
  });

  console.log('Seeding completed:', { checklist, parkingSlots });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
```

Run seed:
```bash
npx prisma db seed
```

## Rollback (if needed)

To rollback the last migration:
```bash
npx prisma migrate resolve --rolled-back migration_name
```

## Verify Installation

```bash
cd server
npm run dev
```

Check the server logs to ensure all routes are registered:
- `/api/onboarding`
- `/api/offboarding`
- `/api/parking`

## Next Steps

1. Update `.env` with payment gateway credentials (Razorpay/Stripe)
2. Configure email service credentials
3. Configure SMS service (Twilio) if using SMS notifications
4. Start the backend server
5. Start the frontend development server
6. Test the onboarding/offboarding workflow
