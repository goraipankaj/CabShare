const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');
const User = require('../models/User');
const Wallet = require('../models/Wallet');
const sendEmail = require('../utils/sendEmail');
const { sendSms } = require('../config/twilio');
const {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
  generateRandomToken,
  hashToken,
  generateOtp,
} = require('../utils/tokens');

const REFRESH_COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax',
  maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
};

const issueTokens = async (user, req, res, rememberMe = false) => {
  const accessToken = generateAccessToken(user);
  const refreshToken = generateRefreshToken(user);

  user.refreshTokens.push({
    token: hashToken(refreshToken),
    deviceInfo: req.headers['user-agent'] || 'unknown',
  });
  // Keep only the last 5 sessions per user
  if (user.refreshTokens.length > 5) {
    user.refreshTokens = user.refreshTokens.slice(-5);
  }
  user.lastLoginAt = new Date();
  await user.save();

  const cookieOptions = rememberMe
    ? { ...REFRESH_COOKIE_OPTIONS, maxAge: 90 * 24 * 60 * 60 * 1000 }
    : REFRESH_COOKIE_OPTIONS;
  res.cookie('refreshToken', refreshToken, cookieOptions);
  return accessToken;
};

// @route POST /api/auth/register
const register = asyncHandler(async (req, res) => {
  const { name, email, phone, password, role, referredBy } = req.body;

  const existing = await User.findOne({ $or: [{ email }, { phone }] });
  if (existing) {
    throw new ApiError(409, 'An account with this email or phone number already exists');
  }

  const user = await User.create({
    name,
    email,
    phone,
    password,
    role: role === 'driver' ? 'driver' : 'passenger',
    referredBy: referredBy || undefined,
  });

  await Wallet.create({ user: user._id, balance: 0 });

  // Email verification token
  const verifyToken = generateRandomToken();
  user.emailVerificationToken = hashToken(verifyToken);
  user.emailVerificationExpires = Date.now() + 24 * 60 * 60 * 1000;
  await user.save();

  const verifyUrl = `${process.env.CLIENT_URL}/verify-email?token=${verifyToken}&email=${encodeURIComponent(email)}`;
  await sendEmail({
    to: email,
    subject: 'Verify your CabShare account',
    html: `<p>Hi ${name},</p><p>Welcome to CabShare! Please verify your email by clicking the link below:</p><p><a href="${verifyUrl}">Verify Email</a></p>`,
  });

  const accessToken = await issueTokens(user, req, res);

  res.status(201).json({
    success: true,
    message: 'Registration successful. Please verify your email and phone number.',
    data: { user: user.toSafeObject(), accessToken },
  });
});

// @route POST /api/auth/login
const login = asyncHandler(async (req, res) => {
  const { email, password, rememberMe } = req.body;

  const user = await User.findOne({ email }).select('+password');
  if (!user || !(await user.comparePassword(password))) {
    throw new ApiError(401, 'Invalid email or password');
  }
  if (user.status !== 'active') {
    throw new ApiError(403, `Account is ${user.status}. Contact support for assistance.`);
  }

  const accessToken = await issueTokens(user, req, res, rememberMe);

  res.status(200).json({
    success: true,
    message: 'Login successful',
    data: { user: user.toSafeObject(), accessToken },
  });
});

// @route POST /api/auth/admin/login
const adminLogin = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email, role: 'admin' }).select('+password');
  if (!user || !(await user.comparePassword(password))) {
    throw new ApiError(401, 'Invalid admin credentials');
  }
  const accessToken = await issueTokens(user, req, res);
  res.status(200).json({
    success: true,
    message: 'Admin login successful',
    data: { user: user.toSafeObject(), accessToken },
  });
});

// @route POST /api/auth/refresh
const refresh = asyncHandler(async (req, res) => {
  const token = req.cookies?.refreshToken;
  if (!token) throw new ApiError(401, 'No refresh token provided');

  let decoded;
  try {
    decoded = verifyRefreshToken(token);
  } catch (err) {
    throw new ApiError(401, 'Refresh token invalid or expired');
  }

  const user = await User.findById(decoded.id);
  const hashed = hashToken(token);
  const isValidSession = user?.refreshTokens.some((t) => t.token === hashed);
  if (!user || !isValidSession) {
    throw new ApiError(401, 'Session expired - please log in again');
  }

  const accessToken = generateAccessToken(user);
  res.status(200).json({ success: true, data: { accessToken, user: user.toSafeObject() } });
});

// @route POST /api/auth/logout
const logout = asyncHandler(async (req, res) => {
  const token = req.cookies?.refreshToken;
  if (token && req.user) {
    const hashed = hashToken(token);
    req.user.refreshTokens = req.user.refreshTokens.filter((t) => t.token !== hashed);
    await req.user.save();
  }
  res.clearCookie('refreshToken', REFRESH_COOKIE_OPTIONS);
  res.status(200).json({ success: true, message: 'Logged out successfully' });
});

