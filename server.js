const express  = require('express');
const app      = express();
const cors     = require('cors');
const mongoose = require('mongoose');
mongoose.Promise = global.Promise;
const morgan = require('morgan');
const bodyParser = require('body-parser');
const expressJwt = require('express-jwt');

const config = require('./config/config');
const staticRouter   = require('./config/static-routes');
const tflRouter = require('./config/tfl-routes');
const apiRouter = require('./config/api-routes');
const userRouter = require('./config/user-routes');

mongoose.connect(config.db, () => console.log(`connected to ${config.db}`));

app.use(morgan('dev'));
app.use(express.static(`${__dirname}/public`));
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use('/users', expressJwt({ secret: config.secret})
  .unless({
    path: [
      {url: '/users/login', method: 'POST'},
      {url: '/users/register', method: 'POST'}
    ]
  }));

app.use(jwtErrorHandler);

function jwtErrorHandler(err, req, res, next){
  if (err.name !== 'UnauthorizedError') return next();
  return res.status(401).json({ message: 'Unauthorized request.' });
}

app.use('/tfl', tflRouter);
app.use('/api', apiRouter);
app.use('/users', userRouter);
app.use('/', staticRouter);

app.listen(config.port, console.log(`Server has stated on port: ${config.port}`));
