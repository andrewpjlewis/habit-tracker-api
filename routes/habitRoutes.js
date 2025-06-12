const express = require('express');
const Habit = require('../models/Habit');
const verifyToken = require('../middleware/verifyToken');
const router = express.Router();

// 🔐 Create a new habit (authenticated)
router.post('/', verifyToken, async (req, res, next) => {
  /*
  #swagger.tags = ['Habits']
  #swagger.summary = 'Create a new habit'
  #swagger.security = [{ "bearerAuth": [] }]
  #swagger.parameters['body'] = {
    in: 'body',
    required: true,
    schema: {
      name: 'Morning Jog',
      plantType: 'Rose',
      frequency: 3
    }
  }
  #swagger.responses[201] = { description: 'Habit created successfully' }
  #swagger.responses[400] = { description: 'Missing or invalid fields' }
  */
  try {
    const { name, plantType, frequency } = req.body;
    const userId = req.user._id;

    const parsedFrequency = parseInt(frequency, 10);
    if (!name || !plantType || isNaN(parsedFrequency)) {
      return res.status(400).json({ message: 'Missing or invalid required fields' });
    }

    const newHabit = new Habit({ name, plantType, frequency: parsedFrequency, userId });
    await newHabit.save();
    res.status(201).json(newHabit);
  } catch (err) {
    next(err);
  }
});

// ✅ Get all habits for the authenticated user
router.get('/', verifyToken, async (req, res, next) => {
  /*
  #swagger.tags = ['Habits']
  #swagger.summary = 'Get all habits for the logged-in user'
  #swagger.security = [{ "bearerAuth": [] }]
  #swagger.responses[200] = { description: 'List of user habits' }
  */
  try {
    const habits = await Habit.find({ userId: req.user._id }).lean();
    res.json(habits);
  } catch (err) {
    next(err);
  }
});

// ✅ Get a single habit by ID (user must own it)
router.get('/:id', verifyToken, async (req, res, next) => {
  /*
  #swagger.tags = ['Habits']
  #swagger.summary = 'Get a single habit by ID (authenticated)'
  #swagger.security = [{ "bearerAuth": [] }]
  #swagger.parameters['id'] = { in: 'path', required: true, type: 'string' }
  #swagger.responses[200] = { description: 'Habit found' }
  #swagger.responses[404] = { description: 'Habit not found' }
  */
  try {
    const habit = await Habit.findOne({ _id: req.params.id, userId: req.user._id }).lean();
    if (!habit) return res.status(404).json({ message: 'Habit not found' });
    res.json(habit);
  } catch (err) {
    next(err);
  }
});

// ✅ Increment habit progress
router.patch('/:id/complete', async (req, res, next) => {
  /*
  #swagger.tags = ['Habits']
  #swagger.summary = 'Mark a habit as complete (increment progress)'
  #swagger.parameters['id'] = { in: 'path', required: true, type: 'string' }
  #swagger.responses[200] = { description: 'Habit updated' }
  #swagger.responses[404] = { description: 'Habit not found' }
  */
  try {
    const habit = await Habit.findById(req.params.id);
    if (!habit) return res.status(404).json({ message: 'Habit not found' });

    habit.progress += 1;
    await habit.save();

    res.json(habit);
  } catch (err) {
    next(err);
  }
});

// ✅ Update a habit
router.put('/:id', async (req, res) => {
  /*
  #swagger.tags = ['Habits']
  #swagger.summary = 'Update a habit by ID'
  #swagger.parameters['id'] = { in: 'path', required: true, type: 'string' }
  #swagger.parameters['body'] = {
    in: 'body',
    required: true,
    schema: {
      title: 'Updated Habit',
      description: 'Updated description',
      frequency: 4,
      startDate: '2025-06-01',
      endDate: '2025-07-01'
    }
  }
  #swagger.responses[204] = { description: 'Habit updated successfully' }
  #swagger.responses[404] = { description: 'Habit not found' }
  #swagger.responses[400] = { description: 'No fields provided' }
  */
  if (!req.body.title && !req.body.description && !req.body.frequency && !req.body.startDate && !req.body.endDate) {
    return res.status(400).json({ message: 'At least one field must be provided for update' });
  }
  try {
    const updatedHabit = await Habit.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updatedHabit) return res.status(404).json({ message: 'Habit not found' });

    res.status(204).send(); // No content
  } catch (err) {
    res.status(500).json({ message: 'Failed to update habit', error: err.message });
  }
});

// ✅ Delete a habit by ID (authenticated and owned by user)
router.delete('/:id', verifyToken, async (req, res, next) => {
  /*
  #swagger.tags = ['Habits']
  #swagger.summary = 'Delete a habit by ID'
  #swagger.security = [{ "bearerAuth": [] }]
  #swagger.parameters['id'] = { in: 'path', required: true, type: 'string' }
  #swagger.responses[200] = { description: 'Habit deleted successfully' }
  #swagger.responses[404] = { description: 'Habit not found' }
  */
  try {
    const deletedHabit = await Habit.findOneAndDelete({ _id: req.params.id, userId: req.user._id });
    if (!deletedHabit) return res.status(404).json({ message: 'Habit not found' });

    res.json({ message: 'Habit deleted successfully' });
  } catch (err) {
    next(err);
  }
});

// 🔓 Public: Get all habits (optional filter by userId)
router.get('/all', async (req, res) => {
  /*
  #swagger.tags = ['Habits']
  #swagger.summary = 'Get all habits (optionally filtered by userId)'
  #swagger.parameters['userId'] = {
    in: 'query',
    type: 'string',
    description: 'Filter habits by userId'
  }
  #swagger.responses[200] = { description: 'List of habits' }
  */
  try {
    const filter = {};
    if (req.query.userId) filter.userId = req.query.userId;

    const habits = await Habit.find(filter);
    res.json(habits);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch habits', error: err.message });
  }
});

module.exports = router;
