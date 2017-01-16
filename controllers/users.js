const User = require('../models/user');
const jwt = require('jsonwebtoken');
const config = require('../config/config');

function usersRegister(req, res){
  const user = new User(req.body.user);
  user.save((err, user) => {
    if (err) return res.status(500).json({message: err});

    const token = jwt.sign(user._id, config.secret, { expiresIn: 60*60*24 });

    return res.status(200).json({
      message: 'user registed!',
      user,
      token
    });
  });
}

function usersLogin(req, res){
  User.findOne({email: req.body.user.email}, (err, user) => {
    if (err) return res.status(500).json({message: err});
    if (!user) return res.status(404).json({message: 'no match found'});
    if (!user.validatePassword(req.body.user.password)) {
      return res.status(404).json({message: 'no match found: password didnt match'});
    }

    const token = jwt.sign(user._id, config.secret, { expiresIn: 60*60*24 });

    return res.status(200).json({
      message: 'user logged in!',
      user,
      token
    });
  });
}

module.exports = {
  register: usersRegister,
  login: usersLogin
};
