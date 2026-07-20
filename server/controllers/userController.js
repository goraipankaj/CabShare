const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');
const User = require('../models/User');
const ApiFeatures = require('../utils/ApiFeatures');

// @route PATCH /api/users/me
const updateProfile = asyncHandler(async (req, res) => {
  const allowedFields = ['name', 'gender', 'dateOfBirth', 'fcmToken'];
  const updates = {};
  allowedFields.forEach((field) => {
    if (req.body[field] !== undefined) updates[field] = req.body[field];
  });

  const user = await User.findByIdAndUpdate(req.user._id, updates, { new: true, runValidators: true });
  res.status(200).json({ success: true, message: 'Profile updated successfully', data: { user: user.toSafeObject() } });
});

// @route POST /api/users/me/avatar
const uploadAvatar = asyncHandler(async (req, res) => {
  if (!req.file) throw new ApiError(400, 'No image file uploaded');
  const user = await User.findByIdAndUpdate(
    req.user._id,
    { avatar: { url: req.file.path, publicId: req.file.filename } },
    { new: true }
  );
  res.status(200).json({ success: true, message: 'Avatar updated', data: { user: user.toSafeObject() } });
});

// @route POST /api/users/me/addresses
const addSavedAddress = asyncHandler(async (req, res) => {
  const { label, address, lat, lng } = req.body;
  if (!address || lat === undefined || lng === undefined) {
    throw new ApiError(400, 'Address, latitude, and longitude are required');
  }
  const user = await User.findByIdAndUpdate(
    req.user._id,
    { $push: { savedAddresses: { label, address, lat, lng } } },
    { new: true }
  );
  res.status(201).json({ success: true, data: { savedAddresses: user.savedAddresses } });
});

// @route DELETE /api/users/me/addresses/:addressId
const removeSavedAddress = asyncHandler(async (req, res) => {
  const user = await User.findByIdAndUpdate(
    req.user._id,
    { $pull: { savedAddresses: { _id: req.params.addressId } } },
    { new: true }
  );
  res.status(200).json({ success: true, data: { savedAddresses: user.savedAddresses } });
});

// @route POST /api/users/me/emergency-contacts
const addEmergencyContact = asyncHandler(async (req, res) => {
  const { name, phone, relation } = req.body;
  if (!name || !phone) throw new ApiError(400, 'Name and phone are required');
  const user = await User.findByIdAndUpdate(
    req.user._id,
    { $push: { emergencyContacts: { name, phone, relation } } },
    { new: true }
  );
  res.status(201).json({ success: true, data: { emergencyContacts: user.emergencyContacts } });
});

// @route DELETE /api/users/me/emergency-contacts/:contactId
const removeEmergencyContact = asyncHandler(async (req, res) => {
  const user = await User.findByIdAndUpdate(
    req.user._id,
    { $pull: { emergencyContacts: { _id: req.params.contactId } } },
    { new: true }
  );
  res.status(200).json({ success: true, data: { emergencyContacts: user.emergencyContacts } });
});

// @route POST /api/users/me/favorite-drivers/:driverId
const toggleFavoriteDriver = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  const { driverId } = req.params;
  const alreadyFav = user.favoriteDrivers.some((id) => id.toString() === driverId);

  if (alreadyFav) {
    user.favoriteDrivers = user.favoriteDrivers.filter((id) => id.toString() !== driverId);
  } else {
    user.favoriteDrivers.push(driverId);
  }
  await user.save();
  res.status(200).json({ success: true, data: { favoriteDrivers: user.favoriteDrivers } });
});

// ---- Admin: user management ----

// @route GET /api/users (admin)
const getAllUsers = asyncHandler(async (req, res) => {
  const features = new ApiFeatures(User.find(), req.query)
    .filter()
    .search(['name', 'email', 'phone'])
    .sort()
    .limitFields()
    .paginate();

  const users = await features.query;
  const pagination = await features.countTotal(User);

  res.status(200).json({ success: true, data: { users, pagination } });
});

// @route GET /api/users/:id (admin)
const getUserById = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) throw new ApiError(404, 'User not found');
  res.status(200).json({ success: true, data: { user } });
});

// @route PATCH /api/users/:id/status (admin)
const updateUserStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;
  if (!['active', 'suspended', 'banned'].includes(status)) {
    throw new ApiError(400, 'Invalid status value');
  }
  const user = await User.findByIdAndUpdate(req.params.id, { status }, { new: true });
  if (!user) throw new ApiError(404, 'User not found');
  res.status(200).json({ success: true, message: `User status updated to ${status}`, data: { user } });
});

module.exports = {
  updateProfile,
  uploadAvatar,
  addSavedAddress,
  removeSavedAddress,
  addEmergencyContact,
  removeEmergencyContact,
  toggleFavoriteDriver,
  getAllUsers,
  getUserById,
  updateUserStatus,
};
