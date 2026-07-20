const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');
const Review = require('../models/Review');
const Booking = require('../models/Booking');
const User = require('../models/User');
const Driver = require('../models/Driver');

const recalculateRating = async (userId, revieweeRole) => {
  const stats = await Review.aggregate([
    { $match: { reviewee: userId } },
    { $group: { _id: '$reviewee', avg: { $avg: '$rating' }, count: { $sum: 1 } } },
  ]);
  const avg = stats[0]?.avg || 0;
  const count = stats[0]?.count || 0;

  await User.findByIdAndUpdate(userId, { ratingAverage: avg.toFixed(2), ratingCount: count });
  if (revieweeRole === 'driver') {
    await Driver.findOneAndUpdate({ user: userId }, { ratingAverage: avg.toFixed(2), ratingCount: count });
  }
};

// @route POST /api/reviews
const createReview = asyncHandler(async (req, res) => {
  const { bookingId, rating, vehicleRating, comment } = req.body;
  if (!rating) throw new ApiError(400, 'Rating is required');

  const booking = await Booking.findById(bookingId);
  if (!booking) throw new ApiError(404, 'Booking not found');
  if (booking.status !== 'completed') throw new ApiError(400, 'You can only review completed rides');

  const isPassenger = booking.passenger.toString() === req.user._id.toString();
  const isDriver = booking.driver.toString() === req.user._id.toString();
  if (!isPassenger && !isDriver) throw new ApiError(403, 'Not authorized to review this booking');

  const reviewee = isPassenger ? booking.driver : booking.passenger;
  const revieweeRole = isPassenger ? 'driver' : 'passenger';

  const existing = await Review.findOne({ booking: bookingId, reviewer: req.user._id });
  if (existing) throw new ApiError(409, 'You have already reviewed this ride');

  const review = await Review.create({
    booking: bookingId,
    ride: booking.ride,
    reviewer: req.user._id,
    reviewee,
    revieweeRole,
    rating,
    vehicleRating,
    comment,
  });

  await recalculateRating(reviewee, revieweeRole);

  booking.rated = true;
  await booking.save();

  res.status(201).json({ success: true, message: 'Review submitted successfully', data: { review } });
});

// @route GET /api/reviews/user/:userId
const getUserReviews = asyncHandler(async (req, res) => {
  const reviews = await Review.find({ reviewee: req.params.userId })
    .populate('reviewer', 'name avatar')
    .sort('-createdAt');
  res.status(200).json({ success: true, data: { reviews } });
});

module.exports = { createReview, getUserReviews };
