const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const User = require('./user-model');
 
const trailSchema = new Schema({
  name: {type: String, required: true},
  summary: {type: String, required: true},
  imgSmall: String,
  difficulty: String,
  stars: Number,
  latitude: Number,
  longitude: Number,
  owner: {type: Schema.Types.ObjectId, ref: 'User'}
});

const Trail = mongoose.model('Trail', trailSchema);

module.exports = Trail;
