const express = require('express');
const { autocomplete, geocode, distance, directions } = require('../controllers/mapsController');
const { protect } = require('../middlewares/auth');

const router = express.Router();

router.use(protect);

router.get('/autocomplete', autocomplete);
router.get('/geocode', geocode);
router.get('/distance', distance);
router.get('/directions', directions);

module.exports = router;
