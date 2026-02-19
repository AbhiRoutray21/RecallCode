const Questions = require("../model/Languages");

// ------------------- GET QUESTIONS -------------------

const getChallengeQuestions = async (req, res) => {
  try {
    const { languageName, difficulty, questionCount } = req.body;

    if (!languageName || !difficulty || !questionCount)
      return res.status(400).json({ message: "Missing required fields" });

    const count = parseInt(questionCount);

    const projection = {
      _id: 1,
      languageName: 1,
      difficulty: 1,
      question: 1,
      options: 1, // NO answer sent
    };

    let questions = [];

    if (difficulty === "mixed") {
      const easyCount = Math.floor(count * 0.3);
      const medCount = Math.floor(count * 0.4);
      const hardCount = count - easyCount - medCount;

      const [easyQs, medQs, hardQs] = await Promise.all([
        Questions.aggregate([
          { $match: { languageName, difficulty: "easy" } },
          { $sample: { size: easyCount } },
          { $project: projection },
        ]),
        Questions.aggregate([
          { $match: { languageName, difficulty: "medium" } },
          { $sample: { size: medCount } },
          { $project: projection },
        ]),
        Questions.aggregate([
          { $match: { languageName, difficulty: "hard" } },
          { $sample: { size: hardCount } },
          { $project: projection },
        ]),
      ]);

      questions = [...easyQs, ...medQs, ...hardQs];
    } else {
      questions = await Questions.aggregate([
        { $match: { languageName, difficulty } },
        { $sample: { size: count } },
        { $project: projection },
      ]);
    }

    questions = questions.sort(() => Math.random() - 0.5);

    res.json({
      success: true,
      total: questions.length,
      questions,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

// ------------------- SUBMIT CHALLENGE -------------------

const submitChallenge = async (req, res) => {
  try {
    const { answers, totalQuestions, totalTimeTaken } = req.body;

    if (!answers || !Array.isArray(answers))
      return res.status(400).json({ message: "Invalid submission" });

    const questionIds = answers.map((a) => a.questionId);

    const questions = await Questions.find({
      _id: { $in: questionIds },
    });

    let correct = 0;

    const detailedResults = answers.map((a) => {
      const q = questions.find(
        (q) => q._id.toString() === a.questionId
      );

      if (!q) return null;

      const isCorrect =
        q.answer.option === a.selectedOption;

      if (isCorrect) correct++;

      return {
        questionId: a.questionId,
        selectedOption: a.selectedOption,
        correctOption: q.answer.option,
        explanation: q.answer.explanation,
        isCorrect,
      };
    });

    const wrong = answers.length - correct;
    const notAttempted = totalQuestions - answers.length;

    const percentage = Math.round((correct / totalQuestions) * 100);

    const avgTimePerQuestion =
      totalQuestions > 0
        ? (totalTimeTaken / totalQuestions).toFixed(2)
        : 0;

    res.json({
      success: true,
      correct,
      wrong,
      notAttempted,
      percentage,
      totalTimeTaken,
      avgTimePerQuestion,
      total: totalQuestions,
      detailedResults,
    });
  } catch (err) {
    res.status(500).json({ message: "Submission failed" });
  }
};


module.exports = {
  getChallengeQuestions,
  submitChallenge,
};
