const asyncHandler = require('../utils/asyncHandler');
const Settings = require('../models/Settings');

const getOrCreateSettings = async () => {
  let settings = await Settings.findOne({ key: 'platform' });
  if (!settings) settings = await Settings.create({ key: 'platform' });
  return settings;
};

// @route GET /api/admin/settings
const getSettings = asyncHandler(async (req, res) => {
  const settings = await getOrCreateSettings();
  res.status(200).json({ success: true, data: { settings } });
});

// @route PATCH /api/admin/settings
const updateSettings = asyncHandler(async (req, res) => {
  const settings = await getOrCreateSettings();
  const editable = [
    'commissionPercentage', 'minFarePerKm', 'maxSeatsPerRide',
    'cancellationWindowMinutes', 'supportEmail', 'supportPhone', 'maintenanceMode',
  ];
  editable.forEach((field) => {
    if (req.body[field] !== undefined) settings[field] = req.body[field];
  });
  await settings.save();
  res.status(200).json({ success: true, message: 'Settings updated', data: { settings } });
});

module.exports = { getSettings, updateSettings };
