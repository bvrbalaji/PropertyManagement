import { Request, Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/auth';
import { AppError } from '../middleware/errorHandler';
import prisma from '../config/database';
import { validationResult } from 'express-validator';

export const getAllProperties = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    if (!req.userId) {
      return next(new AppError('Authentication required', 401, 'AUTH_REQUIRED'));
    }

    const { page = 1, limit = 10, search, ownerId } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    const where: any = {
      adminId: req.userId,
    };

    if (search) {
      where.OR = [
        { name: { contains: String(search), mode: 'insensitive' } },
        { address: { contains: String(search), mode: 'insensitive' } },
      ];
    }

    if (ownerId) {
      where.ownerId = String(ownerId);
    }

    const [properties, total] = await Promise.all([
      prisma.property.findMany({
        where,
        include: {
          owner: {
            select: {
              id: true,
              fullName: true,
              email: true,
              phone: true,
            },
          },
          _count: {
            select: {
              apartments: true,
              tenantAssignments: true,
              maintenanceRequests: true,
            },
          },
        },
        skip,
        take: Number(limit),
        orderBy: { createdAt: 'desc' },
      }),
      prisma.property.count({ where }),
    ]);

    res.json({
      success: true,
      data: {
        properties,
        pagination: {
          total,
          page: Number(page),
          limit: Number(limit),
          pages: Math.ceil(total / Number(limit)),
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getPropertyById = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    if (!req.userId) {
      return next(new AppError('Authentication required', 401, 'AUTH_REQUIRED'));
    }

    const { id } = req.params;

    const property = await prisma.property.findUnique({
      where: { id },
      include: {
        owner: {
          select: {
            id: true,
            fullName: true,
            email: true,
            phone: true,
          },
        },
        apartments: {
          include: {
            tenantAssignments: {
              where: { isActive: true },
              include: {
                tenant: {
                  select: {
                    id: true,
                    fullName: true,
                    email: true,
                    phone: true,
                  },
                },
              },
            },
          },
        },
        maintenanceRequests: {
          orderBy: { createdAt: 'desc' },
          take: 10,
          include: {
            apartment: true,
            tenant: {
              select: {
                id: true,
                fullName: true,
              },
            },
          },
        },
        parkingSlots: true,
        _count: {
          select: {
            apartments: true,
            tenantAssignments: true,
            maintenanceRequests: true,
          },
        },
      },
    });

    if (!property) {
      return next(new AppError('Property not found', 404, 'PROPERTY_NOT_FOUND'));
    }

    if (property.adminId !== req.userId) {
      return next(new AppError('Not authorized to access this property', 403, 'UNAUTHORIZED'));
    }

    res.json({
      success: true,
      data: property,
    });
  } catch (error) {
    next(error);
  }
};

export const createProperty = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    if (!req.userId) {
      return next(new AppError('Authentication required', 401, 'AUTH_REQUIRED'));
    }

    const { name, address, ownerId } = req.body;

    // Verify owner exists if provided
    if (ownerId) {
      const owner = await prisma.user.findUnique({
        where: { id: ownerId },
      });

      if (!owner) {
        return next(new AppError('Owner not found', 404, 'OWNER_NOT_FOUND'));
      }
    }

    const property = await prisma.property.create({
      data: {
        name,
        address,
        adminId: req.userId,
        ...(ownerId && { ownerId }),
      },
      include: {
        owner: {
          select: {
            id: true,
            fullName: true,
            email: true,
          },
        },
      },
    });

    res.status(201).json({
      success: true,
      message: 'Property created successfully',
      data: property,
    });
  } catch (error) {
    next(error);
  }
};

export const updateProperty = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    if (!req.userId) {
      return next(new AppError('Authentication required', 401, 'AUTH_REQUIRED'));
    }

    const { id } = req.params;
    const { name, address, ownerId } = req.body;

    const property = await prisma.property.findUnique({
      where: { id },
    });

    if (!property) {
      return next(new AppError('Property not found', 404, 'PROPERTY_NOT_FOUND'));
    }

    if (property.adminId !== req.userId) {
      return next(new AppError('Not authorized to update this property', 403, 'UNAUTHORIZED'));
    }

    // Verify owner exists if provided
    if (ownerId && ownerId !== property.ownerId) {
      const owner = await prisma.user.findUnique({
        where: { id: ownerId },
      });

      if (!owner) {
        return next(new AppError('Owner not found', 404, 'OWNER_NOT_FOUND'));
      }
    }

    const updatedProperty = await prisma.property.update({
      where: { id },
      data: {
        ...(name && { name }),
        ...(address && { address }),
        ...(ownerId !== undefined && { ownerId: ownerId || null }),
      },
      include: {
        owner: {
          select: {
            id: true,
            fullName: true,
            email: true,
          },
        },
        _count: {
          select: {
            apartments: true,
            tenantAssignments: true,
          },
        },
      },
    });

    res.json({
      success: true,
      message: 'Property updated successfully',
      data: updatedProperty,
    });
  } catch (error) {
    next(error);
  }
};

export const deleteProperty = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    if (!req.userId) {
      return next(new AppError('Authentication required', 401, 'AUTH_REQUIRED'));
    }

    const { id } = req.params;

    const property = await prisma.property.findUnique({
      where: { id },
    });

    if (!property) {
      return next(new AppError('Property not found', 404, 'PROPERTY_NOT_FOUND'));
    }

    if (property.adminId !== req.userId) {
      return next(new AppError('Not authorized to delete this property', 403, 'UNAUTHORIZED'));
    }

    // Check if property has active tenants
    const activeTenants = await prisma.tenantAssignment.count({
      where: {
        apartment: {
          propertyId: id,
        },
        isActive: true,
      },
    });

    if (activeTenants > 0) {
      return next(new AppError('Cannot delete property with active tenants', 400, 'ACTIVE_TENANTS_EXIST'));
    }

    await prisma.property.delete({
      where: { id },
    });

    res.json({
      success: true,
      message: 'Property deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

export const getPropertyStats = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    if (!req.userId) {
      return next(new AppError('Authentication required', 401, 'AUTH_REQUIRED'));
    }

    const [properties, totalApartments, activeLeases, maintenanceRequests] = await Promise.all([
      prisma.property.count({
        where: { adminId: req.userId },
      }),
      prisma.apartment.count({
        where: {
          property: {
            adminId: req.userId,
          },
        },
      }),
      prisma.tenantAssignment.count({
        where: {
          apartment: {
            property: {
              adminId: req.userId,
            },
          },
          isActive: true,
        },
      }),
      prisma.maintenanceRequest.count({
        where: {
          property: {
            adminId: req.userId,
          },
        },
      }),
    ]);

    res.json({
      success: true,
      data: {
        totalProperties: properties,
        totalApartments,
        activeLeases,
        totalMaintenanceRequests: maintenanceRequests,
      },
    });
  } catch (error) {
    next(error);
  }
};
