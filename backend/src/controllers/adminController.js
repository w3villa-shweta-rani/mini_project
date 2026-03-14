const User = require('../models/User');
const { getPresignedUrl } = require('../services/storjService');

// Helper to add presigned URLs (Storj) or passthrough external URLs
const addPresignedUrls = async (users) => {
  return Promise.all(
    users.map(async (user) => {
      const userData = user.toObject ? user.toObject() : { ...user };
      if (userData.profileImage) {
        if (typeof userData.profileImage === 'string' && userData.profileImage.startsWith('http')) {
          userData.profileImageUrl = userData.profileImage;
        } else {
          userData.profileImageUrl = await getPresignedUrl(userData.profileImage);
        }
      }
      return userData;
    })
  );
};

// ─── GET /api/admin/users ────────────────────────────────────────────────────
const getAllUsers = async (req, res, next) => {
  try {
    const {
      page = 1,
      limit = 10,
      search = '',
      plan = '',
      role = '',
      sortBy = 'createdAt',
      sortOrder = 'desc',
    } = req.query;

    const query = {};

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
      ];
    }

    if (plan && ['Free', 'Silver', 'Gold'].includes(plan)) query.planType = plan;
    if (role && ['user', 'admin'].includes(role)) query.role = role;

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const sortDir = sortOrder === 'asc' ? 1 : -1;

    const [users, total] = await Promise.all([
      User.find(query)
        .select('-password -verificationToken -verificationTokenExpiry')
        .sort({ [sortBy]: sortDir })
        .skip(skip)
        .limit(parseInt(limit)),
      User.countDocuments(query),
    ]);

    // Add presigned URLs to all users
    const usersWithUrls = await addPresignedUrls(users);

    res.status(200).json({
      success: true,
      data: {
        users: usersWithUrls,
        pagination: {
          total,
          page: parseInt(page),
          limit: parseInt(limit),
          totalPages: Math.ceil(total / parseInt(limit)),
          hasNext: parseInt(page) < Math.ceil(total / parseInt(limit)),
          hasPrev: parseInt(page) > 1,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

// ─── GET /api/admin/users/:id ────────────────────────────────────────────────
const getUserById = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id).select(
      '-password -verificationToken -verificationTokenExpiry'
    );
    if (!user) return res.status(404).json({ success: false, message: 'User not found.' });
    res.status(200).json({ success: true, data: user });
  } catch (error) {
    next(error);
  }
};

// ─── PUT /api/admin/users/:id ────────────────────────────────────────────────
const updateUser = async (req, res, next) => {
  try {
    const { name, email, role, planType, isVerified } = req.body;
    const allowedUpdates = {};

    if (name) allowedUpdates.name = name;
    if (email) allowedUpdates.email = email;
    if (role && ['user', 'admin'].includes(role)) allowedUpdates.role = role;
    if (planType && ['Free', 'Silver', 'Gold'].includes(planType)) allowedUpdates.planType = planType;
    if (typeof isVerified === 'boolean') allowedUpdates.isVerified = isVerified;

    const user = await User.findByIdAndUpdate(
      req.params.id,
      { $set: allowedUpdates },
      { new: true, runValidators: true }
    ).select('-password -verificationToken');

    if (!user) return res.status(404).json({ success: false, message: 'User not found.' });

    res.status(200).json({ success: true, message: 'User updated successfully.', data: user });
  } catch (error) {
    next(error);
  }
};

// ─── DELETE /api/admin/users/:id ─────────────────────────────────────────────
const deleteUser = async (req, res, next) => {
  try {
    if (req.params.id === req.user._id.toString()) {
      return res.status(400).json({ success: false, message: 'Cannot delete your own account.' });
    }

    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found.' });

    res.status(200).json({ success: true, message: 'User deleted successfully.' });
  } catch (error) {
    next(error);
  }
};

// ─── GET /api/admin/stats ────────────────────────────────────────────────────
const getDashboardStats = async (req, res, next) => {
  try {
    const [totalUsers, verifiedUsers, freeUsers, silverUsers, goldUsers, adminUsers, recentUsers] =
      await Promise.all([
        User.countDocuments(),
        User.countDocuments({ isVerified: true }),
        User.countDocuments({ planType: 'Free' }),
        User.countDocuments({ planType: 'Silver' }),
        User.countDocuments({ planType: 'Gold' }),
        User.countDocuments({ role: 'admin' }),
        User.find().sort({ createdAt: -1 }).limit(5).select('name email planType createdAt profileImage'),
      ]);

    res.status(200).json({
      success: true,
      data: {
        stats: {
          totalUsers,
          verifiedUsers,
          unverifiedUsers: totalUsers - verifiedUsers,
          freeUsers,
          silverUsers,
          goldUsers,
          adminUsers,
          premiumUsers: silverUsers + goldUsers,
        },
        recentUsers,
      },
    });
  } catch (error) {
    next(error);
  }
};

// ─── PUT /api/admin/users/:id/role ───────────────────────────────────────────
const updateUserRole = async (req, res, next) => {
  try {
    const { role } = req.body;

    if (!['user', 'admin'].includes(role)) {
      return res.status(400).json({ success: false, message: 'Invalid role.' });
    }

    if (req.params.id === req.user._id.toString()) {
      return res.status(400).json({ success: false, message: 'Cannot change your own role.' });
    }

    const user = await User.findByIdAndUpdate(
      req.params.id,
      { role },
      { new: true }
    ).select('-password');

    if (!user) return res.status(404).json({ success: false, message: 'User not found.' });

    res.status(200).json({ success: true, message: `User role updated to ${role}.`, data: user });
  } catch (error) {
    next(error);
  }
};

module.exports = { getAllUsers, getUserById, updateUser, deleteUser, getDashboardStats, updateUserRole };
