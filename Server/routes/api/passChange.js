const express = require('express');
const router = express.Router();
const authPassChangeController = require('../../controllers/authPassChangeController');
const verifyRoles = require('../../middleware/verifyRoles');

const User = parseInt(process.env.User);

router.route('/')
    .post(verifyRoles(User), authPassChangeController.authPassChange);  

module.exports = router;