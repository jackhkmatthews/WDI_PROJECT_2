const express = require('express');
const router = express.Router();
const tfls = require('../controllers/tfls.js');

router.route('/Journey/JourneyResults/:origin/to/:destination')
  .get(tfls.journeyResults);

router.route('/StopPoint/:stationId/Arrivals/:direction')
  .get(tfls.stopPointArrivals);

module.exports = router;
