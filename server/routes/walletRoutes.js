const express = require('express');
const { getMyWallet, getMyTransactions, getAllWallets } = require('../controllers/walletController');
const { protect, authorize } = require('../middlewares/auth');

const router = express.Router();

router.use(protect);

router.get('/', getMyWallet);
router.get('/transactions', getMyTransactions);
router.get('/all', authorize('admin'), getAllWallets);

module.exports = router;
