const express = require('express');
const mongoose = require('mongoose');
const Log = require('../models/Habitlog');
const router = express.Router();

// Helper function to validate ObjectId
function isValidObjectId(id) {
  return mongoose.Types.ObjectId.isValid(id);
}

// Create a new log entry for a habit
router.post('/', async (req, res) => {
  /*
    #swagger.tags = ['Logs']
    #swagger.summary = 'Create a new log entry for a habit'
    #swagger.parameters['body'] = {
      in: 'body',
      required: true,
      schema: {
        habitId: '60f7f1a2c9e1f829b8a2f9a4',
        date: '2025-05-22T00:00:00.000Z',
        notes: 'Felt great after completing the habit!'
      }
    }
    #swagger.responses[201] = { description: 'Log created successfully' }
    #swagger.responses[400] = { description: 'Validation error' }
    #swagger.responses[500] = { description: 'Failed to create log' }
  */
  const { habitId, date, notes } = req.body;
  if (!habitId || !date) {
    return res.status(400).json({ message: 'habitId and date are required' });
  }
  if (!isValidObjectId(habitId)) {
    return res.status(400).json({ message: 'Invalid habitId format' });
  }
  if (isNaN(Date.parse(date))) {
    return res.status(400).json({ message: 'Invalid date format' });
  }

  try {
    const newLog = new Log({ habitId, date, notes });
    await newLog.save();
    res.status(201).json({ message: 'Log created successfully', log: newLog });
  } catch (error) {
    res.status(500).json({ message: 'Failed to create log', error: error.message });
  }
});

// Get all logs for a specific habit
router.get('/habit/:habitId', async (req, res) => {
  /*
    #swagger.tags = ['Logs']
    #swagger.summary = 'Get all logs for a specific habit'
    #swagger.parameters['habitId'] = {
      in: 'path',
      required: true,
      type: 'string',
      description: 'ID of the habit to fetch logs for'
    }
    #swagger.responses[200] = { description: 'List of logs for the habit' }
    #swagger.responses[400] = { description: 'Invalid habitId format' }
    #swagger.responses[500] = { description: 'Failed to fetch logs' }
  */
  const { habitId } = req.params;
  if (!isValidObjectId(habitId)) {
    return res.status(400).json({ message: 'Invalid habitId format' });
  }
  try {
    const logs = await Log.find({ habitId });
    res.json(logs);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch logs', error: error.message });
  }
});

// Get a single log entry by ID
router.get('/:id', async (req, res) => {
  /*
    #swagger.tags = ['Logs']
    #swagger.summary = 'Get a single log entry by ID'
    #swagger.parameters['id'] = {
      in: 'path',
      required: true,
      type: 'string',
      description: 'ID of the log entry'
    }
    #swagger.responses[200] = { description: 'The requested log entry' }
    #swagger.responses[400] = { description: 'Invalid ID format' }
    #swagger.responses[404] = { description: 'Log not found' }
    #swagger.responses[500] = { description: 'Failed to fetch log' }
  */
  const { id } = req.params;
  if (!isValidObjectId(id)) {
    return res.status(400).json({ message: 'Invalid log ID format' });
  }
  try {
    const log = await Log.findById(id);
    if (!log) return res.status(404).json({ message: 'Log not found' });
    res.json(log);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch log', error: error.message });
  }
});

// Update a log entry by ID
router.put('/:id', async (req, res) => {
  /*
    #swagger.tags = ['Logs']
    #swagger.summary = 'Update a log entry by ID'
    #swagger.parameters['id'] = {
      in: 'path',
      required: true,
      type: 'string',
      description: 'ID of the log entry to update'
    }
    #swagger.parameters['body'] = {
      in: 'body',
      required: true,
      schema: {
        notes: 'Updated notes about the habit',
        date: '2025-05-22T00:00:00.000Z',
        habitId: '60f7f1a2c9e1f829b8a2f9a4'
      }
    }
    #swagger.responses[204] = { description: 'Log updated successfully, no content returned' }
    #swagger.responses[400] = { description: 'Validation error or no fields provided' }
    #swagger.responses[404] = { description: 'Log not found' }
    #swagger.responses[500] = { description: 'Failed to update log' }
  */
  const { id } = req.params;
  const { notes, date, habitId } = req.body;

  if (!isValidObjectId(id)) {
    return res.status(400).json({ message: 'Invalid log ID format' });
  }
  if (!notes && !date && !habitId) {
    return res.status(400).json({ message: 'At least one field must be provided for update' });
  }
  if (habitId && !isValidObjectId(habitId)) {
    return res.status(400).json({ message: 'Invalid habitId format' });
  }
  if (date && isNaN(Date.parse(date))) {
    return res.status(400).json({ message: 'Invalid date format' });
  }

  try {
    const updatedLog = await Log.findByIdAndUpdate(id, req.body, { new: true });
    if (!updatedLog) return res.status(404).json({ message: 'Log not found' });
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ message: 'Failed to update log', error: error.message });
  }
});

// Delete a log entry by ID
router.delete('/:id', async (req, res) => {
  /*
    #swagger.tags = ['Logs']
    #swagger.summary = 'Delete a log entry by ID'
    #swagger.parameters['id'] = {
      in: 'path',
      required: true,
      type: 'string',
      description: 'ID of the log entry to delete'
    }
    #swagger.responses[200] = { description: 'Log deleted successfully' }
    #swagger.responses[400] = { description: 'Invalid ID format' }
    #swagger.responses[404] = { description: 'Log not found' }
    #swagger.responses[500] = { description: 'Failed to delete log' }
  */
  const { id } = req.params;
  if (!isValidObjectId(id)) {
    return res.status(400).json({ message: 'Invalid log ID format' });
  }
  try {
    const deletedLog = await Log.findByIdAndDelete(id);
    if (!deletedLog) return res.status(404).json({ message: 'Log not found' });
    res.json({ message: 'Log deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete log', error: error.message });
  }
});

module.exports = router;
