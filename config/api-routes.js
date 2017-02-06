const express    = require('express');
const router     = express.Router();
const stopPoints = require('../controllers/stopPoints.js');

router.route('/stopPoints')
  .get(stopPoints.index);

module.exports = router;
