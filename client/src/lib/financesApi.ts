import { api } from './api';

// ==================== RENT INVOICE CLIENT ====================

export const rentInvoiceAPI = {
  /**
   * Create a new rent invoice
   */
  async create(data: {
    tenantId: string;
    propertyId: string;
    apartmentId: string;
    rentAmount: number;
    invoiceDate: Date;
    dueDate: Date;
    description?: string;
    notes?: string;
  }) {
    return api.post('/finances/rent-invoices', {
      ...data,
      invoiceDate: data.invoiceDate.toISOString(),
      dueDate: data.dueDate.toISOString(),
    });
  },

  /**
   * Get invoice by ID
   */
  async getById(invoiceId: string) {
    return api.get(`/finances/rent-invoices/${invoiceId}`);
  },

  /**
   * List invoices with filters
   */
  async list(filters?: {
    tenantId?: string;
    propertyId?: string;
    apartmentId?: string;
    status?: string;
    startDate?: Date;
    endDate?: Date;
    isOverdue?: boolean;
    skip?: number;
    take?: number;
  }) {
    const params = new URLSearchParams();
    if (filters) {
      if (filters.tenantId) params.append('tenantId', filters.tenantId);
      if (filters.propertyId) params.append('propertyId', filters.propertyId);
      if (filters.apartmentId) params.append('apartmentId', filters.apartmentId);
      if (filters.status) params.append('status', filters.status);
      if (filters.startDate) params.append('startDate', filters.startDate.toISOString());
      if (filters.endDate) params.append('endDate', filters.endDate.toISOString());
      if (filters.isOverdue !== undefined) params.append('isOverdue', String(filters.isOverdue));
      if (filters.skip !== undefined) params.append('skip', String(filters.skip));
      if (filters.take !== undefined) params.append('take', String(filters.take));
    }
    return api.get(`/finances/rent-invoices?${params.toString()}`);
  },

  /**
   * Update invoice
   */
  async update(
    invoiceId: string,
    data: {
      rentAmount?: number;
      dueDate?: Date;
      description?: string;
      notes?: string;
      status?: string;
    },
  ) {
    return api.patch(`/finances/rent-invoices/${invoiceId}`, {
      ...data,
      dueDate: data.dueDate?.toISOString(),
    });
  },

  /**
   * Send invoice
   */
  async send(invoiceId: string) {
    return api.post(`/finances/rent-invoices/${invoiceId}/send`);
  },

  /**
   * Mark as viewed
   */
  async markAsViewed(invoiceId: string) {
    return api.post(`/finances/rent-invoices/${invoiceId}/mark-viewed`);
  },

  /**
   * Cancel invoice
   */
  async cancel(invoiceId: string, reason?: string) {
    return api.post(`/finances/rent-invoices/${invoiceId}/cancel`, { reason });
  },

  /**
   * Generate monthly invoices
   */
  async generateMonthly(propertyId: string, month: Date) {
    return api.post('/finances/rent-invoices/generate-monthly', {
      propertyId,
      month: month.toISOString(),
    });
  },

  /**
   * Get property summary
   */
  async getPropertySummary(propertyId: string) {
    return api.get(`/finances/rent-invoices/property/${propertyId}/summary`);
  },

  /**
   * Check overdue invoices
   */
  async checkOverdue() {
    return api.post('/finances/rent-invoices/check-overdue');
  },
};

// ==================== MAINTENANCE INVOICE CLIENT ====================

export const maintenanceInvoiceAPI = {
  /**
   * Create maintenance invoice
   */
  async create(data: {
    tenantId: string;
    propertyId: string;
    apartmentId: string;
    invoiceDate: Date;
    dueDate: Date;
    water?: number;
    electricity?: number;
    security?: number;
    cleaning?: number;
    other?: number;
    otherDescription?: string;
    isCombinedWithRent?: boolean;
    linkedRentInvoiceId?: string;
    notes?: string;
  }) {
    return api.post('/finances/maintenance-invoices', {
      ...data,
      invoiceDate: data.invoiceDate.toISOString(),
      dueDate: data.dueDate.toISOString(),
    });
  },

  /**
   * Get invoice
   */
  async getById(invoiceId: string) {
    return api.get(`/finances/maintenance-invoices/${invoiceId}`);
  },

  /**
   * List invoices
   */
  async list(filters?: any) {
    const params = new URLSearchParams();
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined) {
          params.append(key, String(value));
        }
      });
    }
    return api.get(`/finances/maintenance-invoices?${params.toString()}`);
  },

  /**
   * Update invoice
   */
  async update(invoiceId: string, data: any) {
    return api.patch(`/finances/maintenance-invoices/${invoiceId}`, data);
  },

  /**
   * Send invoice
   */
  async send(invoiceId: string) {
    return api.post(`/finances/maintenance-invoices/${invoiceId}/send`);
  },

  /**
   * Generate monthly
   */
  async generateMonthly(propertyId: string, month: Date) {
    return api.post('/finances/maintenance-invoices/generate-monthly', {
      propertyId,
      month: month.toISOString(),
    });
  },
};

// ==================== PAYMENT CLIENT ====================

