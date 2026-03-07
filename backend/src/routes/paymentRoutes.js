const express = require('express');
const router = express.Router();
const {
  getPlans,
  createCheckout,
  verifyPayment,
  stripeWebhook,
} = require('../controllers/paymentController');
const { protect } = require('../middleware/authMiddleware');

// @route   GET /api/payment/plans
// @desc    Get all available plans
// @access  Public
router.get('/plans', getPlans);

// @route   POST /api/payment/webhook
// @desc    Stripe webhook (raw body needed - set in server.js)
// @access  Public (Stripe only)
router.post('/webhook', express.raw({ type: 'application/json' }), stripeWebhook);

// Routes below require authentication
// @route   POST /api/payment/create-checkout
// @desc    Create Stripe checkout session
// @access  Private
router.post('/create-checkout', protect, createCheckout);

// @route   GET /api/payment/verify
// @desc    Verify payment and activate plan
// @access  Private
router.get('/verify', protect, verifyPayment);

module.exports = router;
