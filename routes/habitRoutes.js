const express = require('express');
const Habit = require('../models/Habit'); // Your Mongoose model
const router = express.Router();

// Create a new habit
router.post('/', async (req, res) => {
  try {
    const { title, description, frequency, userId } = req.body;

    const newHabit = new Habit({
      title,
      description,
      frequency,
      userId,
    });

    await newHabit.save();

    res.status(201).json({ message: 'Habit created successfully', habit: newHabit });
  } catch (error) {
    res.status(500).json({ message: 'Failed to create habit', error: error.message });
  }
});

// Get all habits
router.get('/all', async (req, res) => {
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
  try {
    const habit = await Habit.findById(req.params.id);

    if (!habit) {
      return res.status(404).json({ message: 'Habit not found' });
    }

    res.json(habit);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch habit', error: error.message });
  }
});

// Update a habit by ID
router.put('/:id', async (req, res) => {
  try {
    const updatedHabit = await Habit.findByIdAndUpdate(req.params.id, req.body, { new: true });

    if (!updatedHabit) {
      return res.status(404).json({ message: 'Habit not found' });
    }

    res.json({ message: 'Habit updated successfully', habit: updatedHabit });
  } catch (error) {
    res.status(500).json({ message: 'Failed to update habit', error: error.message });
  }
});

// Delete a habit by ID
router.delete('/:id', async (req, res) => {
  try {
    const deletedHabit = await Habit.findByIdAndDelete(req.params.id);

    if (!deletedHabit) {
      return res.status(404).json({ message: 'Habit not found' });
    }

    res.json({ message: 'Habit deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete habit', error: error.message });
  }
});

module.exports = router;