const express = require('express');
const router = express.Router();
const ChallengeController = require('../../controllers/challengeController');
const verifyRoles = require('../../middleware/verifyRoles');

const User = parseInt(process.env.User);

router.route('/questions')
    .post(verifyRoles(User), ChallengeController.getChallengeQuestions);

// router.route('/submit')
//     .post(verifyRoles(User), PracticeController.submitPractice);

// router.route('/data')
//     .get(verifyRoles(User), PracticeController.practiceData);    

module.exports = router;