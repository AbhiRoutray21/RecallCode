const mongoose = require("mongoose");

const PracticeSessionSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  language: { type: String, required: true },
  rounds: [
    {
      cursor: { type: String, required: true }, // unique for each batch
      questionIds: [{ type: String, required: true }],
      submitted: { type: Boolean, default: false },
      result: {
        totalQues: { type: Number, default: 0 },
        correctCount: { type: Number, default: 0 },
      },
    },
  ],
  createdAt: { type: Date, default: Date.now },
  expiresAt: { type: Date, required: true, index: { expires: 0 } }
});

module.exports = mongoose.model("PracticeSession", PracticeSessionSchema);

