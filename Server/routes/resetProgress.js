const express = require('express');
const router = express.Router();
const resetProgressController = require('../controllers/resetProgressController.js');

router.post('/', resetProgressController.resetProgress);

module.exports = router;