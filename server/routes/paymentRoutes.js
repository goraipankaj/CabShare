const express = require('express');
const {
  createOrder,
  verifyPayment,
  createWalletTopupOrder,
  verifyWalletTopup,
  getPaymentHistory,
  refundPayment,
} = require('../controllers/paymentController');
const { protect, authorize } = require('../middlewares/auth');

const router = express.Router();

router.use(protect);

router.post('/create-order', authorize('passenger'), createOrder);
router.post('/verify', authorize('passenger'), verifyPayment);

router.post('/wallet/topup/create-order', createWalletTopupOrder);
router.post('/wallet/topup/verify', verifyWalletTopup);

router.get('/history', getPaymentHistory);

router.post('/:id/refund', authorize('admin'), refundPayment);

module.exports = router;
