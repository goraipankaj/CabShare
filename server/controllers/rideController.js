const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');
const Ride = require('../models/Ride');
const Vehicle = require('../models/Vehicle');
const Driver = require('../models/Driver');
const Booking = require('../models/Booking');
const ApiFeatures = require('../utils/ApiFeatures');
const mapsService = require('../services/mapsService');

// @route POST /api/rides
const createRide = asyncHandler(async (req, res) => {
  const vehicle = await Vehicle.findOne({ _id: req.body.vehicle, driver: req.user._id });
  if (!vehicle) throw new ApiError(404, 'Vehicle not found for this driver');
  if (vehicle.verificationStatus !== 'approved') {
    throw new ApiError(403, 'Vehicle must be verified before it can be used for rides');
  }

  const driverProfile = await Driver.findOne({ user: req.user._id });
  if (!driverProfile || driverProfile.verificationStatus !== 'approved') {
    throw new ApiError(403, 'Your driver profile must be verified before publishing rides');
  }

  const { source, destination, departureDate, departureTime, totalSeats, pricePerSeat, genderPreference, instantBooking, stops } =
    req.body;

  if (totalSeats > vehicle.seatingCapacity) {
    throw new ApiError(400, `Total seats cannot exceed the vehicle's seating capacity (${vehicle.seatingCapacity})`);
  }

  // Try to compute route distance/duration/polyline if a Maps key is configured;
  // ride creation still succeeds without it (route fields just stay empty).
  let route = {};
  try {
    const [distanceEta, directions] = await Promise.all([
      mapsService.getDistanceAndEta(source.lat, source.lng, destination.lat, destination.lng),
      mapsService.getDirections(source.lat, source.lng, destination.lat, destination.lng),
    ]);
    route = {
      distanceKm: distanceEta.distanceKm,
      durationMin: distanceEta.durationMin,
      polyline: directions.polyline,
    };
  } catch (err) {
    console.warn('[Ride] Maps route lookup skipped:', err.message);
  }

  const ride = await Ride.create({
    driver: req.user._id,
    vehicle: vehicle._id,
    source,
    destination,
    stops,
    route,
    departureDate,
    departureTime,
    totalSeats,
    availableSeats: totalSeats,
    pricePerSeat,
    genderPreference,
    instantBooking: instantBooking ?? true,
  });

  res.status(201).json({ success: true, message: 'Ride published successfully', data: { ride } });
});

// @route PATCH /api/rides/:id
const updateRide = asyncHandler(async (req, res) => {
  const ride = await Ride.findOne({ _id: req.params.id, driver: req.user._id });
  if (!ride) throw new ApiError(404, 'Ride not found');
  if (ride.status !== 'scheduled') throw new ApiError(400, 'Only scheduled rides can be edited');

  const editable = ['departureDate', 'departureTime', 'pricePerSeat', 'genderPreference', 'instantBooking'];
  editable.forEach((field) => {
    if (req.body[field] !== undefined) ride[field] = req.body[field];
  });
  await ride.save();

  res.status(200).json({ success: true, message: 'Ride updated', data: { ride } });
});

// @route DELETE /api/rides/:id
const deleteRide = asyncHandler(async (req, res) => {
  const ride = await Ride.findOne({ _id: req.params.id, driver: req.user._id });
  if (!ride) throw new ApiError(404, 'Ride not found');

  const activeBookings = await Booking.countDocuments({ ride: ride._id, status: { $in: ['pending', 'accepted', 'confirmed'] } });
  if (activeBookings > 0) {
    throw new ApiError(400, 'Cannot delete a ride with active bookings - cancel it instead');
  }

  await ride.deleteOne();
  res.status(200).json({ success: true, message: 'Ride deleted' });
});

// @route PATCH /api/rides/:id/cancel
const cancelRide = asyncHandler(async (req, res) => {
  const ride = await Ride.findOne({ _id: req.params.id, driver: req.user._id });
  if (!ride) throw new ApiError(404, 'Ride not found');
  if (!['scheduled', 'ongoing'].includes(ride.status)) throw new ApiError(400, 'Ride cannot be cancelled at this stage');

  ride.status = 'cancelled';
  ride.cancelledAt = new Date();
  ride.cancellationReason = req.body.reason || 'Cancelled by driver';
  await ride.save();

  await Booking.updateMany(
    { ride: ride._id, status: { $in: ['pending', 'accepted', 'confirmed'] } },
    { status: 'cancelled', cancelledBy: 'driver', cancellationReason: ride.cancellationReason, cancelledAt: new Date() }
  );

  res.status(200).json({ success: true, message: 'Ride cancelled', data: { ride } });
});

// @route PATCH /api/rides/:id/start
const startRide = asyncHandler(async (req, res) => {
  const ride = await Ride.findOne({ _id: req.params.id, driver: req.user._id });
  if (!ride) throw new ApiError(404, 'Ride not found');
  if (ride.status !== 'scheduled') throw new ApiError(400, 'Ride must be scheduled to start');

  ride.status = 'ongoing';
  ride.startedAt = new Date();
  await ride.save();

  await Booking.updateMany({ ride: ride._id, status: 'confirmed' }, { status: 'ongoing' });

  res.status(200).json({ success: true, message: 'Ride started', data: { ride } });
});

