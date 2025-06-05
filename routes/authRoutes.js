const express = require('express');
const bcrypt = require('bcrypt');
const Joi = require('joi');
const mongoose = require('mongoose');
const User = require('../models/User');
const router = express.Router();

// Joi schemas
const registerSchema = Joi.object({
    name: Joi.string().min(2).required(),
    email: Joi.string().email().required(),
    password: Joi.string().min(6).required()
});

const loginSchema = Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().min(6).required()
});

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
    #swagger.responses[400] = { description: 'Validation error or user already exists' }
    #swagger.responses[500] = { description: 'Server error' }
    */
    const { error } = registerSchema.validate(req.body);
    if (error) return res.status(400).json({ message: error.details[0].message });

    const { email, name, password } = req.body;

    try {
        const existingUser = await User.findOne({ email });
        if (existingUser) return res.status(400).json({ message: 'User already exists' });

        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = new User({ name, email, password: hashedPassword });
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
    #swagger.responses[400] = { description: 'Validation error or invalid credentials' }
    #swagger.responses[500] = { description: 'Server error' }
    */
    const { error } = loginSchema.validate(req.body);
    if (error) return res.status(400).json({ message: error.details[0].message });

    const { email, password } = req.body;
    try {
        const user = await User.findOne({ email });
        if (!user) return res.status(400).json({ message: 'Invalid email or password' });

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).json({ message: 'Invalid email or password' });

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
    #swagger.summary = 'Get a user by ID'
    #swagger.parameters['id'] = {
        in: 'path',
        required: true,
        type: 'string',
        description: 'MongoDB ObjectId of the user'
    }
    #swagger.responses[200] = {
        description: 'User found',
        schema: { $ref: "#/definitions/User" }
    }
    #swagger.responses[400] = { description: 'Invalid user ID format' }
    #swagger.responses[404] = { description: 'User not found' }
    #swagger.responses[500] = { description: 'Server error' }
    */
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({ message: 'Invalid user ID' });
    }
    try {
        const user = await User.findById(id);
        if (!user) return res.status(404).json({ message: 'User not found' });
        res.json(user);
    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message });
    }
});

// Delete a user by ID
router.delete('/id/:id', async (req, res) => {
    /*
    #swagger.tags = ['Auth']
    #swagger.summary = 'Delete a user by ID'
    #swagger.parameters['id'] = {
        in: 'path',
        required: true,
        type: 'string',
        description: 'MongoDB ObjectId of the user'
    }
    #swagger.responses[200] = { description: 'User deleted successfully' }
    #swagger.responses[400] = { description: 'Invalid user ID format' }
    #swagger.responses[404] = { description: 'User not found' }
    #swagger.responses[500] = { description: 'Server error' }
    */
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({ message: 'Invalid user ID' });
    }
    try {
        const deletedUser = await User.findByIdAndDelete(id);
        if (!deletedUser) return res.status(404).json({ message: 'User not found' });
        res.json({ message: 'User deleted successfully' });
    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message });
    }
});

module.exports = router;