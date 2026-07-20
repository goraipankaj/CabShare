const mongoose = require('mongoose');

const vehicleSchema = new mongoose.Schema(
  {
    driver: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    type: {
      type: String,
      enum: ['hatchback', 'sedan', 'suv', 'auto', 'bike'],
      required: true,
    },
    brand: { type: String, required: true, trim: true },
    model: { type: String, required: true, trim: true },
    color: { type: String, required: true, trim: true },
    registrationNumber: { type: String, required: true, unique: true, uppercase: true, trim: true },
    seatingCapacity: { type: Number, required: true, min: 1, max: 8 },
    year: { type: Number },

    documents: {
      rcBook: { url: String, publicId: String },
      insurance: { url: String, publicId: String },
      pollutionCertificate: { url: String, publicId: String },
      permit: { url: String, publicId: String },
    },

    photos: [{ url: String, publicId: String }],

    verificationStatus: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending',
    },
    verificationNote: { type: String },
    verifiedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    verifiedAt: { type: Date },

    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Vehicle', vehicleSchema);
