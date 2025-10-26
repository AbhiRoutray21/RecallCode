const express = require('express');
const router = express.Router();
const forgotPassController = require('../controllers/forgotPassController.js');

router.post('/', forgotPassController.forgotPassLink);
router.post('/verify',forgotPassController.forgotPassTokenVerify);
router.post('/change',forgotPassController.changeForgotPass);

module.exports = router;