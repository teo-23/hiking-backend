const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const taskSchema = new Schema({
  title: String,
  description: String,
  trail: {
    type: Schema.Types.ObjectId,
    ref: 'Trail'
  }
});

const Task = mongoose.model('Task', taskSchema);

module.exports = Task;
