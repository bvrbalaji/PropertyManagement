import { Request, Response } from 'express';
import parkingService from '../services/parkingService';

export class ParkingController {
  /**
   * Create parking slots for property
   */
  async createParkingSlots(req: Request, res: Response) {
    try {
      const { propertyId } = req.params;
      const { slots } = req.body;

      if (!slots || !Array.isArray(slots)) {
        return res.status(400).json({
          success: false,
          error: 'Slots array is required',
        });
      }

      const result = await parkingService.createParkingSlots(propertyId, slots);

      if (!result.success) {
        return res.status(400).json(result);
      }

      return res.status(201).json(result);
    } catch (error) {
      return res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Internal server error',
      });
    }
  }

  /**
   * Get available parking slots
   */
  async getAvailableSlots(req: Request, res: Response) {
    try {
      const { propertyId } = req.params;
      const { vehicleType } = req.query;

      if (!vehicleType) {
        return res.status(400).json({
          success: false,
          error: 'Vehicle type is required',
        });
      }

      const result = await parkingService.getAvailableSlots(
        propertyId,
        vehicleType as any,
      );

      if (!result.success) {
        return res.status(400).json(result);
      }

      return res.status(200).json(result);
    } catch (error) {
      return res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Internal server error',
      });
    }
  }

  /**
   * Get property parking slots
   */
  async getPropertyParkingSlots(req: Request, res: Response) {
    try {
      const { propertyId } = req.params;
      const { status } = req.query;

      const result = await parkingService.getPropertyParkingSlots(
        propertyId,
        status as any,
      );

      if (!result.success) {
        return res.status(400).json(result);
      }

      return res.status(200).json(result);
    } catch (error) {
      return res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Internal server error',
      });
    }
  }

  /**
   * Get parking slot details
   */
  async getParkingSlotDetails(req: Request, res: Response) {
    try {
      const { parkingSlotId } = req.params;

      const result = await parkingService.getParkingSlotDetails(parkingSlotId);

      if (!result.success) {
        return res.status(404).json(result);
      }

      return res.status(200).json(result);
    } catch (error) {
      return res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Internal server error',
      });
    }
  }

  /**
   * Update parking slot status
   */
  async updateParkingSlotStatus(req: Request, res: Response) {
    try {
      const { parkingSlotId } = req.params;
      const { status } = req.body;

      if (!status) {
        return res.status(400).json({
          success: false,
          error: 'Status is required',
        });
      }

      const result = await parkingService.updateParkingSlotStatus(
        parkingSlotId,
        status,
      );

      if (!result.success) {
        return res.status(400).json(result);
      }

      return res.status(200).json(result);
    } catch (error) {
      return res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Internal server error',
      });
    }
  }

  /**
   * Get parking statistics for property
   */
  async getParkingStatistics(req: Request, res: Response) {
    try {
      const { propertyId } = req.params;

      const result = await parkingService.getParkingStatistics(propertyId);

      if (!result.success) {
        return res.status(400).json(result);
      }

      return res.status(200).json(result);
    } catch (error) {
      return res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Internal server error',
      });
    }
  }
}

export default new ParkingController();
