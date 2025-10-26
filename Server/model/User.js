const mongoose = require('mongoose');

const practiceSchema = new mongoose.Schema({
  language: { type: String, required: true },
  solved: { type: Number, default: 0 },
  total: { type: Number, default: 0 },
  completed: { type: Number, default: 0, max: 3 }
});

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    minlength: 3,
    match: /^[A-Za-z0-9]+$/,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    match: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  },
  password: {
    type: String,
    required: true,
    minlength: 6,
  },
  roles: {
    User: { type: Number, default: 2001 }
  },

  // Verification
  googleLogin:{type: Boolean},
  isVerified: { type: Boolean, default: false },
  verificationExpiresAt: { 
    type: Date,
    index: { expires: 30*60 }
  }, // When verification link/OTP expires

  // Account security
  passwordChangedAt: { type: Date },
  failedLoginAttempts: { type: Number, default: 0 },
  lockUntil: { type: Date, default: null }, // Temporarily locked if brute-force

  // Refresh token handling
  refreshTokenIds: { type: [String], default: [] }, // store token IDs (not JWTs)

  // Practice tracking
  practice: [practiceSchema],
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);
