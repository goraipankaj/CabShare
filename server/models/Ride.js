const mongoose = require('mongoose');

const locationSchema = new mongoose.Schema(
  {
    address: { type: String, required: true },
    lat: { type: Number, required: true },
    lng: { type: Number, required: true },
  },
  { _id: false }
);

const rideSchema = new mongoose.Schema(
  {
    driver: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    vehicle: { type: mongoose.Schema.Types.ObjectId, ref: 'Vehicle', required: true },

    source: { type: locationSchema, required: true },
    destination: { type: locationSchema, required: true },
    route: {
      distanceKm: { type: Number },
      durationMin: { type: Number },
      polyline: { type: String }, // encoded Google polyline
    },
    stops: [locationSchema],

    departureDate: { type: Date, required: true },
    departureTime: { type: String, required: true }, // "HH:mm"

    totalSeats: { type: Number, required: true, min: 1 },
    availableSeats: { type: Number, required: true, min: 0 },
    pricePerSeat: { type: Number, required: true, min: 0 },

    genderPreference: {
      type: String,
      enum: ['any', 'male_only', 'female_only'],
      default: 'any',
    },

    instantBooking: { type: Boolean, default: true }, // if false, driver must accept each booking

    status: {
      type: String,
      enum: ['scheduled', 'ongoing', 'completed', 'cancelled'],
      default: 'scheduled',
      index: true,
    },

    startedAt: { type: Date },
    completedAt: { type: Date },
    cancelledAt: { type: Date },
    cancellationReason: { type: String },

    liveLocation: {
      type: { type: String, enum: ['Point'], default: 'Point' },
      coordinates: { type: [Number], default: [0, 0] },
    },

    isCorporatePool: { type: Boolean, default: false },
    corporateCode: { type: String },
  },
  { timestamps: true }
);

rideSchema.index({ 'source.lat': 1, 'source.lng': 1 });
rideSchema.index({ departureDate: 1 });
rideSchema.index({ liveLocation: '2dsphere' });
rideSchema.index({ source: 'text', destination: 'text' });

module.exports = mongoose.model('Ride', rideSchema);
