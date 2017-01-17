const rp = require('request-promise');

function tflsJourneyResults(req, res) {
  return rp(`https://api.tfl.gov.uk/Journey/JourneyResults/${req.params.origin}/to/${req.params.destination}?journeyPreference=LeastInterchange&mode=tube&walkingOptimization=false&app_id=835d0307&app_key=42620817a4da70de276d15fc45a73e1a`)
    .then(htmlString => {
      const data = JSON.parse(htmlString);
      return res.status(200).json(data);
    })
    .catch(err => {
      console.log(err);
      return res.status(500).json(err);
    });
}

function tflsStopPointArrivals(req, res){
  console.log('inside tflsStopPointArrivals');
  return rp(`https://api.tfl.gov.uk/StopPoint/${req.params.nextStationId}/Arrivals?app_id=835d0307&app_key=42620817a4da70de276d15fc45a73e1a`)
    .then(htmlString => {
      const arrivals = JSON.parse(htmlString);
      //check if end of line
      // console.log('data from tfl:', arrivals);
      // for (var i = 0; i < data.length; i++) {
      //   if (data[i].towards.includes(req.params.stationCommonName)){
      //     return res.status(200).json({message: 'end of line'});
      //   }
      // }
      const departures = [];
      arrivals.forEach((arrival, index) => {
        if(arrival.currentLocation.includes(req.params.stationName)){
          departures.push(arrival);
        }
      });
      //if no trains in right direction return message
      if(departures === []) {
        return res.status(404).json({message: 'no departing trains'});
      }
      // take first train in right direction
      // then find train arriving soonest and return
      let nextDeparture = departures[0];
      departures.forEach((departure, index) => {
        if (departure.timeToStation < nextDeparture.timeToStation){
          nextDeparture = departure;
        }
      });
      return res.status(200).json(nextDeparture);
    })
    .catch(err => {
      console.log(err);
    });
}

function tflsEndStopPointDeparture(req, res) {
  return rp(`https://api.tfl.gov.uk/StopPoint/${req.params.nextStationId}/Arrivals?app_id=835d0307&app_key=42620817a4da70de276d15fc45a73e1a`)
    .then(htmlString => {
      var nextDeparture = {};
      const arrivals = JSON.parse(htmlString);
      for (var i = 0; i < arrivals.length; i++){
        if (!arrivals[i].towards.includes(req.params.stationCommonName)){
          nextDeparture = arrivals[i];
        }
      }
      return res.status(200).json(nextDeparture);
    })
    .catch(err => {
      return res.status(500).json(err);
    });
}

module.exports = {
  journeyResults: tflsJourneyResults,
  stopPointArrivals: tflsStopPointArrivals,
  endStopPointDeparture: tflsEndStopPointDeparture
};
