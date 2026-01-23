import nodemailer from 'nodemailer';
import twilio from 'twilio';

const emailService = require('./emailService');
const smsService = require('./smsService');

export interface AccessCredentials {
  email: string;
  phone: string;
  username: string;
  password: string;
  parkingSlotNumber: string;
}

export interface NotificationData {
  tenantId: string;
  email: string;
  phone: string;
  tenantName: string;
  apartmentNumber: string;
  propertyName: string;
  moveInDate: string;
  credentials?: AccessCredentials;
  parkingDetails?: any;
  propertyGuidelines?: string;
}

export class TenantNotificationService {
  /**
   * Send welcome email with access credentials
   */
  async sendWelcomeEmail(data: NotificationData) {
    try {
      const emailContent = `
        <h2>Welcome to ${data.propertyName}!</h2>
        <p>Dear ${data.tenantName},</p>
        
        <p>Congratulations on your successful onboarding! We're delighted to have you as our resident.</p>
        
        <h3>Move-In Details</h3>
        <ul>
          <li><strong>Flat Number:</strong> ${data.apartmentNumber}</li>
          <li><strong>Move-In Date:</strong> ${data.moveInDate}</li>
          <li><strong>Property:</strong> ${data.propertyName}</li>
        </ul>
        
        <h3>Access Credentials</h3>
        ${
          data.credentials
            ? `
          <ul>
            <li><strong>Email:</strong> ${data.credentials.email}</li>
            <li><strong>Username:</strong> ${data.credentials.username}</li>
            <li><strong>Temporary Password:</strong> ${data.credentials.password}</li>
          </ul>
          <p><em>Please change your password on your first login.</em></p>
        `
            : ''
        }
        
        ${
          data.parkingDetails
            ? `
          <h3>Parking Details</h3>
          <ul>
            <li><strong>Parking Slot:</strong> ${data.parkingDetails.slotNumber}</li>
            <li><strong>Floor:</strong> ${data.parkingDetails.floor || 'N/A'}</li>
          </ul>
        `
            : ''
        }
        
        <h3>Property Guidelines</h3>
        <p>${data.propertyGuidelines || 'Please refer to the property guidelines provided during your onboarding.'}</p>
        
        <p>If you have any questions or need assistance, please don't hesitate to contact us.</p>
        
        <p>Best regards,<br/>Property Management Team</p>
      `;

      await emailService.sendEmail(
        data.email,
        `Welcome to ${data.propertyName}`,
        emailContent,
      );

      return {
        success: true,
        message: 'Welcome email sent successfully',
      };
    } catch (error) {
      return {
        success: false,
        error:
          error instanceof Error ? error.message : 'Failed to send email',
      };
    }
  }

  /**
   * Send welcome SMS with access credentials
   */
  async sendWelcomeSMS(data: NotificationData) {
    try {
      const message = `Welcome to ${data.propertyName}! Your move-in is on ${data.moveInDate}. Flat: ${data.apartmentNumber}. ${
        data.credentials
          ? `Login: ${data.credentials.username}. `
          : ''
      }${data.parkingDetails ? `Parking: ${data.parkingDetails.slotNumber}. ` : ''}Check email for full details.`;

      await smsService.sendSMS(data.phone, message);

      return {
        success: true,
        message: 'Welcome SMS sent successfully',
      };
    } catch (error) {
      return {
        success: false,
        error:
          error instanceof Error ? error.message : 'Failed to send SMS',
      };
    }
  }

  /**
   * Send onboarding completion notification
   */
  async sendOnboardingCompletionNotification(data: NotificationData) {
    try {
      await this.sendWelcomeEmail(data);
      await this.sendWelcomeSMS(data);

      return {
        success: true,
        message: 'Onboarding completion notifications sent successfully',
      };
    } catch (error) {
      return {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : 'Failed to send notifications',
      };
    }
  }

  /**
   * Send offboarding initiation notification
   */
  async sendOffboardingInitiationNotification(data: NotificationData) {
    try {
      const emailContent = `
        <h2>Move-Out Request Received</h2>
        <p>Dear ${data.tenantName},</p>
        
        <p>We have received your move-out request for ${data.apartmentNumber} at ${data.propertyName}.</p>
        
        <h3>Next Steps</h3>
        <ol>
          <li>A move-out inspection will be scheduled within the next 7 days</li>
          <li>Please ensure the flat is in good condition for inspection</li>
          <li>Final settlement will be calculated after inspection</li>
          <li>Refunds will be processed within 5 business days</li>
        </ol>
        
        <p>Thank you for being a valued resident. We hope to see you again in the future!</p>
        
        <p>Best regards,<br/>Property Management Team</p>
      `;

      await emailService.sendEmail(
        data.email,
        'Move-Out Request Confirmation',
        emailContent,
      );

      const smsMessage = `Your move-out request for ${data.apartmentNumber} has been received. Inspection will be scheduled soon.`;
      await smsService.sendSMS(data.phone, smsMessage);

      return {
        success: true,
        message: 'Offboarding initiation notifications sent successfully',
      };
    } catch (error) {
      return {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : 'Failed to send notifications',
      };
    }
  }

