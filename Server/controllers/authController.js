const User = require('../model/User');
const bcrypt = require('bcrypt');
const OTP = require('../model/OTP');
const { Resend } = require('resend');
const jwt = require('jsonwebtoken');
const { generateAndHashOTP } = require('../utils/generateOTP');
const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

// CONFIG
const MAX_FAILED_ATTEMPTS = 5;
const LOCK_TIME_MINUTES = 15;
const OTP_TTL_MS = 5 * 60 * 1000; // 5 minutes
const isProduction = process.env.NODE_ENV === 'production';
const ACCESS_TOKEN_TTL = '10min';
const REFRESH_TOKEN_TTL = '7d';
const MAX_COOKIE_AGE = 7 * 24 * 60 * 60 * 1000; // 7 days
const REFRESH_TOKEN_COOKIE_NAME = 'secure_t';

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
    { expiresIn: ACCESS_TOKEN_TTL }
  );
}

function signRefreshToken(userId, tid) {
  // Store tid in token so we can find it later without storing whole JWT
  return jwt.sign({ id: userId.toString(), tid }, process.env.REFRESH_TOKEN_SECRET, { expiresIn: REFRESH_TOKEN_TTL });
}

const handleLogin = async (req, res) => {
  try {
    const cookies = req.cookies || {};
    const { email, password } = req.body || {};

    // Basic validation
    if (!email || !password) return res.status(400).json({ message: 'Email and password are required.' });
    if (typeof email !== 'string' || typeof password !== 'string') return res.status(400).json({ message: 'Invalid input.' });

    const foundUser = await User.findOne({ email }).exec();
    // Do not reveal whether email exists — return a generic unauthorized message for both cases.
    if (!foundUser) {
      // Optional: log an auth attempt for monitoring
      return res.status(401).json({ message: 'Invalid credentials.' });
    }

    // Account lockout due to too otp spam during verification.
    if(foundUser.verificationExpiresAt && foundUser.verificationExpiresAt < new Date()){ 
      return res.status(403).json({ message: 'Your account is temporarily locked, please try again later.' }); 
    }

    // Account lockout by time window due to faild password attemps.
    if (foundUser.lockUntil && foundUser.lockUntil > new Date()) {
      return res.status(423).json({ message: `Account locked. Try again after 15 minutes.` });
    }

    // If user is unverified - resend OTP flow (with limits)
    if (!foundUser.isVerified) {
      // If verificationExpiresAt exists and is past, treat as allowed to request verification again (or locked depending on policy)
      // We'll respect an OTP resend limit in the OTP collection
      let otpRecord = await OTP.findOne({ email, purpose: 'register' }).exec();

      const now = new Date();

      // Enforce a maximum resend frequency / count
      if (otpRecord && otpRecord.resendCount >= otpRecord.maxAttempts ) {
         foundUser.verificationExpiresAt = new Date();
         await foundUser.save();
        
        // also delete any pending OTPs for safety
        await OTP.deleteMany({ email, purpose: 'register' })

        return res.status(429).json({ message: `Too many OTP request. 
            For security, Account is frozen for 30 minutes. 
            Try again later.`});
      }

      // Remove old OTP (if any) and create a new one
      if (otpRecord) {
        await OTP.deleteOne({ _id: otpRecord._id });
      }

      const { otp, otpHash } = await generateAndHashOTP(); // returns { otp, otpHash }
      const expiresAt = new Date(Date.now() + OTP_TTL_MS);

      await OTP.create({
        email,
        otpHash,
        expiresAt,
        purpose: 'register',
        resendCount: otpRecord ? (otpRecord.resendCount + 1) : 1,
        lastResendAt: now
      });

      // Send verification email (using template)
      const resend = new Resend(process.env.RESEND_API_KEY);
      const template = fs.readFileSync(path.join(__dirname, '..', 'views', 'verificationEmail.html'), 'utf8');

      await resend.emails.send({
        from: `RecallCode <${process.env.FROM_EMAIL}>`,
        to: email,
        subject: 'Verify your account',
        html: template.replace('{{otp}}', otp)
      });

      return res.status(409).json({ message: 'Account not verified. A verification code has been sent to your email.' });
    }

    // Compare password
    const match = await bcrypt.compare(password, foundUser.password);
    if (!match) {
      // Increment failed attempts and possibly lock account
      foundUser.failedLoginAttempts = (foundUser.failedLoginAttempts || 0) + 1;
      if (foundUser.failedLoginAttempts >= MAX_FAILED_ATTEMPTS) {
        foundUser.lockUntil = new Date(Date.now() + LOCK_TIME_MINUTES * 60 * 1000);
        foundUser.failedLoginAttempts = 0; // reset after locking
      }
      await foundUser.save();
      return res.status(401).json({ message: 'Invalid credentials.' });
    }

    // Successful login -> reset failed attempts
    foundUser.failedLoginAttempts = 0;
    foundUser.lockUntil = null;

    // ===== Refresh token rotation + reuse detection using token ids (tid) =====
    // Maximum number of stored tokens (e.g., 5 devices)
    const MAX_STORED_REFRESH_TOKENS = 5;
    if (foundUser.refreshTokenIds.length >= MAX_STORED_REFRESH_TOKENS) {
      foundUser.refreshTokenIds = foundUser.refreshTokenIds.slice(1,MAX_STORED_REFRESH_TOKENS);
    }

    const incomingCookie = cookies[REFRESH_TOKEN_COOKIE_NAME];

    // Build new token id and refresh token
    const newTid = uuidv4();
    const newRefreshToken = signRefreshToken(foundUser._id, newTid);
    const accessToken = signAccessToken(foundUser);

    // Normalize stored RT array
    foundUser.refreshTokenIds = foundUser.refreshTokenIds || []; // array of tid strings

    // If there is an incoming cookie, try to detect reuse
    if (incomingCookie) {
      try {
        // decode the cookie to read tid (we don't need to verify signature to read tid, but we will attempt verify)
        const decoded = jwt.decode(incomingCookie);
        const incomingTid = decoded && decoded.tid ? decoded.tid : null;

        // Find a user that has that tid (should usually be the same user)
        const tokenOwner = incomingTid ? await User.findOne({ refreshTokenIds: incomingTid }).exec() : null;

        if (!tokenOwner) {
          // Reuse detected: the cookie holds a tid that isn't present in DB.
          // Clear all stored refresh tokens for this user (force logout everywhere)
          foundUser.refreshTokenIds = [];
          // also optionally revoke sessions, update security logs, send alert email to user
          console.warn('Refresh token reuse detected for user:', foundUser.email);
        } else {
          // Remove the incomingTid from wherever it was stored (we're rotating)
          foundUser.refreshTokenIds = foundUser.refreshTokenIds.filter(tid => tid !== incomingTid);
        }
      } catch (err) {
        // decode could fail or token malformed - be conservative and clear all previous tokens
        foundUser.refreshTokenIds = [];
      }

      // Clear the cookie from browser regardless (to prevent the old value persisting)
      res.clearCookie(REFRESH_TOKEN_COOKIE_NAME, {
        httpOnly: true,
        domain: process.env.COOKIE_DOMAIN_NAME,
        secure: isProduction, // only send over HTTPS in production
        sameSite: isProduction ? 'None' : 'Lax', // change to 'None' if cross-site and ensure secure:true
      });
    }

    // Attach new tid and save user
    foundUser.refreshTokenIds = [...foundUser.refreshTokenIds, newTid];

    await foundUser.save();

    // Set the refresh token cookie. Note: sameSite/scope depends on your frontend domain setup.
    res.cookie(REFRESH_TOKEN_COOKIE_NAME, newRefreshToken, {
      httpOnly: true,
      domain: process.env.COOKIE_DOMAIN_NAME,
      secure: isProduction, // only send over HTTPS in production
      sameSite: isProduction ? 'None' : 'Lax', // change to 'None' if cross-site and ensure secure:true
      maxAge: MAX_COOKIE_AGE  
    });

    // Return access token and user data. Keep the refresh token only in cookie.
    res.status(200).json({
      accessToken,
      name: foundUser.name
    });

  } catch (err) {
    console.error('handleLogin error:', err);
    res.status(500).json({ message: 'Internal server error.' });
  }
};

module.exports = { handleLogin };
