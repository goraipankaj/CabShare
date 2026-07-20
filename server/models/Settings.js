const mongoose = require('mongoose');

const settingsSchema = new mongoose.Schema(
  {
    key: { type: String, default: 'platform', unique: true },
    commissionPercentage: { type: Number, default: 15 },
    minFarePerKm: { type: Number, default: 8 },
    maxSeatsPerRide: { type: Number, default: 6 },
    cancellationWindowMinutes: { type: Number, default: 10 },
    supportEmail: { type: String, default: 'support@cabshare.app' },
    supportPhone: { type: String, default: '+91-9999999999' },
    maintenanceMode: { type: Boolean, default: false },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Settings', settingsSchema);
