import { Request, Response } from 'express';
import rentInvoiceService from '../services/rentInvoiceService';
import paymentReminderService from '../services/paymentReminderService';
import { InvoiceStatus } from '@prisma/client';

export class RentInvoiceController {
  /**
   * Create new rent invoice
   */
  async createInvoice(req: Request, res: Response) {
    try {
      const { tenantId, propertyId, apartmentId, rentAmount, invoiceDate, dueDate, description, notes } =
        req.body;

      if (!tenantId || !propertyId || !apartmentId || !rentAmount || !invoiceDate || !dueDate) {
        return res.status(400).json({
          success: false,
          error: 'Missing required fields: tenantId, propertyId, apartmentId, rentAmount, invoiceDate, dueDate',
        });
      }

      const result = await rentInvoiceService.createInvoice({
        tenantId,
        propertyId,
        apartmentId,
        rentAmount,
        invoiceDate: new Date(invoiceDate),
        dueDate: new Date(dueDate),
        description,
        notes,
      });

      if (result.success) {
        // Schedule automatic reminders
        await paymentReminderService.scheduleAutomaticReminders(result.data.id, 'RENT');

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

      const result = await rentInvoiceService.getInvoiceById(invoiceId);

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
      const { tenantId, propertyId, apartmentId, status, startDate, endDate, isOverdue, skip = 0, take = 20 } = req.query;

      const filters = {
        tenantId: tenantId as string,
        propertyId: propertyId as string,
        apartmentId: apartmentId as string,
        status: status as InvoiceStatus,
        startDate: startDate ? new Date(startDate as string) : undefined,
        endDate: endDate ? new Date(endDate as string) : undefined,
        isOverdue: isOverdue === 'true' ? true : isOverdue === 'false' ? false : undefined,
      };

      const result = await rentInvoiceService.listInvoices(filters, Number(skip), Number(take));

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
      const { rentAmount, dueDate, description, notes, status } = req.body;

      if (!invoiceId) {
        return res.status(400).json({ success: false, error: 'Invoice ID required' });
      }

      const result = await rentInvoiceService.updateInvoice(invoiceId, {
        rentAmount,
        dueDate: dueDate ? new Date(dueDate) : undefined,
        description,
        notes,
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
   * Send invoice to tenant
   */
  async sendInvoice(req: Request, res: Response) {
    try {
      const { invoiceId } = req.params;

      if (!invoiceId) {
        return res.status(400).json({ success: false, error: 'Invoice ID required' });
      }

      const result = await rentInvoiceService.sendInvoice(invoiceId);

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
   * Mark invoice as viewed
   */
  async markAsViewed(req: Request, res: Response) {
    try {
      const { invoiceId } = req.params;

      if (!invoiceId) {
        return res.status(400).json({ success: false, error: 'Invoice ID required' });
      }

      const result = await rentInvoiceService.markAsViewed(invoiceId);

      if (result.success) {
        return res.status(200).json(result);
      } else {
        return res.status(400).json(result);
      }
    } catch (error) {
      return res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to mark as viewed',
      });
    }
  }

  /**
   * Cancel invoice
   */
  async cancelInvoice(req: Request, res: Response) {
    try {
      const { invoiceId } = req.params;
      const { reason } = req.body;

      if (!invoiceId) {
        return res.status(400).json({ success: false, error: 'Invoice ID required' });
      }

      const result = await rentInvoiceService.cancelInvoice(invoiceId, reason);

      if (result.success) {
        return res.status(200).json(result);
      } else {
        return res.status(400).json(result);
      }
    } catch (error) {
      return res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to cancel invoice',
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

      const result = await rentInvoiceService.generateMonthlyInvoices(propertyId, new Date(month));

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

  /**
   * Get property invoice summary
   */
  async getPropertySummary(req: Request, res: Response) {
    try {
      const { propertyId } = req.params;

      if (!propertyId) {
        return res.status(400).json({ success: false, error: 'Property ID required' });
      }

      const result = await rentInvoiceService.getPropertyInvoiceSummary(propertyId);

      if (result.success) {
        return res.status(200).json(result);
      } else {
        return res.status(400).json(result);
      }
    } catch (error) {
      return res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to get summary',
      });
    }
  }

  /**
   * Check and update overdue invoices
   */
  async checkOverdue(req: Request, res: Response) {
    try {
      const result = await rentInvoiceService.checkAndUpdateOverdueStatus();

      if (result.success) {
        return res.status(200).json(result);
      } else {
        return res.status(400).json(result);
      }
    } catch (error) {
      return res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to check overdue',
      });
    }
  }
}

export default new RentInvoiceController();
