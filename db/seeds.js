const mongoose = require('mongoose');
const StopPoint = require('../models/stopPoint');
const config = require('../config/config');
const rp = require('request-promise');

mongoose.connect(config.db, () => console.log(`connected to ${config.db}`));

StopPoint.collection.drop();

function tflsLinesRequest(req, res) {
  return rp(`https://api.tfl.gov.uk/Line/Mode/tube`)
  .then(htmlString => {
    const lines = JSON.parse(htmlString);
    return lines.forEach(function(line) {
      return tflsLineToStopPoints(req, res, line);
    });
  })
  .catch(err => {
    return res.status(500).json(err);
  });
}

function tflsLineToStopPoints(req, res, line){
  rp(`https://api.tfl.gov.uk/Line/${line.id}/StopPoints?app_id=835d0307&app_key=42620817a4da70de276d15fc45a73e1a`)
  .then(htmlString => {
    const stopPoints = JSON.parse(htmlString);
    return stopPoints.forEach(function(stopPoint) {
      return tflsStopPointToDb(req, res, stopPoint);
    });
  })
  .catch(err => {
    return res.status(500).json(err);
  });
}

function tflsStopPointToDb(req, res, stopPoint){
  const doc = new StopPoint({
    'commonName': stopPoint.commonName,
    'lat': stopPoint.lat,
    'lng': stopPoint.lon
  });
  doc.save((err, doc) => {
    if (err) return console.log(err);
    return console.log(`${doc} saved!`);
  });
}

tflsLinesRequest();
