const crypto = require('crypto');
const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');
const razorpay = require('../config/razorpay');
const Payment = require('../models/Payment');
const Booking = require('../models/Booking');
const Ride = require('../models/Ride');
const Notification = require('../models/Notification');
const { creditWallet, debitWallet } = require('../services/walletService');
const ApiFeatures = require('../utils/ApiFeatures');

// @route POST /api/payments/create-order
// Creates a Razorpay order for a booking's fare. Requires RAZORPAY_KEY_ID/SECRET in .env.
const createOrder = asyncHandler(async (req, res) => {
  const { bookingId, method } = req.body;
  const booking = await Booking.findOne({ _id: bookingId, passenger: req.user._id });
  if (!booking) throw new ApiError(404, 'Booking not found');
  if (booking.paymentStatus === 'paid') throw new ApiError(400, 'This booking is already paid for');

  if (method === 'wallet') {
    // Wallet payments are settled instantly without touching Razorpay
    const { transaction } = await debitWallet({
      userId: req.user._id,
      amount: booking.totalFare,
      category: 'ride_fare',
      reference: booking._id,
      referenceModel: 'Booking',
      description: `Fare for booking ${booking._id}`,
    });

    const payment = await Payment.create({
      booking: booking._id,
      user: req.user._id,
      amount: booking.totalFare,
      method: 'wallet',
      status: 'captured',
      invoiceNumber: `INV-${Date.now()}`,
    });

    booking.paymentStatus = 'paid';
    booking.paymentMethod = 'wallet';
    booking.payment = payment._id;
    await booking.save();

    return res.status(200).json({
      success: true,
      message: 'Paid using wallet balance',
      data: { payment, walletTransaction: transaction, requiresRazorpay: false },
    });
  }

  const order = await razorpay.orders.create({
    amount: Math.round(booking.totalFare * 100), // paise
    currency: 'INR',
    receipt: `booking_${booking._id}`,
  });

  const payment = await Payment.create({
    booking: booking._id,
    user: req.user._id,
    amount: booking.totalFare,
    method: method || 'upi',
    razorpayOrderId: order.id,
    status: 'created',
  });

  res.status(201).json({
    success: true,
    data: {
      order,
      paymentId: payment._id,
      keyId: process.env.RAZORPAY_KEY_ID,
      requiresRazorpay: true,
    },
  });
});

// @route POST /api/payments/verify
const verifyPayment = asyncHandler(async (req, res) => {
  const { razorpayOrderId, razorpayPaymentId, razorpaySignature, paymentId } = req.body;

  const expectedSignature = crypto
    .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET || '')
    .update(`${razorpayOrderId}|${razorpayPaymentId}`)
    .digest('hex');

  if (expectedSignature !== razorpaySignature) {
    await Payment.findByIdAndUpdate(paymentId, { status: 'failed' });
    throw new ApiError(400, 'Payment signature verification failed');
  }

  const payment = await Payment.findByIdAndUpdate(
    paymentId,
    {
      razorpayPaymentId,
      razorpaySignature,
      status: 'captured',
      invoiceNumber: `INV-${Date.now()}`,
    },
    { new: true }
  );
  if (!payment) throw new ApiError(404, 'Payment record not found');

  const booking = await Booking.findByIdAndUpdate(
    payment.booking,
    { paymentStatus: 'paid', payment: payment._id },
    { new: true }
  );

  await Notification.create({
    user: payment.user,
    title: 'Payment successful',
    message: `Your payment of ₹${payment.amount} was successful`,
    type: 'payment_success',
    reference: payment._id,
    referenceModel: 'Payment',
  });

  res.status(200).json({ success: true, message: 'Payment verified successfully', data: { payment, booking } });
});

// @route POST /api/payments/wallet/topup/create-order
const createWalletTopupOrder = asyncHandler(async (req, res) => {
  const { amount } = req.body;
  if (!amount || amount < 10) throw new ApiError(400, 'Minimum top-up amount is ₹10');

  const order = await razorpay.orders.create({
    amount: Math.round(amount * 100),
    currency: 'INR',
    receipt: `topup_${req.user._id}_${Date.now()}`,
  });

  res.status(201).json({ success: true, data: { order, keyId: process.env.RAZORPAY_KEY_ID } });
});

// @route POST /api/payments/wallet/topup/verify
const verifyWalletTopup = asyncHandler(async (req, res) => {
  const { razorpayOrderId, razorpayPaymentId, razorpaySignature, amount } = req.body;

  const expectedSignature = crypto
    .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET || '')
    .update(`${razorpayOrderId}|${razorpayPaymentId}`)
    .digest('hex');

  if (expectedSignature !== razorpaySignature) {
    throw new ApiError(400, 'Payment signature verification failed');
  }

  const { wallet, transaction } = await creditWallet({
    userId: req.user._id,
    amount,
    category: 'wallet_topup',
    description: 'Wallet top-up via Razorpay',
  });

  await Notification.create({
    user: req.user._id,
    title: 'Wallet credited',
    message: `₹${amount} has been added to your wallet`,
    type: 'wallet_credited',
  });

  res.status(200).json({ success: true, message: 'Wallet topped up successfully', data: { wallet, transaction } });
});

// @route GET /api/payments/history
const getPaymentHistory = asyncHandler(async (req, res) => {
  const features = new ApiFeatures(Payment.find({ user: req.user._id }).populate('booking'), req.query).sort().paginate();
  const payments = await features.query;
  const pagination = await features.countTotal(Payment);
  res.status(200).json({ success: true, data: { payments, pagination } });
});

// @route POST /api/payments/:id/refund (admin)
const refundPayment = asyncHandler(async (req, res) => {
  const payment = await Payment.findById(req.params.id);
  if (!payment) throw new ApiError(404, 'Payment not found');
  if (payment.status !== 'captured') throw new ApiError(400, 'Only captured payments can be refunded');

  const { amount, reason } = req.body;
  const refundAmount = amount || payment.amount;

  if (payment.razorpayPaymentId) {
    await razorpay.payments.refund(payment.razorpayPaymentId, { amount: Math.round(refundAmount * 100) });
  }

  payment.status = 'refunded';
  payment.refundAmount = refundAmount;
  payment.refundReason = reason;
  await payment.save();

  await creditWallet({
    userId: payment.user,
    amount: refundAmount,
    category: 'refund',
    reference: payment._id,
    referenceModel: 'Payment',
    description: reason || 'Admin-initiated refund',
  });

  res.status(200).json({ success: true, message: 'Refund processed', data: { payment } });
});

module.exports = {
  createOrder,
  verifyPayment,
  createWalletTopupOrder,
  verifyWalletTopup,
  getPaymentHistory,
  refundPayment,
};
