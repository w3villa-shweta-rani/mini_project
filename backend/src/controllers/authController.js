const crypto = require('crypto');
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const User = require('../models/User');
const { generateToken } = require('../middleware/authMiddleware');
const { sendVerificationEmail, sendWelcomeEmail } = require('../services/emailService');
const { getPresignedUrl } = require('../services/storjService');

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

// ─── Configure Google OAuth Strategy ────────────────────────────────────────
passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: process.env.GOOGLE_CALLBACK_URL,
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        let user = await User.findOne({ email: profile.emails[0].value });

        if (user) {
          // Update social provider if needed
          if (user.socialProvider === 'local') {
            user.socialProvider = 'google';
          }

          // If profile image is missing, hydrate it from Google
          const googlePhoto = profile.photos?.[0]?.value;
          if (!user.profileImage && googlePhoto) {
            user.profileImage = googlePhoto;
          }

          if (user.isModified()) {
            await user.save();
          }
          return done(null, user);
        }

        // Create new user from Google
        const googlePhoto = profile.photos?.[0]?.value || null;
        user = await User.create({
          name: profile.displayName,
          email: profile.emails[0].value,
          socialProvider: 'google',
          isVerified: true,
          profileImage: googlePhoto,
        });

        return done(null, user);
      } catch (error) {
        return done(error, null);
      }
    }
  )
);

passport.serializeUser((user, done) => done(null, user.id));
passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (error) {
    done(error, null);
  }
});

// ─── POST /api/auth/signup ───────────────────────────────────────────────────
const signup = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'An account with this email already exists.',
      });
    }

    // Generate verification token
    const verificationToken = crypto.randomBytes(32).toString('hex');
    const verificationTokenExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    // Create user
    const user = await User.create({
      name,
      email,
      password,
      verificationToken,
      verificationTokenExpiry,
      socialProvider: 'local',
    });

    // Send verification email (errors handled inside emailService)
    await sendVerificationEmail(email, name, verificationToken);

    res.status(201).json({
      success: true,
      message: 'Account created! Please check your email to verify your account.',
      data: {
        id: user._id,
        name: user.name,
        email: user.email,
        isVerified: user.isVerified,
      },
    });
  } catch (error) {
    console.error('Signup error:', error.message);
    next(error);
  }
};

// ─── GET /api/auth/verify-email?token=xxx ───────────────────────────────────
const verifyEmail = async (req, res, next) => {
  try {
    const { token } = req.query;

    if (!token) {
      return res.status(400).json({ success: false, message: 'Verification token is required.' });
    }

    const user = await User.findOne({
      verificationToken: token,
      verificationTokenExpiry: { $gt: new Date() },
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired verification token.',
      });
    }

    // Mark as verified
    user.isVerified = true;
    user.verificationToken = null;
    user.verificationTokenExpiry = null;
    await user.save();

    // Send welcome email (errors handled inside emailService)
    await sendWelcomeEmail(user.email, user.name);

    res.status(200).json({
      success: true,
      message: 'Email verified successfully! You can now log in.',
    });
  } catch (error) {
    console.error('Email verification error:', error.message);
    next(error);
  }
};

// ─── POST /api/auth/resend-verification ─────────────────────────────────────
const resendVerification = async (req, res, next) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ success: false, message: 'No account found with this email.' });
    }

    if (user.isVerified) {
      return res.status(400).json({ success: false, message: 'Email is already verified.' });
    }

    // Generate new token
    const verificationToken = crypto.randomBytes(32).toString('hex');
    user.verificationToken = verificationToken;
    user.verificationTokenExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000);
    await user.save();

    await sendVerificationEmail(email, user.name, verificationToken);

    res.status(200).json({ success: true, message: 'Verification email resent successfully.' });
  } catch (error) {
    next(error);
  }
};

// ─── POST /api/auth/login ────────────────────────────────────────────────────
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Get user with password
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid email or password.' });
    }

    // Check if Google account
    if (user.socialProvider === 'google' && !user.password) {
      return res.status(400).json({
        success: false,
        message: 'This account uses Google sign-in. Please login with Google.',
      });
    }

    // Verify password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid email or password.' });
    }

    // Check email verification
    if (!user.isVerified) {
      return res.status(403).json({
        success: false,
        message: 'Please verify your email before logging in.',
        needsVerification: true,
      });
    }

    // Generate token
    const token = generateToken(user._id);

  // Get presigned URL (Storj) or use external URL for Google accounts
  const userData = await addPresignedUrl(user);

    res.status(200).json({
      success: true,
      message: 'Login successful!',
      token,
      data: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        planType: user.planType,
        profileImage: user.profileImage,
        profileImageUrl: userData.profileImageUrl || null,
        isVerified: user.isVerified,
      },
    });
  } catch (error) {
    console.error('Login error:', error.message);
    next(error);
  }
};

// ─── GET /api/auth/google ────────────────────────────────────────────────────
// Add a prompt to force account selection (helps with testing) and include accessType
const googleAuth = passport.authenticate('google', {
  scope: ['profile', 'email'],
  session: false,
  prompt: 'select_account',
  accessType: 'offline',
});

// ─── GET /api/auth/google/callback ──────────────────────────────────────────
const googleCallback = (req, res, next) => {
  // Provide improved logging and return a reason query param for easier debugging
  passport.authenticate('google', { session: false }, (err, user, info) => {
    if (err) {
      console.error('Google OAuth error:', err);
      const reason = encodeURIComponent(err.message || (info && info.message) || 'google_auth_failed');
      return res.redirect(`${process.env.CLIENT_URL}/login?error=google_auth_failed&reason=${reason}`);
    }

    if (!user) {
      console.error('Google OAuth failed, no user returned. Info:', info);
      const reason = encodeURIComponent((info && info.message) || 'no_user_from_google');
      return res.redirect(`${process.env.CLIENT_URL}/login?error=google_auth_failed&reason=${reason}`);
    }

    const token = generateToken(user._id);
    res.redirect(`${process.env.CLIENT_URL}/auth/callback?token=${token}`);
  })(req, res, next);
};

// ─── GET /api/auth/me ───────────────────────────────────────────────────────
const getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id).select('-password -verificationToken -verificationTokenExpiry');
    const userData = await addPresignedUrl(user);
    res.status(200).json({ success: true, data: userData });
  } catch (error) {
    next(error);
  }
};

// ─── POST /api/auth/logout ───────────────────────────────────────────────────
const logout = (req, res) => {
  res.clearCookie('token');
  res.status(200).json({ success: true, message: 'Logged out successfully.' });
};

module.exports = {
  signup,
  verifyEmail,
  resendVerification,
  login,
  googleAuth,
  googleCallback,
  getMe,
  logout,
  passport,
};
