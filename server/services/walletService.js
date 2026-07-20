const Wallet = require('../models/Wallet');
const Transaction = require('../models/Transaction');
const ApiError = require('../utils/ApiError');

const getOrCreateWallet = async (userId) => {
  let wallet = await Wallet.findOne({ user: userId });
  if (!wallet) {
    wallet = await Wallet.create({ user: userId, balance: 0 });
  }
  return wallet;
};

const creditWallet = async ({ userId, amount, category, reference, referenceModel, description }) => {
  if (amount <= 0) throw new ApiError(400, 'Credit amount must be greater than zero');
  const wallet = await getOrCreateWallet(userId);
  wallet.balance += amount;
  await wallet.save();

  const transaction = await Transaction.create({
    wallet: wallet._id,
    user: userId,
    type: 'credit',
    category,
    amount,
    balanceAfter: wallet.balance,
    reference,
    referenceModel,
    description,
  });

  return { wallet, transaction };
};

const debitWallet = async ({ userId, amount, category, reference, referenceModel, description }) => {
  if (amount <= 0) throw new ApiError(400, 'Debit amount must be greater than zero');
  const wallet = await getOrCreateWallet(userId);
  if (wallet.balance < amount) {
    throw new ApiError(400, 'Insufficient wallet balance');
  }
  wallet.balance -= amount;
  await wallet.save();

  const transaction = await Transaction.create({
    wallet: wallet._id,
    user: userId,
    type: 'debit',
    category,
    amount,
    balanceAfter: wallet.balance,
    reference,
    referenceModel,
    description,
  });

  return { wallet, transaction };
};

module.exports = { getOrCreateWallet, creditWallet, debitWallet };
