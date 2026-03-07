const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      minlength: [2, 'Name must be at least 2 characters'],
      maxlength: [50, 'Name cannot exceed 50 characters'],
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email'],
    },
    password: {
      type: String,
      minlength: [6, 'Password must be at least 6 characters'],
      select: false,
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    verificationToken: {
      type: String,
      default: null,
    },
    verificationTokenExpiry: {
      type: Date,
      default: null,
    },
    socialProvider: {
      type: String,
      enum: ['local', 'google'],
      default: 'local',
    },
    profileImage: {
      type: String,
      default: null,
    },
    address: {
      type: String,
      default: null,
    },
    location: {
      lat: { type: Number, default: null },
      lng: { type: Number, default: null },
    },
    planType: {
      type: String,
      enum: ['Free', 'Silver', 'Gold'],
      default: 'Free',
    },
    planStartTime: {
      type: Date,
      default: null,
    },
    planExpireTime: {
      type: Date,
      default: null,
    },
    stripeCustomerId: {
      type: String,
      default: null,
    },
    role: {
      type: String,
      enum: ['user', 'admin'],
      default: 'user',
    },
  },
  { timestamps: true }
);

// Hash password before saving
userSchema.pre('save', async function () {
  if (!this.isModified('password') || !this.password) return;
  const salt = await bcrypt.genSalt(12);
  this.password = await bcrypt.hash(this.password, salt);
});

// Compare password method
userSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Check if plan is active
userSchema.methods.isPlanActive = function () {
  if (!this.planExpireTime) return false;
  return new Date() < new Date(this.planExpireTime);
};

module.exports = mongoose.model('User', userSchema);
