const express = require('express');
const router = express.Router();
const TrialQuesController = require('../controllers/trialQuesController');

router.route('/:language')
    .get(TrialQuesController.trialQuestions);    

module.exports = router;