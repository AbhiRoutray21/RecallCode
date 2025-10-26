const fs = require('fs');
const path = require('path');
const Password_reset_token = require('../model/PasswordReset');
const User = require('../model/User');
const bcrypt = require('bcrypt');
const { Resend } = require('resend');
const { generateAndHashToken } = require('../utils/generateToken.js');

// --- Forgot Password Link ---
const forgotPassLink = async (req, res) => {
  const resend = new Resend(process.env.RESEND_API_KEY);
  const template = fs.readFileSync(path.join(__dirname, '..', 'views', 'resetPasswordEmail.html'), 'utf8');

  try {
    const { email } = req.body;
    const ip = req.ip || req.headers['x-forwarded-for'] || req.connection?.remoteAddress;
    const userAgent = req.get('User-Agent');

    const user = await User.findOne({ email });
    if (!user) res.status(200).json({ message: 'If that account exists, you will receive an email shortly.' });

    const resetPassData = await Password_reset_token.findOne({ email });
    const remain = Math.max(0, 2 - (resetPassData?.resetRequest || 0));

    if (resetPassData) {
      if (resetPassData.resetRequest >= 3) { // max 3 times user can request for resetPass email.
        return res.status(429).json({ message: 'you can request for password reset email only 3 times a day.' });
      }
      await Password_reset_token.deleteMany({ email });
    }

    const { token, tokenHash, resetId } = await generateAndHashToken();
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 mins
    const link = `${process.env.FRONTEND_URL}/forgot_password/${resetId}/${token}`;

    await Password_reset_token.create({
      resetId,
      email,
      tokenHash,
      expiresAt,
      resetRequest: resetPassData ? resetPassData.resetRequest + 1 : 1,
      passChangeCount: resetPassData ? resetPassData.passChangeCount : 0,
      ip,
      userAgent
    });

    await resend.emails.send({
      from: `RecallCode <${process.env.FROM_EMAIL}>`,
      to: email,
      subject: 'Reset Your Password',
      html: template.replace('{{name}}', user.name).replace(/{{\s*link\s*}}/g, link),
    });

    res.status(200).json({ message: `If that account exists, you will receive an email shortly. (${remain} attempt remaining)`,remain});

  } catch (err) {
    console.error('requestPasswordReset error:', err);
    return res.status(500).json({ message: 'Internal server error' });
  }

};

// --- forgot password token verification ---
const forgotPassTokenVerify = async (req, res) => {
  try {
    const { token, resetId } = req.body;
    if (!token || !resetId) return res.status(400).json({ message: 'Invalid request' });

    const userResetPassData = await Password_reset_token.findOne({ resetId });
    if (!userResetPassData) return res.status(400).json({ message: 'Invalid or expired link' });

    if (userResetPassData.expiresAt < Date.now()) {
      return res.status(400).json({ message: 'Link expired,please try again' });
    }

    const isMatch = await bcrypt.compare(token, userResetPassData.tokenHash);
    if (!isMatch) return res.status(400).json({ message: 'Invalid link' });

    const newExpiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 mins

    await Password_reset_token.updateOne({ resetId }, { $set: { expiresAt: newExpiresAt } });

    res.status(200).json({ email: userResetPassData.email, message: 'Link verified' });

  } catch (err) {
    console.error('verifyResetToken error:', err);
    return res.status(500).json({ message: 'Internal server error' });
  }
}

//----------------forgotPassword-Change---------------------
const changeForgotPass = async (req, res) => {
  try {
    const { password, token, resetId } = req.body;
    if (!password || !token || !resetId) return res.status(400).json({ message: "All fields are required." });

    // simple server-side password strength check
    if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{6,}$/.test(password)) {
      return res.status(400).json({ message: 'Password must be 8+ chars and include upper, lower, number, and special character.' });
    }

    const userResetPassData = await Password_reset_token.findOne({ resetId });
    if (!userResetPassData) return res.status(400).json({ message: 'Invalid or expired link' });

    if (userResetPassData.passChangeCount >= 2) { // max 2 times user can change its password in 24hrs.
      await Password_reset_token.updateOne(
        { resetId },
        {
          $unset: { resetId: "", tokenHash: "" },
          $set: { expiresAt: new Date() }
        }
      );
      return res.status(429).json({ message: 'you can set your password only 2 times a day.' });
    }

    if (userResetPassData.expiresAt < Date.now()) {
      return res.status(400).json({ message: 'link expired,please try again' });
    }

    const isMatch = await bcrypt.compare(token, userResetPassData.tokenHash);
    if (!isMatch) return res.status(400).json({ message: 'Invalid link' });

    const user = await User.findOne({ email: userResetPassData.email });
    if (!user) return res.status(400).json({ message: 'Invalid request' });

    const oldPasswordCheck = await bcrypt.compare(password, user.password);
    if(oldPasswordCheck) return res.status(409).json({ message: 'New password cannot be same as any of the previous 3 passwords' });

    //encrypt the password
    const newHashedPassword = await bcrypt.hash(password, 12);

    //Store the new Hashpassword
    // update fields
    user.password = newHashedPassword;
    user.passwordChangedAt = new Date();
    user.refreshTokenIds = [];
    // save triggers pre-save hooks
    await user.save();

    await Password_reset_token.updateOne(
      { resetId },
      { 
        $unset: { resetId: "", tokenHash: "" },
        $inc: { passChangeCount: 1 },
        $set: {expiresAt: new Date()}
      }
    );

    res.status(200).json({ message: 'Password change successfully' });
  }
  catch (err) {
    console.log(err);
    res.status(500).json({ 'message': err.message });
  }
}

module.exports = { forgotPassLink, forgotPassTokenVerify, changeForgotPass };