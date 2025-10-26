const User = require('../model/User.js');
const PracticeSession = require('../model/PracticeSession');

const resetProgress = async (req, res) => {
  try {
    const { languages } = req.body;
    const userId = req.user.id;

    if (!userId || !Array.isArray(languages) || languages.length === 0) {
      return res.status(400).json({ message: "invalid request." });
    }

    // Fetch user
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    // Update matching languages
    user.practice = user.practice.map((item) => {
      if (languages.includes(item.language)) {
        return { ...item, solved: 0, completed: 0 };
      }
      return item;
    });

    await user.save();

    // delete all the practiceSessions of that languages user want to rest.
    await PracticeSession.deleteMany({
      userId,
      language: { $in: languages }
    });

    const userPracticeData = user.practice.map(p => ({
        language: p.language,
        solved: p.solved,
        total: p.total,
        completed: p.completed
    }));

    res.status(200).json({
      message: `Your practice progress has been reset successfully for 
                  selected ${languages.length === 1 ? 'language':'languages'}.`,
      userPracticeData
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Internal server error' });
  }
};

module.exports = { resetProgress };
