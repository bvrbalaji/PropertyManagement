import { Request, Response, NextFunction } from 'express';
import { validationResult } from 'express-validator';
import prisma from '../config/database';
import {
  createUserService,
  findUserByEmailOrPhone,
  comparePassword,
  generateTokens,
  createSession,
  deleteSession,
  deleteAllUserSessions,
  updateLastLogin,
} from '../services/authService';
import { sendVerificationCode, verifyCode } from '../services/otpService';
import { sendPasswordResetEmail } from '../services/emailService';
import { AppError } from '../middleware/errorHandler';
import { AuthRequest } from '../middleware/auth';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';

export const register = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { email, phone, password, fullName, role } = req.body;

    // Check if user already exists
    const existingUser = await findUserByEmailOrPhone(email);
    if (existingUser) {
      return next(new AppError('User with this email already exists', 400, 'USER_EXISTS'));
    }

    if (phone) {
      const existingPhone = await findUserByEmailOrPhone(phone);
      if (existingPhone) {
        return next(new AppError('User with this phone already exists', 400, 'PHONE_EXISTS'));
      }
    }

    // Create user
    const user = await createUserService({
      email,
      phone,
      password,
      fullName,
      role,
    });

    // Send verification code
    if (email) {
      await sendVerificationCode(user.id, 'EMAIL', email);
    }
    if (phone) {
      await sendVerificationCode(user.id, 'PHONE', undefined, phone);
    }

    res.status(201).json({
      success: true,
      message: 'User registered successfully. Please verify your email/phone.',
      data: {
        userId: user.id,
        email: user.email,
        phone: user.phone,
        requiresVerification: true,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const login = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    console.log(req.body);
    const { emailOrPhone, password, mfaCode } = req.body;

    // Find user
    const user = await findUserByEmailOrPhone(emailOrPhone);
    if (!user) {
      return next(new AppError('Invalid credentials', 401, 'INVALID_CREDENTIALS'));
    }

    // Check password
    const isPasswordValid = await comparePassword(password, user.password);
    if (!isPasswordValid) {
      return next(new AppError('Invalid credentials', 401, 'INVALID_CREDENTIALS'));
    }

    // Check if user is active
    if (user.status !== 'ACTIVE') {
      return next(new AppError('Account is inactive', 403, 'ACCOUNT_INACTIVE'));
    }

    // Check MFA for admin users
    if (user.role === 'ADMIN' && user.mfaEnabled) {
      if (!mfaCode) {
        return res.status(200).json({
          success: false,
          requiresMFA: true,
          message: 'MFA code required',
        });
      }

      const { verifyMFAToken } = await import('../services/mfaService');
      const isMFACorrect = await verifyMFAToken(user.id, mfaCode);
      if (!isMFACorrect) {
        return next(new AppError('Invalid MFA code', 401, 'INVALID_MFA'));
      }
    }

    // Generate tokens
    const { accessToken, refreshToken } = generateTokens(user.id, user.role);

    // Create session
    const ipAddress = req.ip || req.headers['x-forwarded-for'] as string;
    const userAgent = req.headers['user-agent'];
    await createSession(user.id, accessToken, refreshToken, ipAddress, userAgent);

    // Update last login
    await updateLastLogin(user.id);

    // Set cookies - httpOnly removed to allow client-side JavaScript access
    // Note: This is less secure but necessary for client-side auth state management
    res.cookie('accessToken', accessToken, {
      httpOnly: false, // Changed from true to allow client-side access
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 15 * 60 * 1000, // 15 minutes
      path: '/'
    });

    res.cookie('refreshToken', refreshToken, {
      httpOnly: false, // Changed from true to allow client-side access
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      path: '/'
    });

    // Set userRole and userData cookies for client-side access
    res.cookie('userRole', user.role, {
      httpOnly: false,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 15 * 60 * 1000, // 15 minutes
      path: '/'
    });

    res.cookie('userData', JSON.stringify({
      id: user.id,
      email: user.email,
      phone: user.phone,
      fullName: user.fullName,
      role: user.role,
      mfaEnabled: user.mfaEnabled,
    }), {
      httpOnly: false,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 15 * 60 * 1000, // 15 minutes
      path: '/'
    });

    res.json({
      success: true,
      data: {
        user: {
          id: user.id,
          email: user.email,
          phone: user.phone,
          fullName: user.fullName,
          role: user.role,
          mfaEnabled: user.mfaEnabled,
        },
        accessToken,
        refreshToken,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const verifyOTP = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { userId, code, type } = req.body;

    const isValid = await verifyCode(userId, code, type);
    if (!isValid) {
      return next(new AppError('Invalid or expired verification code', 400, 'INVALID_CODE'));
    }

    res.json({
      success: true,
      message: 'Verification successful',
    });
  } catch (error) {
    next(error);
  }
};

export const logout = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '') || req.cookies?.accessToken;

    if (token) {
      await deleteSession(token);
    }

    // Clear all auth cookies
    res.clearCookie('accessToken');
    res.clearCookie('refreshToken');
    res.clearCookie('userRole');
    res.clearCookie('userData');

    res.json({
      success: true,
      message: 'Logged out successfully',
    });
  } catch (error) {
    next(error);
  }
};

export const refreshToken = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const refreshToken = req.body.refreshToken || req.cookies?.refreshToken;

    if (!refreshToken) {
      return next(new AppError('Refresh token required', 401, 'REFRESH_TOKEN_REQUIRED'));
    }

    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET!) as {
      userId: string;
      role: string;
    };

    // Check if session exists
    const session = await prisma.session.findFirst({
      where: {
        userId: decoded.userId,
        refreshToken,
      },
    });

    if (!session) {
      return next(new AppError('Invalid refresh token', 401, 'INVALID_REFRESH_TOKEN'));
    }

    // Generate new tokens
    const { accessToken, refreshToken: newRefreshToken } = generateTokens(
      decoded.userId,
      decoded.role as any
    );

    // Update session
    await prisma.session.update({
      where: { id: session.id },
      data: {
        token: accessToken,
        refreshToken: newRefreshToken,
        expiresAt: new Date(Date.now() + 15 * 60 * 1000),
      },
    });

    res.cookie('accessToken', accessToken, {
      httpOnly: false, // Changed from true to allow client-side access
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 15 * 60 * 1000,
      path: '/'
    });

    res.json({
      success: true,
      data: {
        accessToken,
        refreshToken: newRefreshToken,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const forgotPassword = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { emailOrPhone } = req.body;

    const user = await findUserByEmailOrPhone(emailOrPhone);
    if (!user) {
      // Don't reveal if user exists
      return res.json({
        success: true,
        message: 'If an account exists, a password reset link has been sent.',
      });
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetTokenExpiry = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    // Store reset token (you might want to create a PasswordReset model)
    // For now, we'll use a simple approach with JWT
    const resetTokenJWT = jwt.sign(
      { userId: user.id, type: 'password-reset' },
      process.env.JWT_SECRET!,
      { expiresIn: '1h' }
    );

    // Send reset email
    const resetLink = `${process.env.FRONTEND_URL}/reset-password?token=${resetTokenJWT}`;
    await sendPasswordResetEmail(user.email, resetLink);

    res.json({
      success: true,
      message: 'If an account exists, a password reset link has been sent.',
    });
  } catch (error) {
    next(error);
  }
};

export const resetPassword = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { token, password } = req.body;

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as {
      userId: string;
      type: string;
    };

    if (decoded.type !== 'password-reset') {
      return next(new AppError('Invalid reset token', 400, 'INVALID_TOKEN'));
    }

    // Update password
    const { hashPassword } = await import('../services/authService');
    const hashedPassword = await hashPassword(password);

    await prisma.user.update({
      where: { id: decoded.userId },
      data: { password: hashedPassword },
    });

    // Delete all sessions
    await deleteAllUserSessions(decoded.userId);

    res.json({
      success: true,
      message: 'Password reset successfully',
    });
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      return next(new AppError('Invalid or expired reset token', 400, 'INVALID_TOKEN'));
    }
    next(error);
  }
};
