const Questions = require('../model/Languages');
const User = require('../model/User');
const PracticeSession = require('../model/PracticeSession');
const { v4: uuidv4 } = require("uuid"); // for generating cursor

const practiceQuestions = async (req, res) => {
  const { language, sessionId, cursor } = req.body;
  const userId = req.user.id; // from JWT
  if (!language||!userId) return res.status(400).json({ message: "Missing field" });

  try {
    const totalCount = await Questions.countDocuments({ languageName: language });
    if (totalCount === 0) return res.status(400).json({ message: "Language not found" });

    const user = await User.findById(userId);
    const solved = user.practice?.find(p => p.language === language)?.solved ?? 0;

    if (solved >= totalCount) return res.status(200).json({ message: "All questions solved" });

    // When user first request for questions(having no sessionId and cursor)
    if (language && sessionId === null) {
      //check if the session is exists(not expired) or not for this userId and language
      // Find an active session
      const existUserSession = await PracticeSession.findOne({
        email: user.email,
        language,
        expiresAt: { $gt: new Date() } // only sessions that are not expired
      });

      if(existUserSession){
        // 2. Find the current round (first one with submitted = false)
        const currentRound = existUserSession.rounds.find(r => r.submitted === false);
        
        if (!currentRound) {
          const nextQuestionsBatch = await Questions.find(
            { languageName: language },
            { topic: 1, question: 1, options: 1, _id: 1,}
          )
            .skip(solved)
            .limit(20)
            .exec();

          const nextRoundCursor = uuidv4();
          existUserSession.rounds.push({
            cursor: nextRoundCursor,
            questionIds: nextQuestionsBatch.map(q => q._id.toString())
          });
          await existUserSession.save();

          return res.status(200).json({
            exists: true,
            sessionId: existUserSession._id.toString(),
            cursor: nextRoundCursor,
            questions: nextQuestionsBatch
          });
        }

        const notSolvedQuestions = await Questions.find(
          { _id: { $in: currentRound.questionIds } },
          { topic: 1, question: 1, options: 1, _id: 1 }
        ).exec();

        // 3. Return sessionId, cursor & questions
        return res.status(200).json({
          exists: true,
          sessionId: existUserSession._id.toString(),
          cursor: currentRound.cursor,
          questions: notSolvedQuestions
        });
      }

      // if session is not exists for this language and user
      const questions = await Questions.find(
        { languageName: language },
        { topic: 1, question: 1, options: 1, _id: 1,}
      )
        .skip(solved)
        .limit(20)
        .exec();

      const roundCursor =  uuidv4();
      const session = await PracticeSession.create({
        email:user.email,
        language,
        rounds: [{ cursor: roundCursor, questionIds: questions.map(q => q._id.toString())}],
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000)
      });

      return res.status(200).json({
        sessionId: session._id.toString(),
        cursor: roundCursor,
        questions
      });
    }

    // When user have sessionId and cursor 
    if (language && sessionId && cursor) {
      const perticularSession = await PracticeSession.findOne({_id: sessionId,language});
      
      // perticularSessionId not exists
      if (!perticularSession){
        const existUserSession = await PracticeSession.findOne({
          email:user.email,
          language,
          expiresAt: { $gt: new Date() } // only sessions that are not expired
        });

        if (existUserSession) {
          // 2. Find the current round (first one with submitted = false)
          const currentRound = existUserSession.rounds.find(r => r.submitted === false);

          if (!currentRound) {
            const nextQuestionsBatch = await Questions.find(
              { languageName: language },
              { topic: 1, question: 1, options: 1, _id: 1, }
            )
              .skip(solved)
              .limit(20)
              .exec();

            const nextRoundCursor = uuidv4();
            existUserSession.rounds.push({
              cursor: nextRoundCursor,
              questionIds: nextQuestionsBatch.map(q => q._id.toString())
            });
            await existUserSession.save();

            return res.status(200).json({
              exists: true,
              sessionId: existUserSession._id.toString(),
              cursor: nextRoundCursor,
              questions: nextQuestionsBatch
            });
          }

          const notSolvedQuestions = await Questions.find(
            { _id: { $in: currentRound.questionIds } },
            { topic: 1, question: 1, options: 1, _id: 1 }
          ).exec();

          // 3. Return sessionId, cursor & questions
          return res.status(200).json({
            exists: true,
            sessionId: existUserSession._id.toString(),
            cursor: currentRound.cursor,
            questions: notSolvedQuestions
          });
        }

        // if session is not exists for this language
        const questions = await Questions.find(
          { languageName: language },
          { topic: 1, question: 1, options: 1, _id: 1, }
        )
          .skip(solved)
          .limit(20)
          .exec();

        const roundCursor = uuidv4();
        const session = await PracticeSession.create({
          email:user.email,
          language,
          rounds: [{ cursor: roundCursor, questionIds: questions.map(q => q._id.toString()) }],
          expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000)
        });

        return res.status(200).json({
          sessionId: session._id.toString(),
          cursor: roundCursor,
          questions
        });

      }
      
      // perticularSessionId exists
      const round = perticularSession.rounds.find(r => r.cursor === cursor);
      if (!round) return res.status(400).json({ message: "Invalid cursor" });

      /* if session is expired and user req with sessionId 
      then create newSession and cursor with same questions*/
      if (new Date() > perticularSession.expiresAt) {
        const notSolvedExpireQuestions = await Questions.find(
          { _id: { $in: round.questionIds } },
          { topic: 1, question: 1, options: 1, _id: 1 }
        ).exec();

        const newRoundCursor = uuidv4();
        const newSession = await PracticeSession.create({
          email:user.email,
          language,
          rounds: [{ cursor: newRoundCursor, questionIds: notSolvedExpireQuestions.map(q => q._id.toString()) }],
          expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000)
        });

        return res.status(200).json({
          sessionId: newSession._id.toString(),
          cursor: newRoundCursor,
          questions: notSolvedExpireQuestions
        });
      }

      // if session is not expired and exists then carry on and send same quesions..
      const notSolvedQuestions = await Questions.find(
        { _id: { $in: round.questionIds } },
        { topic: 1, question: 1, options: 1, _id: 1 }
      ).exec();

      res.status(200).json({ sessionId:perticularSession._id.toString(), cursor, questions: notSolvedQuestions });
    }

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Internal server error" });
  }
};


