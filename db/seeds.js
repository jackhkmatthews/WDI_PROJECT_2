const mongoose = require('mongoose');
const StopPoint = require('../models/stopPoint');
const config = require('../config/config');
const rp = require('request-promise');

mongoose.connect(config.db, () => console.log(`connected to ${config.db}`));

StopPoint.collection.drop();

const stopPoints = [];

function tflsLinesRequest(req, res) {
  return rp(`https://api.tfl.gov.uk/Line/Mode/tube`)
  .then(htmlString => {
    const lines = JSON.parse(htmlString);
    lines.forEach(function(line) {
      console.log(line.name);
      return tflsLineTostopPoints(req, res, line);
    });
    setTimeout(function(){
      return tflstopPointsToDb(req, res, stopPoints);
    }, 10000);
  })
  .catch(err => {
    return res.status(500).json(err);
  });
}

function tflsLineTostopPoints(req, res, line){
  rp(`https://api.tfl.gov.uk/Line/${line.id}/stopPoints?app_id=835d0307&app_key=42620817a4da70de276d15fc45a73e1a`)
  .then(htmlString => {
    const stations = JSON.parse(htmlString);
    stations.forEach(function(station) {
      const index = arrayObjectIndexOf(stopPoints, station.id, 'id');
      if (index === -1){
        const newStation = {
          'commonName': station.commonName,
          'lat': station.lat,
          'lng': station.lon,
          'id': station.id,
          'lineNames': [line.name],
          'lineIds': [line.id]
        };
        stopPoints.push(newStation);
      } else {
        stopPoints[index].lineNames.push(line.name);
        stopPoints[index].lineIds.push(line.id);
      }
    });
  })
  .catch(err => {
    return res.status(500).json(err);
  });
}

function arrayObjectIndexOf(myArray, searchTerm, property) {
  for(var i = 0, len = myArray.length; i < len; i++) {
    if (myArray[i][property] === searchTerm) return i;
  }
  return -1;
}

function tflstopPointsToDb(req, res, stopPoints){
  stopPoints.forEach(function(stopPoint){
    const doc = new StopPoint({
      'commonName': stopPoint.commonName,
      'lat': stopPoint.lat,
      'lng': stopPoint.lng,
      'id': stopPoint.id,
      'lineNames': stopPoint.lineNames,
      'lineIds': stopPoint.lineIds
    });
    doc.save((err, doc) => {
      if (err) return console.log(err);
      return;
    });
  });
}

tflsLinesRequest();
