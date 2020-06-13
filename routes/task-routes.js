const express = require('express');
const mongoose = require('mongoose');
const Task = require('../models/task-model');
const Trail = require('../models/trail-model');

const router = express.Router();

router.get('/trails/:trailId/tasks/:taskId', (req, res, next) => {
  Task.findById(req.params.taskId)
    .then(task => {
      res.json(task);
    })
    .catch(error => {
      res.json(error);
    });
});

router.post('/tasks', (req, res, next) => {
  Task.create({
    title: req.body.title,
    description: req.body.description,
    trail: req.body.trailID
  })
    .then(response => {
      return Trail.findByIdAndUpdate(req.body.trailID, {
        $push: { tasks: response._id }
      });
    })
    .then(theResponse => {
      res.json(theResponse);
    })
    .catch(err => {
      res.json(err);
    });
});

// PUT route => to update a specific task
router.put('/tasks/:id', (req, res, next) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    res.status(400).json({ message: 'Specified id is not valid' });
    return;
  }

  Task.findByIdAndUpdate(req.params.id, req.body)
    .then(() => {
      res.json({ message: `Task with ${req.params.id} is updated successfully.` });
    })
    .catch(err => {
      res.json(err);
    });
});

// DELETE route => to delete a specific task
router.delete('/tasks/:id', (req, res, next) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    res.status(400).json({ message: 'Specified id is not valid' });
    return;
  }

  Task.findByIdAndRemove(req.params.id)
    .then(() => {
      res.json({ message: `Task with ${req.params.id} is removed successfully.` });
    })
    .catch(error => {
      res.json(error);
    });
});

module.exports = router;