// @route PATCH /api/rides/:id/complete
const completeRide = asyncHandler(async (req, res) => {
  const ride = await Ride.findOne({ _id: req.params.id, driver: req.user._id });
  if (!ride) throw new ApiError(404, 'Ride not found');
  if (ride.status !== 'ongoing') throw new ApiError(400, 'Ride must be ongoing to complete');

  ride.status = 'completed';
  ride.completedAt = new Date();
  await ride.save();

  await Booking.updateMany({ ride: ride._id, status: 'ongoing' }, { status: 'completed' });

  const driverProfile = await Driver.findOne({ user: req.user._id });
  if (driverProfile) {
    driverProfile.totalTrips += 1;
    driverProfile.totalDistanceKm += ride.route?.distanceKm || 0;
    await driverProfile.save();
  }

  res.status(200).json({ success: true, message: 'Ride completed', data: { ride } });
});

// @route GET /api/rides/search - the ride search + matching engine
const searchRides = asyncHandler(async (req, res) => {
  const {
    sourceLat, sourceLng, destLat, destLng, date, vehicleType, minSeats,
    minRating, maxPrice, gender,
  } = req.query;

  const query = { status: 'scheduled', availableSeats: { $gt: 0 } };

  if (date) {
    const start = new Date(date);
    start.setHours(0, 0, 0, 0);
    const end = new Date(date);
    end.setHours(23, 59, 59, 999);
    query.departureDate = { $gte: start, $lte: end };
  }
  if (minSeats) query.availableSeats.$gte = Number(minSeats);
  if (maxPrice) query.pricePerSeat = { $lte: Number(maxPrice) };
  if (gender && gender !== 'any') query.genderPreference = { $in: ['any', gender] };

  // Geo-proximity matching: rides whose source is within ~5km of the searched source
  if (sourceLat && sourceLng) {
    query['source.lat'] = { $gte: Number(sourceLat) - 0.05, $lte: Number(sourceLat) + 0.05 };
    query['source.lng'] = { $gte: Number(sourceLng) - 0.05, $lte: Number(sourceLng) + 0.05 };
  }
  if (destLat && destLng) {
    query['destination.lat'] = { $gte: Number(destLat) - 0.05, $lte: Number(destLat) + 0.05 };
    query['destination.lng'] = { $gte: Number(destLng) - 0.05, $lte: Number(destLng) + 0.05 };
  }

  const baseQuery = Ride.find(query)
    .populate('driver', 'name avatar ratingAverage ratingCount phone')
    .populate('vehicle');

  const apiFeatures = new ApiFeatures(baseQuery, req.query).sort().paginate();
  let rides = await apiFeatures.query;

  if (vehicleType) {
    rides = rides.filter((r) => r.vehicle?.type === vehicleType);
  }
  if (minRating) {
    rides = rides.filter((r) => (r.driver?.ratingAverage || 0) >= Number(minRating));
  }

  res.status(200).json({ success: true, data: { rides, count: rides.length } });
});

// @route GET /api/rides/:id
const getRideById = asyncHandler(async (req, res) => {
  const ride = await Ride.findById(req.params.id)
    .populate('driver', 'name avatar ratingAverage ratingCount phone')
    .populate('vehicle');
  if (!ride) throw new ApiError(404, 'Ride not found');
  res.status(200).json({ success: true, data: { ride } });
});

// @route GET /api/rides/driver/me
const getMyRides = asyncHandler(async (req, res) => {
  const features = new ApiFeatures(Ride.find({ driver: req.user._id }).populate('vehicle'), req.query)
    .filter()
    .sort()
    .paginate();
  const rides = await features.query;
  const pagination = await features.countTotal(Ride);
  res.status(200).json({ success: true, data: { rides, pagination } });
});

// @route PATCH /api/rides/:id/location - live driver location update, also emits via socket (see routes)
const updateRideLocation = asyncHandler(async (req, res) => {
  const { lat, lng } = req.body;
  const ride = await Ride.findOneAndUpdate(
    { _id: req.params.id, driver: req.user._id },
    { liveLocation: { type: 'Point', coordinates: [lng, lat] } },
    { new: true }
  );
  if (!ride) throw new ApiError(404, 'Ride not found');
  res.status(200).json({ success: true, data: { liveLocation: ride.liveLocation } });
});

// @route GET /api/rides (admin - list all rides across all drivers)
const getAllRidesAdmin = asyncHandler(async (req, res) => {
  const features = new ApiFeatures(
    Ride.find().populate('driver', 'name email phone').populate('vehicle'),
    req.query
  )
    .filter()
    .sort()
    .paginate();
  const rides = await features.query;
  const pagination = await features.countTotal(Ride);
  res.status(200).json({ success: true, data: { rides, pagination } });
});

module.exports = {
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
};
