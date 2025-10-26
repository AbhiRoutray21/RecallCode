const mongoose = require("mongoose");

const TopicsSchema = new mongoose.Schema({
  language: { type: String, required: true },
  topics: [String],
});

module.exports = mongoose.model("Topics", TopicsSchema);