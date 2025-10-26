const Questions = require('../model/Languages');

const trialQuestions = async (req, res) => {
  const language = req.params.language;
  if (!language) return res.status(400).json({ message: "Missing field" });

  const totalCount = await Questions.countDocuments({ languageName: language });
  if (totalCount === 0) return res.status(400).json({ message: "Language not found" });

  try {
    const questions = await Questions.find(
        {languageName:language},
        { difficulty: 0}
    ).limit(20).exec();

    res.status(200).json({questions});

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

module.exports = { trialQuestions };