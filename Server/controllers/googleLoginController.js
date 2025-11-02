const axios = require('axios');
const { google } = require("googleapis");
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const crypto = require('crypto');
const { v4: uuidv4 } = require('uuid');
const User = require('../model/User');
const { capitalizeFirstLetter } = require('../utils/capitalizeFirstLetter');

//CONFIG
const ACCESS_TOKEN_TTL = '10min';
const REFRESH_TOKEN_TTL = '7d';
const isProduction = process.env.NODE_ENV === 'production';
const MAX_COOKIE_AGE = 7 * 24 * 60 * 60 * 1000; // 7 days
const REFRESH_TOKEN_COOKIE_NAME = 'secure_t';

const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  "postmessage" 
);

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


/* GET Google Authentication API. */
exports.googleAuth = async (req, res) => {
    const code = req.query.code;
    try {
        const googleRes = await oauth2Client.getToken(code);
        oauth2Client.setCredentials(googleRes.tokens);
        const userRes = await axios.get(
            `https://www.googleapis.com/oauth2/v1/userinfo?alt=json&access_token=${googleRes.tokens.access_token}`
        );
        let { email, name } = userRes.data;
        name = name.split(" ")[0];
        name = capitalizeFirstLetter(name);
        const randomPassword  = crypto.randomBytes(5).toString('hex');
        const hashedPassword = await bcrypt.hash(randomPassword, 12);
        
        let user = await User.findOne({ email });

        if (!user) {
            user = await User.create({
                name,
                email,
                password: hashedPassword,
                googleLogin: true,
                isVerified: true,
            });
        } else if(user && !user.lockUntil && !user.isVerified){
            await User.findOneAndDelete({email});
            user = await User.create({
                name,
                email,
                password: hashedPassword,
                googleLogin: true,
                isVerified: true,
            });
        }

        if (user.lockUntil && user.lockUntil > new Date()) {
          return res.status(423).json({ message: `Account locked. Try again after 15 minutes.` });
        }

        const { _id } = user;

        // Build new token id and refresh token
        const newTid = uuidv4();
        const newRefreshToken = signRefreshToken(_id, newTid);
        const accessToken = signAccessToken(user);

        user.refreshTokenIds = user.refreshTokenIds || [];

        res.clearCookie(REFRESH_TOKEN_COOKIE_NAME, {
          httpOnly: true,
          domain: process.env.COOKIE_DOMAIN_NAME,
          secure: isProduction, // only send over HTTPS in production
          sameSite: isProduction ? 'None' : 'Lax', // change to 'None' if cross-site and ensure secure:true
        });

        user.refreshTokenIds = [...user.refreshTokenIds, newTid];
        foundUser.failedLoginAttempts = 0;
        foundUser.lockUntil = null;
        await user.save();

        res.cookie(REFRESH_TOKEN_COOKIE_NAME, newRefreshToken, {
          httpOnly: true,
          domain: process.env.COOKIE_DOMAIN_NAME,
          secure: isProduction, // only send over HTTPS in production
          sameSite: isProduction ? 'None' : 'Lax', // change to 'None' if cross-site and ensure secure:true
          maxAge: MAX_COOKIE_AGE
        });

        res.status(200).json({
            message: 'success',
            accessToken,
            name: user.name
        });
    } catch (err) {
        res.status(500).json({
            message: "Internal Server Error"
        })
    }
};