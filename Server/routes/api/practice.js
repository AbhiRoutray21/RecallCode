const express = require('express');
const router = express.Router();
const PracticeController = require('../../controllers/practiceController');
const verifyRoles = require('../../middleware/verifyRoles');

const User = parseInt(process.env.User);

router.route('/questions')
    .post(verifyRoles(User), PracticeController.practiceQuestions);

router.route('/submit')
    .post(verifyRoles(User), PracticeController.submitPractice);

router.route('/data')
    .get(verifyRoles(User), PracticeController.practiceData);    

module.exports = router;