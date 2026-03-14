const multer = require('multer');
const User = require('../models/User');
const { uploadProfileImage, deleteProfileImage, getPresignedUrl } = require('../services/storjService');

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

// Helper function to add presigned URL (Storj) or passthrough external URLs
const addPresignedUrl = async (user) => {
  const userData = user.toObject ? user.toObject() : { ...user };
  if (userData.profileImage) {
    if (typeof userData.profileImage === 'string' && userData.profileImage.startsWith('http')) {
      userData.profileImageUrl = userData.profileImage;
    } else {
      userData.profileImageUrl = await getPresignedUrl(userData.profileImage);
    }
  }
  return userData;
};

// ─── GET /api/user/profile ───────────────────────────────────────────────────
const getProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id).select(
      '-password -verificationToken -verificationTokenExpiry'
    );
    if (!user) return res.status(404).json({ success: false, message: 'User not found.' });
    
    const userData = await addPresignedUrl(user);
    res.status(200).json({ success: true, data: userData });
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

    const userData = await addPresignedUrl(user);
    res.status(200).json({ success: true, message: 'Profile updated successfully.', data: userData });
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

    // Delete old image if exists
    if (user.profileImage && !(typeof user.profileImage === 'string' && user.profileImage.startsWith('http'))) {
      await deleteProfileImage(user.profileImage);
    }

    // Upload new image - returns the key
    const imageKey = await uploadProfileImage(
      req.file.buffer,
      req.file.mimetype,
      req.user._id.toString()
    );

    user.profileImage = imageKey;
    await user.save();

    // Get presigned URL for response
  const presignedUrl = await getPresignedUrl(imageKey);

    res.status(200).json({
      success: true,
      message: 'Profile image uploaded successfully.',
      data: { 
        profileImage: imageKey,
        profileImageUrl: presignedUrl 
      },
    });
  } catch (error) {
    console.error('Upload error:', error);
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

    if (!(typeof user.profileImage === 'string' && user.profileImage.startsWith('http'))) {
      await deleteProfileImage(user.profileImage);
    }
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

    const profileImageUrl = user.profileImage
      ? (typeof user.profileImage === 'string' && user.profileImage.startsWith('http')
        ? user.profileImage
        : await getPresignedUrl(user.profileImage))
      : null;

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
      'Profile Image': profileImageUrl || 'Not uploaded',
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
