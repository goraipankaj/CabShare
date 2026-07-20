const { body, query } = require('express-validator');

const createRideValidator = [
  body('vehicle').notEmpty().withMessage('Vehicle is required'),
  body('source.address').notEmpty().withMessage('Source address is required'),
  body('source.lat').isFloat().withMessage('Source latitude is required'),
  body('source.lng').isFloat().withMessage('Source longitude is required'),
  body('destination.address').notEmpty().withMessage('Destination address is required'),
  body('destination.lat').isFloat().withMessage('Destination latitude is required'),
  body('destination.lng').isFloat().withMessage('Destination longitude is required'),
  body('departureDate').isISO8601().withMessage('Valid departure date is required'),
  body('departureTime').matches(/^([01]\d|2[0-3]):([0-5]\d)$/).withMessage('Departure time must be HH:mm'),
  body('totalSeats').isInt({ min: 1, max: 8 }).withMessage('Total seats must be between 1 and 8'),
  body('pricePerSeat').isFloat({ min: 0 }).withMessage('Price per seat must be a positive number'),
];

const searchRideValidator = [
  query('sourceLat').optional().isFloat(),
  query('sourceLng').optional().isFloat(),
  query('destLat').optional().isFloat(),
  query('destLng').optional().isFloat(),
  query('date').optional().isISO8601(),
];

module.exports = { createRideValidator, searchRideValidator };
