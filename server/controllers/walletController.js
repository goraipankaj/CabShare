const asyncHandler = require('../utils/asyncHandler');
const Wallet = require('../models/Wallet');
const Transaction = require('../models/Transaction');
const { getOrCreateWallet } = require('../services/walletService');
const ApiFeatures = require('../utils/ApiFeatures');

// @route GET /api/wallet
const getMyWallet = asyncHandler(async (req, res) => {
  const wallet = await getOrCreateWallet(req.user._id);
  res.status(200).json({ success: true, data: { wallet } });
});

// @route GET /api/wallet/transactions
const getMyTransactions = asyncHandler(async (req, res) => {
  const features = new ApiFeatures(Transaction.find({ user: req.user._id }), req.query).filter().sort().paginate();
  const transactions = await features.query;
  const pagination = await features.countTotal(Transaction);
  res.status(200).json({ success: true, data: { transactions, pagination } });
});

// @route GET /api/wallet/all (admin - platform-wide wallet overview)
const getAllWallets = asyncHandler(async (req, res) => {
  const features = new ApiFeatures(Wallet.find().populate('user', 'name email role'), req.query).sort().paginate();
  const wallets = await features.query;
  const pagination = await features.countTotal(Wallet);
  res.status(200).json({ success: true, data: { wallets, pagination } });
});

module.exports = { getMyWallet, getMyTransactions, getAllWallets };
