const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');
const Driver = require('../models/Driver');
const Vehicle = require('../models/Vehicle');
const User = require('../models/User');
const Ride = require('../models/Ride');
const ApiFeatures = require('../utils/ApiFeatures');

// @route POST /api/drivers/register
const registerDriver = asyncHandler(async (req, res) => {
  const { licenseNumber, licenseExpiry, aadhaarNumber } = req.body;
  if (!licenseNumber || !licenseExpiry) {
    throw new ApiError(400, 'License number and expiry are required');
  }

  const existing = await Driver.findOne({ $or: [{ user: req.user._id }, { licenseNumber }] });
  if (existing) throw new ApiError(409, 'Driver profile already exists for this user or license number');

  const driver = await Driver.create({
    user: req.user._id,
    licenseNumber,
    licenseExpiry,
    aadhaarNumber,
  });

  await User.findByIdAndUpdate(req.user._id, { role: 'driver', isDriverProfileCreated: true });

  res.status(201).json({ success: true, message: 'Driver profile created - pending document verification', data: { driver } });
});

// @route POST /api/drivers/documents (license/aadhaar upload)
const uploadDriverDocuments = asyncHandler(async (req, res) => {
  const driver = await Driver.findOne({ user: req.user._id });
  if (!driver) throw new ApiError(404, 'Driver profile not found');

  if (req.files?.license?.[0]) {
    driver.licenseDocument = { url: req.files.license[0].path, publicId: req.files.license[0].filename };
  }
  if (req.files?.aadhaar?.[0]) {
    driver.aadhaarDocument = { url: req.files.aadhaar[0].path, publicId: req.files.aadhaar[0].filename };
  }
  driver.verificationStatus = 'pending';
  await driver.save();

  res.status(200).json({ success: true, message: 'Documents uploaded - pending verification', data: { driver } });
});

// @route POST /api/drivers/vehicles
const addVehicle = asyncHandler(async (req, res) => {
  const { type, brand, model, color, registrationNumber, seatingCapacity, year } = req.body;
  if (!type || !brand || !model || !color || !registrationNumber || !seatingCapacity) {
    throw new ApiError(400, 'All vehicle fields are required');
  }

  const existing = await Vehicle.findOne({ registrationNumber: registrationNumber.toUpperCase() });
  if (existing) throw new ApiError(409, 'A vehicle with this registration number already exists');

  const vehicle = await Vehicle.create({
    driver: req.user._id,
    type,
    brand,
    model,
    color,
    registrationNumber,
    seatingCapacity,
    year,
  });

  res.status(201).json({ success: true, message: 'Vehicle added - pending verification', data: { vehicle } });
});

// @route POST /api/drivers/vehicles/:id/documents
const uploadVehicleDocuments = asyncHandler(async (req, res) => {
  const vehicle = await Vehicle.findOne({ _id: req.params.id, driver: req.user._id });
  if (!vehicle) throw new ApiError(404, 'Vehicle not found');

  const docFields = ['rcBook', 'insurance', 'pollutionCertificate', 'permit'];
  docFields.forEach((field) => {
    if (req.files?.[field]?.[0]) {
      vehicle.documents[field] = { url: req.files[field][0].path, publicId: req.files[field][0].filename };
    }
  });
  vehicle.verificationStatus = 'pending';
  await vehicle.save();

  res.status(200).json({ success: true, message: 'Vehicle documents uploaded - pending verification', data: { vehicle } });
});

// @route GET /api/drivers/vehicles/me
const getMyVehicles = asyncHandler(async (req, res) => {
  const vehicles = await Vehicle.find({ driver: req.user._id });
  res.status(200).json({ success: true, data: { vehicles } });
});