  /**
   * Send inspection scheduled notification
   */
  async sendInspectionScheduledNotification(
    email: string,
    phone: string,
    inspectionDate: string,
    inspectionTime: string,
  ) {
    try {
      const emailContent = `
        <h2>Inspection Scheduled</h2>
        <p>Your flat inspection has been scheduled.</p>
        
        <h3>Inspection Details</h3>
        <ul>
          <li><strong>Date:</strong> ${inspectionDate}</li>
          <li><strong>Time:</strong> ${inspectionTime}</li>
        </ul>
        
        <p>Please ensure you are available at the scheduled time.</p>
      `;

      await emailService.sendEmail(
        email,
        'Inspection Scheduled',
        emailContent,
      );

      const smsMessage = `Your flat inspection is scheduled for ${inspectionDate} at ${inspectionTime}.`;
      await smsService.sendSMS(phone, smsMessage);

      return {
        success: true,
        message: 'Inspection scheduled notifications sent successfully',
      };
    } catch (error) {
      return {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : 'Failed to send notifications',
      };
    }
  }

  /**
   * Send refund notification
   */
  async sendRefundNotification(
    email: string,
    phone: string,
    refundAmount: number,
    currency: string = 'INR',
  ) {
    try {
      const emailContent = `
        <h2>Refund Processed</h2>
        <p>Your security deposit refund has been processed successfully.</p>
        
        <h3>Refund Details</h3>
        <ul>
          <li><strong>Amount:</strong> ${currency} ${refundAmount}</li>
          <li><strong>Status:</strong> Processed</li>
          <li><strong>Timeline:</strong> The amount will be credited within 5 business days</li>
        </ul>
        
        <p>Thank you for your cooperation during the offboarding process.</p>
      `;

      await emailService.sendEmail(email, 'Refund Processed', emailContent);

      const smsMessage = `Your refund of ${currency} ${refundAmount} has been processed and will be credited within 5 business days.`;
      await smsService.sendSMS(phone, smsMessage);

      return {
        success: true,
        message: 'Refund notifications sent successfully',
      };
    } catch (error) {
      return {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : 'Failed to send notifications',
      };
    }
  }

  /**
   * Send clearance certificate notification
   */
  async sendClearanceCertificateNotification(
    email: string,
    phone: string,
    tenantName: string,
    certificateUrl: string,
  ) {
    try {
      const emailContent = `
        <h2>Clearance Certificate Issued</h2>
        <p>Dear ${tenantName},</p>
        
        <p>Your clearance certificate has been issued successfully!</p>
        
        <p>You can download your certificate <a href="${certificateUrl}">here</a>.</p>
        
        <p>Please keep this certificate safe for future reference.</p>
        
        <p>Best regards,<br/>Property Management Team</p>
      `;

      await emailService.sendEmail(
        email,
        'Clearance Certificate Issued',
        emailContent,
      );

      const smsMessage = `Your clearance certificate has been issued. Check your email for details.`;
      await smsService.sendSMS(phone, smsMessage);

      return {
        success: true,
        message: 'Clearance certificate notifications sent successfully',
      };
    } catch (error) {
      return {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : 'Failed to send notifications',
      };
    }
  }

  /**
   * Send owner vacancy notification
   */
  async sendOwnerVacancyNotification(
    ownerEmail: string,
    ownerPhone: string,
    ownerName: string,
    apartmentNumber: string,
    propertyName: string,
  ) {
    try {
      const emailContent = `
        <h2>Flat Vacancy Notification</h2>
        <p>Dear ${ownerName},</p>
        
        <p>Please be informed that ${apartmentNumber} at ${propertyName} is now vacant and available for new tenant onboarding.</p>
        
        <p>Please update the property listing to start the tenant search process.</p>
        
        <p>Best regards,<br/>Property Management Team</p>
      `;

      await emailService.sendEmail(
        ownerEmail,
        'Flat Vacancy Notification',
        emailContent,
      );

      const smsMessage = `${apartmentNumber} at ${propertyName} is now vacant and available for new tenants.`;
      await smsService.sendSMS(ownerPhone, smsMessage);

      return {
        success: true,
        message: 'Owner vacancy notifications sent successfully',
      };
    } catch (error) {
      return {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : 'Failed to send notifications',
      };
    }
  }
}

export default new TenantNotificationService();