// update progress when user submits answers
const submitPractice = async (req, res) => {
  const { sessionId, cursor, answers, language } = req.body;
  const userId = req.user.id; // from JWT
  if (!sessionId || !answers ||!cursor) return res.status(400).json({ message: "Missing fields" });

  try {
    const user = await User.findById(userId);
    const session = await PracticeSession.findById(sessionId);
    if (!session) return res.status(400).json({ message: "Invalid session" });
    if (session.email !== user.email) return res.status(403).json({ message: "Not allowed" });
    if (new Date() > session.expiresAt) return res.status(400).json({ message: "Session expired,Please reattempt" });

    const round = session.rounds.find(r => r.cursor === cursor);
    if (!round) return res.status(400).json({ message: "Invalid cursor" });
    if (round.submitted) {
      // Idempotent response
      const questions = await Questions.find({ _id: { $in: round.questionIds } }).exec();
      let correctAnswers = [];
      const explanations = questions.map(q => {
        const correct = q.answer.option;
        correctAnswers.push({
          questionId: q._id.toString(),
          correctOption: correct
        });

        return({
          questionId: q._id.toString(),
          explain: q.answer.explanation
        })
      });

      return res.status(200).json({
        correctAnswers,
        explanations,
        totalQues: round.result.totalQues,
        correctCount: round.result.correctCount,
        nextCursor: getNextCursor(session,round.cursor)
      });
    }

    // Validate answers (compute correct answered count)
    // 'answers' is [{ questionId, selectedOption }]
    const questions = await Questions.find({ _id: { $in: round.questionIds } }).exec();
    let correctAnsweredCount = 0;
    let correctAnswers = [];
    const explanations = questions.map(q => {
      const answer = answers.find(a => a.questionId === q._id.toString());
      const correct = q.answer.option; 
      if (answer?.selectedOption === correct) correctAnsweredCount++;
      correctAnswers.push({
        questionId: q._id.toString(),
        correctOption: correct
      });

      return({
        questionId: q._id.toString(),
        explain: q.answer.explanation
      })
    });

    // Mark round as submitted
    round.submitted = true;
    round.result = { totalQues: questions.length,correctCount:correctAnsweredCount };
    await session.save();

    // Atomic update user progress
    const totalCount = await Questions.countDocuments({ languageName: session.language });
    const totalSolved = answers.length;
    const updated = await User.updateOne(
      { _id: userId, "practice.language": session.language },
      {
        $inc: { "practice.$.solved": totalSolved },
        $set: { "practice.$.total": totalCount }
      }
    );
    if (updated.modifiedCount === 0) {
      // language not yet exists, push new
      await User.updateOne(
        { _id: userId },
        {
          $push: {
            practice: { language: session.language, solved: totalSolved, total: totalCount }
          }
        }
      );
    }

    // --- Create NEXT round ---
    const updatedUser = await User.findById(userId);
    const solved = updatedUser.practice?.find(p => p.language === language)?.solved ?? 0;
    const completed = updatedUser.practice?.find(p => p.language === language)?.completed ?? 0;
    if(completed === 3) return res.status(200).json({message:"you have completed all questions 3 times."})

    if (completed !== 3 && solved >= totalCount){
      if(completed === 2){
        await User.updateOne(
          { _id: userId, "practice.language": session.language },
          {
            $set: { "practice.$.solved": solved },
            $inc: { "practice.$.completed": 1}
          }
        );
      } else{
        await User.updateOne(
          { _id: userId, "practice.language": session.language },
          {
            $set: { "practice.$.solved": 0 },
            $inc: { "practice.$.completed": 1 }
          }
        );
      }
        session.expiresAt = new Date();
        session.save();

        return res.status(200).json({
          correctAnswers,
          totalQues: questions.length,
          correctCount: correctAnsweredCount,
          explanations,
          message: "Completed"
        });
    }

    const nextQuestionsBatch = await Questions.find(
      { languageName: language },
      { _id: 1 }
    )
    .skip(solved)
    .limit(20)
    .exec();

    const nextRoundCursor =  uuidv4();
    session.rounds.push({
      cursor: nextRoundCursor,
      questionIds: nextQuestionsBatch.map(q => q._id.toString())
    });
    await session.save();


    res.status(200).json({
      correctAnswers,
      totalQues:questions.length,
      correctCount:correctAnsweredCount,
      explanations,
      nextCursor: nextRoundCursor,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Practice Data for practice page..
const practiceData = async (req, res) => {
  const userId = req.user.id; 
  if(!userId) return res.sendStatus(401);

  const user = await User.findById(userId);
  if(!user) return res.sendStatus(403);
  
  const userPracticeData = user.practice.map(p=>({
    language: p.language,
    solved: p.solved,
    total: p.total,
    completed: p.completed
  }));

  res.status(200).json({userPracticeData});
}

module.exports = { practiceQuestions, submitPractice, practiceData };

// Helper to get next round cursor
function getNextCursor(session, currentCursor) {
  const index = session.rounds.findIndex(r => r.cursor === currentCursor);
  if (index >= 0 && index + 1 < session.rounds.length) {
    return session.rounds[index + 1].cursor;
  }
  return null;
}



