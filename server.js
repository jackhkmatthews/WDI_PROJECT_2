const express  = require('express');
const app      = express();
const cors     = require('cors');
const mongoose = require('mongoose');
const config = require('./config/config');
mongoose.Promise = global.Promise;
const rp = require('request-promise');
const routes   = require('./config/routes');
const tflRouter = require('./config/tfl-routes');
const apiRouter = require('./config/api-routes');

mongoose.connect(config.db, () => console.log(`connected to ${config.db}`));

app.use(express.static(`${__dirname}/public`));
app.use(cors());

app.use('/tfl', tflRouter);
app.use('/api', apiRouter);
app.use('/', routes);

app.listen(config.port, console.log(`Server has stated on port: ${config.port}`));
