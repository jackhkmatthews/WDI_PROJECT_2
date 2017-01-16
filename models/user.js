const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  firstName: {type: String, trim: true, required: true},
  lastName: {type: String, trim: true, required: true},
  email: {type: String, trim: true, required: true, unique: true},
  favouriteLine: {type: String, trim: true, required: true},
  password: {type: String, trim: true, required: true},
  passwordConfirmation: {type: String, required: true}
},{
  timestamps: true
});

module.exports = mongoose.model('User', userSchema);
