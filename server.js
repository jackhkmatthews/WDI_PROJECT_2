const express  = require('express');
const app      = express();
const cors     = require('cors');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const config = require('./config/config');
mongoose.Promise = global.Promise;
const staticRouter   = require('./config/static-routes');
const tflRouter = require('./config/tfl-routes');
const apiRouter = require('./config/api-routes');
const userRouter = require('./config/user-routes');

mongoose.connect(config.db, () => console.log(`connected to ${config.db}`));

app.use(express.static(`${__dirname}/public`));
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use('/tfl', tflRouter);
app.use('/api', apiRouter);
app.use('/users', userRouter);
app.use('/', staticRouter);

app.listen(config.port, console.log(`Server has stated on port: ${config.port}`));
