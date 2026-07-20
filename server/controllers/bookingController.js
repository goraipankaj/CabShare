const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');
const Booking = require('../models/Booking');
const Ride = require('../models/Ride');
const Notification = require('../models/Notification');
const ApiFeatures = require('../utils/ApiFeatures');
const { generateOtp } = require('../utils/tokens');
const { creditWallet, debitWallet } = require('../services/walletService');

const notify = async (userId, title, message, type, reference, referenceModel) => {
  await Notification.create({ user: userId, title, message, type, reference, referenceModel });
};

// @route POST /api/bookings
const createBooking = asyncHandler(async (req, res) => {
  const { ride: rideId, seatsBooked, pickupPoint, dropPoint, paymentMethod } = req.body;

  const ride = await Ride.findById(rideId);
  if (!ride) throw new ApiError(404, 'Ride not found');
  if (ride.status !== 'scheduled') throw new ApiError(400, 'This ride is no longer accepting bookings');
  if (ride.driver.toString() === req.user._id.toString()) throw new ApiError(400, 'You cannot book your own ride');
  if (ride.availableSeats < seatsBooked) throw new ApiError(400, `Only ${ride.availableSeats} seat(s) available`);

  if (ride.genderPreference !== 'any') {
    const requiredGender = ride.genderPreference === 'male_only' ? 'male' : 'female';
    if (req.user.gender !== requiredGender) {
      throw new ApiError(403, 'This ride has a gender preference that does not match your profile');
    }
  }

  const existingBooking = await Booking.findOne({
    ride: rideId,
    passenger: req.user._id,
    status: { $in: ['pending', 'accepted', 'confirmed', 'ongoing'] },
  });
  if (existingBooking) throw new ApiError(409, 'You already have an active booking for this ride');

  const totalFare = seatsBooked * ride.pricePerSeat;
  const initialStatus = ride.instantBooking ? 'confirmed' : 'pending';

  const booking = await Booking.create({
    ride: rideId,
    passenger: req.user._id,
    driver: ride.driver,
    seatsBooked,
    totalFare,
    pickupPoint,
    dropPoint,
    status: initialStatus,
    paymentMethod: paymentMethod || 'cash',
    otpForPickup: generateOtp(),
  });

  if (initialStatus === 'confirmed') {
    ride.availableSeats -= seatsBooked;
    await ride.save();
  }

  await notify(
    ride.driver,
    ride.instantBooking ? 'New booking confirmed' : 'New booking request',
    `${req.user.name} booked ${seatsBooked} seat(s) for your ride on ${ride.departureDate.toDateString()}`,
    'ride_booked',
    booking._id,
    'Booking'
  );

  res.status(201).json({ success: true, message: 'Booking created successfully', data: { booking } });
});

// @route PATCH /api/bookings/:id/accept (driver, only for non-instant rides)
const acceptBooking = asyncHandler(async (req, res) => {
  const booking = await Booking.findOne({ _id: req.params.id, driver: req.user._id }).populate('ride');
  if (!booking) throw new ApiError(404, 'Booking not found');
  if (booking.status !== 'pending') throw new ApiError(400, 'Only pending bookings can be accepted');

  const ride = booking.ride;
  if (ride.availableSeats < booking.seatsBooked) throw new ApiError(400, 'Not enough seats remaining');

  booking.status = 'confirmed';
  await booking.save();

  ride.availableSeats -= booking.seatsBooked;
  await ride.save();

  await notify(booking.passenger, 'Booking accepted', 'Your ride booking has been accepted by the driver', 'ride_accepted', booking._id, 'Booking');

  res.status(200).json({ success: true, message: 'Booking accepted', data: { booking } });
});

// @route PATCH /api/bookings/:id/reject (driver)
const rejectBooking = asyncHandler(async (req, res) => {
  const booking = await Booking.findOne({ _id: req.params.id, driver: req.user._id });
  if (!booking) throw new ApiError(404, 'Booking not found');
  if (booking.status !== 'pending') throw new ApiError(400, 'Only pending bookings can be rejected');

  booking.status = 'rejected';
  booking.cancellationReason = req.body.reason || 'Rejected by driver';
  await booking.save();

  await notify(booking.passenger, 'Booking rejected', 'Your ride booking request was rejected by the driver', 'ride_rejected', booking._id, 'Booking');

  res.status(200).json({ success: true, message: 'Booking rejected', data: { booking } });
});

