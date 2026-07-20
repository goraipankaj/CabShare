const express = require('express');
const {
  getDashboardStats,
  getRevenueAnalytics,
  getRideAnalytics,
  getBookingAnalytics,
  exportReport,
} = require('../controllers/adminController');
const { getSettings, updateSettings } = require('../controllers/settingsController');
const { protect, authorize } = require('../middlewares/auth');

const router = express.Router();

router.use(protect, authorize('admin'));

router.get('/dashboard', getDashboardStats);
router.get('/analytics/revenue', getRevenueAnalytics);
router.get('/analytics/rides', getRideAnalytics);
router.get('/analytics/bookings', getBookingAnalytics);
router.get('/analytics/export', exportReport);

router.get('/settings', getSettings);
router.patch('/settings', updateSettings);

module.exports = router;
