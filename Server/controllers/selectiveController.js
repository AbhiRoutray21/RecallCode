const Topics = require('../model/Topics');
const Questions = require('../model/Languages');
const User = require('../model/User');

const selectiveTopics = async (req, res) => {
  const userId = req.user.id; 
  if(!userId) return res.sendStatus(401);

  const user = await User.findById(userId);
  if(!user) return res.sendStatus(403);

  const topics = await Topics.find();  
  const selectiveTopics = topics.map(t=>({
    language: t.language,
    topics: t.topics
  }));

  res.status(200).json({selectiveTopics});
}

// selective Questions
const selectiveQuestions = async (req, res) => {
  const { language, topics, quesPerTopic } = req.body;
  const userId = req.user.id; // from JWT
  if (!language||!topics||!quesPerTopic) return res.status(400).json({ message: "Missing field" });

  const user = await User.findById(userId);
  if (!user) return res.sendStatus(403);

  try {
    const pipeline = [
      {
        $match: { languageName: language }   // 1. filter by language
      },
      {
        $match: { topic: { $in: topics } }       // 2. filter by topic
      },
      {
        $facet: topics.reduce((acc, topic) => {
          const safeKey = topic.replace(/\./g, "_"); // replace '.' with '_'
          acc[safeKey] = [
            { $match: { topic } },
            { $sample: { size: Number(quesPerTopic) } },
            { $project: { difficulty:0 } }
          ];
          return acc;
        }, {})
      }
    ];

    const questionsData = await Questions.aggregate(pipeline);
    res.status(200).json({Questions:questionsData[0]});

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

module.exports = { selectiveTopics,selectiveQuestions };
