const express = require('express');
const router = express.Router();
const verifyOtpController = require('../controllers/verifyOtpController.js');

router.post('/', verifyOtpController.verifyOtp);

module.exports = router;