const mongoose = require('mongoose');

const testResultSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'account', required: true },
    q1: { type: String },
    q2: { type: String },
    q3: { type: String },
    q4: { type: String },
    q5: { type: String },
    q6: { type: String },
    q7: { type: String },
    q8: { type: String },
    q9: { type: String },
    q10: { type: String },
    q11: { type: String },
    q12: { type: String },
    q13: { type: String },
    q14: { type: String },
    q15: { type: String },
    q16: { type: String },
    q17: { type: String },
    q18: { type: String },
    q19: { type: String },
    q20: { type: String },
    q21: { type: String },
    timeTaken: {
        type: String,
        required: true
    },goals: { type: Number },
    assists: { type: Number },
    rating: { type: Number },
    matches: { type: Number },
      
}, { timestamps: true });

module.exports = mongoose.model('TestResult', testResultSchema);