// @route POST /api/auth/send-otp
const sendOtp = asyncHandler(async (req, res) => {
  const { phone } = req.body;
  const user = await User.findOne({ phone });
  if (!user) throw new ApiError(404, 'No account found with this phone number');

  const otp = generateOtp();
  user.otpCode = hashToken(otp);
  user.otpExpires = Date.now() + 10 * 60 * 1000;
  await user.save();

  await sendSms(phone, `Your CabShare verification code is ${otp}. It expires in 10 minutes.`);
  res.status(200).json({ success: true, message: 'OTP sent successfully' });
});

// @route POST /api/auth/verify-otp
const verifyOtp = asyncHandler(async (req, res) => {
  const { phone, otp } = req.body;
  const user = await User.findOne({ phone }).select('+otpCode +otpExpires');
  if (!user || !user.otpCode || user.otpExpires < Date.now()) {
    throw new ApiError(400, 'OTP expired or invalid - please request a new one');
  }
  if (hashToken(otp) !== user.otpCode) {
    throw new ApiError(400, 'Incorrect OTP');
  }
  user.isPhoneVerified = true;
  user.otpCode = undefined;
  user.otpExpires = undefined;
  await user.save();
  res.status(200).json({ success: true, message: 'Phone number verified successfully' });
});

// @route GET /api/auth/verify-email
const verifyEmail = asyncHandler(async (req, res) => {
  const { token, email } = req.query;
  const user = await User.findOne({ email }).select('+emailVerificationToken +emailVerificationExpires');
  if (!user || user.emailVerificationToken !== hashToken(token) || user.emailVerificationExpires < Date.now()) {
    throw new ApiError(400, 'Invalid or expired verification link');
  }
  user.isEmailVerified = true;
  user.emailVerificationToken = undefined;
  user.emailVerificationExpires = undefined;
  await user.save();
  res.status(200).json({ success: true, message: 'Email verified successfully' });
});

// @route POST /api/auth/forgot-password
const forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body;
  const user = await User.findOne({ email });
  if (!user) {
    // Do not reveal whether an account exists
    return res.status(200).json({ success: true, message: 'If that account exists, a reset link has been sent' });
  }
  const resetToken = generateRandomToken();
  user.resetPasswordToken = hashToken(resetToken);
  user.resetPasswordExpires = Date.now() + 60 * 60 * 1000;
  await user.save();

  const resetUrl = `${process.env.CLIENT_URL}/reset-password?token=${resetToken}&email=${encodeURIComponent(email)}`;
  await sendEmail({
    to: email,
    subject: 'Reset your CabShare password',
    html: `<p>You requested a password reset. Click below to set a new password (link expires in 1 hour):</p><p><a href="${resetUrl}">Reset Password</a></p>`,
  });

  res.status(200).json({ success: true, message: 'If that account exists, a reset link has been sent' });
});

// @route POST /api/auth/reset-password
const resetPassword = asyncHandler(async (req, res) => {
  const { token, email, password } = req.body;
  const user = await User.findOne({ email }).select('+resetPasswordToken +resetPasswordExpires');
  if (!user || user.resetPasswordToken !== hashToken(token) || user.resetPasswordExpires < Date.now()) {
    throw new ApiError(400, 'Invalid or expired reset link');
  }
  user.password = password;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpires = undefined;
  user.refreshTokens = []; // force re-login on all devices
  await user.save();
  res.status(200).json({ success: true, message: 'Password reset successfully - please log in' });
});

// @route POST /api/auth/google
// Expects an already-verified Google ID token payload decoded on the client
// via Google Identity Services, then passed here for account lookup/creation.
const googleLogin = asyncHandler(async (req, res) => {
  const { googleId, email, name, avatar } = req.body;
  if (!googleId || !email) throw new ApiError(400, 'Google account details are required');

  let user = await User.findOne({ $or: [{ googleId }, { email }] });
  if (!user) {
    user = await User.create({
      name,
      email,
      phone: `google_${googleId}`, // placeholder until user adds a real phone
      password: generateRandomToken(),
      googleId,
      authProvider: 'google',
      isEmailVerified: true,
      avatar: avatar ? { url: avatar } : undefined,
    });
    await Wallet.create({ user: user._id, balance: 0 });
  }

  const accessToken = await issueTokens(user, req, res);
  res.status(200).json({ success: true, data: { user: user.toSafeObject(), accessToken } });
});

// @route GET /api/auth/me
const getMe = asyncHandler(async (req, res) => {
  res.status(200).json({ success: true, data: { user: req.user.toSafeObject() } });
});

module.exports = {
  register,
  login,
  adminLogin,
  refresh,
  logout,
  sendOtp,
  verifyOtp,
  verifyEmail,
  forgotPassword,
  resetPassword,
  googleLogin,
  getMe,
};
