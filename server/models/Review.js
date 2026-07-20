const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema(
  {
    booking: { type: mongoose.Schema.Types.ObjectId, ref: 'Booking', required: true },
    ride: { type: mongoose.Schema.Types.ObjectId, ref: 'Ride', required: true },

    reviewer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    reviewee: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    revieweeRole: { type: String, enum: ['driver', 'passenger'], required: true },

    rating: { type: Number, required: true, min: 1, max: 5 },
    vehicleRating: { type: Number, min: 1, max: 5 },
    comment: { type: String, maxlength: 1000, trim: true },
  },
  { timestamps: true }
);

reviewSchema.index({ booking: 1, reviewer: 1 }, { unique: true });

module.exports = mongoose.model('Review', reviewSchema);
