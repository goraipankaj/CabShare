const asyncHandler = require('../utils/asyncHandler');
const Notification = require('../models/Notification');
const ApiFeatures = require('../utils/ApiFeatures');

// @route GET /api/notifications
const getMyNotifications = asyncHandler(async (req, res) => {
  const features = new ApiFeatures(Notification.find({ user: req.user._id }), req.query).filter().sort().paginate();
  const notifications = await features.query;
  const pagination = await features.countTotal(Notification);
  const unreadCount = await Notification.countDocuments({ user: req.user._id, isRead: false });
  res.status(200).json({ success: true, data: { notifications, pagination, unreadCount } });
});

// @route PATCH /api/notifications/:id/read
const markAsRead = asyncHandler(async (req, res) => {
  await Notification.findOneAndUpdate({ _id: req.params.id, user: req.user._id }, { isRead: true });
  res.status(200).json({ success: true, message: 'Notification marked as read' });
});

// @route PATCH /api/notifications/read-all
const markAllAsRead = asyncHandler(async (req, res) => {
  await Notification.updateMany({ user: req.user._id, isRead: false }, { isRead: true });
  res.status(200).json({ success: true, message: 'All notifications marked as read' });
});

// @route DELETE /api/notifications/:id
const deleteNotification = asyncHandler(async (req, res) => {
  await Notification.findOneAndDelete({ _id: req.params.id, user: req.user._id });
  res.status(200).json({ success: true, message: 'Notification deleted' });
});

module.exports = { getMyNotifications, markAsRead, markAllAsRead, deleteNotification };
