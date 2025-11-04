const jwt = require('jsonwebtoken');
const User = require('../model/User');
require('dotenv').config();
const cookie = require('../config/cookies');

const verifyJWT = async (req, res, next) => {
    const cookies = req.cookies;
    if (!cookies && !cookies[cookie.REFRESH_TOKEN_NAME]) return res.sendStatus(401);
    const refreshToken = cookies[cookie.REFRESH_TOKEN_NAME];

    // Verify refresh token
    jwt.verify(
        refreshToken, 
        process.env.REFRESH_TOKEN_SECRET, 
        async (err, decodedRefresh) => {
        if (err) {
          console.warn('Invalid or expired refresh token');
          return res.sendStatus(403); // Forbidden
        }

        const userId = decodedRefresh.id;
        const tokenId = decodedRefresh.tid; // our unique token identifier (UUID)
        
        // Step 2: Find the user that has this token id in DB
        const foundUser = await User.findOne({ _id: userId, refreshTokenIds: tokenId }).exec();
        if (!foundUser) return res.sendStatus(403);

        // Now verify access token inside this callback
        const authHeader = req.headers.authorization || req.headers.Authorization;
        if (!authHeader?.startsWith('Bearer ')) return res.sendStatus(401);
        const token = authHeader.split(' ')[1];

        jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decodedAccess) => {
            if (err) {
                return res.status(403).json({ message: "Access token expired or invalid" });
            }

            // Attach user info and move to next middleware
            req.user = {
                id: decodedAccess.UserInfo.id,
                roles: decodedAccess.UserInfo.roles
            };
            next();
        });
    });
};

module.exports = verifyJWT;
