const express = require('express');
const router = express.Router();
const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Temporary in-memory OTP store (Use Redis in production)
const registrationOtpStore = {};

// @route   POST /api/auth/register/otp
// @desc    Step 1: Request OTP for Registration
router.post('/register/otp', async (req, res) => {
    const { mobile } = req.body;

    if (!mobile) {
        return res.status(400).json({ error: 'Please enter mobile number' });
    }

    try {
        const user = await User.findOne({ mobile });
        if (user) {
            return res.status(400).json({ error: 'Mobile number already registered. Please Login.' });
        }

        // Generate 6 digit OTP
        const otp = Math.floor(100000 + Math.random() * 900000).toString();

        // Store OTP
        registrationOtpStore[mobile] = otp;

        console.log(`### REGISTRATION OTP for ${mobile}: ${otp} ###`);

        res.json({ message: 'OTP sent to mobile number', success: true });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server Error' });
    }
});

// @route   POST /api/auth/register
// @desc    Step 2: Verify OTP and Register
router.post('/register', async (req, res) => {
    const { mobile, otp, password, pin } = req.body;

    if (!mobile || !otp || !password || !pin) {
        return res.status(400).json({ error: 'Please enter all fields' });
    }

    if (pin.length < 4) {
        return res.status(400).json({ error: 'PIN must be at least 4 digits' });
    }

    try {
        // Verify OTP
        const storedOtp = registrationOtpStore[mobile];
        if (!storedOtp || storedOtp !== otp) {
            return res.status(400).json({ error: 'Invalid or Expired OTP' });
        }

        // Double check user existence
        let user = await User.findOne({ mobile });
        if (user) {
            return res.status(400).json({ error: 'Mobile number already registered' });
        }

        user = new User({
            mobile,
            password,
            pin
        });

        // Hash Password
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(password, salt);
        // Hash PIN
        user.pin = await bcrypt.hash(pin, salt);

        await user.save();

        // Clear OTP
        delete registrationOtpStore[mobile];

        res.json({ message: 'Registration successful! You can now login.' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server Error' });
    }
});

// @route   POST /api/auth/login
// @desc    Login with Mobile and Password
router.post('/login', async (req, res) => {
    const { mobile, password } = req.body;

    if (!mobile || !password) {
        return res.status(400).json({ error: 'Please enter mobile and password' });
    }

    try {
        const user = await User.findOne({ mobile });
        if (!user) {
            return res.status(400).json({ error: 'Invalid Credentials' });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ error: 'Invalid Credentials' });
        }

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
