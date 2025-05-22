const express = require('express');
const Log = require('../models/Habitlog');
const router = express.Router();

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
    #swagger.responses[500] = { description: 'Failed to create log' }
  */
  try {
    const { habitId, date, notes } = req.body;
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
    #swagger.responses[500] = { description: 'Failed to fetch logs' }
  */
  try {
    const logs = await Log.find({ habitId: req.params.habitId });
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
    #swagger.responses[404] = { description: 'Log not found' }
    #swagger.responses[500] = { description: 'Failed to fetch log' }
  */
  try {
    const log = await Log.findById(req.params.id);
    if (!log) {
      return res.status(404).json({ message: 'Log not found' });
    }
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
        notes: 'Updated notes about the habit'
      }
    }
    #swagger.responses[200] = { description: 'Log updated successfully' }
    #swagger.responses[404] = { description: 'Log not found' }
    #swagger.responses[500] = { description: 'Failed to update log' }
  */
  try {
    const updatedLog = await Log.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updatedLog) {
      return res.status(404).json({ message: 'Log not found' });
    }
    res.json({ message: 'Log updated successfully', log: updatedLog });
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
    #swagger.responses[404] = { description: 'Log not found' }
    #swagger.responses[500] = { description: 'Failed to delete log' }
  */
  try {
    const deletedLog = await Log.findByIdAndDelete(req.params.id);
    if (!deletedLog) {
      return res.status(404).json({ message: 'Log not found' });
    }
    res.json({ message: 'Log deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete log', error: error.message });
  }
});

module.exports = router;