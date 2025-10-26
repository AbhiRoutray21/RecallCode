const crypto = require('crypto');
const OTP = require('../model/OTP.js');
const User = require('../model/User.js');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');

//CONFIG
const ACCESS_TOKEN_TTL = '10min';
const REFRESH_TOKEN_TTL = '7d';
const isProduction = process.env.NODE_ENV === 'production';
const MAX_COOKIE_AGE = 7 * 24 * 60 * 60 * 1000; // 7 days
const REFRESH_TOKEN_COOKIE_NAME = 'secure_t';

// constant-time compare function
function safeCompare(a, b) {
  if (a.length !== b.length) return false;
  return crypto.timingSafeEqual(Buffer.from(a), Buffer.from(b));
}

// helper to issue tokens
function signAccessToken(user) {
  return jwt.sign(
    {
      UserInfo: {
        id: user._id.toString(),
        roles: Object.values(user.roles.toObject() || {}).filter(Boolean)
      }
    },
    process.env.ACCESS_TOKEN_SECRET,
    { expiresIn: ACCESS_TOKEN_TTL}
  );
}

function signRefreshToken(userId, tid) {
  // Store tid in token so we can find it later without storing whole JWT
  return jwt.sign({ id: userId.toString(), tid }, process.env.REFRESH_TOKEN_SECRET, { expiresIn: REFRESH_TOKEN_TTL });
}

const verifyOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;
    if (!email || !otp) {
      return res.status(400).json({ message: 'Email and OTP are required' });
    }
    
    // find OTP record
    const otpRecord = await OTP.findOne({ email, purpose: 'register' });
    if (!otpRecord) {
      return res.status(400).json({ message: 'Invalid or expired OTP' });
    }

    // check expiry
    if (otpRecord.expiresAt < new Date()) {
      return res.status(400).json({ message: 'OTP expired, please request a new OTP' });
    }

    // check attempt limit
    if (otpRecord.attempts >= 4) {
      return res.status(429).json({ message: 'Too many failed attempts, please request a new OTP' });
    }

    // hash the provided OTP with same secret
    const secret = process.env.OTP_HMAC_SECRET;
    const otpHash = crypto.createHmac('sha256', secret).update(otp).digest('hex');

    // verify using constant-time comparison
    if (!safeCompare(otpHash, otpRecord.otpHash)) {
      otpRecord.attempts += 1;
      await otpRecord.save();
      return res.status(400).json({ message: 'Invalid OTP' });
    }

    // OTP is valid → mark user as verified
    await User.updateOne(
      { email },
      { 
        $set: { isVerified: true },
        $unset: { verificationExpiresAt: "" } 
      });

    // delete OTP entry (one-time use)
    await OTP.deleteOne({ _id: otpRecord._id });

    const user = await User.findOne({email});

    // create JWTs
    const newTid = uuidv4();
    const newRefreshToken = signRefreshToken(user._id, newTid);
    const accessToken = signAccessToken(user);

    // Attach new tid and save user
    user.refreshTokenIds = [...user.refreshTokenIds, newTid];
    await user.save();

    // Creates Secure Cookie with refresh token
    res.cookie(REFRESH_TOKEN_COOKIE_NAME, newRefreshToken, {
      httpOnly: true,
      domain: process.env.COOKIE_DOMAIN_NAME,
      secure: isProduction, // only send over HTTPS in production
      sameSite: isProduction ? 'None' : 'Lax', // change to 'None' if cross-site and ensure secure:true
      maxAge: MAX_COOKIE_AGE
    });

    // Send authorization roles and access token to user
    res.status(200).json({ 
      accessToken, 
      name:user.name,
      message: 'Email verified successfully' 
    });

  } catch (err) {
    console.error('Verify OTP error:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
};

module.exports = { verifyOtp };
