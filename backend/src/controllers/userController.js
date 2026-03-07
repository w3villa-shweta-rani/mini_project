const multer = require('multer');
const User = require('../models/User');
const { uploadProfileImage, deleteProfileImage } = require('../services/storjService');

// Multer memory storage for Storj upload
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Only JPEG, PNG, and WebP images are allowed.'), false);
    }
  },
});

// ─── GET /api/user/profile ───────────────────────────────────────────────────
const getProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id).select(
      '-password -verificationToken -verificationTokenExpiry'
    );
    if (!user) return res.status(404).json({ success: false, message: 'User not found.' });
    res.status(200).json({ success: true, data: user });
  } catch (error) {
    next(error);
  }
};

// ─── PUT /api/user/profile ───────────────────────────────────────────────────
const updateProfile = async (req, res, next) => {
  try {
    const { name, address, location } = req.body;

    const updateData = {};
    if (name) updateData.name = name;
    if (address) updateData.address = address;
    if (location) {
      const parsedLocation = typeof location === 'string' ? JSON.parse(location) : location;
      if (parsedLocation.lat && parsedLocation.lng) {
        updateData.location = {
          lat: parseFloat(parsedLocation.lat),
          lng: parseFloat(parsedLocation.lng),
        };
      }
    }

    const user = await User.findByIdAndUpdate(
      req.user._id,
      { $set: updateData },
      { new: true, runValidators: true }
    ).select('-password -verificationToken');

    res.status(200).json({ success: true, message: 'Profile updated successfully.', data: user });
  } catch (error) {
    next(error);
  }
};

// ─── POST /api/user/upload-image ─────────────────────────────────────────────
const uploadImage = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No image file provided.' });
    }

    const user = await User.findById(req.user._id);

    if (user.profileImage) {
      await deleteProfileImage(user.profileImage);
    }

    const imageUrl = await uploadProfileImage(
      req.file.buffer,
      req.file.mimetype,
      req.user._id.toString()
    );

    user.profileImage = imageUrl;
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Profile image uploaded successfully.',
      data: { profileImage: imageUrl },
    });
  } catch (error) {
    next(error);
  }
};

// ─── DELETE /api/user/profile-image ─────────────────────────────────────────
const deleteImage = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);

    if (!user.profileImage) {
      return res.status(400).json({ success: false, message: 'No profile image to delete.' });
    }

    await deleteProfileImage(user.profileImage);
    user.profileImage = null;
    await user.save();

    res.status(200).json({ success: true, message: 'Profile image removed.' });
  } catch (error) {
    next(error);
  }
};

// ─── GET /api/user/download-profile ─────────────────────────────────────────
const downloadProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id).select(
      '-password -verificationToken -verificationTokenExpiry -__v'
    );

    if (!user) return res.status(404).json({ success: false, message: 'User not found.' });

    const profileData = {
      'GamerHub Profile Export': { 'Generated At': new Date().toISOString() },
      'Personal Information': {
        Name: user.name,
        Email: user.email,
        Role: user.role,
        'Account Type': user.socialProvider,
        'Email Verified': user.isVerified,
        'Member Since': user.createdAt,
      },
      'Plan Details': {
        'Current Plan': user.planType,
        'Plan Started': user.planStartTime || 'N/A',
        'Plan Expires': user.planExpireTime || 'N/A',
        'Plan Active': user.isPlanActive(),
      },
      'Location Details': {
        Address: user.address || 'Not set',
        Coordinates: user.location?.lat ? `${user.location.lat}, ${user.location.lng}` : 'Not set',
      },
      'Profile Image': user.profileImage || 'Not uploaded',
    };

    res.setHeader('Content-Type', 'application/json');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="gamerhub-profile-${user.name.replace(/\s+/g, '-')}.json"`
    );
    res.status(200).json(profileData);
  } catch (error) {
    next(error);
  }
};

// ─── GET /api/user/plan-status ───────────────────────────────────────────────
const getPlanStatus = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id).select('planType planStartTime planExpireTime');

    res.status(200).json({
      success: true,
      data: {
        planType: user.planType,
        planStartTime: user.planStartTime,
        planExpireTime: user.planExpireTime,
        isActive: user.isPlanActive(),
        timeRemaining: user.planExpireTime
          ? Math.max(0, new Date(user.planExpireTime) - new Date())
          : 0,
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getProfile,
  updateProfile,
  uploadImage,
  deleteImage,
  downloadProfile,
  getPlanStatus,
  upload,
};
