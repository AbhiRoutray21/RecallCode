const mongoose = require('mongoose');

const otpSchema = new mongoose.Schema({
  email: { type: String, required: true, index: true },
  otpHash: { type: String, required: true },

  purpose: {
    type: String,
    enum: ['register'],
    default: 'register'
  },

  // expiry handling
  expiresAt: { type: Date, required: true, index: { expires: 5 * 60 } },
  createdAt: { type: Date, default: Date.now },

  // brute force protection
  attempts: { type: Number, default: 0 },
  maxAttempts: { type: Number, default: 3 },

  // resend handling
  resendCount: { type: Number, default: 1 },
  lastResendAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('OTP', otpSchema);

