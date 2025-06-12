const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const Joi = require('joi');
const mongoose = require('mongoose');
const User = require('../models/User');

const router = express.Router();

const JWT_SECRET = process.env.JWT_SECRET;
const SALT_ROUNDS = 10;

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

// Register
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
    #swagger.responses[201] = { description: 'User registered successfully' }
    #swagger.responses[400] = { description: 'Validation error or user already exists' }
    */
    const { error } = registerSchema.validate(req.body);
    if (error) return res.status(400).json({ message: error.details[0].message });

    const { name, email, password } = req.body;
    try {
        const existingUser = await User.findOne({ email });
        if (existingUser) return res.status(400).json({ message: 'User already exists' });

        const newUser = new User({ name, email, password });
        await newUser.save();

        res.status(201).json({ message: 'User registered successfully' });
    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message });
    }
});

// Login
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
    #swagger.responses[200] = { description: 'Login successful with JWT' }
    #swagger.responses[400] = { description: 'Validation error or invalid credentials' }
    */
    const { error } = loginSchema.validate(req.body);
    if (error) return res.status(400).json({ message: error.details[0].message });

    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });
        if (!user) return res.status(400).json({ message: 'Invalid email or password' });

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).json({ message: 'Invalid email or password' });

        const token = jwt.sign({ _id: user._id, email: user.email }, JWT_SECRET, { expiresIn: '7d' });

        res.json({
            message: 'Login successful',
            token,
            userId: user._id,
            name: user.name,
            email: user.email
        });
    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message });
    }
});

// Get all users
router.get('/all', async (req, res) => {
    /*
    #swagger.tags = ['Auth']
    #swagger.summary = 'Get all users'
    #swagger.responses[200] = {
        description: 'List of all users',
        schema: [{ $ref: "#/definitions/User" }]
    }
    */
    try {
        const users = await User.find();
        res.json(users);
    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message });
    }
});

// Get user by ID
router.get('/user/:id', async (req, res) => {
    /*
    #swagger.tags = ['Auth']
    #swagger.summary = 'Get a user by ID'
    #swagger.parameters['id'] = {
        in: 'path',
        required: true,
        type: 'string'
    }
    #swagger.responses[200] = { description: 'User found' }
    #swagger.responses[404] = { description: 'User not found' }
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

// Delete user by ID
router.delete('/user/:id', async (req, res) => {
    /*
    #swagger.tags = ['Auth']
    #swagger.summary = 'Delete a user by ID'
    #swagger.parameters['id'] = {
        in: 'path',
        required: true,
        type: 'string'
    }
    #swagger.responses[200] = { description: 'User deleted successfully' }
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
