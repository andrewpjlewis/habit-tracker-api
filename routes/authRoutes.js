const express = require('express');
const User = require('../models/User');
const router = express.Router();

// Register user
router.post('/register', async (req, res) => {
    const { email, name, password } = req.body;
    
    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ message: 'User already exists' });

    // Save user
    const newUser = new User({ name, email, password });
    await newUser.save();

    res.json({ message: 'User registered successfully '});
});

// Login user
router.post('/login', async (req, res) => {
    const { email, password } = req.body;

    // Find user
    const user = await User.findOne({ email });
    if (!user || user.password !== password) {
        return res.status(400).json({ message: 'Invalid email or password' });
    }

    // Simple login confirmation
    res.json({ message: 'Login successful', userId: user._id });
})

module.exports = router;