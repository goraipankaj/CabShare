const express = require('express');
const {
  validatePromoCode,
  createPromoCode,
  getAllPromoCodes,
  updatePromoCode,
  deletePromoCode,
} = require('../controllers/promoCodeController');
const { protect, authorize } = require('../middlewares/auth');

const router = express.Router();

router.use(protect);

router.post('/validate', validatePromoCode);

router.post('/', authorize('admin'), createPromoCode);
router.get('/', authorize('admin'), getAllPromoCodes);
router.patch('/:id', authorize('admin'), updatePromoCode);
router.delete('/:id', authorize('admin'), deletePromoCode);

module.exports = router;
