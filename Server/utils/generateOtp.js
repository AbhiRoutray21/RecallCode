import crypto from 'crypto';

export function generateAndHashOTP(length = 6) {
  const min = 10 ** (length - 1);
  const max = 10 ** length - 1;
  const otp = String(crypto.randomInt(min, max + 1));

  const secret = process.env.OTP_HMAC_SECRET; // store securely in env
  const otpHash = crypto.createHmac('sha256', secret).update(otp).digest('hex');

  return { otp, otpHash };
}