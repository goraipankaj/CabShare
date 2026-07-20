const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');
const PromoCode = require('../models/PromoCode');
const Booking = require('../models/Booking');

// @route POST /api/promo-codes/validate
const validatePromoCode = asyncHandler(async (req, res) => {
  const { code, fareAmount } = req.body;
  const promo = await PromoCode.findOne({ code: code.toUpperCase(), isActive: true });
  if (!promo) throw new ApiError(404, 'Invalid promo code');

  const now = new Date();
  if (now < promo.validFrom || now > promo.validUntil) throw new ApiError(400, 'This promo code has expired');
  if (promo.totalUsageLimit && promo.usedCount >= promo.totalUsageLimit) {
    throw new ApiError(400, 'This promo code has reached its usage limit');
  }
  if (fareAmount < promo.minFare) {
    throw new ApiError(400, `Minimum fare of ₹${promo.minFare} required to use this code`);
  }

  const userUsageCount = await Booking.countDocuments({
    passenger: req.user._id,
    'appliedPromo.code': promo.code,
  });
  if (userUsageCount >= promo.usageLimitPerUser) {
    throw new ApiError(400, 'You have already used this promo code the maximum number of times');
  }

  let discount = promo.discountType === 'flat' ? promo.discountValue : (fareAmount * promo.discountValue) / 100;
  if (promo.maxDiscount) discount = Math.min(discount, promo.maxDiscount);
  discount = Math.min(discount, fareAmount);

  res.status(200).json({
    success: true,
    data: { promo: { code: promo.code, description: promo.description }, discount, finalFare: fareAmount - discount },
  });
});

// ---- Admin ----

// @route POST /api/promo-codes (admin)
const createPromoCode = asyncHandler(async (req, res) => {
  const promo = await PromoCode.create({ ...req.body, createdBy: req.user._id });
  res.status(201).json({ success: true, message: 'Promo code created', data: { promo } });
});

// @route GET /api/promo-codes (admin)
const getAllPromoCodes = asyncHandler(async (req, res) => {
  const promos = await PromoCode.find().sort('-createdAt');
  res.status(200).json({ success: true, data: { promos } });
});

// @route PATCH /api/promo-codes/:id (admin)
const updatePromoCode = asyncHandler(async (req, res) => {
  const promo = await PromoCode.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
  if (!promo) throw new ApiError(404, 'Promo code not found');
  res.status(200).json({ success: true, message: 'Promo code updated', data: { promo } });
});

// @route DELETE /api/promo-codes/:id (admin)
const deletePromoCode = asyncHandler(async (req, res) => {
  const promo = await PromoCode.findByIdAndDelete(req.params.id);
  if (!promo) throw new ApiError(404, 'Promo code not found');
  res.status(200).json({ success: true, message: 'Promo code deleted' });
});

module.exports = { validatePromoCode, createPromoCode, getAllPromoCodes, updatePromoCode, deletePromoCode };
