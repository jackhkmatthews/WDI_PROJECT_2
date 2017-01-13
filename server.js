const express  = require('express');
const app      = express();
const cors     = require('cors');
const mongoose = require('mongoose');
mongoose.Promise = global.Promise;
const rp = require('request-promise');
const routes   = require('./config/routes');
const port     = process.env.PORT || 3000;
const tflRouter = require('./config/tfl-routes');
const apiRouter = require('./config/api-routes');

app.use(express.static(`${__dirname}/public`));
app.use(cors());

app.use('/tfl', tflRouter);
app.use('/api', apiRouter);
app.use('/', routes);

app.listen(port, console.log(`Server has stated on port: ${port}`));
