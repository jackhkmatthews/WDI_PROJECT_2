module.exports = {
  port: process.env.PORT || 3000,
  db: process.env.MONGODB_URI || 'mongodb://localhost/tube-map',
  secret: process.env.SECRET || 'secret'
};
