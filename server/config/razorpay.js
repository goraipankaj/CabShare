const Razorpay = require('razorpay');

// NOTE: Add your real keys to server/.env (RAZORPAY_KEY_ID / RAZORPAY_KEY_SECRET).
// Until then, order creation calls will fail with an auth error from Razorpay's API -
// that is expected and is not a bug in this code.
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID || 'rzp_test_placeholder',
  key_secret: process.env.RAZORPAY_KEY_SECRET || 'placeholder_secret',
});

module.exports = razorpay;
