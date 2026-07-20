const express = require('express');
const {
  registerDriver,
  uploadDriverDocuments,
  addVehicle,
  uploadVehicleDocuments,
  getMyVehicles,
  toggleAvailability,
  updateLocation,
  getMyDriverProfile,
  getEarnings,
  getAllDrivers,
  verifyDriver,
  verifyVehicle,
} = require('../controllers/driverController');
const { protect, authorize } = require('../middlewares/auth');
const upload = require('../middlewares/upload');

const router = express.Router();

router.use(protect);

router.post('/register', registerDriver);
router.post(
  '/documents',
  upload.fields([{ name: 'license', maxCount: 1 }, { name: 'aadhaar', maxCount: 1 }]),
  uploadDriverDocuments
);

router.get('/me', getMyDriverProfile);
router.patch('/availability', authorize('driver'), toggleAvailability);
router.patch('/location', authorize('driver'), updateLocation);
router.get('/earnings', authorize('driver'), getEarnings);

router.post('/vehicles', authorize('driver'), addVehicle);
router.get('/vehicles/me', authorize('driver'), getMyVehicles);
router.post(
  '/vehicles/:id/documents',
  authorize('driver'),
  upload.fields([
    { name: 'rcBook', maxCount: 1 },
    { name: 'insurance', maxCount: 1 },
    { name: 'pollutionCertificate', maxCount: 1 },
    { name: 'permit', maxCount: 1 },
  ]),
  uploadVehicleDocuments
);

// Admin
router.get('/', authorize('admin'), getAllDrivers);
router.patch('/:id/verify', authorize('admin'), verifyDriver);
router.patch('/vehicles/:id/verify', authorize('admin'), verifyVehicle);

module.exports = router;
