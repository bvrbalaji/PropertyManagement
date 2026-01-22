import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import prisma from '../config/database';
import { AppError } from './errorHandler';
import { UserRole } from '@prisma/client';

export interface AuthRequest extends Request {
  userId?: string;
  userRole?: UserRole;
  user?: any;
}

export const authenticate = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '') || 
                  req.cookies?.accessToken;

    if (!token) {
      throw new AppError('Authentication required', 401, 'AUTH_REQUIRED');
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { userId: string };
    
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: {
        id: true,
        email: true,
        phone: true,
        fullName: true,
        role: true,
        status: true,
        mfaEnabled: true,
      },
    });

    if (!user || user.status !== 'ACTIVE') {
      throw new AppError('User not found or inactive', 401, 'USER_INACTIVE');
    }

    req.userId = user.id;
    req.userRole = user.role;
    req.user = user;

    next();
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      return next(new AppError('Invalid token', 401, 'INVALID_TOKEN'));
    }
    next(error);
  }
};

export const authorize = (...roles: UserRole[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.userRole) {
      return next(new AppError('Authentication required', 401, 'AUTH_REQUIRED'));
    }

    if (!roles.includes(req.userRole)) {
      return next(
        new AppError('Insufficient permissions', 403, 'INSUFFICIENT_PERMISSIONS')
      );
    }

    next();
  };
};

export const requireMFA = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user) {
      return next(new AppError('Authentication required', 401, 'AUTH_REQUIRED'));
    }

    // Check if user is admin and MFA is required
    if (req.user.role === 'ADMIN' && req.user.mfaEnabled) {
      const mfaVerified = req.session?.mfaVerified;
      
      if (!mfaVerified) {
        return res.status(403).json({
          success: false,
          error: {
            message: 'MFA verification required',
            code: 'MFA_REQUIRED',
          },
        });
      }
    }

    next();
  } catch (error) {
    next(error);
  }
};
