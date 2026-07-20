const express = require('express');
const {
  createBooking,
  acceptBooking,
  rejectBooking,
  cancelBooking,
  getMyBookings,
  getDriverBookings,
  getBookingById,
  shareTrip,
} = require('../controllers/bookingController');
const { createBookingValidator } = require('../validators/bookingValidator');
const validate = require('../middlewares/validate');
const { protect, authorize } = require('../middlewares/auth');

const router = express.Router();

router.use(protect);

router.post('/', authorize('passenger'), createBookingValidator, validate, createBooking);
router.get('/me', authorize('passenger'), getMyBookings);
router.get('/driver/me', authorize('driver'), getDriverBookings);

router.get('/:id', getBookingById);
router.patch('/:id/accept', authorize('driver'), acceptBooking);
router.patch('/:id/reject', authorize('driver'), rejectBooking);
router.patch('/:id/cancel', cancelBooking);
router.post('/:id/share-trip', authorize('passenger'), shareTrip);

module.exports = router;
