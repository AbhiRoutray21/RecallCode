const User = require('../model/User');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
require('dotenv').config();
const cookie = require('../config/cookies');

//CONFIG
const ACCESS_TOKEN_TTL = '10min';
const REFRESH_TOKEN_TTL = '7d';

const handleRefreshToken = async (req, res) => {
  try {
    const cookies = req.cookies;
    if (!cookies && !cookies[cookie.REFRESH_TOKEN_NAME]) return res.sendStatus(401);
    const refreshToken = cookies[cookie.REFRESH_TOKEN_NAME];

    // Step 1: Verify the token signature first
    jwt.verify(
      refreshToken,
      process.env.REFRESH_TOKEN_SECRET,
      async (err, decoded) => {
        if (err) {
          return res.sendStatus(403); // Forbidden
        }

        const userId = decoded.id;
        const tokenId = decoded.tid; // our unique token identifier (UUID)

        // Step 2: Find the user that has this token id in DB
        const foundUser = await User.findOne({ _id: userId, refreshTokenIds: tokenId }).exec();

        if (!foundUser) {
          // Token reuse detected — DB doesn’t have that tokenId
            res.clearCookie(cookie.REFRESH_TOKEN_NAME, {
                httpOnly: true,
                domain: cookie.DOMAIN,
                secure: cookie.SECURE,
                sameSite: cookie.SAME_SITE,
            });
          return res.sendStatus(403); // Force re-login
        }

        // Step 3: Token is valid — issue new access token and rotate refresh token
        const roles = Object.values(foundUser.roles.toObject() || {}).filter(Boolean);

        // Generate new tid for next refresh token
        const newTid = uuidv4();

        // Sign a new refresh token
        const newRefreshToken = jwt.sign(
          { id: userId, tid: newTid },
          process.env.REFRESH_TOKEN_SECRET,
          { expiresIn: REFRESH_TOKEN_TTL}
        );

        // Rotate: remove old tid and add new one
        foundUser.refreshTokenIds = foundUser.refreshTokenIds.filter(tid => tid !== tokenId);
        foundUser.refreshTokenIds.push(newTid);
        await foundUser.save();

        // Create new short-lived access token
        const newAccessToken = jwt.sign(
          {
            UserInfo: {
              id: userId,
              roles,
            },
          },
          process.env.ACCESS_TOKEN_SECRET,
          { expiresIn: ACCESS_TOKEN_TTL}
        );

        // Step 4: Set new refresh cookie
        res.cookie(cookie.REFRESH_TOKEN_NAME, newRefreshToken, {
          httpOnly: true,
          domain: cookie.DOMAIN,
          secure: cookie.SECURE,
          sameSite: cookie.SAME_SITE,
          maxAge: cookie.MAX_AGE
        });

        // Step 5: Send back new access token + user info
        res.status(200).json({
          name: foundUser.name,
          accessToken: newAccessToken,
        });
      }
    );
  } catch (err) {
    console.error('handleRefreshToken error:', err);
    res.sendStatus(500);
  }
};

module.exports = { handleRefreshToken };
