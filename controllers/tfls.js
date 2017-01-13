const rp = require('request-promise');

function tflsJourneyResults(req, res) {
  return rp(`https://api.tfl.gov.uk/Journey/JourneyResults/${req.params.origin}/to/${req.params.destination}?journeyPreference=LeastInterchange&mode=tube&accessibilityPreference=NoSolidStairs&walkingOptimization=false&app_id=835d0307&app_key=42620817a4da70de276d15fc45a73e1a`)
    .then(htmlString => {
      const data = JSON.parse(htmlString);
      return res.status(200).json(data);
    })
    .catch(err => {
      res.redirect(`/api//Journey/JourneyResults/${req.params.origin}/to/${req.params.destination}`);
      console.log('redirected to try again');
      return res.status(500).json(err);
    });
}


function tflsStopPointArrivals(req, res){
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
}

module.exports = {
  journeyResults: tflsJourneyResults,
  stopPointArrivals: tflsStopPointArrivals
};
