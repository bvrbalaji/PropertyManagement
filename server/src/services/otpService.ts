import prisma from '../config/database';
import { sendOTPEmail } from './emailService';
import { sendOTPSMS } from './smsService';
import { VerificationType } from '@prisma/client';

const OTP_EXPIRY_MINUTES = 2;
const OTP_LENGTH = 6;

export const generateOTP = (): string => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

export const createVerification = async (
  userId: string,
  type: VerificationType
): Promise<string> => {
  const code = generateOTP();
  const expiresAt = new Date(Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000);

  // Delete any existing unverified codes for this user and type
  await prisma.verification.deleteMany({
    where: {
      userId,
      type,
      verified: false,
    },
  });

  // Create new verification
  await prisma.verification.create({
    data: {
      userId,
      type,
      code,
      expiresAt,
    },
  });

  return code;
};

export const sendVerificationCode = async (
  userId: string,
  type: VerificationType,
  email?: string,
  phone?: string
): Promise<boolean> => {
  const code = await createVerification(userId, type);

  if (type === 'EMAIL' && email) {
    return await sendOTPEmail(email, code);
  } else if (type === 'PHONE' && phone) {
    return await sendOTPSMS(phone, code);
  }

  return false;
};

export const verifyCode = async (
  userId: string,
  code: string,
  type: VerificationType
): Promise<boolean> => {
  const verification = await prisma.verification.findFirst({
    where: {
      userId,
      code,
      type,
      verified: false,
      expiresAt: {
        gt: new Date(),
      },
    },
  });

  if (!verification) {
    return false;
  }

  // Mark as verified
  await prisma.verification.update({
    where: { id: verification.id },
    data: { verified: true },
  });

  // Update user verification status
  if (type === 'EMAIL') {
    await prisma.user.update({
      where: { id: userId },
      data: { emailVerified: true },
    });
  } else if (type === 'PHONE') {
    await prisma.user.update({
      where: { id: userId },
      data: { phoneVerified: true },
    });
  }

  return true;
};
