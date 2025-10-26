const axios = require('axios');
const { google } = require("googleapis");
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const crypto = require('crypto');
const { v4: uuidv4 } = require('uuid');
const User = require('../model/User');
const { capitalizeFirstLetter } = require('../utils/capitalizeFirstLetter');

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
    { expiresIn: process.env.ACCESS_TOKEN_TTL.toString() }
  );
}

function signRefreshToken(userId, tid) {
  // Store tid in token so we can find it later without storing whole JWT
  return jwt.sign({ id: userId.toString(), tid }, process.env.REFRESH_TOKEN_SECRET, { expiresIn: process.env.REFRESH_TOKEN_TTL.toString() });
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
        } else if(user && !user.isVerified){
            await User.findOneAndDelete({email});
            user = await User.create({
                name,
                email,
                password: hashedPassword,
                googleLogin: true,
                isVerified: true,
            });
        }

        const { _id } = user;

        // Build new token id and refresh token
        const newTid = uuidv4();
        const newRefreshToken = signRefreshToken(_id, newTid);
        const accessToken = signAccessToken(user);

        user.refreshTokenIds = user.refreshTokenIds || [];

        res.clearCookie(process.env.REFRESH_TOKEN_COOKIE_NAME, {
            httpOnly: true,
            // secure: isProduction,
            // sameSite: isProduction ? 'Strict' : 'Lax' 
            sameSite: 'Lax'
        });

        user.refreshTokenIds = [...user.refreshTokenIds, newTid];
        await user.save();

        res.cookie(process.env.REFRESH_TOKEN_COOKIE_NAME, newRefreshToken, {
            httpOnly: true,
            sameSite: 'lax',
            // secure: isProduction, // only send over HTTPS in production
            // sameSite: isProduction ? 'Strict' : 'Lax', // change to 'None' if cross-site and ensure secure:true
            maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
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