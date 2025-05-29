const express = require('express');
const User = require('../models/User');
const router = express.Router();

// Register user
router.post('/register', async (req, res) => {
    /*
    #swagger.tags = ['Auth']
    #swagger.summary = 'Register a new user'
    #swagger.parameters['body'] = {
        in: 'body',
        required: true,
        schema: {
            name: 'John Doe',
            email: 'john@example.com',
            password: 'password123'
        }
    }
    #swagger.responses[200] = { description: 'User registered successfully' }
    #swagger.responses[400] = { description: 'User already exists' }
    */
    const { email, name, password } = req.body;
    if (!email || !name || !password) {
        return res.status(400).json({ message: 'Name, email, and password are required' });
    }
    try {
        const existingUser = await User.findOne({ email });
        if (existingUser) return res.status(400).json({ message: 'User already exists' });

        const newUser = new User({ name, email, password });
        await newUser.save();

        res.json({ message: 'User registered successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Login user
router.post('/login', async (req, res) => {
    /*
    #swagger.tags = ['Auth']
    #swagger.summary = 'Log in a user'
    #swagger.parameters['body'] = {
        in: 'body',
        required: true,
        schema: {
            email: 'john@example.com',
            password: 'password123'
        }
    }
    #swagger.responses[200] = { description: 'Login successful' }
    #swagger.responses[400] = { description: 'Invalid email or password' }
    */
    const { email, password } = req.body;
    if (!email || !password) {
        return res.status(400).json({ message: 'Email and password are required' });
    }
    try {
        const user = await User.findOne({ email });
        if (!user || user.password !== password) {
            return res.status(400).json({ message: 'Invalid email or password' });
        }
        res.json({ message: 'Login successful', userId: user._id });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Get all users
router.get('/all', async (req, res) => {
    /*
    #swagger.tags = ['Auth']
    #swagger.summary = 'Get all users'
    #swagger.responses[200] = {
        description: 'List of users',
        schema: [{ $ref: "#/definitions/User" }]
    }
    #swagger.responses[500] = { description: 'Server error' }
    */
    try {
        const users = await User.find();
        res.json(users);
    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message });
    }
});

// Get a user by id
router.get('/user/:id', async (req, res) => {
    /*
    #swagger.tags = ['Auth']
    #swagger.summary = 'Get a user by an id'
    #swagger.responses[200] = {
        description: 'User by id',
        schema: { $ref: "#/definitions/User" }
    }
    #swagger.responses[404] = { description: 'User not found' }
    #swagger.responses[500] = { description: 'Server error' }
    */
    try {
        const user = await User.findById(req.params.id);
        if (!user) return res.status(404).json({ message: 'User not found' });
        res.json(user);
    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message });
    }
});

// Delete a user by _id
router.delete('/id/:id', async (req, res) => {
    /*
    #swagger.tags = ['Auth']
    #swagger.summary = 'Delete a user by ID'
    #swagger.parameters['id'] = {
        in: 'path',
        description: 'User ID',
        required: true,
        type: 'string'
    }
    #swagger.responses[200] = { description: 'User deleted successfully' }
    #swagger.responses[404] = { description: 'User not found' }
    #swagger.responses[500] = { description: 'Server error' }
    */
    try {
        const deletedUser = await User.findByIdAndDelete(req.params.id);
        if (!deletedUser) return res.status(404).json({ message: 'User not found' });
        res.json({ message: 'User deleted successfully' });
    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message });
    }
});

module.exports = router;