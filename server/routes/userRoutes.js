const express = require('express');
const {
  updateProfile,
  uploadAvatar,
  addSavedAddress,
  removeSavedAddress,
  addEmergencyContact,
  removeEmergencyContact,
  toggleFavoriteDriver,
  getAllUsers,
  getUserById,
  updateUserStatus,
} = require('../controllers/userController');
const { protect, authorize } = require('../middlewares/auth');
const upload = require('../middlewares/upload');

const router = express.Router();

router.use(protect);

router.patch('/me', updateProfile);
router.post('/me/avatar', upload.single('avatar'), uploadAvatar);

router.post('/me/addresses', addSavedAddress);
router.delete('/me/addresses/:addressId', removeSavedAddress);

router.post('/me/emergency-contacts', addEmergencyContact);
router.delete('/me/emergency-contacts/:contactId', removeEmergencyContact);

router.post('/me/favorite-drivers/:driverId', toggleFavoriteDriver);

// Admin only
router.get('/', authorize('admin'), getAllUsers);
router.get('/:id', authorize('admin'), getUserById);
router.patch('/:id/status', authorize('admin'), updateUserStatus);

module.exports = router;
