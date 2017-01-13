const rp = require('request-promise');
const mongoose = require('mongoose');
const StopPoint = require('../models/stopPoint');

// function stopPointsIndex (req, res){
//   return rp(`https://api.tfl.gov.uk/Line/${req.params.line}/StopPoints?app_id=835d0307&app_key=42620817a4da70de276d15fc45a73e1a`)
//     .then(htmlString => {
//       const data = JSON.parse(htmlString);
//       return res.status(200).json(data);
//     })
//     .catch(err => {
//       return res.status(500).json(err);
//     });
// }

function stopPointsIndex (req, res){
  console.log('want stopPointsIndex');
  StopPoint.find({}, (err, stopPoints) => {
    if (err) return res.status(500).json({message: err});
    return res.status(200).json({
      message: 'stopPoints index!',
      stopPoints
    });
  });
}

module.exports = {
  index: stopPointsIndex
};
