import { PrismaClient, VehicleType, ParkingSlotStatus } from '@prisma/client';

const prisma = new PrismaClient();

export class ParkingSlotService {
  /**
   * Create parking slots for property
   */
  async createParkingSlots(
    propertyId: string,
    slots: Array<{
      slotNumber: string;
      floor?: string;
      vehicleType: VehicleType;
    }>,
  ) {
    try {
      const createdSlots = await prisma.parkingSlot.createMany({
        data: slots.map((slot) => ({
          propertyId,
          slotNumber: slot.slotNumber,
          floor: slot.floor,
          vehicleType: slot.vehicleType,
          status: ParkingSlotStatus.AVAILABLE,
        })),
      });

      return {
        success: true,
        data: createdSlots,
        message: `Created ${createdSlots.count} parking slots`,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Get available parking slots for vehicle type
   */
  async getAvailableSlots(
    propertyId: string,
    vehicleType: VehicleType,
  ) {
    try {
      const slots = await prisma.parkingSlot.findMany({
        where: {
          propertyId,
          vehicleType,
          status: ParkingSlotStatus.AVAILABLE,
        },
        orderBy: { slotNumber: 'asc' },
      });

      return {
        success: true,
        data: slots,
        count: slots.length,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Assign parking slot to tenant
   */
  async assignParkingSlot(
    onboardingId: string,
    vehicleType: VehicleType,
  ) {
    try {
      // Get onboarding record
      const onboarding = await prisma.tenantOnboarding.findUnique({
        where: { id: onboardingId },
        include: { apartment: true },
      });

      if (!onboarding) {
        throw new Error('Onboarding record not found');
      }

      // Get available slot
      const availableSlot = await prisma.parkingSlot.findFirst({
        where: {
          propertyId: onboarding.propertyId,
          vehicleType,
          status: ParkingSlotStatus.AVAILABLE,
        },
        orderBy: { slotNumber: 'asc' },
      });

      if (!availableSlot) {
        throw new Error(
          `No available parking slots for ${vehicleType} vehicle type`,
        );
      }

      // Assign slot
      const assignedSlot = await prisma.parkingSlot.update({
        where: { id: availableSlot.id },
        data: {
          status: ParkingSlotStatus.ASSIGNED,
          assignedToId: onboardingId,
          assignedAt: new Date(),
        },
      });

      // Update onboarding
      await prisma.tenantOnboarding.update({
        where: { id: onboardingId },
        data: {
          parkingSlotId: assignedSlot.id,
          status: 'PARKING_ASSIGNED' as any,
        },
      });

      return {
        success: true,
        data: assignedSlot,
        message: `Parking slot ${assignedSlot.slotNumber} assigned successfully`,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Release parking slot
   */
  async releaseParkingSlot(parkingSlotId: string) {
    try {
      const slot = await prisma.parkingSlot.update({
        where: { id: parkingSlotId },
        data: {
          status: ParkingSlotStatus.AVAILABLE,
          assignedToId: null,
          releasedAt: new Date(),
        },
      });

      return {
        success: true,
        data: slot,
        message: `Parking slot ${slot.slotNumber} released`,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Get parking slots for property
   */
  async getPropertyParkingSlots(propertyId: string, status?: ParkingSlotStatus) {
    try {
      const slots = await prisma.parkingSlot.findMany({
        where: {
          propertyId,
          ...(status && { status }),
        },
        include: {
          assignedTo: {
            include: {
              tenant: true,
            },
          },
        },
        orderBy: [{ floor: 'asc' }, { slotNumber: 'asc' }],
      });

      return {
        success: true,
        data: slots,
        count: slots.length,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Get parking slot details
   */
  async getParkingSlotDetails(parkingSlotId: string) {
    try {
      const slot = await prisma.parkingSlot.findUnique({
        where: { id: parkingSlotId },
        include: {
          assignedTo: {
            include: {
              tenant: true,
              apartment: true,
            },
          },
        },
      });

      if (!slot) {
        throw new Error('Parking slot not found');
      }

      return {
        success: true,
        data: slot,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Update parking slot status (for maintenance, etc.)
   */
  async updateParkingSlotStatus(
    parkingSlotId: string,
    status: ParkingSlotStatus,
  ) {
    try {
      const slot = await prisma.parkingSlot.update({
        where: { id: parkingSlotId },
        data: { status },
      });

      return {
        success: true,
        data: slot,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Get parking statistics for property
   */
  async getParkingStatistics(propertyId: string) {
    try {
      const total = await prisma.parkingSlot.count({
        where: { propertyId },
      });

      const available = await prisma.parkingSlot.count({
        where: {
          propertyId,
          status: ParkingSlotStatus.AVAILABLE,
        },
      });

      const assigned = await prisma.parkingSlot.count({
        where: {
          propertyId,
          status: ParkingSlotStatus.ASSIGNED,
        },
      });

      const maintenance = await prisma.parkingSlot.count({
        where: {
          propertyId,
          status: ParkingSlotStatus.MAINTENANCE,
        },
      });

      return {
        success: true,
        data: {
          total,
          available,
          assigned,
          maintenance,
          occupancyRate: total > 0 ? ((assigned / total) * 100).toFixed(2) : 0,
        },
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }
}

export default new ParkingSlotService();