// @route PATCH /api/bookings/:id/cancel (passenger or driver)
const cancelBooking = asyncHandler(async (req, res) => {
  const booking = await Booking.findById(req.params.id).populate('ride');
  if (!booking) throw new ApiError(404, 'Booking not found');

  const isPassenger = booking.passenger.toString() === req.user._id.toString();
  const isDriver = booking.driver.toString() === req.user._id.toString();
  if (!isPassenger && !isDriver && req.user.role !== 'admin') throw new ApiError(403, 'Not authorized to cancel this booking');

  if (!['pending', 'accepted', 'confirmed'].includes(booking.status)) {
    throw new ApiError(400, 'This booking cannot be cancelled at its current stage');
  }

  const seatsToRelease = ['confirmed'].includes(booking.status) ? booking.seatsBooked : 0;

  booking.status = 'cancelled';
  booking.cancelledBy = isPassenger ? 'passenger' : isDriver ? 'driver' : 'admin';
  booking.cancellationReason = req.body.reason || 'Cancelled';
  booking.cancelledAt = new Date();

  if (booking.paymentStatus === 'paid') {
    booking.paymentStatus = 'refunded';
    await creditWallet({
      userId: booking.passenger,
      amount: booking.totalFare,
      category: 'refund',
      reference: booking._id,
      referenceModel: 'Booking',
      description: 'Refund for cancelled booking',
    });
  }
  await booking.save();

  if (seatsToRelease > 0) {
    await Ride.findByIdAndUpdate(booking.ride._id, { $inc: { availableSeats: seatsToRelease } });
  }

  const notifyTarget = isPassenger ? booking.driver : booking.passenger;
  await notify(notifyTarget, 'Booking cancelled', 'A ride booking has been cancelled', 'booking_cancelled', booking._id, 'Booking');

  res.status(200).json({ success: true, message: 'Booking cancelled', data: { booking } });
});

// @route GET /api/bookings/me (passenger)
const getMyBookings = asyncHandler(async (req, res) => {
  const features = new ApiFeatures(
    Booking.find({ passenger: req.user._id }).populate({ path: 'ride', populate: ['vehicle', 'driver'] }),
    req.query
  )
    .filter()
    .sort()
    .paginate();
  const bookings = await features.query;
  const pagination = await features.countTotal(Booking);
  res.status(200).json({ success: true, data: { bookings, pagination } });
});

// @route GET /api/bookings/driver/me (driver - manage bookings for their rides)
const getDriverBookings = asyncHandler(async (req, res) => {
  const features = new ApiFeatures(
    Booking.find({ driver: req.user._id }).populate('passenger', 'name avatar phone ratingAverage').populate('ride'),
    req.query
  )
    .filter()
    .sort()
    .paginate();
  const bookings = await features.query;
  const pagination = await features.countTotal(Booking);
  res.status(200).json({ success: true, data: { bookings, pagination } });
});

// @route GET /api/bookings/:id
const getBookingById = asyncHandler(async (req, res) => {
  const booking = await Booking.findById(req.params.id).populate('ride').populate('passenger', 'name avatar phone').populate('driver', 'name avatar phone');
  if (!booking) throw new ApiError(404, 'Booking not found');

  const isParty =
    booking.passenger._id.toString() === req.user._id.toString() ||
    booking.driver._id.toString() === req.user._id.toString() ||
    req.user.role === 'admin';
  if (!isParty) throw new ApiError(403, 'Not authorized to view this booking');

  res.status(200).json({ success: true, data: { booking } });
});

// @route POST /api/bookings/:id/share-trip
const shareTrip = asyncHandler(async (req, res) => {
  const { name, phone } = req.body;
  if (!name || !phone) throw new ApiError(400, 'Name and phone number are required');

  const booking = await Booking.findOne({ _id: req.params.id, passenger: req.user._id });
  if (!booking) throw new ApiError(404, 'Booking not found');

  booking.tripSharedWith.push({ name, phone });
  await booking.save();

  res.status(200).json({ success: true, message: `Trip details shared with ${name}`, data: { tripSharedWith: booking.tripSharedWith } });
});

module.exports = {
  createBooking,
  acceptBooking,
  rejectBooking,
  cancelBooking,
  getMyBookings,
  getDriverBookings,
  getBookingById,
  shareTrip,
};
