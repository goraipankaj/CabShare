const express = require('express');
const { createReview, getUserReviews } = require('../controllers/reviewController');
const { protect } = require('../middlewares/auth');

const router = express.Router();

router.get('/user/:userId', getUserReviews);
router.post('/', protect, createReview);

module.exports = router;
