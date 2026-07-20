const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema(
  {
    ride: { type: mongoose.Schema.Types.ObjectId, ref: 'Ride', required: true, index: true },
    passenger: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    driver: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },

    seatsBooked: { type: Number, required: true, min: 1 },
    totalFare: { type: Number, required: true },

    pickupPoint: {
      address: String,
      lat: Number,
      lng: Number,
    },
    dropPoint: {
      address: String,
      lat: Number,
      lng: Number,
    },

    status: {
      type: String,
      enum: ['pending', 'accepted', 'rejected', 'confirmed', 'ongoing', 'completed', 'cancelled'],
      default: 'pending',
      index: true,
    },

    paymentStatus: {
      type: String,
      enum: ['unpaid', 'paid', 'refunded', 'partially_refunded'],
      default: 'unpaid',
    },
    paymentMethod: { type: String, enum: ['upi', 'card', 'wallet', 'cash'], default: 'cash' },
    payment: { type: mongoose.Schema.Types.ObjectId, ref: 'Payment' },

    cancelledBy: { type: String, enum: ['passenger', 'driver', 'admin', null], default: null },
    cancellationReason: { type: String },
    cancelledAt: { type: Date },

    tripSharedWith: [
      {
        name: String,
        phone: String,
        sharedAt: { type: Date, default: Date.now },
      },
    ],

    otpForPickup: { type: String, select: false },

    rated: { type: Boolean, default: false },

    appliedPromo: {
      code: { type: String },
      discount: { type: Number, default: 0 },
    },
  },
  { timestamps: true }
);

bookingSchema.index({ ride: 1, passenger: 1 });

module.exports = mongoose.model('Booking', bookingSchema);
