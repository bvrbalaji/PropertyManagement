import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import prisma from '../config/database';
import { UserRole, UserStatus } from '@prisma/client';
import { AppError } from '../middleware/errorHandler';

const JWT_SECRET = process.env.JWT_SECRET!;
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET!;
const ACCESS_TOKEN_EXPIRY = '15m';
const REFRESH_TOKEN_EXPIRY = '7d';

export const hashPassword = async (password: string): Promise<string> => {
  return bcrypt.hash(password, 12);
};

export const comparePassword = async (
  password: string,
  hashedPassword: string
): Promise<boolean> => {
  return bcrypt.compare(password, hashedPassword);
};

export const generateTokens = (userId: string, role: UserRole) => {
  const accessToken = jwt.sign(
    { userId, role },
    JWT_SECRET,
    { expiresIn: ACCESS_TOKEN_EXPIRY }
  );

  const refreshToken = jwt.sign(
    { userId, role },
    JWT_REFRESH_SECRET,
    { expiresIn: REFRESH_TOKEN_EXPIRY }
  );

  return { accessToken, refreshToken };
};

export const createSession = async (
  userId: string,
  accessToken: string,
  refreshToken: string,
  ipAddress?: string,
  userAgent?: string
) => {
  const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

  await prisma.session.create({
    data: {
      userId,
      token: accessToken,
      refreshToken,
      ipAddress,
      userAgent,
      expiresAt,
    },
  });
};

export const deleteSession = async (token: string) => {
  await prisma.session.deleteMany({
    where: { token },
  });
};

export const deleteAllUserSessions = async (userId: string) => {
  await prisma.session.deleteMany({
    where: { userId },
  });
};

export const findUserByEmailOrPhone = async (emailOrPhone: string) => {
  return prisma.user.findFirst({
    where: {
      OR: [
        { email: emailOrPhone },
        { phone: emailOrPhone },
      ],
    },
  });
};

export const createUserService = async (data: {
  email: string;
  phone?: string;
  password: string;
  fullName: string;
  role: UserRole;
}) => {
  const hashedPassword = await hashPassword(data.password);

  return prisma.user.create({
    data: {
      email: data.email,
      phone: data.phone,
      password: hashedPassword,
      fullName: data.fullName,
      role: data.role,
      status: UserStatus.ACTIVE,
    },
  });
};

export const updateLastLogin = async (userId: string) => {
  await prisma.user.update({
    where: { id: userId },
    data: { lastLoginAt: new Date() },
  });
};
