const express = require('express');
const router = express.Router();
const usersController = require('../../controllers/usersController');
const verifyRoles = require('../../middleware/verifyRoles');

const User = parseInt(process.env.User);
   
router.route('/:id')
    .get(verifyRoles(User), usersController.getUser)
    .patch(verifyRoles(User), usersController.updateUser)   
    .delete(verifyRoles(User), usersController.deleteUser);

module.exports = router;