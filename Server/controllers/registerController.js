const fs = require('fs');
const path = require('path');
const bcrypt = require('bcrypt');
const { Resend } = require('resend');

const User = require('../model/User');
const OTP = require('../model/OTP');
const { generateAndHashOTP } = require('../utils/generateOTP.js');
const { capitalizeFirstLetter } = require('../utils/capitalizeFirstLetter');

// --- Register User + Send OTP ---
const handleNewUser = async (req, res) => {
  const resend = new Resend(process.env.RESEND_API_KEY);
  const template = fs.readFileSync(
    path.join(__dirname, '..', 'views', 'verificationEmail.html'),
    'utf8'
  );

  let { name, email, password } = req.body;
  if (!name || !email || !password) {
    return res.status(400).json({ message: 'All fields are required.' });
  }

  try {
    // Capitalize name
    name = capitalizeFirstLetter(name);

    // Check if user already exists
    const existing = await User.findOne({ email });
    if (existing) {
      return res
        .status(200)
        .json({ message: "Account created! If your email is valid, we've sent you a verification link." });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create unverified user
    const newUser = await User.create({
      name,
      email,
      password: hashedPassword,
      verificationExpiresAt: new Date(Date.now() + 12 * 60 * 60 * 1000) // 12h to verify
    });

    // Clear any old OTPs for this email/purpose
    await OTP.deleteMany({ email, purpose: 'register' });

    // Generate OTP
    const { otp, otpHash } = await generateAndHashOTP();
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 mins

    await OTP.create({
      email,
      otpHash,
      purpose: 'register',
      expiresAt,
      attempts: 0,
      resendCount: 1,
      lastResendAt: new Date()
    });

    // Send OTP email
    try {
        await resend.emails.send({
        from: `RecallCode <${process.env.FROM_EMAIL}>`,
        to: email,
        subject: 'Verify your email',
        html: template.replace('{{otp}}', otp)
      });
    } catch (err) {
      // rollback user if email sending fails
      console.error('Email send failed:', err);
      await User.deleteOne({ _id: newUser._id });
      return res
        .status(500)
        .json({ message: 'Could not send verification email. Try again later.' });
    }

    return res
      .status(200)
      .json({ message: "Account created! If your email is valid, we've sent you a verification link." });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

module.exports = { handleNewUser };
