const User = require('../models/user');

function usersRegister(req, res){
  const user = new User(req.body.user);
  user.save((err, user) => {
    if (err) return res.status(500).json({message: err});
    return res.status(200).json({
      message: 'user registed!',
      user
    });
  });
}

function usersLogin(req, res){
  User.findOne({email: req.body.user.email}, (err, user) => {
    if (err) return res.status(500).json({message: err});
    if (!user) return res.status(404).json({message: 'no match found'});
    if (user.password !== req.body.user.password) {
      return res.status(404).json({message: 'no match found'});
    }
    return res.status(200).json({
      message: 'user logged in!',
      user
    });
  });
}

module.exports = {
  register: usersRegister,
  login: usersLogin
};
