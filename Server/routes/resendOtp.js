const express = require('express');
const router = express.Router();
const resendOtpController = require('../controllers/resendOtpController.js');

router.post('/', resendOtpController.resendOtp);

module.exports = router;