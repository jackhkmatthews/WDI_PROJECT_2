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

app.get('/api/lines/:from/:to', (req, res) => {
  return rp(`https://api.tfl.gov.uk/Journey/JourneyResults/${req.params.from}/to/${req.params.to}?date=20170111&time=2045&journeyPreference=LeastInterchange&mode=tube&accessibilityPreference=NoSolidStairs&walkingOptimization=false&app_id=835d0307&app_key=42620817a4da70de276d15fc45a73e1a`)
    .then(htmlString => {
      const data = JSON.parse(htmlString);
      return res.status(200).json(data);
    })
    .catch(err => {
      res.redirect(`/api/line/${req.params.from}/${req.params.to}`);
      console.log('redirected to try again');
      return res.status(500).json(err);
    });
});

app.get('/api/StopPoint/:stationId/Arrivals/:direction', (req, res) => {
  return rp(`https://api.tfl.gov.uk/StopPoint/${req.params.stationId}/Arrivals?app_id=835d0307&app_key=42620817a4da70de276d15fc45a73e1a`)
    .then(htmlString => {
      const data = JSON.parse(htmlString);

      const directionTrains = [];

      for (var i = 0; i < data.length; i++) {
        if (data[i].platformName.includes(req.params.direction)){
          directionTrains.push(data[i]);
        }
      }

      let nextArrival = directionTrains[0];
      if (nextArrival) {
        var nextArrivalTime = nextArrival.timeToStation;
      } else {
        console.log(`no trains in the direction. ${nextArrival}, is undefined`);
        setTimeout(function(){
          res.redirect(`/api/StopPoint/${req.params.stationId}/Arrivals/${req.params.direction}`);
        }, 5000);
        console.log('redirected to try again');
      }

      for (var j = 0; j < directionTrains.length; j++) {
        if (directionTrains[j].timeToStation < nextArrivalTime){
          nextArrival = directionTrains[j];
        }
      }

      console.log(nextArrival);
      return res.status(200).json(nextArrival);
    })
    .catch(err => {
      console.log(err);
    });
});

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
