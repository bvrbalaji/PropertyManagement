import twilio from 'twilio';

const client = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

export const sendOTPSMS = async (phone: string, code: string): Promise<boolean> => {
  try {
    await client.messages.create({
      body: `Your verification code is: ${code}. This code will expire in 2 minutes.`,
      from: process.env.TWILIO_PHONE_NUMBER,
      to: phone,
    });
    return true;
  } catch (error) {
    console.error('Error sending SMS:', error);
    // In development, log the code instead
    if (process.env.NODE_ENV === 'development') {
      console.log(`[DEV] OTP Code for ${phone}: ${code}`);
    }
    return false;
  }
};
