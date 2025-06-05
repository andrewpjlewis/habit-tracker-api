const express = require('express');
const Habit = require('../models/Habit');
const router = express.Router();

// Create a new habit
router.post('/', async (req, res) => {
  /*
  #swagger.tags = ['Habits']
  #swagger.summary = 'Create a new habit'
  #swagger.parameters['body'] = {
      in: 'body',
      required: true,
      schema: {
              "title": "Morning Jog",
              "description": "Jog for 30 minutes",
              "frequency": "daily",
              "userId": "6842038aecd9d47a2a9ae467"
}
  }
  #swagger.responses[201] = { description: 'Habit created successfully' }
  #swagger.responses[500] = { description: 'Failed to create habit' }
  */
  const { title, description, frequency, userId } = req.body;
  if (!title || !frequency || !userId) {
    return res.status(400).json({ message: 'Title, frequency, and userId are required' });
  }
  try {
    const newHabit = new Habit({ title, description, frequency, userId });
    await newHabit.save();
    res.status(201).json({ message: 'Habit created successfully', habit: newHabit });
  } catch (error) {
    res.status(500).json({ message: 'Failed to create habit', error: error.message });
  }
});

// Get all habits (optionally filtered by userId)
router.get('/all', async (req, res) => {
  /*
    #swagger.tags = ['Habits']
    #swagger.summary = 'Get all habits (optionally filtered by userId)'
    #swagger.parameters['userId'] = {
      in: 'query',
      required: false,
      type: 'string',
      description: 'Filter habits by user ID'
    }
    #swagger.responses[200] = { description: 'List of habits' }
    #swagger.responses[500] = { description: 'Failed to fetch habits' }
  */
  try {
    const filter = {};
    if (req.query.userId) {
      filter.userId = req.query.userId;
    }
    const habits = await Habit.find(filter);
    res.json(habits);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch habits', error: error.message });
  }
});

// Get a single habit by ID
router.get('/:id', async (req, res) => {
  /*
    #swagger.tags = ['Habits']
    #swagger.summary = 'Get a single habit by ID'
    #swagger.parameters['id'] = {
      in: 'path',
      required: true,
      type: 'string',
      description: 'Habit ID'
    }
    #swagger.responses[200] = { description: 'A habit object' }
    #swagger.responses[404] = { description: 'Habit not found' }
    #swagger.responses[500] = { description: 'Failed to fetch habit' }
  */
  try {
    const habit = await Habit.findById(req.params.id);
    if (!habit) return res.status(404).json({ message: 'Habit not found' });
    res.json(habit);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch habit', error: error.message });
  }
});

// Update a habit by ID
router.put('/:id', async (req, res) => {
  /*
    #swagger.tags = ['Habits']
    #swagger.summary = 'Update a habit by ID'
    #swagger.parameters['id'] = {
      in: 'path',
      required: true,
      type: 'string',
      description: 'Habit ID'
    }
    #swagger.parameters['body'] = {
      in: 'body',
      required: true,
      schema: {
        title: 'Updated Title',
        description: 'Updated description',
        frequency: 'weekly'
      }
    }
    #swagger.responses[204] = { description: 'Habit updated successfully with no content returned' }
    #swagger.responses[404] = { description: 'Habit not found' }
    #swagger.responses[400] = { description: 'No fields provided for update' }
    #swagger.responses[500] = { description: 'Failed to update habit' }
  */
  if (!req.body.title && !req.body.description && !req.body.frequency && !req.body.startDate && !req.body.endDate) {
    return res.status(400).json({ message: 'At least one field must be provided for update' });
  }
  try {
    const updatedHabit = await Habit.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updatedHabit) return res.status(404).json({ message: 'Habit not found' });

    // Send 204 No Content status with no response body
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ message: 'Failed to update habit', error: error.message });
  }
});

// Delete a habit by ID
router.delete('/:id', async (req, res) => {
  /*
    #swagger.tags = ['Habits']
    #swagger.summary = 'Delete a habit by ID'
    #swagger.parameters['id'] = {
      in: 'path',
      required: true,
      type: 'string',
      description: 'Habit ID'
    }
    #swagger.responses[200] = { description: 'Habit deleted successfully' }
    #swagger.responses[404] = { description: 'Habit not found' }
    #swagger.responses[500] = { description: 'Failed to delete habit' }
  */
  try {
    const deletedHabit = await Habit.findByIdAndDelete(req.params.id);
    if (!deletedHabit) return res.status(404).json({ message: 'Habit not found' });
    res.json({ message: 'Habit deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete habit', error: error.message });
  }
});

module.exports = router;
