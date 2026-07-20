const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    title: { type: String, required: true },
    message: { type: String, required: true },
    type: {
      type: String,
      enum: [
        'ride_booked', 'ride_accepted', 'ride_rejected', 'ride_started', 'ride_completed',
        'driver_arrived', 'payment_success', 'wallet_credited', 'booking_cancelled',
        'document_verified', 'document_rejected', 'system', 'promo',
      ],
      default: 'system',
    },
    reference: { type: mongoose.Schema.Types.ObjectId },
    referenceModel: { type: String },
    isRead: { type: Boolean, default: false },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Notification', notificationSchema);