export const paymentAPI = {
  /**
   * Initiate payment
   */
  async initiate(data: {
    tenantId: string;
    propertyId: string;
    apartmentId: string;
    rentInvoiceId?: string;
    maintenanceInvoiceId?: string;
    amount: number;
    paymentMethod: string;
    paymentGateway?: string;
  }) {
    return api.post('/finances/payments', data);
  },

  /**
   * Confirm payment
   */
  async confirm(paymentId: string, verified: boolean, failureReason?: string) {
    return api.post(`/finances/payments/${paymentId}/confirm`, {
      verified,
      failureReason,
    });
  },

  /**
   * Get payment
   */
  async getById(paymentId: string) {
    return api.get(`/finances/payments/${paymentId}`);
  },

  /**
   * List payments
   */
  async list(filters?: any) {
    const params = new URLSearchParams();
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined) {
          params.append(key, String(value));
        }
      });
    }
    return api.get(`/finances/payments?${params.toString()}`);
  },

  /**
   * Process refund
   */
  async refund(paymentId: string, refundAmount: number, reason: string) {
    return api.post(`/finances/payments/${paymentId}/refund`, {
      refundAmount,
      reason,
    });
  },

  /**
   * Get statistics
   */
  async getStatistics(propertyId: string, startDate?: Date, endDate?: Date) {
    const params = new URLSearchParams({ propertyId });
    if (startDate) params.append('startDate', startDate.toISOString());
    if (endDate) params.append('endDate', endDate.toISOString());
    return api.get(`/finances/payments/statistics?${params.toString()}`);
  },

  /**
   * Get tenant history
   */
  async getTenantHistory(tenantId: string) {
    return api.get(`/finances/payments/tenant/${tenantId}/history`);
  },
};

// ==================== LATE FEE CLIENT ====================

export const lateFeeAPI = {
  /**
   * Calculate late fee
   */
  async calculate(invoiceId: string, invoiceType: 'RENT' | 'MAINTENANCE', daysOverdue: number) {
    return api.post('/finances/late-fees/calculate', {
      invoiceId,
      invoiceType,
      daysOverdue,
    });
  },

  /**
   * Apply late fee
   */
  async apply(invoiceId: string, invoiceType: 'RENT' | 'MAINTENANCE', lateFeeAmount: number, reason?: string) {
    return api.post('/finances/late-fees/apply', {
      invoiceId,
      invoiceType,
      lateFeeAmount,
      reason,
    });
  },

  /**
   * Waive late fee
   */
  async waive(lateFeeId: string, reason: string, waivedBy: string) {
    return api.post(`/finances/late-fees/${lateFeeId}/waive`, {
      reason,
      waivedBy,
    });
  },

  /**
   * Get tenant late fees
   */
  async getTenantFees(tenantId: string) {
    return api.get(`/finances/late-fees/tenant/${tenantId}`);
  },

  /**
   * Get property summary
   */
  async getPropertySummary(propertyId: string) {
    return api.get(`/finances/late-fees/property/${propertyId}/summary`);
  },
};

// ==================== CONFIGURATION CLIENT ====================

export const configurationAPI = {
  /**
   * Create rent configuration
   */
  async createRentConfig(data: {
    propertyId: string;
    apartmentId?: string;
    rentAmount: number;
    dueDate: number;
    gracePeriodDays?: number;
    lateFeeCalculationMethod?: string;
    lateFeeAmount?: number;
    lateFeePercent?: number;
    lateFeeMaxCap?: number;
    allowPartialPayments?: boolean;
    annualEscalationPercent?: number;
    nextEscalationDate?: Date;
  }) {
    return api.post('/finances/configurations/rent', {
      ...data,
      nextEscalationDate: data.nextEscalationDate?.toISOString(),
    });
  },

  /**
   * Create maintenance fee configuration
   */
  async createMaintenanceConfig(data: {
    propertyId: string;
    apartmentId?: string;
    feeType?: string;
    fixedAmount?: number;
    billingCycle?: string;
    lateFeeCalculationMethod?: string;
    lateFeeAmount?: number;
    lateFeePercent?: number;
    lateFeeMaxCap?: number;
    excludeVacantUnits?: boolean;
    annualEscalationPercent?: number;
    nextEscalationDate?: Date;
  }) {
    return api.post('/finances/configurations/maintenance', {
      ...data,
      nextEscalationDate: data.nextEscalationDate?.toISOString(),
    });
  },

  /**
   * Get rent configuration
   */
  async getRentConfig(configId: string) {
    return api.get(`/finances/configurations/rent/${configId}`);
  },

  /**
   * Get maintenance configuration
   */
  async getMaintenanceConfig(configId: string) {
    return api.get(`/finances/configurations/maintenance/${configId}`);
  },

  /**
   * List rent configurations
   */
  async listRentConfigs(propertyId: string) {
    return api.get(`/finances/configurations/rent/property/${propertyId}`);
  },

  /**
   * List maintenance configurations
   */
  async listMaintenanceConfigs(propertyId: string) {
    return api.get(`/finances/configurations/maintenance/property/${propertyId}`);
  },

  /**
   * Update rent configuration
   */
  async updateRentConfig(configId: string, data: any) {
    return api.patch(`/finances/configurations/rent/${configId}`, data);
  },

  /**
   * Update maintenance configuration
   */
  async updateMaintenanceConfig(configId: string, data: any) {
    return api.patch(`/finances/configurations/maintenance/${configId}`, data);
  },

  /**
   * Delete rent configuration
   */
  async deleteRentConfig(configId: string) {
    return api.delete(`/finances/configurations/rent/${configId}`);
  },

  /**
   * Delete maintenance configuration
   */
  async deleteMaintenanceConfig(configId: string) {
    return api.delete(`/finances/configurations/maintenance/${configId}`);
  },
};

export default {
  rentInvoice: rentInvoiceAPI,
  maintenanceInvoice: maintenanceInvoiceAPI,
  payment: paymentAPI,
  lateFee: lateFeeAPI,
  configuration: configurationAPI,
};
