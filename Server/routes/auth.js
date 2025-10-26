const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const googleLoginController = require('../controllers/googleLoginController');

router.post('/', authController.handleLogin);
router.get('/google', googleLoginController.googleAuth);

module.exports = router;