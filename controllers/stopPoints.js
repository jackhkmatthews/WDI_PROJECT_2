const rp = require('request-promise');

function stopPointsIndex (req, res){
  return rp(`https://api.tfl.gov.uk/Line/${req.params.line}/StopPoints?app_id=835d0307&app_key=42620817a4da70de276d15fc45a73e1a`)
    .then(htmlString => {
      const data = JSON.parse(htmlString);
      return res.status(200).json(data);
    })
    .catch(err => {
      return res.status(500).json(err);
    });
}

module.exports = {
  index: stopPointsIndex
};
