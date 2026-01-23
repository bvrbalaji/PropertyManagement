import { Request, Response } from 'express';
import maintenanceInvoiceService from '../services/maintenanceInvoiceService';
import paymentReminderService from '../services/paymentReminderService';
import { InvoiceStatus } from '@prisma/client';

export class MaintenanceInvoiceController {
  /**
   * Create new maintenance invoice
   */
  async createInvoice(req: Request, res: Response) {
    try {
      const {
        tenantId,
        propertyId,
        apartmentId,
        invoiceDate,
        dueDate,
        water,
        electricity,
        security,
        cleaning,
        other,
        otherDescription,
        isCombinedWithRent,
        linkedRentInvoiceId,
        notes,
      } = req.body;

      if (!tenantId || !propertyId || !apartmentId || !invoiceDate || !dueDate) {
        return res.status(400).json({
          success: false,
          error: 'Missing required fields',
        });
      }

      const result = await maintenanceInvoiceService.createInvoice({
        tenantId,
        propertyId,
        apartmentId,
        invoiceDate: new Date(invoiceDate),
        dueDate: new Date(dueDate),
        water,
        electricity,
        security,
        cleaning,
        other,
        otherDescription,
        isCombinedWithRent,
        linkedRentInvoiceId,
        notes,
      });

      if (result.success) {
        // Schedule reminders
        await paymentReminderService.scheduleAutomaticReminders(result.data.id, 'MAINTENANCE');

        return res.status(201).json(result);
      } else {
        return res.status(400).json(result);
      }
    } catch (error) {
      return res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to create invoice',
      });
    }
  }

  /**
   * Get invoice by ID
   */
  async getInvoice(req: Request, res: Response) {
    try {
      const { invoiceId } = req.params;

      if (!invoiceId) {
        return res.status(400).json({ success: false, error: 'Invoice ID required' });
      }

      const result = await maintenanceInvoiceService.getInvoiceById(invoiceId);

      if (result.success) {
        return res.status(200).json(result);
      } else {
        return res.status(404).json(result);
      }
    } catch (error) {
      return res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch invoice',
      });
    }
  }

  /**
   * List invoices with filters
   */
  async listInvoices(req: Request, res: Response) {
    try {
      const {
        tenantId,
        propertyId,
        apartmentId,
        status,
        startDate,
        endDate,
        isOverdue,
        skip = 0,
        take = 20,
      } = req.query;

      const filters = {
        tenantId: tenantId as string,
        propertyId: propertyId as string,
        apartmentId: apartmentId as string,
        status: status as InvoiceStatus,
        startDate: startDate ? new Date(startDate as string) : undefined,
        endDate: endDate ? new Date(endDate as string) : undefined,
        isOverdue: isOverdue === 'true' ? true : isOverdue === 'false' ? false : undefined,
      };

      const result = await maintenanceInvoiceService.listInvoices(filters, Number(skip), Number(take));

      return res.status(200).json(result);
    } catch (error) {
      return res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to list invoices',
      });
    }
  }

  /**
   * Update invoice
   */
  async updateInvoice(req: Request, res: Response) {
    try {
      const { invoiceId } = req.params;
      const { water, electricity, security, cleaning, other, otherDescription, dueDate, status } = req.body;

      if (!invoiceId) {
        return res.status(400).json({ success: false, error: 'Invoice ID required' });
      }

      const result = await maintenanceInvoiceService.updateInvoice(invoiceId, {
        water,
        electricity,
        security,
        cleaning,
        other,
        otherDescription,
        dueDate: dueDate ? new Date(dueDate) : undefined,
        status,
      });

      if (result.success) {
        return res.status(200).json(result);
      } else {
        return res.status(400).json(result);
      }
    } catch (error) {
      return res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to update invoice',
      });
    }
  }

  /**
   * Send invoice
   */
  async sendInvoice(req: Request, res: Response) {
    try {
      const { invoiceId } = req.params;

      if (!invoiceId) {
        return res.status(400).json({ success: false, error: 'Invoice ID required' });
      }

      const result = await maintenanceInvoiceService.sendInvoice(invoiceId);

      if (result.success) {
        return res.status(200).json(result);
      } else {
        return res.status(400).json(result);
      }
    } catch (error) {
      return res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to send invoice',
      });
    }
  }

  /**
   * Generate monthly invoices
   */
  async generateMonthlyInvoices(req: Request, res: Response) {
    try {
      const { propertyId, month } = req.body;

      if (!propertyId || !month) {
        return res.status(400).json({
          success: false,
          error: 'Missing required fields: propertyId, month',
        });
      }

      const result = await maintenanceInvoiceService.generateMonthlyInvoices(
        propertyId,
        new Date(month),
      );

      if (result.success) {
        return res.status(201).json(result);
      } else {
        return res.status(400).json(result);
      }
    } catch (error) {
      return res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to generate invoices',
      });
    }
  }
}

export default new MaintenanceInvoiceController();
