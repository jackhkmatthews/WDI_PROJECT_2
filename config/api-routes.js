const express = require('express');
const router = express.Router();
const StopPoints = require('../controllers/StopPoints.js');

router.route('/stopPoints')
  .get(StopPoints.index);



module.exports = router;
