require('dotenv').config();

const allowedOrigins = [
    process.env.FRONTEND_URL,
    "https://www.recallcode.cloud"
];

module.exports = allowedOrigins;