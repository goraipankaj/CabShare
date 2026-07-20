const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const addressSchema = new mongoose.Schema(
  {
    label: { type: String, trim: true },
    address: { type: String, required: true, trim: true },
    lat: { type: Number },
    lng: { type: Number },
  },
  { _id: true, timestamps: true }
);

const emergencyContactSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    phone: { type: String, required: true, trim: true },
    relation: { type: String, trim: true },
  },
  { _id: true }
);

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: [true, 'Name is required'], trim: true, maxlength: 60 },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Enter a valid email'],
    },
    phone: {
      type: String,
      required: [true, 'Phone number is required'],
      unique: true,
      trim: true,
    },
    password: { type: String, required: true, minlength: 8, select: false },
    role: { type: String, enum: ['passenger', 'driver', 'admin'], default: 'passenger' },
    avatar: {
      url: { type: String, default: '' },
      publicId: { type: String, default: '' },
    },
    gender: { type: String, enum: ['male', 'female', 'other', 'prefer_not_to_say'], default: 'prefer_not_to_say' },
    dateOfBirth: { type: Date },

    // Verification
    isEmailVerified: { type: Boolean, default: false },
    isPhoneVerified: { type: Boolean, default: false },
    emailVerificationToken: { type: String, select: false },
    emailVerificationExpires: { type: Date, select: false },
    otpCode: { type: String, select: false },
    otpExpires: { type: Date, select: false },

    // Password reset
    resetPasswordToken: { type: String, select: false },
    resetPasswordExpires: { type: Date, select: false },

    // Refresh tokens (supports multiple devices)
    refreshTokens: [
      {
        token: { type: String },
        deviceInfo: { type: String },
        createdAt: { type: Date, default: Date.now },
      },
    ],

    // Google OAuth
    googleId: { type: String, select: false },
    authProvider: { type: String, enum: ['local', 'google'], default: 'local' },

    // Status
    status: { type: String, enum: ['active', 'suspended', 'banned'], default: 'active' },
    isDriverProfileCreated: { type: Boolean, default: false },

    // Passenger-specific
    savedAddresses: [addressSchema],
    favoriteDrivers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    emergencyContacts: [emergencyContactSchema],

    // Ratings (aggregate, updated by review controller)
    ratingAverage: { type: Number, default: 0, min: 0, max: 5 },
    ratingCount: { type: Number, default: 0 },

    // Referral
    referralCode: { type: String, unique: true, sparse: true },
    referredBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },

    // Push notification token
    fcmToken: { type: String, select: false },

    lastLoginAt: { type: Date },
  },
  { timestamps: true }
);

userSchema.index({ role: 1 });

userSchema.pre('save', async function hashPassword(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

userSchema.pre('save', function generateReferralCode(next) {
  if (!this.referralCode) {
    this.referralCode = `${this.name.slice(0, 3).toUpperCase()}${Math.floor(1000 + Math.random() * 9000)}`;
  }
  next();
});

userSchema.methods.comparePassword = function comparePassword(candidate) {
  return bcrypt.compare(candidate, this.password);
};

userSchema.methods.toSafeObject = function toSafeObject() {
  const obj = this.toObject();
  delete obj.password;
  delete obj.refreshTokens;
  delete obj.resetPasswordToken;
  delete obj.resetPasswordExpires;
  delete obj.emailVerificationToken;
  delete obj.emailVerificationExpires;
  delete obj.otpCode;
  delete obj.otpExpires;
  return obj;
};

module.exports = mongoose.model('User', userSchema);
