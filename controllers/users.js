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
  const user = new User(req.body.user);
  user.save((err, user) => {
    if (err) return res.status(500).json({message: err});
    return res.status(200).json({
      message: 'user registed!',
      user
    });
  });
}

module.exports = {
  register: usersRegister
};
