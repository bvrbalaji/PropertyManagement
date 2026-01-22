import { Request, Response, NextFunction } from 'express';
import { validationResult } from 'express-validator';
import { AuthRequest } from '../middleware/auth';
import { AppError } from '../middleware/errorHandler';
import prisma from '../config/database';
import { createUserService, hashPassword, findUserByEmailOrPhone } from '../services/authService';
import { UserRole, UserStatus } from '@prisma/client';

export const getUsers = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { search, role, status, page = 1, limit = 10 } = req.query;

    const where: any = {};

    if (search) {
      where.OR = [
        { email: { contains: search as string, mode: 'insensitive' } },
        { fullName: { contains: search as string, mode: 'insensitive' } },
        { phone: { contains: search as string, mode: 'insensitive' } },
      ];
    }

    if (role) {
      where.role = role;
    }

    if (status) {
      where.status = status;
    }

    const skip = (Number(page) - 1) * Number(limit);

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        skip,
        take: Number(limit),
        select: {
          id: true,
          email: true,
          phone: true,
          fullName: true,
          role: true,
          status: true,
          emailVerified: true,
          phoneVerified: true,
          mfaEnabled: true,
          createdAt: true,
          lastLoginAt: true,
        },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.user.count({ where }),
    ]);

    res.json({
      success: true,
      data: {
        users,
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total,
          pages: Math.ceil(total / Number(limit)),
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getUser = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;

    // Users can only view their own profile unless they're admin
    if (req.userRole !== 'ADMIN' && req.userId !== id) {
      return next(new AppError('Insufficient permissions', 403, 'INSUFFICIENT_PERMISSIONS'));
    }

    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        phone: true,
        fullName: true,
        role: true,
        status: true,
        emailVerified: true,
        phoneVerified: true,
        mfaEnabled: true,
        createdAt: true,
        updatedAt: true,
        lastLoginAt: true,
      },
    });

    if (!user) {
      return next(new AppError('User not found', 404, 'USER_NOT_FOUND'));
    }

    res.json({
      success: true,
      data: user,
    });
  } catch (error) {
    next(error);
  }
};

export const createUser = async (req: AuthRequest, res: Response, next: NextFunction) => {
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

    const user = await createUserService({
      email,
      phone,
      password,
      fullName,
      role,
    });

    res.status(201).json({
      success: true,
      message: 'User created successfully',
      data: {
        id: user.id,
        email: user.email,
        phone: user.phone,
        fullName: user.fullName,
        role: user.role,
        status: user.status,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const updateUser = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { id } = req.params;
    const { email, phone, fullName, role, status } = req.body;

    const updateData: any = {};

    if (email) {
      const existingUser = await findUserByEmailOrPhone(email);
      if (existingUser && existingUser.id !== id) {
        return next(new AppError('Email already in use', 400, 'EMAIL_EXISTS'));
      }
      updateData.email = email;
    }

    if (phone) {
      const existingUser = await findUserByEmailOrPhone(phone);
      if (existingUser && existingUser.id !== id) {
        return next(new AppError('Phone already in use', 400, 'PHONE_EXISTS'));
      }
      updateData.phone = phone;
    }

    if (fullName) updateData.fullName = fullName;
    if (role) updateData.role = role;
    if (status) updateData.status = status;

    const user = await prisma.user.update({
      where: { id },
      data: updateData,
      select: {
        id: true,
        email: true,
        phone: true,
        fullName: true,
        role: true,
        status: true,
        emailVerified: true,
        phoneVerified: true,
        mfaEnabled: true,
        updatedAt: true,
      },
    });

    res.json({
      success: true,
      message: 'User updated successfully',
      data: user,
    });
  } catch (error) {
    next(error);
  }
};

export const deactivateUser = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;

    if (req.userId === id) {
      return next(new AppError('Cannot deactivate your own account', 400, 'CANNOT_DEACTIVATE_SELF'));
    }

    const user = await prisma.user.update({
      where: { id },
      data: { status: UserStatus.INACTIVE },
    });

    // Delete all sessions
    await prisma.session.deleteMany({
      where: { userId: id },
    });

    res.json({
      success: true,
      message: 'User deactivated successfully',
      data: {
        id: user.id,
        status: user.status,
      },
    });
  } catch (error) {
    next(error);
  }
};