// @route PATCH /api/drivers/availability
const toggleAvailability = asyncHandler(async (req, res) => {
  const driver = await Driver.findOne({ user: req.user._id });
  if (!driver) throw new ApiError(404, 'Driver profile not found');
  if (driver.verificationStatus !== 'approved') {
    throw new ApiError(403, 'Your driver profile must be verified before going online');
  }

  driver.isAvailable = req.body.isAvailable ?? !driver.isAvailable;
  if (req.body.lat && req.body.lng) {
    driver.currentLocation = { type: 'Point', coordinates: [req.body.lng, req.body.lat] };
  }
  await driver.save();

  res.status(200).json({ success: true, data: { isAvailable: driver.isAvailable } });
});

// @route PATCH /api/drivers/location
const updateLocation = asyncHandler(async (req, res) => {
  const { lat, lng } = req.body;
  if (lat === undefined || lng === undefined) throw new ApiError(400, 'Latitude and longitude are required');
  const driver = await Driver.findOneAndUpdate(
    { user: req.user._id },
    { currentLocation: { type: 'Point', coordinates: [lng, lat] } },
    { new: true }
  );
  if (!driver) throw new ApiError(404, 'Driver profile not found');
  res.status(200).json({ success: true, data: { currentLocation: driver.currentLocation } });
});

// @route GET /api/drivers/me
const getMyDriverProfile = asyncHandler(async (req, res) => {
  const driver = await Driver.findOne({ user: req.user._id }).populate('activeVehicle');
  if (!driver) throw new ApiError(404, 'Driver profile not found');
  res.status(200).json({ success: true, data: { driver } });
});

// @route GET /api/drivers/earnings
const getEarnings = asyncHandler(async (req, res) => {
  const driver = await Driver.findOne({ user: req.user._id });
  if (!driver) throw new ApiError(404, 'Driver profile not found');

  const completedRides = await Ride.countDocuments({ driver: req.user._id, status: 'completed' });

  res.status(200).json({
    success: true,
    data: {
      totalEarnings: driver.totalEarnings,
      totalTrips: driver.totalTrips,
      totalDistanceKm: driver.totalDistanceKm,
      completedRides,
      ratingAverage: driver.ratingAverage,
    },
  });
});

// ---- Admin: verification ----

// @route GET /api/drivers (admin) - list drivers with filters
const getAllDrivers = asyncHandler(async (req, res) => {
  const features = new ApiFeatures(Driver.find().populate('user', 'name email phone avatar'), req.query)
    .filter()
    .sort()
    .paginate();
  const drivers = await features.query;
  const pagination = await features.countTotal(Driver);
  res.status(200).json({ success: true, data: { drivers, pagination } });
});

// @route PATCH /api/drivers/:id/verify (admin)
const verifyDriver = asyncHandler(async (req, res) => {
  const { status, note } = req.body;
  if (!['approved', 'rejected'].includes(status)) throw new ApiError(400, 'Status must be approved or rejected');

  const driver = await Driver.findById(req.params.id);
  if (!driver) throw new ApiError(404, 'Driver not found');

  driver.verificationStatus = status;
  driver.verificationNote = note;
  driver.verifiedBy = req.user._id;
  driver.verifiedAt = new Date();
  await driver.save();

  res.status(200).json({ success: true, message: `Driver ${status}`, data: { driver } });
});

// @route PATCH /api/drivers/vehicles/:id/verify (admin)
const verifyVehicle = asyncHandler(async (req, res) => {
  const { status, note } = req.body;
  if (!['approved', 'rejected'].includes(status)) throw new ApiError(400, 'Status must be approved or rejected');

  const vehicle = await Vehicle.findById(req.params.id);
  if (!vehicle) throw new ApiError(404, 'Vehicle not found');

  vehicle.verificationStatus = status;
  vehicle.verificationNote = note;
  vehicle.verifiedBy = req.user._id;
  vehicle.verifiedAt = new Date();
  await vehicle.save();

  res.status(200).json({ success: true, message: `Vehicle ${status}`, data: { vehicle } });
});

module.exports = {
  registerDriver,
  uploadDriverDocuments,
  addVehicle,
  uploadVehicleDocuments,
  getMyVehicles,
  toggleAvailability,
  updateLocation,
  getMyDriverProfile,
  getEarnings,
  getAllDrivers,
  verifyDriver,
  verifyVehicle,
};
