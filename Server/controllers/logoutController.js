const User = require('../model/User');
const jwt = require('jsonwebtoken');

const isProduction = process.env.NODE_ENV === 'production';
const REFRESH_TOKEN_COOKIE_NAME = 'secure_t';

const handleLogout = async (req, res) => {
    // On client, also delete the accessToken
    try {
        const cookies = req.cookies;
        const refreshTokenName = REFRESH_TOKEN_COOKIE_NAME;

        if (!cookies?.[refreshTokenName]) {
            // No cookie means user probably already logged out
            return res.sendStatus(204); // No Content
        }

        const refreshToken = cookies[refreshTokenName];

        // Try verifying the refresh token
        const decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);
        const { id: userId, tid: tokenId } = decoded;

        // Find user who owns this refresh token id
        const foundUser = await User.findOne({ _id: userId, refreshTokenIds: tokenId }).exec();

        if (!foundUser) {
            // Token reuse or invalid
            res.clearCookie(REFRESH_TOKEN_COOKIE_NAME, {
                httpOnly: true,
                domain: process.env.COOKIE_DOMAIN_NAME,
                secure: isProduction, // only send over HTTPS in production
                sameSite: isProduction ? 'None' : 'Lax', // change to 'None' if cross-site and ensure secure:true
            });
            return res.sendStatus(204);
        }

        // Remove this refresh token ID from user record
        foundUser.refreshTokenIds = foundUser.refreshTokenIds.filter(tid => tid !== tokenId);
        await foundUser.save();

        // Clear the cookie on client
        res.clearCookie(REFRESH_TOKEN_COOKIE_NAME, {
            httpOnly: true,
            domain: process.env.COOKIE_DOMAIN_NAME,
            secure: isProduction, // only send over HTTPS in production
            sameSite: isProduction ? 'None' : 'Lax', // change to 'None' if cross-site and ensure secure:true
        });

        return res.status(200).json({ message: "Logged out successfully" });

    } catch (err) {
        if (err.name === 'TokenExpiredError') {
            // If token is expired but still has a valid DB record
            const decoded = jwt.decode(req.cookies?.[REFRESH_TOKEN_COOKIE_NAME]);
            if (decoded?.id) {
                const foundUser = await User.findById(decoded.id).exec();
                if (foundUser) {
                    foundUser.refreshTokenIds = [];
                    await foundUser.save();
                }
            }
            res.clearCookie(REFRESH_TOKEN_COOKIE_NAME, {
                httpOnly: true,
                domain: process.env.COOKIE_DOMAIN_NAME,
                secure: isProduction, // only send over HTTPS in production
                sameSite: isProduction ? 'None' : 'Lax', // change to 'None' if cross-site and ensure secure:true
            });
            return res.status(200).json({ message: "Session expired, logged out" });
        }

        console.error("Logout error:", err);
        return res.status(500).json({ message: "Server error during logout" });
    }
};

module.exports = { handleLogout };
