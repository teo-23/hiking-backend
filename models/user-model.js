const mongoose = require('mongoose');
const Schema   = mongoose.Schema;

const userSchema = new Schema({
  username: String,
  password: String,
  trails: [{type: Schema.Types.ObjectId, ref: 'Trail'}],
  likedTrails: [{type: Schema.Types.ObjectId, ref: 'Trail', unique: true}],
  role: {
    type: String,
    enum: ['USER','ADMIN'],
    default: 'USER',
},
}, 
{
  timestamps: true
});

const User = mongoose.model('User', userSchema);
module.exports = User;