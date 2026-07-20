const express = require('express');
const {
  createTicket,
  getMyTickets,
  addTicketMessage,
  getAllTickets,
  updateTicketStatus,
} = require('../controllers/supportController');
const { protect, authorize } = require('../middlewares/auth');

const router = express.Router();

router.use(protect);

router.post('/', createTicket);
router.get('/me', getMyTickets);
router.post('/:id/messages', addTicketMessage);

router.get('/', authorize('admin'), getAllTickets);
router.patch('/:id/status', authorize('admin'), updateTicketStatus);

module.exports = router;
