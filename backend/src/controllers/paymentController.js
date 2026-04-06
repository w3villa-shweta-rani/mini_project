const User = require('../models/User');
const {
  createCheckoutSession,
  retrieveSession,
  constructWebhookEvent,
  getPlanDuration,
  getAllPlans,
} = require('../services/stripeService');
const { sendPaymentConfirmationEmail } = require('../services/emailService');

// ─── GET /api/payment/plans ──────────────────────────────────────────────────
const getPlans = async (req, res, next) => {
  try {
    const plans = getAllPlans();
    res.status(200).json({ success: true, data: plans });
  } catch (error) {
    next(error);
  }
};

// ─── POST /api/payment/create-checkout ──────────────────────────────────────
const createCheckout = async (req, res, next) => {
  try {
    const { planType } = req.body;

    console.log('[PAYMENT][CHECKOUT][REQUEST]', {
      userId: req.user?._id?.toString?.() || null,
      email: req.user?.email || null,
      planType,
      origin: req.headers.origin || null,
    });

    if (!['Silver', 'Gold'].includes(planType)) {
      return res.status(400).json({ success: false, message: 'Invalid plan. Choose Silver or Gold.' });
    }

    const session = await createCheckoutSession(
      req.user._id,
      req.user.email,
      planType,
      req.headers.origin
    );

    res.status(200).json({
      success: true,
      data: { sessionId: session.id, url: session.url },
    });
  } catch (error) {
    console.error('Checkout error:', error.message);
    next(error);
  }
};

// ─── GET /api/payment/verify?session_id=xxx ─────────────────────────────────
const verifyPayment = async (req, res, next) => {
  try {
    const { session_id } = req.query;

    console.log('[PAYMENT][VERIFY][REQUEST]', {
      sessionId: session_id || null,
      requesterUserId: req.user?._id?.toString?.() || null,
    });

    if (!session_id) {
      return res.status(400).json({ success: false, message: 'Session ID is required.' });
    }

    const session = await retrieveSession(session_id);

    console.log('[PAYMENT][VERIFY][SESSION]', {
      sessionId: session.id,
      paymentStatus: session.payment_status,
      metadata: session.metadata,
    });

    if (session.payment_status !== 'paid') {
      return res.status(400).json({ success: false, message: 'Payment not completed.' });
    }

    const { userId, planType } = session.metadata;

    if (userId !== req.user._id.toString()) {
      console.log('[PAYMENT][VERIFY][UNAUTHORIZED]', {
        sessionUserId: userId,
        requesterUserId: req.user._id.toString(),
      });
      return res.status(403).json({ success: false, message: 'Unauthorized.' });
    }

    const durationHours = getPlanDuration(planType);
    const planStartTime = new Date();
    const planExpireTime = new Date(planStartTime.getTime() + durationHours * 60 * 60 * 1000);

    const user = await User.findByIdAndUpdate(
      userId,
      { planType, planStartTime, planExpireTime },
      { new: true }
    );

    // Email errors handled inside emailService
    await sendPaymentConfirmationEmail(user.email, user.name, planType, planExpireTime);

    console.log('[PAYMENT][VERIFY][SUCCESS]', {
      sessionId: session_id,
      userId,
      planType,
      planExpireTime,
    });

    res.status(200).json({
      success: true,
      message: `${planType} plan activated successfully!`,
      data: {
        planType: user.planType,
        planStartTime: user.planStartTime,
        planExpireTime: user.planExpireTime,
      },
    });
  } catch (error) {
    console.error('Verify payment error:', error.message);
    next(error);
  }
};

// ─── POST /api/payment/webhook ───────────────────────────────────────────────
const stripeWebhook = async (req, res, next) => {
  const sig = req.headers['stripe-signature'];

  try {
    const event = constructWebhookEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);

    if (event.type === 'checkout.session.completed') {
      const session = event.data.object;

      if (session.payment_status === 'paid') {
        const { userId, planType } = session.metadata;

        const durationHours = getPlanDuration(planType);
        const planStartTime = new Date();
        const planExpireTime = new Date(planStartTime.getTime() + durationHours * 60 * 60 * 1000);

        const user = await User.findByIdAndUpdate(
          userId,
          { planType, planStartTime, planExpireTime },
          { new: true }
        );

        if (user) {
          await sendPaymentConfirmationEmail(user.email, user.name, planType, planExpireTime);
        }
      }
    }

    res.status(200).json({ received: true });
  } catch (error) {
    console.error('Webhook error:', error.message);
    res.status(400).json({ success: false, message: `Webhook Error: ${error.message}` });
  }
};

module.exports = { getPlans, createCheckout, verifyPayment, stripeWebhook };
