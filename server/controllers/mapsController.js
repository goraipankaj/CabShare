const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');
const mapsService = require('../services/mapsService');

// @route GET /api/maps/autocomplete?input=...
const autocomplete = asyncHandler(async (req, res) => {
  const { input, sessionToken } = req.query;
  if (!input) throw new ApiError(400, 'Input query is required');
  const predictions = await mapsService.autocompletePlaces(input, sessionToken);
  res.status(200).json({ success: true, data: { predictions } });
});

// @route GET /api/maps/geocode?address=...
const geocode = asyncHandler(async (req, res) => {
  const { address } = req.query;
  if (!address) throw new ApiError(400, 'Address query is required');
  const result = await mapsService.geocodeAddress(address);
  res.status(200).json({ success: true, data: result });
});

// @route GET /api/maps/distance?originLat=&originLng=&destLat=&destLng=
const distance = asyncHandler(async (req, res) => {
  const { originLat, originLng, destLat, destLng } = req.query;
  if (!originLat || !originLng || !destLat || !destLng) throw new ApiError(400, 'Origin and destination coordinates are required');
  const result = await mapsService.getDistanceAndEta(originLat, originLng, destLat, destLng);
  res.status(200).json({ success: true, data: result });
});

// @route GET /api/maps/directions?originLat=&originLng=&destLat=&destLng=
const directions = asyncHandler(async (req, res) => {
  const { originLat, originLng, destLat, destLng } = req.query;
  if (!originLat || !originLng || !destLat || !destLng) throw new ApiError(400, 'Origin and destination coordinates are required');
  const result = await mapsService.getDirections(originLat, originLng, destLat, destLng);
  res.status(200).json({ success: true, data: result });
});

module.exports = { autocomplete, geocode, distance, directions };
