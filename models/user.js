const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const userSchema = new mongoose.Schema({
  firstName: {type: String, trim: true, required: true},
  lastName: {type: String, trim: true, required: true},
  email: {type: String, trim: true, required: true, unique: true},
  favouriteLine: {type: String, trim: true, required: true},
  passwordHash: {type: String, required: true}
},{
  timestamps: true
});

userSchema
  .virtual('password')
  .set(setPassword);

function setPassword(password){
  this._password = password;
  this.passwordHash = bcrypt.hashSync(password, bcrypt.genSaltSync(8));
}

function validatePassword(password){
  return bcrypt.compareSync(password, this.passwordHash);
}

userSchema.methods.validatePassword = validatePassword;

userSchema
  .virtual('passwordConfirmation')
  .set(setPasswordConfirmation);

function setPasswordConfirmation(passwordConfirmation){
  this._passwordConfirmation = passwordConfirmation;
}

userSchema
  .path('passwordHash')
  .validate(validatePasswordConfirmation);

function validatePasswordConfirmation(){
  console.log('validatePasswordConfirmation');
  if (this.isNew){
    if (!this._password){
      return this.invalidate('password', 'a password is required');
    }
    if (this._password !== this._passwordConfirmation){
      return this.invalidate('passwordHash', 'password\'s dont match');
    }
  }
}

userSchema.set('toJSON', {
  transform: function(doc, ret) {
    delete ret.passwordHash;
    delete ret.__v;
    return ret;
  }
});

module.exports = mongoose.model('User', userSchema);
