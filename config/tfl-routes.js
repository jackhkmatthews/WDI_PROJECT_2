const express = require('express');
const router = express.Router();
const tfls = require('../controllers/tfls.js');

router.route('/Journey/JourneyResults/:origin/to/:destination')
  .get(tfls.journeyResults);

router.route('/StopPoint/:stationId/Arrivals/:stationCommonName/:direction/:nextStationCommonName')
  .get(tfls.stopPointArrivals);

router.route('/endStopPoint/:nextStationId/Arrivals/:stationCommonName')
  .get(tfls.endStopPointDeparture);

module.exports = router;
