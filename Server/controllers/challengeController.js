const Questions = require('../model/Languages');

const getChallengeQuestions = async (req, res) => {
  try {   
    const { languageName, difficulty, questionCount, mode, timer } = req.body;

    if (!languageName || !difficulty || !questionCount)
        return res.status(400).json({ message: "Missing required fields" });

    const count = parseInt(questionCount);
    if (isNaN(count) || count < 1 || count > 20)
        return res.status(400).json({ message: "Invalid question count" });

    // Common projection (hide answers for challenge start)
    const projection = {
        _id: 1,
        languageName: 1,
        difficulty: 1,
        answer: 1,
        question: 1,
        options: 1,
    };

    let questions = [];

    // ----------------------------------------------------------------
    // CASE 1: MIXED DIFFICULTY
    // ----------------------------------------------------------------
    if (difficulty === "mixed") {
        // Define distribution ratios
        const ratios = { easy: 0.3, medium: 0.4, hard: 0.3 };

        // Compute how many per difficulty
        const easyCount = Math.max(1, Math.round(count * ratios.easy));
        const medCount = Math.max(1, Math.round(count * ratios.medium));
        const hardCount = Math.max(1, Math.round(count * ratios.hard));

        // Fetch random samples for each difficulty
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

        // Merge them all
        questions = [...easyQs, ...medQs, ...hardQs];

        // Fallback: if fewer than requested (DB doesn’t have enough)
        if (questions.length < count) {
        const extraNeeded = count - questions.length;
        const extra = await Questions.aggregate([
            { $match: { languageName } },
            { $sample: { size: extraNeeded } },
            { $project: projection },
        ]);
        questions = [...questions, ...extra];
        }
    }

    // ----------------------------------------------------------------
    // CASE 2: SINGLE DIFFICULTY (Easy / Medium / Hard)
    // ----------------------------------------------------------------
    else {
        questions = await Questions.aggregate([
        { $match: { languageName, difficulty } },
        { $sample: { size: count } },
        { $project: projection },
        ]);
    }

    if (!questions.length)
        return res.status(404).json({ message: "No questions found for this setup" });

    // ----------------------------------------------------------------
    // Shuffle once more to randomize order (especially for mixed)
    // ----------------------------------------------------------------
    questions = questions.sort(() => Math.random() - 0.5);

    // ----------------------------------------------------------------
    // Response
    // ----------------------------------------------------------------
    res.status(200).json({
        success: true,
        total: questions.length,
        languageName,
        difficulty,
        mode,
        timer,
        questions,
     });

  } catch (error) {
    return res.status(500).json({ message: "Server error while fetching questions" });
  }
};


module.exports = { getChallengeQuestions };
