const { body } = require('express-validator');

const createBookingValidator = [
  body('ride').notEmpty().withMessage('Ride id is required'),
  body('seatsBooked').isInt({ min: 1 }).withMessage('At least 1 seat must be booked'),
  body('pickupPoint.address').optional().isString(),
  body('paymentMethod').optional().isIn(['upi', 'card', 'wallet', 'cash']),
];

module.exports = { createBookingValidator };
