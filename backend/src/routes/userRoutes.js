const express = require('express');
const router = express.Router();
const {
  getProfile,
  updateProfile,
  uploadImage,
  deleteImage,
  downloadProfile,
  getPlanStatus,
  upload,
} = require('../controllers/userController');
const { protect } = require('../middleware/authMiddleware');

// All routes require authentication
router.use(protect);

// @route   GET /api/user/profile
// @desc    Get user profile
// @access  Private
router.get('/profile', getProfile);

// @route   PUT /api/user/profile
// @desc    Update user profile
// @access  Private
router.put('/profile', updateProfile);

// @route   POST /api/user/upload-image
// @desc    Upload profile image to Storj
// @access  Private
router.post('/upload-image', upload.single('profileImage'), uploadImage);

// @route   DELETE /api/user/profile-image
// @desc    Delete profile image
// @access  Private
router.delete('/profile-image', deleteImage);

// @route   GET /api/user/download-profile
// @desc    Download profile as JSON
// @access  Private
router.get('/download-profile', downloadProfile);

// @route   GET /api/user/plan-status
// @desc    Get current plan status
// @access  Private
router.get('/plan-status', getPlanStatus);

module.exports = router;
