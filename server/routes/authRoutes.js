const express = require('express');
const rateLimit = require('express-rate-limit');
const {
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
} = require('../controllers/authController');
const {
  registerValidator,
  loginValidator,
  forgotPasswordValidator,
  resetPasswordValidator,
  verifyOtpValidator,
} = require('../validators/authValidator');
const validate = require('../middlewares/validate');
const { protect } = require('../middlewares/auth');

const router = express.Router();

// Basic brute-force protection on sensitive auth endpoints
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many attempts, please try again later' },
});

router.post('/register', authLimiter, registerValidator, validate, register);
router.post('/login', authLimiter, loginValidator, validate, login);
router.post('/admin/login', authLimiter, loginValidator, validate, adminLogin);
router.post('/refresh', refresh);
router.post('/logout', protect, logout);

router.post('/send-otp', authLimiter, sendOtp);
router.post('/verify-otp', verifyOtpValidator, validate, verifyOtp);
router.get('/verify-email', verifyEmail);

router.post('/forgot-password', authLimiter, forgotPasswordValidator, validate, forgotPassword);
router.post('/reset-password', resetPasswordValidator, validate, resetPassword);

router.post('/google', googleLogin);

router.get('/me', protect, getMe);

module.exports = router;
