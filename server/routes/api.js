const express = require('express');
const router = express.Router();
const Transaction = require('../models/Transaction');

// Configuration for rates (Could be moved to DB/Config file)
const EARN_RATES = {
    'Reading': 10,       // per hour
    'Exercise': 15,      // per hour
    'Homework': 20,      // per hour
    'Family Time': 10    // per hour
};

const SPEND_COSTS = {
    'YouTube': 5,        // per minute
    'Instagram': 4,      // per minute
    'Video Games': 3,    // per minute
    'Learning App': 1    // per minute
};

// Utility to calculate balance using Aggregation (Much faster)
const calculateBalance = async () => {
    const result = await Transaction.aggregate([
        {
            $group: {
                _id: null,
                totalEarned: {
                    $sum: {
                        $cond: [{ $eq: ["$type", "earn"] }, "$amount", 0]
                    }
                },
                totalSpent: {
                    $sum: {
                        $cond: [{ $eq: ["$type", "spend"] }, "$amount", 0]
                    }
                }
            }
        },
        {
            $project: {
                balance: { $subtract: ["$totalEarned", "$totalSpent"] }
            }
        }
    ]);

    return result.length > 0 ? result[0].balance : 0;
};

const auth = require('../middleware/auth');

// ... (existing imports)

// @route   GET /api/stats
// @desc    Get current balance and stats
router.get('/stats', auth, async (req, res) => {
    try {
        // ... (existing logic)
        const balance = await calculateBalance();
        const transactions = await Transaction.find().sort({ timestamp: -1 }).limit(20);

        // Simple aggregation for dashboard (today's stats)
        const startOfDay = new Date();
        startOfDay.setHours(0, 0, 0, 0);

        const todayStats = await Transaction.aggregate([
            { $match: { timestamp: { $gte: startOfDay } } },
            {
                $group: {
                    _id: "$type",
                    total: { $sum: "$amount" }
                }
            }
        ]);

        const earnedToday = todayStats.find(s => s._id === 'earn')?.total || 0;
        const spentToday = todayStats.find(s => s._id === 'spend')?.total || 0;

        res.json({
            balance,
            earnedToday,
            spentToday,
            history: transactions
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server Error' });
    }
});

const User = require('../models/User');
const bcrypt = require('bcryptjs');

// ...

// @route   POST /api/earn
// @desc    Log an earning activity
router.post('/earn', auth, async (req, res) => {
    const { category, minutes, password } = req.body;

    if (!password) {
        return res.status(403).json({ error: 'Parent PIN is required' });
    }

    try {
        // Find the specific logged-in user to check THEIR pin
        const parentUser = await User.findById(req.user.id);

        if (!parentUser) {
            return res.status(400).json({ error: 'User not found.' });
        }

        const isMatch = await bcrypt.compare(password, parentUser.pin);
        if (!isMatch) {
            return res.status(403).json({ error: 'Invalid Parent Approval PIN' });
        }

        if (!category || !minutes || minutes <= 0) {
            return res.status(400).json({ error: 'Category and valid minutes are required' });
        }

        const ratePerHour = EARN_RATES[category];
        if (!ratePerHour) {
            return res.status(400).json({ error: 'Invalid category' });
        }

        // Calculate amount server-side
        const amount = Math.ceil((minutes / 60) * ratePerHour);

        const newTx = new Transaction({
            type: 'earn',
            category,
            amount,
            duration: minutes,
            description: `${minutes} mins of ${category}`
        });
        await newTx.save();

        const balance = await calculateBalance();
        res.json({ message: 'Tokens earned!', balance, transaction: newTx });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server Error' });
    }
});

// @route   POST /api/spend
// @desc    Log a spending activity
router.post('/spend', auth, async (req, res) => {
    const { category, minutes } = req.body;

    if (!category || !minutes || minutes <= 0) {
        return res.status(400).json({ error: 'Category and valid minutes are required' });
    }

    const costPerMinute = SPEND_COSTS[category];
    if (!costPerMinute) {
        return res.status(400).json({ error: 'Invalid app/category' });
    }

    // Calculate cost server-side
    const cost = minutes * costPerMinute;

    try {
        const currentBalance = await calculateBalance();
        if (currentBalance < cost) {
            return res.status(400).json({ error: 'Insufficient tokens' });
        }

        const newTx = new Transaction({
            type: 'spend',
            category,
            amount: cost,
            duration: minutes,
            description: `Purchased ${minutes} mins of ${category}`
        });
        await newTx.save();

        const balance = await calculateBalance(); // Recalculate
        res.json({ message: 'Tokens spent!', balance, transaction: newTx });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server Error' });
    }
});

module.exports = router;
