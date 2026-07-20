const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');
const Booking = require('../models/Booking');
const Ride = require('../models/Ride');
const Notification = require('../models/Notification');
const ApiFeatures = require('../utils/ApiFeatures');
const { generateOtp } = require('../utils/tokens');
const { getOrCreateWallet, creditWallet, debitWallet } = require('../services/walletService');
const User = require('../models/User');
const Vehicle = require('../models/Vehicle');
const Payment = require('../models/Payment');

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

// @route POST /api/bookings/mock (passenger)
const createMockBooking = asyncHandler(async (req, res) => {
  const { type, driverName, fare, rating, sourceCity, destCity, date } = req.body;

  if (!type || !driverName || !fare || !sourceCity || !destCity || !date) {
    throw new ApiError(400, 'All details (type, driverName, fare, sourceCity, destCity, date) are required');
  }

  // 1. Verify passenger's wallet balance
  const wallet = await getOrCreateWallet(req.user._id);
  if (wallet.balance < fare) {
    throw new ApiError(400, `Insufficient wallet balance. You have ₹${wallet.balance}, but the ride fare is ₹${fare}.`);
  }

  // 2. Resolve mock driver
  let driver = await User.findOne({ role: 'driver' });
  if (!driver) {
    // If no driver user exists in DB, create a temporary driver placeholder
    driver = await User.create({
      name: driverName,
      email: `driver_${Math.random().toString(36).substring(7)}@cabshare.app`,
      phone: `+9196${Math.floor(10000000 + Math.random() * 90000000)}`,
      password: 'Driver@123',
      role: 'driver',
      gender: 'male',
      isEmailVerified: true,
      isPhoneVerified: true,
      ratingAverage: rating,
      ratingCount: 10,
    });
    // Create the driver profile
    const DriverProfile = require('../models/Driver');
    await DriverProfile.create({
      user: driver._id,
      licenseNumber: `DL${Math.floor(10 + Math.random() * 90)} ${Math.floor(100000000000 + Math.random() * 900000000000)}`,
      licenseExpiry: new Date(Date.now() + 5 * 365 * 24 * 60 * 60 * 1000), // 5 years from now
      verificationStatus: 'approved',
    });
  }

  // 3. Resolve mock vehicle
  let vehicle = await Vehicle.findOne({ driver: driver._id });
  if (!vehicle) {
    const vType = type.toLowerCase() === 'bike' ? 'bike' : type.toLowerCase() === 'suv' ? 'suv' : type.toLowerCase() === 'auto' ? 'auto' : 'sedan';
    vehicle = await Vehicle.create({
      driver: driver._id,
      type: vType,
      brand: vType === 'bike' ? 'Honda' : vType === 'auto' ? 'Bajaj' : 'Toyota',
      model: vType === 'bike' ? 'Activa' : vType === 'auto' ? 'RE' : 'Fortuner',
      color: 'White',
      registrationNumber: `DL${Math.floor(1 + Math.random() * 9)}C${String.fromCharCode(65 + Math.floor(Math.random() * 26))}${Math.floor(1000 + Math.random() * 9000)}`,
      seatingCapacity: vType === 'bike' ? 1 : vType === 'auto' ? 3 : vType === 'suv' ? 6 : 4,
      verificationStatus: 'approved',
    });
  }

  // 4. Create the mock Ride
  const ride = await Ride.create({
    driver: driver._id,
    vehicle: vehicle._id,
    source: { address: sourceCity, lat: 28.7041, lng: 77.1025 },
    destination: { address: destCity, lat: 26.9124, lng: 75.7873 },
    departureDate: new Date(date),
    departureTime: '14:30',
    totalSeats: 4,
    availableSeats: 3,
    pricePerSeat: fare,
    status: 'scheduled',
  });

  // 5. Debit fare from passenger's wallet
  const { transaction } = await debitWallet({
    userId: req.user._id,
    amount: fare,
    category: 'ride_fare',
    reference: ride._id,
    referenceModel: 'Ride',
    description: `Fare payment for ride booking with driver ${driverName} (${type})`,
  });

  // 6. Create the Booking document
  const booking = await Booking.create({
    ride: ride._id,
    passenger: req.user._id,
    driver: driver._id,
    seatsBooked: 1,
    totalFare: fare,
    pickupPoint: { address: sourceCity, lat: 28.7041, lng: 77.1025 },
    dropPoint: { address: destCity, lat: 26.9124, lng: 75.7873 },
    status: 'confirmed',
    paymentStatus: 'paid',
    paymentMethod: 'wallet',
    otpForPickup: generateOtp(),
  });

  // 7. Update transaction reference to point to booking
  transaction.reference = booking._id;
  transaction.referenceModel = 'Booking';
  await transaction.save();

  // 8. Create Payment record
  await Payment.create({
    user: req.user._id,
    booking: booking._id,
    amount: fare,
    method: 'wallet',
    status: 'captured',
    transaction: transaction._id,
  });

  // 9. Notifications
  await Notification.create({
    user: req.user._id,
    title: 'Ride booked successfully',
    message: `Your booking for ${type} with driver ${driverName} is confirmed. ₹${fare} paid from wallet.`,
    type: 'ride_booked',
    reference: booking._id,
    referenceModel: 'Booking',
  });

  res.status(201).json({ success: true, message: 'Ride booked successfully', data: { booking } });
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
  createMockBooking,
};
