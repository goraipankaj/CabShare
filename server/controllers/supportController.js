const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');
const SupportTicket = require('../models/SupportTicket');
const ApiFeatures = require('../utils/ApiFeatures');

// @route POST /api/support
const createTicket = asyncHandler(async (req, res) => {
  const { subject, category, description, relatedBooking } = req.body;
  if (!subject || !description) throw new ApiError(400, 'Subject and description are required');

  const ticket = await SupportTicket.create({
    user: req.user._id,
    subject,
    category,
    description,
    relatedBooking,
    messages: [{ sender: req.user._id, message: description }],
  });

  res.status(201).json({ success: true, message: 'Support ticket created', data: { ticket } });
});

// @route GET /api/support/me
const getMyTickets = asyncHandler(async (req, res) => {
  const tickets = await SupportTicket.find({ user: req.user._id }).sort('-createdAt');
  res.status(200).json({ success: true, data: { tickets } });
});

// @route POST /api/support/:id/messages
const addTicketMessage = asyncHandler(async (req, res) => {
  const { message } = req.body;
  const ticket = await SupportTicket.findById(req.params.id);
  if (!ticket) throw new ApiError(404, 'Ticket not found');

  const isOwner = ticket.user.toString() === req.user._id.toString();
  if (!isOwner && req.user.role !== 'admin') throw new ApiError(403, 'Not authorized');

  ticket.messages.push({ sender: req.user._id, message });
  if (req.user.role === 'admin' && ticket.status === 'open') ticket.status = 'in_progress';
  await ticket.save();

  res.status(200).json({ success: true, data: { ticket } });
});

// ---- Admin ----

// @route GET /api/support (admin)
const getAllTickets = asyncHandler(async (req, res) => {
  const features = new ApiFeatures(SupportTicket.find().populate('user', 'name email phone'), req.query)
    .filter()
    .sort()
    .paginate();
  const tickets = await features.query;
  const pagination = await features.countTotal(SupportTicket);
  res.status(200).json({ success: true, data: { tickets, pagination } });
});

// @route PATCH /api/support/:id/status (admin)
const updateTicketStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;
  if (!['open', 'in_progress', 'resolved', 'closed'].includes(status)) {
    throw new ApiError(400, 'Invalid status value');
  }
  const ticket = await SupportTicket.findByIdAndUpdate(
    req.params.id,
    {
      status,
      ...(status === 'resolved' && { resolvedBy: req.user._id, resolvedAt: new Date() }),
    },
    { new: true }
  );
  if (!ticket) throw new ApiError(404, 'Ticket not found');
  res.status(200).json({ success: true, message: `Ticket marked as ${status}`, data: { ticket } });
});

module.exports = { createTicket, getMyTickets, addTicketMessage, getAllTickets, updateTicketStatus };
