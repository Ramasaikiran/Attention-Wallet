const express = require('express');
const router = express.Router();
const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Temporary in-memory OTP store (Use Redis in production)
const otpStore = {};

// @route   POST /api/auth/register
// @desc    Register user with Mobile and Parent PIN
router.post('/register', async (req, res) => {
    const { mobile, pin } = req.body;

    if (!mobile || !pin) {
        return res.status(400).json({ error: 'Please enter mobile number and PIN' });
    }

    if (pin.length < 4) {
        return res.status(400).json({ error: 'PIN must be at least 4 digits' });
    }

    try {
        let user = await User.findOne({ mobile });
        if (user) {
            return res.status(400).json({ error: 'Mobile number already registered' });
        }

        user = new User({
            mobile,
            pin
        });

        // Hash PIN
        const salt = await bcrypt.genSalt(10);
        user.pin = await bcrypt.hash(pin, salt);

        await user.save();

        res.json({ message: 'Registration successful! Please login.' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server Error' });
    }
});

// @route   POST /api/auth/login/otp
// @desc    Request OTP for Login
router.post('/login/otp', async (req, res) => {
    const { mobile } = req.body;

    if (!mobile) {
        return res.status(400).json({ error: 'Please enter mobile number' });
    }

    try {
        const user = await User.findOne({ mobile });
        if (!user) {
            return res.status(400).json({ error: 'User not found. Please register first.' });
        }

        // Generate 6 digit OTP
        const otp = Math.floor(100000 + Math.random() * 900000).toString();

        // Store OTP (expires in 5 mins) usually, but for now just overwrite
        otpStore[mobile] = otp;

        console.log(`### OTP for ${mobile}: ${otp} ###`); // Log to console for testing

        res.json({ message: 'OTP sent to mobile number', success: true });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server Error' });
    }
});

// @route   POST /api/auth/login/verify
// @desc    Verify OTP and Login
router.post('/login/verify', async (req, res) => {
    const { mobile, otp } = req.body;

    if (!mobile || !otp) {
        return res.status(400).json({ error: 'Please enter mobile and OTP' });
    }

    try {
        const storedOtp = otpStore[mobile];

        if (!storedOtp || storedOtp !== otp) {
            return res.status(400).json({ error: 'Invalid or Expired OTP' });
        }

        // OTP Valid - Get User
        const user = await User.findOne({ mobile });
        if (!user) {
            return res.status(400).json({ error: 'User not found' });
        }

        // Clear OTP
        delete otpStore[mobile];

        // Create Token
        const payload = {
            user: {
                id: user.id
            }
        };

        jwt.sign(
            payload,
            process.env.JWT_SECRET || 'secret',
            { expiresIn: '30d' },
            (err, token) => {
                if (err) throw err;
                res.json({ token, user: { id: user.id, mobile: user.mobile } });
            }
        );
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server Error' });
    }
});

module.exports = router;
