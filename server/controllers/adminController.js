const asyncHandler = require('../utils/asyncHandler');
const User = require('../models/User');
const Driver = require('../models/Driver');
const Ride = require('../models/Ride');
const Booking = require('../models/Booking');
const Payment = require('../models/Payment');
const SupportTicket = require('../models/SupportTicket');

// @route GET /api/admin/dashboard
const getDashboardStats = asyncHandler(async (req, res) => {
  const [
    totalUsers,
    totalPassengers,
    totalDrivers,
    pendingDriverVerifications,
    totalRides,
    ongoingRides,
    completedRides,
    totalBookings,
    openTickets,
    revenueAgg,
  ] = await Promise.all([
    User.countDocuments(),
    User.countDocuments({ role: 'passenger' }),
    User.countDocuments({ role: 'driver' }),
    Driver.countDocuments({ verificationStatus: 'pending' }),
    Ride.countDocuments(),
    Ride.countDocuments({ status: 'ongoing' }),
    Ride.countDocuments({ status: 'completed' }),
    Booking.countDocuments(),
    SupportTicket.countDocuments({ status: { $in: ['open', 'in_progress'] } }),
    Payment.aggregate([{ $match: { status: 'captured' } }, { $group: { _id: null, total: { $sum: '$amount' } } }]),
  ]);

  res.status(200).json({
    success: true,
    data: {
      totalUsers,
      totalPassengers,
      totalDrivers,
      pendingDriverVerifications,
      totalRides,
      ongoingRides,
      completedRides,
      totalBookings,
      openTickets,
      totalRevenue: revenueAgg[0]?.total || 0,
    },
  });
});

// @route GET /api/admin/analytics/revenue?range=30 (days)
const getRevenueAnalytics = asyncHandler(async (req, res) => {
  const days = parseInt(req.query.range, 10) || 30;
  const since = new Date();
  since.setDate(since.getDate() - days);

  const data = await Payment.aggregate([
    { $match: { status: 'captured', createdAt: { $gte: since } } },
    {
      $group: {
        _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
        revenue: { $sum: '$amount' },
        count: { $sum: 1 },
      },
    },
    { $sort: { _id: 1 } },
  ]);

  res.status(200).json({ success: true, data: { revenue: data } });
});

// @route GET /api/admin/analytics/rides?range=30
const getRideAnalytics = asyncHandler(async (req, res) => {
  const days = parseInt(req.query.range, 10) || 30;
  const since = new Date();
  since.setDate(since.getDate() - days);

  const data = await Ride.aggregate([
    { $match: { createdAt: { $gte: since } } },
    {
      $group: {
        _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
        rides: { $sum: 1 },
      },
    },
    { $sort: { _id: 1 } },
  ]);

  const statusBreakdown = await Ride.aggregate([{ $group: { _id: '$status', count: { $sum: 1 } } }]);

  res.status(200).json({ success: true, data: { ridesByDay: data, statusBreakdown } });
});

// @route GET /api/admin/analytics/bookings?range=30
const getBookingAnalytics = asyncHandler(async (req, res) => {
  const days = parseInt(req.query.range, 10) || 30;
  const since = new Date();
  since.setDate(since.getDate() - days);

  const data = await Booking.aggregate([
    { $match: { createdAt: { $gte: since } } },
    {
      $group: {
        _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
        bookings: { $sum: 1 },
        totalFare: { $sum: '$totalFare' },
      },
    },
    { $sort: { _id: 1 } },
  ]);

  res.status(200).json({ success: true, data: { bookingsByDay: data } });
});

// @route GET /api/admin/analytics/export?type=rides|bookings|users&format=csv
const exportReport = asyncHandler(async (req, res) => {
  const { type = 'bookings' } = req.query;
  const modelMap = { rides: Ride, bookings: Booking, users: User };
  const Model = modelMap[type] || Booking;

  const records = await Model.find().limit(5000).lean();
  const rows = records.map((r) => JSON.stringify(r)).join('\n');
  const csvHeader = records.length ? Object.keys(records[0]).join(',') : '';

  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', `attachment; filename="${type}-report.csv"`);
  res.status(200).send(`${csvHeader}\n${rows}`);
});

module.exports = { getDashboardStats, getRevenueAnalytics, getRideAnalytics, getBookingAnalytics, exportReport };
