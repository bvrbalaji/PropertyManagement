import { Request, Response, NextFunction } from 'express';
import { validationResult } from 'express-validator';
import { AuthRequest } from '../middleware/auth';
import { generateMFASecret, generateQRCode, verifyMFAToken, enableMFA, disableMFA } from '../services/mfaService';
import { AppError } from '../middleware/errorHandler';
import prisma from '../config/database';

export const setupMFA = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    if (!req.userId || !req.user) {
      return next(new AppError('Authentication required', 401, 'AUTH_REQUIRED'));
    }

    const user = await prisma.user.findUnique({
      where: { id: req.userId },
      select: { email: true, mfaEnabled: true },
    });

    if (!user) {
      return next(new AppError('User not found', 404, 'USER_NOT_FOUND'));
    }

    if (user.mfaEnabled) {
      return next(new AppError('MFA is already enabled', 400, 'MFA_ALREADY_ENABLED'));
    }

    // Generate MFA secret
    const { secret, otpauthUrl } = generateMFASecret(req.userId, user.email);

    // Generate QR code
    const qrCode = await generateQRCode(otpauthUrl);

    res.json({
      success: true,
      data: {
        secret,
        qrCode,
        otpauthUrl,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const verifyMFA = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    if (!req.userId) {
      return next(new AppError('Authentication required', 401, 'AUTH_REQUIRED'));
    }

    const { code, secret } = req.body;

    // If secret is provided, this is the initial setup verification
    if (secret) {
      // For initial setup, verify against the provided secret
      const speakeasy = require('speakeasy');
      const verified = speakeasy.totp.verify({
        secret: secret,
        encoding: 'base32',
        token: code,
        window: 2,
      });

      if (!verified) {
        return next(new AppError('Invalid MFA code', 400, 'INVALID_MFA_CODE'));
      }

      // Enable MFA
      await enableMFA(req.userId, secret);
    } else {
      // Verify existing MFA
      const isValid = await verifyMFAToken(req.userId, code);
      if (!isValid) {
        return next(new AppError('Invalid MFA code', 400, 'INVALID_MFA_CODE'));
      }

      // Set MFA verified in session
      if (req.session) {
        req.session.mfaVerified = true;
      }
    }

    res.json({
      success: true,
      message: 'MFA verified successfully',
    });
  } catch (error) {
    next(error);
  }
};

export const disableMFA = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    if (!req.userId) {
      return next(new AppError('Authentication required', 401, 'AUTH_REQUIRED'));
    }

    const { disableMFA: disableMFAService } = await import('../services/mfaService');
    await disableMFAService(req.userId);

    res.json({
      success: true,
      message: 'MFA disabled successfully',
    });
  } catch (error) {
    next(error);
  }
};
