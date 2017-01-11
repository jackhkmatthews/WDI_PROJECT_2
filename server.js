const express  = require('express');
const app      = express();
const cors     = require('cors');
const mongoose = require('mongoose');
mongoose.Promise = global.Promise;
const rp = require('request-promise');
const routes   = require('./config/routes');
const port     = process.env.PORT || 3000;

app.use(express.static(`${__dirname}/public`));
app.use(cors());

app.get('/api/lines/:line', (req, res) => {
  return rp(`https://api.tfl.gov.uk/Line/${req.params.line}/StopPoints?app_id=835d0307&app_key=42620817a4da70de276d15fc45a73e1a`)
    .then(htmlString => {
      const data = JSON.parse(htmlString);
      return res.status(200).json(data);
    })
    .catch(err => {
      return res.status(500).json(err);
    });
});


app.use('/', routes);

app.listen(port, console.log(`Server has stated on port: ${port}`));
