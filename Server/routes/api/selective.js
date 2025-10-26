const express = require('express');
const router = express.Router();
const selectiveController = require('../../controllers/selectiveController');
const verifyRoles = require('../../middleware/verifyRoles');

const User = parseInt(process.env.User);

router.route('/topics')
    .get(verifyRoles(User), selectiveController.selectiveTopics);  

router.route('/questions')
    .post(verifyRoles(User), selectiveController.selectiveQuestions);      

module.exports = router;