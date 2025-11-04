const User = require('../model/User');
const bcrypt = require('bcrypt');
const cookie = require('../config/cookies');

const authPassChange = async (req, res) => {
  try {
    const { oldPass, newPass } = req.body;
    if (!oldPass || !newPass ) return res.status(400).json({ message: "All fields are required." });

    // simple server-side password strength check
    if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{6,}$/.test(newPass)) {
      return res.status(400).json({ message: 'Password must be 6+ chars and include uppercase, lowercase, number, and special character.' });
    }

    const userId = req.user.id;
    const user = await User.findById(userId);
    if (!user) return res.status(400).json({ message: 'Invalid request' });

    const currentPassCheck = await bcrypt.compare(oldPass, user.password);
    if(!currentPassCheck) return res.status(400).json({ message: 'Current password is invalid.' });

    const samePassCheck = await bcrypt.compare(newPass, user.password);
    if(samePassCheck) return res.status(409).json({ message: 'New password cannot be same as any of the previous 3 passwords' });

    //encrypt the password
    const newHashedPassword = await bcrypt.hash(newPass, 12);

    //Store the new Hashpassword
    // update fields
    user.password = newHashedPassword;
    user.passwordChangedAt = new Date();
    user.refreshTokenIds = [];
 
    await user.save();

    //delete old cookie from browser
    const incomingCookie = req.cookies;

    if(incomingCookie){
      res.clearCookie(cookie.REFRESH_TOKEN_NAME, {
        httpOnly: true,
        domain: cookie.DOMAIN,
        secure: cookie.SECURE,
        sameSite: cookie.SAME_SITE,
      });
    }

    res.status(200).json({ message: 'Password change successfully, Please login again.'});
  }
  catch (err) {
    console.log(err);
    res.status(500).json({ message: 'Internal server error.' });
  }
}

module.exports = { authPassChange };