const User = require('../model/User');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
require('dotenv').config();

const handleRefreshToken = async (req, res) => {
  try {
    const cookies = req.cookies;
    const refreshTokenName = process.env.REFRESH_TOKEN_COOKIE_NAME
    if (!cookies && !cookies[refreshTokenName]) return res.sendStatus(401);
    const refreshToken = cookies[refreshTokenName];


    // Step 1: Verify the token signature first
    jwt.verify(
      refreshToken,
      process.env.REFRESH_TOKEN_SECRET,
      async (err, decoded) => {
        if (err) {
          console.warn('Invalid or expired refresh token');
          return res.sendStatus(403); // Forbidden
        }

        const userId = decoded.id;
        const tokenId = decoded.tid; // our unique token identifier (UUID)

        // Step 2: Find the user that has this token id in DB
        const foundUser = await User.findOne({ _id: userId, refreshTokenIds: tokenId }).exec();

        if (!foundUser) {
          // Token reuse detected — DB doesn’t have that tokenId
          console.warn('Possible refresh token reuse detected!');

          res.clearCookie(process.env.REFRESH_TOKEN_COOKIE_NAME, { 
            httpOnly: true, 
            // secure: true,
            // sameSite: 'Strict' 
            sameSite: 'Lax' 
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
          { expiresIn: process.env.REFRESH_TOKEN_TTL.toString() }
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
          { expiresIn:  process.env.ACCESS_TOKEN_TTL.toString()}
        );

        // Step 4: Set new refresh cookie
        const isProduction = process.env.NODE_ENV === 'production';
        res.cookie(process.env.REFRESH_TOKEN_COOKIE_NAME, newRefreshToken, {
          httpOnly: true,
          // secure: isProduction,
          // sameSite: isProduction ? 'Strict' : 'Lax',
          sameSite: 'lax',
          maxAge: 7 * 24 * 60 * 60 * 1000,
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
