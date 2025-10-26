require('dotenv').config();

const allowedOrigins = [
    process.env.FRONTEND_URL,
    "http://localhost:5173"
];

module.exports = allowedOrigins;