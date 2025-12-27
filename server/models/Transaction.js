const mongoose = require('mongoose');

const TransactionSchema = new mongoose.Schema({
    type: {
        type: String,
        enum: ['earn', 'spend'],
        required: true
    },
    category: {
        type: String, // e.g., 'reading', 'youtube', 'exercise'
        required: true
    },
    amount: {
        type: Number,
        required: true
    },
    duration: {
        type: Number, // in minutes
        required: true
    },
    timestamp: {
        type: Date,
        default: Date.now
    },
    description: String
});

module.exports = mongoose.model('Transaction', TransactionSchema);
