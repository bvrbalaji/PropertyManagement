import speakeasy from 'speakeasy';
import QRCode from 'qrcode';
import prisma from '../config/database';

export const generateMFASecret = (userId: string, email: string) => {
  const secret = speakeasy.generateSecret({
    name: `Property Management (${email})`,
    issuer: 'Property Management System',
  });

  return {
    secret: secret.base32,
    otpauthUrl: secret.otpauth_url,
  };
};

export const generateQRCode = async (otpauthUrl: string): Promise<string> => {
  try {
    const qrCodeDataURL = await QRCode.toDataURL(otpauthUrl);
    return qrCodeDataURL;
  } catch (error) {
    console.error('Error generating QR code:', error);
    throw new Error('Failed to generate QR code');
  }
};

export const verifyMFAToken = async (
  userId: string,
  token: string
): Promise<boolean> => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { mfaSecret: true },
  });

  if (!user || !user.mfaSecret) {
    return false;
  }

  const verified = speakeasy.totp.verify({
    secret: user.mfaSecret,
    encoding: 'base32',
    token,
    window: 2, // Allow 2 time steps (60 seconds) of tolerance
  });

  return verified;
};

export const enableMFA = async (userId: string, secret: string) => {
  await prisma.user.update({
    where: { id: userId },
    data: {
      mfaEnabled: true,
      mfaSecret: secret,
    },
  });
};

export const disableMFA = async (userId: string) => {
  await prisma.user.update({
    where: { id: userId },
    data: {
      mfaEnabled: false,
      mfaSecret: null,
    },
  });
};
