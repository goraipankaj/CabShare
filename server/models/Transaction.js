const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema(
  {
    wallet: { type: mongoose.Schema.Types.ObjectId, ref: 'Wallet', required: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },

    type: {
      type: String,
      enum: ['credit', 'debit'],
      required: true,
    },
    category: {
      type: String,
      enum: ['ride_fare', 'ride_earning', 'refund', 'cashback', 'referral_reward', 'promo_code', 'wallet_topup', 'withdrawal'],
      required: true,
    },
    amount: { type: Number, required: true, min: 0 },
    balanceAfter: { type: Number, required: true },

    reference: { type: mongoose.Schema.Types.ObjectId }, // booking / ride / payment id
    referenceModel: { type: String, enum: ['Booking', 'Ride', 'Payment'] },

    description: { type: String },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Transaction', transactionSchema);
