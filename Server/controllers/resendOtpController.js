const crypto = require('crypto');
const { Resend } = require('resend');
const OTP = require('../model/OTP');
const User = require('../model/User');
const { generateAndHashOTP } = require('../utils/generateOTP');
const fs = require('fs');
const path = require('path');

const resendOtp = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: 'Email required' });

    const user = await User.findOne({ email });
    if (!user || user.isVerified) {
      return res.status(400).json({ message: 'Invalid request' });
    }

    // Check verification window
    if (user.verificationExpiresAt < new Date()) {
      return res.status(400).json({ message: 'Verification expired, please sign up again after 30mins' });
    }

    // Check existing OTP record
    let otpRecord = await OTP.findOne({ email, purpose: 'register' });
    if (otpRecord) {
      // rate limit: 1 per 45 sec
      const now = new Date();
      if (now - otpRecord.lastResendAt < 45 * 1000) {
        return res.status(429).json({ message: 'Please wait before resending OTP' });
      }

      // max 3 resends
      if (otpRecord.resendCount >= otpRecord.maxAttempts) {
        user.verificationExpiresAt = new Date();
        await user.save();

        // also delete any pending OTPs for safety
        await OTP.deleteMany({ email, purpose: 'register' });

        return res.status(429).json(
          { message: `Too many OTP request. 
            For security, Account is frozen for 30 minutes. 
            Try again later.` 
          });
      }

      // delete old OTP
      await OTP.deleteOne({ _id: otpRecord._id });
    }

    // create new OTP
    const { otp, otpHash } = await generateAndHashOTP();
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000);

    await OTP.create({
      email,
      otpHash,
      expiresAt,
      resendCount: otpRecord ? otpRecord.resendCount + 1 : 1,
      lastResendAt: new Date()
    });

    const resend = new Resend(process.env.RESEND_API_KEY);
    const template = fs.readFileSync(
      path.join(__dirname, '..', 'views', 'verificationEmail.html'),
      'utf8'
    );

    await resend.emails.send({
      from: `RecallCode <${process.env.FROM_EMAIL}>`,
      to: email,
      subject: 'Your new OTP code',
      html: template.replace('{{otp}}', otp)
    });

    return res.status(200).json({ message: 'New OTP sent to your email' });
  } catch (err) {
    console.error('Resend OTP error:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
};

module.exports = { resendOtp };
