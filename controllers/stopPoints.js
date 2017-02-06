const StopPoint = require('../models/stopPoint');

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
