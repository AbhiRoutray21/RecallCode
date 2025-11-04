require('dotenv').config();

const isProduction = process.env.NODE_ENV === 'production';

const cookie = {
    MAX_AGE : 7 * 24 * 60 * 60 * 1000,
    REFRESH_TOKEN_NAME : 'secure_t',
    DOMAIN: process.env.COOKIE_DOMAIN_NAME,
    SECURE: isProduction, // only send over HTTPS in production
    SAME_SITE: isProduction ? 'None' : 'Lax', // change to 'None' if cross-site and ensure secure:true
};


module.exports = cookie;