const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema({
    languageName: {
        type: String,
        required: true,
        enum: ["JavaScript", "Python", "Java", "HTML", "CSS", "React", "Express", "C", "C++", "MySQL", "MongoDB", "Php"] // restrict to known langs
    },
    topic: {
        type: String,
        required: true,
    },
    difficulty: {
        type: String,
        enum: ["easy", "medium", "hard"],
        default: "easy"
    },
    question: {
        type: String,
        required: true,
    },
    options: {
        type: [String],
        validate: v => Array.isArray(v) && v.length > 1
    },
    answer: {
        option: { type: String, required: true },
        explanation: { type: String }
    }
}, { timestamps: true });

module.exports = mongoose.model('Question', questionSchema);
