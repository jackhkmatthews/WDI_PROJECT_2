const express  = require('express');
const app      = express();
const cors     = require('cors');
const routes   = require('./config/routes');
const port     = process.env.PORT || 3000;

app.use(express.static(`${__dirname}/public`));
app.use(cors());
app.use('/', routes);

app.listen(port, console.log(`Server has stated on port: ${port}`));
