const express = require('express');
const {
  createRide,
  updateRide,
  deleteRide,
  cancelRide,
  startRide,
  completeRide,
  searchRides,
  getRideById,
  getMyRides,
  updateRideLocation,
  getAllRidesAdmin,
} = require('../controllers/rideController');
const { createRideValidator } = require('../validators/rideValidator');
const validate = require('../middlewares/validate');
const { protect, authorize } = require('../middlewares/auth');

const router = express.Router();

router.get('/search', searchRides); // public - browsing does not require login

router.use(protect);

router.post('/', authorize('driver'), createRideValidator, validate, createRide);
router.get('/driver/me', authorize('driver'), getMyRides);
router.get('/admin/all', authorize('admin'), getAllRidesAdmin);
router.get('/:id', getRideById);
router.patch('/:id', authorize('driver'), updateRide);
router.delete('/:id', authorize('driver'), deleteRide);
router.patch('/:id/cancel', authorize('driver'), cancelRide);
router.patch('/:id/start', authorize('driver'), startRide);
router.patch('/:id/complete', authorize('driver'), completeRide);
router.patch('/:id/location', authorize('driver'), updateRideLocation);

module.exports = router;
