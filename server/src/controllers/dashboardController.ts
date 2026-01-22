import { Request, Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/auth';
import { AppError } from '../middleware/errorHandler';
import prisma from '../config/database';

export const getAdminDashboard = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    if (!req.userId) {
      return next(new AppError('Authentication required', 401, 'AUTH_REQUIRED'));
    }

    const [totalUsers, totalProperties, activeSessions, properties] = await Promise.all([
      prisma.user.count(),
      prisma.property.count({
        where: { adminId: req.userId },
      }),
      prisma.session.count({
        where: {
          expiresAt: { gt: new Date() },
        },
      }),
      prisma.property.findMany({
        where: { adminId: req.userId },
        include: {
          _count: {
            select: {
              apartments: true,
              maintenanceRequests: true,
            },
          },
        },
        take: 10,
        orderBy: { createdAt: 'desc' },
      }),
    ]);

    res.json({
      success: true,
      data: {
        stats: {
          totalUsers,
          totalProperties,
          activeSessions,
        },
        properties,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getFlatOwnerDashboard = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    if (!req.userId) {
      return next(new AppError('Authentication required', 401, 'AUTH_REQUIRED'));
    }

    const [properties, maintenanceRequests] = await Promise.all([
      prisma.property.findMany({
        where: { ownerId: req.userId },
        include: {
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
        },
      }),
      prisma.maintenanceRequest.findMany({
        where: {
          property: {
            ownerId: req.userId,
          },
        },
        include: {
          apartment: true,
          tenant: {
            select: {
              id: true,
              fullName: true,
              email: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        take: 10,
      }),
    ]);

    res.json({
      success: true,
      data: {
        properties,
        maintenanceRequests,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getTenantDashboard = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    if (!req.userId) {
      return next(new AppError('Authentication required', 401, 'AUTH_REQUIRED'));
    }

    const [tenantAssignment, maintenanceRequests] = await Promise.all([
      prisma.tenantAssignment.findFirst({
        where: {
          tenantId: req.userId,
          isActive: true,
        },
        include: {
          apartment: {
            include: {
              property: {
                include: {
                  owner: {
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
        },
      }),
      prisma.maintenanceRequest.findMany({
        where: {
          tenantId: req.userId,
        },
        include: {
          apartment: true,
          property: true,
          staff: {
            select: {
              id: true,
              fullName: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        take: 10,
      }),
    ]);

    res.json({
      success: true,
      data: {
        apartment: tenantAssignment?.apartment,
        property: tenantAssignment?.apartment?.property,
        owner: tenantAssignment?.apartment?.property?.owner,
        maintenanceRequests,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getMaintenanceDashboard = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    if (!req.userId) {
      return next(new AppError('Authentication required', 401, 'AUTH_REQUIRED'));
    }

    const [pendingRequests, assignedRequests, completedRequests] = await Promise.all([
      prisma.maintenanceRequest.findMany({
        where: {
          status: 'PENDING',
          staffId: null,
        },
        include: {
          apartment: true,
          property: true,
          tenant: {
            select: {
              id: true,
              fullName: true,
              email: true,
              phone: true,
            },
          },
        },
        orderBy: [
          { priority: 'desc' },
          { createdAt: 'asc' },
        ],
        take: 20,
      }),
      prisma.maintenanceRequest.findMany({
        where: {
          staffId: req.userId,
          status: { in: ['ASSIGNED', 'IN_PROGRESS'] },
        },
        include: {
          apartment: true,
          property: true,
          tenant: {
            select: {
              id: true,
              fullName: true,
              email: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        take: 20,
      }),
      prisma.maintenanceRequest.findMany({
        where: {
          staffId: req.userId,
          status: 'COMPLETED',
        },
        include: {
          apartment: true,
          property: true,
        },
        orderBy: { resolvedAt: 'desc' },
        take: 10,
      }),
    ]);

    res.json({
      success: true,
      data: {
        pendingRequests,
        assignedRequests,
        completedRequests,
        stats: {
          pending: pendingRequests.length,
          assigned: assignedRequests.length,
          completed: completedRequests.length,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};
